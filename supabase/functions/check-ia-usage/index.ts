// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: check-ia-usage
// Verifica si el usuario autenticado puede generar un informe IA este mes.
//
// Request: POST /functions/v1/check-ia-usage
//   Headers: Authorization: Bearer <access_token>
//
// Response: { allowed: boolean, used: number, limit: number, plan: string }
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPA_URL         = Deno.env.get('SUPABASE_URL')!
const SUPA_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPA_ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!

const IA_LIMITS: Record<string, number> = { free: 5, pro: 25, max: 80 }

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

  // ── Autenticación — verificar JWT del usuario ─────────────────────────────
  const authHeader = req.headers.get('authorization') || ''
  const token      = authHeader.replace('Bearer ', '').trim()
  if (!token) return err('No autorizado', 401)

  // Crear cliente con el token del usuario para verificar identidad
  const sbUser = createClient(SUPA_URL, SUPA_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user }, error: authErr } = await sbUser.auth.getUser()
  if (authErr || !user) return err('Token inválido o expirado', 401)

  const userId = user.id

  // ── Leer plan del usuario ─────────────────────────────────────────────────
  const sbAdmin = createClient(SUPA_URL, SUPA_SERVICE_KEY)

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

  // Plan suspendido → no puede usar
  if (status !== 'active') {
    return ok({ allowed: false, used: 0, limit, plan, reason: 'plan_inactivo' })
  }

  // ── Contar usos IA este mes ───────────────────────────────────────────────
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: used } = await sbAdmin
    .from('ia_usos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', inicioMes)

  const usosActuales = used ?? 0
  const allowed      = usosActuales < limit

  return ok({ allowed, used: usosActuales, limit, plan })
})
