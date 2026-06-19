import { tmdbClient } from "@/lib/tmdb/client"
import { CarouselRow } from "@/components/media/CarouselRow"
import { Film } from "lucide-react"

export const revalidate = 3600
export const metadata = { title: "Filmes" }

export default async function MoviesPage() {
  const [trending, topRated, recent] = await Promise.all([
    tmdbClient.getTrendingMovies(),
    tmdbClient.getTopRatedMovies(),
    tmdbClient.getRecentMovies(),
  ])

  return (
    <div className="pb-20 space-y-12">
      <header className="py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Film size={18} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Filmes</h1>
        </div>
        <p className="text-zinc-500 text-sm">Longas, curtas, animações, animes — tudo que tem começo, meio e fim.</p>
      </header>

      <section>
        <CarouselRow
          title="Em Alta Hoje"
          subtitle="Os filmes mais vistos agora no mundo"
          type="movie"
          items={trending.results.slice(0, 20)}
        />
      </section>

      <section>
        <CarouselRow
          title="Mais Bem Avaliados"
          subtitle="Os filmes mais aclamados de todos os tempos"
          type="movie"
          items={topRated.results.slice(0, 20)}
        />
      </section>

      <section>
        <CarouselRow
          title="Em Cartaz"
          subtitle="Novidades chegando nos cinemas e streaming"
          type="movie"
          items={recent.results.slice(0, 20)}
        />
      </section>
    </div>
  )
}
