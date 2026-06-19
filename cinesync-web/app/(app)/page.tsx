import { tmdbClient } from "@/lib/tmdb/client"
import { MediaGrid } from "@/components/media/MediaGrid"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { RecommendationsSection } from "./RecommendationsSection"

export const revalidate = 3600 // Cache ISR de 1 hora

export default async function HomePage() {
  const trending = await tmdbClient.getTrending()

  return (
    <AuthGuard>
      <div className="space-y-12 pb-16">
        <header className="py-4">
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CineSync</span></h1>
          <p className="text-zinc-400 text-lg max-w-2xl">Descubra novas histórias, rastreie o que assiste e veja o que seus amigos recomendam.</p>
        </header>

        <RecommendationsSection />

        <section>
          <div className="mb-6 border-l-4 border-indigo-500 pl-4">
            <h2 className="text-2xl font-bold text-white">Em Alta Hoje</h2>
            <p className="text-sm text-zinc-400">Os filmes e séries mais populares no momento.</p>
          </div>
          <MediaGrid items={trending.results} />
        </section>
      </div>
    </AuthGuard>
  )
}
