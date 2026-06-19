import { tmdbClient } from "@/lib/tmdb/client"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { CarouselRow } from "@/components/media/CarouselRow"
import { RecommendationsSection } from "./RecommendationsSection"
import { TrendingUp, CalendarDays } from "lucide-react"

export const revalidate = 3600

function SectionHeader({ icon: Icon, title, subtitle, gradient }: {
  icon: React.ElementType
  title: string
  subtitle: string
  gradient: string
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div>
  )
}

export default async function HomePage() {
  // Busca todos os dados em paralelo no servidor
  const [
    trendingMovies,
    trendingTV,
    topRatedMovies,
    topRatedTV,
    recentMovies,
    recentTV,
  ] = await Promise.all([
    tmdbClient.getTrendingMovies(),
    tmdbClient.getTrendingTV(),
    tmdbClient.getTopRatedMovies(),
    tmdbClient.getTopRatedTV(),
    tmdbClient.getRecentMovies(),
    tmdbClient.getRecentTV(),
  ])

  return (
    <AuthGuard>
      <div className="space-y-14 pb-20">

        {/* Hero header */}
        <header className="pt-2 pb-4">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
            Bem-vindo ao{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              CineSync
            </span>
          </h1>
          <p className="text-zinc-400 text-base max-w-xl">
            Descubra, rastreie e compartilhe o que você assiste com seus amigos.
          </p>
        </header>

        {/* ── Recomendado ─────────────────────────────────── */}
        <RecommendationsSection
          topRatedMovies={topRatedMovies.results.slice(0, 20)}
          topRatedTV={topRatedTV.results.slice(0, 20)}
        />

        {/* ── Em Alta ─────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={TrendingUp}
            title="Em Alta Hoje"
            subtitle="O que todo mundo está assistindo agora"
            gradient="from-rose-500 to-orange-500"
          />
          <div className="space-y-8">
            <CarouselRow
              title="Filmes"
              subtitle="Filmes mais populares do dia"
              type="movie"
              items={trendingMovies.results.slice(0, 20)}
            />
            <CarouselRow
              title="Séries"
              subtitle="Séries mais populares do dia"
              type="tv"
              items={trendingTV.results.slice(0, 20)}
            />
          </div>
        </section>

        {/* ── Recentemente Lançados ────────────────────────── */}
        <section>
          <SectionHeader
            icon={CalendarDays}
            title="Recentemente Lançados"
            subtitle="Os lançamentos mais fresquinhos nos cinemas e streaming"
            gradient="from-emerald-500 to-teal-500"
          />
          <div className="space-y-8">
            <CarouselRow
              title="Filmes"
              subtitle="Em cartaz agora"
              type="movie"
              items={recentMovies.results.slice(0, 20)}
            />
            <CarouselRow
              title="Séries"
              subtitle="Novas temporadas no ar"
              type="tv"
              items={recentTV.results.slice(0, 20)}
            />
          </div>
        </section>

      </div>
    </AuthGuard>
  )
}
