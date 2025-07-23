'use client'

import React, { useEffect, useRef, useState, useCallback } from "react";
import "./ArcheryGame.css";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// --- Type Definitions ---
interface AssessmentQuestion {
    question: string;
    options: string[];
    Correct_option_index: number;
    difficulty: number;
    category: string;
    explanation: string;
    round: number;
}

interface Arrow {
    x: number;
    y: number;
    vx: number;
    vy: number;
    id: number;
    enemyIndex?: number;
    minMissDistance: number;
    power?: number;
    trail: { x: number, y: number }[];
}

interface Position {
    x: number;
    y: number;
    platformY: number;
}

interface EnemyPosition extends Position {
    id: number;
    name: string;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

interface EnemyAIState {
    id: number;
    lastAngle: number;
    lastSpeed: number;
    missDistance: number;
    improvementFactor: number;
    nextShotDelay: number;
    shotsFired: number;
    power: number;
    isDrawingBow: boolean;
    drawProgress: number;
    drawDuration: number;
    firePending: boolean;
}

type GameState = 'loading' | 'showing_question' | 'playing' | 'showing_explanation' | 'game_over' | 'error';


// --- Constants ---
const NUM_ENEMIES = 4;
const SCALE_FACTOR = 0.7;
const MIN_ENEMY_DISTANCE = 80 * SCALE_FACTOR;
const PLAYER_HIT_RADIUS = 25 * SCALE_FACTOR;
const ENEMY_HIT_RADIUS = 38 * SCALE_FACTOR;
const GRAVITY = 0.2 * SCALE_FACTOR;
const BASE_ENEMY_SPEED = 14 * Math.sqrt(SCALE_FACTOR);
const enemy_firetime = 2000;
const enemyNames = ["A", "B", "C", "D"];
const ASSESSMENT_API_URL = "http://localhost:3000/generate-question?topic=blockchain_basics";

const fallbackAssessmentData: AssessmentQuestion[] = [
    {
        "question": "What is a blockchain?",
        "options": [ "A centralized database", "A peer-to-peer network of digital files", "A distributed ledger of transactions", "A form of cryptocurrency" ],
        "Correct_option_index": 2, "difficulty": 1, "category": "Basics",
        "explanation": "Blockchain is a distributed ledger technology that records transactions across multiple computers to ensure the security and accuracy of data.",
        "round": 1
    },
    {
        "question": "Which provides security against tampering?",
        "options": [ "Public keys", "Smart contracts", "Cryptographic hashing", "Decentralization" ],
        "Correct_option_index": 2, "difficulty": 2, "category": "Theory",
        "explanation": "Cryptographic hashing ensures that the data cannot be altered without being detected, as each block contains a hash of the previous block.",
        "round": 2
    },
    {
        "question": "What is the role of miners?",
        "options": [ "To create new blocks by solving problems", "To verify transactions and add them", "To provide liquidity", "To act as intermediaries" ],
        "Correct_option_index": 1, "difficulty": 3, "category": "Applications",
        "explanation": "Miners verify transactions and compile them into blocks, which are then added to the blockchain, ensuring security and transparency.",
        "round": 3
    },
    {
        "question": "What is a 'smart contract'?",
        "options": [ "A physical mining contract", "A type of virtual currency", "A self-executing contract in code", "A manual agreement" ],
        "Correct_option_index": 2, "difficulty": 2, "category": "Applications",
        "explanation": "A smart contract is a self-executing contract with the terms of the agreement between buyer and seller being directly written into lines of code.",
        "round": 4
    },
    {
        "question": "Feature of public blockchain networks?",
        "options": [ "Restricted access", "Private/encrypted data", "Anyone can join and validate", "Primarily for enterprise use" ],
        "Correct_option_index": 2, "difficulty": 1, "category": "Basics",
        "explanation": "Public blockchains operate as open networks where anyone can participate in the network activities like validating transactions.",
        "round": 5
    }
];

const THEME_COLORS = {
  SKY_NIGHT_TOP: '#0b132b',
  SKY_NIGHT_MID: '#1c2541',
  SKY_NIGHT_HORIZON: '#3a506b',
  MOUNTAIN_FAR: '#1c2541',
  MOUNTAIN_MID: '#3a506b',
  MOUNTAIN_NEAR: '#5c6d70',
  GROUND: '#2a2a2a',
  PLATFORM: '#222',
  PLAYER_HEALTH_BAR: '#4d9de0',
  ENEMY_HEALTH_BAR: '#e15554',
  TEXT: "#f0f0f0",
  TEXT_BRIGHT: "#ffffff",
  QUESTION_BG: 'rgba(11, 19, 43, 0.85)',
  QUESTION_BORDER: 'rgba(92, 109, 112, 0.7)',
  BUTTON: "#e85a4f",
  BUTTON_TEXT: "#ffffff",
  PLAYER_SILHOUETTE: "#4a3123",
  ENEMY: "black",
  ENEMY_ACCENT: "#f39c12",
  BOW: "#333",
  BOW_STRING: "#ccc",
  ARROW: "rgba(255, 255, 255, 0.9)",
  ARROW_HEAD: "#aaa",
  ARROW_TRAIL: 'rgba(255, 255, 255, 0.2)',
  TRAJECTORY_DOT: "rgba(255, 255, 200, 0.4)",
  PARTICLE_HIT: 'rgba(255, 255, 255, 0.9)',
  PARTICLE_CRITICAL: 'rgba(255, 200, 50, 0.9)',
};

const ArcheryGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const enemyArrowsRef = useRef<Arrow[]>([]);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [enemyCanFire, setEnemyCanFire] = useState(false);

  const [gameState, setGameState] = useState<GameState>('loading');
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [explanationText, setExplanationText] = useState("");
  const clickableAreasRef = useRef<Record<string, any>>({});

  const [playerScore, setPlayerScore] = useState(0);
  const [enemyScore, setEnemyScore] = useState(0);
  
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);

  const [playerArrow, setPlayerArrow] = useState<Arrow | null>(null);
  const [enemyArrows, setEnemyArrows] = useState<Arrow[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [playerHitFlash, setPlayerHitFlash] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  const enemyAiRef = useRef<EnemyAIState[]>([]);

  const [positions, setPositions] = useState<{
    player: Position;
    enemies: EnemyPosition[];
  }>({ player: { x: 0, y: 0, platformY: 0 }, enemies: [] });
  
  const PLATFORM_HEIGHT = 15 * SCALE_FACTOR;
  const PLATFORM_WIDTH = 60 * SCALE_FACTOR;
  const CHARACTER_FOOT_OFFSET = 5 * SCALE_FACTOR;

  const createInitialAiState = useCallback((index: number, power: number = 0): EnemyAIState => ({
    id: index, lastAngle: 0, lastSpeed: BASE_ENEMY_SPEED * (0.8 + Math.random() * 0.4),
    missDistance: 0, improvementFactor: 0.25 + (Math.random() - 0.5) * 0.1,
    nextShotDelay: Math.random() * 1500 + 1000, shotsFired: 0, power: power,
    isDrawingBow: false, drawProgress: 0, drawDuration: 300, firePending: false
  }), []);

  const createExplosion = useCallback((x: number, y: number, color: string, count = 15, speed = 3) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const currentSpeed = (Math.random() * 0.5 + 0.5) * speed;
      newParticles.push({
        x, y,
        vx: Math.cos(angle) * currentSpeed,
        vy: Math.sin(angle) * currentSpeed,
        life: Math.random() * 30 + 20,
        color,
        size: Math.random() * 2 + 1,
      });
    }
    setParticles(p => [...p, ...newParticles]);
  }, []);

  const generateRandomPositions = useCallback((canvas: HTMLCanvasElement) => {
    if (!canvas) return { player: { x: 0, y: 0, platformY: 0 }, enemies: [] };

    const platformMinY = canvas.height * 0.65;
    const platformMaxY = canvas.height - PLATFORM_HEIGHT - 50 * SCALE_FACTOR;
    const playerMinX = canvas.width * 0.05 + PLATFORM_WIDTH / 2;
    const playerMaxX = canvas.width * 0.15 - PLATFORM_WIDTH / 2;

    const playerPlatformX = Math.random() * (playerMaxX - playerMinX) + playerMinX;
    const playerPlatformY = Math.random() * (platformMaxY - platformMinY) + platformMinY;
    const playerPos = {
        x: playerPlatformX,
        platformY: playerPlatformY,
        y: playerPlatformY - CHARACTER_FOOT_OFFSET
    };

    const enemies: {tempX: number, tempY: number}[] = [];
    const enemyMinX = playerMaxX + 50 * SCALE_FACTOR + PLATFORM_WIDTH / 2;
    const enemyMaxX = canvas.width - 50 * SCALE_FACTOR - PLATFORM_WIDTH / 2;

    for (let i = 0; i < NUM_ENEMIES; i++) {
        let enemyPlatformX = 0, enemyPlatformY = 0, validPosition = false, attempts = 0;
        while (!validPosition && attempts < 100) {
            attempts++;
            enemyPlatformX = Math.random() * (enemyMaxX - enemyMinX) + enemyMinX;
            enemyPlatformY = Math.random() * (platformMaxY - platformMinY) + platformMinY;
            if (Math.abs(enemyPlatformX - playerPos.x) < MIN_ENEMY_DISTANCE * 1.2) continue;
            let tooClose = false;
            for (const other of enemies) { if (Math.abs(enemyPlatformX - other.tempX) < MIN_ENEMY_DISTANCE) { tooClose = true; break; } }
            if (!tooClose) validPosition = true;
        }
        enemies.push({ tempX: enemyPlatformX, tempY: enemyPlatformY });
    }

    enemies.sort((a, b) => a.tempX - b.tempX);

    const finalEnemies: EnemyPosition[] = enemies.map((pos, i) => ({
        x: pos.tempX, platformY: pos.tempY, y: pos.tempY - CHARACTER_FOOT_OFFSET,
        id: i, name: enemyNames[i]
    }));
    return { player: playerPos, enemies: finalEnemies };
  }, [PLATFORM_WIDTH, PLATFORM_HEIGHT, CHARACTER_FOOT_OFFSET, MIN_ENEMY_DISTANCE]);
  
  const startArcheryRound = useCallback(() => {
    if (assessmentQuestions.length === 0 || currentQuestionIndex >= assessmentQuestions.length) return;
    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    const correctOptionIndex = currentQuestion?.Correct_option_index;
    if (typeof correctOptionIndex !== 'number' || correctOptionIndex < 0 || correctOptionIndex >= NUM_ENEMIES) {
        setExplanationText(`Error: Invalid correct answer index (${correctOptionIndex}).`);
        setGameState('error'); return;
    }
    setPlayerArrow(null);
    setEnemyArrows([]);
    setParticles([]);
    enemyArrowsRef.current = [];
    if (canvasRef.current) {
        const newPositions = generateRandomPositions(canvasRef.current);
        setPositions(newPositions);
        enemyAiRef.current = Array.from({ length: NUM_ENEMIES }, (_, i) => 
            createInitialAiState(i, i === correctOptionIndex ? 1 : 0)
        );
    }
    setEnemyCanFire(false);
    setTimeout(() => setEnemyCanFire(true), enemy_firetime);
    setGameState('playing');
  }, [generateRandomPositions, assessmentQuestions, currentQuestionIndex, createInitialAiState]);

  const fireEnemyArrow = useCallback((enemyIndex: number) => {
    if (gameState !== 'playing') return;
    const enemy = positions.enemies[enemyIndex];
    const enemyAi = enemyAiRef.current[enemyIndex];
    if (!enemy || !enemyAi || enemyArrowsRef.current.some(a => a.enemyIndex === enemyIndex)) return;
    const bodyTopOffsetY = -60 * SCALE_FACTOR, armLength = 20 * SCALE_FACTOR;
    const bowAnchorX = enemy.x - armLength * 0.5, bowAnchorY = enemy.y + bodyTopOffsetY;
    const targetX = positions.player.x, targetY = positions.player.y - 30 * SCALE_FACTOR;
    const dx = targetX - bowAnchorX, dy = targetY - bowAnchorY;
    const baseAngleRad = Math.atan2(dy, dx), launchAngleRad = baseAngleRad + enemyAi.lastAngle, launchSpeed = enemyAi.lastSpeed;
    const newArrow: Arrow = {
        x: bowAnchorX, y: bowAnchorY,
        vx: launchSpeed * Math.cos(launchAngleRad), vy: launchSpeed * Math.sin(launchAngleRad),
        id: Date.now() + Math.random(), enemyIndex: enemyIndex, minMissDistance: Infinity,
        power: enemyAi.power, trail: [{ x: bowAnchorX, y: bowAnchorY }]
    };
    setEnemyArrows(prev => {
        const updated = [...prev, newArrow];
        enemyArrowsRef.current = updated;
        return updated;
    });
    enemyAi.nextShotDelay = Math.random() * 2000 + 1500;
  }, [gameState, positions]);

  const learnFromMiss = useCallback((enemyIndex: number, missDistance: number) => {
    if (gameState !== 'playing' || !enemyAiRef.current[enemyIndex]) return;
    const enemyAi = enemyAiRef.current[enemyIndex];
    const factor = enemyAi.improvementFactor;
    const missSeverity = Math.min(1, missDistance / (300 * SCALE_FACTOR));
    let angleChange = (Math.random() - 0.5) * 0.1 * factor * (1 + missSeverity);
    let speedChange = (Math.random() - 0.5) * 1.5 * factor * (1 + missSeverity);
    if (missDistance > 100 * SCALE_FACTOR) speedChange *= 1.2;
    else if (missDistance < 40 * SCALE_FACTOR) angleChange *= 1.2;
    enemyAi.lastAngle += angleChange;
    enemyAi.lastSpeed = Math.max(BASE_ENEMY_SPEED * 0.6, Math.min(BASE_ENEMY_SPEED * 1.6, enemyAi.lastSpeed + speedChange));
  }, [gameState]);

  const handleHit = useCallback((winner: string, targetInfo: any = null) => {
    if (gameState !== 'playing') return;
    setGameState('showing_explanation');
    setPlayerArrow(null);
    if (currentQuestionIndex < assessmentQuestions.length) {
        setExplanationText(assessmentQuestions[currentQuestionIndex].explanation);
    }
    if (winner === "Player") {
        setPlayerScore((prev) => prev + 1);
        if(targetInfo.hitPosition) createExplosion(targetInfo.hitPosition.x, targetInfo.hitPosition.y, THEME_COLORS.PARTICLE_CRITICAL, 30, 5);
    } else {
        setEnemyScore((prev) => prev + 1);
        setPlayerHitFlash(15);
        if(targetInfo.hitPosition) createExplosion(targetInfo.hitPosition.x, targetInfo.hitPosition.y, THEME_COLORS.PARTICLE_HIT, 20, 3);
    }
  }, [gameState, currentQuestionIndex, assessmentQuestions, createExplosion]);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, parallaxOffset: number) => {
    const cw = canvas.width, ch = canvas.height;
    const skyGradient = ctx.createLinearGradient(0, 0, 0, ch);
    skyGradient.addColorStop(0, THEME_COLORS.SKY_NIGHT_TOP);
    skyGradient.addColorStop(0.6, THEME_COLORS.SKY_NIGHT_MID);
    skyGradient.addColorStop(1, THEME_COLORS.SKY_NIGHT_HORIZON);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, cw, ch);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const STAR_SPEED_FACTOR = 0.000001;
    for (let i = 0; i < 100; i++) {
      const starDrift = STAR_SPEED_FACTOR + Math.random() * STAR_SPEED_FACTOR;
      const x = (Math.random() * cw * 1.5 - cw * 0.25 + parallaxOffset * starDrift) % cw;
      const y = Math.random() * ch * 0.6;
      const r = Math.random() * 0.8;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    
    const moonX = cw * 0.8, moonY = ch * 0.2, moonR = 40 * SCALE_FACTOR;
    ctx.save(); ctx.shadowBlur = 30; ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    const drawMountainLayer = (offset: number, color: string, height: number, variance: number) => {
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-100, ch);
        let x = -100;
        while (x < cw + 100) {
            let y = ch - (Math.sin((x + offset) * 0.005) * variance + height);
            ctx.lineTo(x, y); x += 20;
        }
        ctx.lineTo(cw + 100, ch); ctx.closePath(); ctx.fill();
    };
    drawMountainLayer(parallaxOffset * 0.2, THEME_COLORS.MOUNTAIN_FAR, ch * 0.35, 40);
    drawMountainLayer(parallaxOffset * 0.5, THEME_COLORS.MOUNTAIN_MID, ch * 0.25, 30);
    drawMountainLayer(parallaxOffset * 1, THEME_COLORS.MOUNTAIN_NEAR, ch * 0.1, 25);
  }, [THEME_COLORS]);

  const drawPlayerArcher = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, angleDeg: number, powerPercent: number) => {
      ctx.save();
      const bodyColor = THEME_COLORS.PLAYER_SILHOUETTE; ctx.fillStyle = bodyColor; ctx.strokeStyle = bodyColor;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const headRadius = 9 * SCALE_FACTOR, bodyHeight = 45 * SCALE_FACTOR, legLength = 35 * SCALE_FACTOR;
      const armLength = 25 * SCALE_FACTOR, limbThickness = 8 * SCALE_FACTOR, bowThickness = 6 * SCALE_FACTOR, legSpread = 15 * SCALE_FACTOR;
      const groundY = y + CHARACTER_FOOT_OFFSET, bodyBottomY = groundY - legLength, bodyTopY = bodyBottomY - bodyHeight;
      const headCenterY = bodyTopY - headRadius * 0.7, angleRad = (-angleDeg * Math.PI) / 180;
      ctx.lineWidth = limbThickness; ctx.beginPath();
      ctx.moveTo(x, bodyBottomY); ctx.quadraticCurveTo(x - legSpread * 0.8, bodyBottomY + legLength * 0.5, x - legSpread, groundY);
      ctx.moveTo(x, bodyBottomY); ctx.quadraticCurveTo(x + legSpread * 0.2, bodyBottomY + legLength * 0.6, x + legSpread, groundY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, bodyBottomY); ctx.lineTo(x, bodyTopY); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, headCenterY, headRadius, 0, Math.PI * 2); ctx.fill();
      const shoulderX = x, shoulderY = bodyTopY + 5 * SCALE_FACTOR;
      const pullBackDist = (powerPercent / 100) * (armLength * 0.5);
      const bowCenterApproxX = shoulderX + armLength * Math.cos(angleRad) * 0.8;
      const bowCenterApproxY = shoulderY + armLength * Math.sin(angleRad) * 0.8;
      const backHandX = bowCenterApproxX - pullBackDist * Math.cos(angleRad + Math.PI * 0.1);
      const backHandY = bowCenterApproxY - pullBackDist * Math.sin(angleRad + Math.PI * 0.1);
      ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.quadraticCurveTo(shoulderX + armLength*0.6*Math.cos(Math.PI*1.1), shoulderY + armLength*0.6*Math.sin(Math.PI*1.1), backHandX, backHandY); ctx.stroke();
      const frontHandX = shoulderX + armLength * Math.cos(angleRad), frontHandY = shoulderY + armLength * Math.sin(angleRad);
      ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(frontHandX, frontHandY); ctx.stroke();
      ctx.save(); ctx.translate(frontHandX, frontHandY); ctx.rotate(angleRad);
      ctx.strokeStyle = THEME_COLORS.BOW; ctx.lineWidth = bowThickness; ctx.beginPath();
      const bowRadius = armLength * 1.3; ctx.arc(0, 0, bowRadius, Math.PI * 0.4, -Math.PI * 0.4, true); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = THEME_COLORS.BOW_STRING; ctx.lineWidth = 1 * SCALE_FACTOR; ctx.beginPath();
      const topTipX = frontHandX + bowRadius * Math.cos(angleRad + Math.PI * 0.4), topTipY = frontHandY + bowRadius * Math.sin(angleRad + Math.PI * 0.4);
      const bottomTipX = frontHandX + bowRadius * Math.cos(angleRad - Math.PI * 0.4), bottomTipY = frontHandY + bowRadius * Math.sin(angleRad - Math.PI * 0.4);
      ctx.moveTo(topTipX, topTipY); ctx.lineTo(backHandX, backHandY); ctx.lineTo(bottomTipX, bottomTipY); ctx.stroke();
      ctx.restore();
  }, [CHARACTER_FOOT_OFFSET, THEME_COLORS]);

  const drawEnemyArcher = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, name: string, bowDraw = 0) => {
    ctx.save();
    ctx.strokeStyle = THEME_COLORS.ENEMY; ctx.fillStyle = THEME_COLORS.ENEMY; ctx.lineWidth = 3 * SCALE_FACTOR;
    const headRadius = 8 * SCALE_FACTOR, bodyHeight = 45 * SCALE_FACTOR, legLength = 30 * SCALE_FACTOR;
    const armLength = 20 * SCALE_FACTOR, bowRadiusDraw = 18 * SCALE_FACTOR, legSpread = 10 * SCALE_FACTOR;
    const groundY = y + CHARACTER_FOOT_OFFSET, bodyBottomY = groundY - legLength, bodyTopY = bodyBottomY - bodyHeight;
    const headCenterY = bodyTopY - headRadius;
    ctx.beginPath(); ctx.moveTo(x, bodyBottomY); ctx.lineTo(x - legSpread, groundY); ctx.moveTo(x, bodyBottomY); ctx.lineTo(x + legSpread, groundY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, bodyBottomY); ctx.lineTo(x, bodyTopY); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, headCenterY, headRadius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = THEME_COLORS.ENEMY_ACCENT; ctx.beginPath(); ctx.arc(x - headRadius * 0.4, headCenterY - headRadius * 0.1, 1.8 * SCALE_FACTOR, 0, Math.PI*2); ctx.fill();
    const shoulderX = x, shoulderY = bodyTopY + 5 * SCALE_FACTOR;
    ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(shoulderX + 10 * SCALE_FACTOR, shoulderY + 15 * SCALE_FACTOR); ctx.stroke();
    const handX = shoulderX - armLength, handY = shoulderY;
    ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(handX, handY); ctx.stroke();
    ctx.save(); ctx.translate(handX, handY);
    ctx.strokeStyle = THEME_COLORS.BOW; ctx.lineWidth = 2.5 * SCALE_FACTOR; ctx.beginPath();
    ctx.arc(0, 0, bowRadiusDraw, Math.PI / 2, -Math.PI / 2, false); ctx.stroke();
    ctx.strokeStyle = THEME_COLORS.BOW_STRING; ctx.lineWidth = 1 * SCALE_FACTOR; ctx.beginPath();
    const pullX = 15 * SCALE_FACTOR * bowDraw;
    ctx.moveTo(0, bowRadiusDraw); ctx.lineTo(pullX, 0); ctx.lineTo(0, -bowRadiusDraw); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = THEME_COLORS.TEXT_BRIGHT; ctx.font = `bold ${14 * SCALE_FACTOR}px sans-serif`; ctx.textAlign = "center";
    ctx.fillText(name, x, headCenterY - headRadius - 7 * SCALE_FACTOR);
    ctx.restore();
  }, [CHARACTER_FOOT_OFFSET, THEME_COLORS]);

  const drawArrow = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, trail: Arrow['trail']) => {
    ctx.save();
    ctx.strokeStyle = THEME_COLORS.ARROW_TRAIL; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.5;
    ctx.beginPath();
    trail.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    const arrowLength = 25 * SCALE_FACTOR, shaftWidth = 2 * SCALE_FACTOR, headLength = 6 * SCALE_FACTOR, headWidth = 5 * SCALE_FACTOR;
    ctx.translate(x, y); ctx.rotate(angle);
    ctx.fillStyle = THEME_COLORS.ARROW; ctx.fillRect(-arrowLength * 0.7, -shaftWidth / 2, arrowLength, shaftWidth);
    ctx.fillStyle = THEME_COLORS.ARROW_HEAD; const headBaseX = arrowLength * 0.3; ctx.beginPath();
    ctx.moveTo(headBaseX, -headWidth / 2); ctx.lineTo(headBaseX + headLength, 0); ctx.lineTo(headBaseX, headWidth / 2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }, [THEME_COLORS]);

  const calculateTrajectoryPoints = useCallback((startX: number, startY: number, initialVx: number, initialVy: number, steps = 50, timeStep = 1) => {
    const points = []; let x = startX, y = startY, vx = initialVx, vy = initialVy;
    const canvas = canvasRef.current;
    const groundLevel = canvas ? canvas.height - (40 * SCALE_FACTOR) : Infinity;
    for (let i = 0; i < steps; i++) {
        vy += GRAVITY * timeStep; x += vx * timeStep; y += vy * timeStep;
        if (y > groundLevel || x < -50 || x > (canvas?.width ?? Infinity) + 50 || y < -50) break;
        points.push({ x, y });
    }
    return points;
  }, [GRAVITY]);

  const drawTrajectoryPreview = useCallback((ctx: CanvasRenderingContext2D, points: {x: number, y: number}[]) => {
    ctx.save(); ctx.fillStyle = THEME_COLORS.TRAJECTORY_DOT;
    points.forEach((p, i) => {
        if (i % 3 === 0) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.5 * SCALE_FACTOR, 0, Math.PI*2); ctx.fill(); }
    });
    ctx.restore();
  }, [THEME_COLORS]);

  const wrapText = useCallback((ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, color = THEME_COLORS.TEXT, font = `${14 * SCALE_FACTOR}px sans-serif`) => {
    if (!ctx || !text) return y;
    ctx.fillStyle = color; ctx.font = font; const words = text.split(' ');
    let line = '', currentY = y;
    for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
            ctx.fillText(line.trim(), x, currentY); line = word + ' '; currentY += lineHeight;
        } else { line = testLine; }
    }
    ctx.fillText(line.trim(), x, currentY); return currentY + lineHeight;
  }, [THEME_COLORS]);
  
  const drawUiBox = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, opacity = 0.85) => {
    const cw = canvas.width, ch = canvas.height;
    ctx.save();
    ctx.fillStyle = `rgba(11, 19, 43, ${opacity})`; ctx.strokeStyle = THEME_COLORS.QUESTION_BORDER;
    ctx.lineWidth = 2; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 15;
    const margin = cw * 0.1, width = cw - margin * 2, height = ch * 0.7, y_ = (ch - height) / 2;
    ctx.beginPath(); ctx.roundRect(margin, y_, width, height, 15); ctx.fill(); ctx.stroke();
    ctx.restore();
    return { boxX: margin, boxY: y_, boxWidth: width, boxHeight: height };
  }, [THEME_COLORS]);
  
  const drawQuestionScreen = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, question: AssessmentQuestion) => {
    const { boxX, boxY, boxWidth } = drawUiBox(ctx, canvas);
    const contentX = boxX + 40, contentWidth = boxWidth - 80, baseLineHeight = 28 * SCALE_FACTOR;
    let currentY = boxY + 60;
    ctx.fillStyle = THEME_COLORS.TEXT_BRIGHT; ctx.font = `600 ${20 * SCALE_FACTOR}px sans-serif`; ctx.textAlign = "center";
    ctx.fillText(`Round ${currentQuestionIndex + 1} / ${assessmentQuestions.length}`, canvas.width / 2, currentY);
    currentY += baseLineHeight * 2;
    ctx.textAlign = "left";
    currentY = wrapText(ctx, question.question, contentX, currentY, contentWidth, baseLineHeight * 1.2, THEME_COLORS.TEXT_BRIGHT, `bold ${24 * SCALE_FACTOR}px sans-serif`);
    currentY += baseLineHeight * 1.5;
    const optionFontSize = `${20 * SCALE_FACTOR}px sans-serif`;
    question.options.forEach((option, index) => {
        currentY = wrapText(ctx, `${enemyNames[index]}. ${option}`, contentX + 15, currentY, contentWidth - 30, baseLineHeight, THEME_COLORS.TEXT, optionFontSize);
        currentY += baseLineHeight * 0.5;
    });
    const buttonY = boxY + boxWidth * 0.5;
    clickableAreasRef.current = { startButton: { x: canvas.width/2 - 100, y: buttonY, width: 200, height: 50, action: 'start_round' } };
    ctx.fillStyle = THEME_COLORS.BUTTON; ctx.beginPath(); ctx.roundRect(clickableAreasRef.current.startButton.x, buttonY, 200, 50, 8); ctx.fill();
    ctx.fillStyle = THEME_COLORS.BUTTON_TEXT; ctx.font = `bold ${18 * SCALE_FACTOR}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Start Round", canvas.width / 2, buttonY + 25);
    ctx.textBaseline = "alphabetic";
  }, [currentQuestionIndex, assessmentQuestions.length, drawUiBox, wrapText, THEME_COLORS]);

  const drawExplanationScreen = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { boxX, boxY, boxWidth } = drawUiBox(ctx, canvas);
    const contentX = boxX + 40, contentWidth = boxWidth - 80, baseLineHeight = 28 * SCALE_FACTOR;
    let currentY = boxY + 60;
    ctx.fillStyle = THEME_COLORS.TEXT_BRIGHT; ctx.font = `bold ${24 * SCALE_FACTOR}px sans-serif`; ctx.textAlign = "center";
    ctx.fillText("Round Over", canvas.width / 2, currentY);
    currentY += baseLineHeight * 2.5;
    ctx.textAlign = "left";
    currentY = wrapText(ctx, explanationText, contentX, currentY, contentWidth, baseLineHeight * 1.2, THEME_COLORS.TEXT, `${20 * SCALE_FACTOR}px sans-serif`);
    const isLast = currentQuestionIndex >= assessmentQuestions.length - 1;
    const buttonText = isLast ? "Finish Game" : "Next Question";
    const buttonY = boxY + boxWidth * 0.5;
    clickableAreasRef.current = { nextButton: { x: canvas.width/2 - 100, y: buttonY, width: 200, height: 50, action: isLast ? 'finish_game' : 'next_question' } };
    ctx.fillStyle = THEME_COLORS.BUTTON; ctx.beginPath(); ctx.roundRect(clickableAreasRef.current.nextButton.x, buttonY, 200, 50, 8); ctx.fill();
    ctx.fillStyle = THEME_COLORS.BUTTON_TEXT; ctx.font = `bold ${18 * SCALE_FACTOR}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(buttonText, canvas.width / 2, buttonY + 25);
    ctx.textBaseline = "alphabetic";
  }, [explanationText, currentQuestionIndex, assessmentQuestions.length, drawUiBox, wrapText, THEME_COLORS]);

  const drawGameOverScreen = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { boxY } = drawUiBox(ctx, canvas);
    const baseLineHeight = 30 * SCALE_FACTOR;
    let currentY = boxY + 80;
    ctx.fillStyle = THEME_COLORS.TEXT_BRIGHT; ctx.font = `bold ${34 * SCALE_FACTOR}px sans-serif`; ctx.textAlign = "center";
    ctx.fillText("Assessment Complete!", canvas.width / 2, currentY);
    currentY += baseLineHeight * 2.5;
    ctx.font = `bold ${24 * SCALE_FACTOR}px sans-serif`;
    ctx.fillText(`Player Score: ${playerScore}`, canvas.width / 2, currentY);
    currentY += baseLineHeight * 1.5;
    ctx.fillText(`Enemy Score: ${enemyScore}`, canvas.width / 2, currentY);
    currentY += baseLineHeight * 2.5;
    const buttonY = currentY;
    clickableAreasRef.current = { restartButton: { x: canvas.width/2-100, y: buttonY, width: 200, height: 50, action: 'restart_game' } };
    ctx.fillStyle = THEME_COLORS.BUTTON; ctx.beginPath(); ctx.roundRect(clickableAreasRef.current.restartButton.x, buttonY, 200, 50, 8); ctx.fill();
    ctx.fillStyle = THEME_COLORS.BUTTON_TEXT; ctx.font = `bold ${18 * SCALE_FACTOR}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Restart Game", canvas.width / 2, buttonY + 25);
    ctx.textBaseline = "alphabetic";
  }, [playerScore, enemyScore, drawUiBox, THEME_COLORS]);

  const drawGameScene = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const cw = canvas.width, ch = canvas.height;
    drawBackground(ctx, canvas, parallaxOffset);
    ctx.fillStyle = THEME_COLORS.GROUND; ctx.fillRect(0, ch * 0.8, cw, ch * 0.2);
    const healthBarThickness = 4 * SCALE_FACTOR;
    if (positions.player.x > 0) {
        const px = positions.player.x - PLATFORM_WIDTH/2, py = positions.player.platformY;
        ctx.fillStyle = THEME_COLORS.PLATFORM; ctx.fillRect(px, py, PLATFORM_WIDTH, PLATFORM_HEIGHT);
        ctx.fillStyle = THEME_COLORS.PLAYER_HEALTH_BAR; ctx.fillRect(px, py, PLATFORM_WIDTH, healthBarThickness);
        drawPlayerArcher(ctx, positions.player.x, positions.player.y, angle, power);
    }
    positions.enemies.forEach((e) => {
        const px = e.x - PLATFORM_WIDTH/2, py = e.platformY;
        ctx.fillStyle = THEME_COLORS.PLATFORM; ctx.fillRect(px, py, PLATFORM_WIDTH, PLATFORM_HEIGHT);
        ctx.fillStyle = THEME_COLORS.ENEMY_HEALTH_BAR; ctx.fillRect(px, py, PLATFORM_WIDTH, healthBarThickness);
        const aiState = enemyAiRef.current[e.id];
        drawEnemyArcher(ctx, e.x, e.y, e.name, aiState?.isDrawingBow ? aiState.drawProgress : 0);
    });
    if (gameState === 'playing' && !playerArrow && positions.player.x > 0) {
        const angleRad = (-angle*Math.PI)/180, armLength = 20*SCALE_FACTOR, shoulderY = positions.player.y - 55*SCALE_FACTOR;
        const handX = positions.player.x + armLength*Math.cos(angleRad), handY = shoulderY + armLength*Math.sin(angleRad);
        const arrowStartX = handX - 18*SCALE_FACTOR*0.5*Math.cos(angleRad), arrowStartY = handY - 18*SCALE_FACTOR*0.5*Math.sin(angleRad);
        const speed = 9*Math.sqrt(SCALE_FACTOR) + (power/100)*18*Math.sqrt(SCALE_FACTOR);
        const initialVx = speed * Math.cos(angleRad), initialVy = speed * Math.sin(angleRad);
        drawTrajectoryPreview(ctx, calculateTrajectoryPoints(arrowStartX, arrowStartY, initialVx, initialVy));
    }
    if (playerArrow) drawArrow(ctx, playerArrow.x, playerArrow.y, Math.atan2(playerArrow.vy, playerArrow.vx), playerArrow.trail);
    if(enemyArrows) {
        enemyArrows.forEach(a => drawArrow(ctx, a.x, a.y, Math.atan2(a.vy, a.vx), a.trail));
    }
  }, [positions, angle, power, playerArrow, enemyArrows, gameState, parallaxOffset, drawBackground, drawPlayerArcher, drawEnemyArcher, drawArrow, drawTrajectoryPreview, calculateTrajectoryPoints]);

  const firePlayerArrow = useCallback(() => {
    if (gameState !== 'playing' || playerArrow || positions.player.x <= 0) return;
    const angleRad = (-angle * Math.PI) / 180, armLength = 20 * SCALE_FACTOR, shoulderY = positions.player.y - 55 * SCALE_FACTOR;
    const handX = positions.player.x + armLength * Math.cos(angleRad), handY = shoulderY + armLength * Math.sin(angleRad);
    const arrowStartX = handX - 18*SCALE_FACTOR * 0.5 * Math.cos(angleRad), arrowStartY = handY - 18*SCALE_FACTOR * 0.5 * Math.sin(angleRad);
    const speed = 9*Math.sqrt(SCALE_FACTOR) + (power/100)*18*Math.sqrt(SCALE_FACTOR);
    setPlayerArrow({
        x: arrowStartX, y: arrowStartY, vx: speed * Math.cos(angleRad), vy: speed * Math.sin(angleRad),
        id: Date.now(), minMissDistance: Infinity, trail: [{ x: arrowStartX, y: arrowStartY }]
    });
  }, [gameState, playerArrow, positions, angle, power]);

  // Effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1000; canvas.height = 600;
    setCtx(canvas.getContext("2d"));
    const fetchAssessmentData = async () => {
        setGameState('loading');
        try {
            const response = await fetch(ASSESSMENT_API_URL);
            if (!response.ok) throw new Error(`API failed: ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data) || !data[0]?.question) throw new Error("Invalid data format");
            setAssessmentQuestions(data);
        } catch (error) {
            console.error("Fetch error, using fallback:", error);
            setAssessmentQuestions(fallbackAssessmentData);
        }
        setCurrentQuestionIndex(0); setPlayerScore(0); setEnemyScore(0);
        setGameState('showing_question');
    };
    fetchAssessmentData();
  }, []);

  useEffect(() => {
    enemyArrowsRef.current = enemyArrows;
  }, [enemyArrows]);

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !ctx) return;
      const handleClick = (event: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
          const canvasX = (event.clientX - rect.left) * scaleX, canvasY = (event.clientY - rect.top) * scaleY;
          const areas = clickableAreasRef.current;
          for (const key in areas) {
              const area = areas[key];
              if (canvasX >= area.x && canvasX <= area.x + area.width && canvasY >= area.y && canvasY <= area.y + area.height) {
                   clickableAreasRef.current = {};
                   if (gameState === 'showing_question' && area.action === 'start_round') { startArcheryRound(); return; }
                   if (gameState === 'showing_explanation') {
                       if (area.action === 'next_question') { setCurrentQuestionIndex(p => p + 1); setGameState('showing_question'); return; }
                       if (area.action === 'finish_game') { setGameState('game_over'); return; }
                   }
                   if (gameState === 'game_over' && area.action === 'restart_game') {
                       setPlayerScore(0); setEnemyScore(0); setCurrentQuestionIndex(0); setGameState('showing_question'); return;
                   }
              }
          }
      };
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
  }, [ctx, gameState, startArcheryRound]);

  // Main Game Loop
  useEffect(() => {
    if (!ctx) return;
    let lastTimestamp = 0; let isActive = true;
    const animate = (timestamp: number) => {
      if (!isActive || !ctx || !canvasRef.current) return;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      clickableAreasRef.current = {};
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      switch (gameState) {
        case 'loading':
            drawBackground(ctx, canvasRef.current, 0);
            ctx.fillStyle = THEME_COLORS.TEXT_BRIGHT; ctx.font = `bold ${24*SCALE_FACTOR}px sans-serif`;
            ctx.textAlign="center"; ctx.fillText("Loading Questions...", canvasRef.current.width/2, canvasRef.current.height/2);
            break;
        case 'showing_question':
            drawBackground(ctx, canvasRef.current, 0);
            if (assessmentQuestions.length > 0) drawQuestionScreen(ctx, canvasRef.current, assessmentQuestions[currentQuestionIndex]);
            break;
        case 'showing_explanation':
            drawBackground(ctx, canvasRef.current, parallaxOffset);
            drawGameScene(ctx, canvasRef.current);
            drawExplanationScreen(ctx, canvasRef.current);
            break;
        case 'game_over':
            drawBackground(ctx, canvasRef.current, 0);
            drawGameOverScreen(ctx, canvasRef.current);
            break;
        case 'playing':
          if (deltaTime > 0 && assessmentQuestions.length > 0) {
            // *** FIX HERE: Slow down the parallax effect ***
            const PARALLAX_SPEED = 0.0001; 
            setParallaxOffset(p =>
              (p + PARALLAX_SPEED * deltaTime) % (canvasRef.current!.width * 4)
);
            
            // AI updates
            if (enemyCanFire) {
              enemyAiRef.current.forEach((ai, i) => {
                if (!ai.isDrawingBow) {
                    ai.nextShotDelay -= deltaTime;
                    if (ai.nextShotDelay <= 0 && !enemyArrowsRef.current.some(a => a.enemyIndex === i)) {
                        ai.isDrawingBow = true; ai.drawProgress = 0; ai.firePending = true;
                    }
                } else {
                    ai.drawProgress += deltaTime / ai.drawDuration;
                    if (ai.drawProgress >= 1) {
                        ai.drawProgress = 1;
                        if (ai.firePending) {
                            ai.isDrawingBow = false; ai.firePending = false; ai.drawProgress = 0;
                            fireEnemyArrow(i);
                        }
                    }
                }
              });
            }

            // Physics & Hit Detection
            const canvas = canvasRef.current, groundLevel = canvas.height - 40*SCALE_FACTOR;
            if (playerArrow) {
                const newVx = playerArrow.vx, newVy = playerArrow.vy + GRAVITY;
                const newX = playerArrow.x + newVx, newY = playerArrow.y + newVy;
                let hit = false;
                if(newY > groundLevel || newX < -50 || newX > canvas.width + 50) { setPlayerArrow(null); hit = true; }
                else {
                    for(let i=0; i<positions.enemies.length; i++) {
                        const e = positions.enemies[i];
                        if(Math.hypot(newX - e.x, newY - (e.y-30*SCALE_FACTOR)) < ENEMY_HIT_RADIUS) {
                            if(enemyAiRef.current[e.id]?.power === 1) handleHit("Player", {hitPosition: {x:newX, y:newY}});
                            else createExplosion(newX, newY, THEME_COLORS.PARTICLE_HIT);
                            setPlayerArrow(null); hit=true; break;
                        }
                    }
                }
                if (!hit) setPlayerArrow(p => p ? {...p, x:newX, y:newY, vx:newVx, vy:newVy, trail: [...p.trail, {x:newX, y:newY}].slice(-15)} : null);
            }
            if (enemyArrows.length > 0) {
                const nextEnemyArrows = enemyArrows.map(a => {
                    if (!a) return null;
                    const newVx = a.vx, newVy = a.vy + GRAVITY;
                    const newX = a.x + newVx, newY = a.y + newVy;
                    const distPlayer = Math.hypot(newX - positions.player.x, newY - (positions.player.y - 30*SCALE_FACTOR));
                    if (newY > groundLevel || newX < -50 || newX > canvas.width + 50) { if(a.enemyIndex !== undefined) learnFromMiss(a.enemyIndex, a.minMissDistance); return null; }
                    if (distPlayer < PLAYER_HIT_RADIUS) {
                        if(a.power === 1) handleHit("Enemy", {hitPosition: {x:newX, y:newY}});
                        else { setPlayerHitFlash(10); createExplosion(newX, newY, THEME_COLORS.PARTICLE_HIT); }
                        if(a.enemyIndex !== undefined) learnFromMiss(a.enemyIndex, distPlayer); return null;
                    }
                    return {...a, x:newX, y:newY, vx:newVx, vy:newVy, minMissDistance: Math.min(a.minMissDistance, distPlayer), trail: [...a.trail, {x:newX, y:newY}].slice(-15) };
                }).filter(Boolean) as Arrow[];
                setEnemyArrows(nextEnemyArrows);
            }
            
            // Particles
            setParticles(p => p.map(particle => ({...particle, x: particle.x+particle.vx, y: particle.y+particle.vy, vy: particle.vy+0.05, life: particle.life - 1})).filter(p => p.life > 0));
          }
          // Draw game
          drawGameScene(ctx, canvasRef.current);
          if (playerHitFlash > 0) { ctx.fillStyle='rgba(255,0,0,0.2)'; ctx.fillRect(0,0,canvasRef.current.width, canvasRef.current.height); setPlayerHitFlash(p => p-1); }
          particles.forEach(p => { ctx.fillStyle = p.color; ctx.globalAlpha = p.life / 30; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); });
          ctx.globalAlpha = 1.0;
          break;
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => { isActive = false; if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [ ctx, gameState, enemyCanFire, playerArrow, enemyArrows, positions, particles, playerHitFlash, parallaxOffset,
    assessmentQuestions, currentQuestionIndex, explanationText, playerScore, enemyScore,
    drawGameScene, drawQuestionScreen, drawExplanationScreen, drawGameOverScreen,
    firePlayerArrow, learnFromMiss, handleHit, createExplosion ]);

  return (
    <div className="archery-game-container">
      <div className="scoreboard scoreboard-top-left">
        <h3>Player</h3>
        <p>Score: {playerScore}</p>
      </div>
      <div className="scoreboard scoreboard-top-right">
        <h3>Enemies</h3>
        <p>Score: {enemyScore}</p>
      </div>

      <canvas ref={canvasRef} className="game-canvas" />

      <div className="controls-area">
        {gameState === 'playing' && positions.player.x !== 0 && (
          <div className="bottom-controls">
            <div className="control-set">
              <label>Angle: {angle}°</label>
              <Slider value={[angle]} onValueChange={(v) => setAngle(v[0])} min={0} max={90} step={1} disabled={!!playerArrow} className="w-48" />
            </div>
            <div className="control-set">
              <label>Power: {power}</label>
              <Slider value={[power]} onValueChange={(v) => setPower(v[0])} min={10} max={100} step={1} disabled={!!playerArrow} className="w-48" />
            </div>
            <Button onClick={firePlayerArrow} disabled={!!playerArrow} className="fire-button">
              FIRE
            </Button>
          </div>
        )}
         {gameState === 'loading' && ( <div className="loading-overlay">Loading...</div> )}
      </div>
    </div>
  );
};

export default ArcheryGame;