// components/games/dao-dungeon3d/Lobby.tsx
"use client";

import React from "react";
import styles from "./dao-dungeon-theme.module.css";

const VOTE_OPTIONS = [
  { label: "Double Enemies", value: "double-enemies" },
  { label: "Extra Traps", value: "extra-traps" },
  { label: "Bonus Shards", value: "bonus-shards" },
  { label: "Mystery Mode", value: "mystery" },
];

export function Lobby({ onVote }: { onVote: (mod: string) => void }) {
  return (
    <div className={`${styles.daoDungeonBg} flex flex-col items-center justify-center min-h-screen`}>
      <div className={`${styles.daoDungeonCard} p-8 shadow-xl`}>
        <h2 className={`${styles.daoDungeonTitle} text-2xl mb-4`}>Vote for a Modifier</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {VOTE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.daoDungeonSecondary} px-4 py-2 rounded-lg font-semibold transition-colors`}
              onClick={() => onVote(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className={styles.daoDungeonTextMuted}>Choose a challenge for this level!</p>
      </div>
    </div>
  );
}
