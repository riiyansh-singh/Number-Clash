export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'insane';

export type GameMode = 
  | 'classic' 
  | 'battle_royale' 
  | 'turn_based' 
  | 'sudden_death' 
  | 'vs_ai' 
  | 'reverse' 
  | 'daily';

export type AIDifficulty = 'easy' | 'medium' | 'expert';

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master';

export interface UserStats {
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
  favoriteMode: string;
}

export interface CosmeticsState {
  unlockedAvatars: string[];
  unlockedFrames: string[];
  unlockedTitles: string[];
  unlockedThemes: string[];
  activeAvatar: string;
  activeFrame: string;
  activeTitle: string;
  activeTheme: string;
}

export interface MatchHistoryItem {
  id: string;
  mode: GameMode;
  difficulty: GameDifficulty;
  won: boolean;
  attempts: number;
  score: number;
  xpEarned: number;
  coinsEarned: number;
  secretNumber: number;
  durationSeconds: number;
  date: string;
  opponentName?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  rating: number;
  rank: RankTier;
  stats: UserStats;
  cosmetics: CosmeticsState;
  achievements: string[];
  matchHistory: MatchHistoryItem[];
  createdAt: string;
}

export interface DifficultyConfig {
  id: GameDifficulty;
  name: string;
  min: number;
  max: number;
  maxAttempts: number;
  xpMultiplier: number;
  coinMultiplier: number;
  badgeColor: string;
}

export interface GuessFeedback {
  guess: number;
  comparison: 'high' | 'low' | 'correct';
  distance: number;
  percentageDistance: number;
  hotness: 'cold' | 'warm' | 'hot' | 'very_hot';
  message: string;
  propertyHint?: string;
  timestamp: number;
}

export interface RoomPlayer {
  id: string;
  socketId: string;
  username: string;
  avatar: string;
  frame: string;
  title: string;
  rating: number;
  level: number;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  eliminated?: boolean;
  attemptsCount?: number;
  lastGuess?: number;
  lastHotness?: 'cold' | 'warm' | 'hot' | 'very_hot';
  score?: number;
}

export interface RoomState {
  code: string;
  hostId: string;
  mode: GameMode;
  difficulty: GameDifficulty;
  timerDuration: number; // 0 for off, 30, 60, 120
  status: 'lobby' | 'countdown' | 'in_game' | 'finished';
  players: RoomPlayer[];
  currentTurnSocketId?: string;
  round: number;
  startedAt?: number;
  timeRemaining?: number;
  winner?: RoomPlayer | null;
  secretNumber?: number; // Only revealed when finished!
  minRange: number;
  maxRange: number;
  recentEvents: GameEvent[];
}

export interface GameEvent {
  id: string;
  type: 'guess' | 'hotness' | 'elimination' | 'turn' | 'chat' | 'system';
  playerId?: string;
  playerName: string;
  avatar?: string;
  text: string;
  hotness?: 'cold' | 'warm' | 'hot' | 'very_hot';
  timestamp: number;
}

export interface QuickChatOption {
  id: string;
  text: string;
  emoji: string;
  soundType: 'hype' | 'laugh' | 'taunt' | 'gg' | 'cold' | 'fire';
}

export interface AchievementDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  rewardCoins: number;
  rewardXp: number;
  category: 'wins' | 'difficulty' | 'speed' | 'streaks' | 'special';
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'avatar' | 'frame' | 'title' | 'theme';
  price: number;
  previewValue: string; // url/color/text/class
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  frame?: string;
  title?: string;
  level: number;
  rankTier: RankTier;
  rating: number;
  wins: number;
  bestScore: number;
  currentStreak: number;
  xp: number;
}

export interface DailyChallengeData {
  date: string;
  title: string;
  min: number;
  max: number;
  maxAttempts: number;
  rewardCoins: number;
  rewardXp: number;
  hasPlayedToday: boolean;
  playerScore?: number;
  topScore?: number;
  leaderboard: LeaderboardEntry[];
}
