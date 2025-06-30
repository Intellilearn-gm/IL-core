"use client";
import React from "react";

export function InventoryHUD({ shards }: { shards: number }) {
  return (
    <div className="fixed top-4 right-4 z-30 bg-white/80 px-4 py-2 rounded shadow text-[#2E2B2B] font-semibold">
      💎 Soul Shards: {shards}
    </div>
  );
}
