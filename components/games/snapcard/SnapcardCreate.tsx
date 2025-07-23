import React, { useState } from 'react';
import { getSnapcardQuestions } from '@/lib/snapcard/SnapcardQuestions';
import { Button } from '@/components/ui/button';
import { CreditCard, UserPlus, Send, Copy } from 'lucide-react';
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
    <div className="bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6] rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto mt-8 border border-[#FF6B8A]/30 relative overflow-hidden">
      {/* Fun background emoji */}
      <div className="absolute -top-8 -left-8 text-[5rem] opacity-20 animate-spin-slow select-none pointer-events-none">🎉</div>
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-full flex items-center justify-center shadow-lg mb-2">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#2E2B2B]">Create Your Snapcard</h2>
        <p className="text-[#7D7A75] text-sm mt-1">Share this with friends to get spicy answers!</p>
      </div>
      <ol className="list-decimal pl-6 mb-6 space-y-2">
        {questions.map((q, i) => (
          <li key={q.id} className="text-[#2E2B2B] font-medium">{q.text}</li>
        ))}
      </ol>
      {error && <div className="bg-red-100 text-red-700 rounded-lg p-2 mb-2 text-sm">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 rounded-lg p-2 mb-2 text-sm">{success}</div>}
      {link ? (
        <div className="bg-white/80 rounded-lg p-4 border border-white/30 text-center mb-4 flex flex-col items-center gap-2">
          <div className="text-[#2E2B2B] font-semibold mb-1">Your Snapcard Link:</div>
          <div className="flex items-center justify-center gap-2 w-full">
            <span className="text-xs break-all font-mono bg-[#FFE8D6] px-2 py-1 rounded-lg border border-[#FF6B8A]/30 max-w-[60vw] truncate" title={link}>{getShortLink(link)}</span>
            <Button onClick={handleCopy} size="icon" variant="outline" className="ml-1">
              <Copy className="w-4 h-4" />
            </Button>
            {copied && <span className="text-xs text-[#FF6B8A] font-semibold animate-fade-in">Copied!</span>}
          </div>
          <Button asChild size="sm" variant="outline" className="mt-2">
            <a href={`https://twitter.com/intent/tweet?text=Fill%20my%20Snapcard!%20${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer">Share on Twitter</a>
          </Button>
        </div>
      ) : (
        <Button onClick={handleCreate} disabled={creating} className="w-full mt-2 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-semibold">
          {creating ? 'Creating...' : 'Create & Get Link'}
        </Button>
      )}
      {/* Share with Friend */}
      {link && (
        <div className="mt-6 bg-gradient-to-r from-[#FF6B8A]/10 to-[#FFA45C]/10 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 border border-[#FF6B8A]/20 w-full">
          <div className="flex items-center gap-2 w-full">
            <UserPlus className="w-5 h-5 text-[#FF6B8A]" />
            <input
              type="text"
              className="flex-1 min-w-0 rounded-lg border border-[#FF6B8A] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFA45C] text-base bg-white/80 placeholder:text-[#7D7A75]"
              placeholder="Friend's username or wallet address"
              value={friend}
              onChange={e => setFriend(e.target.value)}
              disabled={sending}
              style={{ fontSize: '1rem' }}
            />
          </div>
          <Button onClick={handleSendFriend} disabled={sending || !friend.trim()} className="flex gap-2 items-center bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-semibold px-6 py-3 rounded-lg shadow hover:scale-105 transition text-base">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      )}
    </div>
  );
} 