import { supabase } from '../lib/supabase'

export async function getOfertas({ dataInicio, dataFim } = {}) {
  let query = supabase
    .from('ofertas')
    .select('*, membros(nome)')
    .order('data', { ascending: false })
  if (dataInicio) query = query.gte('data', dataInicio)
  if (dataFim)    query = query.lte('data', dataFim)
  return query
}

export async function createOferta(oferta) {
  return supabase.from('ofertas').insert(oferta)
}

export async function deleteOferta(id) {
  return supabase.from('ofertas').delete().eq('id', id)
}
