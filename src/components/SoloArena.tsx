import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, GameDifficulty, GuessFeedback } from '../types';
import { sounds } from '../lib/soundEngine';
import { api } from '../lib/apiClient';
import { CyberKeypad } from './CyberKeypad';
import { 
  Shield, 
  Clock, 
  Flame, 
  HelpCircle, 
  RotateCcw, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Timer,
  Cpu,
  Bot,
  Keyboard,
  Target,
  Crosshair,
  Binary
} from 'lucide-react';

interface SoloArenaProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onShowResultModal: (resultData: any) => void;
}

const DIFFICULTIES: Record<GameDifficulty, { name: string; min: number; max: number; attempts: number; color: string; badge: string }> = {
  easy: { name: 'EASY', min: 1, max: 50, attempts: 10, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', badge: '1 – 50' },
  medium: { name: 'MEDIUM', min: 1, max: 500, attempts: 8, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10', badge: '1 – 500' },
  hard: { name: 'HARD', min: 1, max: 10000, attempts: 7, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10', badge: '1 – 10,000' },
  insane: { name: 'INSANE', min: 1, max: 1000000, attempts: 6, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10', badge: '1 – 1,000,000' }
};

export const SoloArena: React.FC<SoloArenaProps> = ({
  user,
  onUpdateUser,
  onShowResultModal
}) => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [timeLimit, setTimeLimit] = useState<number>(0); // 0 = off, 30, 60
  const [secretNumber, setSecretNumber] = useState<number>(0);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [guessHistory, setGuessHistory] = useState<GuessFeedback[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [shakeInput, setShakeInput] = useState<boolean>(false);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);

  // Dynamic bounds deduced by previous player guesses
  const [currentMinBound, setCurrentMinBound] = useState<number>(1);
  const [currentMaxBound, setCurrentMaxBound] = useState<number>(500);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Game Round
  const startNewGame = (diff: GameDifficulty = difficulty, timer: number = timeLimit) => {
    sounds.playRoboticBeep();
    const config = DIFFICULTIES[diff];
    const generated = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    
    setDifficulty(diff);
    setTimeLimit(timer);
    setSecretNumber(generated);
    setAttemptsLeft(config.attempts);
    setGuessHistory([]);
    setCurrentGuess('');
    setCurrentHint(null);
    setCurrentMinBound(config.min);
    setCurrentMaxBound(config.max);
    setIsPlaying(true);
    setStartTime(Date.now());
    setTimeRemaining(timer);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    startNewGame('medium', 0);
  }, []);

  // Timer Tick
  useEffect(() => {
    if (!isPlaying || timeLimit <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGameOver(false, '⏰ Chrono shield depleted! Attempts expired.');
          return 0;
        }
        if (prev <= 6) {
          sounds.playCountdown();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeLimit, secretNumber]);

  // Handle Guess Submission
  const handleGuessSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isPlaying) return;

    const guessNum = parseInt(currentGuess.replace(/,/g, ''), 10);
    const config = DIFFICULTIES[difficulty];

    if (isNaN(guessNum) || guessNum < config.min || guessNum > config.max) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      sounds.playCold();
      return;
    }

    sounds.playGuess();
    const attemptsUsed = config.attempts - attemptsLeft + 1;
    const distance = Math.abs(guessNum - secretNumber);
    const totalRange = config.max - config.min;
    const percentageDistance = (distance / totalRange) * 100;

    let comparison: 'high' | 'low' | 'correct' = 'correct';
    if (guessNum > secretNumber) {
      comparison = 'high';
      setCurrentMaxBound((prev) => Math.min(prev, guessNum - 1));
    } else if (guessNum < secretNumber) {
      comparison = 'low';
      setCurrentMinBound((prev) => Math.max(prev, guessNum + 1));
    }

    let hotness: 'cold' | 'warm' | 'hot' | 'very_hot' = 'cold';
    let message = '';

    if (comparison === 'correct') {
      hotness = 'very_hot';
      message = `🎯 Bullseye! Exact match on ${secretNumber.toLocaleString()}!`;
    } else if (percentageDistance < 5) {
      hotness = 'very_hot';
      message = `🔥 Super Close! Only ${distance.toLocaleString()} away from the target!`;
    } else if (percentageDistance <= 10) {
      hotness = 'hot';
      message = `⚡ Getting Hot! Within ${distance.toLocaleString()} of the target!`;
    } else if (percentageDistance <= 30) {
      hotness = 'warm';
      message = `🟡 Getting Warm! You're ${distance.toLocaleString()} away.`;
    } else {
      hotness = 'cold';
      message = `❄️ Still Cold — ${distance.toLocaleString()} away from target.`;
    }

    // Dynamic smart hints on attempts 2, 4, 6
    let propertyHint: string | undefined;
    if (comparison !== 'correct') {
      if (attemptsUsed === 2) {
        propertyHint = secretNumber % 2 === 0 ? '💡 Hint: The secret number is EVEN.' : '💡 Hint: The secret number is ODD.';
      } else if (attemptsUsed === 4) {
        if (secretNumber % 5 === 0) {
          propertyHint = '💡 Hint: The secret number is a multiple of 5.';
        } else if (secretNumber % 3 === 0) {
          propertyHint = '💡 Hint: The secret number is divisible by 3.';
        } else {
          propertyHint = '💡 Hint: The secret number is NOT divisible by 3 or 5.';
        }
      } else if (attemptsUsed === 6) {
        const mid = Math.floor((config.min + config.max) / 2);
        propertyHint = secretNumber > mid ? `💡 Hint: The secret number is greater than ${mid.toLocaleString()}.` : `💡 Hint: The secret number is less than or equal to ${mid.toLocaleString()}.`;
      }
    }

    if (propertyHint) {
      setCurrentHint(propertyHint);
    }

    const newFeedback: GuessFeedback = {
      guess: guessNum,
      comparison,
      distance,
      percentageDistance: Math.round(percentageDistance * 10) / 10,
      hotness,
      message,
      propertyHint,
      timestamp: Date.now()
    };

    setGuessHistory([newFeedback, ...guessHistory]);
    setCurrentGuess('');

    if (comparison === 'correct') {
      sounds.playCorrect();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      handleGameOver(true, 'Target Acquired!');
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);

      if (hotness === 'very_hot' || hotness === 'hot') {
        sounds.playHot();
      } else {
        sounds.playCold();
      }

      if (remaining <= 0) {
        sounds.playDefeat();
        handleGameOver(false, 'Shield Integrity Depleted!');
      }
    }
  };

  const handleGameOver = async (won: boolean, reason: string) => {
    setIsPlaying(false);
    const durationSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    const config = DIFFICULTIES[difficulty];
    const attemptsUsed = config.attempts - (won ? attemptsLeft - 1 : 0);

    let recordedResult: any = null;

    if (user) {
      try {
        const res = await api.recordMatch({
          mode: 'classic',
          difficulty,
          won,
          attempts: attemptsUsed,
          maxAttempts: config.attempts,
          durationSeconds,
          secretNumber
        });
        onUpdateUser(res.user);
        recordedResult = res.matchResult;
      } catch (err) {
        console.error('Failed to record match:', err);
      }
    }

    onShowResultModal({
      won,
      title: won ? 'TARGET ELIMINATED' : 'MISSION FAILED',
      reason,
      secretNumber,
      attemptsUsed,
      maxAttempts: config.attempts,
      durationSeconds,
      difficulty,
      matchResult: recordedResult,
      onPlayAgain: () => startNewGame(difficulty, timeLimit)
    });
  };

  const config = DIFFICULTIES[difficulty];
  const lastFeedback = guessHistory[0];
  const suggestedMidpoint = Math.floor((currentMinBound + currentMaxBound) / 2);
  const remainingCandidates = Math.max(1, currentMaxBound - currentMinBound + 1);
  const totalSpan = config.max - config.min + 1;
  const eliminatedPercent = Math.min(100, Math.max(0, Math.round(((totalSpan - remainingCandidates) / totalSpan) * 100)));

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-6 animate-fade-in pb-20 lg:pb-8">
      {/* Top Header & Difficulty Selector */}
      <div className="game-card rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-xl border border-slate-800 bg-[#0d1322]/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Difficulty Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span>Difficulty:</span>
            </span>
            {(Object.keys(DIFFICULTIES) as GameDifficulty[]).map((key) => {
              const d = DIFFICULTIES[key];
              const isActive = difficulty === key;
              return (
                <button
                  key={key}
                  id={`btn-diff-${key}`}
                  onClick={() => startNewGame(key, timeLimit)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                    isActive
                      ? d.color + ' border shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                      : 'text-slate-400 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  {d.name} <span className="text-[11px] opacity-75 font-normal">({d.badge})</span>
                </button>
              );
            })}
          </div>

          {/* Timer & Keypad Toggles */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
              {[0, 30, 60].map((sec) => (
                <button
                  key={sec}
                  id={`btn-timer-${sec}`}
                  onClick={() => startNewGame(difficulty, sec)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeLimit === sec
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sec === 0 ? 'No Limit' : `${sec}s`}
                </button>
              ))}
            </div>

            {/* Keypad Toggle Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowKeypad(!showKeypad);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                showKeypad
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/25 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span className="hidden sm:inline">Keypad</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column (Main Board & Input) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Target Frame */}
          <div className="game-card rounded-3xl p-5 sm:p-7 text-center relative overflow-hidden bg-[#0d1322]/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
            {/* Top Status */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5 mb-4">
              {/* Attempt Shields */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400 mr-1">Attempts:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: config.attempts }).map((_, idx) => {
                    const isAvailable = idx < attemptsLeft;
                    return (
                      <Shield
                        key={idx}
                        className={`w-4 h-4 transition-all ${
                          isAvailable
                            ? 'text-cyan-400 fill-cyan-400/40 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                            : 'text-slate-800 fill-slate-900'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Countdown or Mode Tag */}
              {timeLimit > 0 ? (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${
                  timeRemaining <= 10
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40'
                }`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span>{timeRemaining}s Left</span>
                </div>
              ) : (
                <div className="text-xs font-semibold text-slate-400">
                  Untimed Mode
                </div>
              )}
            </div>

            {/* Active Range Header */}
            <div className="py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90 mb-1 flex items-center justify-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Target Range</span>
              </div>
              <div className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight my-2">
                {config.min.toLocaleString()} <span className="text-cyan-400 font-normal">→</span> {config.max.toLocaleString()}
              </div>

              {/* Real-time Bounds Visualizer */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs">
                <div className="flex items-center justify-between text-slate-300 mb-2 font-medium">
                  <span>Current Narrowed Range: <strong className="text-cyan-300 font-bold">[{currentMinBound} .. {currentMaxBound}]</strong></span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">{eliminatedPercent}% Eliminated</span>
                </div>
                {/* Visual Bounds Progress Line */}
                <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 shadow-sm"
                    style={{
                      marginLeft: `${((currentMinBound - config.min) / (config.max - config.min)) * 100}%`,
                      width: `${Math.max(4, ((currentMaxBound - currentMinBound + 1) / (config.max - config.min)) * 100)}%`
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Min: {config.min}</span>
                  <span className="text-amber-300 font-semibold">Suggested Midpoint: {suggestedMidpoint}</span>
                  <span>Max: {config.max}</span>
                </div>
              </div>
            </div>

            {/* Live Hot/Cold Proximity Radar Feedback */}
            {lastFeedback && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 animate-slide-up text-left">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-400">Last Guess: <strong className="text-white">{lastFeedback.guess.toLocaleString()}</strong></span>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                    lastFeedback.hotness === 'very_hot' ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40' :
                    lastFeedback.hotness === 'hot' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40' :
                    lastFeedback.hotness === 'warm' ? 'bg-yellow-950/40 text-yellow-300 border border-yellow-500/30' : 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {lastFeedback.comparison === 'high' ? 'Too High 🔼' : lastFeedback.comparison === 'low' ? 'Too Low 🔽' : 'Target Hit! 🎯'}
                  </span>
                </div>

                {/* Hot/Cold Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      lastFeedback.hotness === 'very_hot' ? 'bg-gradient-to-r from-orange-500 to-rose-500' :
                      lastFeedback.hotness === 'hot' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                      lastFeedback.hotness === 'warm' ? 'bg-gradient-to-r from-cyan-400 to-amber-300' :
                      'bg-slate-600'
                    }`}
                    style={{ width: `${Math.max(5, 100 - lastFeedback.percentageDistance)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs font-medium text-slate-200">
                  {lastFeedback.message}
                </div>
              </div>
            )}

            {/* Smart Hint Bar */}
            {currentHint && (
              <div className="mt-3.5 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{currentHint}</span>
              </div>
            )}
          </div>

          {/* Guess Input & Keypad */}
          <form onSubmit={handleGuessSubmit} className="space-y-3">
            <div className={`relative flex items-center ${shakeInput ? 'animate-shake' : ''}`}>
              <input
                ref={inputRef}
                id="input-solo-guess"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={config.min}
                max={config.max}
                disabled={!isPlaying}
                placeholder={`Enter guess (${config.min} – ${config.max})`}
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value)}
                className="w-full py-4 pl-4 sm:pl-5 pr-28 rounded-2xl bg-slate-900/90 border-2 border-slate-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white font-display text-xl sm:text-2xl font-bold placeholder-slate-600 outline-none transition-all shadow-lg"
              />
              <button
                id="btn-solo-submit-guess"
                type="submit"
                disabled={!isPlaying || !currentGuess}
                className="absolute right-2.5 py-2.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-md shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Guess</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Macro Preset Chips */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playRoboticBeep();
                  setCurrentGuess(String(suggestedMidpoint));
                }}
                className="py-2 px-1 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all text-center cursor-pointer active:scale-95"
              >
                <div className="text-[10px] text-cyan-400/80">½ Midpoint</div>
                <div className="font-display font-bold">{suggestedMidpoint.toLocaleString()}</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCurrentGuess(String(currentMinBound));
                }}
                className="py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all text-center cursor-pointer active:scale-95"
              >
                <div className="text-[10px] text-slate-400">Min Bound</div>
                <div className="font-display font-bold">{currentMinBound.toLocaleString()}</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCurrentGuess(String(currentMaxBound));
                }}
                className="py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all text-center cursor-pointer active:scale-95"
              >
                <div className="text-[10px] text-slate-400">Max Bound</div>
                <div className="font-display font-bold">{currentMaxBound.toLocaleString()}</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowKeypad(!showKeypad);
                }}
                className="py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-semibold transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
              >
                <div className="text-[10px] text-slate-400">On-Screen</div>
                <div className="flex items-center gap-1 font-display font-bold text-[11px]">
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{showKeypad ? 'Hide' : 'Keypad'}</span>
                </div>
              </button>
            </div>

            {/* Collapsible / Floating Keypad */}
            {showKeypad && (
              <div className="animate-slide-up pt-1">
                <CyberKeypad
                  value={currentGuess}
                  onChange={setCurrentGuess}
                  onSubmit={() => handleGuessSubmit()}
                  minRange={config.min}
                  maxRange={config.max}
                  currentMinBound={currentMinBound}
                  currentMaxBound={currentMaxBound}
                  disabled={!isPlaying}
                />
              </div>
            )}
          </form>
        </div>

        {/* Right Column (Guess History & Analysis) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Smart Strategy Advice Box */}
          <div className="game-card rounded-3xl p-4 sm:p-5 border border-slate-800 bg-[#0d1322]/80 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Smart Strategy Assistant</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {remainingCandidates === 1 
                ? `🎯 Range isolated! The only possible answer left is ${currentMinBound}.`
                : `The optimal binary midpoint is ${suggestedMidpoint}. Guessing this will cut the remaining possibilities by ${Math.ceil(remainingCandidates / 2)}.`}
            </p>
          </div>

          {/* Timeline Feed */}
          <div className="game-card rounded-3xl p-4 sm:p-5 flex flex-col min-h-[340px] border border-slate-800 bg-[#0d1322]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-display font-bold text-white tracking-wider uppercase">Guess History</h4>
              </div>
              <span className="text-xs font-bold text-cyan-400">
                {guessHistory.length} / {config.attempts} SHIELDS
              </span>
            </div>

            {guessHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono-tech">
                <HelpCircle className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
                <p className="text-xs">
                  AWAITING INITIAL VECTOR...<br />Enter a numeric guess to begin scan.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1">
                {guessHistory.map((item, index) => {
                  const isCorrect = item.comparison === 'correct';
                  return (
                    <div
                      key={item.timestamp}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 font-mono-tech ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : item.hotness === 'very_hot'
                          ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                          : item.hotness === 'hot'
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                          : item.hotness === 'warm'
                          ? 'bg-yellow-950/20 border-yellow-500/30 text-yellow-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold text-slate-500 w-4">
                          #{guessHistory.length - index}
                        </span>
                        <div>
                          <div className="font-['Orbitron'] font-extrabold text-sm text-white">
                            {item.guess.toLocaleString()}
                          </div>
                          <div className="text-[10px] opacity-80">
                            {item.distance === 0 ? 'Exact Match' : `${item.distance.toLocaleString()} away`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold uppercase">
                          {item.comparison === 'high' ? '🔼 HIGH' : item.comparison === 'low' ? '🔽 LOW' : '🎯 LOCK'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reset Button */}
            <button
              id="btn-solo-restart"
              onClick={() => startNewGame(difficulty, timeLimit)}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-mono-tech font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 touch-target"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RE-INITIALIZE TARGET</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
