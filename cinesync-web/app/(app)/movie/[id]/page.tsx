import { tmdbClient } from "@/lib/tmdb/client"
import { MediaDetail } from "@/components/media/MediaDetail"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { notFound } from "next/navigation"

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const movie = await tmdbClient.getMovie(id)
    movie.media_type = 'movie'
    
    return (
      <AuthGuard>
        <MediaDetail media={movie} />
      </AuthGuard>
    )
  } catch (error) {
    notFound()
  }
}
