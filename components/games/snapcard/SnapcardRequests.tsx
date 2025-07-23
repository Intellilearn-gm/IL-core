import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SnapcardRequest {
  id: string;
  from?: string;
  link_token?: string;
  snapcards?: { link_token: string };
}

export default function SnapcardRequests({ requests = [] }: { requests: SnapcardRequest[] }) {
  return (
    <div className="bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6] rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto mt-8 border border-[#FF6B8A]/30">
      <h2 className="text-2xl font-bold text-[#2E2B2B] mb-6 flex items-center gap-2">Snap Requests <span className="animate-bounce">💌</span></h2>
      <ul className="space-y-4">
        {requests.length === 0 ? (
          <li className="text-[#7D7A75] text-center">No requests yet. Ask your friends to send you a Snapcard!</li>
        ) : (
          requests.map((req) => {
            // Support both direct and public requests
            const linkToken = req.link_token || req.snapcards?.link_token;
            return (
              <li key={req.id} className="flex items-center justify-between bg-white/90 rounded-xl p-4 border border-white/30 shadow-md">
                <div>
                  <div className="text-[#2E2B2B] font-semibold">From: {req.from || 'A friend'}</div>
                  <div className="text-xs text-[#7D7A75]">Snapcard ID: {req.id.slice(0, 8)}...</div>
                </div>
                {linkToken && (
                  <Button asChild size="sm" className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-semibold px-6 py-2 rounded-lg shadow hover:scale-105 transition">
                    <Link href={`/games/snapcard/${linkToken}`}>Fill</Link>
                  </Button>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
} 