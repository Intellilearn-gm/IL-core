'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WalletProtection from '@/components/WalletProtection';
import { useAddress } from '@thirdweb-dev/react';
import SnapcardFill from '@/components/games/snapcard/SnapcardFill';
import SnapcardNotification from '@/components/games/snapcard/SnapcardNotification';
import { getSnapcardByToken, submitSnapcardResponse, getProfileByWallet } from '@/lib/snapcard/supabaseSnapcard';

export default function SnapcardFillPage() {
  const { snapcardId } = useParams();
  const router = useRouter();
  const address = useAddress();
  const [snapcard, setSnapcard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [defaultName, setDefaultName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!snapcardId) return;
    setLoading(true);
    setError(null);
    getSnapcardByToken(snapcardId as string)
      .then((data) => {
        setSnapcard(data);
      })
      .catch((e) => setError('Invalid or expired Snapcard link.'))
      .finally(() => setLoading(false));
  }, [snapcardId]);

  useEffect(() => {
    if (!address) return;
    getProfileByWallet(address)
      .then((profile) => {
        if (profile && profile.username) setDefaultName(profile.username);
      })
      .catch(() => {});
  }, [address]);

  useEffect(() => {
    if (submitted) {
      const timeout = setTimeout(() => {
        router.push('/games/snapcard');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [submitted, router]);

  const handleSubmit = async (answers: { [id: string]: string }) => {
    if (!snapcard || !address) return;
    setLoading(true);
    setError(null);
    try {
      const { responder_name, ...restAnswers } = answers;
      const answersArr = Object.entries(restAnswers).map(([question_id, answer]) => ({ question_id, answer }));
      await submitSnapcardResponse(snapcard.id, address, answersArr, responder_name);
      setSubmitted(true);
      setNotification('Snapcard submitted successfully!');
    } catch (e: any) {
      if (e.message && e.message.includes('duplicate key')) {
        setError('You have already filled this Snapcard.');
      } else {
        setError('Failed to submit Snapcard.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletProtection>
      <div className="relative min-h-screen bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Fun background emoji */}
        <div className="absolute top-8 left-8 text-[6rem] opacity-10 animate-spin-slow select-none pointer-events-none">🎉</div>
        <div className="absolute bottom-8 right-8 text-[4rem] opacity-10 animate-bounce select-none pointer-events-none">🃏</div>
        {notification && <SnapcardNotification message={notification} />}
        {loading ? (
          <div className="text-center text-[#7D7A75] py-12 text-lg font-medium">Loading Snapcard...</div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-4 text-lg font-medium">{error}</div>
        ) : submitted ? (
          <div className="flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#FF6B8A]/10 to-[#FFA45C]/10 rounded-2xl p-10 shadow-2xl animate-fade-in">
            <div className="text-5xl animate-bounce">🎉</div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#FF6B8A] text-center drop-shadow-lg">Thank you for filling the Snapcard!</div>
            <div className="text-[#7D7A75] text-lg text-center">Your answers have been submitted.<br />Redirecting you to Snapcard home...</div>
            <button
              onClick={() => router.push('/games/snapcard')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-bold rounded-xl shadow-lg hover:scale-105 transition text-lg"
            >
              Go to Snapcard Home
            </button>
          </div>
        ) : snapcard && snapcard.questions ? (
          <SnapcardFill questions={snapcard.questions} onSubmit={handleSubmit} defaultName={defaultName} />
        ) : null}
      </div>
    </WalletProtection>
  );
} 