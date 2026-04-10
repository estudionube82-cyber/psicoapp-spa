// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: send-reminders
// Cron sugerido: todos los días a las 20:00 UTC (= 17:00 ART)
//
// Qué hace:
//   1. Calcula "mañana" en zona horaria Argentina (UTC-3), sin depender del TZ
//      del servidor Deno.
//   2. Busca turnos de mañana con recordatorio_enviado = false (o NULL).
//   3. PRIMERO envía por Twilio; SOLO si responde OK marca recordatorio_enviado.
//   4. Logs detallados: fechas evaluadas, IDs procesados, diagnóstico de estado.
//
// Trigger manual desde el frontend o cron:
//   POST /functions/v1/send-reminders
//   Body (opcional): { "debug": true }   → sólo diagnóstico, no envía ni marca
//                    { "force": true }   → envía aunque no sea el día correcto
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2'

// ── Credenciales ──────────────────────────────────────────────────────────────
const SUPA_URL         = Deno.env.get('SUPABASE_URL')!
const SUPA_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TWILIO_SID       = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_TOKEN     = Deno.env.get('TWILIO_AUTH_TOKEN')!
const MESSAGING_SID    = Deno.env.get('TWILIO_MESSAGING_SID')!
const CONTENT_SID_REC  = Deno.env.get('TWILIO_CONTENT_SID')!
const TWILIO_WA_FROM   = Deno.env.get('TWILIO_WA_FROM')!

// ─────────────────────────────────────────────────────────────────────────────
// fechaArgentina(offset?)
//
// Calcula la fecha en Argentina (UTC-3) usando ÚNICAMENTE métodos UTC de Date,
// sin depender del TZ del servidor Deno (que puede cambiar).
//
// offset = 0 → hoy en Argentina
// offset = 1 → mañana en Argentina
//
// Retorna:
//   iso   → "YYYY-MM-DD"  (para comparar con la columna `fecha` de Supabase)
//   desde → "YYYY-MM-DDT00:00:00" (inicio del día, útil para BETWEEN)
//   hasta → "YYYY-MM-DDT23:59:59" (fin del día, útil para BETWEEN)
//   linda → "DD/MM/YYYY"  (para mensajes al usuario)
// ─────────────────────────────────────────────────────────────────────────────
function fechaArgentina(offset = 0): {
  iso: string; desde: string; hasta: string; linda: string
} {
  // Argentina = UTC-3 fijo (no tiene DST en la práctica reciente)
  const ART_OFFSET_MS = -3 * 60 * 60 * 1000

  // Timestamp en milisegundos representando "ahora en Argentina"
  const nowArtMs = Date.now() + ART_OFFSET_MS

  // Creamos un Date y usamos getUTC* para leer la fecha argentina
  // (porque sumamos el offset al timestamp, el valor UTC == valor ART)
  const d = new Date(nowArtMs)

  // Aplicar el offset de días usando métodos UTC para no perder el ajuste ART
  d.setUTCDate(d.getUTCDate() + offset)

  const y   = d.getUTCFullYear()
  const m   = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')

  return {
    iso:   `${y}-${m}-${day}`,
    desde: `${y}-${m}-${day}T00:00:00`,
    hasta: `${y}-${m}-${day}T23:59:59`,
    linda: `${day}/${m}/${y}`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// normalizarTel — convierte cualquier número argentino a whatsapp:+549XXXXXXXXXX
// ─────────────────────────────────────────────────────────────────────────────
function normalizarTel(tel: string): string {
  let t = tel.replace(/\D/g, '')
  if (t.startsWith('0'))             t = t.slice(1)
  if (!t.startsWith('54'))           t = '54' + t
  if (t.startsWith('54') && !t.startsWith('549')) t = '549' + t.slice(2)
  return 'whatsapp:+' + t
}

// ─────────────────────────────────────────────────────────────────────────────
// twilioSend — envía usando ContentSid (template aprobado)
// Retorna { ok, sid } o { ok: false, error }
// ─────────────────────────────────────────────────────────────────────────────
async function twilioSend(
  to: string,
  variables: Record<string, string>,
): Promise<{ ok: boolean; sid?: string; error?: string; httpStatus?: number }> {
  const params = new URLSearchParams({
    To:                  to,
    MessagingServiceSid: MESSAGING_SID,
    ContentSid:          CONTENT_SID_REC,
    ContentVariables:    JSON.stringify(variables),
  })

  let respData: any
  let httpStatus: number

  try {
    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method:  'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
          'Content-Type':  'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    )
    httpStatus = resp.status
    respData   = await resp.json()
  } catch (fetchErr: any) {
    return { ok: false, error: 'Fetch error: ' + fetchErr.message }
  }

  // Twilio devuelve sid + status "queued"/"sent" si fue OK
  if (respData?.sid && !respData?.error_code) {
    return { ok: true, sid: respData.sid, httpStatus }
  }

  return {
    ok:         false,
    httpStatus,
    error:      respData?.message || respData?.error_message || `HTTP ${httpStatus}`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  const body    = await req.json().catch(() => ({}))
  const debug   = body.debug   === true   // solo diagnostica, no envía ni marca
  const force   = body.force   === true   // permite enviar en cualquier horario

  const sb = createClient(SUPA_URL, SUPA_SERVICE_KEY)

  // ── Fechas ────────────────────────────────────────────────────────────────
  const hoy    = fechaArgentina(0)
  const manana = fechaArgentina(1)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('[send-reminders] Iniciando ejecución')
  console.log(`[send-reminders] Hora UTC actual  : ${new Date().toISOString()}`)
  console.log(`[send-reminders] Hoy en Argentina : ${hoy.iso}`)
  console.log(`[send-reminders] Mañana (objetivo): ${manana.iso}`)
  console.log(`[send-reminders] Modo debug       : ${debug}`)
  console.log(`[send-reminders] Modo force       : ${force}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {

    // ── 1. Psicólogos con recordatorio automático activo ──────────────────
    const { data: perfiles, error: errPerfiles } = await sb
      .from('profiles')
      .select('id, nombre_completo, telefono_profesional')
      .eq('recordatorio_auto', true)

    if (errPerfiles) {
      console.error('[send-reminders] Error leyendo profiles:', errPerfiles.message)
      throw new Error('Error leyendo profiles: ' + errPerfiles.message)
    }

    const perfilesActivos = perfiles || []
    console.log(`[send-reminders] Psicólogos con recordatorio_auto=true: ${perfilesActivos.length}`)

    if (perfilesActivos.length === 0) {
      console.log('[send-reminders] Ningún psicólogo tiene recordatorio_auto activo. Fin.')
      return jsonResp({ ok: true, mensaje: 'Sin psicólogos activos', hoy: hoy.iso, manana: manana.iso })
    }

    let totalEnviados = 0
    let totalErrores  = 0
    let totalSinTel   = 0
    let totalYaEnviados = 0
    const detalle: any[] = []

    for (const perfil of perfilesActivos) {
      console.log(`\n[send-reminders] ── Psicólogo: ${perfil.id} (${perfil.nombre_completo || 'sin nombre'})`)

      // ── DIAGNÓSTICO: cuántos turnos totales tiene mañana ──────────────
      // Usamos BETWEEN para cubrir tanto columnas `date` como `timestamp`
      const { data: turnosTotales, error: errDiag } = await sb
        .from('turnos')
        .select('id, hora, recordatorio_enviado, pacientes(nombre, apellido, telefono)')
        .eq('user_id', perfil.id)
        .gte('fecha', manana.desde)
        .lte('fecha', manana.hasta)
        .neq('estado', 'cancelado')
        .order('hora')

      if (errDiag) {
        console.error(`[send-reminders]   Error leyendo turnos de ${perfil.id}:`, errDiag.message)
        continue
      }

      const todos = turnosTotales || []
      console.log(`[send-reminders]   Turnos totales mañana (${manana.iso}): ${todos.length}`)

      if (todos.length === 0) {
        console.log(`[send-reminders]   Sin turnos para mañana. Salteando.`)
        continue
      }

      // Diagnóstico de estado por turno
      for (const t of todos) {
        const pac = t.pacientes as any
        const enviado = t.recordatorio_enviado
        console.log(
          `[send-reminders]   Turno ${t.id} | ${t.hora} | ` +
          `${pac?.nombre || '?'} ${pac?.apellido || ''} | ` +
          `tel: ${pac?.telefono ? '✓' : '✗'} | ` +
          `recordatorio_enviado: ${enviado === null ? 'NULL' : enviado}`
        )
      }

      // ── 2. Filtrar: solo los NO enviados (false o NULL) ───────────────
      const aProcesar = todos.filter((t: any) => !t.recordatorio_enviado)
      const yaEnviados = todos.length - aProcesar.length
      totalYaEnviados += yaEnviados

      console.log(`[send-reminders]   Ya enviados: ${yaEnviados} | A procesar ahora: ${aProcesar.length}`)

      if (aProcesar.length === 0) {
        console.log(`[send-reminders]   Todos los turnos ya tienen recordatorio enviado. Salteando.`)
        continue
      }

      for (const turno of aProcesar) {
        const pac  = turno.pacientes as any
        const hora = (turno.hora || '').slice(0, 5)

        if (!pac?.telefono) {
          console.log(`[send-reminders]   ⚠ Turno ${turno.id}: paciente sin teléfono — omitido`)
          totalSinTel++
          detalle.push({ turno_id: turno.id, status: 'sin_tel', hora })
          continue
        }

        const to = normalizarTel(pac.telefono)
        console.log(`[send-reminders]   Procesando turno ${turno.id} | ${hora} | ${pac.nombre} → ${to}`)

        // ── 3. Modo debug: solo reporta, no envía ─────────────────────
        if (debug) {
          console.log(`[send-reminders]   [DEBUG] Envío simulado — no se llama a Twilio`)
          detalle.push({ turno_id: turno.id, status: 'debug_ok', to, hora })
          continue
        }

        // ── 4. Enviar por Twilio ──────────────────────────────────────
        const result = await twilioSend(to, {
          "1": pac.nombre   || 'Paciente',
          "2": manana.linda,
          "3": hora,
        })

        if (result.ok) {
          // ── 5. Marcar como enviado SOLO si Twilio respondió OK ──────
          const { error: errMarca } = await sb
            .from('turnos')
            .update({
              recordatorio_enviado: true,
              recordatorio_fecha:   new Date().toISOString(),
            })
            .eq('id', turno.id)

          if (errMarca) {
            // El mensaje llegó al paciente pero no pudimos marcar en DB.
            // No es crítico: el próximo cron podría reintentar, pero el
            // paciente ya recibió el mensaje.
            console.warn(`[send-reminders]   ⚠ Turno ${turno.id}: enviado a Twilio pero error al marcar en DB: ${errMarca.message}`)
          } else {
            console.log(`[send-reminders]   ✅ Turno ${turno.id} enviado y marcado. SID: ${result.sid}`)
          }

          // ── 6. Registrar en historial (silencioso si falla) ─────────
          sb.from('notificaciones_wa').insert({
            user_id:     perfil.id,
            paciente_id: turno.paciente_id,
            mensaje:     `Recordatorio automático ${manana.linda} ${hora}hs`,
            tipo:        'automatico',
            estado:      'enviado',
            twilio_sid:  result.sid,
            enviado_at:  new Date().toISOString(),
          }).then().catch(() => {/* historial opcional */})

          totalEnviados++
          detalle.push({ turno_id: turno.id, status: 'ok', to, hora, sid: result.sid })

        } else {
          // Twilio falló — NO marcamos recordatorio_enviado para poder reintentar
          console.error(
            `[send-reminders]   ❌ Turno ${turno.id}: Twilio error (HTTP ${result.httpStatus}): ${result.error}`
          )
          totalErrores++
          detalle.push({ turno_id: turno.id, status: 'error', to, hora, error: result.error })
        }

        // Pausa entre mensajes para no saturar Twilio
        await new Promise(r => setTimeout(r, 400))
      }

      // ── 7. Resumen del día de HOY al psicólogo (opcional) ────────────
      if (perfil.telefono_profesional && !debug) {
        try {
          const { data: turnosHoy } = await sb
            .from('turnos')
            .select('hora, pacientes(nombre, apellido)')
            .eq('user_id', perfil.id)
            .gte('fecha', hoy.desde)
            .lte('fecha', hoy.hasta)
            .neq('estado', 'cancelado')
            .order('hora')

          if (turnosHoy && turnosHoy.length > 0) {
            const lista = turnosHoy
              .map((t: any) =>
                `• ${(t.hora || '').slice(0, 5)} — ${t.pacientes?.nombre || ''} ${t.pacientes?.apellido || ''}`.trim()
              )
              .join('\n')

            const telPro = normalizarTel(perfil.telefono_profesional)
            const msgResumen =
              `📅 *Agenda de hoy ${hoy.linda}*\n${lista}\n\nTotal: ${turnosHoy.length} turno${turnosHoy.length !== 1 ? 's' : ''}`

            const params = new URLSearchParams({
              To:   telPro,
              From: TWILIO_WA_FROM,
              Body: msgResumen,
            })
            await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
              {
                method:  'POST',
                headers: {
                  'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
                  'Content-Type':  'application/x-www-form-urlencoded',
                },
                body: params.toString(),
              }
            )
            console.log(`[send-reminders]   Resumen de hoy enviado al psicólogo (${telPro})`)
          }
        } catch (e: any) {
          console.warn(`[send-reminders]   No se pudo enviar resumen al psicólogo:`, e.message)
        }
      }
    }

    // ── Resultado final ───────────────────────────────────────────────────
    const resultado = {
      ok:              true,
      debug,
      hoy:             hoy.iso,
      manana:          manana.iso,
      psicologos:      perfilesActivos.length,
      enviados:        totalEnviados,
      errores:         totalErrores,
      sin_telefono:    totalSinTel,
      ya_enviados:     totalYaEnviados,
      detalle,
    }

    console.log('\n[send-reminders] ── Resultado final ──────────────────')
    console.log(JSON.stringify(resultado, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return jsonResp(resultado)

  } catch (e: any) {
    console.error('[send-reminders] Error general no capturado:', e.message)
    return jsonResp({ ok: false, error: e.message }, 500)
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function jsonResp(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
