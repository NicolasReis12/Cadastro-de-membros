const cleanNumber = (value) => value?.toString().replace(/\D/g, '') || ''

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validateCPF = (cpf) => {
  const cleanCPF = cleanNumber(cpf)

  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  const calcDigit = (length) => {
    const numbers = cleanCPF
      .slice(0, length)
      .split('')
      .map(Number)

    const weight = length + 1
    const sum = numbers.reduce((acc, num, index) => acc + num * (weight - index), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  const digit1 = calcDigit(9)
  const digit2 = calcDigit(10)

  return digit1 === Number(cleanCPF[9]) && digit2 === Number(cleanCPF[10])
}

export const validatePhone = (phone) => {
  const cleanPhone = cleanNumber(phone)
  return cleanPhone.length === 10 || cleanPhone.length === 11
}

export const validateForm = (form, requiredFields) => {
  const errors = {}

  requiredFields.forEach(field => {
    if (!form[field] || form[field].toString().trim() === '') {
      errors[field] = `${field} é obrigatório`
    }
  })

  if (form.email && form.email.trim() && !validateEmail(form.email)) {
    errors.email = 'Email inválido'
  }

  if (form.cpf && form.cpf.trim() && !validateCPF(form.cpf)) {
    errors.cpf = 'CPF inválido (11 dígitos)'
  }

  if (form.telefone && form.telefone.trim() && !validatePhone(form.telefone)) {
    errors.telefone = 'Telefone inválido (10 ou 11 dígitos)'
  }

  if (form.data_nascimento && form.data_nascimento) {
    const dataNasc = new Date(form.data_nascimento)
    const hoje = new Date()
    if (dataNasc > hoje) {
      errors.data_nascimento = 'Data de nascimento não pode ser no futuro'
    }
  }

  return errors
}

// Conversão de data DD/MM/YYYY para YYYY-MM-DD (para salvar no banco)
export const convertDDMMYYYYtoYYYYMMDD = (dataBR) => {
  if (!dataBR || !dataBR.trim()) return null
  
  const partes = dataBR.trim().split('/')
  if (partes.length !== 3) return null
  
  const [dia, mes, ano] = partes
  const diaNum = parseInt(dia, 10)
  const mesNum = parseInt(mes, 10)
  const anoNum = parseInt(ano, 10)
  
  // Validar dia (1-31), mês (1-12), ano (1900-2100)
  if (diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12 || anoNum < 1900 || anoNum > 2100) {
    return null
  }
  
  // Validar se é um dia válido para o mês (sem usar Date para evitar problemas de timezone)
  const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const ehBissexto = (anoNum % 4 === 0 && anoNum % 100 !== 0) || (anoNum % 400 === 0)
  if (ehBissexto) diasPorMes[1] = 29
  
  if (diaNum > diasPorMes[mesNum - 1]) {
    return null
  }
  
  // Retornar no formato YYYY-MM-DD
  return `${anoNum}-${String(mesNum).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`
}

// Validar data no formato DD/MM/YYYY
export const validateDataBR = (dataBR) => {
  return convertDDMMYYYYtoYYYYMMDD(dataBR) !== null
}

// Formatar data YYYY-MM-DD para DD/MM/YYYY
export const formatarDataBR = (dataISO) => {
  if (!dataISO) return ''
  
  // Se já está no formato DD/MM/YYYY, retornar como está
  if (dataISO.includes('/')) return dataISO
  
  try {
    // Parse data sem fuso horário
    const [ano, mes, dia] = dataISO.split('-')
    if (!ano || !mes || !dia) return ''
    
    return `${dia}/${mes}/${ano}`
  } catch {
    return ''
  }
}

// Validar se a data é posterior a outra data
export const isDataFutura = (dataISO) => {
  if (!dataISO) return false
  
  try {
    const [ano, mes, dia] = dataISO.split('-')
    const hoje = new Date()
    const anoHoje = hoje.getFullYear()
    const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0')
    const diaHoje = String(hoje.getDate()).padStart(2, '0')
    const hojeISO = `${anoHoje}-${mesHoje}-${diaHoje}`
    
    return dataISO > hojeISO
  } catch {
    return false
  }
}
