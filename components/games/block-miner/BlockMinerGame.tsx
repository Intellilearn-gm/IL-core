'use client'

import { useRef } from 'react'
import styles from './blockMiner.module.css'
import { useBlockMinerGame } from './useBlockMinerGame'
import { BlockMinerCanvas } from './BlockMinerCanvas'
import { BlockMinerInfo }   from './BlockMinerInfo'

export default function BlockMinerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { score, fact } = useBlockMinerGame(canvasRef)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gold Miner Challenge</h1>
      <BlockMinerCanvas canvasRef={canvasRef} />
      <BlockMinerInfo />
    </div>
  )
}
