// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: generar-informe
// Genera un informe clínico con OpenAI y registra el uso en ia_usos.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPA_URL         = Deno.env.get('SUPABASE_URL')!
const SUPA_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const OPENAI_KEY       = Deno.env.get('OPENAI_API_KEY')!

const IA_LIMITS: Record<string, number> = { free: 5, pro: 25, max: 80 }

// ── Decodifica el JWT y extrae el user_id (sub) sin hacer llamadas a auth API ─
function getUserIdFromJWT(token: string): string | null {
  try {
    const parts   = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    // Verificar que el token no esté vencido
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload.sub || null
  } catch {
    return null
  }
}

function ok(body: object) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}
function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

Deno.serve(async (req: Request) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  // ── Extraer y decodificar el JWT ──────────────────────────────────────────
  const token  = (req.headers.get('authorization') || '').replace('Bearer ', '').trim()
  if (!token) return err('No autorizado', 401)

  const userId = getUserIdFromJWT(token)
  if (!userId) return err('Token inválido o expirado', 401)

  // ── Leer body ─────────────────────────────────────────────────────────────
  let prompt = ''
  try {
    const body = await req.json()
    prompt = (body.prompt || '').trim()
  } catch {
    return err('Body JSON inválido', 400)
  }
  if (!prompt) return err('El campo prompt es obligatorio', 400)
  if (prompt.length > 8000) return err('El prompt es demasiado largo', 400)

  // ── Verificar plan y límite ───────────────────────────────────────────────
  const sbAdmin = createClient(SUPA_URL, SUPA_SERVICE_KEY)

  const { data: planRow } = await sbAdmin
    .from('users_plan')
    .select('plan, status, expires_at')
    .eq('user_id', userId)
    .maybeSingle()

  const now       = new Date()
  const isExpired = planRow?.expires_at ? new Date(planRow.expires_at) < now : false
  const plan      = (!planRow || isExpired) ? 'free'   : (planRow.plan   ?? 'free')
  const status    = (!planRow || isExpired) ? 'active' : (planRow.status ?? 'active')
  const limit     = IA_LIMITS[plan] ?? 5

  if (status !== 'active') return err('Plan inactivo', 403)

  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: usados } = await sbAdmin
    .from('ia_usos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', inicioMes)

  if ((usados ?? 0) >= limit) {
    return err(`Límite de ${limit} informes IA alcanzado para el plan ${plan}`, 403)
  }

  // ── Llamar a OpenAI ───────────────────────────────────────────────────────
  if (!OPENAI_KEY) return err('API key de IA no configurada', 500)

  let textoGenerado = ''
  try {
    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + OPENAI_KEY,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:      'gpt-4o-mini',
        max_tokens: 1500,
        messages: [
          {
            role:    'system',
            content: 'Sos un asistente especializado en psicología clínica. Redactás informes profesionales en español argentino. Usás lenguaje técnico, claro y empático. Nunca inventás datos que no te dan.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!openaiResp.ok) {
      const errBody = await openaiResp.text()
      console.error('[generar-informe] OpenAI error:', openaiResp.status, errBody)
      return err('Error al llamar a la API de IA: ' + openaiResp.status, 502)
    }

    const openaiData  = await openaiResp.json()
    textoGenerado = openaiData.choices?.[0]?.message?.content || ''
    if (!textoGenerado) return err('La IA no devolvió texto', 502)

  } catch (e: any) {
    console.error('[generar-informe] Excepción OpenAI:', e.message)
    return err('Error de conexión con la API de IA', 502)
  }

  // ── Registrar uso ─────────────────────────────────────────────────────────
  try {
    await sbAdmin.from('ia_usos').insert({ user_id: userId, tipo: 'informe', created_at: now.toISOString() })
  } catch (e: any) {
    console.warn('[generar-informe] No se pudo registrar uso:', e.message)
  }

  return ok({ texto: textoGenerado })
})
