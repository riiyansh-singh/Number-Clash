import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Socket } from 'socket.io-client';
import { getSocket } from '../lib/socketClient';
import { sounds } from '../lib/soundEngine';
import { UserProfile, RoomState, GameEvent, QuickChatOption, GameMode, GameDifficulty } from '../types';
import { QUICK_CHAT_OPTIONS } from '../data/cosmeticsData';
import { 
  Users, 
  Flame, 
  Copy, 
  Check, 
  Send, 
  RotateCcw, 
  LogOut, 
  Play, 
  Clock, 
  Crown, 
  ShieldAlert, 
  Sparkles, 
  MessageSquare, 
  Timer, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface MultiplayerArenaProps {
  user: UserProfile | null;
  initialJoinCode?: string;
  onUpdateUser: (user: UserProfile) => void;
  onOpenAuth: () => void;
  onShowResultModal: (resultData: any) => void;
}

export const MultiplayerArena: React.FC<MultiplayerArenaProps> = ({
  user,
  initialJoinCode,
  onUpdateUser,
  onOpenAuth,
  onShowResultModal
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState<string>(initialJoinCode || '');
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [privateFeedback, setPrivateFeedback] = useState<any>(null);
  const [activeChatBubble, setActiveChatBubble] = useState<{ sender: string; text: string } | null>(null);

  // Host setup options
  const [selectedMode, setSelectedMode] = useState<GameMode>('battle_royale');
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('medium');
  const [selectedTimer, setSelectedTimer] = useState<number>(60);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on('room:created', (data: { code: string; room: RoomState }) => {
      setIsCreating(false);
      setRoomState(data.room);
      sounds.playClick();
    });

    s.on('room:update', (room: RoomState) => {
      setRoomState(room);
    });

    s.on('game:event', (event: GameEvent) => {
      if (event.type === 'chat') {
        setActiveChatBubble({ sender: event.playerName, text: event.text });
        setTimeout(() => setActiveChatBubble(null), 3500);
      }
    });

    s.on('game:guess_feedback', (feedback: any) => {
      setPrivateFeedback(feedback);
      if (feedback.comparison === 'correct') {
        sounds.playCorrect();
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
      } else if (feedback.hotness === 'very_hot' || feedback.hotness === 'hot') {
        sounds.playHot();
      } else {
        sounds.playCold();
      }
    });

    s.on('game:quick_chat_sound', (data: { soundType: string }) => {
      sounds.playQuickChatSound(data.soundType);
    });

    s.on('error:msg', (data: { message: string }) => {
      setErrorMessage(data.message);
      sounds.playDefeat();
      setTimeout(() => setErrorMessage(null), 4000);
      setIsCreating(false);
      setIsJoining(false);
    });

    // If initial join code provided
    if (initialJoinCode && user) {
      handleJoinRoom(initialJoinCode);
    }

    return () => {
      s.off('room:created');
      s.off('room:update');
      s.off('game:event');
      s.off('game:guess_feedback');
      s.off('game:quick_chat_sound');
      s.off('error:msg');
    };
  }, []);

  const handleCreateRoom = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!socket) return;
    setIsCreating(true);
    sounds.playClick();
    socket.emit('room:create', {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      mode: selectedMode,
      difficulty: selectedDifficulty,
      timerDuration: selectedTimer
    });
  };

  const handleJoinRoom = (codeToJoin?: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const code = (codeToJoin || joinCodeInput).trim().toUpperCase();
    if (!code || !socket) return;

    setIsJoining(true);
    sounds.playClick();
    socket.emit('room:join', {
      code,
      userId: user.id,
      username: user.username,
      avatar: user.avatar
    });
  };

  const handleToggleReady = () => {
    if (!socket) return;
    sounds.playClick();
    socket.emit('room:toggle_ready');
  };

  const handleStartGame = () => {
    if (!socket) return;
    sounds.playClick();
    socket.emit('room:start');
  };

  const handleMakeGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !currentGuess) return;
    sounds.playGuess();
    socket.emit('game:guess', { guess: parseInt(currentGuess.replace(/,/g, ''), 10) });
    setCurrentGuess('');
  };

  const handleSendQuickChat = (chat: QuickChatOption) => {
    if (!socket) return;
    sounds.playClick();
    socket.emit('game:quick_chat', { text: chat.text, emoji: chat.emoji, soundType: chat.soundType });
  };

  const handleRematch = () => {
    if (!socket) return;
    sounds.playClick();
    setPrivateFeedback(null);
    socket.emit('room:rematch');
  };

  const handleLeaveRoom = () => {
    if (!socket) return;
    sounds.playClick();
    socket.emit('room:leave');
    setRoomState(null);
    setPrivateFeedback(null);
  };

  const copyRoomCode = () => {
    if (!roomState) return;
    navigator.clipboard.writeText(roomState.code);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Initial State: Create / Join Room Screen
  if (!roomState) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
        {/* Error Toast */}
        {errorMessage && (
          <div className="fixed top-20 right-4 z-50 p-4 rounded-xl bg-red-950/90 border border-red-500/50 text-red-200 text-xs font-['Rajdhani'] font-bold shadow-2xl flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-['Rajdhani'] font-bold uppercase tracking-widest mb-3">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>REAL-TIME MULTIPLAYER ARENA</span>
          </div>
          <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-extrabold text-white">
            MULTIPLAYER CLASH
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-['Rajdhani'] font-semibold max-w-lg mx-auto">
            Challenge friends or rivals in 4-player real-time number combat. Choose Battle Royale, Turn-Based, or Sudden Death!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CREATE ROOM CARD */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#160d20] border border-orange-500/30 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-orange-400" />
                <h3 className="font-['Orbitron'] text-base font-bold text-white uppercase">CREATE CUSTOM ROOM</h3>
              </div>

              {/* Mode Select */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[11px] font-['Rajdhani'] font-bold text-slate-300 uppercase mb-1">
                    Game Mode
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'battle_royale', name: 'Battle Royale' },
                      { id: 'turn_based', name: 'Turn-Based' },
                      { id: 'sudden_death', name: 'Sudden Death' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMode(m.id as any)}
                        className={`p-2 rounded-xl text-[11px] font-['Rajdhani'] font-bold transition-all ${
                          selectedMode === m.id
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                            : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Select */}
                <div>
                  <label className="block text-[11px] font-['Rajdhani'] font-bold text-slate-300 uppercase mb-1">
                    Difficulty Range
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'easy', label: '1–50' },
                      { id: 'medium', label: '1–500' },
                      { id: 'hard', label: '1–10,000' }
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDifficulty(d.id as any)}
                        className={`p-2 rounded-xl text-[11px] font-['Rajdhani'] font-bold transition-all ${
                          selectedDifficulty === d.id
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                            : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timer Select */}
                <div>
                  <label className="block text-[11px] font-['Rajdhani'] font-bold text-slate-300 uppercase mb-1">
                    Match Timer
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 30, 60, 120].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedTimer(sec)}
                        className={`p-2 rounded-xl text-[11px] font-['Rajdhani'] font-bold transition-all ${
                          selectedTimer === sec
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                            : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sec === 0 ? 'OFF' : `${sec}s`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              id="btn-create-room-submit"
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-['Orbitron'] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isCreating ? 'CREATING LOBBY...' : 'CREATE ROOM'}</span>
            </button>
          </div>

          {/* JOIN ROOM CARD */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0a121c] border border-cyan-500/30 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-['Orbitron'] text-base font-bold text-white uppercase">JOIN VIA CODE</h3>
              </div>

              <p className="text-xs text-slate-400 font-['Rajdhani'] font-medium mb-4 leading-relaxed">
                Got a 5-letter room code from your friend? Enter it below to immediately jump into their match lobby.
              </p>

              <div>
                <label className="block text-[11px] font-['Rajdhani'] font-bold text-slate-300 uppercase mb-1">
                  5-Letter Room Code
                </label>
                <input
                  id="input-join-room-code"
                  type="text"
                  maxLength={5}
                  placeholder="e.g. X7K9P"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-950 border-2 border-cyan-500/40 focus:border-cyan-400 text-white font-['Orbitron'] text-xl tracking-widest text-center uppercase placeholder-slate-700 outline-none"
                />
              </div>
            </div>

            <button
              id="btn-join-room-submit"
              onClick={() => handleJoinRoom()}
              disabled={isJoining || !joinCodeInput.trim()}
              className="w-full py-3.5 mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-['Orbitron'] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>{isJoining ? 'CONNECTING...' : 'JOIN ROOM'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isHost = roomState.hostId === user?.id;
  const myPlayer = roomState.players.find(p => p.id === user?.id);

  // 2. LOBBY STATE
  if (roomState.status === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 animate-fade-in">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-['Orbitron'] text-sm font-extrabold flex items-center gap-2">
              <span>ROOM: {roomState.code}</span>
              <button onClick={copyRoomCode} title="Copy Room Code">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400 hover:text-white" />}
              </button>
            </div>
            <div className="text-xs font-['Rajdhani'] font-bold text-slate-400 uppercase">
              {roomState.mode.replace('_', ' ')} • {roomState.difficulty.toUpperCase()} • {roomState.timerDuration ? `${roomState.timerDuration}s Timer` : 'No Timer'}
            </div>
          </div>

          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-['Rajdhani'] font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Lobby</span>
          </button>
        </div>

        {/* Players Grid (Max 4 slots) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, index) => {
            const p = roomState.players[index];
            if (p) {
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border text-center relative transition-all ${
                    p.isReady ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  {p.isHost && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-['Rajdhani'] font-bold">
                      HOST
                    </span>
                  )}
                  <div className="text-3xl mb-2">{p.avatar}</div>
                  <div className="font-['Orbitron'] text-xs font-bold text-white truncate max-w-[120px] mx-auto">{p.username}</div>
                  <div className="text-[10px] text-cyan-400 font-['Rajdhani'] font-semibold">LVL {p.level} • {p.rating} ELO</div>

                  <div className="mt-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-['Rajdhani'] font-bold uppercase ${
                      p.isReady ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.isReady ? 'READY' : 'NOT READY'}
                    </span>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={index}
                className="p-4 rounded-2xl border-2 border-dashed border-slate-800/80 flex flex-col items-center justify-center text-center min-h-[140px] text-slate-600"
              >
                <Users className="w-6 h-6 mb-1 opacity-40" />
                <span className="text-xs font-['Rajdhani'] font-semibold">Waiting for Player...</span>
              </div>
            );
          })}
        </div>

        {/* Lobby Actions */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Quick Chat Picker */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-['Rajdhani'] font-bold text-slate-400 mr-1 uppercase">Emotes:</span>
            {QUICK_CHAT_OPTIONS.slice(0, 5).map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSendQuickChat(chat)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-['Rajdhani'] flex items-center gap-1 whitespace-nowrap"
              >
                <span>{chat.emoji}</span>
                <span>{chat.text}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!isHost && (
              <button
                id="btn-lobby-toggle-ready"
                onClick={handleToggleReady}
                className={`py-2.5 px-6 rounded-xl font-['Orbitron'] font-bold text-xs uppercase tracking-wider transition-all ${
                  myPlayer?.isReady
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                }`}
              >
                {myPlayer?.isReady ? 'UNREADY' : 'READY UP'}
              </button>
            )}

            {isHost && (
              <button
                id="btn-lobby-start-game"
                onClick={handleStartGame}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-['Orbitron'] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>START MATCH</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. IN-GAME / FINISHED STATE
  const isTurnBased = roomState.mode === 'turn_based';
  const isMyTurn = isTurnBased ? roomState.currentTurnSocketId === socket?.id : true;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in relative">
      {/* Quick Chat Floating Bubble Overlay */}
      {activeChatBubble && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 py-2 px-4 rounded-2xl bg-slate-900/95 border border-cyan-400 text-cyan-300 font-['Orbitron'] font-bold text-xs shadow-2xl animate-bounce">
          <span className="text-white mr-1.5">{activeChatBubble.sender}:</span>
          <span>{activeChatBubble.text}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="text-xs font-['Orbitron'] font-extrabold text-white">
            {roomState.mode.replace('_', ' ').toUpperCase()} • RANGE: {roomState.minRange.toLocaleString()} – {roomState.maxRange.toLocaleString()}
          </div>
          {roomState.timeRemaining !== undefined && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-lg border font-['Orbitron'] font-bold text-xs ${
              roomState.timeRemaining <= 10 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span>{roomState.timeRemaining}s</span>
            </div>
          )}
        </div>

        <button
          onClick={handleLeaveRoom}
          className="text-xs text-slate-400 hover:text-white font-['Rajdhani'] font-semibold flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Room</span>
        </button>
      </div>

      {/* Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Combatants & Guess Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Player Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {roomState.players.map((p) => {
              const isTurn = roomState.currentTurnSocketId === p.socketId;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    p.eliminated
                      ? 'bg-rose-950/20 border-rose-900/40 opacity-40'
                      : isTurn
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <div className="text-2xl mb-1">{p.avatar}</div>
                  <div className="font-['Orbitron'] text-xs font-bold text-white truncate">{p.username}</div>
                  <div className="text-[10px] font-['Rajdhani'] text-slate-400">{p.attemptsCount} guesses</div>
                  {p.lastHotness && !p.eliminated && (
                    <div className="mt-1 text-[10px] font-['Rajdhani'] font-bold text-orange-400 uppercase">
                      {p.lastHotness.replace('_', ' ')} 🔥
                    </div>
                  )}
                  {p.eliminated && (
                    <div className="mt-1 text-[10px] font-['Orbitron'] font-bold text-rose-400">ELIMINATED</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Private Feedback Gauge if available */}
          {privateFeedback && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 animate-slide-up">
              <div className="flex items-center justify-between text-xs font-['Rajdhani'] font-bold mb-1">
                <span className="text-slate-400">YOUR LAST GUESS: {privateFeedback.guess.toLocaleString()}</span>
                <span className={privateFeedback.comparison === 'correct' ? 'text-emerald-400' : 'text-cyan-300'}>
                  {privateFeedback.comparison === 'high' ? '🔼 TOO HIGH' : privateFeedback.comparison === 'low' ? '🔽 TOO LOW' : '🎯 CORRECT'}
                </span>
              </div>
              <div className="text-xs font-['Rajdhani'] font-medium text-slate-300">
                {privateFeedback.message}
              </div>
              {privateFeedback.propertyHint && (
                <div className="mt-2 text-xs font-['Rajdhani'] text-indigo-300 font-semibold">
                  {privateFeedback.propertyHint}
                </div>
              )}
            </div>
          )}

          {/* Guess Input Form */}
          {roomState.status === 'in_game' && (
            <form onSubmit={handleMakeGuess} className="relative">
              <input
                ref={inputRef}
                id="input-multiplayer-guess"
                type="number"
                disabled={!isMyTurn || myPlayer?.eliminated}
                placeholder={
                  myPlayer?.eliminated
                    ? 'Spectating (Eliminated)'
                    : isTurnBased && !isMyTurn
                    ? 'Waiting for opponent turn...'
                    : `Enter guess (${roomState.minRange} – ${roomState.maxRange})`
                }
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value)}
                className="w-full py-4 pl-5 pr-28 rounded-2xl bg-slate-950 border-2 border-orange-500/40 focus:border-orange-400 text-white font-['Orbitron'] text-xl placeholder-slate-700 outline-none"
              />
              <button
                id="btn-multiplayer-submit-guess"
                type="submit"
                disabled={!isMyTurn || !currentGuess || myPlayer?.eliminated}
                className="absolute right-2.5 top-2.5 bottom-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-30 text-slate-950 font-['Orbitron'] font-extrabold text-xs uppercase tracking-wider"
              >
                FIRE
              </button>
            </form>
          )}

          {/* Quick Chat Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_CHAT_OPTIONS.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSendQuickChat(chat)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-['Rajdhani'] flex items-center gap-1 whitespace-nowrap"
              >
                <span>{chat.emoji}</span>
                <span>{chat.text}</span>
              </button>
            ))}
          </div>

          {/* Game Over Controls if finished */}
          {roomState.status === 'finished' && (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#140b20] border border-orange-500/40 text-center space-y-4">
              <div className="font-['Orbitron'] text-2xl font-black text-white">
                {roomState.winner?.id === user?.id ? '🏆 VICTORY!' : 'MATCH COMPLETED'}
              </div>
              <div className="text-sm font-['Rajdhani'] font-bold text-cyan-300">
                Secret Target Number: {roomState.secretNumber?.toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  id="btn-multiplayer-rematch"
                  onClick={handleRematch}
                  className="py-2.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-['Orbitron'] font-bold text-xs uppercase tracking-wider"
                >
                  REMATCH / LOBBY
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Event Stream Feed */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col h-full min-h-[380px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <h4 className="font-['Orbitron'] text-xs font-bold text-white uppercase">LIVE MATCH TICKER</h4>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px] pr-1">
            {roomState.recentEvents.map((evt) => (
              <div
                key={evt.id}
                className={`p-2.5 rounded-xl border text-xs font-['Rajdhani'] ${
                  evt.type === 'guess'
                    ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                    : evt.type === 'hotness'
                    ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                    : evt.type === 'elimination'
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : evt.type === 'chat'
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-bold font-['Orbitron'] text-[11px] mr-1.5 text-white">{evt.playerName}:</span>
                <span>{evt.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
