import { NextRequest, NextResponse } from "next/server"
import { tmdbClient } from "@/lib/tmdb/client"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get("q")?.trim()

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const data = await tmdbClient.searchMulti(query)
    // Filtra apenas filmes e séries (remove pessoas, etc.)
    const filtered = data.results.filter(
      r => r.media_type === "movie" || r.media_type === "tv"
    )
    return NextResponse.json({ results: filtered })
  } catch (error: any) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Erro ao buscar resultados." },
      { status: 500 }
    )
  }
}
