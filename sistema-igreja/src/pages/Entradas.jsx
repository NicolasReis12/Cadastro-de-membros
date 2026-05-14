import { useState, useEffect, useContext } from 'react'
import { getEntradas, createEntrada, deleteEntrada, getCampanhas, createCampanha } from '../services/entradasService'
import { getMembros } from '../services/membrosService'
import { ToastContext } from '../App'
import { convertDDMMYYYYtoYYYYMMDD, validateDataBR, isDataFutura, formatarDataBR } from '../utils/validation'
import './Entradas.css'

const TIPOS = {
  dizimo: 'Dízimo',
  oferta_geral: 'Oferta Geral',
  campanha: 'Campanha',
  venda_evento: 'Venda de Evento',
  doacao: 'Doação'
}

const FORMAS = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao: 'Cartão',
  transferencia: 'Transferência'
}

const initialForm = {
  tipo: 'dizimo',
  campanha: '',
  evento: '',
  membro_id: '',
  membro_nome: '',
  valor: '',
  data: '',
  forma_pagamento: 'dinheiro',
  descricao: ''
}

function Entradas() {
  const { showToast } = useContext(ToastContext)

  const [entradas, setEntradas] = useState([])
  const [campanhas, setCampanhas] = useState([])
  const [membros, setMembros] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalCampanha, setModalCampanha] = useState(false)
  const [erros, setErros] = useState({})
  const [tabelaNaoExiste, setTabelaNaoExiste] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [novaCampanha, setNovaCampanha] = useState({ nome: '', descricao: '', meta: '' })

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')

  useEffect(() => {
    carregarTudo()
  }, [])

  async function carregarTudo() {
    setCarregando(true)
    try {
      const [entradasRes, campanhasRes, membrosRes] = await Promise.all([
        getEntradas(),
        getCampanhas(),
        getMembros()
      ])

      if (entradasRes.error) {
        if (entradasRes.error.code === '42P01') {
          setTabelaNaoExiste(true)
        } else {
          showToast('Erro ao carregar entradas: ' + entradasRes.error.message, 'error')
        }
      } else {
        setEntradas(entradasRes.data || [])
      }

      if (!campanhasRes.error) setCampanhas(campanhasRes.data || [])
      if (!membrosRes.error) setMembros(membrosRes.data || [])
    } catch {
      showToast('Erro ao carregar dados', 'error')
    } finally {
      setCarregando(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target

    if (name === 'data') {
      const nums = value.replace(/\D/g, '')
      let fmt = nums
      if (nums.length > 2) fmt = nums.slice(0, 2) + '/' + nums.slice(2)
      if (nums.length > 4) fmt = nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4, 8)
      setForm(f => ({ ...f, data: fmt }))
      if (nums.length === 8) {
        if (!validateDataBR(fmt) || isDataFutura(convertDDMMYYYYtoYYYYMMDD(fmt))) {
          setErros(prev => ({ ...prev, data: 'Data inválida ou no futuro' }))
        } else {
          setErros(prev => { const e = { ...prev }; delete e.data; return e })
        }
      }
      return
    }

    if (name === 'membro_nome') {
      const membro = membros.find(m => m.nome === value)
      setForm(f => ({ ...f, membro_nome: value, membro_id: membro?.id || '' }))
      return
    }

    setForm(f => ({ ...f, [name]: value }))
    if (erros[name]) setErros(prev => { const e = { ...prev }; delete e[name]; return e })
  }

  function abrirModal() {
    setForm(initialForm)
    setErros({})
    setModalAberto(true)
  }

  async function salvarEntrada() {
    const novosErros = {}

    if (!form.valor || parseFloat(form.valor) <= 0) novosErros.valor = 'Valor deve ser maior que 0'
    if (!form.data.trim()) {
      novosErros.data = 'Data é obrigatória'
    } else if (!validateDataBR(form.data)) {
      novosErros.data = 'Data inválida (DD/MM/YYYY)'
    } else if (isDataFutura(convertDDMMYYYYtoYYYYMMDD(form.data))) {
      novosErros.data = 'Data não pode ser no futuro'
    }
    if (form.tipo === 'campanha' && !form.campanha) novosErros.campanha = 'Selecione uma campanha'
    if (form.tipo === 'venda_evento' && !form.evento.trim()) novosErros.evento = 'Informe o nome do evento'

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      showToast('Corrija os erros antes de salvar', 'error')
      return
    }

    setSalvando(true)
    try {
      const dados = {
        tipo: form.tipo,
        campanha: form.tipo === 'campanha' ? form.campanha : null,
        evento: form.tipo === 'venda_evento' ? form.evento : null,
        membro_id: form.membro_id || null,
        nome_membro: form.membro_nome.trim() || null,
        valor: parseFloat(form.valor),
        data: convertDDMMYYYYtoYYYYMMDD(form.data),
        forma_pagamento: form.forma_pagamento,
        descricao: form.descricao || null
      }

      const { error } = await createEntrada(dados)
      if (error) {
        showToast('Erro ao registrar entrada: ' + error.message, 'error')
        return
      }

      showToast('Entrada registrada com sucesso', 'success')
      await carregarTudo()
      setForm(initialForm)
      setErros({})
      setModalAberto(false)
    } catch {
      showToast('Erro ao registrar entrada', 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function excluirEntrada(id) {
    if (!window.confirm('Excluir esta entrada?')) return
    try {
      const { error } = await deleteEntrada(id)
      if (error) { showToast('Erro ao excluir: ' + error.message, 'error'); return }
      showToast('Entrada excluída com sucesso', 'success')
      setEntradas(prev => prev.filter(e => e.id !== id))
    } catch {
      showToast('Erro ao excluir entrada', 'error')
    }
  }

  async function salvarCampanha() {
    if (!novaCampanha.nome.trim()) {
      showToast('Nome da campanha é obrigatório', 'error')
      return
    }
    try {
      const dados = {
        nome: novaCampanha.nome.trim(),
        descricao: novaCampanha.descricao || null,
        meta: novaCampanha.meta ? parseFloat(novaCampanha.meta) : null,
        ativa: true
      }
      const { data, error } = await createCampanha(dados)
      if (error) { showToast('Erro ao criar campanha: ' + error.message, 'error'); return }
      showToast('Campanha criada com sucesso', 'success')
      setCampanhas(prev => [...prev, data])
      setForm(f => ({ ...f, campanha: data.nome }))
      setNovaCampanha({ nome: '', descricao: '', meta: '' })
      setModalCampanha(false)
    } catch {
      showToast('Erro ao criar campanha', 'error')
    }
  }

  const entradasFiltradas = entradas.filter(e => {
    if (filtroTipo && e.tipo !== filtroTipo) return false
    if (filtroDataInicio && e.data < filtroDataInicio) return false
    if (filtroDataFim && e.data > filtroDataFim) return false
    return true
  })

  const totalFiltrado = entradasFiltradas.reduce((sum, e) => sum + parseFloat(e.valor || 0), 0)

  const totaisPorTipo = Object.keys(TIPOS).reduce((acc, tipo) => {
    acc[tipo] = entradasFiltradas
      .filter(e => e.tipo === tipo)
      .reduce((sum, e) => sum + parseFloat(e.valor || 0), 0)
    return acc
  }, {})

  function formatarValor(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function tipoCssClass(tipo) {
    const map = { dizimo: 'tipo-dizimo', oferta_geral: 'tipo-oferta', campanha: 'tipo-campanha', venda_evento: 'tipo-venda', doacao: 'tipo-doacao' }
    return map[tipo] || ''
  }

  if (tabelaNaoExiste) {
    return (
      <div className="page-entradas">
        <div className="aviso-setup">
          <h2>Configuração necessária</h2>
          <p>A tabela <code>entradas_financeiras</code> ainda não foi criada no Supabase.</p>
          <p>Execute o SQL disponível em <code>supabase/schema-updates.sql</code> no seu projeto Supabase para habilitar esta funcionalidade.</p>
        </div>
      </div>
    )
  }

  if (carregando && entradas.length === 0) {
    return (
      <div className="page-entradas">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando entradas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-entradas">
      <div className="entradas-header">
        <h2>Entradas Financeiras</h2>
        <button onClick={abrirModal} className="btn-cadastrar" disabled={carregando}>
          + Registrar entrada
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="resumo-grid">
        <div className="resumo-card resumo-total">
          <div className="resumo-label">Total (filtrado)</div>
          <div className="resumo-valor">{formatarValor(totalFiltrado)}</div>
          <div className="resumo-count">{entradasFiltradas.length} registros</div>
        </div>
        {Object.entries(TIPOS).map(([tipo, label]) => (
          totaisPorTipo[tipo] > 0 ? (
            <div key={tipo} className={`resumo-card ${tipoCssClass(tipo)}`}>
              <div className="resumo-label">{label}</div>
              <div className="resumo-valor">{formatarValor(totaisPorTipo[tipo])}</div>
            </div>
          ) : null
        ))}
      </div>

      {/* Filtros */}
      <div className="filtros">
        <div className="filtro-item">
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="select-filtro">
            <option value="">Todos os tipos</option>
            {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="filtro-item">
          <input
            type="date"
            value={filtroDataInicio}
            onChange={e => setFiltroDataInicio(e.target.value)}
            className="input-data-filtro"
            title="Data início"
          />
        </div>
        <div className="filtro-item">
          <input
            type="date"
            value={filtroDataFim}
            onChange={e => setFiltroDataFim(e.target.value)}
            className="input-data-filtro"
            title="Data fim"
          />
        </div>
        {(filtroTipo || filtroDataInicio || filtroDataFim) && (
          <button
            className="btn-limpar-filtros"
            onClick={() => { setFiltroTipo(''); setFiltroDataInicio(''); setFiltroDataFim('') }}
          >
            Limpar filtros
          </button>
        )}
        <div className="filtro-info">{entradasFiltradas.length} de {entradas.length} entradas</div>
      </div>

      {/* Tabela */}
      {entradasFiltradas.length === 0 ? (
        <div className="sem-resultados">
          <p>Nenhuma entrada encontrada</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Membro</th>
                <th>Descrição</th>
                <th>Forma</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {entradasFiltradas.map(e => (
                <tr key={e.id}>
                  <td>{formatarDataBR(e.data)}</td>
                  <td>
                    <span className={`badge-tipo ${tipoCssClass(e.tipo)}`}>
                      {TIPOS[e.tipo] || e.tipo}
                      {e.campanha ? ` — ${e.campanha}` : ''}
                      {e.evento ? ` — ${e.evento}` : ''}
                    </span>
                  </td>
                  <td>{e.membros?.nome || e.nome_membro || <span className="texto-anonimo">Anônimo</span>}</td>
                  <td>{e.descricao || '—'}</td>
                  <td>{FORMAS[e.forma_pagamento] || e.forma_pagamento}</td>
                  <td className="valor">{formatarValor(e.valor)}</td>
                  <td>
                    <button onClick={() => excluirEntrada(e.id)} className="btn-excluir">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de registro */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={ev => ev.stopPropagation()}>
            <h3>Registrar Entrada Financeira</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Tipo de Entrada <span className="required-star">*</span></label>
                <select name="tipo" value={form.tipo} onChange={handleChange}>
                  {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              {form.tipo === 'campanha' && (
                <div className="form-group">
                  <label>Campanha <span className="required-star">*</span></label>
                  <div className="campanha-row">
                    <select name="campanha" value={form.campanha} onChange={handleChange} className={erros.campanha ? 'input-error' : ''}>
                      <option value="">Selecione uma campanha</option>
                      {campanhas.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                    <button type="button" className="btn-nova-campanha" onClick={() => setModalCampanha(true)}>+ Nova</button>
                  </div>
                  {erros.campanha && <span className="error-text">{erros.campanha}</span>}
                </div>
              )}

              {form.tipo === 'venda_evento' && (
                <div className="form-group">
                  <label>Nome do Evento <span className="required-star">*</span></label>
                  <input
                    name="evento"
                    value={form.evento}
                    onChange={handleChange}
                    placeholder="Ex: Bazar, Jantar de confraternização"
                    className={erros.evento ? 'input-error' : ''}
                  />
                  {erros.evento && <span className="error-text">{erros.evento}</span>}
                </div>
              )}

              <div className="form-group">
                <label>Nome do irmão (opcional)</label>
                <input
                  name="membro_nome"
                  value={form.membro_nome}
                  onChange={handleChange}
                  list="lista-membros"
                  placeholder="Digite o nome..."
                  autoComplete="off"
                />
                <datalist id="lista-membros">
                  {membros.map(m => <option key={m.id} value={m.nome} />)}
                </datalist>
                {form.membro_nome && !form.membro_id && (
                  <span className="aviso-texto">Não cadastrado — nome será salvo como texto livre</span>
                )}
              </div>

              <div className="form-group">
                <label>Valor (R$) <span className="required-star">*</span></label>
                <input
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor}
                  onChange={handleChange}
                  placeholder="0,00"
                  className={erros.valor ? 'input-error' : ''}
                />
                {erros.valor && <span className="error-text">{erros.valor}</span>}
              </div>

              <div className="form-group">
                <label>Data <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="data"
                  value={form.data}
                  onChange={handleChange}
                  placeholder="DD/MM/AAAA"
                  maxLength="10"
                  className={erros.data ? 'input-error' : ''}
                />
                {erros.data && <span className="error-text">{erros.data}</span>}
              </div>

              <div className="form-group">
                <label>Forma de Pagamento</label>
                <select name="forma_pagamento" value={form.forma_pagamento} onChange={handleChange}>
                  {Object.entries(FORMAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div className="form-group full">
                <label>Descrição (opcional)</label>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Observações adicionais"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setModalAberto(false)} disabled={salvando}>
                Cancelar
              </button>
              <button className="btn-salvar" onClick={salvarEntrada} disabled={salvando || Object.keys(erros).length > 0}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Campanha */}
      {modalCampanha && (
        <div className="modal-overlay" onClick={() => setModalCampanha(false)}>
          <div className="modal modal-sm" onClick={ev => ev.stopPropagation()}>
            <h3>Nova Campanha</h3>
            <div className="form-grid">
              <div className="form-group full">
                <label>Nome <span className="required-star">*</span></label>
                <input
                  value={novaCampanha.nome}
                  onChange={e => setNovaCampanha(c => ({ ...c, nome: e.target.value }))}
                  placeholder="Ex: Construção, Missões"
                />
              </div>
              <div className="form-group full">
                <label>Descrição</label>
                <input
                  value={novaCampanha.descricao}
                  onChange={e => setNovaCampanha(c => ({ ...c, descricao: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Meta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novaCampanha.meta}
                  onChange={e => setNovaCampanha(c => ({ ...c, meta: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setModalCampanha(false)}>Cancelar</button>
              <button className="btn-salvar" onClick={salvarCampanha}>Criar Campanha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Entradas
