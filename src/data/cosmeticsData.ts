import { QuickChatOption, CosmeticItem } from '../types';

export const QUICK_CHAT_OPTIONS: QuickChatOption[] = [
  { id: 'nice_guess', text: 'Nice guess!', emoji: '🔥', soundType: 'fire' },
  { id: 'close', text: 'Close!', emoji: '😂', soundType: 'laugh' },
  { id: 'watching', text: "I'm watching...", emoji: '👀', soundType: 'hype' },
  { id: 'cooked', text: "You're cooked.", emoji: '😈', soundType: 'taunt' },
  { id: 'gg', text: 'GG WP', emoji: '🤝', soundType: 'gg' },
  { id: 'cold', text: 'Too cold!', emoji: '🥶', soundType: 'cold' },
  { id: 'hot', text: 'HOT HOT!', emoji: '⚡', soundType: 'fire' },
  { id: 'easy', text: 'Easy peasy!', emoji: '🏆', soundType: 'taunt' }
];

export const COSMETICS_LIST: CosmeticItem[] = [
  // Avatars
  { id: 'avatar_default', name: 'Cyber Recruit', type: 'avatar', price: 0, previewValue: '👤', description: 'Standard operative helmet', rarity: 'common' },
  { id: 'avatar_ninja', name: 'Shadow Hacker', type: 'avatar', price: 300, previewValue: '🥷', description: 'Silent code infiltrator', rarity: 'rare' },
  { id: 'avatar_bot', name: 'Quantum Core', type: 'avatar', price: 500, previewValue: '🤖', description: 'Autonomous prediction android', rarity: 'rare' },
  { id: 'avatar_alien', name: 'Cosmic Entity', type: 'avatar', price: 800, previewValue: '👾', description: 'From a non-Euclidean dimension', rarity: 'epic' },
  { id: 'avatar_dragon', name: 'Inferno Drake', type: 'avatar', price: 1200, previewValue: '🐲', description: 'Legendary arithmetic beast', rarity: 'legendary' },
  { id: 'avatar_wizard', name: 'Binary Wizard', type: 'avatar', price: 1500, previewValue: '🧙‍♂️', description: 'Master of mathematical sorcery', rarity: 'legendary' },

  // Frames
  { id: 'frame_default', name: 'Clean Edge', type: 'frame', price: 0, previewValue: '▫️', description: 'Sleek standard carbon fiber border', rarity: 'common' },
  { id: 'frame_neon_cyan', name: 'Neon Pulse', type: 'frame', price: 400, previewValue: '🔷', description: 'Electric cyan luminescence', rarity: 'rare' },
  { id: 'frame_solar', name: 'Solar Flare', type: 'frame', price: 750, previewValue: '🔶', description: 'Radiating golden thermal plasma', rarity: 'epic' },
  { id: 'frame_void', name: 'Void Singularity', type: 'frame', price: 1100, previewValue: '🟣', description: 'Deep purple event horizon', rarity: 'legendary' },

  // Titles
  { id: 'title_initiate', name: 'The Initiate', type: 'title', price: 0, previewValue: '🏷️', description: 'Entering the number arena', rarity: 'common' },
  { id: 'title_sharp', name: 'Mind Hacker', type: 'title', price: 350, previewValue: '⚡', description: 'Calculates ranges with sharp instinct', rarity: 'rare' },
  { id: 'title_binary', name: 'Binary Prophet', type: 'title', price: 700, previewValue: '🔮', description: 'Always halves the interval flawlessly', rarity: 'epic' },
  { id: 'title_unstoppable', name: 'Unstoppable', type: 'title', price: 1500, previewValue: '🔥', description: 'Consecutive victory juggernaut', rarity: 'legendary' },

  // Themes
  { id: 'theme_neon', name: 'Neon Cyber Blue', type: 'theme', price: 0, previewValue: '🌊', description: 'Default cyan & indigo lighting', rarity: 'common' },
  { id: 'theme_matrix', name: 'Matrix Emerald', type: 'theme', price: 600, previewValue: '🟢', description: 'Green digital phosphor rain', rarity: 'rare' },
  { id: 'theme_midnight', name: 'Midnight Amethyst', type: 'theme', price: 600, previewValue: '🔮', description: 'Deep luxury violet glow', rarity: 'epic' }
];

export const THEME_CONFIGS: Record<string, { bg: string; accent: string; glow: string; cardBg: string; border: string }> = {
  neon: {
    bg: 'from-[#080d1a] via-[#090b12] to-[#04060a]',
    accent: 'text-cyan-400',
    glow: 'shadow-cyan-500/20 border-cyan-500/30',
    cardBg: 'bg-slate-900/60 backdrop-blur-md',
    border: 'border-cyan-500/30'
  },
  cyber: {
    bg: 'from-[#07130f] via-[#080b0f] to-[#030605]',
    accent: 'text-emerald-400',
    glow: 'shadow-emerald-500/20 border-emerald-500/30',
    cardBg: 'bg-slate-900/60 backdrop-blur-md',
    border: 'border-emerald-500/30'
  },
  midnight: {
    bg: 'from-[#12071f] via-[#090914] to-[#05030a]',
    accent: 'text-purple-400',
    glow: 'shadow-purple-500/20 border-purple-500/30',
    cardBg: 'bg-slate-900/60 backdrop-blur-md',
    border: 'border-purple-500/30'
  },
  matrix: {
    bg: 'from-[#031405] via-[#040804] to-[#010502]',
    accent: 'text-green-400',
    glow: 'shadow-green-500/25 border-green-500/40',
    cardBg: 'bg-emerald-950/40 backdrop-blur-md',
    border: 'border-green-500/40'
  },
  minimal: {
    bg: 'from-[#111318] via-[#0c0e12] to-[#07080a]',
    accent: 'text-slate-200',
    glow: 'shadow-white/10 border-slate-700',
    cardBg: 'bg-slate-900/70 backdrop-blur-md',
    border: 'border-slate-700'
  }
};
