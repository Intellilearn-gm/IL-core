// components/games/dao-dungeon/useDAODungeonGame.ts
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { initialMap, tileSize } from './constants'

export function useDAODungeonGame(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [map, setMap] = useState<number[][]>(initialMap)
  const [score, setScore] = useState(0)
  const [totalTokens, setTotalTokens] = useState(0)
  const [doorUnlocked, setDoorUnlocked] = useState(false)
  const [gameWon, setGameWon] = useState(false)

  // Count tokens once
  useEffect(() => {
    let count = 0
    for (const row of initialMap) {
      row.forEach(cell => { if (cell === 2) count++ })
    }
    setTotalTokens(count)
  }, [])

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameWon) return

      let newX = playerPos.x
      let newY = playerPos.y
      if (e.key === 'ArrowUp') newY--
      if (e.key === 'ArrowDown') newY++
      if (e.key === 'ArrowLeft') newX--
      if (e.key === 'ArrowRight') newX++

      // Boundary check
      if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length)
        return

      const cell = map[newY][newX]
      if (cell === 1) return          // wall
      if (cell === 3 && !doorUnlocked) return // locked door

      // Move
      setPlayerPos({ x: newX, y: newY })

      // Collect token
      if (cell === 2) {
        setScore(s => s + 1)
        setMap(m => {
          const copy = m.map(r => r.slice())
          copy[newY][newX] = 0
          return copy
        })
      }

      // Win on door if unlocked
      if (cell === 3 && doorUnlocked) {
        setGameWon(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playerPos, map, doorUnlocked, gameWon])

  // Unlock door when all tokens collected
  useEffect(() => {
    if (score >= totalTokens && totalTokens > 0) {
      setDoorUnlocked(true)
    }
  }, [score, totalTokens])

  // Draw function
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        const cell = map[y][x]
        let color = '#e0e0e0'         // floor
        if (cell === 1) color = '#555'   // wall
        if (cell === 2) color = '#FFD700'// token
        if (cell === 3) color = doorUnlocked ? '#0a0' : '#d00'

        ctx.fillStyle = color
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
        ctx.strokeStyle = '#000'
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }

    // Draw player
    ctx.fillStyle = '#7289da'
    ctx.fillRect(
      playerPos.x * tileSize,
      playerPos.y * tileSize,
      tileSize,
      tileSize
    )

    // Status text
    ctx.fillStyle = '#000'
    ctx.font = '20px Arial'
    ctx.fillText(`Tokens: ${score} / ${totalTokens}`, 10, canvas.height - 10)

    // Win message
    if (gameWon) {
      ctx.fillStyle = '#0a0'
      ctx.font = '30px Arial'
      ctx.fillText(
        'Congratulations! You Escaped the Dungeon!',
        50,
        canvas.height / 2
      )
    }
  }, [map, playerPos, score, totalTokens, doorUnlocked, gameWon])

  // Animation loop
  useEffect(() => {
    let id = requestAnimationFrame(function render() {
      drawGame()
      id = requestAnimationFrame(render)
    })
    return () => cancelAnimationFrame(id)
  }, [drawGame])

  // Nothing to return — hook drives the canvas
}
