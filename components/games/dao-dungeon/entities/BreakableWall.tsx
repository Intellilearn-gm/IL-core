// components/games/dao-dungeon3d/entities/BreakableWall.tsx
"use client";

import React from "react";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { COLORS } from "../constants";

export function BreakableWall({ position }: { position: THREE.Vector3 }) {
  const [ref, api] = useBox(() => ({
    mass: 0,
    args: [1, 2, 0.2],
    position: [position.x, position.y + 1, position.z],
  }));

  const onHit = (impulse: [number, number, number]) => {
    api.mass.set(1);
    api.applyImpulse(impulse, [0, 0, 0]);
    setTimeout(() => api.remove(), 1000);
  };

  return (
    <mesh ref={ref} onClick={() => onHit([0, 5, 0])} castShadow>
      <boxGeometry args={[1, 2, 0.2]} />
      <meshStandardMaterial color={COLORS.WALL_BREAK} />
    </mesh>
  );
}