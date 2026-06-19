"use client"

import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { useAppStore } from '@/lib/stores/useAppStore'
import { Home, Search, Heart, Users, X, List } from 'lucide-react'

export function Sidebar() {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Buscar', icon: Search },
    { href: '/my-list', label: 'Minha Lista', icon: Heart },
    { href: '/social/friends', label: 'Amigos', icon: Users },
    { href: '/social/lists', label: 'Listas', icon: List },
  ]

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800/50 flex flex-col p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
                CineSync
              </span>
              <button onClick={closeSidebar} className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full lg:hidden">
                <X size={20} />
              </button>
            </div>

            <ul className="space-y-2 flex-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeSidebar}
                    className="flex items-center gap-3 p-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-indigo-400 transition-all font-medium"
                  >
                    <link.icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-zinc-800/50 mt-auto">
              <Link href="/profile/me" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Meu Perfil</span>
                  <span className="text-xs text-zinc-500">Configurações</span>
                </div>
              </Link>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
