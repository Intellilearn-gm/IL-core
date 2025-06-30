// components/games/dao-dungeon3d/entities/Projectile.tsx
"use client";

import React, { useRef } from "react";
import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../constants";

export interface ProjectileProps {
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  speed: number;
}

export function Projectile({ pos, dir, speed }: ProjectileProps) {
  const [ref, api] = useSphere(() => ({
    args: [0.2],
    mass: 1,
    position: [pos.x, pos.y, pos.z],
    velocity: [dir.x * speed, dir.y * speed, dir.z * speed],
    collisionFilterGroup: 2,
    collisionFilterMask: 1,
  }));
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!ref.current) return;
    ref.current.getWorldPosition(tmp.current);
    // remove if out of bounds
    if (
      Math.abs(tmp.current.x) > 100 ||
      Math.abs(tmp.current.z) > 100 ||
      tmp.current.y < -10
    ) {
      api.remove();
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color={COLORS.BULLET} />
    </mesh>
  );
}
