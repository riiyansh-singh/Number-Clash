import React from 'react';
import { sounds } from '../lib/soundEngine';
import { 
  Zap, 
  Gamepad2, 
  Flame, 
  Bot, 
  Trophy, 
  ShoppingBag,
  User,
  Users
} from 'lucide-react';
import { UserProfile } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth
}) => {
  const items = [
    { id: 'home', label: 'Home', icon: <Zap className="w-4 h-4 text-cyan-400" /> },
    { id: 'solo', label: 'Solo', icon: <Gamepad2 className="w-4 h-4 text-sky-400" /> },
    { id: 'multiplayer', label: 'Clash', icon: <Users className="w-4 h-4 text-orange-400" /> },
    { id: 'ai', label: 'vs AI', icon: <Bot className="w-4 h-4 text-purple-400" /> },
    { id: 'leaderboard', label: 'Rankings', icon: <Trophy className="w-4 h-4 text-yellow-400" /> },
    { id: 'shop', label: 'Armory', icon: <ShoppingBag className="w-4 h-4 text-pink-400" /> }
  ];

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d18]/95 border-t border-slate-800/80 backdrop-blur-xl px-2 py-1.5 pb-safe flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.7)]">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-dock-${item.id}`}
            onClick={() => {
              sounds.playClick();
              setActiveTab(item.id);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            <div className="relative">
              {item.icon}
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </div>
            <span className="text-[10px] font-display font-medium tracking-normal mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* User Profile / Login quick dock button */}
      <button
        onClick={() => {
          sounds.playClick();
          if (user) {
            setActiveTab('profile');
          } else {
            onOpenAuth();
          }
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'profile'
            ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30'
            : 'text-slate-400 active:scale-95'
        }`}
      >
        {user ? (
          <span className="text-sm leading-none">{user.avatar}</span>
        ) : (
          <User className="w-4 h-4 text-cyan-400" />
        )}
        <span className="text-[10px] font-display font-medium tracking-normal mt-0.5">
          {user ? 'Profile' : 'Sign In'}
        </span>
      </button>
    </div>
  );
};
