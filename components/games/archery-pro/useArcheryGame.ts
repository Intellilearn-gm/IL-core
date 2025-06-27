// components/games/archery-pro/useArcheryGame.ts
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import {
  NUM_ENEMIES,
  SCALE_FACTOR,
  MIN_ENEMY_DISTANCE,
  GRAVITY,
  BASE_ENEMY_SPEED,
  ENEMY_FIRE_DELAY,
  ENEMY_NAMES,
  ASSESSMENT_API_URL,
  FALLBACK_ASSESSMENT_DATA,
  THEME_COLORS,
} from './constants'

export function useArcheryGame(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  // Game phases: loading, showing_question, playing, showing_explanation, game_over
  const [gameState, setGameState] = useState<'loading'|'showing_question'|'playing'|'showing_explanation'|'game_over'>(
    'loading'
  )

  // Assessment data & round
  const [questions, setQuestions] = useState<any[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [explanation, setExplanation] = useState('')

  // Scores
  const [playerScore, setPlayerScore] = useState(0)
  const [enemyScore, setEnemyScore] = useState(0)

  // Positions/state refs
  const canvasSize = { w: 1000, h: 600 }
  const enemyCanFireRef = useRef(false)

  // Player controls
  const [angle, setAngle] = useState(45)    // 0–90
  const [power, setPower] = useState(50)    // 10–100

  // Arrow in-flight
  const [playerArrow, setPlayerArrow] = useState<any>(null)
  const [enemyArrows, setEnemyArrows] = useState<any[]>([])
  const enemyAiRef = useRef<any[]>([])
  const lastSpawnRef = useRef<number>(performance.now())
  const lastTsRef = useRef<number>(0)
  const clickableAreas = useRef<Record<string, any>>({})

  // Utility: wrap text
  const wrapText = useCallback(
    (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      color = THEME_COLORS.TEXT,
      font = `bold ${20 * SCALE_FACTOR}px Arial`
    ) => {
      if (!ctx) return y
      ctx.fillStyle = color
      ctx.font = font
      const words = text.split(' ')
      let line = ''
      let currentY = y
      for (let w of words) {
        const test = line + w + ' '
        const { width } = ctx.measureText(test)
        if (width > maxWidth && line) {
          ctx.fillText(line.trim(), x, currentY)
          line = w + ' '
          currentY += lineHeight
        } else {
          line = test
        }
      }
      ctx.fillText(line.trim(), x, currentY)
      return currentY + lineHeight
    },
    [ctx]
  )

  // Fetch assessment questions on mount
  useEffect(() => {
    const init = async () => {
      setGameState('loading')
      try {
        const res = await fetch(ASSESSMENT_API_URL)
        if (!res.ok) throw new Error(res.statusText)
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid data')
        setQuestions(data)
      } catch (err) {
        console.error('Using fallback assessment data:', err)
        setQuestions(FALLBACK_ASSESSMENT_DATA)
      }
      setRoundIndex(0)
      setPlayerScore(0)
      setEnemyScore(0)
      setGameState('showing_question')
    }
    init()
  }, [])

  // Initialize canvas context
  useEffect(() => {
    const c = canvasRef.current
    if (c) {
      c.width = canvasSize.w
      c.height = canvasSize.h
      const context = c.getContext('2d')
      setCtx(context)
    }
  }, [canvasRef])

  // Prevent page scroll & handle arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault()
        setAngle((a) =>
          e.key === 'ArrowLeft'
            ? Math.max(0, a - 5)
            : e.key === 'ArrowRight'
            ? Math.min(90, a + 5)
            : a
        )
        setPower((p) =>
          e.key === 'ArrowUp'
            ? Math.min(100, p + 5)
            : e.key === 'ArrowDown'
            ? Math.max(10, p - 5)
            : p
        )
      }
    }
    window.addEventListener('keydown', onKey, { passive: false })
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Click handler for UI buttons on the canvas
  useEffect(() => {
    const c = canvasRef.current
    if (!c || !ctx) return
    const onClick = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect()
      const x = ((e.clientX - rect.left) * c.width) / rect.width
      const y = ((e.clientY - rect.top) * c.height) / rect.height
      for (const key in clickableAreas.current) {
        const a = clickableAreas.current[key]
        if (
          x >= a.x &&
          x <= a.x + a.w &&
          y >= a.y &&
          y <= a.y + a.h
        ) {
          switch (a.action) {
            case 'start_round':
              setGameState('playing')
              setPlayerArrow(null)
              enemyCanFireRef.current = false
              setTimeout(() => (enemyCanFireRef.current = true), ENEMY_FIRE_DELAY)
              break
            case 'next_question':
              setRoundIndex((ri) => ri + 1)
              setGameState('showing_question')
              break
            case 'finish_game':
              setGameState('game_over')
              break
            case 'restart_game':
              setPlayerScore(0)
              setEnemyScore(0)
              setRoundIndex(0)
              setGameState('showing_question')
              break
          }
          clickableAreas.current = {}
        }
      }
    }
    c.addEventListener('click', onClick)
    return () => c.removeEventListener('click', onClick)
  }, [ctx])

  // Core animation & drawing loop
  useEffect(() => {
    let id: number
    const frame = (ts: number) => {
      if (!ctx || !canvasRef.current) return

      // Clear
      ctx.clearRect(0, 0, canvasSize.w, canvasSize.h)
      const q = questions[roundIndex]

      // Question screen
      if (gameState === 'showing_question') {
        // background
        ctx.fillStyle = THEME_COLORS.QUESTION_BG
        ctx.fillRect(0, 0, canvasSize.w, canvasSize.h)

        // Title
        ctx.fillStyle = THEME_COLORS.TEXT
        ctx.font = `bold ${24 * SCALE_FACTOR}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(`Round ${roundIndex + 1}`, canvasSize.w / 2, 50)

        // Question
        let y = 90
        ctx.textAlign = 'left'
        y = wrapText(q.question, 50, y, canvasSize.w - 100, 28)

        // Options
        q.options.forEach((opt: string, i: number) => {
          y = wrapText(`${ENEMY_NAMES[i]}. ${opt}`, 80, y, canvasSize.w - 160, 24)
        })

        // Start button
        const bx = canvasSize.w / 2 - 90
        const by = y + 20
        clickableAreas.current = {
          start_round: { x: bx, y: by, w: 180, h: 40 },
        }
        ctx.fillStyle = THEME_COLORS.BUTTON
        ctx.fillRect(bx, by, 180, 40)
        ctx.fillStyle = THEME_COLORS.BUTTON_TEXT
        ctx.font = `bold ${20 * SCALE_FACTOR}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText('Start Round', canvasSize.w / 2, by + 26)
      }

      // (playing, explanation, game_over)
      // …for brevity, you can port the remaining drawGameScene, drawExplanationScreen,
      // drawGameOverScreen, update & physics logic directly from your ArcheryGamePage.js :contentReference[oaicite:1]{index=1}.

      id = requestAnimationFrame(frame)
    }
    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [ctx, gameState, questions, roundIndex, wrapText])

  // Nothing returned: this hook drives the canvas render loop
}
