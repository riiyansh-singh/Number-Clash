import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import { db, JWT_SECRET } from './server/db.js';
import { setupSocketHandler } from './server/socketHandler.js';
import { evaluateGuess, calculateScore, generateAIMove, DIFFICULTY_CONFIGS } from './server/gameLogic.js';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Attach Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  setupSocketHandler(io);

  // AUTH MIDDLEWARE
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: missing token' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      (req as any).user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
  };

  // REST API ROUTES
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Auth Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      if (username.length < 3 || username.length > 15) {
        return res.status(400).json({ error: 'Username must be 3-15 characters' });
      }
      const user = await db.registerUser(username, email || '', password);
      const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, user, token });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  // 2. Auth Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      const { user, token } = await db.loginUser(username, password);
      res.json({ success: true, user, token });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Login failed' });
    }
  });

  // 3. Guest Login / Quick Init
  app.post('/api/auth/guest', async (req, res) => {
    try {
      const { preferredUsername } = req.body;
      const guestName = preferredUsername?.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
      const randomPass = Math.random().toString(36).substring(2, 12);
      const user = await db.registerUser(guestName, '', randomPass);
      const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, user, token, isGuest: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Guest generation failed' });
    }
  });

  // 4. Get Current User Profile
  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const userId = (req as any).user.userId;
    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });

  // 5. Update Profile / Active Cosmetics
  app.post('/api/profile/update-cosmetics', authMiddleware, (req, res) => {
    const userId = (req as any).user.userId;
    const { activeAvatar, activeFrame, activeTitle, activeTheme } = req.body;
    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newCosmetics = { ...user.cosmetics };
    if (activeAvatar && newCosmetics.unlockedAvatars.includes(activeAvatar)) {
      newCosmetics.activeAvatar = activeAvatar;
    }
    if (activeFrame && newCosmetics.unlockedFrames.includes(activeFrame)) {
      newCosmetics.activeFrame = activeFrame;
    }
    if (activeTitle && newCosmetics.unlockedTitles.includes(activeTitle)) {
      newCosmetics.activeTitle = activeTitle;
    }
    if (activeTheme && newCosmetics.unlockedThemes.includes(activeTheme)) {
      newCosmetics.activeTheme = activeTheme;
    }

    const updated = db.updateUser(userId, {
      avatar: newCosmetics.activeAvatar,
      cosmetics: newCosmetics
    });

    res.json({ success: true, user: updated });
  });

  // 6. Cosmetics Catalog & Purchase
  const COSMETICS_STORE = [
    // Avatars
    { id: 'avatar_cyborg', name: 'Cyber Samurai', type: 'avatar', price: 300, previewValue: '🤖', description: 'Advanced neural combat unit', rarity: 'rare' },
    { id: 'avatar_wizard', name: 'Cosmic Seer', type: 'avatar', price: 500, previewValue: '🔮', description: 'Predicts the flow of numbers', rarity: 'epic' },
    { id: 'avatar_ninja', name: 'Shadow Shinobi', type: 'avatar', price: 350, previewValue: '🥷', description: 'Stealthy precision strikes', rarity: 'rare' },
    { id: 'avatar_fire', name: 'Inferno Demon', type: 'avatar', price: 600, previewValue: '🔥', description: 'Blazing streak master', rarity: 'epic' },
    { id: 'avatar_king', name: 'Apex Sovereign', type: 'avatar', price: 1000, previewValue: '👑', description: 'Ruler of the number arena', rarity: 'legendary' },
    { id: 'avatar_alien', name: 'Quantum Entity', type: 'avatar', price: 750, previewValue: '👾', description: 'Trans-dimensional intelligence', rarity: 'epic' },
    // Frames
    { id: 'frame-neon-cyan', name: 'Cyber Neon', type: 'frame', price: 400, previewValue: 'ring-cyan-400 shadow-cyan-500/50', description: 'Vibrant cyan electromagnetic aura', rarity: 'rare' },
    { id: 'frame-gold-pulse', name: 'Aureate Glory', type: 'frame', price: 800, previewValue: 'ring-amber-400 shadow-amber-500/50', description: 'Pulsing championship gold crown frame', rarity: 'epic' },
    { id: 'frame-matrix-glow', name: 'Matrix Hacker', type: 'frame', price: 450, previewValue: 'ring-emerald-400 shadow-emerald-500/50', description: 'Cascading digital code green glow', rarity: 'rare' },
    { id: 'frame-diamond-aura', name: 'Prismatic Diamond', type: 'frame', price: 1200, previewValue: 'ring-purple-400 shadow-purple-500/60', description: 'Legendary radiant diamond shimmer', rarity: 'legendary' },
    // Titles
    { id: 'title_number_ninja', name: 'Number Ninja', type: 'title', price: 200, previewValue: 'Number Ninja', description: 'Strikes numbers from the shadows', rarity: 'common' },
    { id: 'title_guess_master', name: 'Guess Master', type: 'title', price: 400, previewValue: 'Guess Master', description: 'Veteran of 100+ calculations', rarity: 'rare' },
    { id: 'title_mind_reader', name: 'Mind Reader', type: 'title', price: 600, previewValue: 'Mind Reader', description: 'Sees the answer before it exists', rarity: 'epic' },
    { id: 'title_the_calculator', name: 'The Calculator', type: 'title', price: 900, previewValue: 'The Calculator', description: 'Zero algorithmic flaw', rarity: 'legendary' },
    { id: 'title_unstoppable', name: 'Unstoppable', type: 'title', price: 750, previewValue: 'Unstoppable', description: 'Dominating every match', rarity: 'epic' },
    // Themes
    { id: 'theme_cyber', name: 'Cyberpunk Grid', type: 'theme', price: 500, previewValue: 'cyber', description: 'Dark emerald terminal aesthetics', rarity: 'rare' },
    { id: 'theme_midnight', name: 'Midnight Purple', type: 'theme', price: 600, previewValue: 'midnight', description: 'Deep cosmic violet ambient glow', rarity: 'epic' },
    { id: 'theme_matrix', name: 'Matrix Velocity', type: 'theme', price: 700, previewValue: 'matrix', description: 'Pure green phosphor high-tech interface', rarity: 'epic' },
    { id: 'theme_minimal', name: 'Titanium Stealth', type: 'theme', price: 400, previewValue: 'minimal', description: 'High contrast monochrome slate minimal', rarity: 'rare' }
  ];

  app.get('/api/cosmetics/catalog', (req, res) => {
    res.json({ catalog: COSMETICS_STORE });
  });

  app.post('/api/cosmetics/buy', authMiddleware, (req, res) => {
    const userId = (req as any).user.userId;
    const { itemId } = req.body;
    const item = COSMETICS_STORE.find(c => c.id === itemId);
    if (!item) return res.status(404).json({ error: 'Item not found in store' });

    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.coins < item.price) {
      return res.status(400).json({ error: `Not enough coins! You need ${item.price} coins.` });
    }

    const cosmetics = { ...user.cosmetics };
    if (item.type === 'avatar' && !cosmetics.unlockedAvatars.includes(item.previewValue)) {
      cosmetics.unlockedAvatars.push(item.previewValue);
    } else if (item.type === 'frame' && !cosmetics.unlockedFrames.includes(item.id)) {
      cosmetics.unlockedFrames.push(item.id);
    } else if (item.type === 'title' && !cosmetics.unlockedTitles.includes(item.previewValue)) {
      cosmetics.unlockedTitles.push(item.previewValue);
    } else if (item.type === 'theme' && !cosmetics.unlockedThemes.includes(item.previewValue)) {
      cosmetics.unlockedThemes.push(item.previewValue);
    }

    const updated = db.updateUser(userId, {
      coins: user.coins - item.price,
      cosmetics
    });

    res.json({ success: true, user: updated, message: `Unlocked ${item.name}!` });
  });

  // 7. Leaderboards
  app.get('/api/leaderboard', (req, res) => {
    const { type, sort } = req.query;
    const leaderboard = db.getLeaderboard(type as string, sort as string);
    res.json({ leaderboard });
  });

  // 8. Daily Challenge Info
  app.get('/api/daily-challenge', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const leaderboard = db.getDailyLeaderboard(today);
    res.json({
      date: today,
      title: "Today's Quantum Target Challenge",
      min: 1,
      max: 10000,
      maxAttempts: 7,
      rewardCoins: 250,
      rewardXp: 500,
      leaderboard
    });
  });

  // 9. Match Record (Solo, AI, Daily, Reverse)
  app.post('/api/match/record', authMiddleware, (req, res) => {
    const userId = (req as any).user.userId;
    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      mode,
      difficulty,
      won,
      attempts,
      maxAttempts,
      durationSeconds,
      secretNumber,
      aiDifficulty
    } = req.body;

    const diff = difficulty || 'medium';
    const { score, xp, coins } = calculateScore(won, attempts, maxAttempts || 8, diff, durationSeconds, 0, user.stats.currentStreak);

    const newWins = user.stats.wins + (won ? 1 : 0);
    const newLosses = user.stats.losses + (won ? 0 : 1);
    const newStreak = won ? user.stats.currentStreak + 1 : 0;
    const bestStreak = Math.max(newStreak, user.stats.bestStreak);

    // Achievements check
    const achievements = new Set(user.achievements);
    if (won && attempts === 1) achievements.add('sharpshooter');
    if (newStreak >= 5) achievements.add('on_fire');
    if (newStreak >= 10) achievements.add('unstoppable');
    if (won && diff === 'insane') achievements.add('impossible');
    if (won && attempts <= 3) achievements.add('mind_reader');
    if (won && durationSeconds <= 10) achievements.add('speed_demon');
    if (mode === 'reverse' && won) achievements.add('reverse_wizard');

    const updated = db.updateUser(userId, {
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
        favoriteMode: mode || 'classic'
      },
      achievements: Array.from(achievements),
      matchHistory: [
        {
          id: 'm_' + Date.now().toString(36),
          mode: mode || 'classic',
          difficulty: diff,
          won,
          attempts,
          score,
          xpEarned: xp,
          coinsEarned: coins,
          secretNumber: secretNumber || 0,
          durationSeconds: durationSeconds || 15,
          date: new Date().toISOString()
        },
        ...user.matchHistory.slice(0, 19)
      ]
    });

    if (mode === 'daily' && won) {
      const today = new Date().toISOString().split('T')[0];
      db.recordDailyScore(today, {
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
        score,
        attempts,
        duration: durationSeconds
      });
    }

    res.json({
      success: true,
      user: updated,
      matchResult: { score, xpEarned: xp, coinsEarned: coins, won, newStreak }
    });
  });

  // AI Move Generation API
  app.post('/api/ai/guess', (req, res) => {
    const { difficulty, minRange, maxRange, secretNumber } = req.body;
    const move = generateAIMove(difficulty || 'medium', minRange || 1, maxRange || 500, secretNumber);
    res.json(move);
  });

  // VITE MIDDLEWARE SETUP
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NUMBER CLASH server running on http://localhost:${PORT}`);
  });
}

startServer();
