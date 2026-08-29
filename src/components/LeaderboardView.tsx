import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { api } from '../lib/apiClient';
import { sounds } from '../lib/soundEngine';
import { Trophy, Medal, Flame, Star, Crown, Sparkles, TrendingUp } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly' | 'daily'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'wins' | 'xp' | 'streak'>('rating');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard(timeframe, sortBy);
      setEntries(data.leaderboard || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      {/* Top Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-['Rajdhani'] font-bold uppercase tracking-widest mb-3">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>GLOBAL HALL OF CHAMPIONS</span>
        </div>
        <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-extrabold text-white">
          ARENA RANKINGS
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 font-['Rajdhani'] font-semibold max-w-md mx-auto">
          The highest ELO commanders, win streak leaders, and master guessers in the world.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-8 backdrop-blur-md">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All-Time' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'daily', label: 'Daily' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playClick();
                setTimeframe(t.id as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold transition-all ${
                timeframe === t.id
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-['Rajdhani'] font-bold text-slate-400 uppercase">Sort By:</span>
          {[
            { id: 'rating', label: 'ELO Rating' },
            { id: 'wins', label: 'Total Wins' },
            { id: 'streak', label: 'Streak' },
            { id: 'xp', label: 'Total XP' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => {
                sounds.playClick();
                setSortBy(s.id as any);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-['Rajdhani'] font-bold transition-all ${
                sortBy === s.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="order-2 md:order-1 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-[#101724] border border-slate-700/80 text-center shadow-lg transform md:-translate-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 font-['Orbitron'] font-black mx-auto mb-2">
                    2
                  </div>
                  <div className="text-3xl mb-1">{top3[1].avatar}</div>
                  <div className="font-['Orbitron'] text-sm font-bold text-white truncate">{top3[1].username}</div>
                  <div className="text-xs text-slate-400 font-['Rajdhani'] font-semibold">{top3[1].rank} • LVL {top3[1].level}</div>
                  <div className="mt-3 py-1 px-3 rounded-lg bg-slate-950 border border-slate-800 font-['Orbitron'] text-xs font-bold text-cyan-400">
                    {top3[1].rating} ELO ({top3[1].wins} Wins)
                  </div>
                </div>
              )}

              {/* 1st Place (Gold Crown) */}
              {top3[0] && (
                <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-[#161205] border-2 border-amber-400 text-center shadow-2xl shadow-amber-500/20 transform md:-translate-y-6 relative">
                  <Crown className="w-7 h-7 text-amber-400 absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-['Orbitron'] font-black text-lg mx-auto mb-2 mt-2">
                    1
                  </div>
                  <div className="text-4xl mb-1">{top3[0].avatar}</div>
                  <div className="font-['Orbitron'] text-base font-black text-white truncate">{top3[0].username}</div>
                  <div className="text-xs text-amber-300 font-['Rajdhani'] font-bold">{top3[0].rank} • LVL {top3[0].level}</div>
                  <div className="mt-3 py-1.5 px-4 rounded-xl bg-amber-500/20 border border-amber-400/50 font-['Orbitron'] text-sm font-black text-amber-300">
                    {top3[0].rating} ELO ({top3[0].wins} Wins)
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="order-3 md:order-3 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-[#1e130a] border border-amber-700/60 text-center shadow-lg transform md:-translate-y-1">
                  <div className="w-10 h-10 rounded-full bg-amber-900/40 border border-amber-700 flex items-center justify-center text-amber-600 font-['Orbitron'] font-black mx-auto mb-2">
                    3
                  </div>
                  <div className="text-3xl mb-1">{top3[2].avatar}</div>
                  <div className="font-['Orbitron'] text-sm font-bold text-white truncate">{top3[2].username}</div>
                  <div className="text-xs text-slate-400 font-['Rajdhani'] font-semibold">{top3[2].rank} • LVL {top3[2].level}</div>
                  <div className="mt-3 py-1 px-3 rounded-lg bg-slate-950 border border-slate-800 font-['Orbitron'] text-xs font-bold text-amber-500">
                    {top3[2].rating} ELO ({top3[2].wins} Wins)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Table */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 gap-2 p-3.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-['Rajdhani'] font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Player Tag</div>
              <div className="col-span-2 text-center">Tier</div>
              <div className="col-span-2 text-center">Rating</div>
              <div className="col-span-2 text-center">Win Streak</div>
              <div className="col-span-1 text-right">Wins</div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {entries.map((entry) => (
                <div
                  key={entry.rank}
                  className="grid grid-cols-12 gap-2 p-3.5 items-center hover:bg-slate-800/40 transition-colors text-xs font-['Rajdhani']"
                >
                  <div className="col-span-1 text-center font-['Orbitron'] font-extrabold text-slate-400">
                    #{entry.rank}
                  </div>
                  <div className="col-span-4 flex items-center gap-2.5">
                    <span className="text-xl">{entry.avatar}</span>
                    <div className="truncate">
                      <div className="font-['Orbitron'] font-bold text-white truncate">{entry.username}</div>
                      <div className="text-[10px] text-slate-500">LVL {entry.level}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-cyan-300">
                      {entry.rankTier}
                    </span>
                  </div>
                  <div className="col-span-2 text-center font-['Orbitron'] font-bold text-cyan-400">
                    {entry.rating}
                  </div>
                  <div className="col-span-2 text-center font-['Orbitron'] font-bold text-orange-400 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{entry.streak}</span>
                  </div>
                  <div className="col-span-1 text-right font-['Orbitron'] font-bold text-white">
                    {entry.wins}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
