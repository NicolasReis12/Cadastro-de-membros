import { createMembro, getMembros, deleteMembro, updateMembro } from '../services/membrosService'
import './Membros.css'
import { useState, useEffect, useContext } from 'react'
import { validateForm, validateEmail, validateCPF, validatePhone, convertDDMMYYYYtoYYYYMMDD, formatarDataBR, validateDataBR, isDataFutura } from '../utils/validation'
import { ToastContext } from '../App'
import { useAuth } from '../contexts/AuthContext'

function Membros() {
  const { showToast } = useContext(ToastContext)
  const { igreja } = useAuth()
  
  const [modalAberto, setModalAberto] = useState(false)
  const [membros, setMembros] = useState([])
  const [membrosFiltrados, setMembrosFiltrados] = useState([])
  const [editando, setEditando] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  
  // Busca e filtro
  const [busca, setBusca] = useState('')
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [filtroStatusMembro, setFiltroStatusMembro] = useState('')
  const [filtroNascimentoInicio, setFiltroNascimentoInicio] = useState('')
  const [filtroNascimentoFim, setFiltroNascimentoFim] = useState('')

  // Validação
  const [erros, setErros] = useState({})

  const initialForm = {
    nome: '', email: '', telefone: '', cpf: '',
    data_nascimento: '', cep: '', logradouro: '',
    numero: '', complemento: '', bairro: '', cidade: '', uf: '',
    falecido: '', data_da_morte: '',
    // Novos campos da ficha
    estado_civil: '', nome_esposo: '',
    nome_pai: '', nome_mae: '', grau_instrucao: '', profissao: '',
    documento_identidade: '', religiao_anterior: '',
    recebeu_cura_libertacao: '', descricao_cura_libertacao: '',
    parentes_na_igreja: '', nome_parentes_igreja: '',
    data_conversao: '', data_batismo: '', ministro_oficiante: '',
    batizado_espirito_santo: '', data_batismo_espirito: '',
    observacoes: '',
    funcao: 'MEMBRO',
    status_membro: 'Ativo'
  }

  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    carregarMembros()
  }, [])

  // Filtro automático quando mudanças ocorrem
  useEffect(() => {
    filtrarMembros()
  }, [membros, busca, filtroFuncao, filtroStatusMembro, filtroNascimentoInicio, filtroNascimentoFim])

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

    // Filtro por função
    if (filtroFuncao) {
      resultado = resultado.filter(m => (m.funcao || 'MEMBRO') === filtroFuncao)
    }

    // Filtro por status do membro
    if (filtroStatusMembro) {
      resultado = resultado.filter(m => (m.status_membro || 'Ativo') === filtroStatusMembro)
    }

    // Filtro por data de nascimento
    if (filtroNascimentoInicio) {
      resultado = resultado.filter(m => m.data_nascimento && m.data_nascimento >= filtroNascimentoInicio)
    }
    if (filtroNascimentoFim) {
      resultado = resultado.filter(m => m.data_nascimento && m.data_nascimento <= filtroNascimentoFim)
    }

    setMembrosFiltrados(resultado)
  }

  async function handleChange(e) {
    const { name, value } = e.target
    let novoValor = value

    // Aplicar máscara DD/MM/YYYY nos campos de data
    const camposData = ['data_nascimento', 'data_da_morte', 'data_conversao', 'data_batismo', 'data_batismo_espirito']
    if (camposData.includes(name)) {
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
    const camposData2 = ['data_nascimento', 'data_da_morte', 'data_conversao', 'data_batismo', 'data_batismo_espirito']
    if (!camposData2.includes(name)) {
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
    const camposData = ['data_nascimento', 'data_da_morte', 'data_conversao', 'data_batismo', 'data_batismo_espirito']
    
    camposData.forEach(campo => {
      if (membro[campo] && membro[campo].includes('-')) {
        const [ano, mes, dia] = membro[campo].split('-')
        membroComDatasFormatadas[campo] = `${dia}/${mes}/${ano}`
      }
    })
    
    setForm(membroComDatasFormatadas)
    setErros({})
    setEditando(true)
    setModalAberto(true)
  }

  async function salvarMembro() {
    const novosErros = {}

    // Validar datas
    const camposData = ['data_nascimento', 'data_da_morte', 'data_conversao', 'data_batismo', 'data_batismo_espirito']
    camposData.forEach(campo => {
      if (form[campo] && !validateDataBR(form[campo])) {
        novosErros[campo] = 'Data inválida (DD/MM/YYYY)'
      }
    })

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      showToast('Por favor, corrija os erros nas datas', 'error')
      return
    }

    setSalvando(true)
    try {
      // Converter datas de DD/MM/YYYY para YYYY-MM-DD
      const formComDatasConvertidas = { ...form }
      camposData.forEach(campo => {
        if (form[campo] && form[campo].includes('/')) {
          formComDatasConvertidas[campo] = convertDDMMYYYYtoYYYYMMDD(form[campo])
        }
      })

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
        const response = await createMembro({ ...novoForm, igreja_id: igreja?.id })
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

  function funcaoCssClass(funcao) {
    const map = {
      'Pastor': 'pastor', 'Presbítero': 'presbitero',
      'Diácono': 'diacono', 'Líder de Ministério': 'lider',
      'Visitante': 'visitante'
    }
    return map[funcao] || 'membro'
  }

  function statusMembroCssClass(status) {
    const map = {
      'Inativo': 'status-inativo', 'Transferido': 'status-transferido', 'Falecido': 'status-falecido'
    }
    return map[status] || 'status-ativo'
  }

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
          <select value={filtroFuncao} onChange={(e) => setFiltroFuncao(e.target.value)} className="select-filtro">
            <option value="">Todas as funções</option>
            <option value="COORDENADOR REGIONAL">COORDENADOR REGIONAL</option>
            <option value="VICE-PRESIDENTE">VICE-PRESIDENTE</option>
            <option value="PASTOR PRESIDENTE">PASTOR PRESIDENTE</option>
            <option value="TESOUREIRO">TESOUREIRO</option>
            <option value="PRESIDENTE DE GMH">PRESIDENTE DE GMH</option>
            <option value="PRESIDENTE GMM">PRESIDENTE GMM</option>
            <option value="PRESIDENTE GMJ">PRESIDENTE GMJ</option>
            <option value="PRESIDENTE JUNIORES">PRESIDENTE JUNIORES</option>
            <option value="PRESIDENTE CRIANÇAS">PRESIDENTE CRIANÇAS</option>
            <option value="DEBQ">DEBQ</option>
            <option value="UNIORA">UNIORA</option>
            <option value="PRESIDENTE UNIORA">PRESIDENTE UNIORA</option>
            <option value="PRESIDENTE ASSISTENCIA SOCIAL">PRESIDENTE ASSISTENCIA SOCIAL</option>
            <option value="PATRIMÔNIO">PATRIMÔNIO</option>
            <option value="MEMBRO">MEMBRO</option>
            <option value="DIACONO">DIACONO</option>
            <option value="SECRETARIA">SECRETARIA</option>
            <option value="DIACONISA">DIACONISA</option>
            <option value="MÍDIA">MÍDIA</option>
            <option value="SOM">SOM</option>
             <option value="ARQUIVO MORTO">ARQUIVO MORTO</option>
            <option value="PRESIDENTE MINISTERIO DE LOUVOR">PRESIDENTE MINISTERIO DE LOUVOR</option>
          </select>
        </div>

        <div className="filtro-item">
          <select value={filtroStatusMembro} onChange={(e) => setFiltroStatusMembro(e.target.value)} className="select-filtro">
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Transferido">Transferido</option>
            <option value="Falecido">Falecido</option>
          </select>
        </div>

        <div className="filtro-item filtro-nascimento">
          <label className="filtro-label">Nascimento de</label>
          <input
            type="date"
            value={filtroNascimentoInicio}
            onChange={(e) => setFiltroNascimentoInicio(e.target.value)}
            className="select-filtro"
          />
        </div>

        <div className="filtro-item filtro-nascimento">
          <label className="filtro-label">até</label>
          <input
            type="date"
            value={filtroNascimentoFim}
            onChange={(e) => setFiltroNascimentoFim(e.target.value)}
            className="select-filtro"
          />
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
                <th>Função</th>
                <th>Status</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>CPF</th>
                <th>Dt. Nascimento</th>
                <th>Estado Civil</th>
                <th>Esposo/a</th>
                <th>Nome do Pai</th>
                <th>Nome da Mãe</th>
                <th>Profissão</th>
                <th>Grau de Instrução</th>
                <th>Documento</th>
                <th>CEP</th>
                <th>Logradouro</th>
                <th>Número</th>
                <th>Complemento</th>
                <th>Bairro</th>
                <th>Cidade</th>
                <th>UF</th>
                <th>Religião Anterior</th>
                <th>Dt. Conversão</th>
                <th>Dt. Batismo</th>
                <th>Ministro Oficiante</th>
                <th>Bat. Espírito Santo</th>
                <th>Dt. Bat. Espírito</th>
                <th>Cura/Libertação</th>
                <th>Desc. Cura</th>
                <th>Parentes na Igreja</th>
                <th>Nomes dos Parentes</th>
                <th>Falecido</th>
                <th>Dt. Falecimento</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {membrosFiltrados.map(m => (
                <tr key={m.id}>
                  <td className="td-nome">{m.nome}</td>
                  <td>
                    <span className={`badge-funcao ${funcaoCssClass(m.funcao)}`}>
                      {m.funcao || 'Membro'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status ${statusMembroCssClass(m.status_membro)}`}>
                      {m.status_membro || 'Ativo'}
                    </span>
                  </td>
                  <td>{m.email || '—'}</td>
                  <td>{m.telefone || '—'}</td>
                  <td>{m.cpf || '—'}</td>
                  <td>{formatarDataBR(m.data_nascimento) || '—'}</td>
                  <td>{m.estado_civil || '—'}</td>
                  <td>{m.nome_esposo || '—'}</td>
                  <td>{m.nome_pai || '—'}</td>
                  <td>{m.nome_mae || '—'}</td>
                  <td>{m.profissao || '—'}</td>
                  <td>{m.grau_instrucao || '—'}</td>
                  <td>{m.documento_identidade || '—'}</td>
                  <td>{m.cep || '—'}</td>
                  <td>{m.logradouro || '—'}</td>
                  <td>{m.numero || '—'}</td>
                  <td>{m.complemento || '—'}</td>
                  <td>{m.bairro || '—'}</td>
                  <td>{m.cidade || '—'}</td>
                  <td>{m.uf || '—'}</td>
                  <td>{m.religiao_anterior || '—'}</td>
                  <td>{formatarDataBR(m.data_conversao) || '—'}</td>
                  <td>{formatarDataBR(m.data_batismo) || '—'}</td>
                  <td>{m.ministro_oficiante || '—'}</td>
                  <td>{m.batizado_espirito_santo || '—'}</td>
                  <td>{formatarDataBR(m.data_batismo_espirito) || '—'}</td>
                  <td>{m.recebeu_cura_libertacao || '—'}</td>
                  <td className="td-obs">{m.descricao_cura_libertacao || '—'}</td>
                  <td>{m.parentes_na_igreja || '—'}</td>
                  <td>{m.nome_parentes_igreja || '—'}</td>
                  <td>{m.falecido || '—'}</td>
                  <td>{formatarDataBR(m.data_da_morte) || '—'}</td>
                  <td className="td-obs">{m.observacoes || '—'}</td>

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

              {/* Novos campos da ficha */}
              <div className="form-group">
                <label>Estado Civil</label>
                <select name="estado_civil" value={form.estado_civil} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="Solteiro">Solteiro</option>
                  <option value="Casado">Casado</option>
                  <option value="Viúvo">Viúvo</option>
                  <option value="Divorciado">Divorciado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nome do Esposo/a</label>
                <input name="nome_esposo" value={form.nome_esposo} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Nome do Pai</label>
                <input name="nome_pai" value={form.nome_pai} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Nome da Mãe</label>
                <input name="nome_mae" value={form.nome_mae} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Grau de Instrução</label>
                <select name="grau_instrucao" value={form.grau_instrucao} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="Fundamental">Fundamental</option>
                  <option value="Médio">Médio</option>
                  <option value="Superior">Superior</option>
                  <option value="Pós-graduação">Pós-graduação</option>
                </select>
              </div>

              <div className="form-group">
                <label>Profissão</label>
                <input name="profissao" value={form.profissao} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Documento de Identidade</label>
                <input name="documento_identidade" value={form.documento_identidade} onChange={handleChange} />
              </div>

              <div className="form-group full">
                <label>Religião Anterior</label>
                <input name="religiao_anterior" value={form.religiao_anterior} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Recebeu Cura/Libertação</label>
                <select name="recebeu_cura_libertacao" value={form.recebeu_cura_libertacao} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {form.recebeu_cura_libertacao === 'Sim' && (
                <div className="form-group full">
                  <label>Descrição da Cura/Libertação</label>
                  <textarea
                    name="descricao_cura_libertacao"
                    value={form.descricao_cura_libertacao}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Tem Parentes na Igreja</label>
                <select name="parentes_na_igreja" value={form.parentes_na_igreja} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {form.parentes_na_igreja === 'Sim' && (
                <div className="form-group full">
                  <label>Nome dos Parentes</label>
                  <input name="nome_parentes_igreja" value={form.nome_parentes_igreja} onChange={handleChange} />
                </div>
              )}

              <div className="form-group">
                <label>Data da Conversão</label>
                <input
                  type="text"
                  name="data_conversao"
                  value={form.data_conversao}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  maxLength="10"
                  className={erros.data_conversao ? 'input-error' : ''}
                />
                {erros.data_conversao && <span className="error-text">{erros.data_conversao}</span>}
              </div>

              <div className="form-group">
                <label>Data do Batismo</label>
                <input
                  type="text"
                  name="data_batismo"
                  value={form.data_batismo}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  maxLength="10"
                  className={erros.data_batismo ? 'input-error' : ''}
                />
                {erros.data_batismo && <span className="error-text">{erros.data_batismo}</span>}
              </div>

              <div className="form-group full">
                <label>Ministro Oficiante</label>
                <input name="ministro_oficiante" value={form.ministro_oficiante} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Batizado com o Espírito Santo</label>
                <select name="batizado_espirito_santo" value={form.batizado_espirito_santo} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {form.batizado_espirito_santo === 'Sim' && (
                <div className="form-group">
                  <label>Data do Batismo no Espírito Santo</label>
                  <input
                    type="text"
                    name="data_batismo_espirito"
                    value={form.data_batismo_espirito}
                    onChange={handleChange}
                    placeholder="DD/MM/YYYY"
                    maxLength="10"
                    className={erros.data_batismo_espirito ? 'input-error' : ''}
                  />
                  {erros.data_batismo_espirito && <span className="error-text">{erros.data_batismo_espirito}</span>}
                </div>
              )}

              <div className="form-group full">
                <label>Observações</label>
                <textarea
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Observações e anotações gerais"
                />
              </div>

              <div className="form-group">
                <label>Função/Cargo na Igreja</label>
                <select name="funcao" value={form.funcao} onChange={handleChange}>
                  <option value="COORDENADOR REGIONAL">COORDENADOR REGIONAL</option>
                  <option value="VICE-PRESIDENTE">VICE-PRESIDENTE</option>
                  <option value="PASTOR PRESIDENTE">PASTOR PRESIDENTE</option>
                  <option value="TESOUREIRO">TESOUREIRO</option>
                  <option value="PRESIDENTE DE GMH">PRESIDENTE DE GMH</option>
                  <option value="PRESIDENTE GMM">PRESIDENTE GMM</option>
                  <option value="PRESIDENTE GMJ">PRESIDENTE GMJ</option>
                  <option value="PRESIDENTE JUNIORES">PRESIDENTE JUNIORES</option>
                  <option value="PRESIDENTE CRIANÇAS">PRESIDENTE CRIANÇAS</option>
                  <option value="DEBQ">DEBQ</option>
                  <option value="UNIORA">UNIORA</option>
                  <option value="PRESIDENTE UNIORA">PRESIDENTE UNIORA</option>
                  <option value="PRESIDENTE ASSISTENCIA SOCIAL">PRESIDENTE ASSISTENCIA SOCIAL</option>
                  <option value="PATRIMÔNIO">PATRIMÔNIO</option>
                  <option value="MEMBRO">MEMBRO</option>
                  <option value="DIACONO">DIÁCONO</option>
                  <option value="SECRETARIA">SECRETARIA</option>
                  <option value="DIACONISA">DIACONISA</option>
                  <option value="MÍDIA">MÍDIA</option>
                  <option value="SOM">SOM</option>
                  <option value="ARQUIVO MORTO">ARQUIVO MORTO</option>
                  <option value="PRESIDENTE MINISTERIO DE LOUVOR">PRESIDENTE MINISTERIO DE LOUVOR</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status do Membro <span className="required-star">*</span></label>
                <select name="status_membro" value={form.status_membro} onChange={handleChange}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Transferido">Transferido</option>
                  <option value="Falecido">Falecido</option>
                </select>
              </div>
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