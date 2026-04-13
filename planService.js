// ============================================================
//  PSICOAPP — PLAN SERVICE
//  Fuente de verdad del plan. Consulta Supabase directamente.
//  Sin Edge Function intermediaria. RLS protege los datos.
//  <script src="/planService.js"></script>
// ============================================================
const PlanService = (() => {
  let _cache = null
  let _cacheTime = 0
  const CACHE_TTL = 60 * 1000 // 60 segundos (máximo)
  let _planChannel = null

  const IA_LIMITS = { free: 5, pro: 25, max: 80 }

  function _getSb() {
    if (typeof sb !== 'undefined') return sb
    if (typeof window.sb !== 'undefined') return window.sb
    return null
  }

  function _free() {
    return { plan: 'free', status: 'active', ia_used: 0, ia_limit: 5 }
  }

  async function getPlan() {
    if (_cache && (Date.now() - _cacheTime < CACHE_TTL)) {
      return _cache
    }
    try {
      const client = _getSb()
      if (!client) {
        console.warn('PlanService: sb no disponible, usando free')
        return _free()
      }

      /* ── 1. Obtener sesión activa ── */
      const { data: { session } } = await client.auth.getSession()
      if (!session?.user?.id) {
        return _free()
      }
      const userId = session.user.id

      /* ── 2. Leer plan desde users_plan (RLS: solo ve el propio) ── */
      const { data: planRow } = await client
        .from('users_plan')
        .select('plan, status, expires_at')
        .eq('user_id', userId)
        .maybeSingle()

      /* ── 3. Verificar si expiró ── */
      const now       = new Date()
      const isExpired = planRow?.expires_at ? new Date(planRow.expires_at) < now : false
      const plan      = (!planRow || isExpired) ? 'free'   : (planRow.plan   ?? 'free')
      // Sin fila en users_plan = usuario en trial free → status active
      const status    = (!planRow || isExpired) ? 'active' : (planRow.status ?? 'active')

      /* ── 4. Contar usos IA este mes ── */
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count: iaUsed } = await client
        .from('ia_usos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', inicioMes)

      const result = {
        plan,
        status,
        expires_at: planRow?.expires_at ?? null,
        ia_used:    iaUsed ?? 0,
        ia_limit:   IA_LIMITS[plan] ?? 5,
      }

      _cache     = result
      _cacheTime = Date.now()
      return result

    } catch (err) {
      console.error('PlanService error:', err)
      return _free()
    }
  }

  function invalidar() {
    _cache     = null
    _cacheTime = 0
  }

  function invalidatePlanCache() {
    invalidar()
  }

  async function iniciarRealtimePlan() {
    try {
      const client = _getSb()
      if (!client || _planChannel) return

      _planChannel = client
        .channel('plan_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users_plan' },
          (payload) => {
            console.log('[Realtime] cambio en plan detectado', payload)
            invalidatePlanCache()
            window.dispatchEvent(new CustomEvent('storeUpdated', { detail: { type: 'plan' } }))
          }
        )
        .subscribe()
    } catch (err) {
      console.warn('PlanService realtime error:', err)
    }
  }

  async function puedeUsarIA() {
    const plan = await getPlan()
    return plan.status === 'active' && plan.ia_used < plan.ia_limit
  }

  async function nombrePlan() {
    const plan = await getPlan()
    return plan.plan
  }

  return {
    getPlan,
    invalidar,
    invalidatePlanCache,
    iniciarRealtimePlan,
    puedeUsarIA,
    nombrePlan,
  }
})()
