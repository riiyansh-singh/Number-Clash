import React from 'react';
import { sounds } from '../lib/soundEngine';
import { 
  Trophy, 
  X, 
  RotateCcw, 
  Coins, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Home 
} from 'lucide-react';

interface GameResultModalProps {
  data: {
    won: boolean;
    title: string;
    reason: string;
    secretNumber: number;
    attemptsUsed: number;
    maxAttempts: number;
    durationSeconds: number;
    difficulty?: string;
    matchResult?: {
      xpEarned: number;
      coinsEarned: number;
      ratingDelta?: number;
      score: number;
      newRating?: number;
      newLevel?: number;
    };
    onPlayAgain: () => void;
  } | null;
  onClose: () => void;
  onNavigateHome: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  data,
  onClose,
  onNavigateHome
}) => {
  if (!data) return null;

  const { won, title, reason, secretNumber, attemptsUsed, maxAttempts, durationSeconds, matchResult, onPlayAgain } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-md bg-[#0b1018] border-2 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden ${
        won ? 'border-cyan-400 shadow-cyan-500/20' : 'border-rose-500/60 shadow-rose-500/10'
      }`}>
        {/* Glow corner */}
        <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
          won ? 'bg-cyan-500/30' : 'bg-rose-500/20'
        }`} />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl ${
          won
            ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-cyan-500/30'
            : 'bg-gradient-to-br from-rose-500 to-slate-900 text-rose-200 shadow-rose-500/20'
        }`}>
          {won ? <Trophy className="w-8 h-8" /> : <X className="w-8 h-8" />}
        </div>

        {/* Title */}
        <h2 className={`font-['Orbitron'] text-2xl sm:text-3xl font-black uppercase tracking-wider ${
          won ? 'text-white' : 'text-rose-400'
        }`}>
          {title}
        </h2>
        <p className="text-xs text-slate-400 font-['Rajdhani'] font-medium mt-1">{reason}</p>

        {/* Target Number Reveal Box */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] font-['Rajdhani'] font-bold text-slate-400 uppercase tracking-widest mb-1">
            SECRET NUMBER TARGET
          </div>
          <div className="font-['Orbitron'] text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
            {secretNumber?.toLocaleString() || '---'}
          </div>
          <div className="mt-2 text-xs font-['Rajdhani'] text-slate-400 flex items-center justify-center gap-4">
            <span>{attemptsUsed} / {maxAttempts} Attempts</span>
            <span>•</span>
            <span>{durationSeconds}s Duration</span>
          </div>
        </div>

        {/* Earned Rewards (XP, Coins, Rating) */}
        {matchResult && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
              <div className="text-[10px] text-cyan-400 font-['Rajdhani'] font-bold uppercase">XP EARNED</div>
              <div className="font-['Orbitron'] text-sm font-bold text-white">+{matchResult.xpEarned}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30">
              <div className="text-[10px] text-amber-400 font-['Rajdhani'] font-bold uppercase">COINS</div>
              <div className="font-['Orbitron'] text-sm font-bold text-white">+{matchResult.coinsEarned}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
              <div className="text-[10px] text-purple-400 font-['Rajdhani'] font-bold uppercase">ELO DELTA</div>
              <div className={`font-['Orbitron'] text-sm font-bold flex items-center justify-center gap-0.5 ${
                (matchResult.ratingDelta || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {(matchResult.ratingDelta || 0) >= 0 ? `+${matchResult.ratingDelta}` : matchResult.ratingDelta}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            id="btn-result-play-again"
            onClick={() => {
              sounds.playClick();
              onClose();
              onPlayAgain();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-['Orbitron'] font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
              onNavigateHome();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-['Rajdhani'] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
