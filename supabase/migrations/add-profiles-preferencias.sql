-- ═══════════════════════════════════════════════════════════════════
-- PsicoApp — Migración: agregar columna preferencias a profiles
-- Ejecutar en el SQL Editor de Supabase si la columna no existe.
-- Es idempotente (no falla si la columna ya existe).
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferencias JSONB DEFAULT '{}'::jsonb;

-- Comentario descriptivo
COMMENT ON COLUMN profiles.preferencias IS
  'Preferencias del usuario: cal_vista, agenda_inicio, agenda_fin, etc.';
