'use client'

import React from 'react'
import { useOCAuth } from '@opencampus/ocid-connect-js'
import { useRouter } from 'next/navigation'
import { ConnectWallet, useAddress } from '@thirdweb-dev/react'
import { Button } from '@/components/ui/button'
import { log } from 'console'
import Image from 'next/image'

export default function DashboardHeader() {
  const { ocAuth } = useOCAuth()
  const address = useAddress()
  const router = useRouter()

const handleLogout = () => {
  console.log('======',`${window.location.origin}/login`)
  ocAuth.logout(`${window.location.origin}/login`);   // single string param
};



  return (
    <nav className="backdrop-blur-xl bg-white/20 border-b border-white/30 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B8A] to-[#FFA45C] rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
            <Image 
              src="/favicon-32x32.png" 
              alt="IntelliLearn Logo" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
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
            btnTitle={address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Connect Wallet'}
            className="bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] hover:from-[#FF3D4A] hover:to-[#FF6B8A] text-white border-0 rounded-lg px-6 shadow-lg"
            theme="light"
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
  )
}