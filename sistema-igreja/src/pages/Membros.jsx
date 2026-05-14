import { createMembro, getMembros, deleteMembro, updateMembro } from '../services/membrosService';
import './Membros.css';
import { useState, useEffect } from 'react';

function Membros() {
  const [modalAberto, setModalAberto] = useState(false)
  const [membros, setMembros] = useState([])
  const [editando, setEditando] = useState(false)

  // ❌ REMOVIDO id daqui
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

  async function carregarMembros() {
    const { data } = await getMembros()
    if (data) setMembros(data)
  }

  async function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    // CEP automático
    if (name === 'cep') {
      const cepLimpo = value.replace(/\D/g, '')
      if (cepLimpo.length !== 8) return

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        const data = await response.json()

        if (!data.erro) {
          setForm(f => ({
            ...f,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            uf: data.uf
          }))
        }
      } catch {
        console.error('CEP não encontrado')
      }
    }
  }

  function abrirCadastro() {
    setForm(initialForm)
    setEditando(false)
    setModalAberto(true)
  }

  function abrirEditar(membro) {
    setForm(membro) // aqui vem com id válido
    setEditando(true)
    setModalAberto(true)
  }

  async function salvarMembro() {
    let error

    if (editando) {
      const response = await updateMembro(form.id, form)
      error = response.error
    } else {
      const { id, ...novoForm } = form

      const response = await createMembro(novoForm)
      error = response.error
    }

    if (error) {
      console.error('Erro ao salvar:', error.message)
      return
    }

    console.log(editando ? "Atualizado com sucesso" : "Cadastrado com sucesso")

    await carregarMembros()
    setModalAberto(false)
    setEditando(false)
    setForm(initialForm)
  }

  async function excluirMembro(id) {
    if (!window.confirm("Tem certeza que deseja excluir este membro?")) return

    const { error } = await deleteMembro(id)

    if (error) {
      console.error('Erro ao deletar:', error.message)
      return
    }

    await carregarMembros()
  }

  function formatarDataBR(data) {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR')
  }

  return (
    <div className="page-membros">
      <div className="membros-header">
        <h2 className="text-cadastro">Cadastro de membros</h2>
        <button onClick={abrirCadastro} className="btn-cadastrar">
          Cadastrar membro
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Data de nascimento</th>
              <th>CPF</th>
              <th>CEP</th>
              <th>Rua</th>
              <th>Número</th>
              <th>Complemento</th>
              <th>Bairro</th>
              <th>Cidade</th>
              <th>UF</th>
              <th>Falecido</th>
              <th>Data do Falecimento</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {membros.map(m => (
              <tr key={m.id}>
                <td>{m.nome}</td>
                <td>{m.email}</td>
                <td>{m.telefone}</td>
                <td>{formatarDataBR(m.data_nascimento)}</td>
                <td>{m.cpf}</td>
                <td>{m.cep}</td>
                <td>{m.logradouro}</td>
                <td>{m.numero}</td>
                <td>{m.complemento}</td>
                <td>{m.bairro}</td>
                <td>{m.cidade}</td>
                <td>{m.uf}</td>
                <td>{m.falecido}</td>
                <td>{formatarDataBR(m.data_da_morte)}</td>

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

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editando ? "Editar membro" : "Cadastrar membro"}</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Nome *</label>
                <input name="nome" value={form.nome} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input name="email" value={form.email} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input name="telefone" value={form.telefone} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>CPF</label>
                <input name="cpf" value={form.cpf} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Data de nascimento</label>
                <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>CEP</label>
                <input name="cep" value={form.cep} onChange={handleChange} />
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
                <input name="cidade" value={form.cidade} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>UF</label>
                <input name="uf" value={form.uf} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Falecido</label>
                <select name="falecido" value={form.falecido} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div className="form-group">
                <label>Data do Falecimento</label>
                <input type="date" name="data_da_morte" value={form.data_da_morte} onChange={handleChange} />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>

              <button className="btn-salvar" onClick={salvarMembro}>
                {editando ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Membros