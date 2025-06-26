"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Sparkles, Shield, Zap } from "lucide-react"
import SunsetBackground from "@/components/sunset-background"

interface LoginScreenProps {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 2000)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FF6B8A] via-[#FFA45C] to-[#FFD166]">
      <SunsetBackground />

      {/* Main Login Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="relative max-w-md w-full">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] rounded-3xl blur-xl opacity-30 animate-pulse"></div>

          {/* Glass Card */}
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-2xl mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">IntelliLearn</h1>
              <p className="text-white/80 text-lg">Unlock blockchain learning through play</p>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-14 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold text-lg rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Wallet className="w-6 h-6" />
                  Login with OCID
                </div>
              )}
            </Button>

            {/* Features */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-white/70">
                <Shield className="w-4 h-4 text-[#FFD166]" />
                <span className="text-sm">Secure blockchain authentication</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Zap className="w-4 h-4 text-[#FFD166]" />
                <span className="text-sm">Play-to-earn blockchain games</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Sparkles className="w-4 h-4 text-[#FFD166]" />
                <span className="text-sm">Earn IL tokens and NFTs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
