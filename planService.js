// ============================================================
//  PSICOAPP — PLAN SERVICE
//  Fuente de verdad del plan. Nunca usa localStorage.
//  Incluir DESPUÉS de config.js en las páginas que lo necesiten:
//  <script src="/js/planService.js"></script>
// ============================================================

const PlanService = (() => {

  const EDGE_URL = `${PSICOAPP_CONFIG.SUPA_URL}/functions/v1/getUserPlan`
  let _cache = null
  let _cacheTime = 0
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  // Obtiene el plan real desde la Edge Function
  async function getPlan() {
    // Si hay caché vigente, devolverlo (evita llamadas repetidas)
    if (_cache && (Date.now() - _cacheTime < CACHE_TTL)) {
      return _cache
    }

    try {
      // Obtener sesión activa de Supabase
      const { data: { session } } = await supabase.auth.getSession()

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

  // Invalida el caché (llamar después de un pago exitoso)
  function invalidar() {
    _cache = null
    _cacheTime = 0
  }

  // ¿Puede usar IA?
  async function puedeUsarIA() {
    const plan = await getPlan()
    return plan.status === 'active' && plan.ia_used < plan.ia_limit
  }

  // ¿Cuál es el nombre del plan?
  async function nombrePlan() {
    const plan = await getPlan()
    return plan.plan
  }

  // Plan free por defecto (cuando hay error o no hay sesión)
  function _free() {
    return { plan: 'free', status: 'active', ia_used: 0, ia_limit: 5 }
  }

  return { getPlan, invalidar, puedeUsarIA, nombrePlan }

})()