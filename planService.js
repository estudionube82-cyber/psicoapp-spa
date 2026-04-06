// ============================================================
//  PSICOAPP — PLAN SERVICE
//  Fuente de verdad del plan. Nunca usa localStorage.
//  <script src="/planService.js"></script>
// ============================================================
const PlanService = (() => {
  const EDGE_URL = `${PSICOAPP_CONFIG.SUPA_URL}/functions/v1/getUserPlan`
  let _cache = null
  let _cacheTime = 0
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  // Obtiene sb de forma lazy — espera a que esté disponible
  function _getSb() {
    if (typeof sb !== 'undefined') return sb
    if (typeof window.sb !== 'undefined') return window.sb
    return null
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

      // Usar functions.invoke() — maneja auth y CORS automáticamente
      const { data, error: fnErr } = await client.functions.invoke('getUserPlan')

      if (fnErr) {
        console.warn('PlanService: error al obtener plan, usando free', fnErr.message)
        return _free()
      }
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
