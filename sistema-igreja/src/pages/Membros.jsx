import { createMembro, getMembros, deleteMembro, updateMembro } from '../services/membrosService'
import './Membros.css'
import { useState, useEffect, useContext } from 'react'
import { validateForm, validateEmail, validateCPF, validatePhone, convertDDMMYYYYtoYYYYMMDD, formatarDataBR, validateDataBR, isDataFutura } from '../utils/validation'
import { ToastContext } from '../App'

function Membros() {
  const { showToast } = useContext(ToastContext)
  
  const [modalAberto, setModalAberto] = useState(false)
  const [membros, setMembros] = useState([])
  const [membrosFiltrados, setMembrosFiltrados] = useState([])
  const [editando, setEditando] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  
  // Busca e filtro
  const [busca, setBusca] = useState('')
  const [filtroFalecido, setFiltroFalecido] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')

  // Validação
  const [erros, setErros] = useState({})

  const initialForm = {
    nome: '', email: '', telefone: '', cpf: '',
    data_nascimento: '', cep: '', logradouro: '',
    numero: '', complemento: '', bairro: '', cidade: '', uf: '',
    falecido: '', data_da_morte: ''
  }

  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    carregarMembros()
  }, [])

  // Filtro automático quando mudanças ocorrem
  useEffect(() => {
    filtrarMembros()
  }, [membros, busca, filtroFalecido, filtroCidade])

  const validarCampo = (name, value) => {
    setErros(prev => {
      const next = { ...prev }
      const valor = value?.toString().trim() ?? ''

      if (name === 'email' && valor && !validateEmail(valor)) {
        next[name] = 'Email inválido'
      } else if (name === 'cpf' && valor && !validateCPF(valor)) {
        next[name] = 'CPF inválido (11 dígitos)'
      } else if (name === 'telefone' && valor && !validatePhone(valor)) {
        next[name] = 'Telefone inválido (10 ou 11 dígitos)'
      } else if (name === 'data_nascimento' && valor) {
        const dataNasc = new Date(valor)
        if (dataNasc > new Date()) {
          next[name] = 'Data não pode ser no futuro'
        } else {
          delete next[name]
        }
      } else if (name === 'data_da_morte' && valor) {
        const dataMorte = new Date(valor)
        if (dataMorte > new Date()) {
          next[name] = 'Data não pode ser no futuro'
        } else {
          delete next[name]
        }
      } else {
        delete next[name]
      }

      return next
    })
  }

  async function carregarMembros() {
    setCarregando(true)
    try {
      const { data, error } = await getMembros()
      if (error) {
        showToast('Erro ao carregar membros', 'error')
        return
      }
      if (data) setMembros(data)
    } catch (err) {
      showToast('Erro ao carregar membros', 'error')
    } finally {
      setCarregando(false)
    }
  }

  function filtrarMembros() {
    let resultado = membros

    // Filtro por busca (nome, email, cpf, telefone)
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase()
      const buscaDigits = busca.replace(/\D/g, '')
      resultado = resultado.filter(m => {
        const cpf = (m.cpf || '').replace(/\D/g, '')
        const telefone = (m.telefone || '').replace(/\D/g, '')

        return (
          m.nome?.toLowerCase().includes(buscaLower) ||
          m.email?.toLowerCase().includes(buscaLower) ||
          (buscaDigits && cpf.includes(buscaDigits)) ||
          (buscaDigits && telefone.includes(buscaDigits))
        )
      })
    }

    // Filtro por falecido
    if (filtroFalecido) {
      resultado = resultado.filter(m => m.falecido === filtroFalecido)
    }

    // Filtro por cidade
    if (filtroCidade) {
      resultado = resultado.filter(m => m.cidade === filtroCidade)
    }

    setMembrosFiltrados(resultado)
  }

  async function handleChange(e) {
    const { name, value } = e.target
    let novoValor = value

    // Aplicar máscara DD/MM/YYYY nos campos de data
    if (name === 'data_nascimento' || name === 'data_da_morte') {
      const apenasNumeros = value.replace(/\D/g, '')
      let dataFormatada = apenasNumeros
      
      if (apenasNumeros.length <= 2) {
        dataFormatada = apenasNumeros
      } else if (apenasNumeros.length <= 4) {
        dataFormatada = apenasNumeros.slice(0, 2) + '/' + apenasNumeros.slice(2)
      } else if (apenasNumeros.length <= 8) {
        dataFormatada = apenasNumeros.slice(0, 2) + '/' + apenasNumeros.slice(2, 4) + '/' + apenasNumeros.slice(4, 8)
      }
      
      novoValor = dataFormatada
      
      // Validar data quando completa
      if (apenasNumeros.length === 8) {
        if (!validateDataBR(dataFormatada)) {
          setErros(prev => ({ ...prev, [name]: 'Data inválida (DD/MM/YYYY)' }))
        } else if (isDataFutura(convertDDMMYYYYtoYYYYMMDD(dataFormatada))) {
          setErros(prev => ({ ...prev, [name]: 'A data não pode ser no futuro' }))
        } else {
          setErros(prev => {
            const newErros = { ...prev }
            delete newErros[name]
            return newErros
          })
        }
      }
    }

    const novoForm = { ...form, [name]: novoValor }
    setForm(novoForm)
    
    // Validar campo se não for data (datas são validadas acima)
    if (name !== 'data_nascimento' && name !== 'data_da_morte') {
      validarCampo(name, novoValor)
    }

    // CEP automático
    if (name === 'cep') {
      const cepLimpo = value.replace(/\D/g, '')
      if (cepLimpo.length !== 8) return

      try {
        setCarregando(true)
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        const data = await response.json()

        if (data.erro) {
          showToast('CEP não encontrado', 'warning')
          return
        }

        setForm(f => ({
          ...f,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf
        }))
        showToast('Endereço preenchido automaticamente', 'success')
      } catch {
        showToast('Erro ao buscar CEP', 'error')
      } finally {
        setCarregando(false)
      }
    }
  }

  function abrirCadastro() {
    setForm(initialForm)
    setErros({})
    setEditando(false)
    setModalAberto(true)
  }

  function abrirEditar(membro) {
    // Converter datas de YYYY-MM-DD para DD/MM/YYYY
    const membroComDatasFormatadas = { ...membro }
    if (membro.data_nascimento && membro.data_nascimento.includes('-')) {
      const [ano, mes, dia] = membro.data_nascimento.split('-')
      membroComDatasFormatadas.data_nascimento = `${dia}/${mes}/${ano}`
    }
    if (membro.data_da_morte && membro.data_da_morte.includes('-')) {
      const [ano, mes, dia] = membro.data_da_morte.split('-')
      membroComDatasFormatadas.data_da_morte = `${dia}/${mes}/${ano}`
    }
    
    setForm(membroComDatasFormatadas)
    setErros({})
    setEditando(true)
    setModalAberto(true)
  }

  async function salvarMembro() {
    const novosErros = {}

    // Validar datas
    if (form.data_nascimento && !validateDataBR(form.data_nascimento)) {
      novosErros.data_nascimento = 'Data de nascimento inválida'
    }
    if (form.data_da_morte && !validateDataBR(form.data_da_morte)) {
      novosErros.data_da_morte = 'Data de falecimento inválida'
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      showToast('Por favor, corrija os erros nas datas', 'error')
      return
    }

    setSalvando(true)
    try {
      // Converter datas de DD/MM/YYYY para YYYY-MM-DD
      const formComDatasConvertidas = { ...form }
      if (form.data_nascimento && form.data_nascimento.includes('/')) {
        formComDatasConvertidas.data_nascimento = convertDDMMYYYYtoYYYYMMDD(form.data_nascimento)
      }
      if (form.data_da_morte && form.data_da_morte.includes('/')) {
        formComDatasConvertidas.data_da_morte = convertDDMMYYYYtoYYYYMMDD(form.data_da_morte)
      }

      // Limpar campos opcionais vazios para null
      const formLimpo = Object.keys(formComDatasConvertidas).reduce((acc, key) => {
        const valor = formComDatasConvertidas[key]
        acc[key] = valor === '' || valor === null ? null : valor
        return acc
      }, {})

      let error

      if (editando) {
        const response = await updateMembro(form.id, formLimpo)
        error = response.error
      } else {
        const { id, ...novoForm } = formLimpo
        const response = await createMembro(novoForm)
        error = response.error
      }

      if (error) {
        showToast(`Erro ao ${editando ? 'atualizar' : 'cadastrar'} membro: ${error.message}`, 'error')
        return
      }

      showToast(editando ? 'Membro atualizado com sucesso' : 'Membro cadastrado com sucesso', 'success')
      await carregarMembros()
      setModalAberto(false)
      setEditando(false)
      setForm(initialForm)
      setErros({})
    } catch (err) {
      showToast('Erro ao salvar membro', 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function excluirMembro(id) {
    if (!window.confirm('Tem certeza que deseja excluir este membro?')) return

    try {
      const { error } = await deleteMembro(id)

      if (error) {
        showToast(`Erro ao deletar membro: ${error.message}`, 'error')
        return
      }

      showToast('Membro excluído com sucesso', 'success')
      await carregarMembros()
    } catch (err) {
      showToast('Erro ao excluir membro', 'error')
    }
  }

  function formatarDataBR(data) {
    if (!data) return ''
    
    // Se já está no formato DD/MM/YYYY, retornar como está
    if (data.includes('/')) return data
    
    try {
      // Parse data no formato YYYY-MM-DD sem usar new Date para evitar problemas de timezone
      const [ano, mes, dia] = data.split('-')
      if (!ano || !mes || !dia) return ''
      
      return `${dia}/${mes}/${ano}`
    } catch {
      return ''
    }
  }

  // Obter cidades únicas para filtro
  const cidades = [...new Set(membros.filter(m => m.cidade).map(m => m.cidade))].sort()

  if (carregando && membros.length === 0) {
    return (
      <div className="page-membros">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando membros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-membros">
      <div className="membros-header">
        <h2 className="text-cadastro">Cadastro de membros</h2>
        <button onClick={abrirCadastro} className="btn-cadastrar" disabled={carregando}>
          + Cadastrar membro
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros">
        <div className="filtro-item">
          <input
            type="text"
            placeholder="🔍 Buscar por nome, email, CPF ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input-busca"
          />
        </div>

        <div className="filtro-item">
          <select value={filtroFalecido} onChange={(e) => setFiltroFalecido(e.target.value)} className="select-filtro">
            <option value="">Todos (Falecido)</option>
            <option value="Sim">Falecidos</option>
            <option value="Não">Ativos</option>
          </select>
        </div>

        <div className="filtro-item">
          <select value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)} className="select-filtro">
            <option value="">Todas as cidades</option>
            {cidades.map(cidade => (
              <option key={cidade} value={cidade}>{cidade}</option>
            ))}
          </select>
        </div>

        <div className="filtro-info">
          Mostrando {membrosFiltrados.length} de {membros.length} membros
        </div>
      </div>

      {/* Tabela */}
      {membrosFiltrados.length === 0 ? (
        <div className="sem-resultados">
          <p>Nenhum membro encontrado</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Data de nascimento</th>
                <th>CPF</th>
                <th>Cidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {membrosFiltrados.map(m => (
                <tr key={m.id}>
                  <td>{m.nome}</td>
                  <td>{m.email}</td>
                  <td>{m.telefone}</td>
                  <td>{formatarDataBR(m.data_nascimento)}</td>
                  <td>{m.cpf}</td>
                  <td>{m.cidade}</td>
                  <td>
                    <span className={`status ${m.falecido === 'Sim' ? 'falecido' : 'ativo'}`}>
                      {m.falecido === 'Sim' ? '✕ Falecido' : '✓ Ativo'}
                    </span>
                  </td>

                  <td>
                    <div className="actions">
                      <button onClick={() => abrirEditar(m)} className="btn-editar">
                        Editar
                      </button>

                      <button onClick={() => excluirMembro(m.id)} className="btn-excluir">
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

      {/* Modal */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editando ? 'Editar membro' : 'Cadastrar membro'}</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Nome</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className={erros.nome ? 'input-error' : ''}
                />
                {erros.nome && <span className="error-text">{erros.nome}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={erros.email ? 'input-error' : ''}
                />
                {erros.email && <span className="error-text">{erros.email}</span>}
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className={erros.telefone ? 'input-error' : ''}
                />
                {erros.telefone && <span className="error-text">{erros.telefone}</span>}
              </div>

              <div className="form-group">
                <label>CPF</label>
                <input
                  name="cpf"
                  value={form.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  className={erros.cpf ? 'input-error' : ''}
                />
                {erros.cpf && <span className="error-text">{erros.cpf}</span>}
              </div>

              <div className="form-group">
                <label>Data de nascimento</label>
                <input
                  type="text"
                  name="data_nascimento"
                  value={form.data_nascimento}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  maxLength="11"
                  className={erros.data_nascimento ? 'input-error' : ''}
                />
                {erros.data_nascimento && <span className="error-text">{erros.data_nascimento}</span>}
              </div>

              <div className="form-group">
                <label>CEP</label>
                <input
                  name="cep"
                  value={form.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                />
              </div>

              <div className="form-group full">
                <label>Logradouro</label>
                <input name="logradouro" value={form.logradouro} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Número</label>
                <input name="numero" value={form.numero} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Complemento</label>
                <input name="complemento" value={form.complemento} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Bairro</label>
                <input name="bairro" value={form.bairro} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Cidade</label>
                <input
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  className={erros.cidade ? 'input-error' : ''}
                />
                {erros.cidade && <span className="error-text">{erros.cidade}</span>}
              </div>

              <div className="form-group">
                <label>UF</label>
                <input name="uf" value={form.uf} onChange={handleChange} maxLength="2" />
              </div>

              <div className="form-group">
                <label>Falecido</label>
                <select name="falecido" value={form.falecido} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {form.falecido === 'Sim' && (
                <div className="form-group">
                  <label>Data do Falecimento</label>
                  <input
                    type="text"
                    name="data_da_morte"
                    value={form.data_da_morte}
                    onChange={handleChange}
                    placeholder="DD/MM/YYYY"
                    maxLength="10"
                    className={erros.data_da_morte ? 'input-error' : ''}
                  />
                  {erros.data_da_morte && <span className="error-text">{erros.data_da_morte}</span>}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setModalAberto(false)} disabled={salvando}>
                Cancelar
              </button>

              <button className="btn-salvar" onClick={salvarMembro} disabled={salvando || Object.keys(erros).length > 0}>
                {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Membros