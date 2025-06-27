'use client'

import React, { useEffect, useState } from 'react'
import { ConnectWallet, useAddress } from '@thirdweb-dev/react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import ProfileSetupCard from '@/components/ProfileSetupCard'

interface DashboardHeaderProps {
  onLogout: () => void
}

export default function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const address = useAddress()
  const [checked, setChecked] = useState(false)
  const [needsProfile, setNeedsProfile] = useState(false)

  // 1) When wallet connects, check Supabase
  useEffect(() => {
    if (!address) {
      setNeedsProfile(false)
      setChecked(true)
      return
    }
    setChecked(false)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('wallet_address', address)
          .single()

        if (error) {
          console.log('🆕 No profile for', address)
          setNeedsProfile(true)
        } else {
          console.log('✅ Profile exists for', address)
          setNeedsProfile(false)
        }
      } catch (err) {
        console.error('Error checking profile:', err)
      } finally {
        setChecked(true)
      }
    })()
  }, [address])

  const handleLogout = () => {
    console.log('Logout clicked')
    onLogout()
  }

  return (
    <>
      {/* 2) Show modal until they finish profile */}
      {!checked && address && <div className="p-4">Checking profile…</div>}
      {checked && needsProfile && address && (
        <ProfileSetupCard
          walletAddress={address}
          onComplete={() => setNeedsProfile(false)}
        />
      )}

      {/* 3) Your existing nav */}
      <nav className="backdrop-blur-xl bg-white/20 border-b border-white/30 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">IL</span>
            </div>
            <h1 className="text-2xl font-bold text-[#2E2B2B]">IntelliLearn</h1>
          </div>
          <div className="flex items-center gap-4">
            {address && (
              <div className="hidden md:flex items-center gap-2 text-sm text-[#7D7A75]">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Connected
              </div>
            )}
            <ConnectWallet
              btnTitle={address ? `${address.slice(0,6)}…${address.slice(-4)}` : 'Connect Wallet'}
              className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C]
                         hover:from-[#FF3D4A] hover:to-[#FF6B8A]
                         text-white border-0 rounded-lg px-6 shadow-lg"
            />
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-white/20 border-white/40 text-[#2E2B2B] hover:bg-white/30 rounded-lg backdrop-blur-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>
    </>
  )
}
