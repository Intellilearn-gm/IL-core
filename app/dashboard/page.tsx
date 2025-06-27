"use client"

import { useState } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import ProfileSidebar from "@/components/dashboard/profile-sidebar"
import MainContent from "@/components/dashboard/main-content"
import DashboardFooter from "@/components/dashboard/dashboard-footer"
import StreakModal from "@/components/modals/streak-modal"

interface DashboardPageProps {
  onLogout: () => void
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6]">
      <DashboardHeader onLogout={onLogout} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ProfileSidebar onStreakClick={() => setIsStreakModalOpen(true)} />
          <MainContent />
        </div>
      </div>

      <StreakModal isOpen={isStreakModalOpen} onClose={() => setIsStreakModalOpen(false)} />
      <DashboardFooter />
    </div>
  )
}
