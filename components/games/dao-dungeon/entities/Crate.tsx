// components/games/dao-dungeon3d/entities/Crate.tsx
"use client";

import React from "react";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { COLORS } from "../constants";

export function Crate({ position, twist }: { position: THREE.Vector3; twist?: { label: string; key: string } | null }) {
  const [ref, api] = useBox(() => ({
    mass: 2,
    args: [1, 1, 1],
    position: [position.x, position.y, position.z],
  }));

  const onClick = () => {
    // break crate
    api.applyImpulse([0, 5, 0], [0, 0, 0]);
    setTimeout(() => api.remove(), 500);
    // Optionally, trigger loot logic here (handled in parent for now)
  };

  return (
    <mesh ref={ref} onClick={onClick} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={twist?.key === "double-loot" ? "#FFD166" : COLORS.CRATE} />
    </mesh>
  );
}

