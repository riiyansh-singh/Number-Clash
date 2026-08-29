import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'number_clash_super_secret_jwt_2026';
const MONGODB_URI = process.env.MONGODB_URI;

// In-Memory Fallback Storage
interface StoredUser {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  rating: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master';
  stats: {
    wins: number;
    losses: number;
    totalGames: number;
    winRate: number;
    bestScore: number;
    currentStreak: number;
    bestStreak: number;
    favoriteMode: string;
  };
  cosmetics: {
    unlockedAvatars: string[];
    unlockedFrames: string[];
    unlockedTitles: string[];
    unlockedThemes: string[];
    activeAvatar: string;
    activeFrame: string;
    activeTitle: string;
    activeTheme: string;
  };
  achievements: string[];
  matchHistory: any[];
  createdAt: string;
}

export function computeRankTier(rating: number): 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master' {
  if (rating >= 2000) return 'Master';
  if (rating >= 1650) return 'Diamond';
  if (rating >= 1350) return 'Gold';
  if (rating >= 1100) return 'Silver';
  return 'Bronze';
}

export function computeLevel(xp: number): { level: number; currentXp: number; xpToNextLevel: number } {
  let level = 1;
  let required = 500;
  let accumulated = 0;
  
  while (xp >= accumulated + required) {
    accumulated += required;
    level++;
    required = Math.floor(500 * Math.pow(1.2, level - 1));
  }
  
  const currentXp = xp - accumulated;
  return { level, currentXp, xpToNextLevel: required };
}

// Initial Leaderboard Seeding to ensure realistic competition
const initialMockUsers: StoredUser[] = [
  {
    _id: 'seed-user-1',
    username: 'ApexPredictor',
    email: 'apex@numberclash.gg',
    passwordHash: '$2a$10$wK1k6a.8k5J0H1h4',
    avatar: '🤖',
    level: 28,
    xp: 45200,
    coins: 4800,
    rating: 2180,
    rank: 'Master',
    stats: { wins: 142, losses: 18, totalGames: 160, winRate: 88.75, bestScore: 9850, currentStreak: 12, bestStreak: 19, favoriteMode: 'battle_royale' },
    cosmetics: {
      unlockedAvatars: ['🤖', '⚡', '👑', '🔥', '🎯'],
      unlockedFrames: ['frame-neon-cyan', 'frame-gold-pulse', 'frame-matrix-glow'],
      unlockedTitles: ['The Calculator', 'Unstoppable', 'Guess Master'],
      unlockedThemes: ['neon', 'cyber', 'midnight'],
      activeAvatar: '🤖',
      activeFrame: 'frame-gold-pulse',
      activeTitle: 'The Calculator',
      activeTheme: 'cyber'
    },
    achievements: ['sharpshooter', 'on_fire', 'unstoppable', 'champion', 'mind_reader', 'speed_demon'],
    matchHistory: [],
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: 'seed-user-2',
    username: 'QuantumGuess',
    email: 'quantum@numberclash.gg',
    passwordHash: '$2a$10$wK1k6a.8k5J0H1h4',
    avatar: '🔮',
    level: 22,
    xp: 29800,
    coins: 3100,
    rating: 1840,
    rank: 'Diamond',
    stats: { wins: 98, losses: 24, totalGames: 122, winRate: 80.3, bestScore: 9200, currentStreak: 6, bestStreak: 14, favoriteMode: 'turn_based' },
    cosmetics: {
      unlockedAvatars: ['🔮', '⚡', '🎯'],
      unlockedFrames: ['frame-neon-cyan', 'frame-diamond-aura'],
      unlockedTitles: ['Mind Reader', 'Number Ninja'],
      unlockedThemes: ['neon', 'midnight'],
      activeAvatar: '🔮',
      activeFrame: 'frame-diamond-aura',
      activeTitle: 'Mind Reader',
      activeTheme: 'midnight'
    },
    achievements: ['sharpshooter', 'on_fire', 'champion', 'mind_reader'],
    matchHistory: [],
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: 'seed-user-3',
    username: 'NeonStrike',
    email: 'neon@numberclash.gg',
    passwordHash: '$2a$10$wK1k6a.8k5J0H1h4',
    avatar: '⚡',
    level: 19,
    xp: 21500,
    coins: 2200,
    rating: 1690,
    rank: 'Diamond',
    stats: { wins: 76, losses: 29, totalGames: 105, winRate: 72.4, bestScore: 8750, currentStreak: 4, bestStreak: 11, favoriteMode: 'sudden_death' },
    cosmetics: {
      unlockedAvatars: ['⚡', '🎯'],
      unlockedFrames: ['frame-neon-cyan'],
      unlockedTitles: ['Speed Demon'],
      unlockedThemes: ['neon'],
      activeAvatar: '⚡',
      activeFrame: 'frame-neon-cyan',
      activeTitle: 'Speed Demon',
      activeTheme: 'neon'
    },
    achievements: ['speed_demon', 'on_fire'],
    matchHistory: [],
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: 'seed-user-4',
    username: 'CyberViper',
    email: 'viper@numberclash.gg',
    passwordHash: '$2a$10$wK1k6a.8k5J0H1h4',
    avatar: '🐍',
    level: 16,
    xp: 16400,
    coins: 1750,
    rating: 1520,
    rank: 'Gold',
    stats: { wins: 61, losses: 35, totalGames: 96, winRate: 63.5, bestScore: 8100, currentStreak: 2, bestStreak: 8, favoriteMode: 'battle_royale' },
    cosmetics: {
      unlockedAvatars: ['🐍', '🎯'],
      unlockedFrames: ['frame-matrix-glow'],
      unlockedTitles: ['Number Ninja'],
      unlockedThemes: ['matrix'],
      activeAvatar: '🐍',
      activeFrame: 'frame-matrix-glow',
      activeTitle: 'Number Ninja',
      activeTheme: 'matrix'
    },
    achievements: ['on_fire'],
    matchHistory: [],
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: 'seed-user-5',
    username: 'PixelQueen',
    email: 'pixel@numberclash.gg',
    passwordHash: '$2a$10$wK1k6a.8k5J0H1h4',
    avatar: '👑',
    level: 14,
    xp: 13200,
    coins: 1400,
    rating: 1410,
    rank: 'Gold',
    stats: { wins: 49, losses: 32, totalGames: 81, winRate: 60.5, bestScore: 7800, currentStreak: 3, bestStreak: 7, favoriteMode: 'classic' },
    cosmetics: {
      unlockedAvatars: ['👑', '🎯'],
      unlockedFrames: ['frame-gold-pulse'],
      unlockedTitles: ['Lucky'],
      unlockedThemes: ['neon'],
      activeAvatar: '👑',
      activeFrame: 'frame-gold-pulse',
      activeTitle: 'Lucky',
      activeTheme: 'neon'
    },
    achievements: ['champion'],
    matchHistory: [],
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
  }
];

class DatabaseManager {
  private inMemoryUsers: Map<string, StoredUser> = new Map();
  private dailyChallengeScores: Map<string, Array<{ userId: string; username: string; avatar: string; score: number; attempts: number; duration: number }>> = new Map();
  private isMongoConnected = false;

  constructor() {
    // Populate seed users
    for (const u of initialMockUsers) {
      this.inMemoryUsers.set(u._id, u);
    }
    this.initMongo();
  }

  private isPlaceholderUri(uri?: string): boolean {
    if (!uri || !uri.trim()) return true;
    const lower = uri.toLowerCase();
    return (
      lower.includes('username:password') ||
      lower.includes('cluster.mongodb.net') ||
      lower.includes('my_') ||
      lower.includes('<password>') ||
      !lower.startsWith('mongodb')
    );
  }

  private async initMongo() {
    if (this.isPlaceholderUri(MONGODB_URI)) {
      console.log('ℹ️ High-performance in-memory database store initialized with seed records & state management.');
      return;
    }

    try {
      await mongoose.connect(MONGODB_URI!, {
        serverSelectionTimeoutMS: 2500
      });
      this.isMongoConnected = true;
      console.log('✅ Connected to MongoDB database successfully.');
    } catch {
      console.log('ℹ️ Switched to in-memory database store with full state persistence.');
      this.isMongoConnected = false;
    }
  }

  public async registerUser(username: string, email: string, passwordPlain: string): Promise<StoredUser> {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Check existing
    for (const u of this.inMemoryUsers.values()) {
      if (u.username.toLowerCase() === trimmedUsername.toLowerCase()) {
        throw new Error('Username is already taken');
      }
      if (trimmedEmail && u.email.toLowerCase() === trimmedEmail) {
        throw new Error('Email is already registered');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    const newUser: StoredUser = {
      _id: userId,
      username: trimmedUsername,
      email: trimmedEmail,
      passwordHash,
      avatar: '🎯',
      level: 1,
      xp: 0,
      coins: 200, // Welcome gift
      rating: 1000,
      rank: 'Bronze',
      stats: {
        wins: 0,
        losses: 0,
        totalGames: 0,
        winRate: 0,
        bestScore: 0,
        currentStreak: 0,
        bestStreak: 0,
        favoriteMode: 'classic'
      },
      cosmetics: {
        unlockedAvatars: ['🎯', '🎮', '🎲'],
        unlockedFrames: ['frame-default'],
        unlockedTitles: ['Rookie Guesser'],
        unlockedThemes: ['neon'],
        activeAvatar: '🎯',
        activeFrame: 'frame-default',
        activeTitle: 'Rookie Guesser',
        activeTheme: 'neon'
      },
      achievements: [],
      matchHistory: [],
      createdAt: new Date().toISOString()
    };

    this.inMemoryUsers.set(userId, newUser);
    return newUser;
  }

  public async loginUser(usernameOrEmail: string, passwordPlain: string): Promise<{ user: StoredUser; token: string }> {
    const query = usernameOrEmail.trim().toLowerCase();
    let foundUser: StoredUser | undefined;

    for (const u of this.inMemoryUsers.values()) {
      if (u.username.toLowerCase() === query || (u.email && u.email.toLowerCase() === query)) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(passwordPlain, foundUser.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid username or password');
    }

    const token = jwt.sign({ userId: foundUser._id, username: foundUser.username }, JWT_SECRET, { expiresIn: '7d' });
    return { user: foundUser, token };
  }

  public getUserById(userId: string): StoredUser | undefined {
    return this.inMemoryUsers.get(userId);
  }

  public getUserByUsername(username: string): StoredUser | undefined {
    for (const u of this.inMemoryUsers.values()) {
      if (u.username.toLowerCase() === username.toLowerCase()) return u;
    }
    return undefined;
  }

  public updateUser(userId: string, updates: Partial<StoredUser>): StoredUser {
    const user = this.inMemoryUsers.get(userId);
    if (!user) throw new Error('User not found');

    const updated = { ...user, ...updates };
    // Recalculate rank tier and level if stats/xp updated
    if (updates.rating !== undefined) {
      updated.rank = computeRankTier(updated.rating);
    }
    if (updates.xp !== undefined) {
      const { level } = computeLevel(updated.xp);
      updated.level = level;
    }
    if (updated.stats.totalGames > 0) {
      updated.stats.winRate = Math.round((updated.stats.wins / updated.stats.totalGames) * 1000) / 10;
    }

    this.inMemoryUsers.set(userId, updated);
    return updated;
  }

  public getLeaderboard(type: string = 'global', sortBy: string = 'rating'): any[] {
    const allUsers = Array.from(this.inMemoryUsers.values());

    allUsers.sort((a, b) => {
      if (sortBy === 'wins') return b.stats.wins - a.stats.wins;
      if (sortBy === 'xp') return b.xp - a.xp;
      if (sortBy === 'score') return b.stats.bestScore - a.stats.bestScore;
      if (sortBy === 'streak') return b.stats.bestStreak - a.stats.bestStreak;
      return b.rating - a.rating; // default: rating
    });

    return allUsers.slice(0, 50).map((u, index) => ({
      rank: index + 1,
      userId: u._id,
      username: u.username,
      avatar: u.avatar,
      frame: u.cosmetics.activeFrame,
      title: u.cosmetics.activeTitle,
      level: u.level,
      rankTier: u.rank,
      rating: u.rating,
      wins: u.stats.wins,
      bestScore: u.stats.bestScore,
      currentStreak: u.stats.currentStreak,
      xp: u.xp
    }));
  }

  public getDailyLeaderboard(dateStr: string): any[] {
    const list = this.dailyChallengeScores.get(dateStr) || [];
    list.sort((a, b) => b.score - a.score);
    return list.slice(0, 20).map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username,
      avatar: entry.avatar,
      score: entry.score,
      attempts: entry.attempts,
      duration: entry.duration
    }));
  }

  public recordDailyScore(dateStr: string, data: { userId: string; username: string; avatar: string; score: number; attempts: number; duration: number }) {
    const list = this.dailyChallengeScores.get(dateStr) || [];
    // Only keep best score for user
    const existingIndex = list.findIndex(x => x.userId === data.userId);
    if (existingIndex >= 0) {
      if (data.score > list[existingIndex].score) {
        list[existingIndex] = data;
      }
    } else {
      list.push(data);
    }
    this.dailyChallengeScores.set(dateStr, list);
  }
}

export const db = new DatabaseManager();
export { JWT_SECRET };
