"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Search, Loader2, Film, Tv, SlidersHorizontal } from "lucide-react"
import { MediaGrid } from "@/components/media/MediaGrid"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { TMDBMedia } from "@/lib/tmdb/types"
import { useDebounce } from "@/lib/hooks/useDebounce"

type Filter = "all" | "movie" | "tv"

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") ?? ""

  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, 400)
  const [results, setResults] = useState<TMDBMedia[]>([])
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>("all")
  const [hasSearched, setHasSearched] = useState(false)

  // Atualiza a URL sem navegar, para o back button funcionar
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedQuery) params.set("q", debouncedQuery)
    else params.delete("q")
    router.replace(`/search?${params.toString()}`, { scroll: false })
  }, [debouncedQuery])

  // Busca via API route (servidor tem acesso ao token TMDB)
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(res => res.json())
      .then(data => {
        startTransition(() => {
          setResults(data.results ?? [])
        })
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [debouncedQuery])

  // Filtra os resultados pelo tipo selecionado
  const filtered = results.filter(r => {
    if (filter === "all") return true
    return r.media_type === filter
  })

  const movieCount = results.filter(r => r.media_type === "movie").length
  const tvCount = results.filter(r => r.media_type === "tv").length

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto pb-20">

        {/* Hero da busca */}
        <div className="py-10">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Explorar</h1>
          <p className="text-zinc-500 text-sm mb-8">Encontre filmes e séries do catálogo global</p>

          {/* Campo de busca */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              {isLoading
                ? <Loader2 className="animate-spin text-indigo-400" size={22} />
                : <Search className="text-zinc-500" size={22} />
              }
            </div>
            <input
              autoFocus={!!initialQuery}
              type="text"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500/60 rounded-2xl pl-14 pr-6 py-4 text-white text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-600 shadow-xl"
              placeholder="Buscar filmes, séries, animes..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros — aparece quando tem resultados */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 mb-6 flex-wrap"
            >
              <span className="text-zinc-500 text-sm flex items-center gap-1.5 mr-2">
                <SlidersHorizontal size={14} />
                Filtrar:
              </span>
              {(["all", "movie", "tv"] as Filter[]).map(f => {
                const labels: Record<Filter, { label: string; icon: React.ElementType; count: number }> = {
                  all: { label: "Todos", icon: Search, count: results.length },
                  movie: { label: "Filmes", icon: Film, count: movieCount },
                  tv: { label: "Séries", icon: Tv, count: tvCount },
                }
                const { label, icon: Icon, count } = labels[f]
                const active = filter === f
                return (
                  <motion.button
                    key={f}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFilter(f)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      active
                        ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                    <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-white/20" : "bg-zinc-800"}`}>
                      {count}
                    </span>
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultados */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-32 text-zinc-500 gap-3"
            >
              <Loader2 className="animate-spin" size={24} />
              <span className="text-base">Buscando...</span>
            </motion.div>
          ) : hasSearched && filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-32 bg-zinc-900/40 rounded-3xl border border-zinc-800 border-dashed"
            >
              <Search className="mx-auto text-zinc-700 mb-4" size={48} />
              <p className="text-zinc-300 text-xl font-semibold">
                Nenhum resultado para &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="text-zinc-600 mt-2 text-sm">
                Tente outros termos ou verifique a ortografia.
              </p>
            </motion.div>
          ) : filtered.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-zinc-500 text-sm">
                <span className="text-white font-semibold">{filtered.length}</span> resultado{filtered.length !== 1 ? "s" : ""} para{" "}
                <span className="text-indigo-400 font-medium">&ldquo;{debouncedQuery}&rdquo;</span>
              </p>
              <MediaGrid items={filtered} />
            </motion.div>
          ) : !hasSearched ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-zinc-600"
            >
              <Search size={56} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Digite algo para começar a buscar</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </AuthGuard>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-32"><Loader2 className="animate-spin text-zinc-500" size={32} /></div>}>
      <SearchContent />
    </Suspense>
  )
}
