// app/games/oc-code-quest/page.tsx
'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import WalletProtection from '@/components/WalletProtection'

const OCCodeQuestGame = dynamic(
  () => import('@/components/games/oc-code-quest/OCCodeQuestGame'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-6">
        <p className="text-[#FF6B8A]">Loading OC Code Quest…</p>
      </div>
    ),
  }
)

export default function OCCodeQuestPage() {
  return (
    <WalletProtection gameName="OC Code Quest">
      <div className="min-h-screen bg-[#E5E1D8]"> {/* Sandstone Gray */}
        <header className="bg-[#FFE8D6] border-b border-[#E5E1D8] px-6 py-4 flex justify-between items-center shadow">
          {/* Back = Tangerine Glow */}
          <Button
            size="sm"
            className="bg-[#FFA45C] text-white hover:bg-[#FFAB76] transition"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2" />
              Back
            </Link>
          </Button>

          <h1 className="text-2xl font-bold text-[#2E2B2B]">OC Code Quest</h1>

          {/* Quit = Sunrise Pink */}
          <Button
            size="sm"
            className="bg-[#FF6B8A] text-white hover:bg-[#FF7AA3] transition"
            asChild
          >
            <Link href="/dashboard">
              <X className="mr-2" />
              Quit Game
            </Link>
          </Button>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          <OCCodeQuestGame />
        </main>
      </div>
    </WalletProtection>
  )
}
