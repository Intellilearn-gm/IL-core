// hooks/useDailyActivity.ts
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface StreakDay {
  date: Date;
  hasActivity: boolean;
  gamesPlayed: number;
  tokensEarned: number;
  isToday: boolean;
}

export function useDailyActivity(address: string | undefined) {
  const [streakData, setStreakData] = useState<StreakDay[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      // No wallet; nothing to do
      setLoading(false);
      return;
    }

    const fetchAndUpsert = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) Upsert today's record (counts as a "login" activity)
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const { error: upsertErr } = await supabase
          .from("daily_activity")
          .upsert(
            {
              wallet_address: address,
              activity_date: todayStr,
              // if you want to track games/tokens on login, you could set >0 here
              games_played: 0,
              tokens_earned: 0,
            },
            { onConflict: ["wallet_address", "activity_date"] }
          );
        if (upsertErr) {
          console.error("Failed to upsert today's activity", upsertErr);
          // nonfatal: we'll still try to fetch existing data
        }

        // 2) Fetch last 30 days
        const start = new Date();
        start.setDate(start.getDate() - 29);
        const startStr = start.toISOString().split("T")[0];

        const { data, error: fetchErr } = await supabase
          .from("daily_activity")
          .select("activity_date, games_played, tokens_earned")
          .eq("wallet_address", address)
          .gte("activity_date", startStr)
          .order("activity_date", { ascending: true });

        if (fetchErr) throw fetchErr;

        // 3) Build a full 30-day array
        const days: StreakDay[] = [];
        for (let i = 0; i < 30; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const dStr = d.toISOString().split("T")[0];
          const rec = data?.find((r) => r.activity_date === dStr);
          const played = rec?.games_played ?? 0;
          const earned = rec?.tokens_earned ?? 0;
          days.push({
            date: d,
            hasActivity: played > 0 || earned > 0 || dStr === todayStr, // today always counts
            gamesPlayed: played,
            tokensEarned: earned,
            isToday: dStr === todayStr,
          });
        }

        setStreakData(days);

        // 4) Compute current streak
        let streak = 0;
        for (let i = days.length - 1; i >= 0; i--) {
          if (days[i].hasActivity) streak++;
          else break;
        }
        setCurrentStreak(streak);

        // 5) Totals
        setTotalGames(days.reduce((sum, d) => sum + d.gamesPlayed, 0));
        setTotalTokens(days.reduce((sum, d) => sum + d.tokensEarned, 0));
      } catch (err: any) {
        console.error("Error in useDailyActivity:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAndUpsert();
  }, [address]);

  return {
    streakData,
    currentStreak,
    totalGames,
    totalTokens,
    loading,
    error,
  };
}
