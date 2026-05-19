-- =====================================================
-- TABELAS: OFERTAS E OFERTAS ESPECIAIS
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. TABELA DE OFERTAS
CREATE TABLE IF NOT EXISTS ofertas (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membro_id        UUID REFERENCES membros(id) ON DELETE SET NULL,
  nome_membro      TEXT,
  valor            NUMERIC(10,2) NOT NULL,
  data             DATE NOT NULL,
  forma_pagamento  TEXT CHECK (forma_pagamento IN ('dinheiro','pix','cartao','transferencia')) DEFAULT 'dinheiro',
  descricao        TEXT,
  igreja_id        UUID REFERENCES igrejas(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE OFERTAS ESPECIAIS
CREATE TABLE IF NOT EXISTS ofertas_especiais (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membro_id        UUID REFERENCES membros(id) ON DELETE SET NULL,
  nome_membro      TEXT,
  motivo           TEXT,
  valor            NUMERIC(10,2) NOT NULL,
  data             DATE NOT NULL,
  forma_pagamento  TEXT CHECK (forma_pagamento IN ('dinheiro','pix','cartao','transferencia')) DEFAULT 'dinheiro',
  descricao        TEXT,
  igreja_id        UUID REFERENCES igrejas(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 3. HABILITAR RLS
ALTER TABLE ofertas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas_especiais ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACESSO
CREATE POLICY "igreja ve suas ofertas" ON ofertas
  FOR ALL USING (
    igreja_id = (SELECT id FROM igrejas WHERE user_id = auth.uid())
  );

CREATE POLICY "igreja ve suas ofertas especiais" ON ofertas_especiais
  FOR ALL USING (
    igreja_id = (SELECT id FROM igrejas WHERE user_id = auth.uid())
  );

-- 5. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_ofertas_data          ON ofertas(data);
CREATE INDEX IF NOT EXISTS idx_ofertas_igreja        ON ofertas(igreja_id);
CREATE INDEX IF NOT EXISTS idx_of_esp_data           ON ofertas_especiais(data);
CREATE INDEX IF NOT EXISTS idx_of_esp_igreja         ON ofertas_especiais(igreja_id);
