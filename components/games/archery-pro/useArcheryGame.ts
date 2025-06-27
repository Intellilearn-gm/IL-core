import { useEffect, useRef, useState, useCallback } from 'react';
import {
  NUM_ENEMIES,
  SCALE_FACTOR,
  MIN_ENEMY_DISTANCE,
  PLAYER_HIT_RADIUS,
  ENEMY_HIT_RADIUS,
  GRAVITY,
  BASE_ENEMY_SPEED,
  ENEMY_FIRETIME,
  ENEMY_NAMES,
  ASSESSMENT_API_URL,
  fallbackAssessmentData,
  THEME_COLORS,
} from './constants';
import { AssessmentQuestion, Position, Arrow, EnemyAIState } from './types';

type GameState = 'loading' | 'showing_question' | 'playing' | 'showing_explanation' | 'game_over' | 'error';

export function useArcheryGame(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const requestRef = useRef<number>();
  const enemyArrowsRef = useRef<Arrow[]>([]);
  const enemyAiRef = useRef<EnemyAIState[]>([]);
  const clickableAreasRef = useRef<Record<string, any>>({});
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [enemyCanFire, setEnemyCanFire] = useState(false);

  // Game State Management
  const [gameState, setGameState] = useState<GameState>('loading');
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [explanationText, setExplanationText] = useState('');

  // Game statistics
  const [playerScore, setPlayerScore] = useState(0);
  const [enemyScore, setEnemyScore] = useState(0);
  const [playerShots, setPlayerShots] = useState(0);
  const [enemyTotalShots, setEnemyTotalShots] = useState(0);

  // Player controls
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);

  // Arrow objects in flight
  const [playerArrow, setPlayerArrow] = useState<Arrow | null>(null);
  const [enemyArrows, setEnemyArrows] = useState<Arrow[]>([]);

  // Character positions
  const [positions, setPositions] = useState<{
    player: Position;
    enemies: Position[];
  }>({
    player: { x: 0, y: 0, platformY: 0 },
    enemies: [],
  });

  // Constants derived from scale factor
  const PLATFORM_HEIGHT = 15 * SCALE_FACTOR;
  const PLATFORM_WIDTH = 60 * SCALE_FACTOR;
  const CHARACTER_FOOT_OFFSET = 5 * SCALE_FACTOR;

  // Utility Functions
  const createInitialAiState = useCallback((index: number, power = 0): EnemyAIState => ({
    id: index,
    lastAngle: 0,
    lastSpeed: BASE_ENEMY_SPEED * (0.8 + Math.random() * 0.4),
    missDistance: 0,
    improvementFactor: 0.25 + (Math.random() - 0.5) * 0.1,
    nextShotDelay: Math.random() * 1500 + 1000,
    shotsFired: 0,
    power,
    isDrawingBow: false,
    drawProgress: 0,
    drawDuration: 300,
    firePending: false,
  }), []);

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
      y: playerPlatformY - CHARACTER_FOOT_OFFSET,
    };

    const enemies = [];
    const enemyPlacementAttempts = 100;
    const safeZoneFromPlayer = MIN_ENEMY_DISTANCE * 1.2;
    const enemyMinX = playerMaxX + 50 * SCALE_FACTOR + PLATFORM_WIDTH / 2;
    const enemyMaxX = canvas.width - 50 * SCALE_FACTOR - PLATFORM_WIDTH / 2;

    for (let i = 0; i < NUM_ENEMIES; i++) {
      let enemyPlatformX, enemyPlatformY;
      let validPosition = false;
      let attempts = 0;
      while (!validPosition && attempts < enemyPlacementAttempts) {
        attempts++;
        enemyPlatformX = Math.random() * (enemyMaxX - enemyMinX) + enemyMinX;
        enemyPlatformY = Math.random() * (platformMaxY - platformMinY) + platformMinY;

        const dxPlayer = enemyPlatformX - playerPos.x;
        if (Math.abs(dxPlayer) < safeZoneFromPlayer) continue;

        let tooCloseToOtherEnemy = false;
        for (let j = 0; j < enemies.length; j++) {
          const dxEnemy = enemyPlatformX - enemies[j].tempX;
          if (Math.abs(dxEnemy) < MIN_ENEMY_DISTANCE) {
            tooCloseToOtherEnemy = true;
            break;
          }
        }
        if (!tooCloseToOtherEnemy) validPosition = true;
      }
      enemies.push({ tempX: enemyPlatformX, tempY: enemyPlatformY });
    }

    enemies.sort((a, b) => a.tempX - b.tempX);

    const finalEnemies = enemies.map((pos, i) => ({
      x: pos.tempX,
      platformY: pos.tempY,
      y: pos.tempY - CHARACTER_FOOT_OFFSET,
      id: i,
      name: ENEMY_NAMES[i],
    }));

    return { player: playerPos, enemies: finalEnemies };
  }, [PLATFORM_WIDTH, PLATFORM_HEIGHT, CHARACTER_FOOT_OFFSET, MIN_ENEMY_DISTANCE]);

  const startArcheryRound = useCallback(() => {
    if (assessmentQuestions.length === 0 || currentQuestionIndex >= assessmentQuestions.length) {
      console.error('Attempted to start round without valid questions/index.');
      setExplanationText('Error: Question data is not available. Cannot start round.');
      setGameState('error');
      return;
    }
    console.log(`Starting Round ${currentQuestionIndex + 1}`);

    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    const correctOptionIndex = currentQuestion?.Correct_option_index;

    if (typeof correctOptionIndex !== 'number' || correctOptionIndex < 0 || correctOptionIndex >= NUM_ENEMIES) {
      console.error(`Invalid Correct_option_index (${correctOptionIndex}) in question data:`, currentQuestion);
      setExplanationText(`Error: Invalid correct answer index (${correctOptionIndex}) received for question ${currentQuestionIndex + 1}. Required range 0-${NUM_ENEMIES - 1}.`);
      setGameState('error');
      return;
    }
    console.log(`Correct option index for this round: ${correctOptionIndex}. Enemy ${ENEMY_NAMES[correctOptionIndex]} (ID: ${correctOptionIndex}) is critical.`);

    setPlayerShots(0);
    setEnemyTotalShots(0);
    setPlayerArrow(null);
    setEnemyArrows([]);
    enemyArrowsRef.current = [];

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const newPositions = generateRandomPositions(canvas);
      setPositions(newPositions);

      enemyAiRef.current = Array.from({ length: NUM_ENEMIES }, (_, i) => {
        const power = i === correctOptionIndex ? 1 : 0;
        return createInitialAiState(i, power);
      });
      console.log('Initialized Enemy AI states for round:', enemyAiRef.current);
    } else {
      console.error('Canvas ref not found in startArcheryRound');
      setExplanationText('Error: Canvas element disappeared.');
      setGameState('error');
      return;
    }

    setEnemyCanFire(false);
    setTimeout(() => setEnemyCanFire(true), ENEMY_FIRETIME);

    setGameState('playing');
  }, [generateRandomPositions, assessmentQuestions, currentQuestionIndex, createInitialAiState]);

  const fireEnemyArrow = useCallback((enemyIndex: number) => {
    if (gameState !== 'playing') return;

    const enemy = positions.enemies[enemyIndex];
    const enemyAi = enemyAiRef.current[enemyIndex];

    if (!enemy || !enemyAi || enemyArrowsRef.current.some(arrow => arrow.enemyIndex === enemyIndex)) {
      return;
    }

    enemyAi.shotsFired++;
    setEnemyTotalShots(prev => prev + 1);

    const bodyTopOffsetY = -60 * SCALE_FACTOR;
    const armLength = 20 * SCALE_FACTOR;
    const bowAnchorX = enemy.x - armLength * 0.5;
    const bowAnchorY = enemy.y + bodyTopOffsetY;

    const targetX = positions.player.x;
    const targetY = positions.player.y - 30 * SCALE_FACTOR;

    const dx = targetX - bowAnchorX;
    const dy = targetY - bowAnchorY;
    const baseAngleRad = Math.atan2(dy, dx);
    const launchAngleRad = baseAngleRad + enemyAi.lastAngle;
    const launchSpeed = enemyAi.lastSpeed;

    const newArrow: Arrow = {
      x: bowAnchorX,
      y: bowAnchorY,
      vx: launchSpeed * Math.cos(launchAngleRad),
      vy: launchSpeed * Math.sin(launchAngleRad),
      id: Date.now() + Math.random(),
      enemyIndex,
      minMissDistance: Infinity,
      power: enemyAi.power,
    };

    setEnemyArrows(prev => {
      const updatedArrows = [...prev, newArrow];
      enemyArrowsRef.current = updatedArrows;
      return updatedArrows;
    });

    enemyAi.missDistance = 0;
    enemyAi.nextShotDelay = Math.random() * 2000 + 1500;
  }, [gameState, positions]);

  const learnFromMiss = useCallback((enemyIndex: number, missDistance: number) => {
    if (gameState !== 'playing' || !enemyAiRef.current[enemyIndex]) return;

    const enemyAi = enemyAiRef.current[enemyIndex];
    const factor = enemyAi.improvementFactor;
    let angleChange = 0;
    let speedChange = 0;

    const missSeverity = Math.min(1, missDistance / (300 * SCALE_FACTOR));
    angleChange = (Math.random() - 0.5) * 0.1 * factor * (1 + missSeverity);
    speedChange = (Math.random() - 0.5) * 1.5 * factor * (1 + missSeverity);

    if (missDistance > 100 * SCALE_FACTOR) speedChange *= 1.2;
    else if (missDistance < 40 * SCALE_FACTOR) angleChange *= 1.2;

    enemyAi.lastAngle += angleChange;
    enemyAi.lastSpeed += speedChange;
    enemyAi.lastSpeed = Math.max(
      BASE_ENEMY_SPEED * 0.6,
      Math.min(BASE_ENEMY_SPEED * 1.6, enemyAi.lastSpeed)
    );
  }, [gameState]);

  const handleHit = useCallback((winner: string, targetInfo: any = null) => {
    if (gameState !== 'playing') return;

    console.log(`${winner} scored a critical hit! Round ${currentQuestionIndex + 1} over.`);
    setGameState('showing_explanation');
    setPlayerArrow(null);

    if (currentQuestionIndex < assessmentQuestions.length) {
      setExplanationText(assessmentQuestions[currentQuestionIndex].explanation);
    } else {
      console.error('Error: Question data not found for explanation at index', currentQuestionIndex);
      setExplanationText('Explanation not available.');
    }

    if (winner === 'Player') {
      setPlayerScore(prev => prev + 1);
      console.log('Player hit critical enemy:', targetInfo);
    } else {
      setEnemyScore(prev => prev + 1);
      console.log('Critical enemy arrow hit player:', targetInfo);
    }
  }, [gameState, currentQuestionIndex, assessmentQuestions]);

  const firePlayerArrow = useCallback(() => {
    if (gameState !== 'playing' || playerArrow || positions.player.x <= 0) return;
    setPlayerShots(prev => prev + 1);

    const angleRad = (-angle * Math.PI) / 180;
    const armLength = 20 * SCALE_FACTOR;
    const bodyTopOffsetY = -60 * SCALE_FACTOR + 5 * SCALE_FACTOR;
    const shoulderY = positions.player.y + bodyTopOffsetY;
    const handX = positions.player.x + armLength * Math.cos(angleRad);
    const handY = shoulderY + armLength * Math.sin(angleRad);
    const bowRadius = 18 * SCALE_FACTOR;
    const arrowStartX = handX - bowRadius * 0.5 * Math.cos(angleRad);
    const arrowStartY = handY - bowRadius * 0.5 * Math.sin(angleRad);
    const baseSpeed = 9 * Math.sqrt(SCALE_FACTOR);
    const powerMultiplier = 18 * Math.sqrt(SCALE_FACTOR);
    const speed = baseSpeed + (power / 100) * powerMultiplier;

    setPlayerArrow({
      x: arrowStartX,
      y: arrowStartY,
      vx: speed * Math.cos(angleRad),
      vy: speed * Math.sin(angleRad),
      id: Date.now(),
    });
  }, [gameState, playerArrow, positions, angle, power]);

  // Effects
  useEffect(() => {
    console.log('Game component mounted');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref not found on mount');
      setExplanationText('Fatal Error: Canvas element not found.');
      setGameState('error');
      return;
    }

    canvas.width = 1000;
    canvas.height = 600;
    const context = canvas.getContext('2d');
    setCtx(context);
    console.log(`Canvas initialized: ${canvas.width}x${canvas.height}`);

    const fetchAssessmentData = async () => {
      console.log('Fetching assessment data from:', ASSESSMENT_API_URL);
      setGameState('loading');
      try {
        const response = await fetch(ASSESSMENT_API_URL);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid data format: Expected non-empty array.');
        }
        if (!data[0] || typeof data[0].question !== 'string' || !Array.isArray(data[0].options) || typeof data[0].Correct_option_index !== 'number' || data[0].options.length > NUM_ENEMIES) {
          throw new Error(`Data structure validation failed or too many options (max ${NUM_ENEMIES}) in question 0.`);
        }

        console.log('Assessment data fetched successfully:', data);
        setAssessmentQuestions(data);
        setCurrentQuestionIndex(0);
        setPlayerScore(0);
        setEnemyScore(0);
        setGameState('showing_question');
      } catch (error) {
        console.error('Failed to fetch or validate assessment data:', error);
        console.log('Using fallback assessment data.');
        setAssessmentQuestions(fallbackAssessmentData);
        setCurrentQuestionIndex(0);
        setPlayerScore(0);
        setEnemyScore(0);
        setGameState('showing_question');
        setExplanationText(`Warning: ${error instanceof Error ? error.message : 'Unknown error'}. Using fallback questions.`);
      }
    };

    fetchAssessmentData();

    return () => {
      console.log('Game component unmounting');
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  useEffect(() => {
    enemyArrowsRef.current = enemyArrows;
  }, [enemyArrows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = (event.clientX - rect.left) * scaleX;
      const canvasY = (event.clientY - rect.top) * scaleY;

      const areas = clickableAreasRef.current;

      for (const key in areas) {
        const area = areas[key];
        if (
          canvasX >= area.x && canvasX <= area.x + area.width &&
          canvasY >= area.y && canvasY <= area.y + area.height
        ) {
          console.log(`Clicked on UI element: ${key}, action: ${area.action}`);
          clickableAreasRef.current = {};

          if (gameState === 'showing_question' && area.action === 'start_round') {
            startArcheryRound();
            return;
          }
          if (gameState === 'showing_explanation') {
            if (area.action === 'next_question') {
              setCurrentQuestionIndex(prev => prev + 1);
              setGameState('showing_question');
              return;
            } else if (area.action === 'finish_game') {
              setGameState('game_over');
              return;
            }
          }
          if (gameState === 'game_over' && area.action === 'restart_game') {
            setPlayerScore(0);
            setEnemyScore(0);
            setCurrentQuestionIndex(0);
            setGameState('showing_question');
            return;
          }
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [ctx, gameState, startArcheryRound]);

  useEffect(() => {
    if (!ctx) return;

    let lastTimestamp = 0;
    let isActive = true;

    const animate = (timestamp: number) => {
      if (!isActive || !ctx || !canvasRef.current) return;

      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      clickableAreasRef.current = {};

      ctx.fillStyle = THEME_COLORS.BACKGROUND;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      switch (gameState) {
        case 'loading':
          ctx.fillStyle = THEME_COLORS.TEXT;
          ctx.font = `bold ${24 * SCALE_FACTOR}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Loading Questions...', canvasRef.current.width / 2, canvasRef.current.height / 2);
          ctx.textBaseline = 'alphabetic';
          break;

        case 'error':
          ctx.fillStyle = 'red';
          ctx.font = `bold ${20 * SCALE_FACTOR}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(explanationText || 'An unexpected error occurred. Please refresh.', canvasRef.current.width / 2, canvasRef.current.height / 2);
          ctx.textBaseline = 'alphabetic';
          break;

        case 'playing':
          if (deltaTime > 0 && assessmentQuestions.length > 0) {
            if (enemyCanFire && enemyAiRef.current.length === NUM_ENEMIES) {
              enemyAiRef.current.forEach((aiState, index) => {
                if (!aiState) return;

                if (!aiState.isDrawingBow) {
                  aiState.nextShotDelay -= deltaTime;
                  if (aiState.nextShotDelay <= 0 && !enemyArrowsRef.current.some(a => a.enemyIndex === index)) {
                    aiState.isDrawingBow = true;
                    aiState.drawProgress = 0;
                    aiState.firePending = true;
                  }
                } else {
                  aiState.drawProgress += deltaTime / aiState.drawDuration;
                  if (aiState.drawProgress >= 1) {
                    aiState.drawProgress = 1;
                    if (aiState.firePending) {
                      aiState.isDrawingBow = false;
                      aiState.firePending = false;
                      aiState.drawProgress = 0;
                      fireEnemyArrow(index);
                    }
                  }
                }
              });
            }

            const canvas = canvasRef.current;
            const groundLevel = canvas.height - (40 * SCALE_FACTOR);
            const outOfBoundsMargin = 100 * SCALE_FACTOR;

            if (playerArrow) {
              const newVx = playerArrow.vx;
              const newVy = playerArrow.vy + GRAVITY;
              const newX = playerArrow.x + newVx;
              const newY = playerArrow.y + newVy;
              let hitDetected = false;

              if (newX < -outOfBoundsMargin || newX > canvas.width + outOfBoundsMargin || newY > groundLevel + 10) {
                setPlayerArrow(null);
                hitDetected = true;
              } else {
                for (let i = 0; i < positions.enemies.length; i++) {
                  const enemy = positions.enemies[i];
                  if (!enemy) continue;
                  const enemyCenterX = enemy.x;
                  const enemyCenterY = enemy.y - 30 * SCALE_FACTOR;
                  const dx = newX - enemyCenterX;
                  const dy = newY - enemyCenterY;
                  if (Math.sqrt(dx * dx + dy * dy) < ENEMY_HIT_RADIUS) {
                    const enemyId = enemy.id;
                    const enemyPowerVal = enemyAiRef.current[enemyId]?.power ?? 0;

                    if (enemyPowerVal === 1) {
                      handleHit('Player', { enemyIndex: i, enemyId });
                    } else {
                      console.log(`Player hit non-critical enemy ${ENEMY_NAMES[enemyId]} (Power: ${enemyPowerVal})`);
                    }
                    setPlayerArrow(null);
                    hitDetected = true;
                    break;
                  }
                }
              }
              if (!hitDetected) {
                setPlayerArrow(prev => prev ? { ...prev, x: newX, y: newY, vx: newVx, vy: newVy } : null);
              }
            }

            if (enemyArrows.length > 0) {
              const nextEnemyArrows: Arrow[] = [];
              let updateState = false;

              for (const arrow of enemyArrows) {
                const newVx = arrow.vx;
                const newVy = arrow.vy + GRAVITY;
                const newX = arrow.x + newVx;
                const newY = arrow.y + newVy;
                let arrowRemoved = false;

                if (newX < -outOfBoundsMargin || newX > canvas.width + outOfBoundsMargin || newY > groundLevel + 10) {
                  if (enemyAiRef.current[arrow.enemyIndex!]) {
                    learnFromMiss(arrow.enemyIndex!, arrow.minMissDistance!);
                  }
                  arrowRemoved = true;
                  updateState = true;
                } else {
                  if (!positions.player || positions.player.x === 0) {
                    nextEnemyArrows.push({ ...arrow, x: newX, y: newY, vx: newVx, vy: newVy });
                    updateState = true;
                    continue;
                  }
                  const playerCenterX = positions.player.x;
                  const playerCenterY = positions.player.y - 30 * SCALE_FACTOR;
                  const dxPlayer = newX - playerCenterX;
                  const dyPlayer = newY - playerCenterY;
                  const distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
                  const currentMinMiss = Math.min(arrow.minMissDistance!, distPlayer);

                  if (distPlayer < PLAYER_HIT_RADIUS) {
                    if (arrow.power === 1) {
                      handleHit('Enemy', { enemyIndex: arrow.enemyIndex, arrowId: arrow.id });
                    } else {
                      console.log(`Non-critical arrow (Power: ${arrow.power}) from enemy ${ENEMY_NAMES[arrow.enemyIndex!]} hit player`);
                    }
                    if (enemyAiRef.current[arrow.enemyIndex!]) {
                      learnFromMiss(arrow.enemyIndex!, distPlayer);
                    }
                    arrowRemoved = true;
                    updateState = true;
                  } else {
                    nextEnemyArrows.push({ ...arrow, x: newX, y: newY, vx: newVx, vy: newVy, minMissDistance: currentMinMiss });
                    if (Math.abs(newX - arrow.x) > 0.1 || Math.abs(newY - arrow.y) > 0.1) {
                      updateState = true;
                    }
                  }
                }
              }

              if (updateState) {
                setEnemyArrows(nextEnemyArrows);
              }
            }
          }
          break;

        default:
          if (ctx) {
            ctx.fillStyle = 'grey';
            ctx.fillText(`Unknown State: ${gameState}`, 100, 100);
          }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    };
  }, [
    ctx,
    gameState,
    enemyCanFire,
    playerArrow,
    enemyArrows,
    positions,
    assessmentQuestions,
    currentQuestionIndex,
    explanationText,
    fireEnemyArrow,
    learnFromMiss,
    handleHit,
  ]);

  return {
    // State
    gameState,
    assessmentQuestions,
    currentQuestionIndex,
    explanationText,
    playerScore,
    enemyScore,
    playerShots,
    enemyTotalShots,
    angle,
    power,
    playerArrow,
    enemyArrows,
    positions,
    enemyCanFire,
    ctx,
    clickableAreasRef,

    // Actions
    setAngle,
    setPower,
    firePlayerArrow,
    startArcheryRound,
    setGameState,
    setCurrentQuestionIndex,
    setPlayerScore,
    setEnemyScore,
  };
} 