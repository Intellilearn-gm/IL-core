import React, { useState } from 'react';
import { getSnapcardQuestions } from '@/lib/snapcard/SnapcardQuestions';
import { Button } from '@/components/ui/button';
import { CreditCard, UserPlus, Send, Copy, Sparkles } from 'lucide-react';
import { useAddress } from '@thirdweb-dev/react';
import { createSnapcard, sendSnapcardRequest } from '@/lib/snapcard/supabaseSnapcard';

export default function SnapcardCreate({ onCreated }: { onCreated?: (link: string) => void }) {
  const [questions] = useState(getSnapcardQuestions());
  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [snapcardId, setSnapcardId] = useState<string | null>(null);
  const [friend, setFriend] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const address = useAddress();

  const handleCreate = async () => {
    if (!address) {
      setError('Please connect your wallet to create a Snapcard.');
      return;
    }
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const snapcard = await createSnapcard(address, questions);
      const link_token = snapcard.link_token;
      setSnapcardId(snapcard.id);
      const realLink = window.location.origin + '/games/snapcard/' + link_token;
      setLink(realLink);
      onCreated?.(realLink);
    } catch (e: any) {
      setError(e.message || 'Failed to create Snapcard.');
    } finally {
      setCreating(false);
    }
  };

  const handleSendFriend = async () => {
    if (!snapcardId) {
      setError('Create a Snapcard first!');
      return;
    }
    if (!friend.trim()) {
      setError('Enter a username or wallet address.');
      return;
    }
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      let isWallet = friend.startsWith('0x') && friend.length > 10;
      await sendSnapcardRequest(snapcardId, isWallet ? friend : undefined, !isWallet ? friend : undefined);
      setSuccess('Snapcard sent to your friend!');
      setFriend('');
    } catch (e: any) {
      setError(e.message || 'Failed to send Snapcard.');
    } finally {
      setSending(false);
    }
  };

  const handleCopy = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  // Shorten link for display
  const getShortLink = (l: string) => {
    try {
      const url = new URL(l);
      return url.origin + '/.../' + l.split('/').pop();
    } catch {
      return l;
    }
  };

  return (
    <div className="relative bg-[#181825] rounded-3xl p-10 shadow-2xl max-w-2xl mx-auto mt-8 border border-[#FF6B8A]/60 overflow-hidden flex flex-col items-center animate-fade-in">
      {/* Animated sparkles and emoji */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[6rem] opacity-10 animate-spin-slow select-none pointer-events-none">✨</div>
      <div className="absolute top-8 right-8 text-[3rem] opacity-20 animate-bounce select-none pointer-events-none">🪩</div>
      <div className="absolute bottom-8 left-8 text-[4rem] opacity-10 animate-pulse select-none pointer-events-none">🎴</div>
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-2xl flex items-center justify-center shadow-2xl mb-3 animate-pop-in">
          <CreditCard className="w-10 h-10 text-white drop-shadow-lg" />
        </div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B8A] via-[#FFA45C] to-[#FFD166] drop-shadow-lg tracking-tight animate-fade-in">Create Your Snapcard</h2>
        <p className="text-[#FFD166] text-lg mt-2 font-medium animate-fade-in">Unleash the web3 slambook! <span className="text-[#FF6B8A]">Share</span> this with friends and collect spicy answers.</p>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="bg-white/95 rounded-xl p-4 border border-[#FF6B8A]/30 shadow-lg flex items-center gap-3 hover:scale-105 transition-all duration-300 animate-pop-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="text-2xl font-bold text-[#FF6B8A] drop-shadow">{i + 1}</span>
            <span className="text-[#232347] font-semibold text-base">{q.text}</span>
          </div>
        ))}
      </div>
      {error && <div className="bg-red-100 text-red-700 rounded-lg p-2 mb-2 text-sm font-semibold animate-shake">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 rounded-lg p-2 mb-2 text-sm font-semibold animate-fade-in">{success}</div>}
      {link ? (
        <div className="bg-white/95 rounded-xl p-4 border border-[#FF6B8A]/30 text-center mb-4 flex flex-col items-center gap-2 shadow-lg animate-fade-in">
          <div className="text-[#2E2B2B] font-bold mb-1 flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-[#FF6B8A] animate-pulse" />
            Your Snapcard Link
            <Sparkles className="w-5 h-5 text-[#FFA45C] animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2 w-full">
            <span className="text-xs break-all font-mono bg-[#FFE8D6] px-2 py-1 rounded-lg border border-[#FF6B8A]/30 max-w-[60vw] truncate" title={link}>{getShortLink(link)}</span>
            <Button onClick={handleCopy} size="icon" variant="outline" className="ml-1">
              <Copy className="w-4 h-4" />
            </Button>
            {copied && <span className="text-xs text-[#FF6B8A] font-semibold animate-fade-in">Copied!</span>}
          </div>
          <Button asChild size="sm" variant="outline" className="mt-2 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-bold border-0 shadow hover:scale-105 transition">
            <a href={`https://twitter.com/intent/tweet?text=Fill%20my%20Snapcard!%20${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer">Share on Twitter</a>
          </Button>
        </div>
      ) : (
        <Button onClick={handleCreate} disabled={creating} className="w-full mt-2 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-extrabold text-lg py-3 rounded-xl shadow-xl hover:scale-105 transition-all duration-300 animate-pop-in">
          {creating ? 'Creating...' : 'Create & Get Link'}
        </Button>
      )}
      {/* Share with Friend */}
      {link && (
        <div className="mt-8 bg-white/95 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 border border-[#FF6B8A]/20 w-full shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 w-full">
            <UserPlus className="w-6 h-6 text-[#FF6B8A]" />
            <input
              type="text"
              className="flex-1 min-w-0 rounded-lg border border-[#FF6B8A] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFA45C] text-base bg-white/80 placeholder:text-[#7D7A75] font-semibold"
              placeholder="Friend's username or wallet address"
              value={friend}
              onChange={e => setFriend(e.target.value)}
              disabled={sending}
              style={{ fontSize: '1rem' }}
            />
          </div>
          <Button onClick={handleSendFriend} disabled={sending || !friend.trim()} className="flex gap-2 items-center bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-extrabold px-8 py-3 rounded-xl shadow-xl hover:scale-105 transition text-base animate-pop-in">
            <Send className="w-5 h-5" />
            Send
          </Button>
        </div>
      )}
    </div>
  );
} 