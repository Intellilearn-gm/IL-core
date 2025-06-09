import React, { useRef, useState, useEffect, useCallback } from "react";
import "./OpenCampusCodeQuest.css";

// --- Game Constants ---
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const SHIP_WIDTH = 40;
const SHIP_HEIGHT = 30;
const SHIP_SPEED = 5;
const TOKEN_RADIUS = 15;
const TOKEN_SPEED = 3;
const TOKEN_SPAWN_INTERVAL = 2000; // milliseconds

// --- Educational Facts ---
const ocFacts = [
  "OCID Connect follows the OIDC Auth Code Flow with PKCE.",
  "Redirect URIs must be registered in your Open Campus Developer account.",
  "Sandbox mode allows testing without a clientId.",
  "Educhain leverages blockchain for decentralized identity.",
  "OpenCampus empowers learning with secure, user-friendly authentication.",
  "Decentralization removes single points of failure.",
  "Smart contracts are self-executing once conditions are met."
];

function getRandomOcFact() {
  return ocFacts[Math.floor(Math.random() * ocFacts.length)];
}

// --- Token Factory ---
function createToken() {
  return {
    x: CANVAS_WIDTH + TOKEN_RADIUS,
    y: Math.random() * (CANVAS_HEIGHT - TOKEN_RADIUS * 2) + TOKEN_RADIUS,
    radius: TOKEN_RADIUS,
    speed: TOKEN_SPEED,
    fact: getRandomOcFact()
  };
}

const OpenCampusCodeQuest = () => {
  const canvasRef = useRef(null);
  
  // Spaceship state positioned initially at left-center of canvas
  const [shipX, setShipX] = useState(100);
  const [shipY, setShipY] = useState(CANVAS_HEIGHT / 2 - SHIP_HEIGHT / 2);
  
  // Game state
  const [tokens, setTokens] = useState([]);
  const [score, setScore] = useState(0);
  const [currentFact, setCurrentFact] = useState("");
  
  // Timestamps to control token spawning and smooth movement
  const lastTokenSpawnRef = useRef(0);
  const lastTimestampRef = useRef(0);
  
  // --- Keyboard Controls ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp":
          setShipY(prev => Math.max(0, prev - SHIP_SPEED));
          break;
        case "ArrowDown":
          setShipY(prev => Math.min(CANVAS_HEIGHT - SHIP_HEIGHT, prev + SHIP_SPEED));
          break;
        case "ArrowLeft":
          setShipX(prev => Math.max(0, prev - SHIP_SPEED));
          break;
        case "ArrowRight":
          setShipX(prev => Math.min(CANVAS_WIDTH - SHIP_WIDTH, prev + SHIP_SPEED));
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Update Tokens: movement and collision detection ---
  const updateTokens = useCallback((delta) => {
    // Update token positions: move leftwards (time-based delta)
    setTokens(prevTokens =>
      prevTokens
        .map(token => ({ ...token, x: token.x - token.speed * delta }))
        .filter(token => token.x + token.radius > 0)
    );
    
    // Collision detection between spaceship (rectangle) and tokens (circle)
    setTokens(prevTokens => {
      const remainingTokens = [];
      for (const token of prevTokens) {
        // Simple circle-rectangle collision detection
        const centerX = shipX + SHIP_WIDTH / 2;
        const centerY = shipY + SHIP_HEIGHT / 2;
        const dx = Math.abs(token.x - centerX);
        const dy = Math.abs(token.y - centerY);
        if (dx < SHIP_WIDTH / 2 + token.radius && dy < SHIP_HEIGHT / 2 + token.radius) {
          // Collision: update score and display the token's fact
          setScore(s => s + 1);
          setCurrentFact(token.fact);
        } else {
          remainingTokens.push(token);
        }
      }
      return remainingTokens;
    });
  }, [shipX, shipY]);

  // --- Drawing Function ---
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- Draw Background ---
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, "#0f2027");
    grad.addColorStop(1, "#203a43");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Optionally add stars
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // --- Draw Spaceship as a Triangle ---
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.moveTo(shipX, shipY + SHIP_HEIGHT / 2);
    ctx.lineTo(shipX + SHIP_WIDTH, shipY);
    ctx.lineTo(shipX + SHIP_WIDTH, shipY + SHIP_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // --- Draw Tokens (circles) ---
    ctx.fillStyle = "#00ff99";
    ctx.strokeStyle = "#000";
    tokens.forEach(token => {
      ctx.beginPath();
      ctx.arc(token.x, token.y, token.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // --- Draw UI: Score and Fact ---
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    if (currentFact) {
      ctx.fillText(`Fact: ${currentFact}`, 20, 60);
    }
  }, [shipX, shipY, tokens, score, currentFact]);

  // --- Main Game Loop ---
  useEffect(() => {
    let animationFrameId;
    function gameLoop(timestamp) {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const deltaMs = timestamp - lastTimestampRef.current;
      const delta = deltaMs / 16.6667; // normalize based on ~60 fps
      lastTimestampRef.current = timestamp;

      // Spawn new token every TOKEN_SPAWN_INTERVAL ms
      if (timestamp - lastTokenSpawnRef.current > TOKEN_SPAWN_INTERVAL) {
        setTokens(prev => [...prev, createToken()]);
        lastTokenSpawnRef.current = timestamp;
      }

      updateTokens(delta);
      drawGame();
      animationFrameId = requestAnimationFrame(gameLoop);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [drawGame, updateTokens]);

  return (
    <div className="code-quest-container">
      <h1 className="code-quest-title">OpenCampus Code Quest</h1>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="code-quest-canvas"
      />
      <div className="code-quest-info">
        <p>
          Use the arrow keys to pilot your spaceship and collect tokens from the right.
          Each token reveals a cool fact about OCID Connect, Educhain, or OpenCampus!
        </p>
      </div>
    </div>
  );
};

export default OpenCampusCodeQuest;
