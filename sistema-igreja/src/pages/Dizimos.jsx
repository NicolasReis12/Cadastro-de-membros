import './Dizimos.css'
import { createDizimos, getDizimos, deleteDizimo } from '../services/dizimosService'
import { useState, useEffect, useContext } from 'react'
import { ToastContext } from '../App'

function Dizimos() {
  const { showToast } = useContext(ToastContext)
  
  const [modalAberto, setModalAberto] = useState(false)
  const [dizimos, setDizimos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const initialForm = {
    nome_membro: '',
    valor: '',
    data: '',
    status: ''
  }

  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    carregarDizimos()
  }, [])

  async function carregarDizimos() {
    setCarregando(true)
    try {
      const { data, error } = await getDizimos()
      if (error) {
        showToast('Erro ao carregar dízimos', 'error')
        return
      }
      if (data) setDizimos(data)
    } catch (err) {
      showToast('Erro ao carregar dízimos', 'error')
    } finally {
      setCarregando(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function abrirModal() {
    setForm(initialForm)
    setModalAberto(true)
  }

  async function cadastrarDizimos() {
    if (!form.nome_membro.trim() || !form.valor || !form.data) {
      showToast('Por favor, preencha todos os campos obrigatórios', 'error')
      return
    }

    setSalvando(true)
    try {
      const { error } = await createDizimos(form)

      if (error) {
        showToast(`Erro ao cadastrar: ${error.message}`, 'error')
        return
      }

      showToast('Dízimo cadastrado com sucesso', 'success')
      await carregarDizimos()
      setForm(initialForm)
      setModalAberto(false)
    } catch (err) {
      showToast('Erro ao cadastrar dízimo', 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function excluirDizimo(id) {
    if (!window.confirm('Tem certeza que deseja excluir este dízimo?')) return

    try {
      const { error } = await deleteDizimo(id)

      if (error) {
        showToast(`Erro ao deletar: ${error.message}`, 'error')
        return
      }

      showToast('Dízimo excluído com sucesso', 'success')
      await carregarDizimos()
    } catch (err) {
      showToast('Erro ao excluir dízimo', 'error')
    }
  }

  function formatarDataBR(data) {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR')
  }

  function formatarValor(valor) {
    if (!valor) return 'R$ 0,00'
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  if (carregando && dizimos.length === 0) {
    return (
      <div className="page-dizimos">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando dízimos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-dizimos">
      <div className="dizimos-header">
        <h2>💰 Cadastro de dízimos</h2>
        <button onClick={abrirModal} className="btn-cadastrar" disabled={carregando}>
          + Cadastrar dízimo
        </button>
      </div>

      {dizimos.length === 0 ? (
        <div className="sem-resultados">
          <p>Nenhum dízimo registrado</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome do membro</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {dizimos.map(d => (
                <tr key={d.id}>
                  <td>{d.nome_membro}</td>
                  <td className="valor">{formatarValor(d.valor)}</td>
                  <td>{formatarDataBR(d.data)}</td>
                  <td>
                    <span className={`status-badge ${d.status === 'pago' ? 'pago' : 'pendente'}`}>
                      {d.status === 'pago' ? '✓ Pago' : '⏱ Pendente'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn-editar">Editar</button>
                      <button onClick={() => excluirDizimo(d.id)} className="btn-excluir">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Cadastrar dízimo</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Nome do membro *</label>
                <input
                  name="nome_membro"
                  value={form.nome_membro}
                  onChange={handleChange}
                  placeholder="Nome do membro"
                />
              </div>

              <div className="form-group">
                <label>Valor *</label>
                <input
                  name="valor"
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={handleChange}
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  name="data"
                  value={form.data}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setModalAberto(false)} disabled={salvando}>
                Cancelar
              </button>
              <button className="btn-salvar" onClick={cadastrarDizimos} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dizimos