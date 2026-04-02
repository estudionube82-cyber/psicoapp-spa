/**
 * suscripcion-control.js
 * Control global de acceso por suscripción — PsicoApp
 *
 * VERSIÓN SEGURA: usa PlanService (Edge Function) como fuente de verdad.
 * El plan NUNCA se lee desde localStorage.
 */

/* ─── Límites por plan ─────────────────────────────────── */
function getPlanLimits(plan) {
  const limits = {
    free: { dias: 15, whatsapp: 20,  informesIA: 1  },
    pro:  { dias: null, whatsapp: 100, informesIA: 3  },
    max:  { dias: null, whatsapp: 250, informesIA: 25 },
  };
  return limits[plan] || limits.free;
}

/* ─── Helpers internos ─────────────────────────────────── */
function diasDesdeInicio(fecha) {
  if (!fecha) return 0;
  return Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
}

/* ─── API pública (ahora async) ────────────────────────── */

/**
 * Verifica si el usuario puede usar una feature.
 * Fuente de verdad: Edge Function getUserPlan (via PlanService).
 */
async function puedeUsar(feature) {
  try {
    const p = await PlanService.getPlan();
    if (!p || p.status !== 'active') return false;

    const plan = p.plan || 'free';
    const lim  = getPlanLimits(plan);

    // Plan free: verificar días de prueba
    if (plan === 'free' && lim.dias !== null) {
      const inicio = p.created_at || null;
      if (inicio && diasDesdeInicio(inicio) >= lim.dias) return false;
    }

    if (feature === 'informesIA') {
      return (p.ia_used || 0) < (p.ia_limit || lim.informesIA);
    }

    // WhatsApp: por ahora verificamos contra el límite del plan
    if (feature === 'whatsapp') {
      return true; // el control fino de WA sigue en Supabase profiles.wa_usos
    }

    return true;
  } catch (err) {
    console.error('[suscripcion-control] puedeUsar error:', err);
    return false;
  }
}

/**
 * Registra un uso. Para informesIA incrementa en Supabase.
 * Retorna true si el uso fue registrado, false si el límite estaba alcanzado.
 */
async function registrarUso(feature) {
  const puede = await puedeUsar(feature);
  if (!puede) return false;

  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return false;

    if (feature === 'informesIA') {
      // Incrementar ia_used en users_plan via Supabase
      const { data: planData } = await sb
        .from('users_plan')
        .select('ia_used')
        .eq('user_id', session.user.id)
        .single();

      if (planData) {
        await sb
          .from('users_plan')
          .update({ ia_used: (planData.ia_used || 0) + 1 })
          .eq('user_id', session.user.id);

        // Invalidar caché para reflejar el nuevo uso
        PlanService.invalidar();
      }
    }

    if (feature === 'whatsapp' && typeof window._syncWaUsos === 'function') {
      window._syncWaUsos();
    }

    return true;
  } catch (err) {
    console.error('[suscripcion-control] registrarUso error:', err);
    return false;
  }
}

/**
 * Retorna uso actual: { usado, max, restante }
 */
async function getUsoActual(feature) {
  try {
    const p   = await PlanService.getPlan();
    const plan = p?.plan || 'free';
    const lim  = getPlanLimits(plan);

    if (feature === 'informesIA') {
      const usado    = p?.ia_used  || 0;
      const max      = p?.ia_limit || lim.informesIA;
      return { usado, max, restante: Math.max(0, max - usado) };
    }

    if (feature === 'whatsapp') {
      // wa_usos sigue en profiles por ahora
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return { usado: 0, max: lim.whatsapp, restante: lim.whatsapp };

      const { data: perfil } = await sb
        .from('profiles')
        .select('wa_usos, wa_extra')
        .eq('id', session.user.id)
        .maybeSingle();

      const usado = perfil?.wa_usos  || 0;
      const extra = perfil?.wa_extra || 0;
      const max   = lim.whatsapp + extra;
      return { usado, max, restante: Math.max(0, max - usado) };
    }

    return { usado: 0, max: 0, restante: 0 };
  } catch (err) {
    console.error('[suscripcion-control] getUsoActual error:', err);
    return { usado: 0, max: 0, restante: 0 };
  }
}

/**
 * Retorna estado resumido del plan.
 */
async function getEstadoPlan() {
  try {
    const p = await PlanService.getPlan();
    if (!p) return { plan: 'free', activo: false, diasRestantes: null };

    const plan   = p.plan   || 'free';
    const activo = p.status === 'active';
    const lim    = getPlanLimits(plan);
    let diasRestantes = null;

    if (plan === 'free' && lim.dias !== null && p.created_at) {
      diasRestantes = Math.max(0, lim.dias - diasDesdeInicio(p.created_at));
    }

    return { plan, activo, diasRestantes };
  } catch (err) {
    console.error('[suscripcion-control] getEstadoPlan error:', err);
    return { plan: 'free', activo: false, diasRestantes: null };
  }
}

/**
 * Mensaje de aviso cuando se acerca al límite.
 */
async function avisoLimite(feature) {
  try {
    const uso = await getUsoActual(feature);

    if (feature === 'whatsapp') {
      if (uso.restante <= 0)  return '🚫 Sin mensajes WhatsApp disponibles. Actualizá tu plan.';
      if (uso.restante === 1) return '⚠️ Te queda 1 mensaje WhatsApp disponible';
      if (uso.restante <= 5)  return `⚠️ Te quedan ${uso.restante} mensajes WhatsApp`;
    }

    if (feature === 'informesIA') {
      if (uso.restante <= 0)  return '🚫 Sin informes IA disponibles. Actualizá tu plan.';
      if (uso.restante === 1) return '⚠️ Te queda 1 informe IA disponible';
    }

    return null;
  } catch (err) {
    return null;
  }
}
