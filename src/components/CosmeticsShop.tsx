import React, { useState } from 'react';
import { UserProfile, CosmeticItem } from '../types';
import { COSMETICS_LIST } from '../data/cosmeticsData';
import { api } from '../lib/apiClient';
import { sounds } from '../lib/soundEngine';
import { 
  ShoppingBag, 
  Coins, 
  Sparkles, 
  Check, 
  Lock, 
  ShieldCheck, 
  Palette, 
  User, 
  Award,
  AlertCircle
} from 'lucide-react';

interface CosmeticsShopProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onOpenAuth: () => void;
}

export const CosmeticsShop: React.FC<CosmeticsShopProps> = ({
  user,
  onUpdateUser,
  onOpenAuth
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'avatar' | 'frame' | 'title' | 'theme'>('all');
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredItems = activeCategory === 'all'
    ? COSMETICS_LIST
    : COSMETICS_LIST.filter(item => item.type === activeCategory);

  const handleBuyOrEquip = async (item: CosmeticItem) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    sounds.playClick();
    setErrorMsg(null);
    setLoadingItemId(item.id);

    try {
      const res = await api.buyCosmetic(item.id);
      sounds.playCorrect();
      onUpdateUser(res.user);
    } catch (err: any) {
      sounds.playDefeat();
      setErrorMsg(err.message || 'Transaction failed');
      setTimeout(() => setErrorMsg(null), 3500);
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#18091e] to-slate-900 border border-pink-500/30 shadow-xl mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-['Rajdhani'] font-bold uppercase tracking-widest mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
            <span>CYBER ARSENAL BAZAAR</span>
          </div>
          <h2 className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white">
            COSMETICS & SKINS
          </h2>
          <p className="text-xs text-slate-400 font-['Rajdhani'] font-medium mt-1">
            Spend coins earned in matches to unlock exclusive avatars, glow frames, and player titles.
          </p>
        </div>

        {user ? (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-md">
            <Coins className="w-6 h-6 text-amber-400 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] text-amber-300/80 font-['Rajdhani'] font-bold uppercase">AVAILABLE BALANCE</div>
              <div className="font-['Orbitron'] text-xl font-black text-amber-300">{user.coins.toLocaleString()} COINS</div>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-['Orbitron'] font-bold text-xs uppercase"
          >
            Login to Shop
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 mb-6 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-['Rajdhani'] font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
        {[
          { id: 'all', label: 'All Items', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'avatar', label: 'Avatars', icon: <User className="w-3.5 h-3.5" /> },
          { id: 'frame', label: 'Frames', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { id: 'title', label: 'Titles', icon: <Award className="w-3.5 h-3.5" /> },
          { id: 'theme', label: 'Themes', icon: <Palette className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playClick();
              setActiveCategory(tab.id as any);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-['Rajdhani'] font-bold whitespace-nowrap transition-all ${
              activeCategory === tab.id
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Cosmetics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isUnlocked = user?.unlockedCosmetics?.includes(item.id) || item.price === 0;
          const isEquipped = 
            (item.type === 'avatar' && user?.avatar === item.previewValue) ||
            (item.type === 'frame' && user?.frame === item.id) ||
            (item.type === 'title' && user?.title === item.name) ||
            (item.type === 'theme' && user?.theme === item.id);

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isEquipped
                  ? 'bg-pink-950/20 border-pink-500/50 shadow-lg shadow-pink-500/10'
                  : isUnlocked
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-slate-900/50 border-slate-800/80'
              }`}
            >
              <div>
                {/* Preview Box */}
                <div className="h-20 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center text-3xl mb-3 relative overflow-hidden">
                  <span>{item.previewValue}</span>
                  {isEquipped && (
                    <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-pink-500 text-slate-950 font-['Orbitron'] font-black text-[9px] uppercase">
                      EQUIPPED
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-['Orbitron'] text-xs font-bold text-white truncate">{item.name}</span>
                  <span className={`text-[9px] font-['Orbitron'] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                    item.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    item.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                    item.rarity === 'rare' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {item.rarity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-['Rajdhani'] leading-tight mb-3">{item.description}</p>
              </div>

              <div>
                {isEquipped ? (
                  <div className="py-2 text-center text-xs font-['Rajdhani'] font-bold text-pink-400 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Currently Active</span>
                  </div>
                ) : isUnlocked ? (
                  <button
                    onClick={() => handleBuyOrEquip(item)}
                    disabled={loadingItemId === item.id}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-['Rajdhani'] font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Equip Item
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyOrEquip(item)}
                    disabled={loadingItemId === item.id || (user !== null && user.coins < item.price)}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-['Orbitron'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>{item.price === 0 ? 'FREE' : `${item.price.toLocaleString()} COINS`}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
