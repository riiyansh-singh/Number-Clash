import React from 'react';
import { sounds } from '../lib/soundEngine';
import { 
  X, 
  Gamepad2, 
  Flame, 
  Bot, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  Target, 
  HelpCircle,
  Divide,
  Users
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0c1220] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & App Icon */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shadow-cyan-500/20 border border-cyan-400/30 shrink-0 bg-slate-900">
            <img 
              src="/app-icon.jpg" 
              alt="Number Clash" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              How to Play Number Clash
            </h2>
            <p className="text-xs text-cyan-400 font-medium">
              Master numeric deduction, strategic midpoint calculations, and speed
            </p>
          </div>
        </div>

        {/* Rules Sections */}
        <div className="space-y-4 text-slate-300 text-xs sm:text-sm font-body leading-relaxed">
          {/* Core Rule */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-display text-xs sm:text-sm font-bold text-cyan-300 uppercase mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" /> 1. The Objective
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              A secret integer is randomly chosen within a specified range (e.g. 1 to 500). Your goal is to pinpoint the exact target number using the fewest guesses before your attempts or timer expire.
            </p>
          </div>

          {/* Hot/Cold Radar */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-display text-xs sm:text-sm font-bold text-amber-300 uppercase mb-1 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> 2. Hot / Cold Distance Indicators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5">
              <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-center">
                <span className="font-bold text-rose-300 block text-xs">Very Hot 🔥</span>
                <span className="text-[11px] text-slate-400">&lt; 5% distance</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-center">
                <span className="font-bold text-amber-300 block text-xs">Hot ⚡</span>
                <span className="text-[11px] text-slate-400">5 – 10% distance</span>
              </div>
              <div className="p-2.5 rounded-xl bg-yellow-950/20 border border-yellow-500/30 text-center">
                <span className="font-bold text-yellow-300 block text-xs">Warm 🟡</span>
                <span className="text-[11px] text-slate-400">10 – 30% distance</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="font-bold text-slate-400 block text-xs">Cold ❄️</span>
                <span className="text-[11px] text-slate-500">&gt; 30% distance</span>
              </div>
            </div>
          </div>

          {/* Multiplayer Modes */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-display text-xs sm:text-sm font-bold text-orange-300 uppercase mb-1.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" /> 3. Real-Time Multiplayer Modes
            </h3>
            <ul className="space-y-1.5 text-slate-400 text-xs sm:text-sm">
              <li><strong className="text-white font-semibold">Battle Royale:</strong> All players guess simultaneously in real-time. First to hit the exact target wins!</li>
              <li><strong className="text-white font-semibold">Turn-Based Duel:</strong> Players take alternating turns. Each miss narrows the range for the other player.</li>
              <li><strong className="text-white font-semibold">Sudden Death:</strong> In each round, the player whose guess is farthest from the target is eliminated.</li>
            </ul>
          </div>

          {/* Strategy Tip */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
            <h3 className="font-display text-xs sm:text-sm font-bold text-indigo-300 uppercase mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> 4. Strategy Pro-Tip: Binary Search
            </h3>
            <p className="text-indigo-200 text-xs sm:text-sm">
              Use the <strong>[½ Midpoint]</strong> button on the keypad! In a 1–1,000 range, guessing 500 eliminates half of all possibilities in a single turn.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-sm tracking-wide uppercase transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
