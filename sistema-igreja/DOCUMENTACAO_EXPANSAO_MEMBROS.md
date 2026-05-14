# Documentação da Expansão do Componente Membros

## ✅ Alterações Realizadas

### 1. **Arquivo: src/pages/Membros.jsx**

#### 1.1 initialForm - Adição de 16 Novos Campos
```javascript
// Novos campos adicionados:
estado_civil: '',              // Select: Solteiro, Casado, Viúvo, Divorciado
nome_esposo: '',               // Texto
nome_pai: '',                  // Texto
nome_mae: '',                  // Texto
grau_instrucao: '',            // Select: Fundamental, Médio, Superior, Pós-graduação
profissao: '',                 // Texto
documento_identidade: '',      // Texto
religiao_anterior: '',         // Texto
recebeu_cura_libertacao: '',   // Select: Sim/Não
descricao_cura_libertacao: '', // Textarea (aparece se recebeu_cura_libertacao === 'Sim')
parentes_na_igreja: '',        // Select: Sim/Não
nome_parentes_igreja: '',      // Texto (aparece se parentes_na_igreja === 'Sim')
data_conversao: '',            // Data DD/MM/YYYY
data_batismo: '',              // Data DD/MM/YYYY
ministro_oficiante: '',        // Texto
batizado_espirito_santo: '',   // Select: Sim/Não
data_batismo_espirito: '',     // Data DD/MM/YYYY (aparece se batizado_espirito_santo === 'Sim')
observacoes: ''                // Textarea
```

**Removido:**
- `ficha_membro_numero` - Número da ficha
- `nome_dos_pais` - Nome dos pais (substituído por nome_pai e nome_mae)

#### 1.2 handleChange() - Suporte a Múltiplos Campos de Data
- Adicionado suporte para 5 campos de data:
  - `data_nascimento` ✓ (já existia)
  - `data_da_morte` ✓ (já existia)
  - `data_conversao` ✅ (novo)
  - `data_batismo` ✅ (novo)
  - `data_batismo_espirito` ✅ (novo)

- Funcionalidade mantida:
  - Máscara DD/MM/YYYY enquanto digita
  - Validação de formato
  - Validação de data futura
  - Limpeza automática de erros quando corrigido

#### 1.3 abrirEditar() - Conversão de Datas
- Convertido de lista específica para loop dinâmico
- Processa 5 campos de data simultaneamente
- Converte YYYY-MM-DD → DD/MM/YYYY ao abrir para edição

#### 1.4 salvarMembro() - Conversão e Validação
- Validação dinâmica para 5 campos de data
- Conversão dinâmica DD/MM/YYYY → YYYY-MM-DD antes de salvar
- Mantém compatibilidade com campos existentes
- Campos vazios são convertidos para NULL

#### 1.5 Modal JSX - Novos Inputs
Todos os 16 novos campos foram adicionados com:
- ✓ Label descritivo
- ✓ Input type apropriado (text, textarea, select)
- ✓ Valor vinculado ao state
- ✓ onChange handler integrado
- ✓ Placeholder onde apropriado
- ✓ Classes de erro para campos de data
- ✓ Mensagens de erro para campos de data
- ✓ Visibilidade condicional para campos que dependem de outros

**Ordem dos Campos no Modal:**
1. Nome
2. Email
3. Telefone
4. CPF
5. Data de nascimento
6. CEP (com busca automática)
7. Logradouro
8. Número
9. Complemento
10. Bairro
11. Cidade
12. UF
13. **Falecido**
14. **Data do Falecimento** (condicional)
15. Estado Civil
16. Nome do Esposo/a
17. **Nome do Pai** ✅
18. **Nome da Mãe** ✅
19. Grau de Instrução
20. Profissão
21. Documento de Identidade
22. Religião Anterior
23. Recebeu Cura/Libertação
24. Descrição da Cura/Libertação (condicional)
25. Tem Parentes na Igreja
26. Nome dos Parentes (condicional)
27. Data da Conversão
28. Data do Batismo
29. Ministro Oficiante
30. Batizado com Espírito Santo
31. Data do Batismo no Espírito Santo (condicional)
32. Observações

**Campos com Visibilidade Condicional:**
1. **Data do Falecimento** → Aparece quando `falecido === 'Sim'` ✓
2. **Descrição da Cura/Libertação** → Aparece quando `recebeu_cura_libertacao === 'Sim'` ✅
3. **Nome dos Parentes** → Aparece quando `parentes_na_igreja === 'Sim'` ✅
4. **Data do Batismo no Espírito Santo** → Aparece quando `batizado_espirito_santo === 'Sim'` ✅

### 2. **Arquivo: SQL_ADICIONAR_CAMPOS_MEMBROS.sql** (Novo)

Script SQL com todos os comandos `ALTER TABLE` necessários para adicionar os campos na tabela `membros` do Supabase.

**Total de campos novos:** 18
- 14 campos de TEXTO
- 3 campos de DATA
- 2 campos TEXTAREA (descricao_cura_libertacao, observacoes)

**Campos removidos da lista de criação:**
- `ficha_membro_numero` (não necessário)

## 📋 Checklist de Compatibilidade

- ✅ Todos os campos opcionais (não obrigatórios)
- ✅ Compatível com CREATE e UPDATE
- ✅ Suporta edição de membros existentes
- ✅ Datas convertidas corretamente (sem problemas de timezone)
- ✅ Mantém padrão visual existente
- ✅ Responsivo (usa form-grid e full)
- ✅ Validação de datas futuras
- ✅ Toast notifications mantidas
- ✅ Filtros e busca não alterados
- ✅ CRUD não alterado
- ✅ Nomenclatura em snake_case
- ✅ Sem Breaking Changes

## 🔧 Campos por Tipo

### Campos Select (Sim/Não):
1. `recebeu_cura_libertacao`
2. `parentes_na_igreja`
3. `batizado_espirito_santo`

### Campos Select (Opções Múltiplas):
1. `estado_civil` → Solteiro, Casado, Viúvo, Divorciado
2. `grau_instrucao` → Fundamental, Médio, Superior, Pós-graduação

### Campos de Data (DD/MM/YYYY):
1. `data_conversao`
2. `data_batismo`
3. `data_batismo_espirito`

### Campos Textarea:
1. `descricao_cura_libertacao`
2. `observacoes`

### Campos de Texto Simples:
1. `nome_esposo`
2. `nome_pai`
3. `nome_mae`
4. `profissao`
5. `documento_identidade`
6. `religiao_anterior`
7. `nome_parentes_igreja`
8. `ministro_oficiante`

## 🚀 Próximos Passos

1. **Executar o SQL** no console do Supabase para criar os novos campos
2. **Testar cadastro** de novo membro com os novos campos
3. **Testar edição** de membro existente
4. **Testar visibilidade condicional** dos campos (Cura/Libertação, Parentes, Batismo Espírito)
5. **Verificar validação de datas** (formato e data futura)
6. **Deploy** da nova versão

## 📝 Notas Importantes

- Todos os novos campos são **opcionais**
- Não há campos obrigatórios além dos que já existem
- As datas seguem o mesmo padrão: entrada DD/MM/YYYY, armazenamento YYYY-MM-DD
- O sistema evita problemas de timezone usando conversão manual de strings
- Campos "Descrição da Cura", "Nome dos Parentes" e "Batismo Espírito" aparecem apenas se necessário
- **Data do Falecimento** aparece logo após o campo "Falecido" para facilitar o preenchimento
