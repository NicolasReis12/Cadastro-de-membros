import { useEffect, useState } from 'react'
import { getMembros } from '../services/membrosService'
import { getDizimos } from '../services/dizimosService'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalMembros: 0,
    membrosAtivos: 0,
    membrosFalecidos: 0,
    totalDizimos: 0,
    dizmosDoMes: 0,
    proximosAniversariantes: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  async function carregarEstatisticas() {
    setLoading(true)
    try {
      const { data: membros } = await getMembros()
      const { data: dizimos } = await getDizimos()

      if (membros) {
        const hoje = new Date()
        const mesAtual = hoje.getMonth() + 1
        const anoAtual = hoje.getFullYear()
        const diaAtual = hoje.getDate()

        const membrosFalecidos = membros.filter(m => m.falecido === 'Sim').length
        const membrosAtivos = membros.length - membrosFalecidos

        // Próximos aniversariantes
        const proximosAniversariantes = membros
          .filter(m => {
            if (!m.data_nascimento || m.falecido === 'Sim') return false
            // Extrair mês da data YYYY-MM-DD sem usar new Date
            const mes = parseInt(m.data_nascimento.split('-')[1], 10)
            return mes === mesAtual
          })
          .slice(0, 5)

        // Total de dízimos
        const totalDizimos = dizimos ? dizimos.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0) : 0

        // Dízimos do mês atual
        const dizmosDoMes = dizimos 
          ? dizimos
              .filter(d => {
                // Extrair ano e mês da data YYYY-MM-DD sem usar new Date
                const [ano, mes] = d.data.split('-').map(Number)
                return mes === mesAtual && ano === anoAtual
              })
              .reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0)
          : 0

        setStats({
          totalMembros: membros.length,
          membrosAtivos,
          membrosFalecidos,
          totalDizimos,
          dizmosDoMes,
          proximosAniversariantes
        })
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarValor = (valor) => {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatarData = (data) => {
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

  if (loading) {
    return (
      <div className="page-dashboard">
        <div className="loading">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="page-dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Visão geral do sistema</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total de Membros</h3>
            <p className="stat-value">{stats.totalMembros}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <h3>Membros Ativos</h3>
            <p className="stat-value">{stats.membrosAtivos}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✕</div>
          <div className="stat-info">
            <h3>Membros Falecidos</h3>
            <p className="stat-value">{stats.membrosFalecidos}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total em Dízimos</h3>
            <p className="stat-value">{formatarValor(stats.totalDizimos)}</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>Dízimos este Mês</h3>
            <p className="stat-value">{formatarValor(stats.dizmosDoMes)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>🎂 Próximos Aniversariantes</h2>
        {stats.proximosAniversariantes.length === 0 ? (
          <p className="sem-dados">Nenhum aniversariante neste mês</p>
        ) : (
          <div className="aniversariantes-list">
            {stats.proximosAniversariantes.map(membro => (
              <div key={membro.id} className="aniversariante-item">
                <div className="avatar-small">{membro.nome.charAt(0).toUpperCase()}</div>
                <div className="aniversariante-info">
                  <h4>{membro.nome}</h4>
                  <p>{formatarData(membro.data_nascimento)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
