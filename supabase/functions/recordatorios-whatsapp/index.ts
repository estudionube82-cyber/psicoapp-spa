// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: recordatorios-whatsapp
// Cron: todos los días a las 20:00 UTC (= 17:00 ART)
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2'

// ── Credenciales ──────────────────────────────────────────────────────────────
const SUPA_URL         = Deno.env.get('SUPABASE_URL')!
const SUPA_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// Token secreto para el cron externo. Configurar en Supabase → Edge Functions → Secrets.
// El scheduler (cron-job.org / Vercel) debe enviarlo en el header X-Cron-Secret.
const CRON_SECRET      = Deno.env.get('CRON_SECRET') || ''
const TWILIO_SID       = Deno.env.get('TWILIO_ACCOUNT_SID')  || 'AC2027bafa685cef8b91eb35ef75017413'
const TWILIO_TOKEN     = Deno.env.get('TWILIO_AUTH_TOKEN')!
const MESSAGING_SID    = Deno.env.get('TWILIO_MESSAGING_SID') || 'MG2e098224503602a42a7b0d487e7ca08d'
const CONTENT_SID      = Deno.env.get('TWILIO_CONTENT_SID')   || 'HXe7c3c39b922597ec66eda73b20e8fcdf'
const WA_FROM          = Deno.env.get('TWILIO_WA_FROM')        || 'whatsapp:+5492346521129'

// ─────────────────────────────────────────────────────────────────────────────
// fechaArgentina(offset)
//
// Devuelve la fecha en zona Argentina (UTC-3) usando SOLO métodos UTC de Date.
// No depende del TZ del servidor Deno.
//
// offset = 0 → hoy ART
// offset = 1 → mañana ART
//
// Campos devueltos:
//   iso   → "YYYY-MM-DD"   (para comparar con columna DATE de Supabase)
//   linda → "DD/MM/YYYY"   (para mensajes al usuario)
// ─────────────────────────────────────────────────────────────────────────────
function fechaArgentina(offset = 0): { iso: string; linda: string } {
  const ART_MS = -3 * 60 * 60 * 1000
  const d = new Date(Date.now() + ART_MS)
  d.setUTCDate(d.getUTCDate() + offset)
  const y   = d.getUTCFullYear()
  const m   = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(d.getUTCDate()).padStart(2, '0')
  return {
    iso:   `${y}-${m}-${dia}`,
    linda: `${dia}/${m}/${y}`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// normalizarTel — cualquier número argentino → whatsapp:+549XXXXXXXXXX
// ─────────────────────────────────────────────────────────────────────────────
function normalizarTel(tel: string): string {
  let t = tel.replace(/\D/g, '')
  if (t.startsWith('0'))                              t = t.slice(1)
  if (!t.startsWith('54'))                            t = '54' + t
  if (t.startsWith('54') && !t.startsWith('549'))    t = '549' + t.slice(2)
  return 'whatsapp:+' + t
}

// ─────────────────────────────────────────────────────────────────────────────
// twilioSend — ContentSid template (template de Twilio aprobado para WA)
// Retorna { ok, sid } o { ok: false, error, httpStatus }
// ─────────────────────────────────────────────────────────────────────────────
async function twilioSend(
  to: string,
  vars: Record<string, string>,
): Promise<{ ok: boolean; sid?: string; error?: string; httpStatus?: number }> {
  const params = new URLSearchParams({
    To:                  to,
    MessagingServiceSid: MESSAGING_SID,
    ContentSid:          CONTENT_SID,
    ContentVariables:    JSON.stringify(vars),
  })

  let data: any
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
    data       = await resp.json()
  } catch (e: any) {
    return { ok: false, error: 'fetch error: ' + e.message }
  }

  if (data?.sid && !data?.error_code) {
    return { ok: true, sid: data.sid, httpStatus }
  }

  return {
    ok:         false,
    httpStatus,
    error:      data?.message || data?.error_message || `HTTP ${httpStatus}`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// insertLog — guarda trazabilidad en recordatorios_logs (silencioso si falla)
// ─────────────────────────────────────────────────────────────────────────────
async function insertLog(
  sb: ReturnType<typeof createClient>,
  entry: {
    user_id:         string
    turno_id:        string
    paciente_nombre: string
    telefono:        string
    fecha_turno:     string
    hora_turno:      string
    estado:          'enviado' | 'error' | 'sin_telefono'
    error?:          string
    twilio_sid?:     string
  }
): Promise<void> {
  try {
    const { error } = await sb.from('recordatorios_logs').insert(entry)
    if (error) console.warn(`[recordatorios] Log no guardado: ${error.message}`)
  } catch (e: any) {
    console.warn(`[recordatorios] insertLog excepción: ${e.message}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  // ── Seguridad: validar token del scheduler ────────────────────────────────
  if (CRON_SECRET) {
    const cronHeader  = req.headers.get('x-cron-secret')        || ''
    const bearerToken = (req.headers.get('authorization') || '').replace('Bearer ', '')
    if (cronHeader !== CRON_SECRET && bearerToken !== CRON_SECRET) {
      console.warn('[recordatorios] Petición rechazada: token inválido')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
  }

  const body  = await req.json().catch(() => ({}))
  const debug = body.debug === true  // true → diagnostica sin enviar

  try {
    const sb = createClient(SUPA_URL, SUPA_SERVICE_KEY)

    const hoy    = fechaArgentina(0)
    const manana = fechaArgentina(1)

    console.log('════════════════════════════════════════════════')
    console.log('[recordatorios] Ejecutando')
    console.log(`[recordatorios] UTC now   : ${new Date().toISOString()}`)
    console.log(`[recordatorios] Hoy ART   : ${hoy.iso}`)
    console.log(`[recordatorios] Mañana    : ${manana.iso}`)
    console.log(`[recordatorios] Mañana ISO: ${manana.iso}`)
    console.log(`[recordatorios] Debug     : ${debug}`)
    console.log('════════════════════════════════════════════════')

    // ── 1. Psicólogos con recordatorio automático activo ─────────────────
    const { data: perfiles, error: errP } = await sb
      .from('profiles')
      .select('id, nombre_completo, telefono_profesional')
      .eq('recordatorio_auto', true)

    if (errP) throw new Error('Error leyendo profiles: ' + errP.message)

    const activos = perfiles || []
    console.log(`[recordatorios] Psicólogos activos: ${activos.length}`)

    if (activos.length === 0) {
      return ok({ mensaje: 'Sin psicólogos activos', hoy: hoy.iso, manana: manana.iso })
    }

    let totalEnviados  = 0
    let totalErrores   = 0
    let totalSinTel    = 0
    let totalYaMarcados = 0
    const detalle: any[] = []

    for (const perfil of activos) {

      console.log(`\n[recordatorios] ▶ Psicólogo ${perfil.id} — ${perfil.nombre_completo || ''}`)

      // ── 2. Todos los turnos de mañana (diagnóstico completo) ──────────
      //    BETWEEN cubre columnas tipo `date` y `timestamp` por igual.
      const { data: todos, error: errT } = await sb
        .from('turnos')
        .select('id, hora, paciente_id, recordatorio_enviado, pacientes(nombre, apellido, telefono)')
        .eq('user_id', perfil.id)
        .eq('fecha', manana.iso)       // ← comparación directa con DATE
        .neq('estado', 'cancelado')
        .order('hora')

      if (errT) {
        console.error(`[recordatorios]   Error consultando turnos: ${errT.message}`)
        continue
      }

      const turnos = todos || []
      console.log(`[recordatorios]   Turnos totales mañana: ${turnos.length}`)

      if (turnos.length === 0) {
        console.log(`[recordatorios]   Sin turnos para mañana — salteando`)
        continue
      }

      // Log de diagnóstico por turno
      for (const t of turnos) {
        const pac = t.pacientes as any
        console.log(
          `[recordatorios]   · id=${t.id} hora=${t.hora} ` +
          `pac="${pac?.nombre || '?'} ${pac?.apellido || ''}" ` +
          `tel=${pac?.telefono ? '✓' : '✗'} ` +
          `enviado=${t.recordatorio_enviado === null ? 'NULL' : t.recordatorio_enviado}`
        )
      }

      // ── 3. Filtrar: (recordatorio_enviado IS NULL OR = false) ─────────
      //    Manejamos NULL en cliente para compatibilidad con todos los setups.
      const pendientes = turnos.filter((t: any) => !t.recordatorio_enviado)
      const yaMarcados = turnos.length - pendientes.length
      totalYaMarcados += yaMarcados

      console.log(`[recordatorios]   Ya enviados: ${yaMarcados} | Pendientes: ${pendientes.length}`)

      if (pendientes.length === 0) {
        console.log(`[recordatorios]   Todos ya enviados — salteando`)
        continue
      }

      for (const turno of pendientes) {
        const pac  = turno.pacientes as any
        const hora = (turno.hora || '').slice(0, 5)

        // ── Validar datos del paciente ────────────────────────────────────
        // Si el join devolvió null (turno sin paciente vinculado) lo salteamos
        if (!pac || typeof pac !== 'object') {
          console.log(`[recordatorios]   ⚠ id=${turno.id}: sin datos de paciente — omitido`)
          totalSinTel++
          detalle.push({ id: turno.id, status: 'sin_paciente' })
          await insertLog(sb, { user_id: perfil.id, turno_id: turno.id, paciente_nombre: 'Sin paciente', telefono: '', fecha_turno: manana.iso, hora_turno: hora, estado: 'sin_telefono' })
          continue
        }

        const nombrePac = [pac.nombre, pac.apellido].filter(Boolean).join(' ') || 'Paciente'

        if (!pac.telefono) {
          console.log(`[recordatorios]   ⚠ id=${turno.id}: ${nombrePac} sin teléfono — omitido`)
          totalSinTel++
          detalle.push({ id: turno.id, status: 'sin_tel', paciente: nombrePac })
          await insertLog(sb, { user_id: perfil.id, turno_id: turno.id, paciente_nombre: nombrePac, telefono: '', fecha_turno: manana.iso, hora_turno: hora, estado: 'sin_telefono' })
          continue
        }

        const to  = normalizarTel(pac.telefono)
        const msg = `Recordatorio automático ${manana.linda} ${hora}hs`
        console.log(`[recordatorios]   ➤ id=${turno.id} | ${hora} | ${nombrePac} → ${to}`)

        // Modo debug: no envía ni marca
        if (debug) {
          console.log(`[recordatorios]   [DEBUG] Envío simulado para ${nombrePac}`)
          detalle.push({ id: turno.id, status: 'debug', to, hora, paciente: nombrePac })
          continue
        }

        // ── 4. PRIMERO enviar por Twilio ───────────────────────────────
        const result = await twilioSend(to, {
          "1": pac.nombre || 'Paciente',
          "2": manana.linda,
          "3": hora,
        })

        if (result.ok) {
          // ── 5. SOLO si OK → marcar como enviado ─────────────────────
          const { error: errM } = await sb
            .from('turnos')
            .update({ recordatorio_enviado: true, recordatorio_fecha: new Date().toISOString() })
            .eq('id', turno.id)

          if (errM) console.warn(`[recordatorios]   ⚠ id=${turno.id}: enviado pero error al marcar: ${errM.message}`)
          else      console.log(`[recordatorios]   ✅ id=${turno.id} ${nombrePac} — SID: ${result.sid}`)

          // wa_historial ← visible en el frontend
          sb.from('wa_historial').insert({
            user_id:     perfil.id,
            paciente_id: turno.paciente_id,
            turno_id:    turno.id,
            tipo:        'automatico',
            mensaje:     msg,
            twilio_sid:  result.sid,
            estado:      'enviado',
          }).then().catch((e: any) => console.warn('[recordatorios] wa_historial insert err:', e.message))

          // notificaciones_wa ← trazabilidad interna
          sb.from('notificaciones_wa').insert({
            user_id: perfil.id, paciente_id: turno.paciente_id,
            mensaje: msg, tipo: 'automatico', estado: 'enviado',
            twilio_sid: result.sid, enviado_at: new Date().toISOString(),
          }).then().catch(() => {})

          // recordatorios_logs ← diagnóstico detallado
          await insertLog(sb, { user_id: perfil.id, turno_id: turno.id, paciente_nombre: nombrePac, telefono: to, fecha_turno: manana.iso, hora_turno: hora, estado: 'enviado', twilio_sid: result.sid })

          totalEnviados++
          detalle.push({ id: turno.id, status: 'ok', to, hora, paciente: nombrePac, sid: result.sid })

        } else {
          // Twilio falló → NO marcar → el cron del día siguiente reintentará
          console.error(`[recordatorios]   ❌ id=${turno.id} ${nombrePac}: HTTP ${result.httpStatus}: ${result.error}`)

          // wa_historial con estado error
          sb.from('wa_historial').insert({
            user_id: perfil.id, paciente_id: turno.paciente_id,
            turno_id: turno.id, tipo: 'automatico', mensaje: msg, estado: 'error',
          }).then().catch(() => {})

          await insertLog(sb, { user_id: perfil.id, turno_id: turno.id, paciente_nombre: nombrePac, telefono: to, fecha_turno: manana.iso, hora_turno: hora, estado: 'error', error: `HTTP ${result.httpStatus}: ${result.error}` })

          totalErrores++
          detalle.push({ id: turno.id, status: 'error', to, hora, paciente: nombrePac, error: result.error })
        }

        // Pausa entre mensajes
        await new Promise(r => setTimeout(r, 400))
      }

      // ── 6. Resumen de HOY al psicólogo ────────────────────────────────
      if (perfil.telefono_profesional && !debug) {
        try {
          const { data: turnosHoy } = await sb
            .from('turnos')
            .select('hora, pacientes(nombre, apellido)')
            .eq('user_id', perfil.id)
            .eq('fecha', hoy.iso)      // ← comparación directa con DATE
            .neq('estado', 'cancelado')
            .order('hora')

          if (turnosHoy && turnosHoy.length > 0) {
            const lista = turnosHoy
              .map((t: any) =>
                `• ${(t.hora || '').slice(0, 5)} — ${t.pacientes?.nombre || ''} ${t.pacientes?.apellido || ''}`.trim()
              )
              .join('\n')

            const telPro = normalizarTel(perfil.telefono_profesional)
            const params = new URLSearchParams({
              To:   telPro,
              From: WA_FROM,
              Body: `📅 *Agenda de hoy ${hoy.linda}*\n${lista}\n\nTotal: ${turnosHoy.length} turno${turnosHoy.length !== 1 ? 's' : ''}`,
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
            console.log(`[recordatorios]   Resumen de hoy enviado al psicólogo (${telPro})`)
          }
        } catch (e: any) {
          console.warn(`[recordatorios]   Error enviando resumen al psicólogo: ${e.message}`)
        }
      }
    } // fin for perfiles

    const resultado = {
      ok:           true,
      debug,
      hoy:          hoy.iso,
      manana:       manana.iso,
      fecha_objetivo: manana.iso,
      psicologos:   activos.length,
      enviados:     totalEnviados,
      errores:      totalErrores,
      sin_telefono: totalSinTel,
      ya_marcados:  totalYaMarcados,
      detalle,
    }

    console.log('\n[recordatorios] ── RESULTADO ────────────────────────')
    console.log(JSON.stringify(resultado, null, 2))
    console.log('════════════════════════════════════════════════')

    return ok(resultado)

  } catch (e: any) {
    console.error('[recordatorios] Error fatal:', e.message)
    return ok({ ok: false, error: e.message }, 500)
  }
})

function ok(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
