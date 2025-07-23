import React, { useEffect } from 'react';

export default function SnapcardNotification({ message, onClose }: { message: string, onClose?: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose?.();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in">
      <span role="img" aria-label="notification">🔔</span>
      <span className="font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white text-lg font-bold bg-transparent border-0 hover:scale-110 transition"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
} 