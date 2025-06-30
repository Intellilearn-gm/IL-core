"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { Ground } from "./shared/Ground";
import { Player } from "./entities/Player";
import { Enemy } from "./entities/Enemy";
import { Trap } from "./entities/Trap";
import { Crate } from "./entities/Crate";
import { BreakableWall } from "./entities/BreakableWall";
import { Projectile } from "./entities/Projectile";
import { Portal } from "./shared/Portal";
import { LevelConfig } from "./uselevel";

export function Dungeon({
  cfg,
  onReachExit,
  twist,
  ballColor,
  onGameOver,
}: {
  cfg: LevelConfig;
  onReachExit: () => void;
  twist?: { label: string; key: string } | null;
  ballColor?: string;
  onGameOver: () => void;
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 10], fov: 60 }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />

      <Physics gravity={[0, twist?.key === "low-gravity" ? -3 : -9.8, 0]}>
        <Ground />
        <Player ref={React.createRef()} exit={cfg.exit} onReach={onReachExit} twist={twist} ballColor={ballColor} start={cfg.playerStart} onGameOver={onGameOver} />
        {cfg.obstacles.map((p, i) => (
          <Enemy key={i} position={p} targetRef={React.createRef()} />
        ))}
        {cfg.traps.map((p, i) => (
          <Trap key={i} position={p} />
        ))}
        {cfg.crates.map((p, i) => (
          <Crate key={i} position={p} twist={twist} />
        ))}
        {cfg.bullets.map((b, i) => (
          <Projectile key={i} pos={b.pos} dir={b.dir} speed={b.speed} />
        ))}
        <Portal position={cfg.exit} />
      </Physics>
    </Canvas>
  );
}
