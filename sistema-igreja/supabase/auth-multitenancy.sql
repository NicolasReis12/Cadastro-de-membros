-- =====================================================
-- SISTEMA DE LOGIN MULTI-TENANT
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. TABELA DE IGREJAS
-- Cada conta cadastrada no app cria um registro aqui
CREATE TABLE IF NOT EXISTS igrejas (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       TEXT NOT NULL,
  email      TEXT NOT NULL,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ADICIONAR igreja_id NAS TABELAS EXISTENTES
ALTER TABLE membros              ADD COLUMN IF NOT EXISTS igreja_id UUID REFERENCES igrejas(id);
ALTER TABLE entradas_financeiras ADD COLUMN IF NOT EXISTS igreja_id UUID REFERENCES igrejas(id);
ALTER TABLE campanhas            ADD COLUMN IF NOT EXISTS igreja_id UUID REFERENCES igrejas(id);
ALTER TABLE dizimos               ADD COLUMN IF NOT EXISTS igreja_id UUID REFERENCES igrejas(id);

-- 3. HABILITAR ROW LEVEL SECURITY
ALTER TABLE igrejas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros              ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE dizimos               ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACESSO

-- igrejas: cada usuário vê e gerencia apenas seu próprio perfil
CREATE POLICY "usuario gerencia sua igreja" ON igrejas
  FOR ALL USING (user_id = auth.uid());

-- membros: filtra pela igreja do usuário logado
CREATE POLICY "igreja ve seus membros" ON membros
  FOR ALL USING (
    igreja_id = (SELECT id FROM igrejas WHERE user_id = auth.uid())
  );

-- entradas_financeiras
CREATE POLICY "igreja ve suas entradas" ON entradas_financeiras
  FOR ALL USING (
    igreja_id = (SELECT id FROM igrejas WHERE user_id = auth.uid())
  );

-- campanhas
CREATE POLICY "igreja ve suas campanhas" ON campanhas
  FOR ALL USING (
    igreja_id = (SELECT id FROM igrejas WHERE user_id = auth.uid())
  );

-- dizimos
CREATE POLICY "igreja ve seus dizimos" ON dizimos
  FOR ALL USING (
    igreja_id = (SELECT id FROM igrejas WHERE user_id = auth.uid())
  );

-- =====================================================
-- MIGRAÇÃO DOS DADOS EXISTENTES
-- Execute APÓS criar a primeira conta no app.
-- Substitua '<uuid-da-sua-igreja>' pelo ID gerado
-- (consulte: SELECT id FROM igrejas LIMIT 1;)
-- =====================================================

-- UPDATE membros              SET igreja_id = '<uuid-da-sua-igreja>' WHERE igreja_id IS NULL;
-- UPDATE entradas_financeiras SET igreja_id = '<uuid-da-sua-igreja>' WHERE igreja_id IS NULL;
-- UPDATE campanhas            SET igreja_id = '<uuid-da-sua-igreja>' WHERE igreja_id IS NULL;
-- UPDATE dizimos               SET igreja_id = '<uuid-da-sua-igreja>' WHERE igreja_id IS NULL;
