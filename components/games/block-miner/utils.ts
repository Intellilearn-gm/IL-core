import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    COIN_RADIUS,
    COIN_BASE_SPEED,
    COIN_SPEED_VARIATION,
    COIN_BASE_ROTATION,
    COIN_ROTATION_VARIATION,
  } from './constants'
  
  export function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }
  
  export function createCoin() {
    return {
      x: randomRange(COIN_RADIUS, CANVAS_WIDTH - COIN_RADIUS),
      y: randomRange(-CANVAS_HEIGHT, 0),
      radius: COIN_RADIUS,
      speedY: COIN_BASE_SPEED + randomRange(0, COIN_SPEED_VARIATION),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed:
        COIN_BASE_ROTATION + (Math.random() - 0.5) * COIN_ROTATION_VARIATION * 2,
    }
  }
  
  export function getRandomFact(facts: readonly string[]) {
    return facts[Math.floor(Math.random() * facts.length)]
  }
  