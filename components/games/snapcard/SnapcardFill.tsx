import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function SnapcardFill({ questions, onSubmit, defaultName }: { questions: { id: string, text: string }[], onSubmit?: (answers: { [id: string]: string }) => void, defaultName?: string }) {
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (defaultName) {
      setAnswers((prev) => ({ ...prev, responder_name: defaultName }));
    }
  }, [defaultName]);

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (step < questions.length - 1) setStep(step + 1);
  };
  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onSubmit?.(answers);
    setSubmitting(false);
  };

  const allAnswered = questions.every(q => answers[q.id] && answers[q.id].trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-[#FFE8D6] to-[#FFF1CC] rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto mt-8 border border-[#FF6B8A]/30 overflow-hidden flex flex-col items-center">
      {/* Fun background emoji */}
      <div className="absolute -top-8 -right-8 text-[5rem] opacity-20 animate-bounce select-none pointer-events-none">🎈</div>
      <div className="absolute bottom-0 left-0 text-[3rem] opacity-10 animate-spin-slow select-none pointer-events-none">🃏</div>
      <h2 className="text-2xl font-bold text-[#2E2B2B] mb-6 flex items-center gap-2">Fill the Snapcard <span className="animate-wiggle">✨</span></h2>
      <div className="mb-6 w-full">
        <label className="block text-[#2E2B2B] font-semibold mb-2" htmlFor="responder_name">Your Username</label>
        <input
          id="responder_name"
          type="text"
          className="w-full rounded-lg border border-[#FF6B8A] px-4 py-3 bg-white/80 text-base text-[#7D7A75] font-semibold cursor-not-allowed opacity-80"
          value={answers['responder_name'] || ''}
          readOnly
          disabled
        />
      </div>
      {/* Progress Bar */}
      <div className="w-full mb-8">
        <div className="h-3 bg-[#FFE8D6] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-[#7D7A75] mt-1 text-right">{step + 1} / {questions.length}</div>
      </div>
      {/* Question Stepper */}
      <div className="w-full flex flex-col items-center mb-8">
        <div className="text-lg font-semibold text-[#2E2B2B] mb-4">{questions[step].text}</div>
        <input
          type="text"
          className="w-full rounded-lg border border-[#FF6B8A] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFA45C] text-base bg-white/80"
          value={answers[questions[step].id] || ''}
          onChange={e => handleChange(questions[step].id, e.target.value)}
          required
          placeholder="Type your answer..."
        />
      </div>
      <div className="flex justify-between w-full gap-4 mb-4">
        <Button type="button" onClick={handlePrev} disabled={step === 0} variant="outline" className="flex-1">Previous</Button>
        {step < questions.length - 1 ? (
          <Button type="button" onClick={handleNext} disabled={!answers[questions[step].id]} className="flex-1 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-semibold">Next</Button>
        ) : (
          <Button type="submit" disabled={!allAnswered || submitting} className="flex-1 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white font-semibold">{submitting ? 'Submitting...' : 'Submit Answers'}</Button>
        )}
      </div>
      {/* Show summary before submit if desired */}
    </form>
  );
} 