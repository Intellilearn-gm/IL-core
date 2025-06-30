'use client'

import { useRef, useState } from 'react'
import styles from './blockMiner.module.css'
import { useBlockMinerGame } from './useBlockMinerGame'
import { BlockMinerCanvas } from './BlockMinerCanvas'
import { BlockMinerInfo } from './BlockMinerInfo'

// Pixel font import (Google Fonts or local)
const pixelFont = {
  fontFamily: '"Press Start 2P", monospace',
  letterSpacing: '1px',
}

export default function BlockMinerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Game phases: start, playing, level-complete, game-over
  const [phase, setPhase] = useState<'start'|'playing'|'level-complete'|'game-over'>('start')
  const [levelCount, setLevelCount] = useState<number>(5)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [fact, setFact] = useState('')
  const [showFact, setShowFact] = useState(false)
  const [levelScore, setLevelScore] = useState(0)

  // Use the game logic hook, but override score/fact for custom flow
  const game = useBlockMinerGame(canvasRef)

  // Start screen: choose number of levels
  if (phase === 'start') {
    return (
      <div className={styles.minecraftBg} style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...pixelFont }}>
        <h1 style={{ fontSize: 32, color: '#fff', textShadow: '2px 2px #222', marginBottom: 32 }}>Block Miner</h1>
        <div style={{ background: '#222', border: '4px solid #8B8B8B', borderRadius: 8, padding: 32, boxShadow: '0 8px #444', minWidth: 320 }}>
          <p style={{ color: '#fff', fontSize: 18, marginBottom: 24 }}>How many levels do you want to play?</p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <button
              style={{ ...pixelFont, background: '#8B8B8B', color: '#fff', border: '2px solid #fff', borderRadius: 6, padding: '16px 32px', fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px #444' }}
              onClick={() => { setLevelCount(5); setPhase('playing'); }}
            >
              5 Levels
            </button>
            <button
              style={{ ...pixelFont, background: '#8B8B8B', color: '#fff', border: '2px solid #fff', borderRadius: 6, padding: '16px 32px', fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px #444' }}
              onClick={() => { setLevelCount(10); setPhase('playing'); }}
            >
              10 Levels
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main game UI
  return (
    <div className={styles.minecraftBg} style={{ minHeight: '600px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Minecraft-style HUD */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, background: '#222', border: '3px solid #8B8B8B', borderRadius: 8, padding: '12px 24px', color: '#fff', ...pixelFont, fontSize: 18, boxShadow: '2px 2px #444' }}>
        <span>Level: {currentLevel}/{levelCount}</span>
        <span style={{ marginLeft: 32 }}>Score: {score}</span>
      </div>
      {/* Fact popup */}
      {showFact && fact && (
        <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', background: '#333', border: '3px solid #FFD700', borderRadius: 8, padding: '18px 32px', color: '#FFD700', ...pixelFont, fontSize: 16, boxShadow: '2px 2px #444', zIndex: 20 }}>
          <span>{fact}</span>
        </div>
      )}
      {/* Minecraft-style canvas frame */}
      <div style={{ border: '8px solid #8B8B8B', borderRadius: 12, background: '#222', boxShadow: '0 8px #444', marginTop: 64, marginBottom: 32, position: 'relative' }}>
        <BlockMinerCanvas canvasRef={canvasRef} />
        {/* Optionally add pixel-art overlays, e.g. grass, stone, etc. */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 24, background: 'url("/pixel-grass.png") repeat-x', zIndex: 2 }} />
      </div>
      {/* Controls/info */}
      <div style={{ marginTop: 16, ...pixelFont, color: '#fff', fontSize: 14, background: '#222', border: '2px solid #8B8B8B', borderRadius: 8, padding: '10px 24px', boxShadow: '2px 2px #444' }}>
        Use <b>Left</b> and <b>Right</b> arrows to move. Collect coins to reveal Web3 facts!
      </div>
      {/* Level complete/game over overlays */}
      {phase === 'level-complete' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(34,34,34,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <h2 style={{ ...pixelFont, color: '#FFD700', fontSize: 32, marginBottom: 24 }}>Level {currentLevel} Complete!</h2>
          <p style={{ ...pixelFont, color: '#fff', fontSize: 18, marginBottom: 24 }}>Score this level: {levelScore}</p>
          <button
            style={{ ...pixelFont, background: '#8B8B8B', color: '#fff', border: '2px solid #fff', borderRadius: 6, padding: '16px 32px', fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px #444' }}
            onClick={() => {
              if (currentLevel < levelCount) {
                setCurrentLevel(currentLevel + 1)
                setLevelScore(0)
                setPhase('playing')
              } else {
                setPhase('game-over')
              }
            }}
          >
            {currentLevel < levelCount ? 'Next Level' : 'Finish Game'}
          </button>
        </div>
      )}
      {phase === 'game-over' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(34,34,34,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <h2 style={{ ...pixelFont, color: '#FFD700', fontSize: 32, marginBottom: 24 }}>Game Over!</h2>
          <p style={{ ...pixelFont, color: '#fff', fontSize: 18, marginBottom: 24 }}>Total Score: {score}</p>
          <button
            style={{ ...pixelFont, background: '#8B8B8B', color: '#fff', border: '2px solid #fff', borderRadius: 6, padding: '16px 32px', fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px #444' }}
            onClick={() => {
              setPhase('start'); setCurrentLevel(1); setScore(0); setLevelScore(0)
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
