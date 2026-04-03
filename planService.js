// ============================================================
//  PSICOAPP — PLAN SERVICE
//  Fuente de verdad del plan. Nunca usa localStorage.
//  Incluir DESPUÉS de config.js en las páginas que lo necesiten:
//  <script src="/planService.js"></script>
// ============================================================
const PlanService = (() => {
  const EDGE_URL = `${PSICOAPP_CONFIG.SUPA_URL}/functions/v1/getUserPlan`
  let _cache = null
  let _cacheTime = 0
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  async function getPlan() {
    if (_cache && (Date.now() - _cacheTime < CACHE_TTL)) {
      return _cache
    }
    try {
      // Usa sb — instancia global definida en index.html
      const { data: { session } } = await sb.auth.getSession()
      if (!session?.access_token) {
        return _free()
      }
      const res = await fetch(EDGE_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        console.warn('PlanService: error al obtener plan, usando free')
        return _free()
      }
      const data = await res.json()
      _cache = data
      _cacheTime = Date.now()
      return data
    } catch (err) {
      console.error('PlanService error:', err)
      return _free()
    }
  }

  function invalidar() {
    _cache = null
    _cacheTime = 0
  }

  async function puedeUsarIA() {
    const plan = await getPlan()
    return plan.status === 'active' && plan.ia_used < plan.ia_limit
  }

  async function nombrePlan() {
    const plan = await getPlan()
    return plan.plan
  }

  function _free() {
    return { plan: 'free', status: 'active', ia_used: 0, ia_limit: 5 }
  }

  return { getPlan, invalidar, puedeUsarIA, nombrePlan }
})()
