// components/games/dao-dungeon3d/constants.ts
import * as THREE from "three";

export const COLORS = {
  WALL: "#2E2B2B",
  FLOOR: "#FFF1CC",
  PLAYER: "#FF6B8A",
  EXIT: "#FFA45C",
  OBSTACLE: "#D9809B",
  BULLET: "#FF3D4A",
  CRATE: "#FFD166",
  WALL_BREAK: "#E5E1D8",
};

export const MAX_LEVEL = 10;
export const ROOM_SIZE = 12;
export const BOSS_LEVEL = MAX_LEVEL;

export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
