"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Pickaxe, Code, CreditCard } from "lucide-react"

export default function GamesGrid() {
  const games = [
    { id: 1, name: "Archery Pro", icon: Target, color: "from-[#FF6B8A] to-[#FFA45C]", players: "2.1k" },
    { id: 2, name: "DAO Dungeon", icon: Trophy, color: "from-[#FFA45C] to-[#FFD166]", players: "1.8k" },
    { id: 3, name: "Block Miner", icon: Pickaxe, color: "from-[#FFD166] to-[#FF6B8A]", players: "3.2k" },
    { id: 4, name: "OC Code Quest", icon: Code, color: "from-[#FF6B8A] to-[#FFD166]", players: "1.5k" },
    { id: 5, name: "Snapcard", icon: CreditCard, color: "from-[#FFA45C] to-[#FF6B8A]", players: "2.7k" },
  ]

  return (
    <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#2E2B2B]">Featured Games</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FF6B8A] rounded-full animate-pulse"></div>
          <span className="text-sm text-[#7D7A75]">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, index) => (
          <div
            key={game.id}
            className="group backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg p-4 hover:bg-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer relative overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B8A]/10 to-[#FFA45C]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${game.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform relative shadow-md`}
                >
                  <game.icon className="w-6 h-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#7D7A75]">Online</div>
                  <div className="text-sm font-semibold text-[#2E2B2B]">{game.players}</div>
                </div>
              </div>

              <h3 className="font-semibold text-[#2E2B2B] mb-3">{game.name}</h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-[#FFE8D6] text-[#2E2B2B] text-xs">
                    {game.players} players
                  </Badge>
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white border-0 rounded-md hover:shadow-lg transition-all duration-300"
                >
                  Play
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
