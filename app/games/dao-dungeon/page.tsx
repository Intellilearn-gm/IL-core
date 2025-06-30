// app/dao-dungeon/page.tsx
"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

const Game3D = dynamic(() => import("@/components/games/dao-dungeon/Game3D"), {
  ssr: false,
});

export default function Page() {
  const handleOver = (times: number[]) => {
    alert(
      ["🏁 Run Complete"]
        .concat(times.map((t, i) => `Level ${i + 1}: ${(t / 1000).toFixed(2)}s`))
        .join("\n")
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6]">
      <header className="h-16 flex items-center justify-between px-6 bg-white/20 backdrop-blur border-b border-white/30">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-[#2E2B2B]">DAO Dungeon 3D</h1>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard" className="flex items-center gap-1">
            <X className="w-4 h-4" />
            Quit
          </Link>
        </Button>
      </header>

      {/* make main flex-1 and relative */}
      <main className="relative flex-1">
        <Suspense fallback={<div className="p-10 text-center">Loading Dungeon…</div>}>
          {/* Game3D will absolutely fill this container */}
          <Game3D onGameOver={handleOver} />
        </Suspense>
      </main>
    </div>
  );
}
