"use client"

import { useState } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Film, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "A senha deve ter pelo menos 8 caracteres."
    if (!/[A-Z]/.test(pwd)) return "A senha deve conter pelo menos uma letra maiúscula."
    if (!/[0-9]/.test(pwd)) return "A senha deve conter pelo menos um número."
    if (!/[^A-Za-z0-9]/.test(pwd)) return "A senha deve conter pelo menos um caractere especial."
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const pwdError = validatePassword(password)
    if (pwdError) { setError(pwdError); return }

    setLoading(true)

    // 1. Cadastra no auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, 
        }
      }
    })

    if (authError) {
      // Traduz as mensagens mais comuns do Supabase
      if (authError.message.includes('Password should be')) {
        setError("A senha não atende aos requisitos de segurança. Use ao menos 8 caracteres com maiúsculas, números e símbolos.")
      } else if (authError.message.includes('User already registered')) {
        setError("Este e-mail já está cadastrado.")
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    if (authData.user) {
      // O perfil é criado automaticamente pelo trigger handle_new_user no banco.
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
            <Film className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Crie sua conta</h1>
          <p className="text-zinc-400 text-sm text-center">Comece a rastrear seus filmes favoritos e descobrir novas séries.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nome de usuário</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-zinc-600"
              placeholder="cinesync_fan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-zinc-600"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Senha</label>
            <input 
              type="password" 
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-zinc-600"
              placeholder="Mínimo 8 caracteres"
            />
            <p className="mt-1.5 text-xs text-zinc-500">Use letras maiúsculas, números e símbolos (ex: @, !, #)</p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Cadastrar"}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Já possui conta?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
