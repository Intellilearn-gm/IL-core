import React from 'react';

export default function SnapcardNotification({ message }: { message: string }) {
  return (
    <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in">
      <span role="img" aria-label="notification">🔔</span>
      <span className="font-semibold">{message}</span>
    </div>
  );
} 