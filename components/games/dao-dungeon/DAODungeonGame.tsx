// components/games/dao-dungeon/DAODungeonGame.tsx
'use client'

import { useRef } from 'react'
import { useDAODungeonGame } from './useDAODungeonGame'
import styles from './daodungeon.module.css'
import { initialMap, tileSize } from './constants'


export default function DAODungeonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useDAODungeonGame(canvasRef)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>DAO Dungeon Escape</h1>
      <canvas
        ref={canvasRef}
        width={initialMap[0].length * tileSize}
        height={initialMap.length * tileSize}
        className={styles.canvas}
      />
      <div className={styles.info}>
        <p>Use the arrow keys to navigate the dungeon.</p>
        <p>Collect all tokens to unlock the door and escape!</p>
      </div>
    </div>
  )
}
