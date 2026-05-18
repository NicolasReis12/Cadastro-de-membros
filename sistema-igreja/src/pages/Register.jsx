import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.nome || !form.email || !form.senha || !form.confirmar) {
      setErro('Preencha todos os campos.')
      return
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (form.senha !== form.confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    })

    if (signUpError) {
      setCarregando(false)
      setErro('Erro ao criar conta: ' + signUpError.message)
      return
    }

    const { error: insertError } = await supabase.from('igrejas').insert({
      nome: form.nome,
      email: form.email,
      user_id: data.user.id,
    })

    setCarregando(false)

    if (insertError) {
      setErro('Conta criada, mas erro ao salvar dados da igreja. Contate o suporte.')
      return
    }

    navigate('/login', { state: { mensagem: 'Conta criada com sucesso! Faça login para continuar.' } })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <div className="q-red"></div>
            <div className="q-yellow"></div>
            <div className="q-blue"></div>
            <div className="q-purple"></div>
          </div>
          <div>
            <div className="auth-logo-title">Sistema de Membros</div>
            <div className="auth-logo-sub">Gestão de igrejas</div>
          </div>
        </div>

        <h2 className="auth-heading">Cadastrar Igreja</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-group">
            <label>Nome da Igreja</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: Igreja Evangélica Quadrangular"
            />
          </div>

          <div className="auth-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@igreja.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-group">
            <label>Senha</label>
            <input
              name="senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div className="auth-group">
            <label>Confirmar Senha</label>
            <input
              name="confirmar"
              type="password"
              value={form.confirmar}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {erro && <p className="auth-erro">{erro}</p>}

          <button type="submit" className="auth-btn" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-link-text">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
