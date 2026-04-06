# send-reminders — Edge Function

Envía recordatorios de WhatsApp 24hs antes del turno, vía Twilio.

---

## Deploy

```bash
supabase functions deploy send-reminders --no-verify-jwt
```

---

## Variables de entorno (Supabase Dashboard → Settings → Edge Functions)

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | Automática (ya existe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Automática (ya existe) |
| `TWILIO_AUTH_TOKEN` | Token secreto de Twilio |
| `TWILIO_ACCOUNT_SID` | SID de tu cuenta Twilio (opcional, hay fallback) |
| `TWILIO_MESSAGING_SID` | Messaging Service SID (opcional, hay fallback) |
| `TWILIO_CONTENT_SID` | Content SID del template aprobado (opcional, hay fallback) |
| `TWILIO_WA_FROM` | Número Twilio WhatsApp (opcional, hay fallback) |

---

## SQL requerido

Ejecutar en Supabase SQL Editor antes del primer deploy:

```sql
-- Columnas necesarias en turnos
ALTER TABLE turnos
  ADD COLUMN IF NOT EXISTS recordatorio_enviado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recordatorio_fecha   timestamptz;

-- Índice para que la query de mañana sea rápida
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_recordatorio
  ON turnos (user_id, fecha, recordatorio_enviado)
  WHERE recordatorio_enviado = false;

-- Columnas necesarias en profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS recordatorio_auto boolean DEFAULT false;
```

---

## Cron (Supabase Dashboard → Database → Cron Jobs)

```sql
-- Todos los días a las 20:00 UTC = 17:00 ART
select cron.schedule(
  'send-reminders-daily',
  '0 20 * * *',
  $$
  select net.http_post(
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/send-reminders',
    headers := '{"Authorization": "Bearer TU_ANON_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);
```

---

## Test manual

```bash
# Diagnóstico: no envía, solo reporta qué encontraría
curl -X POST https://TU_PROJECT_REF.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"debug": true}'

# Envío real (producción)
curl -X POST https://TU_PROJECT_REF.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Lógica de idempotencia

```
Para cada turno de mañana:
  1. Consulta: recordatorio_enviado = false OR NULL
  2. Llama a Twilio
  3. Si Twilio OK  → marca recordatorio_enviado = true  ← solo aquí
  4. Si Twilio falla → NO marca → el cron de mañana reintentará
```

Si el cron corre dos veces el mismo día, el segundo pass encuentra
`recordatorio_enviado = true` y omite esos turnos. Nunca hay duplicados.

---

## Logs esperados (ejemplo)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[send-reminders] Iniciando ejecución
[send-reminders] Hora UTC actual  : 2026-04-05T20:00:01.234Z
[send-reminders] Hoy en Argentina : 2026-04-05
[send-reminders] Mañana (objetivo): 2026-04-06
[send-reminders] Modo debug       : false
[send-reminders] Modo force       : false
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[send-reminders] Psicólogos con recordatorio_auto=true: 1

[send-reminders] ── Psicólogo: uuid-del-psicologo (Dra. López)
[send-reminders]   Turnos totales mañana (2026-04-06): 3
[send-reminders]   Turno abc123 | 09:00 | Juan Pérez | tel: ✓ | recordatorio_enviado: NULL
[send-reminders]   Turno def456 | 11:00 | María Gómez | tel: ✓ | recordatorio_enviado: false
[send-reminders]   Turno ghi789 | 14:00 | Sin Telefono | tel: ✗ | recordatorio_enviado: false
[send-reminders]   Ya enviados: 0 | A procesar ahora: 3
[send-reminders]   Procesando turno abc123 | 09:00 | Juan → whatsapp:+5491112345678
[send-reminders]   ✅ Turno abc123 enviado y marcado. SID: SMxxxxx
[send-reminders]   Procesando turno def456 | 11:00 | María → whatsapp:+5491187654321
[send-reminders]   ✅ Turno def456 enviado y marcado. SID: SMyyyy
[send-reminders]   ⚠ Turno ghi789: paciente sin teléfono — omitido

── Resultado final ──────────────────
{
  "ok": true,
  "hoy": "2026-04-05",
  "manana": "2026-04-06",
  "psicologos": 1,
  "enviados": 2,
  "errores": 0,
  "sin_telefono": 1,
  "ya_enviados": 0
}
```
