"use client"

import { useEffect, useState } from "react"

interface FloatingOrb {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

export default function SunsetBackground() {
  const [orbs, setOrbs] = useState<FloatingOrb[]>([])

  useEffect(() => {
    // Initialize floating orbs
    const colors = ["#FF6B8A", "#FFA45C", "#FFD166", "#FF3D4A"]
    const initialOrbs: FloatingOrb[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 100 + 50,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    setOrbs(initialOrbs)

    // Animation loop
    const animateOrbs = () => {
      setOrbs((prev) =>
        prev.map((orb) => ({
          ...orb,
          x: orb.x + orb.speedX,
          y: orb.y + orb.speedY,
          // Bounce off edges
          speedX: orb.x <= 0 || orb.x >= window.innerWidth - orb.size ? -orb.speedX : orb.speedX,
          speedY: orb.y <= 0 || orb.y >= window.innerHeight - orb.size ? -orb.speedY : orb.speedY,
        })),
      )
    }

    const interval = setInterval(animateOrbs, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6B8A]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#FFA45C]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-[#FFD166]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        ></div>
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0">
        {orbs.map((orb) => (
          <div
            key={orb.id}
            className="absolute rounded-full blur-sm animate-pulse"
            style={{
              left: `${orb.x}px`,
              top: `${orb.y}px`,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              backgroundColor: orb.color,
              opacity: orb.opacity,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle particle overlay */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
