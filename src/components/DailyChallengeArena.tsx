import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, DailyChallengeData } from '../types';
import { api } from '../lib/apiClient';
import { sounds } from '../lib/soundEngine';
import { 
  Calendar, 
  Trophy, 
  Send, 
  Sparkles, 
  Flame, 
  Clock, 
  Shield, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

interface DailyChallengeArenaProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onShowResultModal: (resultData: any) => void;
}

export const DailyChallengeArena: React.FC<DailyChallengeArenaProps> = ({
  user,
  onUpdateUser,
  onShowResultModal
}) => {
  const [challengeData, setChallengeData] = useState<DailyChallengeData | null>(null);
  const [guess, setGuess] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(7);
  const [guessHistory, setGuessHistory] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [hasCompleted, setHasCompleted] = useState(false);
  const [secretNumber, setSecretNumber] = useState(0);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    try {
      const data = await api.getDailyChallenge();
      setChallengeData(data);
      // Generate daily seeded number consistently based on date string
      const dateHash = data.date.split('-').reduce((acc, part) => acc * 31 + parseInt(part, 10), 77);
      const secret = (Math.abs(dateHash * 48271) % (data.max - data.min + 1)) + data.min;
      setSecretNumber(secret);
      setAttemptsLeft(data.maxAttempts);
      setStartTime(Date.now());
    } catch (err) {
      console.error('Failed to load daily challenge:', err);
    }
  };

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying || !challengeData) return;

    const guessNum = parseInt(guess.replace(/,/g, ''), 10);
    if (isNaN(guessNum) || guessNum < challengeData.min || guessNum > challengeData.max) {
      sounds.playCold();
      return;
    }

    sounds.playGuess();
    const distance = Math.abs(guessNum - secretNumber);
    const comparison = guessNum === secretNumber ? 'correct' : guessNum > secretNumber ? 'high' : 'low';
    const totalRange = challengeData.max - challengeData.min;
    const pct = (distance / totalRange) * 100;
    const hotness = pct < 5 ? 'very_hot' : pct < 15 ? 'hot' : pct < 35 ? 'warm' : 'cold';

    const feedback = {
      guess: guessNum,
      comparison,
      distance,
      hotness,
      message: comparison === 'correct' ? '🎯 EXACT HIT!' : `${comparison === 'high' ? 'TOO HIGH' : 'TOO LOW'} (${distance.toLocaleString()} away)`
    };

    setGuessHistory([feedback, ...guessHistory]);
    setGuess('');

    if (comparison === 'correct') {
      sounds.playCorrect();
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      handleDailyEnd(true);
    } else {
      const rem = attemptsLeft - 1;
      setAttemptsLeft(rem);
      if (rem <= 0) {
        sounds.playDefeat();
        handleDailyEnd(false);
      } else {
        if (hotness === 'very_hot' || hotness === 'hot') sounds.playHot();
        else sounds.playCold();
      }
    }
  };

  const handleDailyEnd = async (won: boolean) => {
    setIsPlaying(false);
    setHasCompleted(true);
    const duration = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    const attemptsUsed = challengeData!.maxAttempts - (won ? attemptsLeft - 1 : 0);

    let matchResult: any = null;
    if (user) {
      try {
        const res = await api.recordMatch({
          mode: 'daily',
          difficulty: 'hard',
          won,
          attempts: attemptsUsed,
          maxAttempts: challengeData!.maxAttempts,
          durationSeconds: duration,
          secretNumber
        });
        onUpdateUser(res.user);
        matchResult = res.matchResult;
        loadChallenge();
      } catch (err) {
        console.error(err);
      }
    }

    onShowResultModal({
      won,
      title: won ? 'DAILY CHALLENGE CLEARED' : 'DAILY ATTEMPT FAILED',
      reason: won ? "You conquered today's quantum number!" : 'Better luck tomorrow!',
      secretNumber,
      attemptsUsed,
      maxAttempts: challengeData!.maxAttempts,
      durationSeconds: duration,
      difficulty: 'hard',
      matchResult,
      onPlayAgain: () => {}
    });
  };

  if (!challengeData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#071710] border border-emerald-500/40 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-['Rajdhani'] font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>DAILY QUANTUM TARGET • {challengeData.date}</span>
          </div>
          <h2 className="font-['Orbitron'] text-2xl sm:text-3xl font-extrabold text-white">
            {challengeData.title}
          </h2>
          <p className="text-xs text-slate-400 font-['Rajdhani'] font-medium mt-1">
            Every player on Earth receives this exact range and target today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30 text-center">
            <div className="text-[10px] text-slate-400 font-['Rajdhani'] uppercase">RANGE</div>
            <div className="font-['Orbitron'] text-sm font-bold text-emerald-400">1 – 10,000</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/30 text-center">
            <div className="text-[10px] text-slate-400 font-['Rajdhani'] uppercase">REWARD</div>
            <div className="font-['Orbitron'] text-sm font-bold text-amber-400">+250 COINS</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Play Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="flex items-center justify-between text-xs font-['Rajdhani'] font-bold text-slate-400 mb-4">
              <span>ATTEMPTS REMAINING: {attemptsLeft} / {challengeData.maxAttempts}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: challengeData.maxAttempts }).map((_, i) => (
                  <Shield
                    key={i}
                    className={`w-4 h-4 ${i < attemptsLeft ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-700 fill-slate-800'}`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleGuessSubmit} className="relative max-w-md mx-auto my-4">
              <input
                id="input-daily-guess"
                type="number"
                disabled={!isPlaying || hasCompleted}
                placeholder="Enter guess (1 – 10,000)"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="w-full py-4 pl-5 pr-24 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 focus:border-emerald-400 text-white font-['Orbitron'] text-xl placeholder-slate-600 outline-none"
              />
              <button
                type="submit"
                disabled={!isPlaying || !guess || hasCompleted}
                className="absolute right-2.5 top-2.5 bottom-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-['Orbitron'] font-bold text-xs uppercase"
              >
                SUBMIT
              </button>
            </form>

            {guessHistory.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                {guessHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-['Rajdhani'] font-bold flex items-center justify-between ${
                      item.comparison === 'correct' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>Guess: {item.guess.toLocaleString()}</span>
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily Leaderboard */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h4 className="font-['Orbitron'] text-xs font-bold text-white uppercase">TODAY'S BEST</h4>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {challengeData.leaderboard.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-['Rajdhani']">
                Be the first to clear today's challenge!
              </div>
            ) : (
              challengeData.leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-['Rajdhani']"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-['Orbitron'] font-bold text-amber-400 w-4">#{entry.rank}</span>
                    <span className="text-base">{entry.avatar}</span>
                    <span className="font-bold text-white truncate max-w-[90px]">{entry.username}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-['Orbitron'] font-bold text-cyan-400">{entry.score?.toLocaleString() || 0} PTS</div>
                    <div className="text-[10px] text-slate-500">{entry.attempts} tries</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
