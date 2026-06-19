import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useUser() {
  const supabase = createClient()

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) return null
      return data.user
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle() // retorna null (não erro) se o perfil ainda não existir
      
      if (error) throw error
      return data // null se não encontrado, objeto se encontrado
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    retry: false, // não tenta de novo em caso de erro real
  })

  return {
    user,
    profile,
    isLoading: isUserLoading || isProfileLoading,
    isAuthenticated: !!user
  }
}
