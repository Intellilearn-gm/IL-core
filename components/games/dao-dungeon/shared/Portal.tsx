// components/games/dao-dungeon3d/shared/Portal.tsx
"use client";
import React from "react";
import * as THREE from "three";
import { useSphere } from "@react-three/cannon";
import { COLORS } from "../constants";

export function Portal({ position }: { position: THREE.Vector3 }) {
  const [ref] = useSphere(() => ({
    args: [0.7],
    isTrigger: true,
    position: [position.x, position.y, position.z],
  }));
  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.7,0.2,16,100]} />
      <meshStandardMaterial
        color={COLORS.EXIT}
        emissive={COLORS.EXIT}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}