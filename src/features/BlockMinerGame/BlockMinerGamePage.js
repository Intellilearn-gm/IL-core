import React, { useRef, useState, useEffect, useCallback } from "react";
import "./BlockMinerGame.css";

/* --------------------------------
   --     CONSTANTS & DATA      --
   -------------------------------- */
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

// Bucket
const BUCKET_WIDTH = 80;
const BUCKET_HEIGHT = 40;
const BUCKET_SPEED = 10; // movement in px per "frame" at ~60 fps

// Coins
const COIN_BASE_SPEED = 2.5;       // base vertical speed
const COIN_SPEED_VARIATION = 2.5;  // random additional speed
const COIN_BASE_ROTATION = 0.03;   // base rotation speed
const COIN_ROTATION_VARIATION = 0.02;
const COIN_RADIUS = 15;
const COIN_COUNT = 7;              // total coins on screen

// Facts
const coinFacts = [
  "Blockchain is a decentralized ledger across many computers.",
  "Web3 ushers in a more transparent, user-controlled internet.",
  "Smart contracts are self-executing once conditions are met.",
  "Educhain powers learning through blockchain technology.",
  "OpenCampus connects educators & learners globally on-chain.",
  "Decentralization removes single points of failure.",
  "Ethereum introduced smart contracts to mainstream blockchain.",
];
const getRandomFact = () =>
  coinFacts[Math.floor(Math.random() * coinFacts.length)];

/* --------------------------------
   --      HELPER FUNCTIONS     --
   -------------------------------- */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

/* Each coin will have:
  x, y            -> position
  radius          -> default 15
  speedY          -> vertical speed
  rotation        -> current rotation angle (radians)
  rotationSpeed   -> speed of rotation (radians/frame)
*/
function createCoin() {
  return {
    x: randomRange(COIN_RADIUS, CANVAS_WIDTH - COIN_RADIUS),
    y: randomRange(-CANVAS_HEIGHT, 0),  // start above the canvas
    radius: COIN_RADIUS,
    speedY: COIN_BASE_SPEED + randomRange(0, COIN_SPEED_VARIATION),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: COIN_BASE_ROTATION + (Math.random() - 0.5) * COIN_ROTATION_VARIATION * 2,
  };
}

const BlockMinerGame = () => {
  const canvasRef = useRef(null);

  // Bucket position (x-axis)
  const [bucketX, setBucketX] = useState(
    CANVAS_WIDTH / 2 - BUCKET_WIDTH / 2
  );

  // Scoring & Fact display
  const [score, setScore] = useState(0);
  const [fact, setFact] = useState("");
  const factTimerRef = useRef(0); // counts down frames for displaying the fact

  // Coins state
  const [coins, setCoins] = useState(() => {
    // Initialize with an array of randomly placed coins
    const initialCoins = [];
    for (let i = 0; i < COIN_COUNT; i++) {
      initialCoins.push(createCoin());
    }
    return initialCoins;
  });

  // Keep track of the last timestamp for smooth, time-based animation
  const lastTimestampRef = useRef(0);

  /* --------------------------------
     --      INPUT HANDLING       --
     -------------------------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setBucketX((prev) => Math.max(0, prev - BUCKET_SPEED));
      } else if (e.key === "ArrowRight") {
        setBucketX((prev) =>
          Math.min(CANVAS_WIDTH - BUCKET_WIDTH, prev + BUCKET_SPEED)
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* --------------------------------
     --      GAME LOGIC LOOP      --
     -------------------------------- */
  const updateGame = useCallback(
    (delta) => {
      // 1) Update fact timer if any
      if (factTimerRef.current > 0) {
        factTimerRef.current -= delta;
        if (factTimerRef.current < 0) {
          factTimerRef.current = 0;
        }
      }

      // 2) Update coin positions
      setCoins((prevCoins) =>
        prevCoins.map((coin) => {
          const newY = coin.y + coin.speedY * delta;
          let { x, rotation } = coin;

          // Update rotation
          rotation += coin.rotationSpeed * delta;

          // If coin goes off the bottom of screen, respawn above
          if (newY - coin.radius > CANVAS_HEIGHT) {
            return createCoin();
          }
          return { ...coin, y: newY, rotation };
        })
      );

      // 3) Collision detection
      setCoins((prevCoins) => {
        const updated = [...prevCoins];
        for (let i = 0; i < updated.length; i++) {
          const coin = updated[i];
          const bucketY = CANVAS_HEIGHT - BUCKET_HEIGHT - 10;
          // Check if coin is horizontally within the bucket
          if (
            coin.x >= bucketX &&
            coin.x <= bucketX + BUCKET_WIDTH
          ) {
            // Check if coin has reached the bucket vertically
            if (
              coin.y + coin.radius >= bucketY &&
              coin.y - coin.radius <= bucketY + BUCKET_HEIGHT
            ) {
              // Coin is collected
              setScore((prev) => prev + 1);
              setFact(getRandomFact());
              factTimerRef.current = 200; // about ~3 seconds at 60fps
              // Respawn the coin
              updated[i] = createCoin();
            }
          }
        }
        return updated;
      });
    },
    [bucketX]
  );

  /* --------------------------------
     --     DRAWING THE SCENE     --
     -------------------------------- */
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, "#ffe259"); // top: bright
    grad.addColorStop(1, "#ffa751"); // bottom: warm
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Optionally add a "mine" theme or horizon, e.g.:
    ctx.fillStyle = "#b5651d";
    ctx.fillRect(0, CANVAS_HEIGHT * 0.85, CANVAS_WIDTH, CANVAS_HEIGHT * 0.15);

    // Draw coins
    ctx.fillStyle = "#ffd700"; // golden coin color
    ctx.strokeStyle = "#000";
    coins.forEach((coin) => {
      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.rotate(coin.rotation);
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Draw the player's bucket
    const bucketY = CANVAS_HEIGHT - BUCKET_HEIGHT - 10;
    ctx.fillStyle = "#8b4513"; // brownish bucket color
    ctx.fillRect(bucketX, bucketY, BUCKET_WIDTH, BUCKET_HEIGHT);
    ctx.strokeRect(bucketX, bucketY, BUCKET_WIDTH, BUCKET_HEIGHT);

    // Score display
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);

    // Display the fun fact if timer not expired
    if (factTimerRef.current > 0 && fact) {
      ctx.fillText(`Fact: ${fact}`, 20, 60);
    }
  }, [bucketX, coins, score, fact]);

  /* --------------------------------
     --     ANIMATION HANDLER     --
     -------------------------------- */
  useEffect(() => {
    let animationFrameId;
    function animate(timestamp) {
      if (!lastTimestampRef.current) {
        // first frame
        lastTimestampRef.current = timestamp;
      }
      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      // Convert to "frames" at ~60fps => 1 frame ~ 16.667 ms
      const delta = deltaMs / 16.6667;

      // Update logic
      updateGame(delta);

      // Draw
      drawGame();

      // Next frame
      animationFrameId = requestAnimationFrame(animate);
    }
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [drawGame, updateGame]);

  return (
    <div className="block-miner-container">
      <h1 className="miner-title">Gold Miner Challenge</h1>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block-miner-canvas"
      />
      <div className="block-miner-info">
        <p>
          Use the <strong>Left</strong> and <strong>Right</strong> arrow keys to move
          your bucket and collect falling coins.
        </p>
        <p>
          Every coin collected reveals a fun fact about Web3, Educhain, or
          blockchain!
        </p>
      </div>
    </div>
  );
};

export default BlockMinerGame;
