// app/page.tsx
'use client'

import { useState } from 'react'
import LoginPage from '@/app/login/page'
import DashboardPage from '@/app/dashboard/page'

export default function IntelliLearnApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogout = () => {
    console.log('Logout function called, setting isLoggedIn to false')
    setIsLoggedIn(false)
  }

  const handleLogin = () => {
    console.log('Login function called, setting isLoggedIn to true')
    setIsLoggedIn(true)
  }

  return (
    <div className="min-h-screen">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <DashboardPage onLogout={handleLogout} />
      )}
    </div>
  )
}
