"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

export default function SearchSection() {
  return (
    <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg p-4 shadow-lg">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7D7A75] w-5 h-5" />
          <Input
            placeholder="Search games..."
            className="pl-10 bg-white/30 border-white/40 text-[#2E2B2B] placeholder:text-[#7D7A75] rounded-lg backdrop-blur-sm"
          />
        </div>
        <Button
          variant="outline"
          className="bg-white/30 border-white/40 text-[#2E2B2B] rounded-lg backdrop-blur-sm hover:bg-white/40"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
