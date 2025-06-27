"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Sparkles, Shield, Trophy, BookOpen, Coins, Users, Globe, Lock, Play } from "lucide-react"
import ProfessionalBackground from "@/components/professional-background"

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    console.log('Login button clicked, starting login process...')
    setIsLoading(true)
    // Simulate login process
    setTimeout(() => {
      console.log('Login timeout completed, calling onLogin...')
      setIsLoading(false)
      onLogin()
    }, 2000)
  }

  const features = [
    { icon: BookOpen, title: "Learn", description: "Master blockchain concepts through interactive courses" },
    { icon: Play, title: "Play", description: "Engage with gamified learning experiences" },
    { icon: Coins, title: "Earn", description: "Get rewarded with IL tokens for your progress" },
    { icon: Shield, title: "Web3", description: "Built on secure blockchain infrastructure" },
  ]

  const stats = [
    { value: "50K+", label: "Active Learners" },
    { value: "100+", label: "Courses Available" },
    { value: "1M+", label: "Tokens Distributed" },
    { value: "99.9%", label: "Uptime" },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFE8D6] via-[#FFF1CC] to-[#FFE8D6]">
      <ProfessionalBackground />

      {/* Semi-transparent overlay for better readability */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Features & Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg">
            {/* Logo and Branding */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">IntelliLearn</h1>
              </div>
              <p className="text-xl text-slate-600 font-medium mb-2">The Future of Blockchain Learning</p>
              <p className="text-slate-500">
                Join thousands of learners earning while mastering Web3 technologies through our gamified platform.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-lg flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Platform Stats */}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">IntelliLearn</h1>
              </div>
              <p className="text-slate-600">The Future of Blockchain Education</p>
            </div>

            {/* Login Card */}
            <div className="relative">
              {/* Subtle glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B8A]/20 to-[#FFA45C]/20 rounded-2xl blur-xl opacity-60"></div>

              {/* Main card */}
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                  <p className="text-slate-600">Connect your wallet to continue learning</p>
                </div>

                {/* Web3 Badges */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <Badge variant="secondary" className="bg-[#FFE8D6] text-[#FF6B8A] border-[#FF6B8A]/30">
                    <Shield className="w-3 h-3 mr-1" />
                    Secure
                  </Badge>
                  <Badge variant="secondary" className="bg-[#FFF1CC] text-[#FFA45C] border-[#FFA45C]/30">
                    <Globe className="w-3 h-3 mr-1" />
                    Decentralized
                  </Badge>
                  <Badge variant="secondary" className="bg-[#FFE8D6] text-[#FFD166] border-[#FFD166]/30">
                    <Coins className="w-3 h-3 mr-1" />
                    Earn Rewards
                  </Badge>
                </div>

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] hover:from-[#FF3D4A] hover:to-[#FF6B8A] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border-0"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Connecting Wallet...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Wallet className="w-6 h-6" />
                      Connect with OCID
                    </div>
                  )}
                </Button>

                {/* Security Features */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <Lock className="w-4 h-4 text-[#FF6B8A]" />
                    <span>End-to-end encrypted authentication</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <Users className="w-4 h-4 text-[#FFA45C]" />
                    <span>Join 50,000+ verified learners</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <Trophy className="w-4 h-4 text-[#FFD166]" />
                    <span>Start earning tokens immediately</span>
                  </div>
                </div>

                {/* Terms */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500">
                    By connecting, you agree to our{" "}
                    <a href="#" className="text-[#FF6B8A] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#FF6B8A] hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info for Mobile */}
            <div className="lg:hidden mt-8 text-center">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <div className="font-bold text-slate-800">{stat.value}</div>
                    <div className="text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
