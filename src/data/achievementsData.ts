import { AchievementDef } from '../types';

export const ACHIEVEMENTS_DATA: AchievementDef[] = [
  {
    id: 'sharpshooter',
    name: '🎯 Sharpshooter',
    tagline: 'Pure Telepathy',
    description: 'Guess correctly on your very first attempt.',
    icon: '🎯',
    rewardCoins: 500,
    rewardXp: 1000,
    category: 'special'
  },
  {
    id: 'mind_reader',
    name: '🧠 Mind Reader',
    tagline: 'Superhuman Logic',
    description: 'Win a match within 3 attempts or fewer.',
    icon: '🧠',
    rewardCoins: 250,
    rewardXp: 500,
    category: 'special'
  },
  {
    id: 'on_fire',
    name: '🔥 On Fire',
    tagline: 'Heating Up',
    description: 'Win 5 games consecutively without a defeat.',
    icon: '🔥',
    rewardCoins: 300,
    rewardXp: 600,
    category: 'streaks'
  },
  {
    id: 'unstoppable',
    name: '👑 Unstoppable',
    tagline: 'Arena Legend',
    description: 'Achieve a win streak of 10 matches.',
    icon: '👑',
    rewardCoins: 800,
    rewardXp: 1500,
    category: 'streaks'
  },
  {
    id: 'impossible',
    name: '💀 Impossible',
    tagline: 'One in a Million',
    description: 'Conquer the Insane difficulty (1 to 1,000,000 range).',
    icon: '💀',
    rewardCoins: 1000,
    rewardXp: 2000,
    category: 'difficulty'
  },
  {
    id: 'speed_demon',
    name: '⚡ Speed Demon',
    tagline: 'Lightning Reflexes',
    description: 'Win a match in under 10 seconds.',
    icon: '⚡',
    rewardCoins: 350,
    rewardXp: 700,
    category: 'speed'
  },
  {
    id: 'champion',
    name: '🏆 Champion',
    tagline: 'Elite Competitor',
    description: 'Climb to Gold rank (1,350+ ELO rating).',
    icon: '🏆',
    rewardCoins: 600,
    rewardXp: 1200,
    category: 'wins'
  },
  {
    id: 'reverse_wizard',
    name: '🧙‍♂️ Reverse Wizard',
    tagline: 'Mind Bender',
    description: 'Outsmart the AI in Reverse Mode.',
    icon: '🧙‍♂️',
    rewardCoins: 300,
    rewardXp: 500,
    category: 'special'
  },
  {
    id: 'daily_grinder',
    name: '📅 Daily Challenger',
    tagline: 'Consistent Mastery',
    description: 'Complete the daily quantum challenge.',
    icon: '📅',
    rewardCoins: 250,
    rewardXp: 400,
    category: 'special'
  },
  {
    id: 'cosmetic_collector',
    name: '💎 Style Icon',
    tagline: 'Dressed to Slay',
    description: 'Unlock 5 or more custom cosmetics.',
    icon: '💎',
    rewardCoins: 400,
    rewardXp: 800,
    category: 'special'
  }
];
