// components/dashboard/games-grid.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, Pickaxe, Code, CreditCard } from 'lucide-react'

type Game = {
  id: number
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  players: string
  slug: string
}

export default function GamesGrid() {
  const games: Game[] = [
    {
      id: 1,
      name: 'Archery Pro',
      icon: Target,
      color: 'from-[#FF6B8A] to-[#FFA45C]',
      players: '2.1k',
      slug: 'archery-pro',
    },
    {
      id: 2,
      name: 'DAO Dungeon',
      icon: Trophy,
      color: 'from-[#FFA45C] to-[#FFD166]',
      players: '1.8k',
      slug: 'dao-dungeon',
    },
    {
      id: 3,
      name: 'Block Miner',
      icon: Pickaxe,
      color: 'from-[#FFD166] to-[#FF6B8A]',
      players: '3.2k',
      slug: 'block-miner',
    },
    {
      id: 4,
      name: 'OC Code Quest',
      icon: Code,
      color: 'from-[#FF6B8A] to-[#FFD166]',
      players: '1.5k',
      slug: 'oc-code-quest',
    },
    {
      id: 5,
      name: 'Snapcard',
      icon: CreditCard,
      color: 'from-[#FFA45C] to-[#FF6B8A]',
      players: '2.7k',
      slug: 'snapcard',
    },
  ]

  return (
    <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#2E2B2B]">Featured Games</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FF6B8A] rounded-full animate-pulse" />
          <span className="text-sm text-[#7D7A75]">Live</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, i) => (
          <Link
            key={game.id}
            href={`/games/${game.slug}`}
            className="group relative overflow-hidden rounded-lg border border-white/30 bg-white/20 p-4 transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-lg"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Hover‐gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B8A]/10 to-[#FFA45C]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex flex-col h-full justify-between">
              {/* Icon + Online count */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${game.color} shadow-md transition-transform group-hover:scale-110`}
                >
                  <game.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#7D7A75]">Online</div>
                  <div className="text-sm font-semibold text-[#2E2B2B]">
                    {game.players}
                  </div>
                </div>
              </div>

              {/* Name */}
              <h3 className="mb-3 font-semibold text-[#2E2B2B]">{game.name}</h3>

              {/* Footer: badge + play button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#FFE8D6] text-[#2E2B2B] text-xs"
                  >
                    {game.players} players
                  </Badge>
                  <div className="h-1 w-1 animate-pulse rounded-full bg-green-500" />
                </div>

                <Button className="rounded-md border-0 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white text-sm transition-all duration-300 hover:shadow-lg">
                  Play
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
