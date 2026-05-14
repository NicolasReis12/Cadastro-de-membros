import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const TIPOS_LABEL = {
  dizimo: 'Dízimo',
  oferta_geral: 'Oferta Geral',
  campanha: 'Campanha',
  venda_evento: 'Venda de Evento',
  doacao: 'Doação'
}

const FORMAS_LABEL = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao: 'Cartão',
  transferencia: 'Transferência'
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function formatarValorBR(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarDataBR(data) {
  if (!data) return ''
  if (data.includes('/')) return data
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export function gerarPDFMensalEntradas(entradas, mes, ano) {
  const doc = new jsPDF()
  const nomeMes = MESES[mes - 1]

  doc.setFontSize(18)
  doc.setTextColor(29, 78, 216)
  doc.text('IEQ SEDE — Relatório Financeiro', 14, 20)

  doc.setFontSize(11)
  doc.setTextColor(107, 114, 128)
  doc.text(`Período: ${nomeMes} de ${ano}`, 14, 30)
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 37)

  const tableData = entradas.map(e => [
    formatarDataBR(e.data),
    TIPOS_LABEL[e.tipo] || e.tipo,
    e.campanha || e.evento || '—',
    e.membros?.nome || e.nome_membro || 'Anônimo',
    FORMAS_LABEL[e.forma_pagamento] || e.forma_pagamento,
    formatarValorBR(e.valor)
  ])

  autoTable(doc, {
    head: [['Data', 'Tipo', 'Campanha/Evento', 'Membro', 'Forma', 'Valor']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [29, 78, 216], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  })

  // Resumo por categoria
  const finalY = doc.lastAutoTable.finalY + 10

  doc.setFontSize(12)
  doc.setTextColor(17, 24, 39)
  doc.text('Resumo por Categoria', 14, finalY)

  const total = entradas.reduce((sum, e) => sum + parseFloat(e.valor || 0), 0)
  const resumoData = Object.entries(TIPOS_LABEL).map(([tipo, label]) => {
    const subtotal = entradas.filter(e => e.tipo === tipo).reduce((sum, e) => sum + parseFloat(e.valor || 0), 0)
    return [label, formatarValorBR(subtotal)]
  }).filter(([, v]) => v !== 'R$\xa00,00')

  resumoData.push(['TOTAL GERAL', formatarValorBR(total)])

  autoTable(doc, {
    head: [['Categoria', 'Total']],
    body: resumoData,
    startY: finalY + 5,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [55, 65, 81] },
    bodyStyles: { fontStyle: 'normal' },
    didParseCell: (data) => {
      if (data.row.index === resumoData.length - 1) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = [219, 234, 254]
      }
    }
  })

  doc.save(`relatorio-financeiro-${ano}-${String(mes).padStart(2, '0')}.pdf`)
}

export function gerarExcelMembros(membros) {
  const wb = XLSX.utils.book_new()

  const membrosAtivos = membros
    .filter(m => m.falecido !== 'Sim')
    .map(m => ({
      'Nome': m.nome || '',
      'Telefone': m.telefone || '',
      'Email': m.email || '',
      'CPF': m.cpf || '',
      'Cidade': m.cidade || '',
      'Função': m.funcao || 'Membro',
      'Status': m.status_membro || 'Ativo',
      'Data de Nascimento': formatarDataBR(m.data_nascimento),
      'Estado Civil': m.estado_civil || '',
      'Data de Cadastro': m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : ''
    }))

  const ws1 = XLSX.utils.json_to_sheet(membrosAtivos)
  XLSX.utils.book_append_sheet(wb, ws1, 'Membros Ativos')

  const aniversariantes = membros
    .filter(m => m.data_nascimento && m.falecido !== 'Sim')
    .sort((a, b) => {
      const [, mA, dA] = a.data_nascimento.split('-').map(Number)
      const [, mB, dB] = b.data_nascimento.split('-').map(Number)
      return mA !== mB ? mA - mB : dA - dB
    })
    .map(m => {
      const [ano, mes, dia] = m.data_nascimento.split('-').map(Number)
      const anoAtual = new Date().getFullYear()
      const idade = anoAtual - ano
      return {
        'Nome': m.nome || '',
        'Data de Nascimento': `${String(dia).padStart(2,'0')}/${String(mes).padStart(2,'0')}/${ano}`,
        'Mês': MESES[mes - 1],
        'Idade': idade,
        'Telefone': m.telefone || ''
      }
    })

  const ws2 = XLSX.utils.json_to_sheet(aniversariantes)
  XLSX.utils.book_append_sheet(wb, ws2, 'Aniversariantes')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'membros.xlsx')
}

export function gerarExcelFinanceiro(entradas, mes, ano) {
  const nomeMes = MESES[mes - 1]
  const wb = XLSX.utils.book_new()

  const entradasData = entradas.map(e => ({
    'Data': formatarDataBR(e.data),
    'Tipo': TIPOS_LABEL[e.tipo] || e.tipo,
    'Campanha/Evento': e.campanha || e.evento || '',
    'Membro': e.membros?.nome || e.nome_membro || 'Anônimo',
    'Forma de Pagamento': FORMAS_LABEL[e.forma_pagamento] || e.forma_pagamento,
    'Descrição': e.descricao || '',
    'Valor (R$)': parseFloat(e.valor || 0)
  }))

  const ws1 = XLSX.utils.json_to_sheet(entradasData)
  XLSX.utils.book_append_sheet(wb, ws1, 'Entradas')

  const total = entradas.reduce((sum, e) => sum + parseFloat(e.valor || 0), 0)
  const resumoData = Object.entries(TIPOS_LABEL).map(([tipo, label]) => {
    const subtotal = entradas.filter(e => e.tipo === tipo).reduce((sum, e) => sum + parseFloat(e.valor || 0), 0)
    return { 'Categoria': label, 'Total (R$)': subtotal }
  })
  resumoData.push({ 'Categoria': 'TOTAL GERAL', 'Total (R$)': total })

  const ws2 = XLSX.utils.json_to_sheet(resumoData)
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumo')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `financeiro-${nomeMes}-${ano}.xlsx`)
}
