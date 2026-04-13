-- ═══════════════════════════════════════════════════════════════════
--  PsicoApp — Row Level Security completo
--  Ejecutar en Supabase → SQL Editor
--  Idempotente: usa IF NOT EXISTS y DROP POLICY IF EXISTS
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────
-- 1. PROFILES
--    id = auth.uid() (no tiene columna user_id)
--    - SELECT: el usuario lee solo su propio perfil
--    - UPDATE: el usuario modifica solo su propio perfil
--    - INSERT: solo en el trigger de registro (service role), no desde frontend
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT lo hace el trigger handle_new_user con service_role → bypasea RLS.
-- Si tu trigger usa el cliente normal, descomentá esto:
-- CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- ───────────────────────────────────────────────────────────────────
-- 2. PACIENTES
--    user_id = auth.uid()
--    Soft-delete: activo = false (el UPDATE también protege esto)
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pacientes_select_own" ON pacientes;
CREATE POLICY "pacientes_select_own"
  ON pacientes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pacientes_insert_own" ON pacientes;
CREATE POLICY "pacientes_insert_own"
  ON pacientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pacientes_update_own" ON pacientes;
CREATE POLICY "pacientes_update_own"
  ON pacientes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pacientes_delete_own" ON pacientes;
CREATE POLICY "pacientes_delete_own"
  ON pacientes FOR DELETE
  USING (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
-- 3. TURNOS
--    user_id = auth.uid()
--    JOIN con pacientes en dashboard: RLS de ambas tablas se aplica
--    automáticamente en el PostgREST join — no requiere config extra.
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "turnos_select_own" ON turnos;
CREATE POLICY "turnos_select_own"
  ON turnos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "turnos_insert_own" ON turnos;
CREATE POLICY "turnos_insert_own"
  ON turnos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "turnos_update_own" ON turnos;
CREATE POLICY "turnos_update_own"
  ON turnos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "turnos_delete_own" ON turnos;
CREATE POLICY "turnos_delete_own"
  ON turnos FOR DELETE
  USING (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
-- 4. PAGOS
--    user_id = auth.uid()
--    No tiene UPDATE en el frontend (solo INSERT y DELETE)
--    Se agrega UPDATE igual por completitud y seguridad futura.
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pagos_select_own" ON pagos;
CREATE POLICY "pagos_select_own"
  ON pagos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pagos_insert_own" ON pagos;
CREATE POLICY "pagos_insert_own"
  ON pagos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pagos_update_own" ON pagos;
CREATE POLICY "pagos_update_own"
  ON pagos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pagos_delete_own" ON pagos;
CREATE POLICY "pagos_delete_own"
  ON pagos FOR DELETE
  USING (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
-- 5. SESIONES_CLINICAS
--    user_id = auth.uid()
--    Datos clínicos sensibles — acceso completamente restringido al dueño
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE sesiones_clinicas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sesiones_select_own" ON sesiones_clinicas;
CREATE POLICY "sesiones_select_own"
  ON sesiones_clinicas FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sesiones_insert_own" ON sesiones_clinicas;
CREATE POLICY "sesiones_insert_own"
  ON sesiones_clinicas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sesiones_update_own" ON sesiones_clinicas;
CREATE POLICY "sesiones_update_own"
  ON sesiones_clinicas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sesiones_delete_own" ON sesiones_clinicas;
CREATE POLICY "sesiones_delete_own"
  ON sesiones_clinicas FOR DELETE
  USING (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
-- 6. HISTORIAS_CLINICAS
--    user_id = auth.uid()
--    Un registro por paciente con info clínica global (diagnóstico, etc.)
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE historias_clinicas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "historias_select_own" ON historias_clinicas;
CREATE POLICY "historias_select_own"
  ON historias_clinicas FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "historias_insert_own" ON historias_clinicas;
CREATE POLICY "historias_insert_own"
  ON historias_clinicas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "historias_update_own" ON historias_clinicas;
CREATE POLICY "historias_update_own"
  ON historias_clinicas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "historias_delete_own" ON historias_clinicas;
CREATE POLICY "historias_delete_own"
  ON historias_clinicas FOR DELETE
  USING (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
-- 7. PERICIAS
--    user_id = auth.uid()
--    Módulo de gestión de causas judiciales — datos legalmente sensibles
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE pericias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pericias_select_own" ON pericias;
CREATE POLICY "pericias_select_own"
  ON pericias FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pericias_insert_own" ON pericias;
CREATE POLICY "pericias_insert_own"
  ON pericias FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pericias_update_own" ON pericias;
CREATE POLICY "pericias_update_own"
  ON pericias FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pericias_delete_own" ON pericias;
CREATE POLICY "pericias_delete_own"
  ON pericias FOR DELETE
  USING (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
-- 8. USERS_PLAN
--    user_id = auth.uid()
--    Solo SELECT desde el frontend — INSERT/UPDATE lo hace el webhook
--    de MercadoPago con service_role (bypasea RLS).
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE users_plan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_plan_select_own" ON users_plan;
CREATE POLICY "users_plan_select_own"
  ON users_plan FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT y UPDATE: solo service_role (webhook MP / Edge Functions)
-- No se crean políticas de escritura para el cliente anon.


-- ───────────────────────────────────────────────────────────────────
-- VERIFICACIÓN — ejecutá esto después para ver el estado de todas las tablas
-- ───────────────────────────────────────────────────────────────────
/*
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT
  schemaname,
  tablename,
  policyname,
  cmd AS operacion,
  qual AS using_expr,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
*/
