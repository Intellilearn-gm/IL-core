"use client"

import { useEffect, useState } from "react"

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  rotation: number
  opacity: number
  speed: number
  type: "blockchain" | "coin" | "code" | "book"
}

export default function ProfessionalBackground() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    // Initialize floating elements
    const initialElements: FloatingElement[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 40 + 20,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.1 + 0.05,
      speed: Math.random() * 0.3 + 0.1,
      type: ["blockchain", "coin", "code", "book"][Math.floor(Math.random() * 4)] as FloatingElement["type"],
    }))

    setElements(initialElements)

    // Animation loop
    const animateElements = () => {
      setElements((prev) =>
        prev.map((element) => ({
          ...element,
          y: element.y - element.speed,
          rotation: element.rotation + 0.2,
          // Reset position when element goes off screen
          y: element.y < -element.size ? window.innerHeight + element.size : element.y,
          x: element.y < -element.size ? Math.random() * window.innerWidth : element.x,
        })),
      )
    }

    const interval = setInterval(animateElements, 100)
    return () => clearInterval(interval)
  }, [])

  const renderElement = (element: FloatingElement) => {
    const baseStyle = {
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.size}px`,
      height: `${element.size}px`,
      opacity: element.opacity,
      transform: `rotate(${element.rotation}deg)`,
    }

    const getElementContent = () => {
      switch (element.type) {
        case "blockchain":
          return "⛓️"
        case "coin":
          return "🪙"
        case "code":
          return "💻"
        case "book":
          return "📚"
        default:
          return "⭐"
      }
    }

    return (
      <div key={element.id} className="absolute text-2xl select-none pointer-events-none" style={baseStyle}>
        {getElementContent()}
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Subtle gradient mesh */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6B8A]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#FFA45C]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-[#FFD166]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "4s" }}
        ></div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0">{elements.map(renderElement)}</div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 107, 138, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 138, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      ></div>
    </div>
  )
}
