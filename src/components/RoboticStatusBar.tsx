import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Flame, Trophy, HelpCircle } from 'lucide-react';

interface RoboticStatusBarProps {
  modeName?: string;
  activeTargetRange?: { min: number; max: number };
  aiThinking?: boolean;
}

export const RoboticStatusBar: React.FC<RoboticStatusBarProps> = ({
  modeName = 'Ready to Play',
  activeTargetRange,
  aiThinking = false
}) => {
  const [onlineCount, setOnlineCount] = useState<number>(1284);
  const [tipIndex, setTipIndex] = useState<number>(0);

  const tips = [
    'Tip: Using the binary midpoint (½) cuts remaining possibilities in half each turn.',
    'Play Solo Practice to unlock exclusive avatars and titles.',
    'Daily Challenge resets every 24 hours — solve it in fewest attempts!',
    'Host a custom War Room to challenge your friends in real-time.'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#0a0f1d]/85 border-b border-slate-800/80 px-3 sm:px-6 py-1.5 text-xs text-slate-300 flex items-center justify-between gap-3 select-none backdrop-blur-md z-20">
      {/* Left: Active Live Status */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Users className="w-3 h-3 ml-0.5" />
          <span>{onlineCount.toLocaleString()} Online</span>
        </div>

        {/* Dynamic Tip / Helper */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-xs truncate">
          <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">{tips[tipIndex]}</span>
        </div>
      </div>

      {/* Right: Active Range / AI State indicator */}
      <div className="flex items-center gap-2 shrink-0 ml-auto text-xs font-medium">
        {aiThinking && (
          <span className="flex items-center gap-1 text-amber-300 animate-pulse text-[11px]">
            <span>AI Thinking...</span>
          </span>
        )}

        {activeTargetRange ? (
          <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px]">
            Target: <strong>{activeTargetRange.min} – {activeTargetRange.max}</strong>
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono-clean">
            {modeName}
          </span>
        )}
      </div>
    </div>
  );
};
