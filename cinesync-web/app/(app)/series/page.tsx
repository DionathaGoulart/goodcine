import { tmdbClient } from "@/lib/tmdb/client"
import { CarouselRow } from "@/components/media/CarouselRow"
import { Tv } from "lucide-react"

export const revalidate = 3600
export const metadata = { title: "Séries" }

export default async function SeriesPage() {
  const [trending, topRated, recent] = await Promise.all([
    tmdbClient.getTrendingTV(),
    tmdbClient.getTopRatedTV(),
    tmdbClient.getRecentTV(),
  ])

  return (
    <div className="pb-20 space-y-12">
      <header className="py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Tv size={18} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Séries</h1>
        </div>
        <p className="text-zinc-500 text-sm">Séries, novelas, documentários e tudo que vem em episódios.</p>
      </header>

      <section>
        <CarouselRow
          title="Em Alta Hoje"
          subtitle="As séries mais vistas agora no mundo"
          type="tv"
          items={trending.results.slice(0, 20)}
        />
      </section>

      <section>
        <CarouselRow
          title="Mais Bem Avaliadas"
          subtitle="As séries mais aclamadas de todos os tempos"
          type="tv"
          items={topRated.results.slice(0, 20)}
        />
      </section>

      <section>
        <CarouselRow
          title="No Ar Agora"
          subtitle="Novas temporadas em exibição"
          type="tv"
          items={recent.results.slice(0, 20)}
        />
      </section>
    </div>
  )
}
