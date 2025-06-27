"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, Star } from "lucide-react"

export default function StakingSection() {
  return (
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
  )
}
