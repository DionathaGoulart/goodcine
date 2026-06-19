import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Service role ignora RLS para cálculos
    )

    const { user_id } = await req.json()
    if (!user_id) throw new Error("user_id is required")

    // 1. Busca histórico (user_media)
    const { data: userMedia } = await supabaseClient
      .from('user_media')
      .select('status, liked, media(genres)')
      .eq('user_id', user_id)

    // 2. Busca reviews
    const { data: reviews } = await supabaseClient
      .from('reviews')
      .select('rating, media(genres)')
      .eq('user_id', user_id)

    const genreScores: Record<string, number> = {}

    // 3. Aplica os pesos
    userMedia?.forEach((item: any) => {
      let weight = 0
      if (item.liked === true) weight += 3
      if (item.liked === false) weight -= 3
      if (item.status === 'watched') weight += 2
      if (item.status === 'watching') weight += 1

      item.media?.genres?.forEach((genre: string) => {
        genreScores[genre] = (genreScores[genre] || 0) + weight
      })
    })

    reviews?.forEach((review: any) => {
      let weight = review.rating >= 7 ? 2 : (review.rating <= 4 ? -2 : 0)
      review.media?.genres?.forEach((genre: string) => {
        genreScores[genre] = (genreScores[genre] || 0) + weight
      })
    })

    // 4. Normaliza scores entre 0 e 1
    const maxScore = Math.max(...Object.values(genreScores), 1)
    const normalizedScores = Object.fromEntries(
      Object.entries(genreScores).map(([k, v]) => [k, Math.max(0, v / maxScore)])
    )

    // 5. Salva o perfil
    await supabaseClient
      .from('user_taste_profile')
      .upsert({ 
        user_id, 
        genre_scores: normalizedScores, 
        updated_at: new Date().toISOString() 
      })

    return new Response(JSON.stringify({ success: true, scores: normalizedScores }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
