-- ─────────────────────────────────────────────────────────────────────────────
-- Tabla: wa_historial
-- Historial de mensajes WhatsApp enviados por cada psicólogo.
-- El frontend (view-whatsapp.js) inserta con "user_id" y lee con "user_id".
-- La Edge Function también inserta aquí para que los automáticos sean visibles.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists wa_historial (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references profiles(id) on delete cascade,
  paciente_id uuid        references pacientes(id) on delete set null,
  turno_id    uuid        references turnos(id)    on delete set null,
  tipo        text        not null default 'libre'
              check (tipo in ('libre','confirmacion','recordatorio','pago','automatico')),
  mensaje     text        not null default '',
  twilio_sid  text,
  estado      text        not null default 'enviado'
              check (estado in ('enviado','error','pendiente')),
  created_at  timestamptz not null default now()
);

-- Índices
create index if not exists idx_wa_hist_user_id    on wa_historial (user_id);
create index if not exists idx_wa_hist_created_at on wa_historial (created_at desc);
create index if not exists idx_wa_hist_paciente    on wa_historial (paciente_id);
create index if not exists idx_wa_hist_turno       on wa_historial (turno_id);

-- RLS: cada psicólogo ve solo sus mensajes
alter table wa_historial enable row level security;

create policy "Psicologo ve su historial" on wa_historial
  for select using (auth.uid() = user_id);

create policy "Psicologo inserta su historial" on wa_historial
  for insert with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Tabla: notificaciones_wa
-- Usada internamente por las Edge Functions para trazabilidad de automáticos.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists notificaciones_wa (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references profiles(id)  on delete cascade,
  paciente_id uuid        references pacientes(id) on delete set null,
  mensaje     text,
  tipo        text        default 'automatico',
  estado      text        default 'enviado',
  twilio_sid  text,
  enviado_at  timestamptz,
  created_at  timestamptz default now()
);

create index if not exists idx_notif_wa_user_id on notificaciones_wa (user_id);

alter table notificaciones_wa enable row level security;

create policy "Psicologo ve sus notificaciones" on notificaciones_wa
  for select using (auth.uid() = user_id);
