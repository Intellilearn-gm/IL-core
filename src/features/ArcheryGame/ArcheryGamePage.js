import React, { useEffect, useRef, useState, useCallback } from "react";
import "./ArcheryGame.css"; // Make sure you have an updated CSS file

// --- Constants ---
const NUM_ENEMIES = 4; // IMPORTANT: Ensure this matches the max number of options your questions will have
const SCALE_FACTOR = 0.7;
const MIN_ENEMY_DISTANCE = 80 * SCALE_FACTOR;
const PLAYER_HIT_RADIUS = 25 * SCALE_FACTOR;
const ENEMY_HIT_RADIUS = 38 * SCALE_FACTOR;
const GRAVITY = 0.25 * SCALE_FACTOR;
const BASE_ENEMY_SPEED = 14 * Math.sqrt(SCALE_FACTOR);
const enemy_firetime = 2000; // Delay before enemies start considering firing
const enemyNames = ["A", "B", "C", "D"]; // Corresponds to option indices 0, 1, 2, 3 after sorting
const ASSESSMENT_API_URL = "http://localhost:3000/generate-question?topic=blockchain_basics"; // Your API Endpoint

// --- Fallback Assessment Data ---
// Used if the API call fails or returns invalid data
const fallbackAssessmentData = [
    {
        "question": "What is a blockchain?",
        "options": [
            "A centralized database",
            "A peer-to-peer network of digital files",
            "A distributed ledger of transactions",
            "A form of cryptocurrency"
        ],
        "Correct_option_index": 2, // Enemy C (index 2) is critical
        "difficulty": 1,
        "category": "Basics",
        "explanation": "Blockchain is a distributed ledger technology that records transactions across multiple computers to ensure the security and accuracy of data.",
        "round": 1
    },
    {
        "question": "Which provides security against tampering?",
        "options": [
            "Public keys",
            "Smart contracts",
            "Cryptographic hashing",
            "Decentralization"
        ],
        "Correct_option_index": 2, // Enemy C (index 2) is critical
        "difficulty": 2,
        "category": "Theory",
        "explanation": "Cryptographic hashing ensures that the data cannot be altered without being detected, as each block contains a hash of the previous block.",
        "round": 2
    },
    {
        "question": ":What is the role of miners?",
        "options": [
            "To create new blocks by solving problems",
            "To verify transactions and add them",
            "To provide liquidity",
            "To act as intermediaries"
        ],
        "Correct_option_index": 1, // Enemy B (index 1) is critical
        "difficulty": 3,
        "category": "Applications",
        "explanation": "Miners verify transactions and compile them into blocks, which are then added to the blockchain, ensuring security and transparency.",
        "round": 3
    },
    {
        "question": "What is a 'smart contract'?",
        "options": [
            "A physical mining contract",
            "A type of virtual currency",
            "A self-executing contract in code",
            "A manual agreement"
        ],
        "Correct_option_index": 2, // Enemy C (index 2) is critical
        "difficulty": 2,
        "category": "Applications",
        "explanation": "A smart contract is a self-executing contract with the terms of the agreement between buyer and seller being directly written into lines of code.",
        "round": 4
    },
    {
        "question": "Feature of public blockchain networks?",
        "options": [
            "Restricted access",
            "Private/encrypted data",
            "Anyone can join and validate",
            "Primarily for enterprise use"
        ],
        "Correct_option_index": 2, // Enemy C (index 2) is critical
        "difficulty": 1,
        "category": "Basics",
        "explanation": "Public blockchains operate as open networks where anyone can participate in the network activities like validating transactions.",
        "round": 5
    }
];

// --- Theme Colors (Consolidated) ---
const THEME_COLORS = {
  SKY_TOP: "#2c3e50",
  SKY_HORIZON: "#fd7e14",
  SKY_BOTTOM: "#e85a4f",
  GROUND: "#5a4d41",
  GROUND_SHADOW: "#3e352f",
  MOUNTAIN: "#34495e",
  MOON: "#f1c40f",
  MOON_CRATER: "rgba(255, 255, 255, 0.1)",
  PLATFORM: "#282828",
  PLAYER_HEALTH_BAR: "#0090ff",
  ENEMY_HEALTH_BAR: "#a0a0a0",
  TEXT: "#ffffff",
  QUESTION_BG: "rgba(10, 10, 20, 0.8)",
  BUTTON: "#fd7e14",
  BUTTON_TEXT: "#ffffff",
  PLAYER_SILHOUETTE: "#4a3123",
  NOCKED_ARROW_SHAFT: "#a4785f",
  NOCKED_ARROW_HEAD: "#777777",
  ENEMY: "black",
  ENEMY_ACCENT: "#f39c12", // Accent for non-critical visual feedback? (Currently just eye color)
  BOW: "black",
  BOW_STRING: "#dddddd",
  ARROW: "#f5f5f5",
  ARROW_HEAD: "#b0b0b0",
  TRAJECTORY_DOT: "rgba(255, 255, 200, 0.5)",
  BACKGROUND: "#000000" // Base color for clearing canvas
};

const ArcheryGame = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const enemyArrowsRef = useRef([]); // Ref to keep enemy arrows synced for callbacks
  const [ctx, setCtx] = useState(null);
  const [enemyCanFire, setEnemyCanFire] = useState(false);

  // --- Game State Management ---
  const [gameState, setGameState] = useState('loading'); // 'loading', 'showing_question', 'playing', 'showing_explanation', 'game_over', 'error'
  const [assessmentQuestions, setAssessmentQuestions] = useState([]); // Holds questions from API or fallback
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [explanationText, setExplanationText] = useState(""); // Stores explanation or error messages
  const clickableAreasRef = useRef({}); // Stores coordinates for clickable canvas elements (buttons)

  // Game statistics
  const [playerScore, setPlayerScore] = useState(0);
  const [enemyScore, setEnemyScore] = useState(0);
  const [playerShots, setPlayerShots] = useState(0);
  const [enemyTotalShots, setEnemyTotalShots] = useState(0);

  // Player controls
  const [angle, setAngle] = useState(45); // Player bow angle (0-90)
  const [power, setPower] = useState(50); // Player shot power (10-100)

  // Arrow objects in flight
  const [playerArrow, setPlayerArrow] = useState(null); // { x, y, vx, vy, id }
  const [enemyArrows, setEnemyArrows] = useState([]); // Array of { x, y, vx, vy, id, enemyIndex, minMissDistance, power }

  // Enemy AI state
  const enemyAiRef = useRef([]); // Array of AI state objects for each enemy

  // Character positions
  const [positions, setPositions] = useState({
    player: { x: 0, y: 0, platformY: 0 }, // Player position (x=0 initially)
    enemies: [], // Array of { x, y, platformY, id, name }
  });

  // Constants derived from scale factor
  const PLATFORM_HEIGHT = 15 * SCALE_FACTOR;
  const PLATFORM_WIDTH = 60 * SCALE_FACTOR;
  const CHARACTER_FOOT_OFFSET = 5 * SCALE_FACTOR; // Visual offset for standing on platform

  // --- Utility Functions ---

  /**
   * Creates the initial state object for an enemy's AI.
   * @param {number} index - The enemy's index (0 to NUM_ENEMIES-1).
   * @param {number} power - The power assigned to this enemy (1 for critical, 0 otherwise).
   * @returns {object} Initial AI state.
   */
  const createInitialAiState = (index, power = 0) => ({
    id: index, // Matches enemy index/ID
    lastAngle: 0, // AI learning parameter
    lastSpeed: BASE_ENEMY_SPEED * (0.8 + Math.random() * 0.4), // AI learning parameter
    missDistance: 0, // Stores miss distance for learning
    improvementFactor: 0.25 + (Math.random() - 0.5) * 0.1, // AI learning parameter
    nextShotDelay: Math.random() * 1500 + 1000, // Time until next shot attempt
    shotsFired: 0,
    power: power, // CRITICAL: 1 if this enemy corresponds to correct answer, 0 otherwise
    isDrawingBow: false, // Animation state
    drawProgress: 0, // Animation state (0 to 1)
    drawDuration: 300, // Milliseconds for bow draw animation
    firePending: false // Flag: Fire arrow when draw animation completes
  });

  // --- Memoized Callback Functions ---

  /**
   * Generates random, non-overlapping positions for the player and enemies on platforms.
   * Enemies are sorted by X-coordinate before final assignment of IDs and names.
   */
  const generateRandomPositions = useCallback((canvas) => {
      if (!canvas) return { player: { x: 0, y: 0, platformY: 0 }, enemies: [] };

      // Define vertical bounds for platforms
      const platformMinY = canvas.height * 0.65;
      const platformMaxY = canvas.height - PLATFORM_HEIGHT - 50 * SCALE_FACTOR;

      // Define horizontal bounds for the player platform
      const playerMinX = canvas.width * 0.05 + PLATFORM_WIDTH / 2;
      const playerMaxX = canvas.width * 0.15 - PLATFORM_WIDTH / 2;

      // Calculate player position
      const playerPlatformX = Math.random() * (playerMaxX - playerMinX) + playerMinX;
      const playerPlatformY = Math.random() * (platformMaxY - platformMinY) + platformMinY;
      const playerPos = {
          x: playerPlatformX,
          platformY: playerPlatformY,
          y: playerPlatformY - CHARACTER_FOOT_OFFSET // Character's foot position
      };

      const enemies = [];
      const enemyPlacementAttempts = 100; // Max tries to place each enemy
      const safeZoneFromPlayer = MIN_ENEMY_DISTANCE * 1.2; // Keep enemies away from player

      // Define horizontal bounds for enemy platforms
      const enemyMinX = playerMaxX + 50 * SCALE_FACTOR + PLATFORM_WIDTH / 2; // Ensure enemies are to the right of player area
      const enemyMaxX = canvas.width - 50 * SCALE_FACTOR - PLATFORM_WIDTH / 2; // Keep enemies away from right edge

      // Generate potential positions for each enemy
      for (let i = 0; i < NUM_ENEMIES; i++) {
          let enemyPlatformX, enemyPlatformY;
          let validPosition = false;
          let attempts = 0;
          while (!validPosition && attempts < enemyPlacementAttempts) {
              attempts++;
              enemyPlatformX = Math.random() * (enemyMaxX - enemyMinX) + enemyMinX;
              enemyPlatformY = Math.random() * (platformMaxY - platformMinY) + platformMinY;

              // Check distance from player
              const dxPlayer = enemyPlatformX - playerPos.x;
              if (Math.abs(dxPlayer) < safeZoneFromPlayer) { continue; } // Too close to player

              // Check distance from other already placed potential enemies
              let tooCloseToOtherEnemy = false;
              for (let j = 0; j < enemies.length; j++) {
                  const dxEnemy = enemyPlatformX - enemies[j].tempX; // Check against temporary X
                  if (Math.abs(dxEnemy) < MIN_ENEMY_DISTANCE) { tooCloseToOtherEnemy = true; break; }
              }
              if (!tooCloseToOtherEnemy) { validPosition = true; }
          }
          // Store temporary position even if optimal placement failed
          enemies.push({ tempX: enemyPlatformX, tempY: enemyPlatformY });
          if (!validPosition) {
              console.warn(`Could not place enemy ${i} optimally after ${attempts} attempts.`);
          }
      }

      // Sort enemies by X position AFTER generating all potential positions
      enemies.sort((a, b) => a.tempX - b.tempX);

      // Final assignment with correct ID and Name based on sorted order (left-to-right)
      const finalEnemies = enemies.map((pos, i) => ({
          x: pos.tempX,
          platformY: pos.tempY,
          y: pos.tempY - CHARACTER_FOOT_OFFSET,
          id: i, // ID now corresponds to left-to-right position (0, 1, 2, 3)
          name: enemyNames[i] // Name also corresponds to left-to-right (A, B, C, D)
      }));

      return { player: playerPos, enemies: finalEnemies };
    },
    [PLATFORM_WIDTH, PLATFORM_HEIGHT, CHARACTER_FOOT_OFFSET, MIN_ENEMY_DISTANCE] // Dependencies
  );


  /**
   * Starts a new archery round: resets shots, generates positions, initializes AI based on the correct answer.
   */
  const startArcheryRound = useCallback(() => {
    // Ensure questions are loaded and the index is valid
    if (assessmentQuestions.length === 0 || currentQuestionIndex >= assessmentQuestions.length) {
        console.error("Attempted to start round without valid questions/index.");
        setExplanationText("Error: Question data is not available. Cannot start round.");
        setGameState('error');
        return;
    }
    console.log(`Starting Round ${currentQuestionIndex + 1}`);

    // Get the correct answer index for the current question
    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    const correctOptionIndex = currentQuestion?.Correct_option_index;

    // CRITICAL VALIDATION: Ensure the correct index is valid for the number of enemies
    if (typeof correctOptionIndex !== 'number' || correctOptionIndex < 0 || correctOptionIndex >= NUM_ENEMIES) {
         console.error(`Invalid Correct_option_index (${correctOptionIndex}) in question data:`, currentQuestion);
         setExplanationText(`Error: Invalid correct answer index (${correctOptionIndex}) received for question ${currentQuestionIndex + 1}. Required range 0-${NUM_ENEMIES - 1}.`);
         setGameState('error'); // Stop the game
         return;
    }
    console.log(`Correct option index for this round: ${correctOptionIndex}. Enemy ${enemyNames[correctOptionIndex]} (ID: ${correctOptionIndex}) is critical.`);

    // Reset round-specific state
    setPlayerShots(0);
    setEnemyTotalShots(0);
    setPlayerArrow(null);
    setEnemyArrows([]);
    enemyArrowsRef.current = []; // Clear ref too

    // Generate new positions and initialize AI
    if (canvasRef.current) {
        const canvas = canvasRef.current;
        const newPositions = generateRandomPositions(canvas); // Generate new layout
        setPositions(newPositions); // Update state

        // Initialize Enemy AI with dynamic power based on the correct answer index
        enemyAiRef.current = Array.from({ length: NUM_ENEMIES }, (_, i) => {
            const power = (i === correctOptionIndex) ? 1 : 0; // Set power=1 only for the critical enemy
            return createInitialAiState(i, power);
        });
        console.log("Initialized Enemy AI states for round:", enemyAiRef.current);
    } else {
        console.error("Canvas ref not found in startArcheryRound");
        setExplanationText("Error: Canvas element disappeared.");
        setGameState('error');
        return;
    }

    setEnemyCanFire(false); // Enemies cannot fire immediately
    setTimeout(() => setEnemyCanFire(true), enemy_firetime); // Enable firing after a delay

    setGameState('playing'); // Transition to active gameplay state

  }, [generateRandomPositions, assessmentQuestions, currentQuestionIndex]); // Dependencies


  /**
   * Fires an arrow from a specific enemy. Reads power from the AI state.
   * @param {number} enemyIndex - The index of the enemy firing.
   */
  const fireEnemyArrow = useCallback((enemyIndex) => {
      // Only fire if in 'playing' state
      if (gameState !== 'playing') return;

      const enemy = positions.enemies[enemyIndex];
      const enemyAi = enemyAiRef.current[enemyIndex];

      // Safety checks and prevent firing if already an arrow in flight from this enemy
      if (!enemy || !enemyAi || enemyArrowsRef.current.some(arrow => arrow.enemyIndex === enemyIndex)) {
          return;
      }

      enemyAi.shotsFired++;
      setEnemyTotalShots(prev => prev + 1);

      // Calculate arrow starting position (near enemy's hand)
      const bodyTopOffsetY = -60 * SCALE_FACTOR;
      const armLength = 20 * SCALE_FACTOR;
      const bowAnchorX = enemy.x - armLength * 0.5; // Adjust based on enemy sprite facing left
      const bowAnchorY = enemy.y + bodyTopOffsetY; // Near shoulder height

      // Calculate target (player's approximate center mass)
      const targetX = positions.player.x;
      const targetY = positions.player.y - 30 * SCALE_FACTOR; // Aim slightly above feet

      // Calculate trajectory using AI's learned angle and speed
      const dx = targetX - bowAnchorX;
      const dy = targetY - bowAnchorY;
      const baseAngleRad = Math.atan2(dy, dx); // Angle towards target
      const launchAngleRad = baseAngleRad + enemyAi.lastAngle; // Add AI adjustment
      const launchSpeed = enemyAi.lastSpeed; // Use AI learned speed

      // Create the arrow object, including its power from the AI state
      const newArrow = {
          x: bowAnchorX, y: bowAnchorY,
          vx: launchSpeed * Math.cos(launchAngleRad),
          vy: launchSpeed * Math.sin(launchAngleRad),
          id: Date.now() + Math.random(), // Unique ID
          enemyIndex: enemyIndex,
          minMissDistance: Infinity, // Track closest approach for learning
          power: enemyAi.power, // Include the power (1 or 0)
      };

      // Update state and ref atomically
      setEnemyArrows(prev => {
          const updatedArrows = [...prev, newArrow];
          enemyArrowsRef.current = updatedArrows; // Keep ref in sync
          return updatedArrows;
      });

      // Reset AI miss distance tracking and set delay for next shot
      enemyAi.missDistance = 0;
      enemyAi.nextShotDelay = Math.random() * 2000 + 1500; // Random delay

    },
    [gameState, positions, SCALE_FACTOR] // Dependencies
  );


  /**
   * Allows an enemy AI to learn from a missed shot by adjusting angle and speed.
   * @param {number} enemyIndex - Index of the enemy.
   * @param {number} missDistance - How far the arrow missed the target.
   */
  const learnFromMiss = useCallback((enemyIndex, missDistance) => {
      if (gameState !== 'playing' || !enemyAiRef.current[enemyIndex]) return;

      const enemyAi = enemyAiRef.current[enemyIndex];
      const factor = enemyAi.improvementFactor; // How much the AI adjusts
      let angleChange = 0;
      let speedChange = 0;

      // Adjust more significantly for larger misses
      const missSeverity = Math.min(1, missDistance / (300 * SCALE_FACTOR));
      // Random adjustments based on miss severity
      angleChange = (Math.random() - 0.5) * 0.1 * factor * (1 + missSeverity);
      speedChange = (Math.random() - 0.5) * 1.5 * factor * (1 + missSeverity);

      // Prioritize speed adjustment for big misses, angle for close misses
      if (missDistance > 100 * SCALE_FACTOR) speedChange *= 1.2;
      else if (missDistance < 40 * SCALE_FACTOR) angleChange *= 1.2;

      // Apply learned adjustments, clamping speed within reasonable bounds
      enemyAi.lastAngle += angleChange;
      enemyAi.lastSpeed += speedChange;
      enemyAi.lastSpeed = Math.max(
          BASE_ENEMY_SPEED * 0.6, // Minimum speed
          Math.min(BASE_ENEMY_SPEED * 1.6, enemyAi.lastSpeed) // Maximum speed
      );
    },
    [gameState, SCALE_FACTOR, BASE_ENEMY_SPEED] // Dependencies
  );


  /**
   * Handles the end of a round when a critical hit occurs. Transitions to explanation state.
   * @param {string} winner - "Player" or "Enemy".
   * @param {object|null} targetInfo - Details about the hit (e.g., { enemyIndex, arrowId }).
   */
  const handleHit = useCallback((winner, targetInfo = null) => {
      // Only process hits during active gameplay
      if (gameState !== 'playing') return;

      console.log(`${winner} scored a critical hit! Round ${currentQuestionIndex + 1} over.`);
      setGameState('showing_explanation'); // Change game state
      setPlayerArrow(null); // Clear player arrow immediately
      // Optional: Clear enemy arrows after a short delay for visual feedback?
      // setTimeout(() => setEnemyArrows([]), 500);

      // Set the explanation text from the current question's data
      if (currentQuestionIndex < assessmentQuestions.length) {
          setExplanationText(assessmentQuestions[currentQuestionIndex].explanation);
      } else {
          console.error("Error: Question data not found for explanation at index", currentQuestionIndex);
          setExplanationText("Explanation not available."); // Fallback explanation
      }

      // Update scores based on the winner
      if (winner === "Player") {
          setPlayerScore((prev) => prev + 1);
          console.log("Player hit critical enemy:", targetInfo);
      } else {
          setEnemyScore((prev) => prev + 1);
          console.log("Critical enemy arrow hit player:", targetInfo);
      }
      // The game loop will now detect 'showing_explanation' and draw the appropriate screen.
    },
    [gameState, currentQuestionIndex, assessmentQuestions] // Dependencies
  );


  // --- Drawing Functions ---

  /** Helper to wrap text on canvas */
  const wrapText = useCallback((text, x, y, maxWidth, lineHeight, color = THEME_COLORS.TEXT, font = `${14 * SCALE_FACTOR}px Arial`) => {
      if (!ctx || !text) return y; // Safety check
      ctx.fillStyle = color;
      ctx.font = font;
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line.trim(), x, currentY); // Trim trailing space
              line = words[n] + ' ';
              currentY += lineHeight;
          } else {
              line = testLine;
          }
      }
      ctx.fillText(line.trim(), x, currentY); // Draw the last line
      return currentY + lineHeight; // Return Y position after the last line
  }, [ctx, SCALE_FACTOR, THEME_COLORS.TEXT]); // Dependencies


  /** Draws the question and options screen. */
  const drawQuestionScreen = useCallback(() => {
    if (!ctx || !canvasRef.current || assessmentQuestions.length === 0 || currentQuestionIndex >= assessmentQuestions.length) {
        return; // Don't draw if context or questions aren't ready
    }
    const canvas = canvasRef.current; const cw = canvas.width; const ch = canvas.height;
    const question = assessmentQuestions[currentQuestionIndex];

    // Background
    ctx.fillStyle = THEME_COLORS.QUESTION_BG; ctx.fillRect(0, 0, cw, ch);

    // Layout constants
    const boxMargin = cw * 0.1; const boxWidth = cw - 2 * boxMargin;
    const boxY = ch * 0.15; const contentX = boxMargin + 30;
    const contentWidth = boxWidth - 60; const baseLineHeight = 24 * SCALE_FACTOR;
    let currentY = boxY + 40;

    // Round Number
    ctx.fillStyle = THEME_COLORS.TEXT; ctx.font = `bold ${20 * SCALE_FACTOR}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(`Round ${currentQuestionIndex + 1} / ${assessmentQuestions.length}`, cw / 2, currentY);
    currentY += baseLineHeight * 2;

    // Question Text
    ctx.textAlign = "left";
    currentY = wrapText(question.question, contentX, currentY, contentWidth, baseLineHeight * 1.1, THEME_COLORS.TEXT, `bold ${22 * SCALE_FACTOR}px Arial`);
    currentY += baseLineHeight * 0.75; // Space after question

    // Options
    const optionFontSize = `${20 * SCALE_FACTOR}px Arial`; ctx.font = optionFontSize;
    question.options.forEach((option, index) => {
        // Highlight the correct answer visually (e.g., different color or icon) - Example
        // const optionColor = (index === question.Correct_option_index) ? THEME_COLORS.ENEMY_ACCENT : THEME_COLORS.TEXT;
        const optionPrefix = `${enemyNames[index]} (${index + 1}). `; // Show letter and number
        currentY = wrapText(optionPrefix + option, contentX + 15, currentY, contentWidth - 30, baseLineHeight, THEME_COLORS.TEXT, optionFontSize);
        currentY += baseLineHeight * 0.25; // Space between options
    });
    currentY += baseLineHeight; // Space before button

    // "Start Round" Button
    ctx.fillStyle = THEME_COLORS.BUTTON; const buttonWidth = 180 * SCALE_FACTOR;
    const buttonHeight = 45 * SCALE_FACTOR; const buttonX = cw / 2 - buttonWidth / 2;
    const buttonY = currentY; ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = THEME_COLORS.BUTTON_TEXT; ctx.font = `bold ${18 * SCALE_FACTOR}px Arial`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Start Round", cw / 2, buttonY + buttonHeight / 2);
    ctx.textBaseline = "alphabetic"; // Reset baseline

    // Register clickable area
    clickableAreasRef.current = {
      nextButton: { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, action: 'start_round' }
    };
  }, [ctx, currentQuestionIndex, wrapText, assessmentQuestions, SCALE_FACTOR, THEME_COLORS]);


  /** Draws the explanation screen after a round ends. */
  const drawExplanationScreen = useCallback(() => {
    if (!ctx || !canvasRef.current || assessmentQuestions.length === 0) return;
    const canvas = canvasRef.current; const cw = canvas.width; const ch = canvas.height;

    // Background
    ctx.fillStyle = THEME_COLORS.QUESTION_BG; ctx.fillRect(0, 0, cw, ch);

    // Layout
    const boxMargin = cw * 0.1; const boxWidth = cw - 2 * boxMargin;
    const boxY = ch * 0.2; const contentX = boxMargin + 30;
    const contentWidth = boxWidth - 60; const baseLineHeight = 24 * SCALE_FACTOR;
    let currentY = boxY + 50;

    // Title
    ctx.fillStyle = THEME_COLORS.TEXT; ctx.font = `bold ${24 * SCALE_FACTOR}px Arial`;
    ctx.textAlign = "center"; ctx.fillText("Round Over - Explanation", cw / 2, currentY);
    currentY += baseLineHeight * 2.5;

    // Explanation Text (uses explanationText state variable)
    ctx.textAlign = "left";
    currentY = wrapText(explanationText, contentX, currentY, contentWidth, baseLineHeight * 1.1, THEME_COLORS.TEXT, `${20 * SCALE_FACTOR}px Arial`);
    currentY += baseLineHeight * 1.5; // Space after explanation

    // "Next Question" / "Finish Game" Button
    const isLastQuestion = currentQuestionIndex >= assessmentQuestions.length - 1;
    const buttonText = isLastQuestion ? "Finish Game" : "Next Question";
    ctx.fillStyle = THEME_COLORS.BUTTON; const buttonWidth = 200 * SCALE_FACTOR;
    const buttonHeight = 45 * SCALE_FACTOR; const buttonX = cw / 2 - buttonWidth / 2;
    const buttonY = currentY; ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = THEME_COLORS.BUTTON_TEXT; ctx.font = `bold ${18 * SCALE_FACTOR}px Arial`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(buttonText, cw / 2, buttonY + buttonHeight / 2);
    ctx.textBaseline = "alphabetic"; // Reset baseline

    // Register clickable area
    clickableAreasRef.current = {
      nextButton: { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, action: isLastQuestion ? 'finish_game' : 'next_question' }
    };
  }, [ctx, explanationText, currentQuestionIndex, wrapText, assessmentQuestions, SCALE_FACTOR, THEME_COLORS]);


  /** Draws the final game over screen with scores. */
  const drawGameOverScreen = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    const canvas = canvasRef.current; const cw = canvas.width; const ch = canvas.height;

    // Background
    ctx.fillStyle = THEME_COLORS.QUESTION_BG; ctx.fillRect(0, 0, cw, ch);

    // Layout
    const baseLineHeight = 30 * SCALE_FACTOR;
    let currentY = ch * 0.2 + 60;

    // Title
    ctx.fillStyle = THEME_COLORS.TEXT; ctx.font = `bold ${34 * SCALE_FACTOR}px Arial`;
    ctx.textAlign = "center"; ctx.fillText("Assessment Complete!", cw / 2, currentY);
    currentY += baseLineHeight * 2.5;

    // Final Scores
    ctx.font = `bold ${24 * SCALE_FACTOR}px Arial`;
    ctx.fillText(`Player Score: ${playerScore}`, cw / 2, currentY);
    currentY += baseLineHeight * 1.5;
    ctx.fillText(`Enemy Score: ${enemyScore}`, cw / 2, currentY);
    currentY += baseLineHeight * 2;

    // "Restart Game" Button
    ctx.fillStyle = THEME_COLORS.BUTTON; const buttonWidth = 180 * SCALE_FACTOR;
    const buttonHeight = 45 * SCALE_FACTOR; const buttonX = cw / 2 - buttonWidth / 2;
    const buttonY = currentY; ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = THEME_COLORS.BUTTON_TEXT; ctx.font = `bold ${18 * SCALE_FACTOR}px Arial`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Restart Game", cw / 2, buttonY + buttonHeight / 2);
    ctx.textBaseline = "alphabetic"; // Reset baseline

    // Register clickable area
    clickableAreasRef.current = {
        restartButton: { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, action: 'restart_game' }
    };
  }, [ctx, playerScore, enemyScore, SCALE_FACTOR, THEME_COLORS]);


  /** Draws a single arrow. */
  const drawArrow = useCallback((x, y, angle) => {
      if (!ctx) return;
      const arrowLength = 25 * SCALE_FACTOR; const shaftWidth = 2 * SCALE_FACTOR;
      const headLength = 6 * SCALE_FACTOR; const headWidth = 5 * SCALE_FACTOR;
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle); // Move and rotate context
      // Shaft
      ctx.fillStyle = THEME_COLORS.ARROW;
      ctx.fillRect(-arrowLength * 0.7, -shaftWidth / 2, arrowLength, shaftWidth); // Draw shaft centered
      // Head
      ctx.fillStyle = THEME_COLORS.ARROW_HEAD;
      const headBaseX = arrowLength * 0.3; // Position head relative to shaft end
      ctx.beginPath();
      ctx.moveTo(headBaseX, -headWidth / 2);
      ctx.lineTo(headBaseX + headLength, 0); // Point
      ctx.lineTo(headBaseX, headWidth / 2);
      ctx.closePath(); ctx.fill();
      ctx.restore(); // Restore context transform
    }, [ctx, SCALE_FACTOR, THEME_COLORS] // Dependencies
  );


  /** Draws the player archer character. */
  const drawPlayerArcher = useCallback((x, y, angleDeg, powerPercent) => {
      if (!ctx) return; ctx.save();
      const bodyColor = THEME_COLORS.PLAYER_SILHOUETTE; ctx.fillStyle = bodyColor;
      ctx.strokeStyle = bodyColor; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      // Dimensions
      const headRadius = 9 * SCALE_FACTOR; const bodyHeight = 45 * SCALE_FACTOR;
      const legLength = 35 * SCALE_FACTOR; const armLength = 25 * SCALE_FACTOR;
      const limbThickness = 8 * SCALE_FACTOR; const bowThickness = 6 * SCALE_FACTOR;
      const legSpread = 15 * SCALE_FACTOR;
      // Coordinates
      const groundY = y + CHARACTER_FOOT_OFFSET; const bodyBottomY = groundY - legLength;
      const bodyTopY = bodyBottomY - bodyHeight; const headCenterY = bodyTopY - headRadius * 0.7;
      const angleRad = (-angleDeg * Math.PI) / 180; // Convert angle to radians for trig

      // Legs (quadratic curves for bent look)
      ctx.lineWidth = limbThickness; ctx.strokeStyle = bodyColor; ctx.beginPath();
      const leftKneeX = x - legSpread * 0.8; const leftKneeY = bodyBottomY + legLength * 0.5;
      ctx.moveTo(x, bodyBottomY); ctx.quadraticCurveTo(leftKneeX, leftKneeY, x - legSpread, groundY);
      const rightKneeX = x + legSpread * 0.2; const rightKneeY = bodyBottomY + legLength * 0.6;
      ctx.moveTo(x, bodyBottomY); ctx.quadraticCurveTo(rightKneeX, rightKneeY, x + legSpread, groundY); ctx.stroke();

      // Body (torso)
      ctx.beginPath(); ctx.moveTo(x, bodyBottomY); ctx.lineTo(x, bodyTopY); ctx.stroke();

      // Head
      ctx.fillStyle = bodyColor; ctx.beginPath(); ctx.arc(x, headCenterY, headRadius, 0, Math.PI * 2); ctx.fill();

      // Arms and Bow
      ctx.strokeStyle = bodyColor; ctx.lineWidth = limbThickness;
      const shoulderX = x; const shoulderY = bodyTopY + 5 * SCALE_FACTOR; // Shoulder position

      // Back arm (pulling string) - Quadratic curve for bent elbow
      const elbowAngle = Math.PI * 1.1; // Angle for elbow bend relative to shoulder
      const elbowDist = armLength * 0.6; // Distance to elbow
      const backElbowX = shoulderX + elbowDist * Math.cos(elbowAngle);
      const backElbowY = shoulderY + elbowDist * Math.sin(elbowAngle);
      const pullBackDist = (powerPercent / 100) * (armLength * 0.5); // How far back hand pulls based on power
      const bowCenterApproxX = shoulderX + armLength * Math.cos(angleRad) * 0.8; // Estimate bow center
      const bowCenterApproxY = shoulderY + armLength * Math.sin(angleRad) * 0.8;
      // Hand position based on pullback
      const backHandX = bowCenterApproxX - pullBackDist * Math.cos(angleRad + Math.PI * 0.1);
      const backHandY = bowCenterApproxY - pullBackDist * Math.sin(angleRad + Math.PI * 0.1);
      ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.quadraticCurveTo(backElbowX, backElbowY, backHandX, backHandY); ctx.stroke();

      // Front arm (holding bow) - Straight line
      const frontHandX = shoulderX + armLength * Math.cos(angleRad);
      const frontHandY = shoulderY + armLength * Math.sin(angleRad);
      ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(frontHandX, frontHandY); ctx.stroke();

      // Bow (arc shape)
      ctx.save(); ctx.translate(frontHandX, frontHandY); ctx.rotate(angleRad); // Position and rotate bow
      ctx.strokeStyle = bodyColor; ctx.lineWidth = bowThickness; ctx.beginPath();
      const bowRadius = armLength * 1.3; const bowStartAngle = Math.PI * 0.4; const bowEndAngle = -Math.PI * 0.4;
      ctx.arc(0, 0, bowRadius, bowStartAngle, bowEndAngle, true); ctx.stroke(); ctx.restore(); // Restore bow transform

      // Bow String
      ctx.save(); ctx.strokeStyle = THEME_COLORS.BOW_STRING; ctx.lineWidth = 1 * SCALE_FACTOR; ctx.beginPath();
      const tipDist = bowRadius; // Distance from hand to bow tips
      const topTipX = frontHandX + tipDist * Math.cos(angleRad + bowStartAngle);
      const topTipY = frontHandY + tipDist * Math.sin(angleRad + bowStartAngle);
      const bottomTipX = frontHandX + tipDist * Math.cos(angleRad + bowEndAngle);
      const bottomTipY = frontHandY + tipDist * Math.sin(angleRad + bowEndAngle);
      // Draw string from top tip -> back hand -> bottom tip
      ctx.moveTo(topTipX, topTipY); ctx.lineTo(backHandX, backHandY); ctx.lineTo(bottomTipX, bottomTipY); ctx.stroke(); ctx.restore();

      // Nocked Arrow (visual representation before firing)
      ctx.save();
      const arrowLengthDraw = armLength * 1.5; const arrowAngle = angleRad;
      const arrowStartX = backHandX; const arrowStartY = backHandY; // Starts at pulling hand
      const arrowEndX = arrowStartX + arrowLengthDraw * Math.cos(arrowAngle);
      const arrowEndY = arrowStartY + arrowLengthDraw * Math.sin(arrowAngle);
      // Shaft
      ctx.strokeStyle = THEME_COLORS.NOCKED_ARROW_SHAFT; ctx.lineWidth = 2.5 * SCALE_FACTOR; ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY); ctx.lineTo(arrowEndX, arrowEndY); ctx.stroke();
      // Head
      ctx.fillStyle = THEME_COLORS.NOCKED_ARROW_HEAD; const headLengthDraw = 10 * SCALE_FACTOR; const headWidthDraw = 5 * SCALE_FACTOR;
      ctx.beginPath();
      ctx.moveTo(arrowEndX + headLengthDraw * Math.cos(arrowAngle), arrowEndY + headLengthDraw * Math.sin(arrowAngle));
      ctx.lineTo(arrowEndX + headWidthDraw * Math.cos(arrowAngle + Math.PI / 2), arrowEndY + headWidthDraw * Math.sin(arrowAngle + Math.PI / 2));
      ctx.lineTo(arrowEndX + headWidthDraw * Math.cos(arrowAngle - Math.PI / 2), arrowEndY + headWidthDraw * Math.sin(arrowAngle - Math.PI / 2));
      ctx.closePath(); ctx.fill();
      ctx.restore(); // Restore arrow transform

      ctx.restore(); // Restore main player transform
    }, [ctx, CHARACTER_FOOT_OFFSET, THEME_COLORS, SCALE_FACTOR]); // Dependencies


  /** Draws an enemy archer character. Includes name display and bow draw animation. */
  const drawEnemyArcher = useCallback((x, y, name, bowDraw = 0) => { // bowDraw is 0 to 1
      if (!ctx) return; ctx.save();
      const bodyColor = THEME_COLORS.ENEMY; const accentColor = THEME_COLORS.ENEMY_ACCENT;
      ctx.strokeStyle = bodyColor; ctx.fillStyle = bodyColor; ctx.lineWidth = 3 * SCALE_FACTOR;

      // Dimensions
      const headRadius = 8 * SCALE_FACTOR; const bodyHeight = 45 * SCALE_FACTOR;
      const legLength = 30 * SCALE_FACTOR; const armLength = 20 * SCALE_FACTOR;
      const bowRadiusDraw = 18 * SCALE_FACTOR; const legSpread = 10 * SCALE_FACTOR;
      // Coordinates
      const groundY = y + CHARACTER_FOOT_OFFSET; const bodyBottomY = groundY - legLength;
      const bodyTopY = bodyBottomY - bodyHeight; const headCenterY = bodyTopY - headRadius;

      // Legs (simple lines)
      ctx.beginPath(); ctx.moveTo(x, bodyBottomY); ctx.lineTo(x - legSpread, groundY);
      ctx.moveTo(x, bodyBottomY); ctx.lineTo(x + legSpread, groundY); ctx.stroke();
      // Body
      ctx.beginPath(); ctx.moveTo(x, bodyBottomY); ctx.lineTo(x, bodyTopY); ctx.stroke();
      // Head
      ctx.beginPath(); ctx.arc(x, headCenterY, headRadius, 0, Math.PI * 2); ctx.fill();
      // Eye (accent color)
      ctx.fillStyle = accentColor; const eyeRadius = 1.8 * SCALE_FACTOR;
      const eyeX = x - headRadius * 0.4; const eyeY = headCenterY - headRadius * 0.1; // Position eye facing left
      ctx.beginPath(); ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2); ctx.fill();

      // Arms (simple lines)
      const shoulderX = x; const shoulderY = bodyTopY + 5 * SCALE_FACTOR;
      // Back arm (idle position)
      ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(shoulderX + 10 * SCALE_FACTOR, shoulderY + 15 * SCALE_FACTOR); ctx.stroke();
      // Front arm (holding bow)
      const handX = shoulderX - armLength; const handY = shoulderY; // Hand position to the left
      ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(handX, handY); ctx.stroke();

      // Bow and Animated String
      ctx.save(); ctx.translate(handX, handY); // Move context to hand position
      // Bow (arc)
      ctx.strokeStyle = THEME_COLORS.BOW; ctx.lineWidth = 2.5 * SCALE_FACTOR; ctx.beginPath();
      ctx.arc(0, 0, bowRadiusDraw, Math.PI / 2, -Math.PI / 2, false); ctx.stroke(); // Arc facing left
      // String (animated pullback)
      ctx.strokeStyle = THEME_COLORS.BOW_STRING; ctx.lineWidth = 1 * SCALE_FACTOR; ctx.beginPath();
      const topTipX = 0; const topTipY = bowRadiusDraw; // Relative bow tip positions
      const bottomTipX = 0; const bottomTipY = -bowRadiusDraw;
      const maxPull = 15 * SCALE_FACTOR; // How far string is pulled back max
      const pullX = maxPull * bowDraw; // Current pullback based on bowDraw progress (0 to 1)
      const pullY = 0; // Pull straight back horizontally
      ctx.moveTo(topTipX, topTipY); ctx.lineTo(pullX, pullY); ctx.lineTo(bottomTipX, bottomTipY); ctx.stroke();
      ctx.restore(); // Restore bow transform

      // Draw Enemy Name (A, B, C, D) above head
      ctx.save();
      ctx.fillStyle = THEME_COLORS.TEXT; ctx.font = `${14 * SCALE_FACTOR}px Arial`;
      ctx.textAlign = "center"; const textY = headCenterY - headRadius - 7 * SCALE_FACTOR; // Position above head
      ctx.fillText(name, x, textY);
      ctx.restore(); // Restore name transform

      ctx.restore(); // Restore main enemy transform
    }, [ctx, CHARACTER_FOOT_OFFSET, THEME_COLORS, SCALE_FACTOR]); // Dependencies


  /** Calculates points for drawing the trajectory preview line. */
  const calculateTrajectoryPoints = useCallback((startX, startY, initialVx, initialVy, steps = 50, timeStep = 1) => {
      // Increased steps and reduced timeStep for smoother preview
      const points = [];
      let currentX = startX; let currentY = startY;
      let currentVx = initialVx; let currentVy = initialVy;
      const canvas = canvasRef.current;
      const groundLevel = canvas ? canvas.height - (40 * SCALE_FACTOR) : Infinity; // Use actual ground level

      for (let i = 0; i < steps; i++) {
          currentVy += GRAVITY * timeStep; // Apply gravity over the small timestep
          currentX += currentVx * timeStep; // Update position
          currentY += currentVy * timeStep;

          // Stop calculation if arrow hits ground or goes way off screen
          if (currentY > groundLevel || currentX < -50 || currentX > (canvas?.width ?? Infinity) + 50 || currentY < -50) {
              break;
          }
          points.push({ x: currentX, y: currentY });
      }
      return points;
  }, [GRAVITY, SCALE_FACTOR]); // Dependencies


  /** Draws the trajectory preview dots. */
  const drawTrajectoryPreview = useCallback((points) => {
      if (!ctx || points.length === 0) return;
      ctx.save();
      ctx.fillStyle = THEME_COLORS.TRAJECTORY_DOT; // Faint dot color
      points.forEach((point, index) => {
          // Optional: Draw only every Nth point for less clutter
          if (index % 3 === 0) {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 1.5 * SCALE_FACTOR, 0, Math.PI * 2); // Small dots
              ctx.fill();
          }
      });
      ctx.restore();
    }, [ctx, SCALE_FACTOR, THEME_COLORS.TRAJECTORY_DOT]); // Dependencies


  /** Draws the main game scene including background, platforms, characters, arrows, and trajectory. */
  const drawGameScene = useCallback(() => {
      if (!ctx || !canvasRef.current) return;
      const canvas = canvasRef.current; const cw = canvas.width; const ch = canvas.height;

      // 1. Background Gradient (Evening Sky)
      const skyGradient = ctx.createLinearGradient(0, 0, 0, ch * 0.75);
      skyGradient.addColorStop(0, THEME_COLORS.SKY_TOP); skyGradient.addColorStop(0.6, THEME_COLORS.SKY_HORIZON);
      skyGradient.addColorStop(1, THEME_COLORS.SKY_BOTTOM); ctx.fillStyle = skyGradient; ctx.fillRect(0, 0, cw, ch);

      // 2. Optional Stars
      ctx.save(); ctx.fillStyle = "rgba(255, 255, 200, 0.7)";
      for (let i = 0; i < 50; i++) {
          const starX = Math.random() * cw; const starY = Math.random() * (ch * 0.5); // Upper half
          const starRadius = Math.random() * 1.2 * SCALE_FACTOR; ctx.beginPath();
          ctx.arc(starX, starY, starRadius, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // 3. Moon or Setting Sun
      const moonRadius = Math.min(cw, ch) * 0.15; const moonX = cw * 0.8; const moonY = ch * 0.25;
      ctx.fillStyle = THEME_COLORS.MOON; ctx.beginPath(); ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.shadowBlur = 25 * SCALE_FACTOR; ctx.shadowColor = THEME_COLORS.MOON; // Add glow
      ctx.fillStyle = THEME_COLORS.MOON; ctx.beginPath(); ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      // Optional Craters
      ctx.fillStyle = THEME_COLORS.MOON_CRATER;
      for (let i = 0; i < 3; i++) {
          const craterR = Math.random() * moonRadius * 0.15 + moonRadius * 0.05; const angle_ = Math.random() * Math.PI * 2;
          const dist = Math.random() * (moonRadius - craterR * 0.8); const craterX = moonX + Math.cos(angle_) * dist;
          const craterY = moonY + Math.sin(angle_) * dist; ctx.beginPath(); ctx.arc(craterX, craterY, craterR, 0, Math.PI * 2); ctx.fill();
      }

      // 4. Mountains Silhouette
      const mountainStartY = ch * 0.60; ctx.fillStyle = THEME_COLORS.MOUNTAIN; ctx.beginPath();
      ctx.moveTo(0, mountainStartY); ctx.lineTo(cw * 0.15, mountainStartY + 40 * SCALE_FACTOR);
      ctx.lineTo(cw * 0.3, mountainStartY - 15 * SCALE_FACTOR); ctx.lineTo(cw * 0.5, mountainStartY + 60 * SCALE_FACTOR);
      ctx.lineTo(cw * 0.7, mountainStartY - 25 * SCALE_FACTOR); ctx.lineTo(cw * 0.85, mountainStartY + 35 * SCALE_FACTOR);
      ctx.lineTo(cw, mountainStartY - 5 * SCALE_FACTOR); ctx.lineTo(cw, ch); ctx.lineTo(0, ch); ctx.closePath(); ctx.fill();

      // 5. Ground
      const groundLevel = ch - 40 * SCALE_FACTOR; // Top of the ground area
      ctx.fillStyle = THEME_COLORS.GROUND; ctx.fillRect(0, groundLevel, cw, ch - groundLevel);
      ctx.fillStyle = THEME_COLORS.GROUND_SHADOW; ctx.fillRect(0, ch - 10 * SCALE_FACTOR, cw, 10 * SCALE_FACTOR); // Darker bottom edge

      // 6. Platforms & Health Bars (simple visual indicator)
      const healthBarThickness = 4 * SCALE_FACTOR;
      // Player Platform
      if (positions.player.x > 0) {
          const platformX = positions.player.x - PLATFORM_WIDTH / 2; const platformY = positions.player.platformY;
          ctx.fillStyle = THEME_COLORS.PLATFORM; ctx.fillRect(platformX, platformY, PLATFORM_WIDTH, PLATFORM_HEIGHT);
          ctx.fillStyle = THEME_COLORS.PLAYER_HEALTH_BAR; ctx.fillRect(platformX, platformY, PLATFORM_WIDTH, healthBarThickness);
      }
      // Enemy Platforms
      positions.enemies.forEach((enemy) => {
          const platformX = enemy.x - PLATFORM_WIDTH / 2; const platformY = enemy.platformY;
          ctx.fillStyle = THEME_COLORS.PLATFORM; ctx.fillRect(platformX, platformY, PLATFORM_WIDTH, PLATFORM_HEIGHT);
          ctx.fillStyle = THEME_COLORS.ENEMY_HEALTH_BAR; ctx.fillRect(platformX, platformY, PLATFORM_WIDTH, healthBarThickness);
      });

      // 7. Trajectory Preview (only when player can shoot)
      if (gameState === 'playing' && !playerArrow && positions.player.x > 0) {
        // Calculate starting point and velocity based on current angle/power
        const angleRad = (-angle * Math.PI) / 180; const armLength = 20 * SCALE_FACTOR;
        const bodyTopOffsetY = -60 * SCALE_FACTOR + 5 * SCALE_FACTOR; const shoulderY = positions.player.y + bodyTopOffsetY;
        const handX = positions.player.x + armLength * Math.cos(angleRad); const handY = shoulderY + armLength * Math.sin(angleRad);
        const bowRadius = 18 * SCALE_FACTOR; // Approximate
        const arrowStartX = handX - bowRadius * 0.5 * Math.cos(angleRad); // Estimate arrow nock point
        const arrowStartY = handY - bowRadius * 0.5 * Math.sin(angleRad);
        const baseSpeed = 9 * Math.sqrt(SCALE_FACTOR); const powerMultiplier = 18 * Math.sqrt(SCALE_FACTOR);
        const speed = baseSpeed + (power / 100) * powerMultiplier;
        const initialVx = speed * Math.cos(angleRad); const initialVy = speed * Math.sin(angleRad);

        const trajectoryPoints = calculateTrajectoryPoints(arrowStartX, arrowStartY, initialVx, initialVy);
        drawTrajectoryPreview(trajectoryPoints); // Draw the calculated points
      }

      // 8. Draw Characters
      if (positions.player.x > 0) { drawPlayerArcher(positions.player.x, positions.player.y, angle, power); }
      positions.enemies.forEach((enemy) => {
        const aiState = enemyAiRef.current[enemy.id];
        const drawProgress = aiState?.isDrawingBow ? aiState.drawProgress : 0; // Get draw progress for animation
        drawEnemyArcher(enemy.x, enemy.y, enemy.name, drawProgress);
      });

      // 9. Draw Arrows in Flight
      if (playerArrow) { const currentAngle = Math.atan2(playerArrow.vy, playerArrow.vx); drawArrow(playerArrow.x, playerArrow.y, currentAngle); }
      enemyArrows.forEach((arrow) => { const currentAngle = Math.atan2(arrow.vy, arrow.vx); drawArrow(arrow.x, arrow.y, currentAngle); });

    }, [ ctx, positions, angle, power, playerArrow, enemyArrows, drawPlayerArcher, drawEnemyArcher, drawArrow, PLATFORM_WIDTH, PLATFORM_HEIGHT, gameState, calculateTrajectoryPoints, drawTrajectoryPreview, SCALE_FACTOR, THEME_COLORS ]); // Extensive dependencies


  /** Fires the player's arrow. */
  const firePlayerArrow = useCallback(() => {
      // Can only fire when playing, player exists, and no arrow already in flight
      if (gameState !== 'playing' || playerArrow || positions.player.x <= 0) return;
      setPlayerShots((prev) => prev + 1);

      // Calculate starting point and velocity (same logic as trajectory preview)
      const angleRad = (-angle * Math.PI) / 180; const armLength = 20 * SCALE_FACTOR;
      const bodyTopOffsetY = -60 * SCALE_FACTOR + 5 * SCALE_FACTOR; const shoulderY = positions.player.y + bodyTopOffsetY;
      const handX = positions.player.x + armLength * Math.cos(angleRad); const handY = shoulderY + armLength * Math.sin(angleRad);
      const bowRadius = 18 * SCALE_FACTOR;
      const arrowStartX = handX - bowRadius * 0.5 * Math.cos(angleRad);
      const arrowStartY = handY - bowRadius * 0.5 * Math.sin(angleRad);
      const baseSpeed = 9 * Math.sqrt(SCALE_FACTOR); const powerMultiplier = 18 * Math.sqrt(SCALE_FACTOR);
      const speed = baseSpeed + (power / 100) * powerMultiplier;

      // Set the playerArrow state to create the arrow object
      setPlayerArrow({
          x: arrowStartX, y: arrowStartY,
          vx: speed * Math.cos(angleRad), vy: speed * Math.sin(angleRad),
          id: Date.now(),
      });
    }, [gameState, playerArrow, positions, angle, power, SCALE_FACTOR]); // Dependencies


  // --- Effects ---

  /** Effect 1: Initializes canvas context and fetches assessment data on mount. */
  useEffect(() => {
    console.log("Game component mounted");
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas ref not found on mount");
      setExplanationText("Fatal Error: Canvas element not found.");
      setGameState('error'); // Set error state immediately
      return;
    }
    // Set canvas dimensions
    canvas.width = 1000;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    setCtx(context);
    console.log(`Canvas initialized: ${canvas.width}x${canvas.height}`);

    // --- Fetch Assessment Data ---
    const fetchAssessmentData = async () => {
        console.log("Fetching assessment data from:", ASSESSMENT_API_URL);
        setGameState('loading'); // Set state while fetching
        try {
            const response = await fetch(ASSESSMENT_API_URL);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();

            // Basic data validation
            if (!Array.isArray(data) || data.length === 0) {
                 throw new Error("Invalid data format: Expected non-empty array.");
            }
            // More specific validation (check first question structure)
             if (!data[0] || typeof data[0].question !== 'string' || !Array.isArray(data[0].options) || typeof data[0].Correct_option_index !== 'number' || data[0].options.length > NUM_ENEMIES) {
                 throw new Error(`Data structure validation failed or too many options (max ${NUM_ENEMIES}) in question 0.`);
             }

            console.log("Assessment data fetched successfully:", data);
            setAssessmentQuestions(data); // Store fetched data
            setCurrentQuestionIndex(0); // Start from the first question
            setPlayerScore(0);        // Reset scores for new assessment
            setEnemyScore(0);
            setGameState('showing_question'); // Proceed to show the first question

        } catch (error) {
            console.error("Failed to fetch or validate assessment data:", error);
            console.log("Using fallback assessment data.");
            setAssessmentQuestions(fallbackAssessmentData); // Use fallback data on error
            setCurrentQuestionIndex(0);
            setPlayerScore(0);
            setEnemyScore(0);
            setGameState('showing_question'); // Proceed with fallback data
            setExplanationText(`Warning: ${error.message} Using fallback questions.`); // Inform user about fallback
        }
    };

    fetchAssessmentData(); // Initiate the fetch

    // Cleanup function on component unmount
    return () => {
      console.log("Game component unmounting");
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current); // Stop animation loop
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  /** Effect 2: Keep enemyArrowsRef synchronized with enemyArrows state. */
  useEffect(() => {
    enemyArrowsRef.current = enemyArrows;
  }, [enemyArrows]);

  /** Effect 3: Setup canvas click handler for UI buttons. */
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !ctx) return; // Need canvas and context

      const handleClick = (event) => {
          const rect = canvas.getBoundingClientRect();
          // Calculate click coordinates relative to the canvas, considering CSS scaling
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          const canvasX = (event.clientX - rect.left) * scaleX;
          const canvasY = (event.clientY - rect.top) * scaleY;

          const areas = clickableAreasRef.current; // Get current clickable button areas

          // Check if the click falls within any registered button area
          for (const key in areas) {
              const area = areas[key];
              if (
                  canvasX >= area.x && canvasX <= area.x + area.width &&
                  canvasY >= area.y && canvasY <= area.y + area.height
              ) {
                   console.log(`Clicked on UI element: ${key}, action: ${area.action}`);
                   clickableAreasRef.current = {}; // Clear areas immediately after click is processed

                   // Handle actions based on current game state and button clicked
                   if (gameState === 'showing_question' && area.action === 'start_round') {
                        startArcheryRound(); // Start the archery gameplay
                        return;
                   }
                   if (gameState === 'showing_explanation') {
                       if (area.action === 'next_question') {
                           setCurrentQuestionIndex(prev => prev + 1); // Move to next question index
                           setGameState('showing_question'); // Show the question screen
                           return;
                       } else if (area.action === 'finish_game') {
                           setGameState('game_over'); // Go to game over screen
                           return;
                       }
                   }
                   if (gameState === 'game_over' && area.action === 'restart_game') {
                       // Reset scores, question index, and go back to the first question
                       // It will use the currently loaded questions (API or fallback)
                       setPlayerScore(0);
                       setEnemyScore(0);
                       setCurrentQuestionIndex(0);
                       setGameState('showing_question'); // Show first question again
                       return;
                   }
                    // Add other potential button actions here if needed
              }
          }
      };

      canvas.addEventListener('click', handleClick);
      // Cleanup: remove event listener when effect re-runs or component unmounts
      return () => canvas.removeEventListener('click', handleClick);

  }, [ctx, gameState, startArcheryRound]); // Dependencies include context, state, and functions called


  /** Effect 4: Main game loop - handles animation, physics, AI updates, and drawing based on gameState. */
  useEffect(() => {
    if (!ctx) return; // Don't run loop if context isn't ready

    let lastTimestamp = 0;
    let isActive = true; // Flag to control loop execution during cleanup

    const animate = (timestamp) => {
      if (!isActive || !ctx || !canvasRef.current) return; // Exit if cleaning up or context/canvas lost

      const deltaTime = timestamp - lastTimestamp; // Time elapsed since last frame
      lastTimestamp = timestamp;
      clickableAreasRef.current = {}; // Clear clickable areas at the start of each frame

      // --- Clear Canvas ---
      ctx.fillStyle = THEME_COLORS.BACKGROUND; // Use defined background color
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // --- State-Based Logic and Drawing ---
      switch (gameState) {
        case 'loading':
            // Draw loading message on canvas
            ctx.fillStyle = THEME_COLORS.TEXT; ctx.font = `bold ${24 * SCALE_FACTOR}px Arial`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("Loading Questions...", canvasRef.current.width / 2, canvasRef.current.height / 2);
            ctx.textBaseline = "alphabetic";
            break;

        case 'error':
            // Draw error message on canvas (uses explanationText state)
            ctx.fillStyle = 'red'; ctx.font = `bold ${20 * SCALE_FACTOR}px Arial`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            wrapText(explanationText || "An unexpected error occurred. Please refresh.",
                     canvasRef.current.width * 0.1, canvasRef.current.height / 3,
                     canvasRef.current.width * 0.8, 30 * SCALE_FACTOR, 'red', `bold ${20 * SCALE_FACTOR}px Arial`);
            ctx.textBaseline = "alphabetic";
            // Optionally add a refresh/retry button here
            break;

        case 'showing_question':
          drawQuestionScreen(); // Draws the question UI and "Start Round" button
          break;

        case 'showing_explanation':
          drawExplanationScreen(); // Draws explanation UI and "Next/Finish" button
          break;

        case 'game_over':
           drawGameOverScreen(); // Draws final score UI and "Restart" button
          break;

        case 'playing':
          // Only run physics and game logic when playing and questions are loaded
          if (deltaTime > 0 && assessmentQuestions.length > 0) {

             // --- Enemy AI Update (Shooting Logic) ---
            if (enemyCanFire && enemyAiRef.current.length === NUM_ENEMIES) {
              enemyAiRef.current.forEach((aiState, index) => {
                if (!aiState) return; // Safety check

                // Check if ready to start drawing bow
                if (!aiState.isDrawingBow) {
                  aiState.nextShotDelay -= deltaTime; // Countdown delay
                  if (aiState.nextShotDelay <= 0 && !enemyArrowsRef.current.some(a => a.enemyIndex === index)) { // Don't draw if already shooting
                    aiState.isDrawingBow = true; // Start drawing animation
                    aiState.drawProgress = 0;
                    aiState.firePending = true; // Flag to fire when done drawing
                  }
                }
                // Update bow drawing animation progress
                else {
                  aiState.drawProgress += deltaTime / aiState.drawDuration;
                  if (aiState.drawProgress >= 1) {
                     aiState.drawProgress = 1; // Cap progress
                     // Fire arrow if draw complete and fire is pending
                     if (aiState.firePending) {
                       aiState.isDrawingBow = false; // Stop drawing animation
                       aiState.firePending = false;
                       aiState.drawProgress = 0; // Reset progress visually
                       fireEnemyArrow(index); // Fire the arrow
                     }
                  }
                }
              });
            }

            // --- Physics Updates ---
             const canvas = canvasRef.current;
             const groundLevel = canvas.height - (40 * SCALE_FACTOR); // Ground level for collision
             const outOfBoundsMargin = 100 * SCALE_FACTOR; // Margin for removing off-screen arrows

             // --- Player Arrow Physics & Hit Detection ---
             if (playerArrow) {
               // Update velocity with gravity
               const newVx = playerArrow.vx;
               const newVy = playerArrow.vy + GRAVITY;
               // Update position
               const newX = playerArrow.x + newVx;
               const newY = playerArrow.y + newVy;
               let hitDetected = false; // Flag to check if arrow should be removed

               // Check if arrow is out of bounds or hit the ground
               if (newX < -outOfBoundsMargin || newX > canvas.width + outOfBoundsMargin || newY > groundLevel + 10) {
                 setPlayerArrow(null); // Remove arrow
                 hitDetected = true;
               } else {
                 // Check for collision with each enemy
                 for (let i = 0; i < positions.enemies.length; i++) {
                   const enemy = positions.enemies[i]; if (!enemy) continue; // Safety check
                   const enemyCenterX = enemy.x;
                   const enemyCenterY = enemy.y - 30 * SCALE_FACTOR; // Approx center mass
                   const dx = newX - enemyCenterX;
                   const dy = newY - enemyCenterY;
                   // Check distance against enemy hit radius
                   if (Math.sqrt(dx * dx + dy * dy) < ENEMY_HIT_RADIUS) {
                     const enemyId = enemy.id;
                     const enemyPowerVal = enemyAiRef.current[enemyId]?.power ?? 0; // Get power of hit enemy

                     // Check if the HIT enemy is the CRITICAL one (power=1)
                     if (enemyPowerVal === 1) {
                       handleHit("Player", { enemyIndex: i, enemyId: enemyId }); // CRITICAL HIT -> End Round
                     } else {
                       console.log(`Player hit non-critical enemy ${enemyNames[enemyId]} (Power: ${enemyPowerVal})`);
                       // Optional: Add visual feedback for non-critical hit (e.g., enemy flash)
                     }
                     setPlayerArrow(null); // Remove arrow after ANY hit (critical or not)
                     hitDetected = true;
                     break; // Stop checking other enemies after a hit
                   }
                 }
               }
               // If no hit occurred, update the arrow's state with new position/velocity
               if (!hitDetected) {
                 setPlayerArrow((prev) => ({ ...prev, x: newX, y: newY, vx: newVx, vy: newVy }));
               }
             } // End Player Arrow Physics

             // --- Enemy Arrows Physics & Hit Detection ---
             if (enemyArrows.length > 0) {
               const nextEnemyArrows = []; // Build the next state array
               let updateState = false; // Flag if state needs updating

               for (const arrow of enemyArrows) {
                 // Update velocity and position
                 const newVx = arrow.vx;
                 const newVy = arrow.vy + GRAVITY;
                 const newX = arrow.x + newVx;
                 const newY = arrow.y + newVy;
                 let arrowRemoved = false; // Flag if this arrow should be removed

                 // Check if arrow is out of bounds or hit ground
                 if (newX < -outOfBoundsMargin || newX > canvas.width + outOfBoundsMargin || newY > groundLevel + 10) {
                   // Arrow missed, let the firing enemy AI learn
                   if (enemyAiRef.current[arrow.enemyIndex]) {
                     learnFromMiss(arrow.enemyIndex, arrow.minMissDistance);
                   }
                   arrowRemoved = true;
                   updateState = true;
                 } else {
                   // Check for collision with player (if player exists)
                   if (!positions.player || positions.player.x === 0) {
                       // Player doesn't exist, just keep arrow moving (shouldn't happen in normal play)
                       nextEnemyArrows.push({ ...arrow, x: newX, y: newY, vx: newVx, vy: newVy });
                       updateState = true;
                       continue;
                   }
                   const playerCenterX = positions.player.x;
                   const playerCenterY = positions.player.y - 30 * SCALE_FACTOR; // Approx center mass
                   const dxPlayer = newX - playerCenterX;
                   const dyPlayer = newY - playerCenterY;
                   const distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
                   // Update minimum miss distance for learning
                   const currentMinMiss = Math.min(arrow.minMissDistance, distPlayer);

                   // Check distance against player hit radius
                   if (distPlayer < PLAYER_HIT_RADIUS) {
                     // Check if the hitting ARROW has power=1
                     if (arrow.power === 1) {
                       handleHit("Enemy", { enemyIndex: arrow.enemyIndex, arrowId: arrow.id }); // CRITICAL HIT -> End Round
                     } else {
                       console.log(`Non-critical arrow (Power: ${arrow.power}) from enemy ${enemyNames[arrow.enemyIndex]} hit player`);
                       // Optional: Add visual feedback for non-critical hit on player
                     }
                     // Let AI learn from the hit (or close miss)
                     if (enemyAiRef.current[arrow.enemyIndex]) {
                       learnFromMiss(arrow.enemyIndex, distPlayer);
                     }
                     arrowRemoved = true; // Remove arrow after ANY hit
                     updateState = true;
                     // Note: handleHit changes gameState, loop continues but won't re-trigger hit logic this frame
                   } else {
                     // Arrow still in flight, update its state and keep it
                     nextEnemyArrows.push({ ...arrow, x: newX, y: newY, vx: newVx, vy: newVy, minMissDistance: currentMinMiss });
                     // Mark state update if arrow moved significantly
                     if (Math.abs(newX - arrow.x) > 0.1 || Math.abs(newY - arrow.y) > 0.1) {
                       updateState = true;
                     }
                   }
                 } // End collision checks
               } // End loop through enemy arrows

               // If any arrows were removed or moved, update the state
               if (updateState) {
                 setEnemyArrows(nextEnemyArrows);
               }
             } // End Enemy Arrows Physics
          } // End if (deltaTime > 0 && assessmentQuestions.length > 0)

          // --- Draw the Game Scene ---
          drawGameScene(); // Draw all visual elements for the 'playing' state
          break; // End case 'playing'

        default: // Should not happen
            if(ctx) { ctx.fillStyle='grey'; ctx.fillText(`Unknown State: ${gameState}`, 100, 100); }
      } // End switch (gameState)

      // Request the next frame
      requestRef.current = requestAnimationFrame(animate);
    };

    // Start the animation loop
    requestRef.current = requestAnimationFrame(animate);

    // Cleanup function for the effect
    return () => {
      isActive = false; // Signal loop to stop
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current); // Cancel the next frame request
        requestRef.current = null;
      }
    };
  }, [
    // Extensive list of dependencies for the main loop:
    ctx, gameState, enemyCanFire, playerArrow, enemyArrows, positions, assessmentQuestions,
    currentQuestionIndex, explanationText, // States used in drawing or logic
    drawQuestionScreen, drawExplanationScreen, drawGameOverScreen, drawGameScene, // Drawing functions
    fireEnemyArrow, learnFromMiss, handleHit, // Core game logic functions
    GRAVITY, SCALE_FACTOR, wrapText // Constants and helpers used within the loop
  ]);


  // --- Render JSX ---
  return (
    <div className="archery-game-container">
      {/* Scoreboards - Always visible */}
      <div className="scoreboard scoreboard-top-left">
        <h3>Player</h3>
        <p>Score: {playerScore}</p>
        {/* Optional: <p>Shots This Round: {playerShots}</p> */}
      </div>
      <div className="scoreboard scoreboard-top-right">
        <h3>Enemies</h3>
        <p>Score: {enemyScore}</p>
        {/* Optional: <p>Shots This Round: {enemyTotalShots}</p> */}
      </div>

      {/* Canvas for the game */}
      <canvas ref={canvasRef} className="game-canvas" />

      {/* Controls Area - Conditionally rendered */}
      <div className="controls-area">
        {/* Show controls only when playing and player is initialized */}
        {gameState === 'playing' && positions.player.x !== 0 && assessmentQuestions.length > 0 && (
          <div className="bottom-controls">

            {/* Angle Control */}
            <div className="control-set angle-control">
              <label htmlFor="angle-slider">Angle</label>
              <div className="slider-container">
                 <button className="fine-tune-button minus-button" onClick={() => setAngle(a => Math.max(0, a - 1))} disabled={!!playerArrow} aria-label="Decrease Angle">-</button>
                 <input id="angle-slider" type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} disabled={!!playerArrow} className="control-slider" />
                 <button className="fine-tune-button plus-button" onClick={() => setAngle(a => Math.min(90, a + 1))} disabled={!!playerArrow} aria-label="Increase Angle">+</button>
              </div>
              <span className="value-display">{angle}°</span>
            </div>

            {/* Power Control */}
            <div className="control-set power-control">
               <label htmlFor="power-slider">Power</label>
               <div className="slider-container">
                 <button className="fine-tune-button minus-button" onClick={() => setPower(p => Math.max(10, p - 1))} disabled={!!playerArrow} aria-label="Decrease Power">-</button>
                 <input id="power-slider" type="range" min="10" max="100" value={power} onChange={(e) => setPower(parseInt(e.target.value))} disabled={!!playerArrow} className="control-slider" />
                  <button className="fine-tune-button plus-button" onClick={() => setPower(p => Math.min(100, p + 1))} disabled={!!playerArrow} aria-label="Increase Power">+</button>
               </div>
               <span className="value-display">{power}</span>
            </div>

            {/* Fire Button */}
            <button className="fire-button" onClick={firePlayerArrow} disabled={!!playerArrow}> FIRE! </button>
          </div>
        )}
         {/* Display overlay messages for loading or error states */}
         {gameState === 'loading' && ( <div className="loading-overlay">Loading Questions...</div> )}
         {gameState === 'error' && ( <div className="error-overlay">{explanationText || "An error occurred."}</div> )}
      </div>
    </div>
  );
};

export default ArcheryGame;