'use client'

import { type RefObject } from 'react'
import styles from './blockMiner.module.css'

export function BlockMinerCanvas({
  canvasRef,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>
}) {
  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={600}
      className={styles.canvas}
    />
  )
}
