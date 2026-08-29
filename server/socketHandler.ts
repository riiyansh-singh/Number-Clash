import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from './db.js';
import { evaluateGuess, calculateScore, calculateEloDelta, DIFFICULTY_CONFIGS } from './gameLogic.js';

interface RoomPlayerInternal {
  socketId: string;
  userId: string;
  username: string;
  avatar: string;
  frame: string;
  title: string;
  rating: number;
  level: number;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  eliminated: boolean;
  attemptsCount: number;
  lastGuess?: number;
  lastHotness?: 'cold' | 'warm' | 'hot' | 'very_hot';
  bestDistance?: number;
  score: number;
}

interface RoomInternal {
  code: string;
  hostId: string;
  mode: 'battle_royale' | 'turn_based' | 'sudden_death';
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  timerDuration: number; // 0 for off, 30, 60, 120
  status: 'lobby' | 'countdown' | 'in_game' | 'finished';
  players: RoomPlayerInternal[];
  currentTurnIndex: number;
  round: number;
  minRange: number;
  maxRange: number;
  secretNumber: number;
  startedAt?: number;
  timeRemaining?: number;
  timerInterval?: NodeJS.Timeout;
  winner?: RoomPlayerInternal | null;
  recentEvents: any[];
  suddenDeathGuesses: Map<string, { guess: number; distance: number; hotness: string }>;
}

export function setupSocketHandler(io: SocketIOServer) {
  const rooms: Map<string, RoomInternal> = new Map();
  const socketToRoom: Map<string, string> = new Map();

  function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return rooms.has(code) ? generateRoomCode() : code;
  }

  function getCleanRoomState(room: RoomInternal, requesterSocketId?: string) {
    return {
      code: room.code,
      hostId: room.hostId,
      mode: room.mode,
      difficulty: room.difficulty,
      timerDuration: room.timerDuration,
      status: room.status,
      players: room.players.map(p => ({
        id: p.userId,
        socketId: p.socketId,
        username: p.username,
        avatar: p.avatar,
        frame: p.frame,
        title: p.title,
        rating: p.rating,
        level: p.level,
        isHost: p.isHost,
        isReady: p.isReady,
        isConnected: p.isConnected,
        eliminated: p.eliminated,
        attemptsCount: p.attemptsCount,
        lastGuess: room.mode === 'turn_based' || room.status === 'finished' ? p.lastGuess : undefined,
        lastHotness: p.lastHotness,
        score: p.score
      })),
      currentTurnSocketId: room.players[room.currentTurnIndex]?.socketId,
      round: room.round,
      startedAt: room.startedAt,
      timeRemaining: room.timeRemaining,
      winner: room.winner ? {
        id: room.winner.userId,
        socketId: room.winner.socketId,
        username: room.winner.username,
        avatar: room.winner.avatar,
        rating: room.winner.rating,
        score: room.winner.score
      } : null,
      secretNumber: room.status === 'finished' ? room.secretNumber : undefined, // NEVER exposed before finished!
      minRange: room.minRange,
      maxRange: room.maxRange,
      recentEvents: room.recentEvents.slice(-20)
    };
  }

  function broadcastRoomUpdate(room: RoomInternal) {
    for (const p of room.players) {
      if (p.isConnected) {
        io.to(p.socketId).emit('room:update', getCleanRoomState(room, p.socketId));
      }
    }
  }

  function broadcastEvent(room: RoomInternal, event: { type: string; playerName: string; text: string; hotness?: string; avatar?: string }) {
    const fullEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      ...event,
      timestamp: Date.now()
    };
    room.recentEvents.push(fullEvent);
    if (room.recentEvents.length > 50) room.recentEvents.shift();
    io.to(room.code).emit('game:event', fullEvent);
  }

  function startRoomGame(room: RoomInternal) {
    const diffConfig = DIFFICULTY_CONFIGS[room.difficulty] || DIFFICULTY_CONFIGS.medium;
    room.minRange = diffConfig.min;
    room.maxRange = diffConfig.max;
    // Secure random generation
    room.secretNumber = Math.floor(Math.random() * (room.maxRange - room.minRange + 1)) + room.minRange;
    room.status = 'in_game';
    room.round = 1;
    room.currentTurnIndex = 0;
    room.startedAt = Date.now();
    room.timeRemaining = room.timerDuration > 0 ? room.timerDuration : undefined;
    room.winner = null;
    room.suddenDeathGuesses.clear();

    for (const p of room.players) {
      p.attemptsCount = 0;
      p.eliminated = false;
      p.lastGuess = undefined;
      p.lastHotness = undefined;
      p.bestDistance = Infinity;
      p.score = 0;
    }

    // Start Timer Interval if enabled
    if (room.timerDuration > 0) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      room.timerInterval = setInterval(() => {
        if (room.status !== 'in_game') {
          if (room.timerInterval) clearInterval(room.timerInterval);
          return;
        }

        if (room.timeRemaining !== undefined && room.timeRemaining > 0) {
          room.timeRemaining -= 1;
          io.to(room.code).emit('game:timer_tick', { timeRemaining: room.timeRemaining });

          if (room.timeRemaining === 0) {
            handleTimeExpiration(room);
          }
        }
      }, 1000);
    }

    broadcastEvent(room, {
      type: 'system',
      playerName: 'HOST',
      text: `⚔️ Game started! Target range is ${room.minRange.toLocaleString()} – ${room.maxRange.toLocaleString()}. Mode: ${room.mode.toUpperCase()}`
    });

    broadcastRoomUpdate(room);
  }

  function handleTimeExpiration(room: RoomInternal) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    room.status = 'finished';

    // In Sudden Death or Battle Royale, closest guesser or draw
    let bestPlayer: RoomPlayerInternal | null = null;
    let closestDist = Infinity;

    for (const p of room.players) {
      if (!p.eliminated && (p.bestDistance || Infinity) < closestDist) {
        closestDist = p.bestDistance || Infinity;
        bestPlayer = p;
      }
    }

    room.winner = bestPlayer;
    finalizeGame(room, '⏰ Time expired! Closest guesser takes the crown.');
  }

  function finalizeGame(room: RoomInternal, reasonText: string) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    room.status = 'finished';

    const winner = room.winner;
    const duration = room.startedAt ? Math.floor((Date.now() - room.startedAt) / 1000) : 10;

    // Update player stats & ELO
    for (const p of room.players) {
      const isWinner = winner?.userId === p.userId;
      const user = db.getUserById(p.userId);

      if (user) {
        const ratingChange = winner 
          ? calculateEloDelta(p.rating, winner.rating, isWinner, 24) 
          : 0;

        const newRating = Math.max(100, p.rating + ratingChange);
        const { score, xp, coins } = calculateScore(isWinner, p.attemptsCount || 1, 10, room.difficulty, duration, room.timerDuration, user.stats.currentStreak);

        p.score = score;
        p.rating = newRating;

        const newWins = user.stats.wins + (isWinner ? 1 : 0);
        const newLosses = user.stats.losses + (isWinner ? 0 : 1);
        const newStreak = isWinner ? user.stats.currentStreak + 1 : 0;
        const bestStreak = Math.max(newStreak, user.stats.bestStreak);

        // Achievements check
        const achievements = new Set(user.achievements);
        if (isWinner && p.attemptsCount === 1) achievements.add('sharpshooter');
        if (newStreak >= 5) achievements.add('on_fire');
        if (newStreak >= 10) achievements.add('unstoppable');
        if (isWinner && room.difficulty === 'insane') achievements.add('impossible');
        if (isWinner && p.attemptsCount <= 3) achievements.add('mind_reader');
        if (isWinner && duration <= 10) achievements.add('speed_demon');
        if (newRating >= 1350) achievements.add('champion');

        db.updateUser(user._id, {
          rating: newRating,
          xp: user.xp + xp,
          coins: user.coins + coins,
          stats: {
            ...user.stats,
            wins: newWins,
            losses: newLosses,
            totalGames: user.stats.totalGames + 1,
            currentStreak: newStreak,
            bestStreak: bestStreak,
            bestScore: Math.max(user.stats.bestScore, score),
            favoriteMode: room.mode
          },
          achievements: Array.from(achievements),
          matchHistory: [
            {
              id: 'm_' + Date.now().toString(36),
              mode: room.mode,
              difficulty: room.difficulty,
              won: isWinner,
              attempts: p.attemptsCount,
              score,
              xpEarned: xp,
              coinsEarned: coins,
              secretNumber: room.secretNumber,
              durationSeconds: duration,
              date: new Date().toISOString()
            },
            ...user.matchHistory.slice(0, 19)
          ]
        });
      }
    }

    broadcastEvent(room, {
      type: 'system',
      playerName: 'GAME OVER',
      text: `${reasonText} Secret number was ${room.secretNumber.toLocaleString()}! ${winner ? `🏆 Winner: ${winner.username}` : 'No winner.'}`
    });

    broadcastRoomUpdate(room);
  }

  io.on('connection', (socket: Socket) => {
    // 1. CREATE ROOM
    socket.on('room:create', (payload: { userId: string; username: string; avatar?: string; mode?: string; difficulty?: string; timerDuration?: number }) => {
      const user = db.getUserById(payload.userId) || {
        _id: payload.userId,
        username: payload.username,
        avatar: payload.avatar || '🎯',
        level: 1,
        rating: 1000,
        cosmetics: { activeFrame: 'frame-default', activeTitle: 'Rookie' }
      };

      const code = generateRoomCode();
      const newRoom: RoomInternal = {
        code,
        hostId: user._id,
        mode: (payload.mode as any) || 'battle_royale',
        difficulty: (payload.difficulty as any) || 'medium',
        timerDuration: payload.timerDuration !== undefined ? payload.timerDuration : 0,
        status: 'lobby',
        players: [{
          socketId: socket.id,
          userId: user._id,
          username: user.username,
          avatar: user.avatar,
          frame: user.cosmetics?.activeFrame || 'frame-default',
          title: user.cosmetics?.activeTitle || 'Rookie',
          rating: user.rating || 1000,
          level: user.level || 1,
          isHost: true,
          isReady: true,
          isConnected: true,
          eliminated: false,
          attemptsCount: 0,
          score: 0
        }],
        currentTurnIndex: 0,
        round: 1,
        minRange: 1,
        maxRange: 500,
        secretNumber: 0,
        recentEvents: [],
        suddenDeathGuesses: new Map()
      };

      rooms.set(code, newRoom);
      socketToRoom.set(socket.id, code);
      socket.join(code);

      socket.emit('room:created', { code, room: getCleanRoomState(newRoom, socket.id) });
    });

    // 2. JOIN ROOM
    socket.on('room:join', (payload: { code: string; userId: string; username: string; avatar?: string }) => {
      const code = (payload.code || '').trim().toUpperCase();
      const room = rooms.get(code);

      if (!room) {
        socket.emit('error:msg', { message: `Room "${code}" does not exist.` });
        return;
      }

      if (room.status !== 'lobby') {
        socket.emit('error:msg', { message: 'This game has already started.' });
        return;
      }

      if (room.players.length >= 4) {
        socket.emit('error:msg', { message: 'Room is full (max 4 players).' });
        return;
      }

      const user = db.getUserById(payload.userId) || {
        _id: payload.userId,
        username: payload.username,
        avatar: payload.avatar || '🎯',
        level: 1,
        rating: 1000,
        cosmetics: { activeFrame: 'frame-default', activeTitle: 'Rookie' }
      };

      // Check if player is rejoining
      const existingPlayerIndex = room.players.findIndex(p => p.userId === user._id);
      if (existingPlayerIndex >= 0) {
        room.players[existingPlayerIndex].socketId = socket.id;
        room.players[existingPlayerIndex].isConnected = true;
      } else {
        room.players.push({
          socketId: socket.id,
          userId: user._id,
          username: user.username,
          avatar: user.avatar,
          frame: user.cosmetics?.activeFrame || 'frame-default',
          title: user.cosmetics?.activeTitle || 'Rookie',
          rating: user.rating || 1000,
          level: user.level || 1,
          isHost: false,
          isReady: false,
          isConnected: true,
          eliminated: false,
          attemptsCount: 0,
          score: 0
        });
      }

      socketToRoom.set(socket.id, code);
      socket.join(code);

      broadcastEvent(room, {
        type: 'system',
        playerName: user.username,
        avatar: user.avatar,
        text: `joined the lobby.`
      });

      broadcastRoomUpdate(room);
    });

    // 3. TOGGLE READY
    socket.on('room:toggle_ready', () => {
      const code = socketToRoom.get(socket.id);
      if (!code) return;
      const room = rooms.get(code);
      if (!room || room.status !== 'lobby') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (player) {
        player.isReady = !player.isReady;
        broadcastRoomUpdate(room);
      }
    });

    // 4. UPDATE ROOM SETTINGS (Host only)
    socket.on('room:update_settings', (payload: { mode?: string; difficulty?: string; timerDuration?: number }) => {
      const code = socketToRoom.get(socket.id);
      if (!code) return;
      const room = rooms.get(code);
      if (!room || room.status !== 'lobby') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player?.isHost) return;

      if (payload.mode) room.mode = payload.mode as any;
      if (payload.difficulty) room.difficulty = payload.difficulty as any;
      if (payload.timerDuration !== undefined) room.timerDuration = payload.timerDuration;

      broadcastRoomUpdate(room);
    });

    // 5. START GAME (Host only)
    socket.on('room:start', () => {
      const code = socketToRoom.get(socket.id);
      if (!code) return;
      const room = rooms.get(code);
      if (!room || room.status !== 'lobby') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player?.isHost) {
        socket.emit('error:msg', { message: 'Only host can start the match.' });
        return;
      }

      // Check if everyone is ready (if > 1 player)
      if (room.players.length > 1) {
        const unready = room.players.find(p => !p.isReady);
        if (unready) {
          socket.emit('error:msg', { message: `Waiting for ${unready.username} to ready up!` });
          return;
        }
      }

      startRoomGame(room);
    });

    // 6. MAKE GUESS
    socket.on('game:guess', (payload: { guess: number }) => {
      const code = socketToRoom.get(socket.id);
      if (!code) return;
      const room = rooms.get(code);
      if (!room || room.status !== 'in_game') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player || player.eliminated) return;

      const guessNum = Math.floor(Number(payload.guess));
      if (isNaN(guessNum) || guessNum < room.minRange || guessNum > room.maxRange) {
        socket.emit('error:msg', { message: `Guess must be between ${room.minRange.toLocaleString()} and ${room.maxRange.toLocaleString()}` });
        return;
      }

      // Turn-based check
      if (room.mode === 'turn_based') {
        const activePlayer = room.players[room.currentTurnIndex];
        if (activePlayer?.socketId !== socket.id) {
          socket.emit('error:msg', { message: "It's not your turn!" });
          return;
        }
      }

      player.attemptsCount = (player.attemptsCount || 0) + 1;
      player.lastGuess = guessNum;

      const evaluation = evaluateGuess(guessNum, room.secretNumber, room.minRange, room.maxRange, player.attemptsCount);
      player.lastHotness = evaluation.hotness;
      player.bestDistance = Math.min(player.bestDistance || Infinity, evaluation.distance);

      // Send private feedback to the guessing player with full clues
      socket.emit('game:guess_feedback', {
        ...evaluation,
        secretNumber: evaluation.comparison === 'correct' ? room.secretNumber : undefined
      });

      // Public broadcast event
      if (evaluation.comparison === 'correct') {
        broadcastEvent(room, {
          type: 'guess',
          playerName: player.username,
          avatar: player.avatar,
          text: `🎯 GUESSED CORRECTLY! The number was ${room.secretNumber.toLocaleString()}!`,
          hotness: 'very_hot'
        });

        room.winner = player;
        finalizeGame(room, `🎉 ${player.username} guessed the secret number!`);
        return;
      }

      // Mode specifics
      if (room.mode === 'battle_royale') {
        broadcastEvent(room, {
          type: 'hotness',
          playerName: player.username,
          avatar: player.avatar,
          text: `is ${evaluation.hotness.replace('_', ' ').toUpperCase()} 🔥`,
          hotness: evaluation.hotness
        });
      } else if (room.mode === 'turn_based') {
        broadcastEvent(room, {
          type: 'guess',
          playerName: player.username,
          avatar: player.avatar,
          text: `guessed ${guessNum.toLocaleString()} — ${evaluation.comparison.toUpperCase()} (${evaluation.hotness.toUpperCase()})`,
          hotness: evaluation.hotness
        });

        // Advance turn to next active player
        let nextIndex = (room.currentTurnIndex + 1) % room.players.length;
        let loops = 0;
        while (room.players[nextIndex].eliminated && loops < room.players.length) {
          nextIndex = (nextIndex + 1) % room.players.length;
          loops++;
        }
        room.currentTurnIndex = nextIndex;
      } else if (room.mode === 'sudden_death') {
        room.suddenDeathGuesses.set(player.userId, { guess: guessNum, distance: evaluation.distance, hotness: evaluation.hotness });
        broadcastEvent(room, {
          type: 'guess',
          playerName: player.username,
          avatar: player.avatar,
          text: `locked in a guess for Round ${room.round}!`
        });

        // Check if all non-eliminated players guessed this round
        const activePlayers = room.players.filter(p => !p.eliminated);
        if (room.suddenDeathGuesses.size >= activePlayers.length) {
          // Find player with highest distance (farthest) to eliminate
          let maxDist = -1;
          let playerToEliminate: RoomPlayerInternal | null = null;

          for (const p of activePlayers) {
            const guessData = room.suddenDeathGuesses.get(p.userId);
            if (guessData && guessData.distance > maxDist) {
              maxDist = guessData.distance;
              playerToEliminate = p;
            }
          }

          if (playerToEliminate) {
            playerToEliminate.eliminated = true;
            broadcastEvent(room, {
              type: 'elimination',
              playerName: playerToEliminate.username,
              avatar: playerToEliminate.avatar,
              text: `💀 was ELIMINATED in Sudden Death (Farthest guess)!`
            });
          }

          room.suddenDeathGuesses.clear();
          room.round += 1;

          const remaining = room.players.filter(p => !p.eliminated);
          if (remaining.length === 1) {
            room.winner = remaining[0];
            finalizeGame(room, `👑 ${remaining[0].username} is the last survivor!`);
            return;
          }
        }
      }

      broadcastRoomUpdate(room);
    });

    // 7. QUICK CHAT
    socket.on('game:quick_chat', (payload: { text: string; emoji: string; soundType?: string }) => {
      const code = socketToRoom.get(socket.id);
      if (!code) return;
      const room = rooms.get(code);
      if (!room) return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return;

      const chatEvent = {
        type: 'chat',
        playerName: player.username,
        avatar: player.avatar,
        text: `${payload.emoji} ${payload.text}`
      };

      broadcastEvent(room, chatEvent);
      io.to(room.code).emit('game:quick_chat_sound', { soundType: payload.soundType || 'hype' });
    });

    // 8. REMATCH / PLAY AGAIN
    socket.on('room:rematch', () => {
      const code = socketToRoom.get(socket.id);
      if (!code) return;
      const room = rooms.get(code);
      if (!room || room.status !== 'finished') return;

      room.status = 'lobby';
      for (const p of room.players) {
        p.isReady = p.isHost;
        p.eliminated = false;
        p.attemptsCount = 0;
        p.lastGuess = undefined;
        p.lastHotness = undefined;
        p.score = 0;
      }
      room.winner = null;
      broadcastRoomUpdate(room);
    });

    // 9. LEAVE ROOM
    socket.on('room:leave', () => {
      handlePlayerLeave(socket);
    });

    // 10. DISCONNECT
    socket.on('disconnect', () => {
      handlePlayerLeave(socket);
    });
  });

  function handlePlayerLeave(socket: Socket) {
    const code = socketToRoom.get(socket.id);
    if (!code) return;
    socketToRoom.delete(socket.id);

    const room = rooms.get(code);
    if (!room) return;

    const leavingPlayerIndex = room.players.findIndex(p => p.socketId === socket.id);
    if (leavingPlayerIndex === -1) return;

    const leavingPlayer = room.players[leavingPlayerIndex];
    room.players.splice(leavingPlayerIndex, 1);

    if (room.players.length === 0) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      rooms.delete(code);
      return;
    }

    // Host migration
    if (leavingPlayer.isHost) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].userId;
    }

    broadcastEvent(room, {
      type: 'system',
      playerName: leavingPlayer.username,
      text: 'left the match.'
    });

    if (room.status === 'in_game') {
      const active = room.players.filter(p => !p.eliminated);
      if (active.length === 1) {
        room.winner = active[0];
        finalizeGame(room, 'All other opponents disconnected.');
      }
    }

    broadcastRoomUpdate(room);
  }
}
