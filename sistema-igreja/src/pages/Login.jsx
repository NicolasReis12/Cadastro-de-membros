import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.senha) {
      setErro('Preencha email e senha.')
      return
    }

    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.senha,
    })
    setCarregando(false)

    if (error) {
      setErro('Email ou senha incorretos.')
      return
    }

    navigate('/')
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

        <h2 className="auth-heading">Entrar</h2>

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {erro && <p className="auth-erro">{erro}</p>}

          <button type="submit" className="auth-btn" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-link-text">
          Não tem conta? <Link to="/register">Cadastre sua igreja</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
