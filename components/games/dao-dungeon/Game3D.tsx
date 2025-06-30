"use client";

import React, { useState, useCallback } from "react";
import { StartScreen } from "./StartScreen";
import { Dungeon } from "./Dungeon";
import { BossRoom } from "./BossRoom";
import { generateLevel, MAX_LEVEL } from "./uselevel";
import { TimerHUD } from "./ui/TimerHUD";
import { InventoryHUD } from "./ui/InventoryHUD";
import styles from "./dao-dungeon-theme.module.css";

const TWISTS = [
  { label: "Speed Boost!", key: "speed" },
  { label: "Double Loot!", key: "double-loot" },
  { label: "Extra Traps!", key: "extra-traps" },
  { label: "Reverse Controls!", key: "reverse" },
  { label: "Low Gravity!", key: "low-gravity" },
  { label: "Invisible Enemies!", key: "invisible-enemies" },
  { label: "Fast Enemies!", key: "fast-enemies" },
  { label: "Extra Bullets!", key: "extra-bullets" },
];

function getRandomTwist(level: number) {
  if (level === 1) return null;
  return TWISTS[Math.floor(Math.random() * TWISTS.length)];
}

export default function Game3D({ onGameOver }: { onGameOver: (times: number[]) => void }) {
  const [phase, setPhase] = useState<"start" | "dungeon" | "level-complete" | "boss" | "game-complete" | "game-over">("start");
  const [level, setLevel] = useState(1);
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [shards, setShards] = useState(0);
  const [twist, setTwist] = useState<{ label: string; key: string } | null>(null);
  const [lastTime, setLastTime] = useState<number>(0);
  const [lastShards, setLastShards] = useState<number>(0);
  const [ballColor, setBallColor] = useState<string>("#FF6B8A");
  const [gameOver, setGameOver] = useState(false);
  const [gameVersion] = useState("v1.2.0");

  const cfg = generateLevel(level);

  const startRun = (color: string) => {
    setBallColor(color);
    const t = getRandomTwist(level);
    setTwist(t);
    setPhase("dungeon");
    setStartTime(Date.now());
  };

  const finishLevel = useCallback(() => {
    const elapsed = Date.now() - startTime;
    setTimes((arr) => [...arr, elapsed]);
    const gained = Math.floor(Math.random() * 3 + 1) * (twist?.key === "double-loot" ? 2 : 1);
    setShards((s) => s + gained);
    setLastTime(elapsed);
    setLastShards(gained);
    setPhase("level-complete");
  }, [startTime, twist]);

  const nextLevel = () => {
    if (level >= MAX_LEVEL) {
      setPhase("game-complete");
      onGameOver(times);
      return;
    }
    setLevel((l) => l + 1);
    const t = getRandomTwist(level + 1);
    setTwist(t);
    setPhase("dungeon");
    setStartTime(Date.now());
  };

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setPhase("game-over");
  }, []);

  // Back button (bottom-left, always visible, high z-index)
  const handleBack = () => {
    window.history.back();
  };

  // Add a background scene for each level
  function getSceneForLevel(level: number) {
    // Alternate between water, forest, and mountain scenes
    const scenes = [
      // Water scene
      (
        <div
          key="water"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background:
              "linear-gradient(to top, #6dd5ed 0%, #2193b0 60%, #e0eafc 100%)",
          }}
        >
          <svg width="100%" height="100%" style={{ position: "absolute", bottom: 0, left: 0 }}>
            <ellipse cx="50%" cy="98%" rx="60%" ry="8%" fill="#2193b0" opacity="0.5" />
            <ellipse cx="60%" cy="99%" rx="40%" ry="5%" fill="#6dd5ed" opacity="0.4" />
          </svg>
        </div>
      ),
      // Forest scene
      (
        <div
          key="forest"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background:
              "linear-gradient(to top, #a8e063 0%, #56ab2f 60%, #e0eafc 100%)",
          }}
        >
          <svg width="100%" height="100%" style={{ position: "absolute", bottom: 0, left: 0 }}>
            <ellipse cx="30%" cy="98%" rx="20%" ry="7%" fill="#56ab2f" opacity="0.5" />
            <ellipse cx="70%" cy="99%" rx="25%" ry="6%" fill="#a8e063" opacity="0.4" />
            {/* Simple trees */}
            <rect x="20%" y="90%" width="2%" height="8%" fill="#7c5e3c" />
            <circle cx="21%" cy="90%" r="5%" fill="#388e3c" />
            <rect x="75%" y="92%" width="2%" height="6%" fill="#7c5e3c" />
            <circle cx="76%" cy="92%" r="4%" fill="#388e3c" />
          </svg>
        </div>
      ),
      // Mountain scene
      (
        <div
          key="mountain"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background:
              "linear-gradient(to top, #e0eafc 0%, #cfdef3 60%, #a1c4fd 100%)",
          }}
        >
          <svg width="100%" height="100%" style={{ position: "absolute", bottom: 0, left: 0 }}>
            <polygon points="10,100 40,60 70,100" fill="#b0bec5" opacity="0.7" />
            <polygon points="60,100 80,70 100,100" fill="#78909c" opacity="0.6" />
          </svg>
        </div>
      ),
    ];
    return scenes[(level - 1) % scenes.length];
  }

  return (
    <div className={`absolute inset-0 ${styles.daoDungeonBg}`} style={{overflow: 'hidden'}}>
      {/* Back button (always visible) */}
      <button
        onClick={handleBack}
        style={{ position: "fixed", bottom: 16, left: 16, zIndex: 50, background: "#FF6B8A", color: "#fff", borderRadius: 8, padding: "8px 18px", fontWeight: 600, boxShadow: "0 2px 8px #FF6B8A33", border: 0 }}
      >
        ← Back
      </button>
      {/* Show background scene only during gameplay (dungeon) */}
      {phase === "dungeon" && getSceneForLevel(level)}
      {phase === "dungeon" && (
        <>
          {twist && (
            <div style={{ position: "fixed", top: 24, right: 24, zIndex: 40, background: "#FFD166", color: "#2E2B2B", borderRadius: 12, padding: "10px 22px", fontWeight: 700, fontSize: 18, boxShadow: "0 2px 8px #FFD16655" }}>
              {twist.label}
            </div>
          )}
          <TimerHUD time={Date.now() - startTime} />
          <InventoryHUD shards={shards} />
          <div className="absolute inset-0" style={{zIndex: 10}}>
            <Dungeon cfg={cfg} onReachExit={finishLevel} twist={twist} ballColor={ballColor} onGameOver={handleGameOver} />
          </div>
        </>
      )}
      {/* Only show share/version UI on start, game-complete, and game-over screens */}
      {(phase === "start" || phase === "game-complete" || phase === "game-over") && (
        <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 60, display: "flex", gap: 16 }}>
          <button
            onClick={() => {
              navigator.share ? navigator.share({ title: 'DAO Dungeon', text: `I scored ${shards} Soul Shards in DAO Dungeon!`, url: window.location.href }) : navigator.clipboard.writeText(window.location.href);
            }}
            style={{ background: "#FFD166", color: "#2E2B2B", borderRadius: 8, padding: "8px 18px", fontWeight: 600, boxShadow: "0 2px 8px #FFD16655", border: 0 }}
          >
            Share Shards
          </button>
          <span style={{ background: "#E5E1D8", color: "#2E2B2B", borderRadius: 8, padding: "8px 18px", fontWeight: 600, fontSize: 14, boxShadow: "0 2px 8px #E5E1D855" }}>
            Game Version: {gameVersion}
          </span>
        </div>
      )}
      {phase === "start" && <StartScreen onStart={startRun} />}
      {phase === "level-complete" && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-40">
          <div className={`${styles.daoDungeonCard} p-8 shadow-xl flex flex-col items-center`}>
            <h2 className={`${styles.daoDungeonTitle} text-3xl mb-4`}>Level {level} Complete!</h2>
            <p className="mb-2 text-lg">Time: <span className="font-bold">{(lastTime / 1000).toFixed(2)}s</span></p>
            <p className="mb-2 text-lg">Shards Collected: <span className="font-bold">+{lastShards}</span></p>
            {twist && <p className="mb-2 text-lg">Twist: <span className="font-bold">{twist.label}</span></p>}
            <button className={styles.daoDungeonButton} onClick={nextLevel}>
              {level === MAX_LEVEL ? "Finish Game" : "Next Level"}
            </button>
          </div>
        </div>
      )}
      {phase === "game-complete" && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-40">
          <div className={`${styles.daoDungeonCard} p-8 shadow-xl flex flex-col items-center`}>
            <h2 className={`${styles.daoDungeonTitle} text-3xl mb-4`}>Congratulations!</h2>
            <p className="mb-2 text-lg">You completed all {MAX_LEVEL} levels!</p>
            <p className="mb-2 text-lg">Total Time: <span className="font-bold">{(times.reduce((a, b) => a + b, 0) / 1000).toFixed(2)}s</span></p>
            <p className="mb-2 text-lg">Total Shards: <span className="font-bold">{shards}</span></p>
            <button className={styles.daoDungeonButton} onClick={() => window.location.reload()}>
              Play Again
            </button>
          </div>
        </div>
      )}
      {phase === "boss" && (
        <div className="absolute inset-0">
          <BossRoom level={level} onDefeat={finishLevel} />
        </div>
      )}
      {phase === "game-over" && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black/70 animate-fade-in">
          <div className={`${styles.daoDungeonCard} p-8 shadow-xl flex flex-col items-center animate-fade-in`}>
            <h2 className={`${styles.daoDungeonTitle} text-3xl mb-4`}>Game Over</h2>
            <p className="mb-2 text-lg">Your ball became too small to continue!</p>
            <p className="mb-2 text-lg">Total Shards: <span className="font-bold">{shards}</span></p>
            <button className={styles.daoDungeonButton} onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
