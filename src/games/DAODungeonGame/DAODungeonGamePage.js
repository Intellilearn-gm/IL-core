// src/DAODungeonGame.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import './DAODungeonGame.css';

const tileSize = 40; // pixels per grid cell

// A simple grid map representation:
// 0 = floor (walkable)
// 1 = wall (unwalkable)
// 2 = token (collectible)
// 3 = door (locked until all tokens are collected)
const initialMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,2,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const DAODungeonGame = () => {
  const canvasRef = useRef(null);
  // Player's grid position: starting at (1,1)
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [map, setMap] = useState(initialMap);
  const [score, setScore] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Calculate initial token count once
  useEffect(() => {
    let count = 0;
    for (let row of initialMap) {
      row.forEach(cell => { if (cell === 2) count++; });
    }
    setTotalTokens(count);
  }, []);

  // Handle keyboard input for grid-based movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameWon) return; // Freeze movement if game is over

      let newX = playerPos.x;
      let newY = playerPos.y;
      if (e.key === "ArrowUp") newY--;
      if (e.key === "ArrowDown") newY++;
      if (e.key === "ArrowLeft") newX--;
      if (e.key === "ArrowRight") newX++;

      // Bounds check
      if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return;

      const targetCell = map[newY][newX];
      // Block movement if wall (1) or door (3) and not unlocked
      if (targetCell === 1) return;
      if (targetCell === 3 && !doorUnlocked) return;

      // Move player
      setPlayerPos({ x: newX, y: newY });

      // Collect token
      if (targetCell === 2) {
        setScore(prev => prev + 1);
        // Update map: set cell to floor (0)
        setMap(prevMap => {
          const newMap = prevMap.map(row => row.slice());
          newMap[newY][newX] = 0;
          return newMap;
        });
      }

      // If stepping on door when unlocked, win game
      if (targetCell === 3 && doorUnlocked) {
        setGameWon(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos, map, doorUnlocked, gameWon]);

  // Unlock door when all tokens are collected
  useEffect(() => {
    if (score >= totalTokens && totalTokens > 0) {
      setDoorUnlocked(true);
    }
  }, [score, totalTokens]);

  // Draw the dungeon grid and player
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each grid cell
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        const cell = map[y][x];
        let color = "#e0e0e0"; // floor: light gray
        if (cell === 1) color = "#555"; // wall: dark gray
        if (cell === 2) color = "#FFD700"; // token: gold
        if (cell === 3) color = doorUnlocked ? "#0a0" : "#d00"; // door: green if unlocked, red if locked

        ctx.fillStyle = color;
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    // Draw the player as a blue circle
    const centerX = playerPos.x * tileSize + tileSize / 2;
    const centerY = playerPos.y * tileSize + tileSize / 2;
    const playerRadius = tileSize / 3;
    ctx.fillStyle = "#00f";
    ctx.beginPath();
    ctx.arc(centerX, centerY, playerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw game status (tokens collected)
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText(`Tokens: ${score} / ${totalTokens}`, 10, canvas.height - 10);

    // If game is won, display a congratulatory message
    if (gameWon) {
      ctx.fillStyle = "#0a0";
      ctx.font = "30px Arial";
      ctx.fillText("Congratulations! You Escaped the Dungeon!", 50, canvas.height / 2);
    }
  }, [map, playerPos, score, totalTokens, doorUnlocked, gameWon]);

  // Animation loop (redraw when state changes)
  useEffect(() => {
    let animationId = requestAnimationFrame(function render() {
      drawGame();
      animationId = requestAnimationFrame(render);
    });
    return () => cancelAnimationFrame(animationId);
  }, [drawGame]);

  return (
    <div className="dao-dungeon-container">
      <h1 className="dao-dungeon-title">DAO Dungeon Escape</h1>
      <canvas
        ref={canvasRef}
        width={map[0].length * tileSize}
        height={map.length * tileSize}
        className="dao-dungeon-canvas"
      />
      <div className="dao-dungeon-info">
        <p>Use the arrow keys to navigate the dungeon.</p>
        <p>Collect all tokens to unlock the door and escape!</p>
      </div>
    </div>
  );
};

export default DAODungeonGame;
