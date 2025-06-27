// app/games/archery-pro/page.tsx
'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'

// dynamic import so canvas logic only runs in browser
const ArcheryGame = dynamic(
  () => import('@/components/games/archery-pro/ArcheryGame'),
  { ssr: false, loading: () => <p className="p-6 text-center">Loading Archery Pro…</p> }
)

export default function ArcheryPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <header className="backdrop-blur-xl bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between items-center">
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2" /> Back
          </Link>
        </Button>

        <h1 className="text-2xl font-bold text-white">Archery Pro</h1>

        <Button size="sm" asChild>
          <Link href="/dashboard">
            <X className="mr-2" /> Quit Game
          </Link>
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center overflow-hidden">
        <ArcheryGame />
      </main>
    </div>
  )
}
