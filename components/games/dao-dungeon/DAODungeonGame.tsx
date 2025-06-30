// components/games/dao-dungeon/DAODungeonGame.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { useDAODungeonGame } from "./useDAODungeonGame";
import styles from "./daodungeon.module.css";

export default function DAODungeonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useDAODungeonGame(canvasRef);

  const [level, setLevel] = useState(1);
  const [elapsed, setElapsed] = useState(0);

  // simple timer update
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 100), 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.hud}>
        <div>Level: {level} / 10</div>
        <div>Time: {(elapsed / 1000).toFixed(1)}s</div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
