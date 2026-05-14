# 🏢 Sistema de Cadastro de Membros da Igreja

Um sistema web moderno e intuitivo para gerenciar membros, dízimos e aniversariantes de uma comunidade religiosa. Desenvolvido com React, Vite e Supabase.

## 📋 Funcionalidades

### 👥 Gerenciar Membros
- **Cadastrar novos membros** com informações completas
- **Editar dados** de membros existentes
- **Deletar membros** do sistema
- **Visualizar lista completa** de membros ordenada alfabeticamente
- **Preenchimento automático de endereço** via integração com ViaCEP

### 💰 Controle de Dízimos
- **Registrar dízimos** de membros
- **Acompanhar histórico** de contribuições
- **Visualizar relatórios** de dízimos por período

### 🎂 Aniversariantes
- **Visualizar aniversariantes** do mês
- **Identificar datas de aniversário** dos membros
- **Gerenciar ações** para datas especiais

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19.2.5 com Vite 8
- **Routing:** React Router DOM 7.14.2
- **Banco de Dados:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS com Vite
- **Linting:** ESLint
- **Deploy:** Vercel

## 📦 Dependências Principais

```json
{
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "react-router-dom": "^7.14.2",
  "@supabase/supabase-js": "^2.104.1",
  "@tailwindcss/vite": "^4.2.4"
}
```



## 🚀 Como Installar e Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sistema-igreja.git
cd sistema-igreja
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`


## 🔐 Configuração do Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Crie as tabelas conforme a estrutura de banco de dados acima
4. Configure as políticas de acesso (Row Level Security) conforme necessário
5. Obtenha a URL do projeto e a chave anônima
6. Configure as variáveis de ambiente do projeto

## 🌐 Deploy

O projeto está configurado para deploy automático na Vercel:

```bash
npm run build
npx vercel --prod
```

## 📝 Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_anonima
```

## 🤝 Contribuindo

Sinta-se livre para fazer fork do projeto, criar uma branch para sua feature e enviar um pull request.

## 📄 Licença

Este projeto está sob a licença MIT.

## 📧 Contato

Para dúvidas ou sugestões sobre o projeto, entre em contato através do GitHub Issues.

---

**Desenvolvido com ❤️ para gerenciar membros de comunidades religiosas**
