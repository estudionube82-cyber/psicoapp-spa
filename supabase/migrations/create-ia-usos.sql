-- ═══════════════════════════════════════════════════════════════════
-- PsicoApp — Migración: tabla ia_usos
-- Registra cada uso de generación de informes IA por usuario.
-- Ejecutar en el SQL Editor de Supabase si la tabla no existe.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ia_usos (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo       TEXT        NOT NULL DEFAULT 'informe',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para acelerar el conteo mensual por usuario
CREATE INDEX IF NOT EXISTS ia_usos_user_mes
  ON ia_usos (user_id, created_at DESC);

-- ── RLS ────────────────────────────────────────────────────────────
ALTER TABLE ia_usos ENABLE ROW LEVEL SECURITY;

-- El usuario solo puede leer sus propios registros
CREATE POLICY "ia_usos_select_own"
  ON ia_usos FOR SELECT
  USING (auth.uid() = user_id);

-- El usuario puede insertar sus propios registros
-- (también lo hace la Edge Function con service role, que bypasea RLS)
CREATE POLICY "ia_usos_insert_own"
  ON ia_usos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE ia_usos IS 'Registro de usos de IA por usuario y mes para control de límites.';
