import React from 'react';
import { UserProfile } from '../types';
import { sounds } from '../lib/soundEngine';
import { 
  Gamepad2, 
  Trophy, 
  User, 
  ShoppingBag, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Coins, 
  Flame,
  Bot,
  Zap,
  RotateCcw,
  Calendar,
  LogIn,
  Users
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenHowToPlay: () => void;
  muted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenHowToPlay,
  muted,
  onToggleSound
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: <Zap className="w-4 h-4 text-cyan-400" /> },
    { id: 'solo', label: 'Solo Practice', icon: <Gamepad2 className="w-4 h-4 text-sky-400" /> },
    { id: 'multiplayer', label: 'Multiplayer', icon: <Users className="w-4 h-4 text-orange-400" /> },
    { id: 'ai', label: 'vs AI Bot', icon: <Bot className="w-4 h-4 text-purple-400" /> },
    { id: 'reverse', label: 'Reverse Scan', icon: <RotateCcw className="w-4 h-4 text-indigo-400" /> },
    { id: 'daily', label: 'Daily Puzzle', icon: <Calendar className="w-4 h-4 text-emerald-400" /> },
    { id: 'leaderboard', label: 'Rankings', icon: <Trophy className="w-4 h-4 text-yellow-400" /> },
    { id: 'shop', label: 'Armory', icon: <ShoppingBag className="w-4 h-4 text-pink-400" /> }
  ];

  return (
    <header className="relative z-30 w-full border-b border-slate-800/80 bg-[#090d18]/90 backdrop-blur-xl sticky top-0 px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo with App Icon */}
        <button
          id="btn-nav-brand"
          onClick={() => {
            sounds.playClick();
            setActiveTab('home');
          }}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all border border-cyan-400/30 shrink-0 bg-slate-900">
            <img 
              src="/app-icon.jpg" 
              alt="Number Clash Icon" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 text-sm sm:text-base tracking-tight leading-tight">
              Number Clash
            </div>
            <div className="text-[11px] text-cyan-400 font-medium tracking-wide">
              Multiplayer Battle Arena
            </div>
          </div>
        </button>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-normal transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Virtual Coins, Audio Toggle, Guide, User Profile */}
        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleSound}
            title={muted ? 'Enable Sound Effects' : 'Mute Sound Effects'}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition-colors focus:outline-none touch-target flex items-center justify-center"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* How To Play */}
          <button
            id="btn-nav-help"
            onClick={() => {
              sounds.playClick();
              onOpenHowToPlay();
            }}
            title="Game Rules & Guide"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition-colors focus:outline-none touch-target flex items-center justify-center"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Credits / Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Virtual Coins */}
              <div 
                id="user-coins-display"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('shop');
                }}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all touch-target"
                title="Virtual Coins - Armory"
              >
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{user.coins.toLocaleString()}</span>
              </div>

              {/* Profile Card Button */}
              <button
                id="btn-nav-profile"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('profile');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  activeTab === 'profile'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
              >
                <span className="text-base leading-none">{user.avatar}</span>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight max-w-[90px] truncate">{user.username}</span>
                  <span className="text-[10px] text-cyan-400 leading-none">Lv. {user.level} • {user.rank}</span>
                </div>
              </button>
            </div>
          ) : (
            <button
              id="btn-nav-login"
              onClick={() => {
                sounds.playClick();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs shadow-md shadow-cyan-500/25 transition-all touch-target"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
