import React from 'react';
import { sounds } from '../lib/soundEngine';
import { Delete, CornerDownLeft, Divide, ArrowLeftRight, Sparkles } from 'lucide-react';

interface CyberKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  minRange?: number;
  maxRange?: number;
  currentMinBound?: number;
  currentMaxBound?: number;
  disabled?: boolean;
}

export const CyberKeypad: React.FC<CyberKeypadProps> = ({
  value,
  onChange,
  onSubmit,
  minRange = 1,
  maxRange = 500,
  currentMinBound,
  currentMaxBound,
  disabled = false
}) => {
  const low = currentMinBound !== undefined ? currentMinBound : minRange;
  const high = currentMaxBound !== undefined ? currentMaxBound : maxRange;
  const midpoint = Math.floor((low + high) / 2);

  const handleDigit = (digit: string) => {
    if (disabled) return;
    sounds.playKeypadPress();
    // Don't allow leading multiple zeroes
    if (value === '0' && digit === '0') return;
    if (value === '0' && digit !== '0') {
      onChange(digit);
    } else {
      onChange(value + digit);
    }
  };

  const handleDelete = () => {
    if (disabled || !value) return;
    sounds.playKeypadPress();
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || !value) return;
    sounds.playKeypadPress();
    onChange('');
  };

  const handleSetMidpoint = () => {
    if (disabled) return;
    sounds.playRoboticBeep();
    onChange(String(midpoint));
  };

  const handleAdjust = (delta: number) => {
    if (disabled) return;
    sounds.playKeypadPress();
    const curr = parseInt(value, 10) || low;
    const next = Math.max(minRange, Math.min(maxRange, curr + delta));
    onChange(String(next));
  };

  return (
    <div className="w-full bg-[#0d1322]/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-xl">
      {/* Quick Helper Shortcuts Bar */}
      <div className="grid grid-cols-4 gap-1.5 mb-2.5 text-xs font-semibold">
        <button
          type="button"
          onClick={handleSetMidpoint}
          disabled={disabled}
          title={`Calculate midpoint (${midpoint})`}
          className="col-span-2 py-2 px-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <Divide className="w-3.5 h-3.5 text-cyan-400" />
          <span>½ Midpoint ({midpoint})</span>
        </button>

        <button
          type="button"
          onClick={() => handleAdjust(-10)}
          disabled={disabled}
          className="py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
        >
          -10
        </button>

        <button
          type="button"
          onClick={() => handleAdjust(10)}
          disabled={disabled}
          className="py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
        >
          +10
        </button>
      </div>

      {/* Main Numeric Keypad Grid */}
      <div className="grid grid-cols-3 gap-1.5 font-display font-bold text-base sm:text-lg">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleDigit(String(num))}
            disabled={disabled}
            className="h-11 sm:h-12 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-white active:bg-cyan-500 active:text-slate-950 active:scale-95 transition-all flex items-center justify-center shadow-sm select-none cursor-pointer"
          >
            {num}
          </button>
        ))}

        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || !value}
          className="h-11 sm:h-12 rounded-xl bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/20 text-rose-300 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center text-xs font-semibold cursor-pointer"
        >
          Clear
        </button>

        {/* 0 */}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          disabled={disabled}
          className="h-11 sm:h-12 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-white active:bg-cyan-500 active:text-slate-950 active:scale-95 transition-all flex items-center justify-center shadow-sm select-none cursor-pointer"
        >
          0
        </button>

        {/* Backspace */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled || !value}
          className="h-11 sm:h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* Submit Guess Button */}
      <button
        type="button"
        onClick={() => {
          if (!disabled && value) {
            onSubmit();
          }
        }}
        disabled={disabled || !value}
        className="w-full mt-2.5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-30 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <CornerDownLeft className="w-4 h-4" />
        <span>Submit Guess</span>
      </button>
    </div>
  );
};
