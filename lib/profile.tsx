// lib/profile.ts
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { supabase } from "./supabaseClient";
import ProfileSetupCard from "@/components/ProfileSetupCard";

interface Profile {
  wallet_address: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile(walletAddress: string) {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const address = useAddress();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchProfile = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setProfile(data);
        setShowProfileSetup(false);
      } else {
        setProfile(null);
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      setShowProfileSetup(false);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (address) {
      await fetchProfile(address);
    }
  }, [address, fetchProfile]);

  useEffect(() => {
    if (address && !isInitialized) {
      fetchProfile(address);
    } else if (!address) {
      setProfile(null);
      setShowProfileSetup(false);
      setIsInitialized(false);
    }
  }, [address, fetchProfile, isInitialized]);

  const handleProfileCreated = useCallback((newProfile: { username: string; avatar_url: string }) => {
    if (address) {
      setProfile({
        wallet_address: address,
        username: newProfile.username,
        avatar_url: newProfile.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setShowProfileSetup(false);
    }
  }, [address]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
      {address && showProfileSetup && (
        <ProfileSetupCard
          isOpen={showProfileSetup}
          walletAddress={address}
          onClose={() => setShowProfileSetup(false)}
          onProfileCreated={handleProfileCreated}
        />
      )}
    </ProfileContext.Provider>
  );
}
