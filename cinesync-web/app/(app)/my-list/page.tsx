"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { MediaGrid } from "@/components/media/MediaGrid"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

export default function MyListPage() {
  const supabase = createClient()
  const [filter, setFilter] = useState<'all' | 'watching' | 'watched' | 'want_to_watch'>('all')

  const { data: userMediaList, isLoading } = useQuery({
    queryKey: ['user_media'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('user_media')
        .select(`
          status,
          liked,
          media (
            id,
            tmdb_id,
            type,
            title,
            poster_url,
            backdrop_url,
            release_year
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  // Transforma para o formato consumido pelo MediaGrid (TMDBMedia like)
  const items = userMediaList
    ?.filter(item => filter === 'all' || item.status === filter)
    .map(item => ({
      id: item.media.tmdb_id,
      title: item.media.title,
      poster_path: item.media.poster_url,
      backdrop_path: item.media.backdrop_url,
      media_type: item.media.type,
      vote_average: 0,
      vote_count: 0,
      genre_ids: [],
      popularity: 0
    } as any)) || []

  const FilterButton = ({ value, label }: { value: typeof filter, label: string }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
        filter === value 
          ? 'text-white' 
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
      }`}
    >
      {filter === value && (
        <motion.div
          layoutId="activeFilterBg"
          className="absolute inset-0 bg-indigo-500 rounded-xl -z-10 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
      {label}
    </button>
  )

  return (
    <AuthGuard>
      <div className="space-y-10 max-w-7xl mx-auto pb-16">
        <div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Minha Lista</h1>
          <p className="text-zinc-400 text-lg">Gerencie tudo que você está acompanhando e planeja ver.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800/50 w-max">
          <FilterButton value="all" label="Todos" />
          <FilterButton value="watching" label="Assistindo" />
          <FilterButton value="want_to_watch" label="Quero Ver" />
          <FilterButton value="watched" label="Assistidos" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          </div>
        ) : (
          <MediaGrid items={items} />
        )}
      </div>
    </AuthGuard>
  )
}
