// components/games/dao-dungeon3d/Game3D.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useBox, usePlane, useSphere } from "@react-three/cannon";
import * as THREE from "three";
import { StartScreen } from "./StartScreen";
import { COLORS, generateLevelConfig, LevelConfig, BulletConfig } from "./constants";

////////////////////////////////////////////////////////////////////////////////
// Ground
////////////////////////////////////////////////////////////////////////////////
function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color={COLORS.FLOOR} />
    </mesh>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Player Sphere
////////////////////////////////////////////////////////////////////////////////
function Player({
  exitPos,
  onReach,
}: {
  exitPos: [number, number, number];
  onReach: () => void;
}) {
  const { camera } = useThree();
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 1, 0],
    args: [0.5],
  }));
  const velocity = useRef<[number, number, number]>([0, 0, 0]);
  const keys = useRef<Record<string, boolean>>({});
  const tmpPos = useRef(new THREE.Vector3());
  const exitVec = new THREE.Vector3(...exitPos);

  // subscribe to velocity for camera follow
  useEffect(() => {
    const unsub = api.velocity.subscribe((v) => (velocity.current = v));
    return unsub;
  }, [api.velocity]);

  // keyboard handlers
  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(() => {
    try {
      // apply movement force
      const force: [number, number, number] = [0, 0, 0];
      const speed = 5;
      if (keys.current["KeyW"] || keys.current["ArrowUp"]) force[2] -= speed;
      if (keys.current["KeyS"] || keys.current["ArrowDown"]) force[2] += speed;
      if (keys.current["KeyA"] || keys.current["ArrowLeft"]) force[0] -= speed;
      if (keys.current["KeyD"] || keys.current["ArrowRight"]) force[0] += speed;
      api.applyForce(force, [0, 0, 0]);

      // camera follow
      ref.current!.getWorldPosition(tmpPos.current);
      camera.position.lerp(
        new THREE.Vector3(tmpPos.current.x, tmpPos.current.y + 5, tmpPos.current.z + 10),
        0.1
      );
      camera.lookAt(tmpPos.current);

      // check exit
      if (tmpPos.current.distanceTo(exitVec) < 1.2) onReach();
    } catch (err) {
      console.error("Player frame error:", err);
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={COLORS.PLAYER} />
    </mesh>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Static Box Obstacle
////////////////////////////////////////////////////////////////////////////////
function Obstacle({ position }: { position: [number, number, number] }) {
  const [ref] = useBox(() => ({
    args: [1, 1, 1],
    type: "Static",
    position,
  }));
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={COLORS.OBSTACLE} />
    </mesh>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Moving Bullet Sphere
////////////////////////////////////////////////////////////////////////////////
function Bullet({ position, direction, speed }: BulletConfig) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [0.2],
    position,
    velocity: [direction.x * speed, direction.y * speed, direction.z * speed],
    userData: { type: "bullet" },
  }));
  const tmpPos = useRef(new THREE.Vector3());

  useFrame(() => {
    try {
      ref.current!.getWorldPosition(tmpPos.current);
      // despawn if far out of bounds
      if (Math.abs(tmpPos.current.x) > 100 || Math.abs(tmpPos.current.z) > 100) {
        api.position.set(Math.random() * 100, -10, Math.random() * 100);
      }
    } catch (err) {
      console.error("Bullet frame error:", err);
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color={COLORS.BULLET} />
    </mesh>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Exit Portal Marker
////////////////////////////////////////////////////////////////////////////////
function Portal({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <torusGeometry args={[0.7, 0.2, 16, 100]} />
      <meshStandardMaterial
        color={COLORS.EXIT}
        emissive={COLORS.EXIT}
        emissiveIntensity={0.7}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Main Game Component
////////////////////////////////////////////////////////////////////////////////
export default function Game3D({
  onGameOver,
}: {
  onGameOver: (times: number[]) => void;
}) {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);

  const cfg: LevelConfig = generateLevelConfig(level);

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleReach = useCallback(() => {
    const elapsed = Date.now() - startTime;
    setTimes((t) => [...t, elapsed]);
    if (level >= 10) {
      onGameOver([...times, elapsed]);
    } else {
      setLevel((l) => l + 1);
      setStartTime(Date.now());
    }
  }, [level, startTime, times, onGameOver]);

  return (
    <div className="w-full h-screen">
      {!started && <StartScreen onStart={handleStart} />}
      {started && (
        <div className="absolute top-4 left-4 z-20 text-[#2E2B2B] font-semibold space-y-1">
          <div>Level: {level} / 10</div>
          <div>Time: {((Date.now() - startTime) / 1000).toFixed(1)}s</div>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 7]} intensity={0.8} castShadow />

        <Physics gravity={[0, -9.82, 0]}>
          <Ground />
          {started && (
            <>
              <Player exitPos={cfg.exit} onReach={handleReach} />

              {cfg.obstacles.map((pos, i) => (
                <Obstacle key={i} position={pos} />
              ))}

              {cfg.bullets.map((b, i) => (
                <Bullet key={i} {...b} />
              ))}

              <Portal position={cfg.exit} />
            </>
          )}
        </Physics>
      </Canvas>
    </div>
  );
}
