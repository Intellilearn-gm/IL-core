"use client"

import { Twitter, MessageCircle, Github } from "lucide-react"

export default function DashboardFooter() {
  return (
    <footer className="backdrop-blur-xl bg-[#2E2B2B]/90 border-t border-white/20 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/70">
            <a href="#" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
