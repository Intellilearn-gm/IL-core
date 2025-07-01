'use client'

import React from "react"
import { useAddress } from "@thirdweb-dev/react"
import { ConnectWallet } from "@thirdweb-dev/react"
import { Wallet, Sparkles, Shield, Coins, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletProtectionProps {
  children: React.ReactNode
}

export default function WalletProtection({ children }: WalletProtectionProps) {
  const address = useAddress()

  // If wallet is connected, render children
  if (address) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFD166] via-[#FF6B8A] to-[#FFA45C]">
      {/* Fun animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating coins */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`coin-${i}`}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            🪙
          </div>
        ))}
        
        {/* Floating sparkles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute text-lg animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1.5 + Math.random() * 1}s`,
            }}
          >
            ✨
          </div>
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-[#FF6B8A]/30 to-[#FFA45C]/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-[#FFD166]/40 to-[#FF6B8A]/40 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-[#FFA45C]/20 to-[#FFD166]/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Card container with glassmorphism effect */}
          <div className="relative">
            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B8A]/50 to-[#FFA45C]/50 rounded-2xl blur-xl opacity-60"></div>
            
            {/* Main card */}
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#2E2B2B] mb-2">Wallet Required</h1>
                <p className="text-[#7D7A75]">Connect your wallet to access this game</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#FFE8D6]/50 to-[#FFF1CC]/50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2E2B2B]">Secure Gaming</p>
                    <p className="text-sm text-[#7D7A75]">Your progress is safely stored on-chain</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#FFE8D6]/50 to-[#FFF1CC]/50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-lg flex items-center justify-center">
                    <Coins className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2E2B2B]">Earn Rewards</p>
                    <p className="text-sm text-[#7D7A75]">Collect tokens and NFTs as you play</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#FFE8D6]/50 to-[#FFF1CC]/50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2E2B2B]">Learn Web3</p>
                    <p className="text-sm text-[#7D7A75]">Master blockchain concepts through gaming</p>
                  </div>
                </div>
              </div>

              {/* Connect Wallet Button */}
              <div className="mb-6">
                <ConnectWallet
                  btnTitle="Connect Wallet to Play"
                  className="w-full h-14 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] hover:from-[#FF3D4A] hover:to-[#FF6B8A] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0"
                  theme="light"
                />
              </div>

              {/* Back to Dashboard Button */}
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full h-12 bg-white/20 border-white/40 text-[#2E2B2B] hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-[#7D7A75]">
                  Don't have a wallet?{" "}
                  <a 
                    href="https://metamask.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#FF6B8A] hover:underline font-medium"
                  >
                    Get one here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 