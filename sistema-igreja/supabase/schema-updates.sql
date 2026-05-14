-- ============================================================
-- SISTEMA IGREJA - Script de atualizações de schema
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- ------------------------------------------------------------
-- 1. NOVOS CAMPOS NA TABELA MEMBROS
-- ------------------------------------------------------------

ALTER TABLE membros
  ADD COLUMN IF NOT EXISTS funcao TEXT DEFAULT 'Membro',
  ADD COLUMN IF NOT EXISTS status_membro TEXT DEFAULT 'Ativo';

-- Opcional: adicionar constraints de validação
-- ALTER TABLE membros
--   ADD CONSTRAINT membros_funcao_check
--     CHECK (funcao IN ('Membro','Diácono','Presbítero','Pastor','Líder de Ministério','Visitante')),
--   ADD CONSTRAINT membros_status_membro_check
--     CHECK (status_membro IN ('Ativo','Inativo','Transferido','Falecido'));

-- ------------------------------------------------------------
-- 2. TABELA DE CAMPANHAS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS campanhas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT NOT NULL,
  descricao   TEXT,
  meta        NUMERIC(10,2),
  ativa       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. TABELA DE ENTRADAS FINANCEIRAS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS entradas_financeiras (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo             TEXT NOT NULL
                     CHECK (tipo IN ('dizimo','oferta_geral','campanha','venda_evento','doacao')),
  campanha         TEXT,
  evento           TEXT,
  membro_id        UUID REFERENCES membros(id) ON DELETE SET NULL,
  nome_membro      TEXT,   -- nome livre quando membro não está cadastrado
  valor            NUMERIC(10,2) NOT NULL,
  data             DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao        TEXT,
  forma_pagamento  TEXT DEFAULT 'dinheiro'
                     CHECK (forma_pagamento IN ('dinheiro','pix','cartao','transferencia')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Se a tabela já existia, adicione a coluna:
ALTER TABLE entradas_financeiras ADD COLUMN IF NOT EXISTS nome_membro TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_entradas_tipo    ON entradas_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_entradas_data    ON entradas_financeiras(data);
CREATE INDEX IF NOT EXISTS idx_entradas_membro  ON entradas_financeiras(membro_id);

-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- Habilite conforme sua política de autenticação.
-- Se o sistema não tem autenticação, mantenha RLS desabilitado
-- ou use a política abaixo para acesso público (apenas para dev).
-- ------------------------------------------------------------

-- ALTER TABLE entradas_financeiras ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Acesso público" ON entradas_financeiras FOR ALL USING (true);

-- ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Acesso público" ON campanhas FOR ALL USING (true);

-- ------------------------------------------------------------
-- 5. MIGRAÇÃO OPCIONAL: dízimos existentes → entradas_financeiras
-- Execute apenas se quiser consolidar os dados históricos.
-- ATENÇÃO: verifique a estrutura da tabela 'dizimos' antes.
-- ------------------------------------------------------------

-- INSERT INTO entradas_financeiras (tipo, valor, data, created_at)
-- SELECT
--   'dizimo'    AS tipo,
--   valor,
--   data,
--   created_at
-- FROM dizimos
-- ON CONFLICT DO NOTHING;
