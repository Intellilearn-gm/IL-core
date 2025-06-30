// components/games/dao-dungeon3d/entities/Trap.tsx
"use client";

import React from "react";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { COLORS } from "../constants";

export function Trap({ position }: { position: THREE.Vector3 }) {
  const [ref] = useBox(() => ({
    args: [1, 0.2, 1],
    isTrigger: true,
    position: [position.x, position.y, position.z],
  }));
  // Trigger detection handled in Game3D
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial color={COLORS.BULLET} transparent opacity={0.6} />
    </mesh>
  );
}
