import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { TMDBMedia } from '../tmdb/types'

interface MediaActionVariables {
  media: TMDBMedia
  status?: 'watching' | 'watched' | 'want_to_watch'
  liked?: boolean | null
}

export function useMediaActions() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Sincroniza a mídia do TMDB pro banco do CineSync se não existir
  const syncMedia = async (media: TMDBMedia) => {
    let { data: existingMedia } = await supabase
      .from('media')
      .select('id')
      .eq('tmdb_id', media.id)
      .eq('type', media.media_type || 'movie') // fallback
      .single()

    if (!existingMedia) {
      const { data: newMedia, error } = await supabase
        .from('media')
        .insert({
          tmdb_id: media.id,
          type: media.media_type || 'movie',
          title: media.title || media.name || '',
          overview: media.overview,
          poster_url: media.poster_path,
          backdrop_url: media.backdrop_path,
          genres: media.genre_ids ? media.genre_ids.map(String) : [],
          release_year: media.release_date 
            ? parseInt(media.release_date.split('-')[0]) 
            : (media.first_air_date ? parseInt(media.first_air_date.split('-')[0]) : null)
        })
        .select('id')
        .single()

      if (error) throw error
      existingMedia = newMedia
    }
    
    return existingMedia!.id
  }

  const upsertUserMedia = useMutation({
    mutationFn: async ({ media, status, liked }: MediaActionVariables) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const localMediaId = await syncMedia(media)

      // Prepara objeto com apenas os dados definidos (não sobrescreve com null)
      const updateData: any = {
        user_id: user.id,
        media_id: localMediaId,
        updated_at: new Date().toISOString()
      }
      if (status !== undefined) updateData.status = status;
      if (liked !== undefined) updateData.liked = liked;

      // Upsert na tabela user_media
      const { data, error } = await supabase
        .from('user_media')
        .upsert(updateData, { onConflict: 'user_id,media_id' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalida cache das listas pessoais e status
      queryClient.invalidateQueries({ queryKey: ['user_media'] })
    }
  })

  return {
    upsertUserMedia
  }
}
