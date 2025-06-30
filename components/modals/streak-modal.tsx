// components/modals/streak-modal.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Trophy, Target } from "lucide-react";
import { StreakDay } from "@/hooks/useDailyActivity";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** now optional, with default empty array */
  streakData?: StreakDay[];
  currentStreak: number;
  totalGames: number;
  totalTokens: number;
  loading: boolean;
  error: string | null;
}

export default function StreakModal({
  isOpen,
  onClose,
  streakData = [],
  currentStreak,
  totalGames,
  totalTokens,
  loading,
  error,
}: StreakModalProps) {
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

        {loading ? (
          <p className="p-6 text-center">Loading...</p>
        ) : error ? (
          <p className="p-6 text-center text-red-600">Error: {error}</p>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  icon: <Flame className="w-8 h-8 text-[#FF6B8A]" />,
                  title: "Current Streak",
                  value: currentStreak,
                },
                {
                  icon: <Target className="w-8 h-8 text-[#FFA45C]" />,
                  title: "Games Played",
                  value: totalGames,
                },
                {
                  icon: <Trophy className="w-8 h-8 text-[#FFD166]" />,
                  title: "Tokens Earned",
                  value: totalTokens,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-r ${
                    i === 0
                      ? "from-[#FF6B8A]/10 to-[#FFA45C]/10"
                      : i === 1
                      ? "from-[#FFA45C]/10 to-[#FFD166]/10"
                      : "from-[#FFD166]/10 to-[#FF6B8A]/10"
                  } rounded-lg p-4 border border-white/30 shadow-md`}
                >
                  <div className="flex items-center gap-3">
                    {stat.icon}
                    <div>
                      <p className="text-2xl font-bold text-[#2E2B2B]">
                        {stat.value}
                      </p>
                      <p className="text-sm text-[#7D7A75]">{stat.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2E2B2B] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Activity
              </h3>

              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-sm font-medium text-[#7D7A75] p-2"
                  >
                    {d}
                  </div>
                ))}

                {streakData.map((day, idx) => (
                  <div
                    key={idx}
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
                      <div className="text-sm font-medium text-[#2E2B2B]">
                        {day.date.getDate()}
                      </div>

                      {day.hasActivity && (
                        <div className="mt-1 space-y-1">
                          <div className="flex justify-center">
                            <Flame className="w-3 h-3 text-[#FF6B8A]" />
                          </div>
                          <div className="text-xs text-[#7D7A75]">
                            {day.gamesPlayed}g
                          </div>
                          <div className="text-xs text-[#FFD166] font-medium">
                            +{day.tokensEarned}
                          </div>
                        </div>
                      )}

                      {day.isToday && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-2 -right-2 text-xs bg-[#FF6B8A] text-white"
                        >
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
              <LegendBox colorClass="from-[#FF6B8A]/20 to-[#FFA45C]/20 border-[#FF6B8A]/30">
                Active Day
              </LegendBox>
              <LegendBox colorClass="bg-white/30 border-white/40">
                Inactive Day
              </LegendBox>
              <LegendBox colorClass="from-[#FF6B8A]/20 to-[#FFA45C]/20 border-2 border-[#FF6B8A]">
                Today
              </LegendBox>
            </div>
          </>
        )}

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
  );
}

function LegendBox({
  colorClass,
  children,
}: {
  colorClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded ${colorClass}`}></div>
      <span className="text-sm text-[#7D7A75]">{children}</span>
    </div>
  );
}
