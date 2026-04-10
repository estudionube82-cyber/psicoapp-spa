// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: check-ia-usage
// Verifica si el usuario puede generar un informe IA este mes.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPA_URL         = Deno.env.get('SUPABASE_URL')!
const SUPA_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const IA_LIMITS: Record<string, number> = { free: 5, pro: 25, max: 80 }

// ── Decodifica el JWT y extrae el user_id sin llamadas a auth API ─────────────
function getUserIdFromJWT(token: string): string | null {
  try {
    const parts   = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
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

  const token  = (req.headers.get('authorization') || '').replace('Bearer ', '').trim()
  if (!token) return err('No autorizado', 401)

  const userId = getUserIdFromJWT(token)
  if (!userId) return err('Token inválido o expirado', 401)

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

  if (status !== 'active') return ok({ allowed: false, used: 0, limit, plan, reason: 'plan_inactivo' })

  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: used } = await sbAdmin
    .from('ia_usos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', inicioMes)

  const usosActuales = used ?? 0
  return ok({ allowed: usosActuales < limit, used: usosActuales, limit, plan })
})
