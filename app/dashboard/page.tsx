// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { redirect } from "next/navigation";
import { useAddress } from "@thirdweb-dev/react";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import ProfileSidebar from "@/components/dashboard/profile-sidebar";
import MainContent from "@/components/dashboard/main-content";
import DashboardFooter from "@/components/dashboard/dashboard-footer";
import StreakModal from "@/components/modals/streak-modal";
import ProfileSetupCard from "@/components/ProfileSetupCard";

import { useProfile } from "@/lib/profile";
import { useDailyActivity } from "@/hooks/useDailyActivity";

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFD166] via-[#FF6B8A] to-[#FFA45C] relative overflow-hidden">
    {/* Fun animated loader: spinning blockchain ring with bouncing coins */}
    <div className="relative mb-8">
      {/* Spinning ring */}
      <div className="w-32 h-32 border-8 border-dashed border-white/60 rounded-full animate-spin-slow mx-auto" style={{ borderTopColor: '#FF6B8A', borderBottomColor: '#FFD166', borderLeftColor: '#FFA45C', borderRightColor: '#fff' }} />
      {/* Bouncing coins */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4">
        <span className="block w-8 h-8 bg-yellow-300 rounded-full shadow-lg animate-bounce [animation-delay:0.1s] border-2 border-yellow-500 flex items-center justify-center text-xl">🪙</span>
        <span className="block w-8 h-8 bg-yellow-300 rounded-full shadow-lg animate-bounce [animation-delay:0.3s] border-2 border-yellow-500 flex items-center justify-center text-xl">🪙</span>
        <span className="block w-8 h-8 bg-yellow-300 rounded-full shadow-lg animate-bounce [animation-delay:0.5s] border-2 border-yellow-500 flex items-center justify-center text-xl">🪙</span>
      </div>
    </div>
    <h2 className="text-2xl font-bold text-white drop-shadow mb-2 tracking-wide animate-pulse">Verifying Session...</h2>
    <p className="text-lg text-white/80 mb-4">Checking your wallet and session on the blockchain.</p>
    <p className="text-sm text-white/60 italic">Hang tight, this will only take a moment! <span className="inline-block animate-spin">🔗</span></p>
    {/* Fun background sparkles */}
    <div className="pointer-events-none absolute inset-0 z-0">
      {[...Array(20)].map((_, i) => (
        <span key={i} className="absolute bg-white/30 rounded-full" style={{
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 8 + 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          filter: 'blur(1.5px)',
          animation: `floaty 3s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }} />
      ))}
      <style>{`
        @keyframes floaty {
          0% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(-20px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.7; }
        }
        .animate-spin-slow { animation: spin 2.5s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  </div>
);

export default function DashboardPage() {
  const auth = useOCAuth(); // Get the whole object first
  const address = useAddress();

  // Redirect if both OCID and wallet are unauthenticated
  useEffect(() => {
    if (auth && auth.isInitialized && !auth.authState.isAuthenticated && !address) {
      redirect('/login');
    }
  }, [auth, address]);

  const { profile, loading } = useProfile(address || "");
  const {
    streakData,
    currentStreak,
    totalGames,
    totalTokens,
    loading: streakLoading,
    error: streakError,
  } = useDailyActivity(address || undefined);
  const [showStreak, setShowStreak] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (!address) {
      setShowSetup(false);
      return;
    }
    if (loading) return;
    if (!profile) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [address, loading, profile]);

  // Main loading condition: Wait for the OCID SDK to be ready, unless wallet is connected.
  if (!auth || !auth.isInitialized || (!auth.authState.isAuthenticated && !address)) {
    return <LoadingScreen />;
  }

  const handleProfileCreated = () => {
    setShowSetup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6]">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ProfileSidebar />
          <MainContent />
        </div>
      </div>

      <StreakModal
        isOpen={showStreak}
        onClose={() => setShowStreak(false)}
        streakData={streakData}
        currentStreak={currentStreak}
        totalGames={totalGames}
        totalTokens={totalTokens}
        loading={streakLoading}
        error={streakError}
      />
      <DashboardFooter />

      <ProfileSetupCard
        isOpen={showSetup}
        walletAddress={address || ""}
        onClose={() => setShowSetup(false)}
        onProfileCreated={handleProfileCreated}
      />
    </div>
  );
}