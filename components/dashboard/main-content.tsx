"use client"

import SearchSection from "@/components/dashboard/search-section"
import GamesGrid from "@/components/dashboard/games-grid"
import StakingSection from "@/components/dashboard/staking-section"
import NFTShowcase from "@/components/dashboard/nft-showcase"

export default function MainContent() {
  return (
    <div className="lg:col-span-3 space-y-6">
      <SearchSection />
      <GamesGrid />
      <StakingSection />
      <NFTShowcase />
    </div>
  )
}
