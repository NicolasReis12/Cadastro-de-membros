-- ============================================================
-- PASSO 1: Desabilitar confirmação de email no Supabase
-- Dashboard > Authentication > Settings > Email Auth
-- Desmarcar "Enable email confirmations"
-- ============================================================

-- Tabela de usuários por igreja (sub-usuários criados pelo admin)
CREATE TABLE IF NOT EXISTS public.usuarios_igreja (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  igreja_id     uuid NOT NULL REFERENCES public.igrejas(id) ON DELETE CASCADE,
  nome          text NOT NULL,
  email         text NOT NULL,
  is_admin      boolean NOT NULL DEFAULT false,
  ativo         boolean NOT NULL DEFAULT true,
  permissoes    jsonb NOT NULL DEFAULT '{
    "dashboard": true,
    "membros": false,
    "aniversariantes": false,
    "entradas": false,
    "ofertas": false,
    "ofertas_especiais": false,
    "relatorios": false
  }'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(auth_user_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.usuarios_igreja ENABLE ROW LEVEL SECURITY;

-- Dono da igreja (igrejas.user_id) tem acesso total
CREATE POLICY "owner_full_access" ON public.usuarios_igreja
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.igrejas
      WHERE igrejas.id = usuarios_igreja.igreja_id
        AND igrejas.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.igrejas
      WHERE igrejas.id = usuarios_igreja.igreja_id
        AND igrejas.user_id = auth.uid()
    )
  );

-- Sub-admin (is_admin=true) pode gerenciar usuários da mesma igreja
CREATE POLICY "subadmin_manage" ON public.usuarios_igreja
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_igreja AS me
      WHERE me.auth_user_id = auth.uid()
        AND me.igreja_id = usuarios_igreja.igreja_id
        AND me.is_admin = true
        AND me.ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios_igreja AS me
      WHERE me.auth_user_id = auth.uid()
        AND me.igreja_id = usuarios_igreja.igreja_id
        AND me.is_admin = true
        AND me.ativo = true
    )
  );

-- Qualquer sub-usuário pode ler seu próprio registro (para carregar permissões no login)
CREATE POLICY "self_read" ON public.usuarios_igreja
  FOR SELECT
  USING (auth_user_id = auth.uid());
