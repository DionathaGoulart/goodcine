import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { TMDBMedia } from '../tmdb/types'

interface MediaActionVariables {
  media: TMDBMedia
  status?: 'watching' | 'watched' | 'want_to_watch'
  liked?: boolean | null
  ratingReaction?: 'loved' | 'good' | 'bad' | 'hated' | null
  startedAt?: string | null
  finishedAt?: string | null
  watchHistory?: {
    seasonNumber?: number
    isRewatch?: boolean
    startedAt?: string | null
    finishedAt?: string | null
  }
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
    mutationFn: async ({ media, status, liked, ratingReaction, startedAt, finishedAt, watchHistory }: MediaActionVariables) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const localMediaId = await syncMedia(media)

      // Prepara objeto com apenas os dados definidos (não sobrescreve com null implicitamente, 
      // a menos que passem explicitamente null)
      const updateData: any = {
        user_id: user.id,
        media_id: localMediaId,
        updated_at: new Date().toISOString()
      }
      if (status !== undefined) updateData.status = status;
      if (liked !== undefined) updateData.liked = liked;
      if (ratingReaction !== undefined) updateData.rating_reaction = ratingReaction;
      if (startedAt !== undefined) updateData.started_at = startedAt;
      if (finishedAt !== undefined) updateData.finished_at = finishedAt;

      // Upsert na tabela user_media
      const { data: userMediaData, error: userMediaError } = await supabase
        .from('user_media')
        .upsert(updateData, { onConflict: 'user_id,media_id' })
        .select()
        .single()

      if (userMediaError) throw userMediaError

      // Se houver dados de histórico de visualização (ex: temporadas, rewatch), insere no watch_history
      if (watchHistory) {
        const { error: historyError } = await supabase
          .from('watch_history')
          .insert({
            user_media_id: userMediaData.id,
            season_number: watchHistory.seasonNumber,
            is_rewatch: watchHistory.isRewatch || false,
            started_at: watchHistory.startedAt || startedAt,
            finished_at: watchHistory.finishedAt || finishedAt
          })
          
        if (historyError) throw historyError
      }

      return userMediaData
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
