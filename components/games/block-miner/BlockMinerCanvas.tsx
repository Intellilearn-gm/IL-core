'use client'

import { type RefObject } from 'react'
import styles from './blockMiner.module.css'

export function BlockMinerCanvas({
  canvasRef,
  sliderColor,
  ballColor,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>
  sliderColor?: string
  ballColor?: string
}) {
  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={600}
      className={styles.canvas}
      data-slider-color={sliderColor}
      data-ball-color={ballColor}
    />
  )
}
