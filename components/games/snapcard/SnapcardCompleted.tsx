import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getSnapcardResponses } from '@/lib/snapcard/supabaseSnapcard';

interface SnapcardCompletedItem {
  id: string;
  link_token: string;
  questions: { id: string; text: string }[];
  recipient_username?: string;
  responder_name?: string;
  status?: string;
}

export default function SnapcardCompleted({ completed = [], filled = [] }: { completed: SnapcardCompletedItem[], filled?: SnapcardCompletedItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{ id: string; text: string }[]>([]);
  const [tab, setTab] = useState<'created' | 'filled'>('created');

  const handleViewResponses = async (snap: SnapcardCompletedItem) => {
    setOpenId(snap.id);
    setQuestions(snap.questions);
    setLoading(true);
    setError(null);
    try {
      const res = await getSnapcardResponses(snap.id);
      setResponses(res || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6] rounded-2xl p-8 shadow-2xl max-w-3xl mx-auto mt-8 border border-[#FF6B8A]/30">
      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={tab === 'created' ? 'default' : 'outline'}
          className={tab === 'created' ? 'bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white scale-105 shadow-lg' : 'hover:scale-105'}
          onClick={() => setTab('created')}
        >
          Snapcards You Created
        </Button>
        <Button
          variant={tab === 'filled' ? 'default' : 'outline'}
          className={tab === 'filled' ? 'bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white scale-105 shadow-lg' : 'hover:scale-105'}
          onClick={() => setTab('filled')}
        >
          Snapcards You Filled
        </Button>
      </div>
      <ul className="space-y-6">
        {(tab === 'created' ? completed : filled)?.length === 0 ? (
          <li className="text-[#7D7A75] text-center">No Snapcards in this section yet.</li>
        ) : (
          (tab === 'created' ? completed : filled).map((snap) => (
            <li key={snap.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white/90 rounded-xl p-6 border border-white/30 shadow-md gap-4">
              <div className="flex-1">
                <div className="text-lg font-semibold text-[#2E2B2B] mb-1">Snapcard ID: <span className="font-mono">{snap.id.slice(0, 8)}...</span></div>
                {tab === 'created' ? (
                  <div className="text-sm text-[#7D7A75] mb-1">Sent to: <span className="font-bold text-[#FF6B8A]">{snap.recipient_username || '—'}</span></div>
                ) : (
                  <div className="text-sm text-[#7D7A75] mb-1">Sent by: <span className="font-bold text-[#FF6B8A]">{snap.responder_name || '—'}</span></div>
                )}
                <div className="text-xs text-[#7D7A75] mb-2">Status: <span className={snap.status === 'completed' ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>{snap.status === 'completed' ? 'Completed' : 'Pending'}</span></div>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-semibold px-6 py-2 rounded-lg shadow hover:scale-105 transition"
                onClick={() => handleViewResponses(snap)}
              >
                View {tab === 'created' ? 'Responses' : 'Snapcard'}
              </Button>
            </li>
          ))
        )}
      </ul>
      {/* Modal for responses */}
      {openId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative border border-[#FF6B8A]/30">
            <button
              className="absolute top-4 right-4 text-[#FF6B8A] text-2xl font-bold hover:scale-110 transition"
              onClick={() => setOpenId(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-[#2E2B2B] mb-4">Responses</h3>
            {loading ? (
              <div className="text-[#7D7A75] py-8 text-center">Loading...</div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-4">{error}</div>
            ) : responses.length === 0 ? (
              <div className="text-[#7D7A75] py-8 text-center">No responses yet.</div>
            ) : (
              <ul className="space-y-6 max-h-[60vh] overflow-y-auto">
                {responses.map((resp) => (
                  <li key={resp.id} className="bg-[#FFE8D6] rounded-lg p-4 border border-[#FF6B8A]/20">
                    <div className="font-semibold text-[#FF6B8A] mb-2">{resp.responder_name || 'Anonymous'}</div>
                    <ol className="list-decimal pl-6 space-y-1">
                      {questions.map((q) => {
                        const answerObj = resp.answers.find((a: any) => a.question_id === q.id);
                        return (
                          <li key={q.id} className="text-[#2E2B2B]">
                            <span className="font-medium">{q.text}</span>
                            <div className="ml-2 text-[#7D7A75]">{answerObj ? answerObj.answer : <span className="italic">No answer</span>}</div>
                          </li>
                        );
                      })}
                    </ol>
                    <div className="text-xs text-[#7D7A75] mt-2">{new Date(resp.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 