'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type RefObject,
} from 'react'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BUCKET_WIDTH,
  BUCKET_HEIGHT,
  BUCKET_SPEED,
  COIN_COUNT,
  coinFacts,
} from './constants'
import { createCoin, getRandomFact, Coin, PowerType } from './utils'

function createPowerBall(type: PowerType): Coin {
  const c = createCoin();
  return { ...c, isPower: true, powerType: type };
}

export function useBlockMinerGame(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  {
    sliderColor = '#FFD700',
    ballColor = '#8B4513',
    onScore,
    onFact,
    playing = false,
  }: {
    sliderColor?: string
    ballColor?: string
    onScore?: (score: number) => void
    onFact?: (fact: string) => void
    playing?: boolean
  } = {}
) {
  // bucket position
  const [bucketX, setBucketX] = useState((CANVAS_WIDTH - BUCKET_WIDTH) / 2)
  // coins
  const [coins, setCoins] = useState(() => {
    const arr: Coin[] = Array.from({ length: COIN_COUNT - 2 }, () => createCoin());
    arr.push(createNegativeCoin());
    // Only one power ball per level, randomly chosen
    const powerTypes: PowerType[] = ['time', 'fast', 'big'];
    const randomType = powerTypes[Math.floor(Math.random() * powerTypes.length)];
    arr.push(createPowerBall(randomType));
    return arr;
  })
  const [score, setScore] = useState(0)
  const lastTs = useRef(0)
  // Power ball state
  const [fastSlider, setFastSlider] = useState(false);
  const [bigCoins, setBigCoins] = useState(false);
  const fastTimer = useRef(0);
  const bigTimer = useRef(0);
  const [fact, setFact] = useState('')

  // input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setBucketX((x) => Math.max(0, x - BUCKET_SPEED))
      } else if (e.key === 'ArrowRight') {
        setBucketX((x) => Math.min(CANVAS_WIDTH - BUCKET_WIDTH, x + BUCKET_SPEED))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // update + draw
  const updateGame = useCallback(
    (delta: number) => {
      if (!playing) return;
      // power timers
      if (fastSlider) {
        fastTimer.current -= delta;
        if (fastTimer.current <= 0) setFastSlider(false);
      }
      if (bigCoins) {
        bigTimer.current -= delta;
        if (bigTimer.current <= 0) setBigCoins(false);
      }

      // move coins
      setCoins((arr) =>
        arr.map((c) => {
          let y = c.y + c.speedY * delta;
          let rotation = c.rotation + c.rotationSpeed * delta;
          let radius = c.radius;
          if (bigCoins && !c.isNegative && !c.isPower) radius = 28;
          if (y - radius > CANVAS_HEIGHT) {
            if (c.isNegative) return createNegativeCoin();
            if (c.isPower) {
              // Only respawn one random power ball
              const powerTypes: PowerType[] = ['time', 'fast', 'big'];
              const randomType = powerTypes[Math.floor(Math.random() * powerTypes.length)];
              return createPowerBall(randomType);
            }
            return createCoin();
          }
          return { ...c, y, rotation, radius };
        })
      )

      // collision
      setCoins((prev) => {
        const bucketY = CANVAS_HEIGHT - BUCKET_HEIGHT - 10
        return prev.map((c) => {
          const inX = c.x >= bucketX && c.x <= bucketX + BUCKET_WIDTH
          const inY =
            c.y + c.radius >= bucketY && c.y - c.radius <= bucketY + BUCKET_HEIGHT
          if (inX && inY) {
            if (c.isNegative) {
              const penalty = Math.floor(Math.random() * 2) + 1 // -1 or -2
              const newScore = Math.max(0, score - penalty)
              setScore(newScore)
              if (onScore) onScore(newScore)
              return createNegativeCoin();
            } else if (c.isPower) {
              if (c.powerType === 'time') {
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('block-miner-add-time'));
              } else if (c.powerType === 'fast') {
                setFastSlider(true);
                fastTimer.current = 300; // 5s
              } else if (c.powerType === 'big') {
                setBigCoins(true);
                bigTimer.current = 300; // 5s
              }
              // Only respawn one random power ball
              const powerTypes: PowerType[] = ['time', 'fast', 'big'];
              const randomType = powerTypes[Math.floor(Math.random() * powerTypes.length)];
              return createPowerBall(randomType);
            } else {
              const newScore = score + 1
              setScore(newScore)
              if (onScore) onScore(newScore)
              const newFact = getRandomFact(coinFacts)
              setFact(newFact)
              if (onFact) onFact(newFact)
              return createCoin();
            }
          }
          return c
        })
      })
    },
    [bucketX, playing, score, onScore, onFact]
  )

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // bg gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    grad.addColorStop(0, '#ffe259')
    grad.addColorStop(1, '#ffa751')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // mine floor
    ctx.fillStyle = '#b5651d'
    ctx.fillRect(0, CANVAS_HEIGHT * 0.85, CANVAS_WIDTH, CANVAS_HEIGHT * 0.15)

    // coins
    coins.forEach((c) => {
      ctx.save()
      ctx.translate(c.x, c.y)
      ctx.rotate(c.rotation)
      ctx.beginPath()
      ctx.arc(0, 0, c.radius, 0, 2 * Math.PI)
      if (c.isNegative) {
        ctx.fillStyle = '#FF3333';
        ctx.shadowColor = '#FF3333';
        ctx.shadowBlur = 10;
      } else if (c.isPower) {
        if (c.powerType === 'time') {
          ctx.fillStyle = '#2196F3';
          ctx.shadowColor = '#2196F3';
        } else if (c.powerType === 'fast') {
          ctx.fillStyle = '#43A047';
          ctx.shadowColor = '#43A047';
        } else if (c.powerType === 'big') {
          ctx.fillStyle = '#8E24AA';
          ctx.shadowColor = '#8E24AA';
        }
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = ballColor;
        ctx.shadowColor = ballColor;
        ctx.shadowBlur = 6;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#000';
      ctx.stroke();
      ctx.restore();
    })

    // bucket
    const bucketY = CANVAS_HEIGHT - BUCKET_HEIGHT - 10
    ctx.fillStyle = sliderColor
    ctx.fillRect(bucketX, bucketY, BUCKET_WIDTH, BUCKET_HEIGHT)
    ctx.strokeRect(bucketX, bucketY, BUCKET_WIDTH, BUCKET_HEIGHT)

    // score
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    ctx.fillText(`Score: ${score}`, 20, 30)
  }, [bucketX, coins, score, sliderColor, ballColor])

  // animation loop
  useEffect(() => {
    let handle: number

    const step = (ts: number) => {
      if (!lastTs.current) lastTs.current = ts
      const delta = (ts - lastTs.current) / 16.6667
      lastTs.current = ts

      updateGame(delta)
      drawGame()
      handle = requestAnimationFrame(step)
    }
    handle = requestAnimationFrame(step)
    return () => cancelAnimationFrame(handle)
  }, [drawGame, updateGame])

  // For parent: return theme index for background cycling
  const themeIndex = Math.floor((score + 1) / 10) % 3;
  return { score, setScore, fastSlider, bigCoins, themeIndex, fact, setFact };
}

function createNegativeCoin() {
  const c = createCoin();
  return { ...c, isNegative: true };
}
