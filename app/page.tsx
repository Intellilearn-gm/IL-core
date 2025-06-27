"use client"

import { useState } from "react"
import LoginPage from "@/app/login/page"
import DashboardPage from "@/app/dashboard/page"

export default function IntelliLearnApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="min-h-screen">
      {!isLoggedIn ? (
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <DashboardPage onLogout={() => setIsLoggedIn(false)} />
      )}
    </div>
  )
}
