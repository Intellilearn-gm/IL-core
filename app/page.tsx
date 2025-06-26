"use client"

import { useState } from "react"
import LoginScreen from "@/components/login-screen"
import Dashboard from "@/components/dashboard"

export default function IntelliLearnApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="min-h-screen">
      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Dashboard onLogout={() => setIsLoggedIn(false)} />
      )}
    </div>
  )
}
