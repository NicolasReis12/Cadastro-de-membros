import { supabase } from '../lib/supabase'

export async function getOfertasEspeciais({ dataInicio, dataFim } = {}) {
  let query = supabase
    .from('ofertas_especiais')
    .select('*, membros(nome)')
    .order('data', { ascending: false })
  if (dataInicio) query = query.gte('data', dataInicio)
  if (dataFim)    query = query.lte('data', dataFim)
  return query
}

export async function createOfertaEspecial(oferta) {
  return supabase.from('ofertas_especiais').insert(oferta)
}

export async function deleteOfertaEspecial(id) {
  return supabase.from('ofertas_especiais').delete().eq('id', id)
}
