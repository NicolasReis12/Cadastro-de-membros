import { useState, useContext } from 'react'
import { getMembros } from '../services/membrosService'
import { getEntradas } from '../services/entradasService'
import { getOfertas } from '../services/ofertasService'
import { getOfertasEspeciais } from '../services/ofertasEspeciaisService'
import {
  gerarPDFMensalEntradas, gerarExcelMembros, gerarExcelFinanceiro,
  gerarPDFOfertas, gerarExcelOfertas,
  gerarPDFOfertasEspeciais, gerarExcelOfertasEspeciais
} from '../services/relatoriosService'
import { ToastContext } from '../App'
import './Relatorios.css'

const MESES = [
  { v: 1, l: 'Janeiro' }, { v: 2, l: 'Fevereiro' }, { v: 3, l: 'Março' },
  { v: 4, l: 'Abril' }, { v: 5, l: 'Maio' }, { v: 6, l: 'Junho' },
  { v: 7, l: 'Julho' }, { v: 8, l: 'Agosto' }, { v: 9, l: 'Setembro' },
  { v: 10, l: 'Outubro' }, { v: 11, l: 'Novembro' }, { v: 12, l: 'Dezembro' }
]

function Relatorios() {
  const { showToast } = useContext(ToastContext)
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [gerando, setGerando] = useState('')

  const anos = []
  for (let a = hoje.getFullYear(); a >= 2020; a--) anos.push(a)

  async function exportarPDFEntradas() {
    setGerando('pdf-entradas')
    try {
      const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
      const ultimoDia = new Date(ano, mes, 0).getDate()
      const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`

      const { data, error } = await getEntradas({ dataInicio, dataFim })
      if (error) {
        if (error.code === '42P01') {
          showToast('Tabela entradas_financeiras não encontrada. Execute o SQL de setup.', 'warning')
        } else {
          showToast('Erro ao buscar entradas: ' + error.message, 'error')
        }
        return
      }

      if (!data || data.length === 0) {
        showToast('Nenhuma entrada encontrada para o período selecionado', 'warning')
        return
      }

      gerarPDFMensalEntradas(data, mes, ano)
      showToast('PDF gerado com sucesso', 'success')
    } catch (err) {
      showToast('Erro ao gerar PDF: ' + err.message, 'error')
    } finally {
      setGerando('')
    }
  }

  async function exportarExcelMembros() {
    setGerando('excel-membros')
    try {
      const { data, error } = await getMembros()
      if (error) { showToast('Erro ao buscar membros: ' + error.message, 'error'); return }
      if (!data || data.length === 0) { showToast('Nenhum membro encontrado', 'warning'); return }

      gerarExcelMembros(data)
      showToast('Excel de membros gerado com sucesso', 'success')
    } catch (err) {
      showToast('Erro ao gerar Excel: ' + err.message, 'error')
    } finally {
      setGerando('')
    }
  }

  async function exportarExcelFinanceiro() {
    setGerando('excel-financeiro')
    try {
      const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
      const ultimoDia = new Date(ano, mes, 0).getDate()
      const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`

      const { data, error } = await getEntradas({ dataInicio, dataFim })
      if (error) {
        if (error.code === '42P01') {
          showToast('Tabela entradas_financeiras não encontrada. Execute o SQL de setup.', 'warning')
        } else {
          showToast('Erro ao buscar entradas: ' + error.message, 'error')
        }
        return
      }

      if (!data || data.length === 0) {
        showToast('Nenhuma entrada encontrada para o período selecionado', 'warning')
        return
      }

      gerarExcelFinanceiro(data, mes, ano)
      showToast('Excel financeiro gerado com sucesso', 'success')
    } catch (err) {
      showToast('Erro ao gerar Excel: ' + err.message, 'error')
    } finally {
      setGerando('')
    }
  }

  function periodo() {
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const ultimoDia = new Date(ano, mes, 0).getDate()
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`
    return { dataInicio, dataFim }
  }

  async function exportarPDFOfertas() {
    setGerando('pdf-ofertas')
    try {
      const { dataInicio, dataFim } = periodo()
      const { data, error } = await getOfertas({ dataInicio, dataFim })
      if (error) { showToast('Erro ao buscar ofertas: ' + error.message, 'error'); return }
      if (!data || data.length === 0) { showToast('Nenhuma oferta no período selecionado', 'warning'); return }
      gerarPDFOfertas(data, mes, ano)
      showToast('PDF de Ofertas gerado com sucesso', 'success')
    } catch (err) {
      showToast('Erro ao gerar PDF: ' + err.message, 'error')
    } finally {
      setGerando('')
    }
  }

  async function exportarExcelOfertas() {
    setGerando('excel-ofertas')
    try {
      const { dataInicio, dataFim } = periodo()
      const { data, error } = await getOfertas({ dataInicio, dataFim })
      if (error) { showToast('Erro ao buscar ofertas: ' + error.message, 'error'); return }
      if (!data || data.length === 0) { showToast('Nenhuma oferta no período selecionado', 'warning'); return }
      gerarExcelOfertas(data, mes, ano)
      showToast('Excel de Ofertas gerado com sucesso', 'success')
    } catch (err) {
      showToast('Erro ao gerar Excel: ' + err.message, 'error')
    } finally {
      setGerando('')
    }
  }

  async function exportarPDFOfertasEspeciais() {
    setGerando('pdf-of-esp')
    try {
      const { dataInicio, dataFim } = periodo()
      const { data, error } = await getOfertasEspeciais({ dataInicio, dataFim })
      if (error) { showToast('Erro ao buscar ofertas especiais: ' + error.message, 'error'); return }
      if (!data || data.length === 0) { showToast('Nenhuma oferta especial no período selecionado', 'warning'); return }
      gerarPDFOfertasEspeciais(data, mes, ano)
      showToast('PDF de Ofertas Especiais gerado com sucesso', 'success')
    } catch (err) {
      showToast('Erro ao gerar PDF: ' + err.message, 'error')
    } finally {
      setGerando('')
    }
  }

  async function exportarExcelOfertasEspeciais() {
    setGerando('excel-of-esp')
    try {
      const { dataInicio, dataFim } = periodo()
      const { data, error } = await getOfertasEspeciais({ dataInicio, dataFim })
      if (error) { showToast('Erro ao buscar ofertas especiais: ' + error.message, 'error'); return }
      if (!data || data.length === 0) { showToast('Nenhuma oferta especial no período selecionado', 'warning'); return }
      gerarExcelOfertasEspeciais(data, mes, ano)
      showToast('Excel de Ofertas Especiais gerado com sucesso', 'success')
    } catch (err) {
      showToast('Erro ao gerar Excel: ' + err.message, 'error')
    } finally {
      setGerando('')
    }
  }

  const nomeMes = MESES.find(m => m.v === mes)?.l

  return (
    <div className="page-relatorios">
      <div className="relatorios-header">
        <h2>Relatórios</h2>
        <p>Exporte dados do sistema em PDF ou Excel</p>
      </div>

      {/* Seletor de período */}
      <div className="periodo-card">
        <h3>Período para relatórios financeiros</h3>
        <div className="periodo-selects">
          <div className="form-group">
            <label>Mês</label>
            <select value={mes} onChange={e => setMes(Number(e.target.value))} className="select-periodo">
              {MESES.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Ano</label>
            <select value={ano} onChange={e => setAno(Number(e.target.value))} className="select-periodo">
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <p className="periodo-selecionado">Período selecionado: <strong>{nomeMes} de {ano}</strong></p>
      </div>

      {/* Cards de relatórios */}
      <div className="relatorios-grid">

        {/* Relatório PDF Mensal */}
        <div className="relatorio-card">
          <div className="relatorio-icon relatorio-icon-pdf">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div className="relatorio-info">
            <h4>Relatório Mensal de Dizimos </h4>
            <p>PDF com todas as entradas financeiras do mês, agrupadas por categoria com totais.</p>
            <ul>
              <li>Data, tipo, membro, valor e forma de pagamento</li>
              <li>Resumo por categoria ao final</li>
            </ul>
          </div>
          <button
            className="btn-exportar btn-pdf"
            onClick={exportarPDFEntradas}
            disabled={gerando !== ''}
          >
            {gerando === 'pdf-entradas' ? 'Gerando...' : 'Exportar PDF'}
          </button>
        </div>

        {/* Relatório Excel Membros */}
        <div className="relatorio-card">
          <div className="relatorio-icon relatorio-icon-excel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
          </div>
          <div className="relatorio-info">
            <h4>Relatório de Membros</h4>
            <p>Excel com dois abas: membros ativos e aniversariantes por mês.</p>
            <ul>
              <li>Aba "Membros Ativos": nome, telefone, email, função, status</li>
              <li>Aba "Aniversariantes": ordenados por mês e dia</li>
            </ul>
          </div>
          <button
            className="btn-exportar btn-excel"
            onClick={exportarExcelMembros}
            disabled={gerando !== ''}
          >
            {gerando === 'excel-membros' ? 'Gerando...' : 'Exportar Excel'}
          </button>
        </div>

        {/* Relatório Excel Financeiro */}
        <div className="relatorio-card">
          <div className="relatorio-icon relatorio-icon-excel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div className="relatorio-info">
            <h4>Relatório Financeiro Mensal</h4>
            <p>Excel com entradas do mês e resumo por categoria.</p>
            <ul>
              <li>Aba "Entradas": todas as entradas detalhadas</li>
              <li>Aba "Resumo": totais por categoria de entrada</li>
            </ul>
          </div>
          <button
            className="btn-exportar btn-excel"
            onClick={exportarExcelFinanceiro}
            disabled={gerando !== ''}
          >
            {gerando === 'excel-financeiro' ? 'Gerando...' : 'Exportar Excel'}
          </button>
        </div>

        {/* PDF Ofertas */}
        <div className="relatorio-card">
          <div className="relatorio-icon relatorio-icon-pdf">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="relatorio-info">
            <h4>Relatório de Ofertas — PDF</h4>
            <p>PDF com todas as ofertas do mês selecionado e total geral.</p>
            <ul>
              <li>Data, membro, forma de pagamento, valor</li>
              <li>Total geral ao final</li>
            </ul>
          </div>
          <button className="btn-exportar btn-pdf" onClick={exportarPDFOfertas} disabled={gerando !== ''}>
            {gerando === 'pdf-ofertas' ? 'Gerando...' : 'Exportar PDF'}
          </button>
        </div>

        {/* Excel Ofertas */}
        <div className="relatorio-card">
          <div className="relatorio-icon relatorio-icon-excel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="relatorio-info">
            <h4>Relatório de Ofertas — Excel</h4>
            <p>Planilha com todas as ofertas do mês e total na última linha.</p>
            <ul>
              <li>Data, membro, forma, observação e valor</li>
            </ul>
          </div>
          <button className="btn-exportar btn-excel" onClick={exportarExcelOfertas} disabled={gerando !== ''}>
            {gerando === 'excel-ofertas' ? 'Gerando...' : 'Exportar Excel'}
          </button>
        </div>

        {/* PDF Ofertas Especiais */}
        <div className="relatorio-card">
          <div className="relatorio-icon relatorio-icon-pdf">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="relatorio-info">
            <h4>Relatório de Ofertas Especiais — PDF</h4>
            <p>PDF com as ofertas especiais do mês e resumo por motivo/evento.</p>
            <ul>
              <li>Data, membro, motivo/evento, forma, valor</li>
              <li>Resumo por motivo ao final</li>
            </ul>
          </div>
          <button className="btn-exportar btn-pdf" onClick={exportarPDFOfertasEspeciais} disabled={gerando !== ''}>
            {gerando === 'pdf-of-esp' ? 'Gerando...' : 'Exportar PDF'}
          </button>
        </div>

        {/* Excel Ofertas Especiais */}
        <div className="relatorio-card">
          <div className="relatorio-icon relatorio-icon-excel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="relatorio-info">
            <h4>Relatório de Ofertas Especiais — Excel</h4>
            <p>Planilha com duas abas: registros detalhados e resumo por motivo.</p>
            <ul>
              <li>Aba "Ofertas Especiais": todos os registros</li>
              <li>Aba "Resumo por Motivo": total por evento</li>
            </ul>
          </div>
          <button className="btn-exportar btn-excel" onClick={exportarExcelOfertasEspeciais} disabled={gerando !== ''}>
            {gerando === 'excel-of-esp' ? 'Gerando...' : 'Exportar Excel'}
          </button>
        </div>

      </div>

    </div>
  )
}

export default Relatorios
