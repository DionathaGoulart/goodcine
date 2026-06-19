"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { FriendCard } from "@/components/social/FriendCard"
import { Users } from "lucide-react"

export default function FriendsPage() {
  const supabase = createClient()

  const { data: friends, isLoading } = useQuery({
    queryKey: ['friendships'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          requester (id, username, avatar_url),
          addressee (id, username, avatar_url)
        `)
        .or(`requester.eq.${user.id},addressee.eq.${user.id}`)
        .eq('status', 'accepted')

      if (error) throw error
      
      return data.map((f: any) => ({
        friendshipId: f.id,
        friend: f.requester.id === user.id ? f.addressee : f.requester
      }))
    }
  })

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        <header className="border-b border-zinc-800/50 pb-8 mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Users className="text-indigo-400" size={32} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Amigos</h1>
          </div>
          <p className="text-zinc-400 text-lg">Suas conexões no CineSync.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          </div>
        ) : friends?.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
            <Users className="mx-auto text-zinc-700 mb-6" size={56} />
            <p className="text-zinc-400 text-xl font-medium">Você ainda não adicionou amigos.</p>
            <p className="text-zinc-600 mt-2">Busque por usuários e envie convites.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends?.map(f => (
              <FriendCard key={f.friendshipId} friend={f.friend} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
