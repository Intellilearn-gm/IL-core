"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Calendar, Trophy, Target } from "lucide-react"

interface StreakModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StreakModal({ isOpen, onClose }: StreakModalProps) {
  // Generate last 30 days of streak data
  const generateStreakData = () => {
    const data = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Simulate streak data (you'd fetch this from your backend)
      const hasActivity = Math.random() > 0.2 // 80% chance of activity
      const gamesPlayed = hasActivity ? Math.floor(Math.random() * 5) + 1 : 0
      const tokensEarned = hasActivity ? Math.floor(Math.random() * 50) + 10 : 0

      data.push({
        date,
        hasActivity,
        gamesPlayed,
        tokensEarned,
        isToday: i === 0,
      })
    }

    return data
  }

  const streakData = generateStreakData()
  const currentStreak = streakData.reverse().findIndex((day) => !day.hasActivity)
  const streakCount = currentStreak === -1 ? 30 : currentStreak

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-[#2E2B2B]">
            <div className="p-2 bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] rounded-lg shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            30-Day Streak Overview
          </DialogTitle>
        </DialogHeader>

        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-[#FF6B8A]/10 to-[#FFA45C]/10 rounded-lg p-4 border border-white/30 shadow-md">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-[#FF6B8A]" />
              <div>
                <p className="text-2xl font-bold text-[#2E2B2B]">{streakCount}</p>
                <p className="text-sm text-[#7D7A75]">Current Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#FFA45C]/10 to-[#FFD166]/10 rounded-lg p-4 border border-white/30 shadow-md">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-[#FFA45C]" />
              <div>
                <p className="text-2xl font-bold text-[#2E2B2B]">
                  {streakData.reduce((sum, day) => sum + day.gamesPlayed, 0)}
                </p>
                <p className="text-sm text-[#7D7A75]">Games Played</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#FFD166]/10 to-[#FF6B8A]/10 rounded-lg p-4 border border-white/30 shadow-md">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#FFD166]" />
              <div>
                <p className="text-2xl font-bold text-[#2E2B2B]">
                  {streakData.reduce((sum, day) => sum + day.tokensEarned, 0)}
                </p>
                <p className="text-sm text-[#7D7A75]">Tokens Earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#2E2B2B] flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Activity
          </h3>

          <div className="grid grid-cols-7 gap-2">
            {/* Week headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-[#7D7A75] p-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {streakData.map((day, index) => (
              <div
                key={index}
                className={`
                  relative p-3 rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm
                  ${
                    day.hasActivity
                      ? "bg-gradient-to-br from-[#FF6B8A]/20 to-[#FFA45C]/20 border-[#FF6B8A]/30"
                      : "bg-white/30 border-white/40"
                  }
                  ${day.isToday ? "ring-2 ring-[#FF6B8A] ring-offset-2 ring-offset-white" : ""}
                `}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-[#2E2B2B]">{day.date.getDate()}</div>

                  {day.hasActivity && (
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-center">
                        <Flame className="w-3 h-3 text-[#FF6B8A]" />
                      </div>
                      <div className="text-xs text-[#7D7A75]">{day.gamesPlayed}g</div>
                      <div className="text-xs text-[#FFD166] font-medium">+{day.tokensEarned}</div>
                    </div>
                  )}

                  {day.isToday && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs bg-[#FF6B8A] text-white">
                      Today
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/30">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-[#FF6B8A]/20 to-[#FFA45C]/20 border border-[#FF6B8A]/30 rounded"></div>
            <span className="text-sm text-[#7D7A75]">Active Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/30 border border-white/40 rounded"></div>
            <span className="text-sm text-[#7D7A75]">Inactive Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-[#FF6B8A]/20 to-[#FFA45C]/20 border-2 border-[#FF6B8A] rounded"></div>
            <span className="text-sm text-[#7D7A75]">Today</span>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/30 border-white/40 text-[#2E2B2B] hover:bg-white/40"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
