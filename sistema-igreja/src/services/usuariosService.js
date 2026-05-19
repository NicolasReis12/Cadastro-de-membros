import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function createTempClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function getUsuarios(igrejaId) {
  const { data, error } = await supabase
    .from('usuarios_igreja')
    .select('*')
    .eq('igreja_id', igrejaId)
    .eq('ativo', true)
    .order('nome')
  return { data, error }
}

export async function createUsuario({ nome, email, senha, igrejaId, permissoes, isSubAdmin = false }) {
  const tempClient = createTempClient()
  const { data: authData, error: authError } = await tempClient.auth.signUp({
    email,
    password: senha,
  })

  if (authError) return { data: null, error: authError }

  if (!authData?.user?.id) {
    return {
      data: null,
      error: new Error(
        'Usuário criado mas ID não retornado. Verifique se a confirmação de email está desabilitada no Supabase.'
      ),
    }
  }

  const { data, error } = await supabase
    .from('usuarios_igreja')
    .insert({
      auth_user_id: authData.user.id,
      igreja_id: igrejaId,
      nome,
      email,
      is_admin: isSubAdmin,
      permissoes,
    })
    .select()
    .single()

  return { data, error }
}

export async function updateUsuario(id, { nome, is_admin, permissoes }) {
  const { data, error } = await supabase
    .from('usuarios_igreja')
    .update({ nome, is_admin, permissoes })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteUsuario(id) {
  const { data, error } = await supabase
    .from('usuarios_igreja')
    .update({ ativo: false })
    .eq('id', id)
  return { data, error }
}
