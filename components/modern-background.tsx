"use client"

import { useEffect, useState } from "react"

interface GeometricShape {
  id: number
  x: number
  y: number
  size: number
  rotation: number
  opacity: number
  speed: number
  type: "circle" | "triangle" | "square"
}

export default function ModernBackground() {
  const [shapes, setShapes] = useState<GeometricShape[]>([])

  useEffect(() => {
    // Initialize geometric shapes
    const initialShapes: GeometricShape[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 60 + 20,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.1 + 0.05,
      speed: Math.random() * 0.5 + 0.2,
      type: ["circle", "triangle", "square"][Math.floor(Math.random() * 3)] as "circle" | "triangle" | "square",
    }))

    setShapes(initialShapes)

    // Animation loop
    const animateShapes = () => {
      setShapes((prev) =>
        prev.map((shape) => ({
          ...shape,
          y: shape.y - shape.speed,
          rotation: shape.rotation + 0.5,
          // Reset position when shape goes off screen
          y: shape.y < -shape.size ? window.innerHeight + shape.size : shape.y,
          x: shape.y < -shape.size ? Math.random() * window.innerWidth : shape.x,
        })),
      )
    }

    const interval = setInterval(animateShapes, 50)
    return () => clearInterval(interval)
  }, [])

  const renderShape = (shape: GeometricShape) => {
    const baseStyle = {
      left: `${shape.x}px`,
      top: `${shape.y}px`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
      opacity: shape.opacity,
      transform: `rotate(${shape.rotation}deg)`,
    }

    switch (shape.type) {
      case "circle":
        return (
          <div
            key={shape.id}
            className="absolute rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm"
            style={baseStyle}
          />
        )
      case "triangle":
        return (
          <div
            key={shape.id}
            className="absolute"
            style={{
              ...baseStyle,
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
          />
        )
      case "square":
        return (
          <div
            key={shape.id}
            className="absolute bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm"
            style={baseStyle}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        ></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">{shapes.map(renderShape)}</div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      ></div>
    </div>
  )
}
