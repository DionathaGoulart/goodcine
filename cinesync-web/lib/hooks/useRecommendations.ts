import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useRecommendations() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Busca as recomendações que o algoritmo (Edge Function) gerou para este user
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          id,
          score,
          reason,
          seen,
          media (
            id,
            tmdb_id,
            type,
            title,
            poster_url,
            backdrop_url,
            overview
          )
        `)
        .eq('user_id', user.id)
        .order('score', { ascending: false })
        .limit(20)

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 60, // Cache de 1 hora no cliente
  })
}
