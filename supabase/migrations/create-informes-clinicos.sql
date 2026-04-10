-- ═══════════════════════════════════════════════════════════════════
-- PsicoApp — Migración: tabla informes_clinicos
-- Ejecutar en el SQL Editor de Supabase si la tabla no existe.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS informes_clinicos (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id UUID        NOT NULL,
  tipo        TEXT        NOT NULL DEFAULT 'clinico',
  texto       TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para cargar historial por paciente rápidamente
CREATE INDEX IF NOT EXISTS informes_clinicos_paciente
  ON informes_clinicos (user_id, paciente_id, created_at DESC);

-- ── RLS ────────────────────────────────────────────────────────────
ALTER TABLE informes_clinicos ENABLE ROW LEVEL SECURITY;

-- El usuario solo puede ver sus propios informes
CREATE POLICY "informes_select_own"
  ON informes_clinicos FOR SELECT
  USING (auth.uid() = user_id);

-- El usuario solo puede insertar sus propios informes
CREATE POLICY "informes_insert_own"
  ON informes_clinicos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- El usuario puede eliminar sus propios informes
CREATE POLICY "informes_delete_own"
  ON informes_clinicos FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE informes_clinicos IS 'Informes clínicos generados por IA, guardados por el profesional.';
