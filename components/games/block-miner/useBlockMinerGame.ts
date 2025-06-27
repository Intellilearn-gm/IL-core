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
import { createCoin, getRandomFact } from './utils'

export function useBlockMinerGame(canvasRef: RefObject<HTMLCanvasElement>) {
  // bucket position
  const [bucketX, setBucketX] = useState((CANVAS_WIDTH - BUCKET_WIDTH) / 2)
  // coins
  const [coins, setCoins] = useState(() =>
    Array.from({ length: COIN_COUNT }, () => createCoin())
  )
  // score + fact
  const [score, setScore] = useState(0)
  const [fact, setFact] = useState('')
  const factTimer = useRef(0)
  const lastTs = useRef(0)

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
      // fact timer
      factTimer.current = Math.max(0, factTimer.current - delta)

      // move coins
      setCoins((arr) =>
        arr.map((c) => {
          const y = c.y + c.speedY * delta
          const rotation = c.rotation + c.rotationSpeed * delta
          if (y - c.radius > CANVAS_HEIGHT) return createCoin()
          return { ...c, y, rotation }
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
            setScore((s) => s + 1)
            setFact(getRandomFact(coinFacts))
            factTimer.current = 200
            return createCoin()
          }
          return c
        })
      })
    },
    [bucketX]
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
    ctx.fillStyle = '#ffd700'
    ctx.strokeStyle = '#000'
    coins.forEach((c) => {
      ctx.save()
      ctx.translate(c.x, c.y)
      ctx.rotate(c.rotation)
      ctx.beginPath()
      ctx.arc(0, 0, c.radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    })

    // bucket
    const bucketY = CANVAS_HEIGHT - BUCKET_HEIGHT - 10
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(bucketX, bucketY, BUCKET_WIDTH, BUCKET_HEIGHT)
    ctx.strokeRect(bucketX, bucketY, BUCKET_WIDTH, BUCKET_HEIGHT)

    // score / fact
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    ctx.fillText(`Score: ${score}`, 20, 30)
    if (factTimer.current > 0 && fact) {
      ctx.fillText(`Fact: ${fact}`, 20, 60)
    }
  }, [bucketX, coins, score, fact])

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

  return { score, fact }
}
