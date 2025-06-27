// components/games/oc-code-quest/useOCCodeQuestGame.ts
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  SHIP_WIDTH,
  SHIP_HEIGHT,
  SHIP_SPEED,
  TOKEN_RADIUS,
  TOKEN_SPEED,
  TOKEN_SPAWN_INTERVAL,
  ocFacts,
} from './constants'

function getRandomFact() {
  return ocFacts[Math.floor(Math.random() * ocFacts.length)]
}

function createToken() {
  return {
    x: CANVAS_WIDTH + TOKEN_RADIUS,
    y: Math.random() * (CANVAS_HEIGHT - TOKEN_RADIUS * 2) + TOKEN_RADIUS,
    radius: TOKEN_RADIUS,
    speed: TOKEN_SPEED,
    fact: getRandomFact(),
  }
}

export function useOCCodeQuestGame(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [shipX, setShipX] = useState(100)
  const [shipY, setShipY] = useState(CANVAS_HEIGHT / 2 - SHIP_HEIGHT / 2)
  const [tokens, setTokens] = useState<ReturnType<typeof createToken>[]>([])
  const [score, setScore] = useState(0)
  const [currentFact, setCurrentFact] = useState('')
  const lastSpawn = useRef(performance.now())
  const lastTs = useRef(0)

  // Prevent page scroll & handle arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)
      ) {
        e.preventDefault()
        setShipX((x) => {
          if (e.key === 'ArrowLeft') return Math.max(0, x - SHIP_SPEED)
          if (e.key === 'ArrowRight') return Math.min(CANVAS_WIDTH - SHIP_WIDTH, x + SHIP_SPEED)
          return x
        })
        setShipY((y) => {
          if (e.key === 'ArrowUp') return Math.max(0, y - SHIP_SPEED)
          if (e.key === 'ArrowDown') return Math.min(CANVAS_HEIGHT - SHIP_HEIGHT, y + SHIP_SPEED)
          return y
        })
      }
    }
    window.addEventListener('keydown', onKey, { passive: false })
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Spawn & move tokens, detect collisions
  const update = useCallback((delta: number) => {
    if (performance.now() - lastSpawn.current > TOKEN_SPAWN_INTERVAL) {
      setTokens((t) => [...t, createToken()])
      lastSpawn.current = performance.now()
    }

    setTokens((toks) =>
      toks
        .map((t) => ({ ...t, x: t.x - t.speed * delta }))
        .filter((t) => {
          const centerX = shipX + SHIP_WIDTH / 2
          const centerY = shipY + SHIP_HEIGHT / 2
          const dx = Math.abs(t.x - centerX)
          const dy = Math.abs(t.y - centerY)
          if (dx < SHIP_WIDTH / 2 + t.radius && dy < SHIP_HEIGHT / 2 + t.radius) {
            setScore((s) => s + 1)
            setCurrentFact(t.fact)
            return false
          }
          return t.x + t.radius > 0
        })
    )
  }, [shipX, shipY])

  // Draw loop
  const draw = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // background gradient (soft peach)
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    grad.addColorStop(0, '#FFF1CC') // Apricot Mist
    grad.addColorStop(1, '#FFE8D6') // Peach Whisper
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // spaceship (Golden Ember)
    ctx.fillStyle = '#FFD166'
    ctx.beginPath()
    ctx.moveTo(shipX, shipY + SHIP_HEIGHT / 2)
    ctx.lineTo(shipX + SHIP_WIDTH, shipY)
    ctx.lineTo(shipX + SHIP_WIDTH, shipY + SHIP_HEIGHT)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#2E2B2B'
    ctx.stroke()

    // tokens (Sunrise Pink)
    ctx.fillStyle = '#FF6B8A'
    ctx.strokeStyle = '#2E2B2B'
    tokens.forEach((t) => {
      ctx.beginPath()
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })

    // HUD
    ctx.fillStyle = '#2E2B2B'
    ctx.font = '20px monospace'
    ctx.fillText(`Score: ${score}`, 20, 30)
    if (currentFact) ctx.fillText(`Fact: ${currentFact}`, 20, 60)
  }, [shipX, shipY, tokens, score, currentFact])

  // Animation frame loop
  useEffect(() => {
    let req: number
    const frame = (ts: number) => {
      if (!lastTs.current) lastTs.current = ts
      const delta = (ts - lastTs.current) / 16.6667
      lastTs.current = ts
      update(delta)
      draw()
      req = requestAnimationFrame(frame)
    }
    req = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(req)
  }, [draw, update])
}
