import React, { useState } from 'react';
import { UserProfile } from '../types';
import { sounds } from '../lib/soundEngine';
import { 
  Gamepad2, 
  Flame, 
  Bot, 
  RotateCcw, 
  Calendar, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Hash, 
  Zap,
  Play,
  Award,
  ShieldCheck
} from 'lucide-react';

interface HomeHeroProps {
  user: UserProfile | null;
  onNavigate: (tab: string, extraData?: any) => void;
  onOpenAuth: () => void;
  onOpenHowToPlay: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  user,
  onNavigate,
  onOpenAuth,
  onOpenHowToPlay
}) => {
  const [quickRoomCode, setQuickRoomCode] = useState('');

  const handleJoinQuickRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRoomCode.trim()) return;
    sounds.playClick();
    onNavigate('multiplayer', { joinCode: quickRoomCode.trim().toUpperCase() });
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)] flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto z-10 animate-fade-in">
      {/* Hero Header Presentation */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        {/* App Icon + Badge */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/25 border-2 border-cyan-400/40 p-0.5 bg-gradient-to-b from-cyan-400/40 to-blue-600/30 mb-4 animate-float">
            <img 
              src="/app-icon.jpg" 
              alt="Number Clash Icon" 
              className="w-full h-full object-cover rounded-[22px]"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real-Time Multiplayer Number Duels</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
          NUMBER <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">CLASH</span>
        </h1>

        {/* Subtitle / Tagline */}
        <p className="mt-3 text-base sm:text-xl font-body font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Outsmart opponents, narrow the target number with intuition and strategy, and climb the global ranks.
        </p>

        {/* Quick Action Button for Guests */}
        {!user && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              id="btn-hero-quick-play"
              onClick={() => {
                sounds.playClick();
                onNavigate('solo');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 touch-target cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Instant Match</span>
            </button>
            <button
              id="btn-hero-signin"
              onClick={() => {
                sounds.playClick();
                onOpenAuth();
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-display font-semibold text-sm transition-all hover:border-slate-500 touch-target cursor-pointer"
            >
              <span>Sign In for Ranks</span>
            </button>
          </div>
        )}

        {/* Player Profile Stats Banner if logged in */}
        {user && (
          <div className="mt-5 inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{user.avatar}</span>
              <div className="text-left">
                <div className="text-sm font-bold text-white leading-tight">{user.username}</div>
                <div className="text-xs text-cyan-400 font-medium">{user.rank} • Rating: {user.rating}</div>
              </div>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div className="text-left">
              <div className="text-[11px] text-slate-400 font-medium">Win Streak</div>
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.stats.currentStreak} Wins</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Game Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* SOLO PRACTICE */}
        <div 
          id="card-mode-solo"
          onClick={() => {
            sounds.playClick();
            onNavigate('solo');
          }}
          className="group cursor-pointer relative overflow-hidden rounded-2xl p-6 game-card hover:-translate-y-1.5"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-white mb-1.5">Solo Practice</h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Test your intuition across 4 difficulty tiers (1–50 up to 1–1,000,000) with binary feedback and proximity indicators.
          </p>
          <div className="flex items-center text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>Play Solo Arena</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>

        {/* MULTIPLAYER WAR ROOM */}
        <div 
          id="card-mode-multiplayer"
          onClick={() => {
            sounds.playClick();
            onNavigate('multiplayer');
          }}
          className="group cursor-pointer relative overflow-hidden rounded-2xl p-6 game-card border-orange-500/20 hover:border-orange-500/40 hover:-translate-y-1.5"
        >
          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-[10px] font-bold text-orange-300 uppercase tracking-wide">
            Live Match
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-white mb-1.5">Multiplayer Clash</h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Real-time Battle Royale, Turn-Based duels, and Sudden Death rooms for up to 4 live players with room codes.
          </p>
          <div className="flex items-center text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
            <span>Join or Create Room</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>

        {/* VS AI BOT */}
        <div 
          id="card-mode-ai"
          onClick={() => {
            sounds.playClick();
            onNavigate('ai');
          }}
          className="group cursor-pointer relative overflow-hidden rounded-2xl p-6 game-card border-purple-500/20 hover:border-purple-500/40 hover:-translate-y-1.5"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-white mb-1.5">Play vs AI Bot</h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Duel adaptive AI bots — from casual beginner bots to the unbeatable Quantum Master algorithm.
          </p>
          <div className="flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Challenge Bot</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>
      </div>

      {/* Secondary Quick Modes Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
        {/* REVERSE SCAN MODE */}
        <button
          id="btn-quick-reverse"
          onClick={() => {
            sounds.playClick();
            onNavigate('reverse');
          }}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display text-xs font-bold text-white group-hover:text-indigo-300">Reverse Mind Reader</div>
              <div className="text-[11px] text-slate-400">Think of a number, AI guesses it</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        {/* DAILY CHALLENGE */}
        <button
          id="btn-quick-daily"
          onClick={() => {
            sounds.playClick();
            onNavigate('daily');
          }}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display text-xs font-bold text-white group-hover:text-emerald-300">Daily Puzzle</div>
              <div className="text-[11px] text-slate-400">Synchronized daily target puzzle</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        {/* QUICK JOIN ROOM FORM */}
        <form onSubmit={handleJoinQuickRoom} className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/70 border border-slate-800 focus-within:border-cyan-400 transition-all">
          <div className="pl-2 text-slate-400">
            <Hash className="w-4 h-4 text-cyan-400" />
          </div>
          <input
            id="input-quick-room-code"
            type="text"
            maxLength={5}
            placeholder="Room Code (e.g. 7A9K)"
            value={quickRoomCode}
            onChange={(e) => setQuickRoomCode(e.target.value.toUpperCase())}
            className="w-full bg-transparent text-xs font-semibold text-white placeholder-slate-500 outline-none uppercase tracking-wider"
          />
          <button
            type="submit"
            disabled={!quickRoomCode.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 font-display font-bold text-xs uppercase tracking-wide transition-all shrink-0 touch-target cursor-pointer"
          >
            Join
          </button>
        </form>
      </div>

      {/* Feature Highlights Footer */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-3.5 h-3.5" /> Instant Matchmaking
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <Trophy className="w-3.5 h-3.5" /> ELO Competitive Rankings
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Fair & Anticheat Verified
          </span>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenHowToPlay();
          }}
          className="hover:text-cyan-300 text-slate-400 underline underline-offset-4 cursor-pointer"
        >
          Game Rules & Strategic Guide
        </button>
      </div>
    </div>
  );
};
