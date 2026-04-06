-- ─────────────────────────────────────────────────────────────────────────────
-- Tabla: recordatorios_logs
-- Trazabilidad completa de cada recordatorio enviado o fallido.
-- Ejecutar en Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists recordatorios_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references profiles(id) on delete cascade,
  turno_id         uuid,
  paciente_nombre  text,
  telefono         text,
  fecha_turno      date,
  hora_turno       text,
  estado           text check (estado in ('enviado', 'error', 'sin_telefono')),
  error            text,
  twilio_sid       text,
  created_at       timestamptz default now()
);

-- Índices para consultas frecuentes
create index if not exists idx_rec_logs_user_id    on recordatorios_logs (user_id);
create index if not exists idx_rec_logs_created_at on recordatorios_logs (created_at desc);
create index if not exists idx_rec_logs_estado      on recordatorios_logs (estado);
create index if not exists idx_rec_logs_turno_id    on recordatorios_logs (turno_id);

-- RLS: cada psicólogo solo ve sus propios logs
alter table recordatorios_logs enable row level security;

create policy "Psicólogo ve sus logs" on recordatorios_logs
  for select using (auth.uid() = user_id);

-- El service_role (Edge Function) puede insertar sin restricciones
-- (el service_role bypasea RLS por defecto en Supabase)
