// components/games/dao-dungeon3d/shared/Ground.tsx
"use client";
import React from "react";
import { usePlane } from "@react-three/cannon";
import * as THREE from "three";
import { COLORS } from "../constants";

export function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI/2, 0,0],
    position: [0,0,0],
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[50,50]} />
      <meshStandardMaterial color={COLORS.FLOOR} />
    </mesh>
  );
}