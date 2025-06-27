"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface DashboardHeaderProps {
  onLogout: () => void
}

export default function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const handleLogout = () => {
    console.log('Logout button clicked!')
    onLogout()
  }

  return (
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
            onClick={handleLogout}
            className="bg-white/20 border-white/40 text-[#2E2B2B] hover:bg-white/30 rounded-lg backdrop-blur-sm cursor-pointer"
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
  )
}
