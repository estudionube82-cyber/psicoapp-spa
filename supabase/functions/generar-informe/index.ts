// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: generar-informe
// Genera un informe clínico con Anthropic Claude y registra el uso en ia_usos.
//
// Request: POST /functions/v1/generar-informe
//   Headers: Authorization: Bearer <access_token>
//            Content-Type: application/json
//   Body:    { prompt: string }
//
// Response: { texto: string }  |  { error: string }
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2'

// ── Variables de entorno ──────────────────────────────────────────────────────
const SUPA_URL         = Deno.env.get('SUPABASE_URL')!
const SUPA_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPA_ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!
const OPENAI_KEY       = Deno.env.get('OPENAI_API_KEY')!

// ── Límites de plan ───────────────────────────────────────────────────────────
const IA_LIMITS: Record<string, number> = { free: 5, pro: 25, max: 80 }

// ── Rate limiting en memoria ──────────────────────────────────────────────────
const _ipCalls = new Map<string, { count: number; resetAt: number }>()
function _checkRateLimit(ip: string): boolean {
  const now   = Date.now()
  const entry = _ipCalls.get(ip)
  if (!entry || now > entry.resetAt) {
    _ipCalls.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  entry.count++
  return entry.count <= 10
}

// ── Helpers de respuesta ──────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Handler
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

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                || req.headers.get('cf-connecting-ip')
                || 'unknown'
  if (!_checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
      status: 429,
      headers: { 'Retry-After': '60', 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  // ── Autenticación — verificar JWT del usuario ─────────────────────────────
  const authHeader = req.headers.get('authorization') || ''
  const token      = authHeader.replace('Bearer ', '').trim()
  if (!token) return err('No autorizado', 401)

  const sbUser = createClient(SUPA_URL, SUPA_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user }, error: authErr } = await sbUser.auth.getUser()
  if (authErr || !user) return err('Token inválido o expirado', 401)

  const userId = user.id

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

  const sbAdmin = createClient(SUPA_URL, SUPA_SERVICE_KEY)

  // ── Verificar plan y límite ───────────────────────────────────────────────
  const { data: planRow } = await sbAdmin
    .from('users_plan')
    .select('plan, status, expires_at')
    .eq('user_id', userId)
    .maybeSingle()

  const now       = new Date()
  const isExpired = planRow?.expires_at ? new Date(planRow.expires_at) < now : false
  const plan      = (!planRow || isExpired) ? 'free' : (planRow.plan ?? 'free')
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

  // ── Llamar a Claude ───────────────────────────────────────────────────────
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
        model:      'gpt-4o-mini',   // rápido y económico
        max_tokens: 1500,
        messages: [
          {
            role:    'system',
            content: 'Sos un asistente especializado en psicología clínica. Redactás informes profesionales en español argentino. Usás lenguaje técnico, claro y empático. Nunca inventás datos que no te dan.',
          },
          {
            role:    'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!openaiResp.ok) {
      const errBody = await openaiResp.text()
      console.error('[generar-informe] OpenAI error:', openaiResp.status, errBody)
      return err('Error al llamar a la API de IA: ' + openaiResp.status, 502)
    }

    const openaiData = await openaiResp.json()
    textoGenerado = openaiData.choices?.[0]?.message?.content || ''

    if (!textoGenerado) return err('La IA no devolvió texto', 502)

  } catch (e: any) {
    console.error('[generar-informe] Excepción llamando a OpenAI:', e.message)
    return err('Error de conexión con la API de IA', 502)
  }

  // ── Registrar uso en ia_usos ──────────────────────────────────────────────
  try {
    const { error: insertErr } = await sbAdmin
      .from('ia_usos')
      .insert({ user_id: userId, tipo: 'informe', created_at: now.toISOString() })

    if (insertErr) console.warn('[generar-informe] No se pudo registrar uso:', insertErr.message)
  } catch (e: any) {
    console.warn('[generar-informe] insertLog excepción:', e.message)
    // No bloquear la respuesta si falla el registro
  }

  // ── Devolver texto generado ───────────────────────────────────────────────
  return ok({ texto: textoGenerado })
})
