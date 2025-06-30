// components/games/dao-dungeon3d/entities/Enemy.tsx
"use client";
import React, { useRef } from "react";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../constants";

interface EnemyProps {
  position: THREE.Vector3;
  targetRef: React.RefObject<any>;
}

export function Enemy({ position, targetRef }: EnemyProps) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    args: [1, 1, 1],
    position: [position.x, position.y, position.z],
  }));
  const dir = useRef<THREE.Vector3>(new THREE.Vector3());
  const p = useRef<THREE.Vector3>(new THREE.Vector3());
  const t = useRef<THREE.Vector3>(new THREE.Vector3());

  useFrame(() => {
    const mesh = ref.current;
    const targetMesh = targetRef.current;
    if (!mesh || !targetMesh) return;

    // compute chase direction
    mesh.getWorldPosition(p.current);
    targetMesh.getWorldPosition(t.current);
    dir.current
      .subVectors(t.current, p.current)
      .setY(0)
      .normalize()
      .multiplyScalar(2);

    api.velocity.set(dir.current.x, 0, dir.current.z);
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={COLORS.OBSTACLE} />
    </mesh>
  );
}
