"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import StreakModal from "@/components/streak-modal"
import {
  Search,
  Filter,
  Wallet,
  Trophy,
  Target,
  Pickaxe,
  Code,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Twitter,
  MessageCircle,
  Github,
  Flame,
  Coins,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react"

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentNFT, setCurrentNFT] = useState(0)
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false)

  const games = [
    { id: 1, name: "Archery Pro", icon: Target, color: "from-[#FF6B8A] to-[#FFA45C]", players: "2.1k" },
    { id: 2, name: "DAO Dungeon", icon: Trophy, color: "from-[#FFA45C] to-[#FFD166]", players: "1.8k" },
    { id: 3, name: "Block Miner", icon: Pickaxe, color: "from-[#FFD166] to-[#FF6B8A]", players: "3.2k" },
    { id: 4, name: "OC Code Quest", icon: Code, color: "from-[#FF6B8A] to-[#FFD166]", players: "1.5k" },
    { id: 5, name: "Snapcard", icon: CreditCard, color: "from-[#FFA45C] to-[#FF6B8A]", players: "2.7k" },
  ]

  const nfts = [
    { id: 1, name: "Golden Archer", rarity: "Legendary", image: "/placeholder.svg?height=200&width=200" },
    { id: 2, name: "Code Master", rarity: "Epic", image: "/placeholder.svg?height=200&width=200" },
    { id: 3, name: "Block Pioneer", rarity: "Rare", image: "/placeholder.svg?height=200&width=200" },
    { id: 4, name: "DAO Guardian", rarity: "Common", image: "/placeholder.svg?height=200&width=200" },
  ]

  const achievements = [
    { name: "First Win", earned: true },
    { name: "Streak Master", earned: true },
    { name: "Token Collector", earned: false },
    { name: "NFT Hunter", earned: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6]">
      {/* Top Navigation */}
      <nav className="backdrop-blur-xl bg-white/20 border-b border-white/30 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">IL</span>
            </div>
            <h1 className="text-2xl font-bold text-[#2E2B2B]">IntelliLearn</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-[#7D7A75]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Connected
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="bg-white/20 border-white/40 text-[#2E2B2B] hover:bg-white/30 rounded-lg backdrop-blur-sm"
            >
              Logout
            </Button>
            <Button className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] hover:from-[#FF3D4A] hover:to-[#FF6B8A] text-white border-0 rounded-lg px-6 shadow-lg">
              <Wallet className="w-4 h-4 mr-2" />
              0x1234...5678
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg p-6 shadow-xl">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-[#2E2B2B] mb-1">@learner123</h3>
                <p className="text-sm text-[#7D7A75]">0x1234...5678</p>
              </div>

              {/* IL Tokens with animation */}
              <div className="bg-gradient-to-r from-[#FFE8D6] to-[#FFF1CC] rounded-lg p-4 mb-6 relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#FFD166]/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7D7A75]">IL Tokens</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-[#2E2B2B] tabular-nums">1,250</p>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Coins className="w-8 h-8 text-[#FFD166] animate-bounce" style={{ animationDuration: "3s" }} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6B8A] rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>

              {/* Level Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#2E2B2B]">Level 7</span>
                  <span className="text-sm text-[#7D7A75]">2,340 / 3,000 XP</span>
                </div>
                <Progress value={78} className="h-3 bg-white/30" />
              </div>

              {/* Achievements */}
              <div className="mb-6">
                <h4 className="font-semibold text-[#2E2B2B] mb-3">Achievements</h4>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg text-center transition-all duration-300 ${
                        achievement.earned
                          ? "bg-gradient-to-br from-[#FFD166] to-[#FFA45C] text-white shadow-md hover:scale-105"
                          : "bg-white/20 text-[#7D7A75] hover:bg-white/30"
                      }`}
                    >
                      <Trophy className="w-4 h-4 mx-auto mb-1" />
                      <p className="text-xs font-medium">{achievement.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak Counter */}
              <div
                className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                onClick={() => setIsStreakModalOpen(true)}
              >
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm opacity-90">Daily Streak</p>
                    <p className="text-2xl font-bold">12 days</p>
                  </div>
                  <Flame className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg p-4 shadow-lg">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7D7A75] w-5 h-5" />
                  <Input
                    placeholder="Search games..."
                    className="pl-10 bg-white/30 border-white/40 text-[#2E2B2B] placeholder:text-[#7D7A75] rounded-lg backdrop-blur-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  className="bg-white/30 border-white/40 text-[#2E2B2B] rounded-lg backdrop-blur-sm hover:bg-white/40"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Games Grid with enhanced interactions */}
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

            {/* Staking & Yield Farming */}
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#2E2B2B] mb-6">Staking & Yield Farming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#FFE8D6] to-[#FFF1CC] rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#2E2B2B]">Premium Pool</h3>
                    <TrendingUp className="w-5 h-5 text-[#FFA45C]" />
                  </div>
                  <p className="text-2xl font-bold text-[#2E2B2B] mb-2">12.5% APY</p>
                  <p className="text-sm text-[#7D7A75] mb-4">Stake IL tokens to unlock premium games</p>
                  <Button className="w-full bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white border-0 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    Stake Tokens
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-[#FFE8D6] to-[#FFF1CC] rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#2E2B2B]">Governance Pool</h3>
                    <Star className="w-5 h-5 text-[#FFD166]" />
                  </div>
                  <p className="text-2xl font-bold text-[#2E2B2B] mb-2">8.3% APY</p>
                  <p className="text-sm text-[#7D7A75] mb-4">Earn voting power in DAO decisions</p>
                  <Button className="w-full bg-gradient-to-r from-[#FFA45C] to-[#FFD166] text-white border-0 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    Stake & Vote
                  </Button>
                </div>
              </div>
            </div>

            {/* NFT Showcase */}
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
          </div>
        </div>
      </div>

      <StreakModal isOpen={isStreakModalOpen} onClose={() => setIsStreakModalOpen(false)} />

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-[#2E2B2B]/90 border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <a href="#" className="hover:text-white transition-colors">
                Docs
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
