-- SQL para adicionar novos campos na tabela 'membros' no Supabase
-- Executar estes comandos no SQL Editor do Supabase

-- Campos de Texto
ALTER TABLE membros ADD COLUMN IF NOT EXISTS estado_civil TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS nome_esposo TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS nome_pai TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS nome_mae TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS grau_instrucao TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS profissao TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS documento_identidade TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS religiao_anterior TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS recebeu_cura_libertacao TEXT; -- 'Sim' ou 'Não'
ALTER TABLE membros ADD COLUMN IF NOT EXISTS descricao_cura_libertacao TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS parentes_na_igreja TEXT; -- 'Sim' ou 'Não'
ALTER TABLE membros ADD COLUMN IF NOT EXISTS nome_parentes_igreja TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS ministro_oficiante TEXT;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS batizado_espirito_santo TEXT; -- 'Sim' ou 'Não'
ALTER TABLE membros ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Campos de Data (em formato ISO 8601: YYYY-MM-DD)
ALTER TABLE membros ADD COLUMN IF NOT EXISTS data_conversao DATE;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS data_batismo DATE;
ALTER TABLE membros ADD COLUMN IF NOT EXISTS data_batismo_espirito DATE;

-- Para campos com tipos Sim/Não, se preferir usar booleanos no futuro:
-- ALTER TABLE membros ADD COLUMN IF NOT EXISTS recebeu_cura_libertacao BOOLEAN DEFAULT NULL;
-- ALTER TABLE membros ADD COLUMN IF NOT EXISTS parentes_na_igreja BOOLEAN DEFAULT NULL;
-- ALTER TABLE membros ADD COLUMN IF NOT EXISTS batizado_espirito_santo BOOLEAN DEFAULT NULL;

-- Observações importantes:
-- 1. Os campos com valores 'Sim' ou 'Não' são do tipo TEXT para manter compatibilidade com o formulário
-- 2. As datas são do tipo DATE em formato YYYY-MM-DD (ISO 8601)
-- 3. O sistema frontend converte DD/MM/YYYY → YYYY-MM-DD antes de salvar
-- 4. O sistema frontend converte YYYY-MM-DD → DD/MM/YYYY ao exibir
-- 5. Todos os campos são OPCIONAIS (podem ser NULL)
