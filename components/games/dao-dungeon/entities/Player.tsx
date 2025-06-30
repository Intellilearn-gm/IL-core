// components/games/dao-dungeon3d/entities/Player.tsx
"use client";
import React, {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { useSphere } from "@react-three/cannon";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../constants";

interface PlayerProps {
  exit: THREE.Vector3;
  onReach: () => void;
  twist?: { label: string; key: string } | null;
  ballColor?: string;
  start?: THREE.Vector3;
  onGameOver: () => void;
}

export const Player = forwardRef<any, PlayerProps>(function Player(
  { exit, onReach, twist, ballColor, start, onGameOver },
  ref
) {
  const { camera } = useThree();
  const [radius, setRadius] = React.useState(0.5);
  const [speedPenalty, setSpeedPenalty] = React.useState(0);
  const keys = useRef<Record<string, boolean>>({});
  const pos = useRef<THREE.Vector3>(new THREE.Vector3());

  // Handle collision with bullets: shrink and weaken
  const handleCollide = React.useCallback((e: any) => {
    if (e.body && e.body.shapes && e.body.shapes[0].type === 1) { // type 1 = sphere (bullet)
      setRadius((r) => Math.max(0.2, r * 0.8));
      setSpeedPenalty((p) => Math.min(p + 1, 3));
    }
  }, []);

  const [sphereRef, api] = useSphere(() => ({
    mass: 1,
    args: [0.5],
    position: start ? [start.x, start.y, start.z] : [0, 0.5, 0],
    linearDamping: 0.5,
    onCollide: handleCollide,
  }));

  // Forward the mesh ref to parent
  useImperativeHandle(ref, () => sphereRef.current);

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
    if (!sphereRef.current) return;

    // movement
    const force = new THREE.Vector3();
    let speed = 5 - speedPenalty;
    if (twist?.key === "speed") speed = 10 - speedPenalty;
    if (speed < 2) speed = 2;
    if (twist?.key === "reverse") {
      if (keys.current["KeyW"] || keys.current["ArrowUp"]) force.z += speed;
      if (keys.current["KeyS"] || keys.current["ArrowDown"]) force.z -= speed;
      if (keys.current["KeyA"] || keys.current["ArrowLeft"]) force.x += speed;
      if (keys.current["KeyD"] || keys.current["ArrowRight"]) force.x -= speed;
    } else {
      if (keys.current["KeyW"] || keys.current["ArrowUp"]) force.z -= speed;
      if (keys.current["KeyS"] || keys.current["ArrowDown"]) force.z += speed;
      if (keys.current["KeyA"] || keys.current["ArrowLeft"]) force.x -= speed;
      if (keys.current["KeyD"] || keys.current["ArrowRight"]) force.x += speed;
    }
    api.applyForce([force.x, 0, force.z], [0, 0, 0]);

    // camera follow
    sphereRef.current.getWorldPosition(pos.current);
    camera.position.lerp(
      new THREE.Vector3(
        pos.current.x,
        pos.current.y + 5,
        pos.current.z + 8
      ),
      0.1
    );
    camera.lookAt(pos.current);

    // exit check
    if (pos.current.distanceTo(exit) < 1) {
      onReach();
    }
  });

  React.useEffect(() => {
    if (radius < 0.22 && onGameOver) {
      onGameOver();
    }
  }, [radius, onGameOver]);

  return (
    <mesh ref={sphereRef} castShadow scale={[radius, radius, radius]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={ballColor || COLORS.PLAYER} />
    </mesh>
  );
});
