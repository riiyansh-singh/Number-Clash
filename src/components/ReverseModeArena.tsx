import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { sounds } from '../lib/soundEngine';
import { api } from '../lib/apiClient';
import { 
  RotateCcw, 
  Brain, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  AlertOctagon, 
  Sparkles, 
  Zap, 
  Trophy,
  Activity,
  Radio,
  Cpu
} from 'lucide-react';

interface ReverseModeArenaProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onShowResultModal: (resultData: any) => void;
}

export const ReverseModeArena: React.FC<ReverseModeArenaProps> = ({
  user,
  onUpdateUser,
  onShowResultModal
}) => {
  const [minRange, setMinRange] = useState<number>(1);
  const [maxRange, setMaxRange] = useState<number>(1000);
  const [currentMin, setCurrentMin] = useState<number>(1);
  const [currentMax, setCurrentMax] = useState<number>(1000);
  const [currentAiGuess, setCurrentAiGuess] = useState<number>(500);
  const [aiAttempts, setAiAttempts] = useState<number>(0);
  const [guessLog, setGuessLog] = useState<Array<{ attempt: number; guess: number; feedback: string }>>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [cheatDetected, setCheatDetected] = useState<string | null>(null);

  const startReverseGame = (rangeMax: number = 1000) => {
    sounds.playRoboticBeep();
    setMinRange(1);
    setMaxRange(rangeMax);
    setCurrentMin(1);
    setCurrentMax(rangeMax);
    const initialGuess = Math.floor((1 + rangeMax) / 2);
    setCurrentAiGuess(initialGuess);
    setAiAttempts(1);
    setGuessLog([]);
    setCheatDetected(null);
    setIsPlaying(true);
    setHasStarted(true);
  };

  const handleFeedback = (response: 'higher' | 'lower' | 'correct') => {
    if (!isPlaying) return;
    sounds.playClick();

    if (response === 'correct') {
      sounds.playCorrect();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      handleGameEnd(true, `AI successfully identified your number in ${aiAttempts} attempts!`);
      return;
    }

    let nextMin = currentMin;
    let nextMax = currentMax;

    if (response === 'higher') {
      nextMin = currentAiGuess + 1;
    } else if (response === 'lower') {
      nextMax = currentAiGuess - 1;
    }

    // Anti-contradiction validation
    if (nextMin > nextMax) {
      sounds.playDefeat();
      setCheatDetected(`Contradiction detected! No integer exists between ${nextMin} and ${nextMax}. Please verify previous responses.`);
      return;
    }

    setCurrentMin(nextMin);
    setCurrentMax(nextMax);

    const nextGuess = Math.floor((nextMin + nextMax) / 2);
    const feedbackText = response === 'higher' ? 'HIGHER 🔼' : 'LOWER 🔽';

    setGuessLog(prev => [
      { attempt: aiAttempts, guess: currentAiGuess, feedback: feedbackText },
      ...prev
    ]);

    sounds.playDataProcess();
    setCurrentAiGuess(nextGuess);
    setAiAttempts(prev => prev + 1);
  };

  const handleGameEnd = async (success: boolean, reason: string) => {
    setIsPlaying(false);

    let recordedResult: any = null;
    if (user) {
      try {
        const res = await api.recordMatch({
          mode: 'reverse',
          difficulty: 'medium',
          won: success,
          attempts: aiAttempts,
          maxAttempts: 15,
          durationSeconds: 15,
          secretNumber: currentAiGuess
        });
        onUpdateUser(res.user);
        recordedResult = res.matchResult;
      } catch (err) {
        console.error('Failed to record reverse match:', err);
      }
    }

    onShowResultModal({
      won: success,
      title: 'SYNAPSE OVERRIDE COMPLETE',
      reason,
      secretNumber: currentAiGuess,
      attemptsUsed: aiAttempts,
      maxAttempts: 15,
      durationSeconds: 15,
      difficulty: 'medium',
      matchResult: recordedResult,
      onPlayAgain: () => startReverseGame(maxRange)
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-6 animate-fade-in pb-20 lg:pb-8">
      {/* Header Panel */}
      <div className="hud-panel rounded-2xl p-4 sm:p-6 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono-tech mb-3">
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          <span>NEURAL MIND-READER ENGINE V3</span>
        </div>
        <h2 className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white mb-2">
          REVERSE MIND SCAN
        </h2>
        <p className="text-xs sm:text-sm font-mono-tech text-slate-300 max-w-lg mx-auto">
          Think of a secret number between <strong>{minRange}</strong> and <strong>{maxRange}</strong> in your mind. 
          The AI will read and isolate it with optimal binary search.
        </p>

        {/* Range Selector */}
        {!hasStarted && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-mono-tech text-slate-400 font-bold">SELECT SPECTRUM:</span>
            {[100, 500, 1000, 10000].map((r) => (
              <button
                key={r}
                onClick={() => startReverseGame(r)}
                className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 text-white font-['Orbitron'] text-xs font-bold transition-all active:scale-95 shadow-sm touch-target"
              >
                1 – {r.toLocaleString()}
              </button>
            ))}
          </div>
        )}
      </div>

      {hasStarted && (
        <div className="space-y-6">
          {/* Main AI Thought Scanner HUD */}
          <div className="hud-panel hud-corners rounded-2xl p-6 text-center relative">
            {/* Telemetry info */}
            <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 border-b border-slate-800 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>FREQUENCY LOCK: <strong>[{currentMin}..{currentMax}]</strong></span>
              </div>
              <div className="text-cyan-400 font-bold">
                ATTEMPT #{aiAttempts}
              </div>
            </div>

            <div className="text-xs font-mono-tech text-cyan-400/80 uppercase font-bold tracking-widest mb-1">
              AI TELEPATHIC COMPUTATION
            </div>
            
            {/* The Big AI Guess */}
            <div className="font-['Orbitron'] text-5xl sm:text-7xl font-black text-white my-3 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              {currentAiGuess.toLocaleString()}
            </div>

            <p className="text-xs sm:text-sm font-mono-tech text-slate-300 mt-2 mb-6">
              Is your secret number higher, lower, or exactly this?
            </p>

            {/* Error or Contradiction Alert */}
            {cheatDetected && (
              <div className="p-3 mb-6 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono-tech flex items-center justify-center gap-2 animate-shake">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{cheatDetected}</span>
              </div>
            )}

            {/* Large Responsive Tactile Feedback Control Pads */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
              <button
                id="btn-feedback-higher"
                onClick={() => handleFeedback('higher')}
                disabled={!isPlaying}
                className="py-4 px-4 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-['Orbitron'] font-bold text-sm transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 touch-target"
              >
                <ArrowUp className="w-5 h-5 text-cyan-400" />
                <span>HIGHER (🔼)</span>
              </button>

              <button
                id="btn-feedback-correct"
                onClick={() => handleFeedback('correct')}
                disabled={!isPlaying}
                className="py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-['Orbitron'] font-black text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 touch-target"
              >
                <Check className="w-5 h-5" />
                <span>EXACT (🎯)</span>
              </button>

              <button
                id="btn-feedback-lower"
                onClick={() => handleFeedback('lower')}
                disabled={!isPlaying}
                className="py-4 px-4 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-['Orbitron'] font-bold text-sm transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 touch-target"
              >
                <ArrowDown className="w-5 h-5 text-amber-400" />
                <span>LOWER (🔽)</span>
              </button>
            </div>
          </div>

          {/* Telemetry Log */}
          {guessLog.length > 0 && (
            <div className="hud-panel rounded-2xl p-4 sm:p-5">
              <h4 className="text-xs font-mono-tech font-bold text-cyan-400 uppercase tracking-wider mb-3">
                SCAN CONVERGENCE TRAJECTORY
              </h4>
              <div className="space-y-2 font-mono-tech text-xs">
                {guessLog.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-slate-300"
                  >
                    <span>Attempt #{item.attempt}: AI guessed <strong className="text-white font-['Orbitron']">{item.guess}</strong></span>
                    <span className="font-bold text-cyan-400">{item.feedback}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset Scan */}
          <div className="text-center">
            <button
              onClick={() => startReverseGame(maxRange)}
              className="px-6 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono-tech font-bold uppercase transition-all inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESTART WITH NEW SECRET NUMBER</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
