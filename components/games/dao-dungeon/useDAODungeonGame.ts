// components/games/dao-dungeon/useDAODungeonGame.ts
"use client";

import { useEffect, useRef } from "react";
import {
  generateMap,
  tileSize,
  COLORS,
  MAX_LEVEL,
} from "./constants";

interface GameState {
  level: number;
  map: number[][];
  playerX: number;
  playerY: number;
  tokensLeft: number;
  startTime: number;
  times: number[]; // ms for each completed level
  tokensCollected: number;
}

export function useDAODungeonGame(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const state = useRef<GameState>({
    level: 1,
    map: generateMap(1),
    playerX: 1,
    playerY: 1,
    tokensLeft: 0,
    startTime: Date.now(),
    times: [],
    tokensCollected: 0,
  });

  // initialize tokensLeft
  useEffect(() => {
    state.current.tokensLeft = state.current.map.flat().filter((c) => c === 2).length;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      const { map, playerX, playerY } = state.current;
      const rows = map.length;
      const cols = map[0].length;
      canvas.width = cols * tileSize;
      canvas.height = rows * tileSize;

      // draw map
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cell = map[y][x];
          switch (cell) {
            case 1:
              ctx.fillStyle = COLORS.WALL;
              break;
            case 2:
              ctx.fillStyle = COLORS.TOKEN;
              break;
            case 3:
              ctx.fillStyle = COLORS.EXIT;
              break;
            case 4:
              ctx.fillStyle = COLORS.TRAP;
              break;
            default:
              ctx.fillStyle = COLORS.FLOOR;
          }
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }

      // draw player
      ctx.fillStyle = COLORS.PLAYER;
      ctx.beginPath();
      ctx.arc(
        playerX * tileSize + tileSize / 2,
        playerY * tileSize + tileSize / 2,
        tileSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    function handleKey(e: KeyboardEvent) {
      const s = state.current;
      let nx = s.playerX;
      let ny = s.playerY;
      if (e.key === "ArrowUp") ny--;
      if (e.key === "ArrowDown") ny++;
      if (e.key === "ArrowLeft") nx--;
      if (e.key === "ArrowRight") nx++;
      if (nx < 0 || ny < 0 || ny >= s.map.length || nx >= s.map[0].length)
        return;

      const cell = s.map[ny][nx];
      // wall
      if (cell === 1) return;

      // trap
      if (cell === 4) {
        alert("You hit a trap! Restarting level…");
        resetLevel();
        draw();
        return;
      }

      // move
      s.playerX = nx;
      s.playerY = ny;

      // token
      if (cell === 2) {
        s.tokensCollected++;
        s.tokensLeft--;
        s.map[ny][nx] = 0;
      }

      // exit
      if (cell === 3 && s.tokensLeft === 0) {
        // complete level
        const now = Date.now();
        const duration = now - s.startTime;
        s.times.push(duration);
        if (s.level === MAX_LEVEL) {
          // game over
          setTimeout(() => showSummary(), 100);
          return;
        }
        // next level
        s.level++;
        loadLevel(s.level);
      }

      draw();
    }

    function resetLevel() {
      const lvl = state.current.level;
      state.current.map = generateMap(lvl);
      state.current.playerX = 1;
      state.current.playerY = 1;
      state.current.tokensLeft = state.current.map
        .flat()
        .filter((c) => c === 2).length;
      state.current.startTime = Date.now();
    }

    function loadLevel(lvl: number) {
      state.current.map = generateMap(lvl);
      state.current.playerX = 1;
      state.current.playerY = 1;
      state.current.tokensLeft = state.current.map
        .flat()
        .filter((c) => c === 2).length;
      state.current.startTime = Date.now();
      draw();
    }

    function showSummary() {
      const times = state.current.times;
      let msg = "🏆 You’ve escaped all dungeons!\n\n";
      times.forEach((t, i) => {
        msg += `Level ${i + 1}: ${(t / 1000).toFixed(2)}s\n`;
      });
      msg += `\nTokens Collected: ${state.current.tokensCollected}\n`;
      alert(msg);
      // restart game
      state.current.level = 1;
      state.current.times = [];
      state.current.tokensCollected = 0;
      loadLevel(1);
    }

    window.addEventListener("keydown", handleKey);
    loadLevel(state.current.level);
    draw();

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [canvasRef]);
}
