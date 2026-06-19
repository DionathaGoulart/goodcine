"use client"

import { useRecommendations } from "@/lib/hooks/useRecommendations"
import { MediaGrid } from "@/components/media/MediaGrid"
import { motion } from "motion/react"
import { Sparkles } from "lucide-react"

export function RecommendationsSection() {
  const { data: recommendations, isLoading } = useRecommendations()

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-purple-500" />
          <h2 className="text-2xl font-bold text-white">Recomendados para Você</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3,4,5].map(i => (
            <motion.div
              key={i}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl aspect-[2/3] w-full max-w-[200px]"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            />
          ))}
        </div>
      </section>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return null
  }

  // Formata a recomendação para encaixar na prop TMDBMedia do MediaCard
  const formattedItems = recommendations.map(rec => ({
    id: rec.media.tmdb_id,
    title: rec.media.title,
    poster_path: rec.media.poster_url,
    backdrop_path: rec.media.backdrop_url,
    media_type: rec.media.type,
    overview: rec.media.overview,
    vote_average: 0,
    vote_count: 0,
    genre_ids: [],
    popularity: 0
  } as any))

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6 border-l-4 border-purple-500 pl-4 bg-purple-500/5 py-2 rounded-r-xl">
        <Sparkles className="text-purple-500" size={24} />
        <div>
          <h2 className="text-2xl font-bold text-white">Recomendados para Você</h2>
          <p className="text-sm text-zinc-400">Baseado no seu perfil de gostos.</p>
        </div>
      </div>
      <MediaGrid items={formattedItems} />
    </section>
  )
}
