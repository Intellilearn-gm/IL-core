"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Zap } from "lucide-react"

export default function NFTShowcase() {
  const [currentNFT, setCurrentNFT] = useState(0)

  const nfts = [
    { id: 1, name: "Golden Archer", rarity: "Legendary", image: "/placeholder.svg?height=200&width=200" },
    { id: 2, name: "Code Master", rarity: "Epic", image: "/placeholder.svg?height=200&width=200" },
    { id: 3, name: "Block Pioneer", rarity: "Rare", image: "/placeholder.svg?height=200&width=200" },
    { id: 4, name: "DAO Guardian", rarity: "Common", image: "/placeholder.svg?height=200&width=200" },
  ]

  return (
    <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#2E2B2B]">NFT Collection</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentNFT(Math.max(0, currentNFT - 1))}
            className="bg-white/30 border-white/40 text-[#2E2B2B] rounded-lg backdrop-blur-sm hover:bg-white/40"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentNFT(Math.min(nfts.length - 1, currentNFT + 1))}
            className="bg-white/30 border-white/40 text-[#2E2B2B] rounded-lg backdrop-blur-sm hover:bg-white/40"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nfts.slice(currentNFT, currentNFT + 3).map((nft) => (
          <div
            key={nft.id}
            className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg p-4 hover:bg-white/30 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <div className="aspect-square bg-gradient-to-br from-[#FFE8D6] to-[#FFF1CC] rounded-lg mb-4 flex items-center justify-center shadow-inner">
              <Zap className="w-12 h-12 text-[#FFA45C]" />
            </div>
            <h3 className="font-semibold text-[#2E2B2B] mb-1">{nft.name}</h3>
            <Badge
              variant="secondary"
              className={`${
                nft.rarity === "Legendary"
                  ? "bg-gradient-to-r from-[#FFD166] to-[#FFA45C] text-white"
                  : nft.rarity === "Epic"
                    ? "bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white"
                    : nft.rarity === "Rare"
                      ? "bg-[#FFA45C] text-white"
                      : "bg-[#FFE8D6] text-[#2E2B2B]"
              }`}
            >
              {nft.rarity}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
