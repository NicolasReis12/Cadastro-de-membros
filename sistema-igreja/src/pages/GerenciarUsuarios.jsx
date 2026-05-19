import { useState, useEffect, useContext } from 'react'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/usuariosService'
import { ToastContext } from '../App'
import { useAuth } from '../contexts/AuthContext'
import { validateEmail } from '../utils/validation'
import './GerenciarUsuarios.css'

const MODULOS = [
  { key: 'dashboard',         label: 'Dashboard' },
  { key: 'membros',           label: 'Membros' },
  { key: 'aniversariantes',   label: 'Aniversariantes' },
  { key: 'entradas',          label: 'Dízimos' },
  { key: 'ofertas',           label: 'Ofertas' },
  { key: 'ofertas_especiais', label: 'Of. Especiais' },
  { key: 'relatorios',        label: 'Relatórios' },
]

const PERMISSOES_PADRAO = {
  dashboard: true,
  membros: false,
  aniversariantes: false,
  entradas: false,
  ofertas: false,
  ofertas_especiais: false,
  relatorios: false,
}

const initialForm = {
  nome: '',
  email: '',
  senha: '',
  is_admin: false,
  permissoes: { ...PERMISSOES_PADRAO },
}

function GerenciarUsuarios() {
  const { showToast } = useContext(ToastContext)
  const { igreja } = useAuth()

  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [erros, setErros] = useState({})
  const [confirmandoDelete, setConfirmandoDelete] = useState(null)

  useEffect(() => {
    if (igreja?.id) carregarUsuarios()
  }, [igreja])

  async function carregarUsuarios() {
    setCarregando(true)
    const { data, error } = await getUsuarios(igreja.id)
    setCarregando(false)
    if (error) {
      showToast('Erro ao carregar usuários: ' + error.message, 'error')
    } else {
      setUsuarios(data || [])
    }
  }

  function abrirModalCriar() {
    setForm(initialForm)
    setErros({})
    setModoEdicao(false)
    setUsuarioEditandoId(null)
    setModalAberto(true)
  }

  function abrirModalEditar(usuario) {
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      is_admin: usuario.is_admin,
      permissoes: { ...PERMISSOES_PADRAO, ...usuario.permissoes },
    })
    setErros({})
    setModoEdicao(true)
    setUsuarioEditandoId(usuario.id)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setForm(initialForm)
    setErros({})
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
    if (erros[name]) setErros(prev => { const e = { ...prev }; delete e[name]; return e })
  }

  function handlePermissaoChange(key, checked) {
    setForm(f => ({
      ...f,
      permissoes: { ...f.permissoes, [key]: checked },
    }))
  }

  function validar() {
    const novosErros = {}
    if (!form.nome.trim()) novosErros.nome = 'Nome é obrigatório'
    if (!modoEdicao) {
      if (!form.email.trim()) novosErros.email = 'Email é obrigatório'
      else if (!validateEmail(form.email)) novosErros.email = 'Email inválido'
      if (!form.senha) novosErros.senha = 'Senha é obrigatória'
      else if (form.senha.length < 6) novosErros.senha = 'Mínimo 6 caracteres'
    }
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  async function handleSalvar() {
    if (!validar()) return
    setSalvando(true)

    if (modoEdicao) {
      const { error } = await updateUsuario(usuarioEditandoId, {
        nome: form.nome,
        is_admin: form.is_admin,
        permissoes: form.permissoes,
      })
      setSalvando(false)
      if (error) {
        showToast('Erro ao atualizar usuário: ' + error.message, 'error')
      } else {
        showToast('Usuário atualizado com sucesso!', 'success')
        fecharModal()
        await carregarUsuarios()
      }
    } else {
      const { error } = await createUsuario({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        igrejaId: igreja.id,
        permissoes: form.permissoes,
        isSubAdmin: form.is_admin,
      })
      setSalvando(false)
      if (error) {
        showToast('Erro ao criar usuário: ' + error.message, 'error')
      } else {
        showToast(`Usuário criado! Compartilhe as credenciais: ${form.email}`, 'success')
        fecharModal()
        await carregarUsuarios()
      }
    }
  }

  async function handleDesativar(id) {
    const { error } = await deleteUsuario(id)
    setConfirmandoDelete(null)
    if (error) {
      showToast('Erro ao desativar usuário: ' + error.message, 'error')
    } else {
      showToast('Usuário desativado.', 'success')
      await carregarUsuarios()
    }
  }

  const modulosAtivos = (permissoes) =>
    MODULOS.filter(m => permissoes?.[m.key]).map(m => m.label).join(', ') || 'Nenhum'

  return (
    <div className="page-usuarios">
      <div className="usuarios-header">
        <div>
          <h2>Gerenciar Usuários</h2>
          <div className="usuarios-subtitulo">Crie usuários e defina o que cada um pode acessar</div>
        </div>
        <button className="btn-cadastrar" onClick={abrirModalCriar}>+ Novo Usuário</button>
      </div>

      {carregando ? (
        <div className="loading-container">
          <div className="spinner" />
          <span style={{ color: '#7c3aed', fontSize: 13 }}>Carregando usuários...</span>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="sem-resultados">
          Nenhum usuário cadastrado ainda.<br />
          <span style={{ fontSize: 13, marginTop: 8, display: 'block' }}>
            Clique em "Novo Usuário" para criar o primeiro.
          </span>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Módulos com acesso</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.is_admin
                      ? <span className="badge-admin">Admin</span>
                      : <span className="badge-usuario">Usuário</span>}
                  </td>
                  <td>
                    <span className="modulos-texto">{modulosAtivos(u.permissoes)}</span>
                  </td>
                  <td className="acoes">
                    <button className="btn-editar" onClick={() => abrirModalEditar(u)}>Editar</button>
                    <button className="btn-excluir" onClick={() => setConfirmandoDelete(u.id)}>Desativar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar/editar */}
      {modalAberto && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && fecharModal()}>
          <div className="modal">
            <h3>{modoEdicao ? 'Editar Usuário' : 'Novo Usuário'}</h3>

            <div className="form-grid">
              <div className="form-group full">
                <label>Nome <span className="required-star">*</span></label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  className={erros.nome ? 'input-error' : ''}
                />
                {erros.nome && <span className="error-text">{erros.nome}</span>}
              </div>

              {!modoEdicao && (
                <>
                  <div className="form-group full">
                    <label>Email <span className="required-star">*</span></label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                      className={erros.email ? 'input-error' : ''}
                    />
                    {erros.email && <span className="error-text">{erros.email}</span>}
                  </div>

                  <div className="form-group full">
                    <label>Senha <span className="required-star">*</span></label>
                    <input
                      name="senha"
                      type="password"
                      value={form.senha}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      className={erros.senha ? 'input-error' : ''}
                    />
                    {erros.senha && <span className="error-text">{erros.senha}</span>}
                    <span className="aviso-texto">Compartilhe as credenciais com o usuário após criar.</span>
                  </div>
                </>
              )}

              {modoEdicao && (
                <div className="form-group full">
                  <label>Email</label>
                  <input value={form.email} disabled style={{ opacity: 0.6 }} />
                </div>
              )}
            </div>

            <div className="toggle-admin">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="is_admin"
                  checked={form.is_admin}
                  onChange={handleChange}
                />
                <span>Sub-admin (pode gerenciar outros usuários)</span>
              </label>
            </div>

            <div className="permissoes-section">
              <div className="permissoes-titulo">Permissões de acesso</div>
              <div className="permissoes-grid">
                {MODULOS.map(m => (
                  <label key={m.key} className="permissao-item">
                    <input
                      type="checkbox"
                      checked={form.permissoes[m.key] ?? false}
                      onChange={e => handlePermissaoChange(m.key, e.target.checked)}
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={fecharModal} disabled={salvando}>Cancelar</button>
              <button className="btn-salvar" onClick={handleSalvar} disabled={salvando}>
                {salvando ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Criar usuário'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmação de desativação */}
      {confirmandoDelete && (
        <div className="modal-overlay">
          <div className="modal modal-confirmacao">
            <h3>Desativar usuário?</h3>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: '1.5rem' }}>
              O usuário perderá o acesso ao sistema. Esta ação pode ser revertida manualmente no banco de dados.
            </p>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setConfirmandoDelete(null)}>Cancelar</button>
              <button className="btn-excluir-confirmar" onClick={() => handleDesativar(confirmandoDelete)}>
                Sim, desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GerenciarUsuarios
