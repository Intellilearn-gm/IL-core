'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X, CreditCard } from 'lucide-react'

export default function SnapcardPage() {
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
              <h1 className="text-2xl font-bold text-[#2E2B2B]">Snapcard</h1>
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
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CreditCard className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#2E2B2B] mb-4">Snapcard</h2>
          <p className="text-[#7D7A75] mb-6">
            A fast-paced card matching game that teaches blockchain concepts. 
            Match cards to learn about smart contracts, tokens, and decentralized applications.
          </p>
          <div className="bg-gradient-to-r from-[#FFE8D6] to-[#FFF1CC] rounded-lg p-4 border border-white/30">
            <p className="text-sm text-[#2E2B2B] font-medium">🚧 Coming Soon</p>
            <p className="text-xs text-[#7D7A75] mt-1">This game is under development</p>
          </div>
        </div>
      </main>
    </div>
  )
} 