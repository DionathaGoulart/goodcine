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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()
    if (!user_id) throw new Error("user_id is required")

    // 1. Lê user_taste_profile
    const { data: tasteProfile } = await supabaseClient
      .from('user_taste_profile')
      .select('genre_scores')
      .eq('user_id', user_id)
      .single()

    if (!tasteProfile || !tasteProfile.genre_scores) {
      return new Response(JSON.stringify({ message: "Taste profile vazio" }), { headers: corsHeaders })
    }

    // 2. Filtra o que o usuário já viu
    const { data: userMedia } = await supabaseClient
      .from('user_media')
      .select('media_id')
      .eq('user_id', user_id)
    
    const ignoredMediaIds = new Set(userMedia?.map((u: any) => u.media_id))

    // 3. Busca todo catálogo em cache no banco (como fallback da API TMDB)
    const { data: allMedia } = await supabaseClient.from('media').select('id, genres')

    const recommendations = []
    
    // 4. Calcula relevância
    for (const media of (allMedia || [])) {
      if (ignoredMediaIds.has(media.id)) continue

      let score = 0
      media.genres?.forEach((g: string) => {
        score += (tasteProfile.genre_scores[g] || 0)
      })

      if (score > 0.5) {
        recommendations.push({
          user_id,
          media_id: media.id,
          score,
          reason: `Recomendado com base na sua afinidade com os gêneros do título.`,
        })
      }
    }

    if (recommendations.length > 0) {
      // Limpa antigas
      await supabaseClient.from('recommendations').delete().eq('user_id', user_id)
      // Insere as 20 melhores
      await supabaseClient.from('recommendations').insert(
        recommendations.sort((a, b) => b.score - a.score).slice(0, 20)
      )
    }

    return new Response(JSON.stringify({ success: true, count: recommendations.length }), { headers: corsHeaders })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})
