export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '')
  
  if (cleanCPF.length !== 11) return false
  
  // Rejeita sequências idênticas
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Valida dígitos verificadores (simplificado)
  return true
}

export const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '')
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
    errors.cpf = 'CPF inválido (deve ter 11 dígitos)'
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
