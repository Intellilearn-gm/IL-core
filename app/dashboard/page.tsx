// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAddress } from "@thirdweb-dev/react";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import ProfileSidebar from "@/components/dashboard/profile-sidebar";
import MainContent from "@/components/dashboard/main-content";
import DashboardFooter from "@/components/dashboard/dashboard-footer";
import StreakModal from "@/components/modals/streak-modal";
import ProfileSetupCard from "@/components/ProfileSetupCard";

import { useProfile } from "@/lib/profile";

interface DashboardPageProps {
  onLogout: () => void;
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
  const address = useAddress();
  const { profile, loading, error: profileError } = useProfile(address || "");
  const [showStreak, setShowStreak] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Debug logs
  console.log("[DashboardPage] render →", {
    address,
    loading,
    profile,
    profileError,
    showSetup,
  });

  useEffect(() => {
    console.log("[DashboardPage] useEffect →", {
      address,
      loading,
      profile,
    });

    // 1) If wallet is *not* connected, hide the setup card
    if (!address) {
      console.log("[DashboardPage] wallet not connected → hiding setup");
      setShowSetup(false);
      return;
    }

    // 2) If we're still fetching the profile, do nothing (keep previous showSetup)
    if (loading) {
      console.log("[DashboardPage] still loading profile → waiting");
      return;
    }

    // 3) If there was an error fetching, log it but do *not* block the user
    if (profileError) {
      console.error("[DashboardPage] error loading profile:", profileError);
      // you might decide to show an alert/snackbar here instead
    }

    // 4) If no profile row exists, pop the setup card
    if (!profile) {
      console.log("[DashboardPage] no profile found → showing setup");
      setShowSetup(true);
    } else {
      // 5) Profile exists! hide it
      console.log("[DashboardPage] profile exists → hiding setup");
      setShowSetup(false);
    }
  }, [address, loading, profile, profileError]);

  const handleProfileCreated = () => {
    console.log("[DashboardPage] handleProfileCreated → closing setup");
    setShowSetup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6]">
      <DashboardHeader onLogout={onLogout} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ProfileSidebar onStreakClick={() => setShowStreak(true)} />
          <MainContent />
        </div>
      </div>

      <StreakModal isOpen={showStreak} onClose={() => setShowStreak(false)} />
      <DashboardFooter />

      {/* 
        This modal only opens when:
         - the user has connected their wallet (address != null)
         - AND we’ve finished loading AND found no profile
      */}
      <ProfileSetupCard
        isOpen={showSetup}
        walletAddress={address || ""}
        onClose={() => setShowSetup(false)}
        onProfileCreated={handleProfileCreated}
      />
    </div>
  );
}
