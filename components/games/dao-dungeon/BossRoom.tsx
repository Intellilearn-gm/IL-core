"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, useSphere } from "@react-three/cannon";
import * as THREE from "three";
import { Ground } from "./shared/Ground";
import { Player } from "./entities/Player";
import { Portal } from "./shared/Portal";
import { Projectile } from "./entities/Projectile";
import { COLORS } from "./constants";
import styles from "./dao-dungeon-theme.module.css";

export function BossRoom({
  level,
  onDefeat,
}: {
  level: number;
  onDefeat: () => void;
}) {
  const playerRef = useRef<any>();
  const [projectiles, setProjectiles] = useState<
    { pos: THREE.Vector3; dir: THREE.Vector3; speed: number }[]
  >([]);

  const [refBoss, apiBoss] = useSphere(() => ({
    mass: 5,
    args: [1 + level * 0.1],
    position: [0, 1 + level * 0.1, 0],
    linearDamping: 0.7,
  }));

  useEffect(() => {
    const iv = window.setInterval(() => {
      if (!refBoss.current || !playerRef.current) return;
      const bossPos = new THREE.Vector3();
      refBoss.current.getWorldPosition(bossPos);
      const playerPos = new THREE.Vector3();
      playerRef.current.getWorldPosition(playerPos);
      const dir = new THREE.Vector3().subVectors(playerPos, bossPos).normalize();
      setProjectiles((arr) => [
        ...arr,
        { pos: bossPos.clone(), dir, speed: 3 + level * 0.3 },
      ]);
    }, Math.max(500, 2000 - level * 150));
    return () => clearInterval(iv);
  }, [level]);

  useFrame(() => {
    if (refBoss.current && playerRef.current) {
      const bossPos = new THREE.Vector3();
      refBoss.current.getWorldPosition(bossPos);
      const playerPos = new THREE.Vector3();
      playerRef.current.getWorldPosition(playerPos);
      const force = new THREE.Vector3()
        .subVectors(playerPos, bossPos)
        .normalize()
        .multiplyScalar(1 + level * 0.2);
      apiBoss.applyForce([force.x, 0, force.z], [0, 0, 0]);
    }
  });

  return (
    <div className={`${styles.daoDungeonBg} flex flex-col items-center justify-center min-h-screen`}>
      <div className={`${styles.daoDungeonCard} p-8 shadow-xl flex flex-col items-center`}>
        <h2 className={`${styles.daoDungeonTitle} text-3xl mb-4`}>Boss Room</h2>
        <p className={`${styles.daoDungeonTextMuted} mb-6`}>Level {level} Boss: The Final Challenge!</p>
        <button className={styles.daoDungeonButton} onClick={onDefeat}>
          Defeat Boss
        </button>
      </div>
    </div>
  );
}
