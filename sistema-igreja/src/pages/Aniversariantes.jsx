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

function whatsappLink(telefone) {
  if (!telefone) return null
  const numero = telefone.replace(/\D/g, '')
  const com55 = numero.startsWith('55') ? numero : '55' + numero
  return `https://wa.me/${com55}`
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
            <a
              href={whatsappLink(m.telefone)}
              target="_blank"
              rel="noopener noreferrer"
              className="aniv-whatsapp"
              title={`Chamar ${m.nome} no WhatsApp`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.533 5.851L.057 23.882l6.196-1.456A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.52-5.17-1.428l-.371-.22-3.679.865.93-3.581-.242-.38A9.932 9.932 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              {telefoneFormatado}
            </a>
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
