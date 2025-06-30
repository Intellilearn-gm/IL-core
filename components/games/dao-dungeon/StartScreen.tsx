// components/games/dao-dungeon3d/StartScreen.tsx
"use client";

import React from "react";

export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
      <h1 className="text-4xl font-bold text-[#FF6B8A] mb-4">DAO Dungeon 3D</h1>
      <div className="text-[#FFF1CC] mb-6 max-w-md text-center space-y-2">
        <p>Use <strong>WASD</strong> or <strong>arrow keys</strong> to move your hero sphere.</p>
        <p>Navigate through obstacles, dodge bullets, and reach the glowing portal.</p>
        <p>Levels get harder: more obstacles, faster projectiles, and tighter mazes!</p>
      </div>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-[#FFA45C] hover:bg-[#FFD166] rounded-md text-[#2E2B2B] font-semibold shadow-lg"
      >
        Start Game
      </button>
    </div>
  );
}
