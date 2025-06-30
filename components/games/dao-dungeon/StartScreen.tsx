"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import styles from "./dao-dungeon-theme.module.css";

const BALL_COLORS = [
  "#FF6B8A", // Sunrise Pink
  "#FFA45C", // Tangerine Glow
  "#FFD166", // Golden Ember
  "#FFE8D6", // Peach Whisper
  "#FFF1CC", // Apricot Mist
  "#FF3D4A", // Coral Spark
  "#D9809B", // Dusky Rose
  "#E5E1D8", // Sandstone Gray
  "#2E2B2B", // Charcoal Slate
  "#7D7A75", // Smoky Taupe
];

export function StartScreen({ onStart }: { onStart: (color: string) => void }) {
  const [selectedColor, setSelectedColor] = useState(BALL_COLORS[0]);

  return (
    <div className={`${styles.daoDungeonBg} flex flex-col items-center justify-center min-h-screen`}>
      <div className={`${styles.daoDungeonCard} p-8 shadow-xl max-w-lg w-full`}>
        <h1 className={`${styles.daoDungeonTitle} text-4xl mb-4`}>DAO Dungeon</h1>
        <p className={`${styles.daoDungeonTextMuted} mb-4`}>Welcome to the DAO Dungeon! Survive, collect shards, and conquer the boss.</p>
        <ul className="mb-4 text-[#2E2B2B] text-left list-disc pl-6">
          <li>There are <b>10 levels</b> of increasing difficulty.</li>
          <li>Each level may have a unique twist: speed boost, double loot, reverse controls, low gravity, and more.</li>
          <li>Collect <b>Soul Shards</b> by breaking crates and reaching the exit.</li>
          <li>After each level, see your stats and continue your story.</li>
          <li>Choose your ball color below before you start!</li>
        </ul>
        <div className="mb-6">
          <div className="mb-2 font-semibold">Pick your Ball Color:</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {BALL_COLORS.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? "border-[#FF6B8A] scale-110" : "border-gray-300"}`}
                style={{ background: color }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Pick color ${color}`}
              />
            ))}
          </div>
        </div>
        <button className={styles.daoDungeonButton} onClick={() => onStart(selectedColor)}>
          Start Game
        </button>
      </div>
    </div>
  );
}
