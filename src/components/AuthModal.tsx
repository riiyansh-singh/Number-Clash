import React, { useState } from 'react';
import { api } from '../lib/apiClient';
import { sounds } from '../lib/soundEngine';
import { UserProfile } from '../types';
import { X, LogIn, UserPlus, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sounds.playClick();

    try {
      if (mode === 'register') {
        if (!username || !password) throw new Error('Please fill in username and password');
        const res = await api.register(username, email, password);
        sounds.playCorrect();
        onSuccess(res.user);
        onClose();
      } else if (mode === 'login') {
        if (!username || !password) throw new Error('Please enter your credentials');
        const res = await api.login(username, password);
        sounds.playCorrect();
        onSuccess(res.user);
        onClose();
      } else if (mode === 'guest') {
        const res = await api.guestLogin(username);
        sounds.playCorrect();
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      sounds.playDefeat();
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0c1220] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          id="btn-close-auth"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Icon */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl shadow-cyan-500/25 border-2 border-cyan-400/30 mx-auto mb-3.5 bg-slate-900">
            <img 
              src="/app-icon.jpg" 
              alt="Number Clash" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Instant Guest Play'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
            {mode === 'login'
              ? 'Sign in to save your ranking, ratings, and unlocked cosmetics'
              : mode === 'register'
              ? 'Join the community, compete globally, and unlock achievements'
              : 'Jump straight into live games without needing an account'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 mb-5">
          <button
            id="tab-auth-login"
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode('login');
              setError(null);
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Login
          </button>
          <button
            id="tab-auth-register"
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode('register');
              setError(null);
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
          <button
            id="tab-auth-guest"
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode('guest');
              setError(null);
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'guest' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Guest
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
              {mode === 'guest' ? 'Display Name (Optional)' : 'Username'}
            </label>
            <input
              id="input-auth-username"
              type="text"
              required={mode !== 'guest'}
              placeholder={mode === 'guest' ? 'e.g. MasterGuesser' : 'Enter your username'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-400 text-slate-100 text-sm placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                Email (Optional)
              </label>
              <input
                id="input-auth-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-400 text-slate-100 text-sm placeholder-slate-500 outline-none transition-all"
              />
            </div>
          )}

          {mode !== 'guest' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                id="input-auth-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-400 text-slate-100 text-sm placeholder-slate-500 outline-none transition-all"
              />
            </div>
          )}

          <button
            id="btn-submit-auth"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-sm tracking-wide uppercase shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Arena</span>
              </>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Arena Account</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Play as Guest</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
