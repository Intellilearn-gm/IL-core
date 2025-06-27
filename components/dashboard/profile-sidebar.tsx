"use client"

import { Progress } from "@/components/ui/progress"
import { Wallet, Trophy, Flame, Coins } from "lucide-react"

interface ProfileSidebarProps {
  onStreakClick: () => void
}

export default function ProfileSidebar({ onStreakClick }: ProfileSidebarProps) {
  const achievements = [
    { name: "First Win", earned: true },
    { name: "Streak Master", earned: true },
    { name: "Token Collector", earned: false },
    { name: "NFT Hunter", earned: true },
  ]

  return (
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
          onClick={onStreakClick}
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
  )
}
