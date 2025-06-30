// components/games/dao-dungeon3d/constants.ts
import * as THREE from "three";

export const COLORS = {
  WALL: "#2E2B2B",
  FLOOR: "#FFE8D6",
  PLAYER: "#FF6B8A",
  EXIT: "#FFA45C",
  OBSTACLE: "#D9809B",
  BULLET: "#FF3D4A",
};

export interface BulletConfig {
  position: [number, number, number];
  direction: THREE.Vector3;
  speed: number;
}

export interface LevelConfig {
  size: number;
  obstacles: [number, number, number][];
  bullets: BulletConfig[];
  exit: [number, number, number];
}

export function generateLevelConfig(level: number): LevelConfig {
  const size = 10 + level * 2;
  const arenaMin = 1;
  const arenaMax = size - 2;

  // 3× more obstacles per level
  const obstaclesCount = level * 3;
  const bulletsCount = level > 2 ? (level - 2) * 2 : 0; // bullets start at level 3

  const obstacles: [number, number, number][] = [];
  for (let i = 0; i < obstaclesCount; i++) {
    const x = THREE.MathUtils.randFloat(arenaMin, arenaMax);
    const z = THREE.MathUtils.randFloat(arenaMin, arenaMax);
    obstacles.push([x, 0.5, z]);
  }

  const bullets: BulletConfig[] = [];
  for (let i = 0; i < bulletsCount; i++) {
    const edge = Math.floor(Math.random() * 4);
    let x = 0, z = 0;
    if (edge === 0) { x = arenaMin; z = THREE.MathUtils.randFloat(arenaMin, arenaMax); }
    if (edge === 1) { x = arenaMax; z = THREE.MathUtils.randFloat(arenaMin, arenaMax); }
    if (edge === 2) { z = arenaMin; x = THREE.MathUtils.randFloat(arenaMin, arenaMax); }
    if (edge === 3) { z = arenaMax; x = THREE.MathUtils.randFloat(arenaMin, arenaMax); }

    const from = new THREE.Vector3(x, 0.5, z);
    const dir = new THREE.Vector3(size/2, 0, size/2).sub(from).normalize();
    bullets.push({ position: [x, 0.5, z], direction: dir, speed: 2 + level * 0.2 });
  }

  const exit: [number, number, number] = [arenaMax, 0.5, arenaMax];
  return { size, obstacles, bullets, exit };
}
