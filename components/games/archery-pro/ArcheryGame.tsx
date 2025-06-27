// components/games/archery-pro/ArcheryGame.tsx
'use client'

import { useRef } from 'react'
import { useArcheryGame } from './useArcheryGame'
import styles from './archery.module.css'

export default function ArcheryGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useArcheryGame(canvasRef)

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={1000}
        height={600}
      />
    </div>
  )
}
