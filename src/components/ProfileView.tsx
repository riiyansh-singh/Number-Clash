import React from 'react';
import { UserProfile } from '../types';
import { api } from '../lib/apiClient';
import { sounds } from '../lib/soundEngine';
import { 
  User, 
  Trophy, 
  Flame, 
  Award, 
  ShieldCheck, 
  Target, 
  Clock, 
  ShoppingBag, 
  LogOut, 
  Zap, 
  Sparkles,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile | null;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLogout,
  onNavigate,
  onOpenAuth
}) => {
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl">
          <User className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-2">NOT LOGGED IN</h3>
          <p className="text-xs text-slate-400 font-['Rajdhani'] mb-6">
            Log in or create an account to view your player statistics, match history, and unlockable rewards.
          </p>
          <button
            onClick={onOpenAuth}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-['Orbitron'] font-bold text-xs uppercase tracking-wider"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const winRate = user.stats.totalGames > 0
    ? Math.round((user.stats.wins / user.stats.totalGames) * 100)
    : 0;

  const currentLevelXP = user.xp % 500;
  const levelProgressPct = Math.min(100, Math.round((currentLevelXP / 500) * 100));

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in space-y-6">
      {/* Player Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d1526] to-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-wrap items-center justify-between gap-6">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          {/* Avatar with Frame */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-950 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 text-4xl">
            {user.avatar}
            <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-['Orbitron'] font-extrabold text-[10px] uppercase tracking-wider">
              LVL {user.level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white">{user.username}</h2>
              {user.title && (
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-['Rajdhani'] font-bold uppercase">
                  {user.title}
                </span>
              )}
            </div>

            <div className="text-xs text-cyan-400 font-['Rajdhani'] font-semibold mt-1 flex items-center gap-3">
              <span>RANK TIER: <strong className="text-white">{user.rank}</strong></span>
              <span>•</span>
              <span>ELO: <strong className="text-white">{user.rating}</strong></span>
            </div>

            {/* Level XP Bar */}
            <div className="mt-3 w-48 sm:w-64">
              <div className="flex justify-between text-[10px] font-['Rajdhani'] font-bold text-slate-400 mb-1">
                <span>PROGRESS TO LVL {user.level + 1}</span>
                <span>{currentLevelXP} / 500 XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all"
                  style={{ width: `${levelProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => {
              sounds.playClick();
              onNavigate('shop');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-950/40 hover:bg-pink-900/60 border border-pink-500/30 text-pink-300 font-['Rajdhani'] font-bold text-xs uppercase tracking-wider transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customize</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onLogout();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-['Rajdhani'] font-bold text-xs uppercase tracking-wider transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Win Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
          <div className="text-[10px] font-['Rajdhani'] font-bold text-slate-400 uppercase mb-1">WIN RATE</div>
          <div className="font-['Orbitron'] text-2xl font-black text-emerald-400">{winRate}%</div>
          <div className="text-[10px] text-slate-500 font-['Rajdhani']">{user.stats.wins}W / {user.stats.losses}L</div>
        </div>

        {/* Total Games */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
          <div className="text-[10px] font-['Rajdhani'] font-bold text-slate-400 uppercase mb-1">MATCHES PLAYED</div>
          <div className="font-['Orbitron'] text-2xl font-black text-cyan-400">{user.stats.totalGames}</div>
          <div className="text-[10px] text-slate-500 font-['Rajdhani']">Across all arenas</div>
        </div>

        {/* Win Streak */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
          <div className="text-[10px] font-['Rajdhani'] font-bold text-slate-400 uppercase mb-1">STREAK (CUR / BEST)</div>
          <div className="font-['Orbitron'] text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 text-orange-400" />
            <span>{user.stats.currentStreak} / {user.stats.bestStreak}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-['Rajdhani']">Consecutive wins</div>
        </div>

        {/* Coins Balance */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
          <div className="text-[10px] font-['Rajdhani'] font-bold text-slate-400 uppercase mb-1">COIN BALANCE</div>
          <div className="font-['Orbitron'] text-2xl font-black text-amber-400">{user.coins.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-['Rajdhani']">Earned in matches</div>
        </div>
      </div>

      {/* Match History Table */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-['Orbitron'] text-xs font-bold text-white uppercase tracking-wider">RECENT MATCH HISTORY</h3>
          </div>
          <span className="text-xs text-slate-500 font-['Rajdhani']">Last {user.matchHistory?.length || 0} Matches</span>
        </div>

        {(!user.matchHistory || user.matchHistory.length === 0) ? (
          <div className="text-center py-10 text-slate-500 text-xs font-['Rajdhani']">
            No match history yet. Play your first match in the Solo or Multiplayer arena!
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {user.matchHistory.map((match) => (
              <div
                key={match.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs font-['Rajdhani']"
              >
                <div className="flex items-center gap-3">
                  {match.won ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-['Orbitron'] font-bold text-white uppercase text-[11px]">
                      {match.mode.replace('_', ' ')} • {match.difficulty.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Secret: {match.secretNumber.toLocaleString()} | {match.attempts} attempts ({match.durationSeconds}s)
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div className="font-['Orbitron'] font-bold text-cyan-400 text-[11px]">
                    +{match.score} PTS
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    match.won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {match.won ? 'VICTORY' : 'DEFEAT'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
