'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import WalletProtection from '@/components/WalletProtection';
import Image from 'next/image';
import { useAddress } from '@thirdweb-dev/react';
import SnapcardCreate from '@/components/games/snapcard/SnapcardCreate';
import SnapcardRequests from '@/components/games/snapcard/SnapcardRequests';
import SnapcardCompleted from '@/components/games/snapcard/SnapcardCompleted';
import SnapcardNotification from '@/components/games/snapcard/SnapcardNotification';
import { getUserSnapcards, getSnapRequests, getProfileByWallet } from '@/lib/snapcard/supabaseSnapcard';

const TABS = [
  { key: 'create', label: '✨ Create Snapcard' },
  { key: 'requests', label: '💌 Snap Requests' },
  { key: 'completed', label: '🎉 My Snapcards' },
];

export default function SnapcardPage() {
  const address = useAddress();
  const [tab, setTab] = useState('create');
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [filled, setFilled] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch requests and completed snapcards
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getSnapRequests(address),
      getUserSnapcards(address),
      getProfileByWallet(address),
    ])
      .then(([reqs, comps, profile]) => {
        setRequests(reqs || []);
        setCompleted(
          (comps || []).map((snap: any) => ({
            id: snap.id,
            link_token: snap.link_token,
            questions: snap.questions || [],
            recipient_username: '', // You can fill this if you have recipient info
            status: 'completed', // Assume completed for created
          }))
        );
        setFilled(
          (reqs || []).map((req: any) => ({
            id: req.snapcards?.id || req.id,
            link_token: req.snapcards?.link_token,
            questions: req.snapcards?.questions || [],
            responder_name: profile?.username || '',
            status: 'completed', // Assume completed for filled
          }))
        );
      })
      .catch((e) => setError(e.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <WalletProtection>
      <div className="relative min-h-screen bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6] overflow-hidden flex flex-col items-center justify-center">
        {/* Fun animated background elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Confetti */}
          {[...Array(24)].map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${1.5 + Math.random() * 2}rem`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '🃏', '✨', '🎈', '🥳', '💥', '💌', '🌈'][i % 8]}
            </div>
          ))}
          {/* Large gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-to-br from-[#FF6B8A]/30 to-[#FFA45C]/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-[#FFD166]/40 to-[#FF6B8A]/40 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-[#FFA45C]/20 to-[#FFD166]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        {/* Enhanced Header */}
        <header className="relative z-10 backdrop-blur-xl bg-white/30 border-b border-white/40 px-6 py-4 shadow-2xl rounded-b-3xl w-full flex flex-col items-center">
          <div className="max-w-4xl w-full flex flex-col md:flex-row justify-between items-center mx-auto gap-4">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                asChild
                className="bg-white/30 border-white/40 text-[#2E2B2B] hover:bg-white/40 rounded-lg backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image 
                    src="/favicon-32x32.png" 
                    alt="IntelliLearn Logo" 
                    width={40} 
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <h1 className="text-3xl font-extrabold text-[#2E2B2B] tracking-tight drop-shadow-lg">Snapcard</h1>
              </div>
            </div>
            <Button
              size="sm"
              asChild
              className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] hover:from-[#FF3D4A] hover:to-[#FF6B8A] text-white border-0 rounded-lg px-6 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              <Link href="/dashboard">
                <X className="w-4 h-4 mr-2" />
                Quit Game
              </Link>
            </Button>
          </div>
          <div className="mt-4 text-center w-full">
            <p className="text-lg md:text-xl text-[#7D7A75] font-medium animate-fade-in">Welcome to <span className="font-bold text-[#FF6B8A]">Snapcard</span> — the most fun way to collect spicy answers from your friends! <span className="animate-bounce inline-block">🎈</span></p>
          </div>
        </header>
        <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-2xl mt-8 bg-white/90 rounded-3xl shadow-2xl p-6 md:p-10 border border-[#FF6B8A]/20 animate-fade-in flex flex-col items-center">
            <div className="flex justify-center gap-4 mb-8 w-full">
              {TABS.map((t) => (
                <Button
                  key={t.key}
                  variant={tab === t.key ? 'default' : 'outline'}
                  className={
                    tab === t.key
                      ? 'bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white scale-110 shadow-xl animate-tab-pop'
                      : 'hover:scale-105'
                  }
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
            {notification && (
              <SnapcardNotification message={notification} />
            )}
            {error && (
              <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-4 font-semibold text-center">{error}</div>
            )}
            {loading ? (
              <div className="text-center text-[#7D7A75] py-12 text-xl font-bold animate-pulse">Loading Snapcard magic...</div>
            ) : (
              <div className="transition-all duration-700 ease-in-out w-full animate-fade-in">
                {tab === 'create' && (
                  <SnapcardCreate onCreated={() => setNotification('Snapcard created and link copied! 🚀')} />
                )}
                {tab === 'requests' && (
                  <SnapcardRequests requests={requests} />
                )}
                {tab === 'completed' && (
                  <SnapcardCompleted completed={completed} filled={filled} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </WalletProtection>
  );
} 