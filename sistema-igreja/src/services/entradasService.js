import { supabase } from '../lib/supabase'

export async function getEntradas(filtros = {}) {
  let query = supabase
    .from('entradas_financeiras')
    .select('*, membros(nome)')
    .order('data', { ascending: false })

  if (filtros.tipo) query = query.eq('tipo', filtros.tipo)
  if (filtros.dataInicio) query = query.gte('data', filtros.dataInicio)
  if (filtros.dataFim) query = query.lte('data', filtros.dataFim)

  return query
}

export async function createEntrada(entrada) {
  return supabase.from('entradas_financeiras').insert(entrada)
}

export async function deleteEntrada(id) {
  return supabase.from('entradas_financeiras').delete().eq('id', id)
}

export async function getCampanhas() {
  return supabase.from('campanhas').select('*').eq('ativa', true).order('nome')
}

export async function createCampanha(campanha) {
  return supabase.from('campanhas').insert(campanha).select().single()
}
