import { createClient } from "@/lib/supabase/server"
import { Users, Film, AlertTriangle } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Buscando estatísticas básicas do banco
  const [{ count: userCount }, { count: customMediaCount }, { count: pendingMediaCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('is_custom', true),
    supabase.from('media').select('*', { count: 'exact', head: true }).eq('custom_status', 'pending'),
  ])

  const stats = [
    { label: "Total de Usuários", value: userCount || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Mídias Customizadas", value: customMediaCount || 0, icon: Film, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Aprovações Pendentes", value: pendingMediaCount || 0, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black text-white mb-10 tracking-tight">Visão Geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-zinc-900 border ${stat.border} rounded-2xl p-6 shadow-xl`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon className={stat.color} size={28} />
              </div>
            </div>
            <h3 className="text-zinc-400 font-semibold mb-2">{stat.label}</h3>
            <p className="text-5xl font-black text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
