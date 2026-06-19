"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Check, X, Film, AlertCircle } from "lucide-react"

export default function PendingModerationPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: pendingMedia, isLoading } = useQuery({
    queryKey: ['admin-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media')
        .select('*, profiles(username)')
        .eq('is_custom', true)
        .eq('custom_status', 'pending')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    }
  })

  const moderateMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'approved' | 'rejected' }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Não autenticado")

      // Atualiza o status da mídia
      const { error: updateError } = await supabase
        .from('media')
        .update({ custom_status: action })
        .eq('id', id)

      if (updateError) throw updateError

      // Registra a ação no log de moderação
      await supabase.from('moderation_log').insert({
        admin_id: user.id,
        media_id: id,
        action: action === 'approved' ? 'approve' : 'reject',
        reason: "Moderação manual via Painel Administrativo"
      })
    },
    onSuccess: () => {
      // Atualiza a lista na tela
      queryClient.invalidateQueries({ queryKey: ['admin-pending'] })
    }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 border-b border-zinc-800 pb-6">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Fila de Moderação</h1>
        <p className="text-zinc-400 text-lg">Aprove ou rejeite mídias customizadas criadas por usuários.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
        </div>
      ) : pendingMedia?.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-16 text-center shadow-inner">
          <Check className="mx-auto text-green-500 mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" size={64} />
          <h2 className="text-2xl font-black text-white mb-2">Fila Vazia!</h2>
          <p className="text-zinc-400 text-lg">Tudo limpo por aqui. Bom trabalho!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingMedia?.map((media: any) => (
            <div key={media.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center shadow-xl hover:border-zinc-700 transition-colors">
              
              <div className="w-28 h-40 bg-zinc-950 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-zinc-800 shadow-inner">
                {media.poster_url ? (
                  <img src={media.poster_url} alt="Poster" className="w-full h-full object-cover" />
                ) : (
                  <Film className="text-zinc-700" size={40} />
                )}
              </div>

              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{media.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    media.type === 'movie' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {media.type === 'movie' ? 'Filme' : 'Série'}
                  </span>
                </div>
                <p className="text-zinc-400 text-base mb-6 line-clamp-3 leading-relaxed">
                  {media.overview || "Sem sinopse fornecida."}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-950/50 w-max px-4 py-2 rounded-lg border border-zinc-800">
                  <AlertCircle size={16} className="text-orange-500" />
                  <span>Enviado por <strong className="text-zinc-300 ml-1">{media.profiles?.username || 'Desconhecido'}</strong></span>
                </div>
              </div>

              <div className="flex lg:flex-col gap-3 shrink-0 w-full lg:w-48 mt-4 lg:mt-0">
                <button
                  disabled={moderateMutation.isPending}
                  onClick={() => moderateMutation.mutate({ id: media.id, action: 'approved' })}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                >
                  <Check size={20} />
                  Aprovar
                </button>
                <button
                  disabled={moderateMutation.isPending}
                  onClick={() => moderateMutation.mutate({ id: media.id, action: 'rejected' })}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  <X size={20} />
                  Rejeitar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
