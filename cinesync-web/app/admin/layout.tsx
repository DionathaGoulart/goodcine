import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, LayoutDashboard, ListTodo, LogOut } from "lucide-react"
import { QueryProvider } from "@/components/providers/QueryProvider"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <QueryProvider>
      <div className="min-h-screen bg-zinc-950 flex font-sans selection:bg-red-500/30">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex-col hidden md:flex">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <Shield className="text-red-500" size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Admin Sync</span>
          </div>

          <nav className="p-4 space-y-2 flex-1">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all font-medium">
              <LayoutDashboard size={20} className="text-zinc-400" />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/pending" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all font-medium">
              <ListTodo size={20} className="text-zinc-400" />
              <span>Moderação</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all font-medium">
              <LogOut size={20} />
              <span>Sair do Painel</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </QueryProvider>
  )
}
