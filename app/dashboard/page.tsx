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

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6]">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#2E2B2B] font-medium">Verifying Session...</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const auth = useOCAuth(); // Get the whole object first

  // Redirect if auth is initialized and user is not authenticated
  useEffect(() => {
    if (auth && auth.isInitialized && !auth.authState.isAuthenticated) {
      redirect('/login');
    }
  }, [auth]);

  const address = useAddress();
  const { profile, loading, error: profileError } = useProfile(address || "");
  const [showStreak, setShowStreak] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (!address) {
      setShowSetup(false);
      return;
    }
    if (loading) return;
    if (profileError) {
      console.error("[DashboardPage] error loading profile:", profileError);
    }
    if (!profile) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [address, loading, profile, profileError]);

  // Main loading condition: Wait for the OCID SDK to be ready.
  if (!auth || !auth.isInitialized || !auth.authState.isAuthenticated) {
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

      {/* The onStreakClick prop was removed from ProfileSidebar, let's manage state here */}
      <StreakModal isOpen={showStreak} onClose={() => setShowStreak(false)} />
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