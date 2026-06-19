import { tmdbClient } from "@/lib/tmdb/client"
import { MediaDetail } from "@/components/media/MediaDetail"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { notFound } from "next/navigation"

export default async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const series = await tmdbClient.getSeries(id)
    series.media_type = 'tv'
    
    return (
      <AuthGuard>
        <MediaDetail media={series} />
      </AuthGuard>
    )
  } catch (error) {
    notFound()
  }
}
