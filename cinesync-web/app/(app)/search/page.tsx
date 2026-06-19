"use client"

import { useState, useEffect, useTransition } from "react"
import { motion } from "motion/react"
import { Search, Loader2 } from "lucide-react"
import { MediaGrid } from "@/components/media/MediaGrid"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { tmdbClient } from "@/lib/tmdb/client"
import { TMDBMedia } from "@/lib/tmdb/types"
import { useDebounce } from "@/lib/hooks/useDebounce"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 500)
  const [results, setResults] = useState<TMDBMedia[]>([])
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    tmdbClient.searchMulti(debouncedQuery)
      .then(res => {
        // Filtra apenas filmes e séries
        const filtered = res.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv')
        startTransition(() => {
          setResults(filtered)
        })
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })

  }, [debouncedQuery])

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto pb-16">
        <div className="mb-10 relative">
          <h1 className="text-4xl font-black text-white mb-8 tracking-tight">Explorar</h1>
          
          <div className="relative group max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
            </div>
            <input
              type="text"
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-white text-lg focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-600 shadow-xl"
              placeholder="Buscar filmes, séries..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {query.trim() !== "" && !isLoading && results.length === 0 && (
          <div className="text-center py-32 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
            <Search className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-400 text-xl font-medium">Nenhum resultado encontrado para "{query}"</p>
            <p className="text-zinc-600 mt-2">Tente buscar por termos diferentes ou verifique a ortografia.</p>
          </div>
        )}

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold text-zinc-300 border-l-4 border-indigo-500 pl-4">Resultados para <span className="text-white">"{debouncedQuery}"</span></h2>
            <MediaGrid items={results} />
          </motion.div>
        )}
      </div>
    </AuthGuard>
  )
}
