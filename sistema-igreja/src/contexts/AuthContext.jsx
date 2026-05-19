import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

const ALL_PERMISSIONS = {
  dashboard: true,
  membros: true,
  aniversariantes: true,
  entradas: true,
  ofertas: true,
  ofertas_especiais: true,
  relatorios: true,
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [igreja, setIgreja] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [permissoes, setPermissoes] = useState({})
  const [usuarioIgreja, setUsuarioIgreja] = useState(null)
  const [loading, setLoading] = useState(true)

  async function carregarUsuario(userId) {
    // Verifica se é o dono da igreja
    const { data: igrejaData } = await supabase
      .from('igrejas')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (igrejaData) {
      setIgreja(igrejaData)
      setIsOwner(true)
      setIsAdmin(true)
      setPermissoes(ALL_PERMISSIONS)
      setUsuarioIgreja(null)
      return
    }

    // Verifica se é um sub-usuário ativo
    const { data: subUser } = await supabase
      .from('usuarios_igreja')
      .select('*')
      .eq('auth_user_id', userId)
      .eq('ativo', true)
      .maybeSingle()

    if (subUser) {
      const { data: igrejaDoSubUser } = await supabase
        .from('igrejas')
        .select('*')
        .eq('id', subUser.igreja_id)
        .maybeSingle()

      setIgreja(igrejaDoSubUser)
      setIsOwner(false)
      setIsAdmin(subUser.is_admin)
      setPermissoes(subUser.permissoes)
      setUsuarioIgreja(subUser)
      return
    }

    // Usuário sem vínculo ainda (ex: recém cadastrado, aguardando inserção da igreja)
    setIgreja(null)
    setIsOwner(false)
    setIsAdmin(false)
    setPermissoes({})
    setUsuarioIgreja(null)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        setLoading(true)
        await carregarUsuario(session.user.id)
        setLoading(false)
      } else {
        setIgreja(null)
        setIsOwner(false)
        setIsAdmin(false)
        setPermissoes({})
        setUsuarioIgreja(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user,
        igreja,
        isAdmin,
        isOwner,
        permissoes,
        usuarioIgreja,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
