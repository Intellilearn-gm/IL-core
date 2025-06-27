// components/games/archery-pro/ArcheryGame.tsx
'use client'

import React, { useRef, useEffect, useState } from 'react'
import './ArcheryGame.css'

const ArcheryGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [angle, setAngle] = useState(45)
  const [power, setPower] = useState(50)
  const [playerScore, setPlayerScore] = useState(0)
  const [enemyScore, setEnemyScore] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 1000
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#2c3e50')
    gradient.addColorStop(0.6, '#fd7e14')
    gradient.addColorStop(1, '#e85a4f')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw ground
    ctx.fillStyle = '#5a4d41'
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40)

    // Draw moon
    ctx.fillStyle = '#f1c40f'
    ctx.beginPath()
    ctx.arc(canvas.width * 0.8, canvas.height * 0.25, 60, 0, Math.PI * 2)
    ctx.fill()

    // Draw mountains
    ctx.fillStyle = '#34495e'
    ctx.beginPath()
    ctx.moveTo(0, canvas.height * 0.6)
    ctx.lineTo(canvas.width * 0.15, canvas.height * 0.5)
    ctx.lineTo(canvas.width * 0.3, canvas.height * 0.65)
    ctx.lineTo(canvas.width * 0.5, canvas.height * 0.4)
    ctx.lineTo(canvas.width * 0.7, canvas.height * 0.55)
    ctx.lineTo(canvas.width * 0.85, canvas.height * 0.45)
    ctx.lineTo(canvas.width, canvas.height * 0.55)
    ctx.lineTo(canvas.width, canvas.height)
    ctx.lineTo(0, canvas.height)
    ctx.closePath()
    ctx.fill()

    // Draw player platform
    ctx.fillStyle = '#282828'
    ctx.fillRect(100, canvas.height - 120, 60, 15)
    ctx.fillStyle = '#0090ff'
    ctx.fillRect(100, canvas.height - 120, 60, 4)

    // Draw enemy platforms
    const enemyPositions = [400, 500, 600, 700]
    enemyPositions.forEach((x, i) => {
      ctx.fillStyle = '#282828'
      ctx.fillRect(x, canvas.height - 120, 60, 15)
      ctx.fillStyle = '#a0a0a0'
      ctx.fillRect(x, canvas.height - 120, 60, 4)
    })

    // Draw player archer
    ctx.fillStyle = '#4a3123'
    ctx.fillRect(125, canvas.height - 140, 10, 40)
    ctx.beginPath()
    ctx.arc(130, canvas.height - 150, 8, 0, Math.PI * 2)
    ctx.fill()

    // Draw enemies
    enemyPositions.forEach((x, i) => {
      ctx.fillStyle = 'black'
      ctx.fillRect(x + 25, canvas.height - 140, 10, 40)
      ctx.beginPath()
      ctx.arc(x + 30, canvas.height - 150, 8, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw enemy labels
      ctx.fillStyle = 'white'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(['A', 'B', 'C', 'D'][i], x + 30, canvas.height - 160)
    })

    // Draw game title
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Archery Pro - Blockchain Quiz', canvas.width / 2, 50)

    // Draw instructions
    ctx.font = '16px Arial'
    ctx.fillText('Answer blockchain questions by shooting the correct enemy!', canvas.width / 2, 80)

  }, [])

  const handleFire = () => {
    // Simple fire animation
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw arrow trajectory
    ctx.strokeStyle = 'rgba(255, 255, 200, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(130, canvas.height - 150)
    
    const angleRad = (-angle * Math.PI) / 180
    const speed = power * 0.5
    const endX = 130 + Math.cos(angleRad) * speed * 10
    const endY = canvas.height - 150 + Math.sin(angleRad) * speed * 10
    
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // Check if arrow hits an enemy
    const enemyPositions = [400, 500, 600, 700]
    const hitEnemy = enemyPositions.findIndex(x => 
      Math.abs(endX - (x + 30)) < 20 && Math.abs(endY - (canvas.height - 150)) < 20
    )

    if (hitEnemy !== -1) {
      setPlayerScore(prev => prev + 1)
      alert(`Hit enemy ${['A', 'B', 'C', 'D'][hitEnemy]}! +1 point`)
    } else {
      setEnemyScore(prev => prev + 1)
      alert('Miss! Enemy gets a point')
    }

    // Redraw canvas after a short delay
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      // Clear and redraw
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#2c3e50')
      gradient.addColorStop(0.6, '#fd7e14')
      gradient.addColorStop(1, '#e85a4f')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Redraw everything
      ctx.fillStyle = '#5a4d41'
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40)

      ctx.fillStyle = '#f1c40f'
      ctx.beginPath()
      ctx.arc(canvas.width * 0.8, canvas.height * 0.25, 60, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#34495e'
      ctx.beginPath()
      ctx.moveTo(0, canvas.height * 0.6)
      ctx.lineTo(canvas.width * 0.15, canvas.height * 0.5)
      ctx.lineTo(canvas.width * 0.3, canvas.height * 0.65)
      ctx.lineTo(canvas.width * 0.5, canvas.height * 0.4)
      ctx.lineTo(canvas.width * 0.7, canvas.height * 0.55)
      ctx.lineTo(canvas.width * 0.85, canvas.height * 0.45)
      ctx.lineTo(canvas.width, canvas.height * 0.55)
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#282828'
      ctx.fillRect(100, canvas.height - 120, 60, 15)
      ctx.fillStyle = '#0090ff'
      ctx.fillRect(100, canvas.height - 120, 60, 4)

      enemyPositions.forEach((x, i) => {
        ctx.fillStyle = '#282828'
        ctx.fillRect(x, canvas.height - 120, 60, 15)
        ctx.fillStyle = '#a0a0a0'
        ctx.fillRect(x, canvas.height - 120, 60, 4)
      })

      ctx.fillStyle = '#4a3123'
      ctx.fillRect(125, canvas.height - 140, 10, 40)
      ctx.beginPath()
      ctx.arc(130, canvas.height - 150, 8, 0, Math.PI * 2)
      ctx.fill()

      enemyPositions.forEach((x, i) => {
        ctx.fillStyle = 'black'
        ctx.fillRect(x + 25, canvas.height - 140, 10, 40)
        ctx.beginPath()
        ctx.arc(x + 30, canvas.height - 150, 8, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = 'white'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(['A', 'B', 'C', 'D'][i], x + 30, canvas.height - 160)
      })

      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Archery Pro - Blockchain Quiz', canvas.width / 2, 50)

      ctx.font = '16px Arial'
      ctx.fillText('Answer blockchain questions by shooting the correct enemy!', canvas.width / 2, 80)
    }, 1000)
  }

  return (
    <div className="archery-game-container">
      <div className="scoreboard scoreboard-top-left">
        <h3>Player</h3>
        <p>Score: {playerScore}</p>
      </div>
      <div className="scoreboard scoreboard-top-right">
        <h3>Enemies</h3>
        <p>Score: {enemyScore}</p>
      </div>

      <canvas ref={canvasRef} className="game-canvas" />

      <div className="controls-area">
        <div className="bottom-controls">
          <div className="control-set angle-control">
            <label htmlFor="angle-slider">Angle</label>
            <div className="slider-container">
              <button
                className="fine-tune-button minus-button"
                onClick={() => setAngle(a => Math.max(0, a - 1))}
              >
                –
              </button>
              <input
                id="angle-slider"
                type="range"
                min="0"
                max="90"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="control-slider"
              />
              <button
                className="fine-tune-button plus-button"
                onClick={() => setAngle(a => Math.min(90, a + 1))}
              >
                +
              </button>
            </div>
            <span className="value-display">{angle}°</span>
          </div>

          <div className="control-set power-control">
            <label htmlFor="power-slider">Power</label>
            <div className="slider-container">
              <button
                className="fine-tune-button minus-button"
                onClick={() => setPower(p => Math.max(10, p - 1))}
              >
                –
              </button>
              <input
                id="power-slider"
                type="range"
                min="10"
                max="100"
                value={power}
                onChange={(e) => setPower(parseInt(e.target.value))}
                className="control-slider"
              />
              <button
                className="fine-tune-button plus-button"
                onClick={() => setPower(p => Math.min(100, p + 1))}
              >
                +
              </button>
            </div>
            <span className="value-display">{power}</span>
          </div>

          <button className="fire-button" onClick={handleFire}>
            FIRE!
          </button>
        </div>
      </div>
    </div>
  )
}

export default ArcheryGame
