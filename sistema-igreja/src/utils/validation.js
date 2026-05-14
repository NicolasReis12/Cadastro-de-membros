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
