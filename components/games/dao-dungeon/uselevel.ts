// components/games/dao-dungeon3d/useLevel.ts
import * as THREE from "three";
import { ROOM_SIZE } from "./constants";

export const MAX_LEVEL = 10;

export interface LevelConfig {
  obstacles: THREE.Vector3[];
  traps: THREE.Vector3[];
  crates: THREE.Vector3[];
  bullets: { pos: THREE.Vector3; dir: THREE.Vector3; speed: number }[];
  loot: THREE.Vector3[];
  exit: THREE.Vector3;
  playerStart: THREE.Vector3;
}

export function generateLevel(level: number): LevelConfig {
  const size = ROOM_SIZE + level * 2;
  const half = size / 2;
  const obstacles = [];
  const traps = [];
  const crates = [];
  const loot = [];
  const bullets = [];

  // Obstacles: level×3
  for (let i = 0; i < level * 3; i++) {
    obstacles.push(
      new THREE.Vector3(
        randomCoord(size),
        0.5,
        randomCoord(size)
      )
    );
  }

  // Traps: floor spikes
  for (let i = 0; i < level; i++) {
    traps.push(
      new THREE.Vector3(randomCoord(size), 0.1, randomCoord(size))
    );
  }

  // Crates & loot
  for (let i = 0; i < level + 2; i++) {
    const pos = new THREE.Vector3(
      randomCoord(size),
      0.5,
      randomCoord(size)
    );
    crates.push(pos);
    // 50% chance a crate contains loot
    if (Math.random() < 0.5) loot.push(pos.clone());
  }

  // Bullets start at lvl 3
  if (level > 2) {
    for (let i = 0; i < (level - 2) * 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const pos = new THREE.Vector3(Math.cos(angle) * half, 0.5, Math.sin(angle) * half);
      const dir = new THREE.Vector3(-pos.x, 0, -pos.z).normalize();
      bullets.push({ pos, dir, speed: 2 + level * 0.3 });
    }
  }

  // exit portal at far corner
  const exit = new THREE.Vector3(half - 1, 0.5, half - 1);
  // player start at random edge
  const edge = Math.floor(Math.random() * 4);
  let playerStart;
  if (edge === 0) playerStart = new THREE.Vector3(-half + 1, 0.5, -half + 1);
  else if (edge === 1) playerStart = new THREE.Vector3(half - 1, 0.5, -half + 1);
  else if (edge === 2) playerStart = new THREE.Vector3(-half + 1, 0.5, half - 1);
  else playerStart = new THREE.Vector3(half - 1, 0.5, half - 1 - Math.random() * (size - 2));

  return { obstacles, traps, crates, bullets, loot, exit, playerStart };
}

function randomCoord(size: number) {
  const r = Math.random() * (size - 2) - (size - 2) / 2;
  return Math.sign(r) * Math.max(Math.abs(r), 1);
}
