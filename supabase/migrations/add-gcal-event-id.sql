-- ═══════════════════════════════════════════════════════════════
-- PsicoApp — Migración: agregar gcal_event_id a tabla turnos
-- Ejecutar en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE turnos
  ADD COLUMN IF NOT EXISTS gcal_event_id TEXT DEFAULT NULL;

COMMENT ON COLUMN turnos.gcal_event_id IS 'ID del evento en Google Calendar asociado a este turno';
