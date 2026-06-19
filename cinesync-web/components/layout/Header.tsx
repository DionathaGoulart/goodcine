"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Bell, User, ChevronDown, Film, Tv, Heart, Users, LogOut, Settings, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/useUser"

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/search?type=movie", label: "Filmes" },
  { href: "/search?type=tv", label: "Séries" },
  { href: "/my-list", label: "Minha Lista" },
  { href: "/social/friends", label: "Amigos" },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile } = useUser()
  const supabase = createClient()

  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Scroll detection para gradiente
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const avatarUrl = profile?.avatar_url
  const displayName = profile?.username || user?.email?.split("@")[0] || "Usuário"

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50"
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 h-16 flex items-center gap-8">

          {/* Logo */}
          <Link href="/" className="shrink-0 mr-2">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CineSync
            </span>
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Search bar expandível */}
            <div className="flex items-center">
              <AnimatePresence mode="popLayout">
                {searchOpen ? (
                  <motion.form
                    key="search-form"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    onSubmit={handleSearch}
                    className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-3 overflow-hidden"
                  >
                    <Search size={15} className="text-zinc-400 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none py-2 min-w-0"
                    />
                    <button type="button" onClick={() => setSearchOpen(false)}>
                      <X size={14} className="text-zinc-500 hover:text-white transition-colors" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Search size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Notificações */}
            <button className="relative p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-zinc-950" />
            </button>

            {/* Avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-transparent group-hover:ring-white/30 transition-all">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform duration-200 hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    {/* Overlay para fechar */}
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />

                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50"
                    >
                      {/* Info do usuário */}
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                      </div>

                      {/* Links do menu */}
                      <div className="py-1">
                        {[
                          { href: "/my-list", icon: Heart, label: "Minha Lista" },
                          { href: "/social/friends", icon: Users, label: "Amigos" },
                          { href: "/profile/me", icon: Settings, label: "Perfil & Configurações" },
                        ].map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <item.icon size={16} className="text-zinc-500" />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-zinc-800 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={16} />
                          Sair
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Nav mobile — bottom */}
        <nav className="md:hidden flex items-center justify-around border-t border-white/5 bg-zinc-950/95 px-2 py-1">
          {navLinks.slice(0, 4).map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {link.label}
                {isActive && <span className="w-1 h-1 rounded-full bg-indigo-400" />}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Spacer para compensar o header fixo */}
      <div className="h-16 md:h-16" />
    </>
  )
}
