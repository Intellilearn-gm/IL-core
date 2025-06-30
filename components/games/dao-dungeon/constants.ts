// components/games/dao-dungeon/constants.ts
export const tileSize = 32;

export const COLORS = {
  WALL: "#2E2B2B",
  FLOOR: "#FFF1CC",
  PLAYER: "#FF6B8A",
  TOKEN: "#FFD166",
  EXIT: "#FFA45C",
  TRAP: "#FF3D4A",
  OBSTACLE: "#D9809B",
};

export function generateMap(level: number): number[][] {
  // 0=floor, 1=wall, 2=token, 3=exit, 4=trap
  const size = 10 + level * 2; // grows per level
  const map = Array.from({ length: size }, () => Array(size).fill(0));

  // border walls
  for (let i = 0; i < size; i++) {
    map[0][i] = map[size - 1][i] = map[i][0] = map[i][size - 1] = 1;
  }

  // random internal walls
  const wallCount = Math.floor(size * size * 0.1 + level * 2);
  for (let i = 0; i < wallCount; i++) {
    const x = 1 + Math.floor(Math.random() * (size - 2));
    const y = 1 + Math.floor(Math.random() * (size - 2));
    map[y][x] = 1;
  }

  // random traps
  const trapCount = Math.floor(level / 2);
  for (let i = 0; i < trapCount; i++) {
    let x, y;
    do {
      x = 1 + Math.floor(Math.random() * (size - 2));
      y = 1 + Math.floor(Math.random() * (size - 2));
    } while (map[y][x] !== 0);
    map[y][x] = 4;
  }

  // tokens
  const tokenCount = level + 3;
  for (let i = 0; i < tokenCount; i++) {
    let x, y;
    do {
      x = 1 + Math.floor(Math.random() * (size - 2));
      y = 1 + Math.floor(Math.random() * (size - 2));
    } while (map[y][x] !== 0);
    map[y][x] = 2;
  }

  // exit bottom-right
  map[size - 2][size - 2] = 3;
  return map;
}

export const MAX_LEVEL = 10;
