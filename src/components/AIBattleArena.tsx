import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, AIDifficulty } from '../types';
import { sounds } from '../lib/soundEngine';
import { api } from '../lib/apiClient';
import { CyberKeypad } from './CyberKeypad';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Flame, 
  Cpu, 
  RotateCcw, 
  Zap, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Activity,
  Keyboard,
  Target
} from 'lucide-react';

interface AIBattleArenaProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onShowResultModal: (resultData: any) => void;
}

const AI_PROFILES: Record<AIDifficulty, { name: string; avatar: string; title: string; desc: string; color: string; bg: string }> = {
  easy: {
    name: 'GLITCH-BOT 0.1',
    avatar: '🤖',
    title: 'Randomized Neural Sandbox',
    desc: 'Makes scattered, stochastic approximations.',
    color: 'text-emerald-400 border-emerald-500/40',
    bg: 'bg-emerald-950/20'
  },
  medium: {
    name: 'CYBER SENTINEL V2',
    avatar: '⚡',
    title: 'Tactical Binary Engine',
    desc: 'Dynamic boundary narrowing with human-like variance.',
    color: 'text-cyan-400 border-cyan-500/40',
    bg: 'bg-cyan-950/20'
  },
  expert: {
    name: 'QUANTUM CORE 9000',
    avatar: '🔮',
    title: 'Optimal Mathematical AI',
    desc: 'Perfect binary halving with zero algorithmic entropy.',
    color: 'text-purple-400 border-purple-500/40',
    bg: 'bg-purple-950/20'
  }
};

export const AIBattleArena: React.FC<AIBattleArenaProps> = ({
  user,
  onUpdateUser,
  onShowResultModal
}) => {
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [minRange] = useState<number>(1);
  const [maxRange] = useState<number>(1000);
  const [secretNumber, setSecretNumber] = useState<number>(0);
  const [playerGuess, setPlayerGuess] = useState<string>('');
  const [playerAttempts, setPlayerAttempts] = useState<number>(0);
  const [aiAttempts, setAiAttempts] = useState<number>(0);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [battleLogs, setBattleLogs] = useState<Array<{ sender: 'player' | 'ai' | 'system'; text: string; hotness?: string; guess?: number }>>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);

  // Player & AI current tracking bounds
  const [playerMinBound, setPlayerMinBound] = useState<number>(1);
  const [playerMaxBound, setPlayerMaxBound] = useState<number>(1000);

  const aiMinBound = useRef<number>(1);
  const aiMaxBound = useRef<number>(1000);

  const startNewMatch = (diff: AIDifficulty = aiDifficulty) => {
    sounds.playRoboticBeep();
    const generated = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    setAiDifficulty(diff);
    setSecretNumber(generated);
    aiMinBound.current = minRange;
    aiMaxBound.current = maxRange;
    setPlayerMinBound(minRange);
    setPlayerMaxBound(maxRange);
    setPlayerGuess('');
    setPlayerAttempts(0);
    setAiAttempts(0);
    setTurn('player');
    setIsPlaying(true);
    setIsAiThinking(false);
    setStartTime(Date.now());
    setBattleLogs([
      {
        sender: 'system',
        text: `[SYSTEM_INIT]: Combat link established with ${AI_PROFILES[diff].name}. Range: ${minRange} – ${maxRange}. Initiate guess vector!`
      }
    ]);
  };

  useEffect(() => {
    startNewMatch('medium');
  }, []);

  // Handle Player Guess
  const handlePlayerSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isPlaying || turn !== 'player' || isAiThinking) return;

    const num = parseInt(playerGuess.replace(/,/g, ''), 10);
    if (isNaN(num) || num < minRange || num > maxRange) {
      sounds.playCold();
      return;
    }

    sounds.playGuess();
    const currentAttempts = playerAttempts + 1;
    setPlayerAttempts(currentAttempts);
    setPlayerGuess('');

    const distance = Math.abs(num - secretNumber);
    const totalRange = maxRange - minRange;
    const pct = (distance / totalRange) * 100;

    let comparison = '';
    if (num > secretNumber) {
      comparison = 'TOO HIGH (🔼)';
      setPlayerMaxBound((prev) => Math.min(prev, num - 1));
      aiMaxBound.current = Math.min(aiMaxBound.current, num - 1);
    } else if (num < secretNumber) {
      comparison = 'TOO LOW (🔽)';
      setPlayerMinBound((prev) => Math.max(prev, num + 1));
      aiMinBound.current = Math.max(aiMinBound.current, num + 1);
    } else {
      comparison = 'TARGET LOCKED (🎯)';
    }

    const logEntry = {
      sender: 'player' as const,
      guess: num,
      text: `Operative guessed ${num.toLocaleString()} — ${comparison}`
    };

    setBattleLogs(prev => [logEntry, ...prev]);

    if (num === secretNumber) {
      sounds.playCorrect();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      handleGameEnd(true, `You outsmarted ${AI_PROFILES[aiDifficulty].name} in ${currentAttempts} attempts!`);
      return;
    }

    // Hand over turn to AI
    setTurn('ai');
    setIsAiThinking(true);
    sounds.playDataProcess();

    // Trigger AI Guess after thinking delay
    setTimeout(async () => {
      await processAiTurn();
    }, 1200);
  };

  // Process AI Bot Turn
  const processAiTurn = async () => {
    if (!isPlaying) return;

    try {
      const aiRes = await api.getAIMove(
        aiDifficulty,
        aiMinBound.current,
        aiMaxBound.current,
        secretNumber
      );

      const aiGuessNum = aiRes.guess;
      const currentAiAttempts = aiAttempts + 1;
      setAiAttempts(currentAiAttempts);
      setIsAiThinking(false);

      let aiComparison = '';
      if (aiGuessNum > secretNumber) {
        aiComparison = 'TOO HIGH (🔼)';
        aiMaxBound.current = Math.min(aiMaxBound.current, aiGuessNum - 1);
        setPlayerMaxBound((prev) => Math.min(prev, aiGuessNum - 1));
      } else if (aiGuessNum < secretNumber) {
        aiComparison = 'TOO LOW (🔽)';
        aiMinBound.current = Math.max(aiMinBound.current, aiGuessNum + 1);
        setPlayerMinBound((prev) => Math.max(prev, aiGuessNum + 1));
      } else {
        aiComparison = 'TARGET LOCKED (🎯)';
      }

      sounds.playRoboticBeep();

      const aiLog = {
        sender: 'ai' as const,
        guess: aiGuessNum,
        text: `${AI_PROFILES[aiDifficulty].name} calculated ${aiGuessNum.toLocaleString()} — ${aiComparison} [Log: ${aiRes.reasoning}]`
      };

      setBattleLogs(prev => [aiLog, ...prev]);

      if (aiGuessNum === secretNumber) {
        sounds.playDefeat();
        handleGameEnd(false, `${AI_PROFILES[aiDifficulty].name} found the target first!`);
      } else {
        setTurn('player');
      }
    } catch (err) {
      console.error('AI Turn error:', err);
      // Fallback local AI
      const low = aiMinBound.current;
      const high = aiMaxBound.current;
      const fallbackGuess = Math.floor((low + high) / 2);
      setAiAttempts(prev => prev + 1);
      setIsAiThinking(false);

      if (fallbackGuess === secretNumber) {
        sounds.playDefeat();
        handleGameEnd(false, `${AI_PROFILES[aiDifficulty].name} solved it!`);
      } else {
        if (fallbackGuess > secretNumber) aiMaxBound.current = fallbackGuess - 1;
        else aiMinBound.current = fallbackGuess + 1;
        setTurn('player');
      }
    }
  };

  const handleGameEnd = async (won: boolean, reason: string) => {
    setIsPlaying(false);
    const durationSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));

    let recordedResult: any = null;
    if (user) {
      try {
        const res = await api.recordMatch({
          mode: 'ai_battle',
          difficulty: 'medium',
          aiDifficulty,
          won,
          attempts: playerAttempts,
          maxAttempts: 20,
          durationSeconds,
          secretNumber
        });
        onUpdateUser(res.user);
        recordedResult = res.matchResult;
      } catch (err) {
        console.error('Failed to record AI match:', err);
      }
    }

    onShowResultModal({
      won,
      title: won ? 'AI ALGORITHM CRACKED' : 'SYSTEM OVERRIDE BY AI',
      reason,
      secretNumber,
      attemptsUsed: playerAttempts,
      maxAttempts: 20,
      durationSeconds,
      difficulty: aiDifficulty,
      matchResult: recordedResult,
      onPlayAgain: () => startNewMatch(aiDifficulty)
    });
  };

  const currentAi = AI_PROFILES[aiDifficulty];
  const suggestedMidpoint = Math.floor((playerMinBound + playerMaxBound) / 2);

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-6 animate-fade-in pb-20 lg:pb-8">
      {/* Bot Selector Matrix */}
      <div className="hud-panel rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-mono-tech text-cyan-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>AI NEURAL OPPONENT:</span>
          </span>

          <div className="flex items-center gap-2">
            {(Object.keys(AI_PROFILES) as AIDifficulty[]).map((key) => {
              const bot = AI_PROFILES[key];
              const isActive = aiDifficulty === key;
              return (
                <button
                  key={key}
                  id={`btn-ai-diff-${key}`}
                  onClick={() => startNewMatch(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono-tech font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 bg-slate-950/60 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span className="text-sm">{bot.avatar}</span>
                  <span>{bot.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Duel Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Duel Status & Input */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Dual Combatants HUD Frame */}
          <div className="hud-panel hud-corners rounded-2xl p-4 sm:p-6 relative overflow-hidden">
            {/* Top Matchup Header */}
            <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-800 font-mono-tech">
              {/* Player Card */}
              <div className={`p-3 rounded-xl border transition-all ${
                turn === 'player'
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/15 ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{user?.avatar || '👤'}</span>
                  <div>
                    <div className="text-xs font-bold text-white uppercase">{user?.username || 'OPERATIVE'}</div>
                    <div className="text-[10px] text-cyan-400">{playerAttempts} Attempts Made</div>
                  </div>
                </div>
                {turn === 'player' && isPlaying && (
                  <span className="inline-block px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[9px] font-black uppercase">
                    YOUR TURN
                  </span>
                )}
              </div>

              {/* AI Card */}
              <div className={`p-3 rounded-xl border transition-all ${
                turn === 'ai'
                  ? 'bg-purple-950/40 border-purple-500/60 shadow-md shadow-purple-500/15 ring-1 ring-purple-500/40'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{currentAi.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-white uppercase">{currentAi.name}</div>
                    <div className="text-[10px] text-purple-400">{aiAttempts} Attempts Made</div>
                  </div>
                </div>
                {turn === 'ai' && isPlaying && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500 text-slate-950 text-[9px] font-black uppercase animate-pulse">
                    <Activity className="w-2.5 h-2.5 animate-spin" />
                    <span>AI COMPUTING...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Target Spectrum Info */}
            <div className="py-4 text-center">
              <div className="text-[11px] font-mono-tech text-cyan-400/80 font-bold uppercase tracking-wider mb-1">
                SHARED TARGET SPECTRUM
              </div>
              <div className="font-['Orbitron'] text-3xl sm:text-4xl font-black text-white">
                {minRange} <span className="text-cyan-400 font-normal">→</span> {maxRange}
              </div>

              {/* Shared Deducing Interval */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono-tech text-xs text-slate-400 flex items-center justify-between">
                <span>ACTIVE INTERVAL: <strong className="text-cyan-300">[{playerMinBound}..{playerMaxBound}]</strong></span>
                <span className="text-amber-300">SUGGESTED MID: {suggestedMidpoint}</span>
              </div>
            </div>

            {/* Input & Form */}
            <form onSubmit={handlePlayerSubmit} className="space-y-3 mt-2">
              <div className="relative flex items-center">
                <input
                  id="input-ai-guess"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={minRange}
                  max={maxRange}
                  disabled={!isPlaying || turn !== 'player' || isAiThinking}
                  placeholder={turn === 'player' ? `Enter guess (${playerMinBound}..${playerMaxBound})` : `Waiting for ${currentAi.name}...`}
                  value={playerGuess}
                  onChange={(e) => setPlayerGuess(e.target.value)}
                  className="w-full py-4 pl-4 sm:pl-5 pr-28 rounded-2xl bg-slate-900/90 border-2 border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white font-['Orbitron'] text-xl sm:text-2xl placeholder-slate-600 outline-none transition-all shadow-lg font-mono-tech"
                />
                <button
                  id="btn-ai-submit"
                  type="submit"
                  disabled={!isPlaying || turn !== 'player' || isAiThinking || !playerGuess}
                  className="absolute right-2.5 py-2.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-['Orbitron'] font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-1.5 touch-target"
                >
                  <span>STRIKE</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Macro Buttons */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  disabled={turn !== 'player' || isAiThinking}
                  onClick={() => {
                    sounds.playRoboticBeep();
                    setPlayerGuess(String(suggestedMidpoint));
                  }}
                  className="py-2 px-1 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-mono-tech text-xs font-bold transition-all text-center"
                >
                  <div className="text-[9px] text-cyan-400/70">½ MIDPOINT</div>
                  <div className="font-['Orbitron']">{suggestedMidpoint}</div>
                </button>

                <button
                  type="button"
                  disabled={turn !== 'player' || isAiThinking}
                  onClick={() => {
                    sounds.playClick();
                    setPlayerGuess(String(playerMinBound));
                  }}
                  className="py-2 px-1 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono-tech text-xs font-bold transition-all text-center"
                >
                  <div className="text-[9px] text-slate-500">LOWER</div>
                  <div className="font-['Orbitron']">{playerMinBound}</div>
                </button>

                <button
                  type="button"
                  disabled={turn !== 'player' || isAiThinking}
                  onClick={() => {
                    sounds.playClick();
                    setPlayerGuess(String(playerMaxBound));
                  }}
                  className="py-2 px-1 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono-tech text-xs font-bold transition-all text-center"
                >
                  <div className="text-[9px] text-slate-500">UPPER</div>
                  <div className="font-['Orbitron']">{playerMaxBound}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setShowKeypad(!showKeypad);
                  }}
                  className="py-2 px-1 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-mono-tech text-xs font-bold transition-all flex flex-col items-center justify-center"
                >
                  <div className="text-[9px] text-slate-400">TOUCH DIAL</div>
                  <div className="flex items-center gap-1 font-['Orbitron'] text-[11px]">
                    <Keyboard className="w-3 h-3" />
                    <span>{showKeypad ? 'HIDE' : 'SHOW'}</span>
                  </div>
                </button>
              </div>

              {/* On-Screen Cyber Keypad */}
              {showKeypad && (
                <div className="animate-slide-up pt-1">
                  <CyberKeypad
                    value={playerGuess}
                    onChange={setPlayerGuess}
                    onSubmit={() => handlePlayerSubmit()}
                    minRange={minRange}
                    maxRange={maxRange}
                    currentMinBound={playerMinBound}
                    currentMaxBound={playerMaxBound}
                    disabled={!isPlaying || turn !== 'player' || isAiThinking}
                  />
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Real-Time Battle Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="hud-panel rounded-2xl p-4 sm:p-5 flex flex-col min-h-[380px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 font-mono-tech">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white tracking-wider uppercase">COMBAT TELEMETRY STREAM</h4>
              </div>
              <span className="text-xs font-bold text-cyan-400">
                {playerAttempts + aiAttempts} TURNS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[320px] pr-1 font-mono-tech text-xs">
              {battleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    log.sender === 'player'
                      ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                      : log.sender === 'ai'
                      ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 text-[11px]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold uppercase text-[10px] tracking-wider opacity-75">
                      {log.sender === 'player' ? '👤 OPERATIVE' : log.sender === 'ai' ? `🤖 ${currentAi.name}` : '⚙️ SYS_BROADCAST'}
                    </span>
                    {log.guess !== undefined && (
                      <span className="font-['Orbitron'] font-extrabold text-white text-xs">
                        {log.guess.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed">{log.text}</p>
                </div>
              ))}
            </div>

            {/* Restart Match */}
            <button
              onClick={() => startNewMatch(aiDifficulty)}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-mono-tech font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 touch-target"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESTART AI DUEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
