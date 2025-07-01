'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
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
  const [levelCount, setLevelCount] = useState<number>(10)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [levelScore, setLevelScore] = useState(0)
  const [timer, setTimer] = useState(30)
  const [minScore, setMinScore] = useState(5)
  const [sliderColor, setSliderColor] = useState('#FFD700')
  const [ballColor, setBallColor] = useState('#8B4513')
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  // Synchronize score and fact with game logic
  const [gameScore, setGameScore] = useState(0)
  const [gameFact, setGameFact] = useState('')
  const [playing, setPlaying] = useState(false)

  // Use the game logic hook, but override score/fact for custom flow
  const game = useBlockMinerGame(canvasRef, {
    sliderColor,
    ballColor,
    onScore: useCallback((s: number) => {
      setGameScore(s)
      setScore(s)
      setLevelScore((prev) => prev + 1)
    }, []),
    onFact: useCallback((f: string) => {
      setGameFact(f)
    }, []),
    playing,
  })

  // Timer effect for playing phase
  useEffect(() => {
    if (phase === 'playing') {
      if (intervalId) clearInterval(intervalId)
      setTimer(30)
      setPlaying(true)
      const id = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(id)
            setPhase('level-complete')
            setPlaying(false)
            return 0
          }
          return t - 1
        })
      }, 1000)
      setIntervalId(id)
      return () => clearInterval(id)
    }
    if (intervalId) clearInterval(intervalId)
    setPlaying(false)
  }, [phase, currentLevel])

  // Set minScore for each level (could be more complex)
  useEffect(() => {
    setMinScore(5 + (currentLevel - 1) * 2)
  }, [currentLevel])

  // Start screen: choose number of levels and colors
  if (phase === 'start') {
    return (
      <div className={styles.sunsetBg} style={{
        minHeight: '100vh', minWidth: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...pixelFont, padding: 0,
        position: 'relative',
        background: `url('/blockMinerBg.jpg') center/cover no-repeat, linear-gradient(180deg, #FFD166 0%, #FF6B6B 100%)`,
      }}>
        {/* Overlay to make background image 70% transparent */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.45)',
          zIndex: 1,
          pointerEvents: 'none',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }} />
        <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 44, color: '#FFD166', textShadow: '4px 4px #8B4513, 0 2px 8px #FF6B6B', marginBottom: 10, letterSpacing: 2, textAlign: 'center', fontFamily: 'inherit', fontWeight: 900, lineHeight: 1.1 }}>Block Miner</h1>
          <div style={{ color: '#FF6B6B', fontSize: 20, fontWeight: 700, textShadow: '1px 1px #fff', marginBottom: 18, textAlign: 'center', letterSpacing: 1 }}>Dig for Knowledge. Dodge Danger. Level Up!</div>
          <div style={{ background: 'rgba(34,34,34,0.55)', border: '4px solid #FFD166', borderRadius: 18, padding: '22px 44px', boxShadow: '0 8px 32px #FF6B6B55', minWidth: 420, maxWidth: 700, width: '90vw', display: 'flex', flexDirection: 'column', alignItems: 'center', borderStyle: 'dashed', borderWidth: 4, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <div style={{ color: '#FFD166', fontSize: 18, fontWeight: 700, marginBottom: 10, textAlign: 'center', letterSpacing: 1, textShadow: '1px 1px #8B4513' }}>How many levels do you want to play?</div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
              {[5, 10].map((num) => (
                <button
                  key={num}
                  style={{
                    ...pixelFont,
                    background: levelCount === num ? 'linear-gradient(90deg, #FFD166 60%, #FF6B6B 100%)' : '#fff1cc',
                    color: levelCount === num ? '#2E2B2B' : '#FF6B6B',
                    border: levelCount === num ? '2px solid #FF6B6B' : '2px solid #FFD166',
                    borderRadius: 8,
                    padding: '14px 28px',
                    fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: levelCount === num ? '0 4px 16px #FFD16655' : '2px 2px #FFD16644',
                    transition: 'all 0.2s',
                    outline: 'none',
                    marginBottom: 8,
                  }}
                  onClick={() => setLevelCount(num)}
                  onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #FFD166 60%, #FF6B6B 100%)')}
                  onMouseOut={e => (e.currentTarget.style.background = levelCount === num ? 'linear-gradient(90deg, #FFD166 60%, #FF6B6B 100%)' : '#fff1cc')}
                >
                  {num} Levels
                </button>
              ))}
            </div>
            <div style={{ color: '#fff', fontSize: 16, marginBottom: 18, textAlign: 'center', lineHeight: 1.6, background: 'rgba(0,0,0,0.18)', borderRadius: 8, padding: '10px 14px', border: '1.5px solid #FFD166', boxShadow: '0 2px 8px #FFD16633' }}>
              <span role="img" aria-label="Pickaxe">⛏️</span> Move your slider to catch <b>coins</b> and reveal Web3 facts.<br/>
              <span role="img" aria-label="Warning">⚠️</span> Avoid the <span style={{ color: '#FF3333', fontWeight: 700 }}>red ball</span> (it will deduct points).<br/>
              <span role="img" aria-label="Goal">🎯</span> Reach the <b>minimum score</b> before time runs out to pass each level!
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              <label style={{ color: '#FFD166', fontSize: 15, marginBottom: 2 }}>Slider Color</label>
              <input type="color" value={sliderColor} onChange={e => setSliderColor(e.target.value)} style={{ width: 48, height: 32, border: '2px solid #FFD166', borderRadius: 8, background: '#fff', marginBottom: 8 }} />
              <label style={{ color: '#FF6B6B', fontSize: 15, marginBottom: 2 }}>Ball Color</label>
              <input type="color" value={ballColor} onChange={e => setBallColor(e.target.value)} style={{ width: 48, height: 32, border: '2px solid #FF6B6B', borderRadius: 8, background: '#fff' }} />
            </div>
            {/* Power balls info */}
            <div style={{ width: '100%', margin: '12px 0', display: 'flex', flexDirection: 'row', gap: 18, background: 'rgba(0,0,0,0.12)', borderRadius: 10, padding: '10px 10px 6px 10px', border: '1.5px dashed #FFD166', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120, margin: '4px 0' }}>
                <span style={{ fontSize: 22, marginRight: 4 }}>🔵</span>
                <span style={{ color: '#2196F3', fontWeight: 700 }}>Blue Ball</span>
                <span style={{ color: '#fff', fontSize: 14, marginLeft: 4 }}>+3s</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120, margin: '4px 0' }}>
                <span style={{ fontSize: 22, marginRight: 4 }}>🟢</span>
                <span style={{ color: '#43A047', fontWeight: 700 }}>Green Ball</span>
                <span style={{ color: '#fff', fontSize: 14, marginLeft: 4 }}>Fast (5s)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140, margin: '4px 0' }}>
                <span style={{ fontSize: 22, marginRight: 4 }}>🟣</span>
                <span style={{ color: '#8E24AA', fontWeight: 700 }}>Purple Ball</span>
                <span style={{ color: '#fff', fontSize: 14, marginLeft: 4 }}>Big coins (5s)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140, margin: '4px 0' }}>
                <span style={{ fontSize: 22, marginRight: 4 }}>🔴</span>
                <span style={{ color: '#FF3333', fontWeight: 700 }}>Red Ball</span>
                <span style={{ color: '#fff', fontSize: 14, marginLeft: 4 }}>-1/-2 pts</span>
              </div>
            </div>
            <button
              style={{ ...pixelFont, background: 'linear-gradient(90deg, #FF6B6B 60%, #FFD166 100%)', color: '#fff', border: '2.5px solid #FFD166', borderRadius: 12, padding: '18px 36px', fontSize: 22, cursor: 'pointer', boxShadow: '0 6px 24px #FF6B6B55', marginTop: 16, width: '100%', transition: 'all 0.2s', fontWeight: 900, letterSpacing: 1 }}
              onClick={() => { setPhase('playing'); setCurrentLevel(1); setScore(0); setLevelScore(0); }}
              onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #FFD166 60%, #FF6B6B 100%)')}
              onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #FF6B6B 60%, #FFD166 100%)')}
            >
              🚀 Start Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main game UI
  return (
    <div className={styles.minecraftBg} style={{ minHeight: '100vh', minWidth: '100vw', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', zIndex: 1000 }}>
      {/* HUD aligned above canvas */}
      <div style={{ width: 1000, maxWidth: '95vw', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34,34,34,0.92)', borderRadius: 12, border: '2px solid #FFD166', padding: '12px 32px', marginTop: 32, marginBottom: 0, ...pixelFont, fontSize: 18, color: '#fff', boxShadow: '0 2px 8px #FFD16633' }}>
        <div>
          <span>Level: {currentLevel}/{levelCount}</span>
          <span style={{ marginLeft: 32 }}>Score: {gameScore}</span>
          <span style={{ marginLeft: 32 }}>Timer: {timer}s</span>
          <span style={{ marginLeft: 32 }}>Min Score: {minScore}</span>
        </div>
        <button
          style={{ ...pixelFont, background: 'linear-gradient(90deg, #FFD166 60%, #FF6B6B 100%)', color: '#2E2B2B', border: '2px solid #FFD166', borderRadius: 8, padding: '8px 18px', fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #FFD16655', marginLeft: 24 }}
          onClick={() => { setPhase('start'); setCurrentLevel(1); setScore(0); setLevelScore(0); setGameScore(0); setPlaying(false); }}
        >
          Quit Game
        </button>
      </div>
      {/* Minecraft-style canvas frame */}
      <div style={{ border: '8px solid #8B8B8B', borderRadius: 12, background: '#222', boxShadow: '0 8px #444', margin: '24px auto 0 auto', position: 'relative', width: 1000, maxWidth: '95vw' }}>
        <BlockMinerCanvas canvasRef={canvasRef} sliderColor={sliderColor} ballColor={ballColor} />
        {/* Optionally add pixel-art overlays, e.g. grass, stone, etc. */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 24, background: 'url("/pixel-grass.png") repeat-x', zIndex: 2 }} />
      </div>
      {/* Fact display below canvas, aligned */}
      {gameFact && (
        <div style={{ width: 1000, maxWidth: '95vw', margin: '24px auto 0 auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(34,34,34,0.85)', border: '2px solid #FFD166', borderRadius: 12, color: '#FFD166', ...pixelFont, fontSize: 18, padding: '18px 36px', boxShadow: '0 4px 24px #FFD16633', maxWidth: 700, textAlign: 'center', letterSpacing: 0.5, fontWeight: 600, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
            {gameFact}
          </div>
        </div>
      )}
      {/* Controls/info */}
      <div style={{ margin: '24px auto 0 auto', width: 1000, maxWidth: '95vw', ...pixelFont, color: '#fff', fontSize: 14, background: '#222', border: '2px solid #8B8B8B', borderRadius: 8, padding: '10px 24px', boxShadow: '2px 2px #444', textAlign: 'center' }}>
        Use <b>Left</b> and <b>Right</b> arrows to move. Collect coins to reveal Web3 facts! Avoid the <span style={{ color: '#FF3333', fontWeight: 700 }}>red ball</span> (it will deduct points).
      </div>
      {/* Level complete/game over overlays */}
      {phase === 'level-complete' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(34,34,34,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <h2 style={{ ...pixelFont, color: '#FFD700', fontSize: 32, marginBottom: 24 }}>Level {currentLevel} Complete!</h2>
          <p style={{ ...pixelFont, color: '#fff', fontSize: 18, marginBottom: 24 }}>Score this level: {levelScore}</p>
          <p style={{ ...pixelFont, color: minScore <= levelScore ? '#00FF00' : '#FF3333', fontSize: 18, marginBottom: 24 }}>
            {minScore <= levelScore ? 'You passed!' : 'You did not reach the minimum score.'}
          </p>
          {/* Show the last fact learned after the level */}
          {gameFact && (
            <div style={{ background: '#222', border: '2px solid #FFD166', borderRadius: 10, color: '#FFD166', ...pixelFont, fontSize: 16, padding: '12px 32px', margin: '16px 0', boxShadow: '0 2px 8px #FFD16655', maxWidth: 700, textAlign: 'center' }}>
              Last fact you learned: {gameFact}
            </div>
          )}
          <button
            style={{ ...pixelFont, background: '#8B8B8B', color: '#fff', border: '2px solid #fff', borderRadius: 6, padding: '16px 32px', fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px #444' }}
            onClick={() => {
              if (minScore > levelScore) {
                setPhase('game-over')
                return
              }
              if (currentLevel < levelCount) {
                setCurrentLevel(currentLevel + 1)
                setLevelScore(0)
                setGameScore(0)
                setGameFact('')
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
