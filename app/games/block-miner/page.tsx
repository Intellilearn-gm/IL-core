'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'

// Dynamic import for the game component
const BlockMinerGame = dynamic(
  () => import('@/components/games/block-miner/BlockMinerGame'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FF6B8A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2E2B2B] font-medium">Loading Block Miner...</p>
        </div>
      </div>
    )
  }
)

export default function BlockMinerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6]">
      {/* Enhanced Header */}
      <header className="backdrop-blur-xl bg-white/20 border-b border-white/30 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="bg-white/20 border-white/40 text-[#2E2B2B] hover:bg-white/30 rounded-lg backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300"
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
              <h1 className="text-2xl font-bold text-[#2E2B2B]">Block Miner</h1>
            </div>
          </div>
          
          <Button
            size="sm"
            asChild
            className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] hover:from-[#FF3D4A] hover:to-[#FF6B8A] text-white border-0 rounded-lg px-6 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            <Link href="/dashboard">
              <X className="w-4 h-4 mr-2" />
              Quit Game
            </Link>
          </Button>
        </div>
      </header>

      <main className="w-full flex-1 flex items-center justify-center p-6">
        <BlockMinerGame />
      </main>
    </div>
  )
} 