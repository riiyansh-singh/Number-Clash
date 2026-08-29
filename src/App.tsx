import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { api } from './lib/apiClient';
import { sounds } from './lib/soundEngine';

// Components
import { BackgroundEffects } from './components/BackgroundEffects';
import { Navbar } from './components/Navbar';
import { RoboticStatusBar } from './components/RoboticStatusBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeHero } from './components/HomeHero';
import { SoloArena } from './components/SoloArena';
import { AIBattleArena } from './components/AIBattleArena';
import { ReverseModeArena } from './components/ReverseModeArena';
import { DailyChallengeArena } from './components/DailyChallengeArena';
import { MultiplayerArena } from './components/MultiplayerArena';
import { LeaderboardView } from './components/LeaderboardView';
import { CosmeticsShop } from './components/CosmeticsShop';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { GameResultModal } from './components/GameResultModal';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [resultModalData, setResultModalData] = useState<any>(null);
  const [multiplayerJoinCode, setMultiplayerJoinCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Load current session or guest profile on startup
    const initUser = async () => {
      try {
        const profile = await api.getProfile();
        setUser(profile);
      } catch (err) {
        // Auto-login as a guest for instant zero-friction play
        try {
          const guest = await api.guestLogin();
          setUser(guest.user);
        } catch (e) {
          console.warn('Guest login failed:', e);
        }
      }
    };

    initUser();
  }, []);

  const handleToggleSound = () => {
    const isNowMuted = sounds.toggleMute();
    setSoundMuted(isNowMuted);
  };

  const handleNavigate = (tab: string, extraData?: any) => {
    if (extraData?.joinCode) {
      setMultiplayerJoinCode(extraData.joinCode);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveTab('home');
  };

  const getModeTitle = () => {
    switch (activeTab) {
      case 'home': return 'TACTICAL_HUB';
      case 'solo': return 'SOLO_TARGET_LOCK';
      case 'ai': return 'AI_NEURAL_DUEL';
      case 'reverse': return 'REVERSE_MIND_SCAN';
      case 'daily': return 'DAILY_PROTOCOL';
      case 'multiplayer': return 'WAR_ROOM_CLASH';
      case 'leaderboard': return 'GLOBAL_RADAR';
      case 'shop': return 'CYBER_ARMORY';
      case 'profile': return 'OPERATIVE_DOSSIER';
      default: return 'SYS_ONLINE';
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 font-['Rajdhani'] relative overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Dynamic Cyber Particle & Grid Canvas */}
      <BackgroundEffects theme={user?.theme || 'neon'} />

      {/* Global Robotic Telemetry Status Bar */}
      <RoboticStatusBar modeName={getModeTitle()} />

      {/* Global Esports Header & Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigate(tab)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        muted={soundMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content View Switcher */}
      <main className="relative z-10 flex-1 pb-20 lg:pb-12">
        {activeTab === 'home' && (
          <HomeHero
            user={user}
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          />
        )}

        {activeTab === 'solo' && (
          <SoloArena
            user={user}
            onUpdateUser={setUser}
            onShowResultModal={setResultModalData}
          />
        )}

        {activeTab === 'ai' && (
          <AIBattleArena
            user={user}
            onUpdateUser={setUser}
            onShowResultModal={setResultModalData}
          />
        )}

        {activeTab === 'reverse' && (
          <ReverseModeArena
            user={user}
            onUpdateUser={setUser}
            onShowResultModal={setResultModalData}
          />
        )}

        {activeTab === 'daily' && (
          <DailyChallengeArena
            user={user}
            onUpdateUser={setUser}
            onShowResultModal={setResultModalData}
          />
        )}

        {activeTab === 'multiplayer' && (
          <MultiplayerArena
            user={user}
            initialJoinCode={multiplayerJoinCode}
            onUpdateUser={setUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onShowResultModal={setResultModalData}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView />
        )}

        {activeTab === 'shop' && (
          <CosmeticsShop
            user={user}
            onUpdateUser={setUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Dock (Visible on mobile/tablets < 1024px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigate(tab)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <GameResultModal
        data={resultModalData}
        onClose={() => setResultModalData(null)}
        onNavigateHome={() => handleNavigate('home')}
      />
    </div>
  );
}
