"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { MediaGrid } from "@/components/media/MediaGrid"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Film, Tv, Heart, ThumbsUp, ThumbsDown, HeartCrack, Loader2 } from "lucide-react"

type MainTab = 'watched' | 'watching' | 'want_to_watch'
type MediaTypeFilter = 'all' | 'movie' | 'tv'
type ReactionFilter = 'all' | 'loved' | 'good' | 'bad' | 'hated'

export default function MyListPage() {
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<MainTab>('watched')
  const [mediaType, setMediaType] = useState<MediaTypeFilter>('all')
  const [reactionFilter, setReactionFilter] = useState<ReactionFilter>('all')

  const { data: userMediaList, isLoading } = useQuery({
    queryKey: ['user_media'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('user_media')
        .select(`
          status,
          liked,
          rating_reaction,
          started_at,
          finished_at,
          media (
            id,
            tmdb_id,
            type,
            title,
            poster_url,
            backdrop_url,
            release_year
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  // Filtra e mapeia os itens baseados nos seletores ativos
  const items = userMediaList?.filter(item => {
    // 1. Filtro de Aba principal
    if (item.status !== activeTab) return false
    
    // Supabase TS infers relations as array or object. Let's normalize it.
    const mediaObj: any = Array.isArray(item.media) ? item.media[0] : item.media
    if (!mediaObj) return false

    // 2. Filtro de Tipo de Mídia (Filme/Série)
    if (mediaType !== 'all' && mediaObj.type !== mediaType) return false
    
    // 3. Filtro de Reação (aplicável apenas à aba Assistidos)
    if (activeTab === 'watched' && reactionFilter !== 'all') {
      if (item.rating_reaction !== reactionFilter) return false
    }

    return true
  }).map(item => {
    const mediaObj: any = Array.isArray(item.media) ? item.media[0] : item.media
    return {
      id: mediaObj.tmdb_id,
      title: mediaObj.title,
      poster_path: mediaObj.poster_url,
      backdrop_path: mediaObj.backdrop_url,
      media_type: mediaObj.type,
      vote_average: 0,
      vote_count: 0,
    genre_ids: [],
    popularity: 0,
    _userRatingReaction: item.rating_reaction // dado extra para talvez exibir no card futuramente
    } as any
  }) || []

  // Componentes Auxiliares de UI
  const TabButton = ({ value, label }: { value: MainTab, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(value)
        setReactionFilter('all') // reseta o sub-filtro
      }}
      className={`px-6 py-3 rounded-xl text-sm font-bold transition-all relative ${
        activeTab === value ? 'text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
      }`}
    >
      {activeTab === value && (
        <motion.div
          layoutId="activeTabBg"
          className="absolute inset-0 bg-indigo-500 rounded-xl -z-10 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
      {label}
    </button>
  )

  const TypeFilterButton = ({ value, label, icon: Icon }: { value: MediaTypeFilter, label: string, icon?: any }) => (
    <button
      onClick={() => setMediaType(value)}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        mediaType === value 
          ? 'bg-zinc-100 text-zinc-900 border-zinc-100' 
          : 'bg-transparent text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:border-zinc-500'
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  )

  const reactions = [
    { id: 'all', label: 'Todas' },
    { id: 'loved', label: 'Amei', icon: Heart, color: 'text-pink-500' },
    { id: 'good', label: 'Bom', icon: ThumbsUp, color: 'text-green-500' },
    { id: 'bad', label: 'Ruim', icon: ThumbsDown, color: 'text-orange-500' },
    { id: 'hated', label: 'Odiei', icon: HeartCrack, color: 'text-red-500' },
  ] as const

  return (
    <AuthGuard>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Minha Lista</h1>
            <p className="text-zinc-400">Gerencie e acompanhe tudo o que você assiste.</p>
          </div>
          
          {/* Main Tabs */}
          <div className="flex gap-1 overflow-x-auto p-1.5 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 w-max">
            <TabButton value="watched" label="Assistidos" />
            <TabButton value="watching" label="Assistindo" />
            <TabButton value="want_to_watch" label="Quero Assistir" />
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-6 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/50">
          
          {/* Tipo de Mídia */}
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-6">
            <TypeFilterButton value="all" label="Tudo" />
            <TypeFilterButton value="movie" label="Filmes" icon={Film} />
            <TypeFilterButton value="tv" label="Séries" icon={Tv} />
          </div>

          {/* Filtro de Reação (Apenas em Assistidos) */}
          <AnimatePresence>
            {activeTab === 'watched' && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                {reactions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setReactionFilter(r.id as ReactionFilter)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      reactionFilter === r.id
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {'icon' in r && <r.icon size={12} className={reactionFilter === r.id ? r.color : ''} />}
                    {r.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid de Resultados */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32 text-zinc-500">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-900/20 rounded-3xl border border-zinc-800/50 border-dashed">
            <p className="text-zinc-400 text-lg font-medium mb-1">Nenhum título encontrado.</p>
            <p className="text-zinc-600 text-sm">Tente mudar os filtros ou adicione mais coisas à sua lista.</p>
          </div>
        ) : (
          <MediaGrid items={items} />
        )}
        
      </div>
    </AuthGuard>
  )
}
