// app/dao-dungeon.tsx
"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

// Dynamic import for the 3D game component
const Game3D = dynamic(
  () => import("@/components/games/dao-dungeon/Game3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FF6B8A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2E2B2B] font-medium">Loading 3D DAO Dungeon...</p>
        </div>
      </div>
    ),
  }
);

export default function DAODungeonPage() {
  const handleGameOver = (times: number[]) => {
    const summary = ["🎉 You’ve conquered DAO Dungeon 3D!"]
      .concat(times.map((t, i) => `Level ${i + 1}: ${(t / 1000).toFixed(2)}s`))
      .join("\n");
    alert(summary);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6]">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/20 border-b border-white/30 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Back + Title */}
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="bg-white/20 border-white/40 text-[#2E2B2B] hover:bg-white/30 rounded-lg shadow-md transition-all"
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">IL</span>
              </div>
              <h1 className="text-2xl font-bold text-[#2E2B2B]">DAO Dungeon 3D</h1>
            </div>
          </div>

          {/* Quit */}
          <Button
            size="sm"
            asChild
            className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] hover:from-[#FF3D4A] hover:to-[#FF6B8A] text-white border-0 rounded-lg px-6 shadow-lg transition-all"
          >
            <Link href="/dashboard">
              <X className="w-4 h-4 mr-2" />
              Quit Game
            </Link>
          </Button>
        </div>
      </header>

      {/* Game Canvas */}
      <main className="w-full flex-1 flex items-center justify-center p-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#FF6B8A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#2E2B2B] font-medium">Loading DAO Dungeon 3D...</p>
              </div>
            </div>
          }
        >
          <Game3D onGameOver={handleGameOver} />
        </Suspense>
      </main>
    </div>
  );
}
