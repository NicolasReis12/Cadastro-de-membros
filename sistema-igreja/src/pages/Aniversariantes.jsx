import './Aniversariantes.css'
import { useEffect, useState } from 'react'
import { getMembros } from '../services/membrosService'

const MESES = [
  'janeiro','fevereiro','março','abril','maio','junho',
  'julho','agosto','setembro','outubro','novembro','dezembro'
]

function Aniversariantes() {
  const [membros, setMembros] = useState([])
  const [carregando, setCarregando] = useState(true)

  const hoje = new Date()
  const mesAtual = hoje.getMonth() + 1
  const diaAtual = hoje.getDate()
  const anoAtual = hoje.getFullYear()

  useEffect(() => {
    getMembros().then(({ data }) => {
      if (data) setMembros(data)
      setCarregando(false)
    })
  }, [])

  function isHoje(dataISO) {
    if (!dataISO) return false
    const [, mes, dia] = dataISO.split('-').map(Number)
    return dia === diaAtual && mes === mesAtual
  }

  function calcularIdade(dataISO) {
    const [ano, mes, dia] = dataISO.split('-').map(Number)
    let idade = anoAtual - ano
    const jáPassou = mesAtual > mes || (mesAtual === mes && diaAtual >= dia)
    if (!jáPassou) idade--
    return idade
  }

  function diasAte(dataISO) {
    const [, mes, dia] = dataISO.split('-').map(Number)
    hoje.setHours(0, 0, 0, 0)
    let proxAniv = new Date(anoAtual, mes - 1, dia)
    proxAniv.setHours(0, 0, 0, 0)
    if (proxAniv < hoje) proxAniv = new Date(anoAtual + 1, mes - 1, dia)
    return Math.round((proxAniv - hoje) / 86400000)
  }

  function formatarDataNasc(dataISO) {
    const [, mes, dia] = dataISO.split('-').map(Number)
    return `${dia} de ${MESES[mes - 1]}`
  }

  function formatarTelefone(tel) {
    if (!tel) return null
    const d = tel.replace(/\D/g, '')
    if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
    if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
    return tel
  }

  const aniversariantes = membros
    .filter(m => {
      if (!m.data_nascimento || m.falecido === 'Sim') return false
      const mes = parseInt(m.data_nascimento.split('-')[1], 10)
      return mes === mesAtual
    })
    .sort((a, b) => {
      if (isHoje(a.data_nascimento) && !isHoje(b.data_nascimento)) return -1
      if (!isHoje(a.data_nascimento) && isHoje(b.data_nascimento)) return 1
      return parseInt(a.data_nascimento.split('-')[2]) - parseInt(b.data_nascimento.split('-')[2])
    })

  const anivHoje = aniversariantes.filter(m => isHoje(m.data_nascimento))
  const anivResto = aniversariantes.filter(m => !isHoje(m.data_nascimento))

  const nomeMes = MESES[mesAtual - 1]
  const nomeMesMaiusc = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)

  if (carregando) {
    return (
      <div className="page-aniversariantes">
        <div className="aniv-loading">
          <div className="aniv-spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-aniversariantes">

      {/* Cabeçalho */}
      <div className="aniv-header">
        <div className="aniv-header-texto">
          <h2 className="aniv-titulo">Aniversariantes</h2>
          <p className="aniv-subtitulo">{nomeMesMaiusc} de {anoAtual}</p>
        </div>
        {aniversariantes.length > 0 && (
          <span className="aniv-badge-total">
            {aniversariantes.length} {aniversariantes.length === 1 ? 'pessoa' : 'pessoas'}
          </span>
        )}
      </div>

      {/* Seção "Hoje" */}
      {anivHoje.length > 0 && (
        <div className="secao-hoje">
          <div className="secao-hoje-titulo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Aniversário hoje
          </div>
          <div className="aniversariantes-lista">
            {anivHoje.map(m => (
              <CardAniversariante
                key={m.id}
                m={m}
                hoje
                idade={calcularIdade(m.data_nascimento)}
                dataFormatada={formatarDataNasc(m.data_nascimento)}
                telefoneFormatado={formatarTelefone(m.telefone)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lista do mês */}
      {aniversariantes.length === 0 ? (
        <div className="aniv-vazio">
          <div className="aniv-vazio-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p>Nenhum aniversariante em {nomeMesMaiusc}</p>
        </div>
      ) : (
        <>
          {anivResto.length > 0 && (
            <>
              {anivHoje.length > 0 && (
                <div className="secao-label">Próximos do mês</div>
              )}
              <div className="aniversariantes-lista">
                {anivResto.map(m => (
                  <CardAniversariante
                    key={m.id}
                    m={m}
                    hoje={false}
                    idade={calcularIdade(m.data_nascimento)}
                    dataFormatada={formatarDataNasc(m.data_nascimento)}
                    telefoneFormatado={formatarTelefone(m.telefone)}
                    dias={diasAte(m.data_nascimento)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function CardAniversariante({ m, hoje, idade, dataFormatada, telefoneFormatado, dias }) {
  return (
    <div className={`card-aniversariante ${hoje ? 'hoje' : ''}`}>
      <div className="aniv-avatar">
        {m.nome.charAt(0).toUpperCase()}
      </div>

      <div className="aniv-info">
        <div className="aniv-nome">{m.nome}</div>
        <div className="aniv-meta">
          <span className="aniv-data">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {dataFormatada}
          </span>
          <span className="aniv-anos">
            {hoje ? `Completa ${idade} anos hoje` : `${idade} anos`}
          </span>
          {telefoneFormatado && (
            <span className="aniv-telefone">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12 19.79 19.79 0 0 1 1.77 3.35 2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {telefoneFormatado}
            </span>
          )}
        </div>
      </div>

      <div className="aniv-direita">
        {hoje ? (
          <span className="badge-hoje">HOJE</span>
        ) : dias !== undefined && (
          <span className="badge-dias">
            {dias === 1 ? 'amanhã' : `em ${dias}d`}
          </span>
        )}
      </div>
    </div>
  )
}

export default Aniversariantes
