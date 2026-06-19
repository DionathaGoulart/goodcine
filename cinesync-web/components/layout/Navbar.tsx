"use client"

import { Menu, Bell } from 'lucide-react'
import { useAppStore } from '@/lib/stores/useAppStore'
import { motion } from 'motion/react'
import Link from 'next/link'

export function Navbar() {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-zinc-950/60 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all"
        >
          <Menu size={24} />
        </button>
        <Link href="/">
          <span className="text-xl font-bold lg:hidden bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            CineSync
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full transition-colors relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
        </motion.button>
      </div>
    </header>
  )
}
