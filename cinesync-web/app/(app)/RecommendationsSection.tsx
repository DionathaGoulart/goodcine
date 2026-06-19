"use client"

import { useRecommendations } from "@/lib/hooks/useRecommendations"
import { CarouselRow } from "@/components/media/CarouselRow"
import { Sparkles } from "lucide-react"
import { TMDBMedia } from "@/lib/tmdb/types"

interface RecommendationsSectionProps {
  topRatedMovies: TMDBMedia[]
  topRatedTV: TMDBMedia[]
}

export function RecommendationsSection({ topRatedMovies, topRatedTV }: RecommendationsSectionProps) {
  const { data: recommendations, isLoading } = useRecommendations()

  // Separa recomendações por tipo
  const recMovies: TMDBMedia[] = []
  const recTV: TMDBMedia[] = []

  if (recommendations && recommendations.length > 0) {
    recommendations.forEach(rec => {
      const mediaObj: any = Array.isArray(rec.media) ? rec.media[0] : rec.media
      const item = {
        id: mediaObj.tmdb_id ?? 0,
        title: mediaObj.title,
        name: mediaObj.title,
        poster_path: mediaObj.poster_url,
        backdrop_path: mediaObj.backdrop_url,
        media_type: mediaObj.type === 'movie' ? 'movie' : 'tv',
        overview: mediaObj.overview ?? '',
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
        popularity: 0,
      } as TMDBMedia

      if (mediaObj.type === 'movie') recMovies.push(item)
      else recTV.push(item)
    })
  }

  // Se não tem recomendações personalizadas, usa top rated como fallback
  const hasPersonalRecs = !isLoading && (recMovies.length > 0 || recTV.length > 0)
  const movieItems = hasPersonalRecs ? recMovies : topRatedMovies
  const tvItems = hasPersonalRecs ? recTV : topRatedTV
  const subtitle = hasPersonalRecs
    ? "Baseado no seu perfil de gostos"
    : "Os mais bem avaliados de todos os tempos"

  return (
    <section className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {hasPersonalRecs ? "Recomendado para Você" : "Muito Bem Avaliados"}
          </h2>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-8">
        <CarouselRow
          title="Filmes"
          subtitle={hasPersonalRecs ? "Filmes que combinam com seu gosto" : "Os filmes mais aclamados"}
          type="movie"
          items={movieItems}
          isLoading={isLoading}
        />
        <CarouselRow
          title="Séries"
          subtitle={hasPersonalRecs ? "Séries que você vai curtir" : "As séries mais aclamadas"}
          type="tv"
          items={tvItems}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}
