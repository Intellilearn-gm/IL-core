// components/games/oc-code-quest/OCCodeQuestGame.tsx
'use client'

import { useRef } from 'react'
import { useOCCodeQuestGame } from './useOCCodeQuestGame'
import styles from './occodequest.module.css'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants'

export default function OCCodeQuestGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useOCCodeQuestGame(canvasRef)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>OpenCampus Code Quest</h1>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className={styles.canvas}
      />
      <div className={styles.info}>
        <p>
          Pilot your ship with arrow keys (no more scrolling!), collect tokens and unlock trivia.
        </p>
        <p>
          Facts drop in Sunrise Pink and Tangerine Glow – how many can you catch?
        </p>
      </div>
    </div>
  )
}
