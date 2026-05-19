import { useState, useEffect, useContext } from 'react'
import { getOfertas, createOferta, deleteOferta } from '../services/ofertasService'
import { getMembros } from '../services/membrosService'
import { ToastContext } from '../App'
import { useAuth } from '../contexts/AuthContext'
import { convertDDMMYYYYtoYYYYMMDD, validateDataBR, isDataFutura, formatarDataBR } from '../utils/validation'
import './Entradas.css'

const FORMAS = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao: 'Cartão',
  transferencia: 'Transferência'
}

const initialForm = {
  membro_id: '',
  membro_nome: '',
  valor: '',
  data: '',
  forma_pagamento: 'dinheiro',
  descricao: ''
}

function Ofertas() {
  const { showToast } = useContext(ToastContext)
  const { igreja } = useAuth()

  const [ofertas, setOfertas] = useState([])
  const [membros, setMembros] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [erros, setErros] = useState({})
  const [form, setForm] = useState(initialForm)

  useEffect(() => { carregarTudo() }, [])

  async function carregarTudo() {
    setCarregando(true)
    try {
      const [ofertasRes, membrosRes] = await Promise.all([getOfertas(), getMembros()])
      if (!ofertasRes.error) setOfertas(ofertasRes.data || [])
      else showToast('Erro ao carregar ofertas: ' + ofertasRes.error.message, 'error')
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

  async function salvar() {
    const novosErros = {}
    if (!form.valor || parseFloat(form.valor) <= 0) novosErros.valor = 'Informe um valor maior que zero'
    if (!form.data.trim()) {
      novosErros.data = 'Data é obrigatória'
    } else if (!validateDataBR(form.data)) {
      novosErros.data = 'Data inválida (DD/MM/AAAA)'
    } else if (isDataFutura(convertDDMMYYYYtoYYYYMMDD(form.data))) {
      novosErros.data = 'Data não pode ser no futuro'
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      showToast('Corrija os campos antes de salvar', 'error')
      return
    }

    setSalvando(true)
    try {
      const dados = {
        membro_id: form.membro_id || null,
        nome_membro: form.membro_nome.trim() || null,
        valor: parseFloat(form.valor),
        data: convertDDMMYYYYtoYYYYMMDD(form.data),
        forma_pagamento: form.forma_pagamento,
        descricao: form.descricao || null,
        igreja_id: igreja?.id
      }

      const { error } = await createOferta(dados)
      if (error) { showToast('Erro ao registrar: ' + error.message, 'error'); return }

      showToast('Oferta registrada com sucesso', 'success')
      await carregarTudo()
      setForm(initialForm)
      setErros({})
      setModalAberto(false)
    } catch {
      showToast('Erro ao registrar oferta', 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(id) {
    if (!window.confirm('Excluir esta oferta?')) return
    try {
      const { error } = await deleteOferta(id)
      if (error) { showToast('Erro ao excluir: ' + error.message, 'error'); return }
      showToast('Oferta excluída com sucesso', 'success')
      setOfertas(prev => prev.filter(o => o.id !== id))
    } catch {
      showToast('Erro ao excluir', 'error')
    }
  }

  function formatarValor(v) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const hoje = new Date()
  const totalGeral = ofertas.reduce((s, o) => s + parseFloat(o.valor || 0), 0)
  const totalMes = ofertas
    .filter(o => {
      const [ano, mes] = o.data.split('-').map(Number)
      return ano === hoje.getFullYear() && mes === (hoje.getMonth() + 1)
    })
    .reduce((s, o) => s + parseFloat(o.valor || 0), 0)

  if (carregando && ofertas.length === 0) {
    return (
      <div className="page-entradas">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando ofertas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-entradas">

      <div className="entradas-header">
        <div>
          <h2>Registro de Ofertas</h2>
          <p className="entradas-subtitulo">{ofertas.length} {ofertas.length === 1 ? 'registro' : 'registros'}</p>
        </div>
        <button onClick={abrirModal} className="btn-cadastrar" disabled={carregando}>
          + Registrar oferta
        </button>
      </div>

      <div className="totais-row">
        <div className="total-card total-mes">
          <span className="total-label">Ofertas este mês</span>
          <span className="total-valor">{formatarValor(totalMes)}</span>
        </div>
        <div className="total-card total-geral">
          <span className="total-label">Total geral</span>
          <span className="total-valor">{formatarValor(totalGeral)}</span>
        </div>
      </div>

      {ofertas.length === 0 ? (
        <div className="sem-resultados"><p>Nenhuma oferta registrada</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome</th>
                <th>Forma</th>
                <th>Observação</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map(o => (
                <tr key={o.id}>
                  <td>{formatarDataBR(o.data)}</td>
                  <td>{o.membros?.nome || o.nome_membro || <span className="texto-anonimo">—</span>}</td>
                  <td>{FORMAS[o.forma_pagamento] || o.forma_pagamento}</td>
                  <td>{o.descricao || <span className="texto-anonimo">—</span>}</td>
                  <td className="valor">{formatarValor(o.valor)}</td>
                  <td>
                    <button onClick={() => excluir(o.id)} className="btn-excluir">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={ev => ev.stopPropagation()}>
            <h3>Registrar Oferta</h3>

            <div className="form-grid">
              <div className="form-group full">
                <label>Nome do irmão</label>
                <input
                  name="membro_nome"
                  value={form.membro_nome}
                  onChange={handleChange}
                  list="lista-membros-oferta"
                  placeholder="Digite o nome..."
                  autoComplete="off"
                />
                <datalist id="lista-membros-oferta">
                  {membros.map(m => <option key={m.id} value={m.nome} />)}
                </datalist>
                {form.membro_nome && !form.membro_id && (
                  <span className="aviso-texto">Não cadastrado — nome salvo como texto livre</span>
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

              <div className="form-group full">
                <label>Forma de pagamento</label>
                <select name="forma_pagamento" value={form.forma_pagamento} onChange={handleChange}>
                  {Object.entries(FORMAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div className="form-group full">
                <label>Observação</label>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setModalAberto(false)} disabled={salvando}>Cancelar</button>
              <button className="btn-salvar" onClick={salvar} disabled={salvando || Object.keys(erros).length > 0}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ofertas
