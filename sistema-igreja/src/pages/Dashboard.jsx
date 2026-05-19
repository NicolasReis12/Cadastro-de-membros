import { useEffect, useState, useContext } from 'react'
import { getMembros } from '../services/membrosService'
import { ToastContext } from '../App'
import './Dashboard.css'

function Dashboard() {
  const { showToast } = useContext(ToastContext)
  const [stats, setStats] = useState({
    totalMembros: 0,
    membrosAtivos: 0,
    membrosFalecidos: 0,
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

      if (membros) {
        const hoje = new Date()
        const mesAtual = hoje.getMonth() + 1

        const membrosFalecidos = membros.filter(m => m.falecido === 'Sim').length
        const membrosAtivos = membros.length - membrosFalecidos

        const proximosAniversariantes = membros
          .filter(m => {
            if (!m.data_nascimento || m.falecido === 'Sim') return false
            const mes = parseInt(m.data_nascimento.split('-')[1], 10)
            return mes === mesAtual
          })
          .slice(0, 5)

        setStats({
          totalMembros: membros.length,
          membrosAtivos,
          membrosFalecidos,
          proximosAniversariantes
        })
      }
    } catch {
      showToast('Erro ao carregar estatísticas', 'error')
    } finally {
      setLoading(false)
    }
  }

  function whatsappLink(telefone) {
    if (!telefone) return null
    const numero = telefone.replace(/\D/g, '')
    const com55 = numero.startsWith('55') ? numero : '55' + numero
    return `https://wa.me/${com55}`
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
                {membro.telefone && (
                  <a
                    href={whatsappLink(membro.telefone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                    title={`Chamar ${membro.nome} no WhatsApp`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.533 5.851L.057 23.882l6.196-1.456A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.52-5.17-1.428l-.371-.22-3.679.865.93-3.581-.242-.38A9.932 9.932 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    {membro.telefone}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
