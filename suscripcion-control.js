/**
 * suscripcion-control.js
 * Control global de acceso por suscripción — PsicoApp
 *
 * ÚNICO lugar donde viven getPlanLimits, puedeUsar, registrarUso, getUsoActual, getEstadoPlan.
 * view-cuenta.js usa estas funciones globales — no las duplica.
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

function _getSus() {
  try { return JSON.parse(localStorage.getItem('suscripcion')) || null; }
  catch { return null; }
}

function _saveSus(s) {
  localStorage.setItem('suscripcion', JSON.stringify(s));
}

/* ─── API pública ──────────────────────────────────────── */

/**
 * Verifica si el usuario puede usar una feature.
 * Fuente de verdad final = Supabase (sincronizada al login).
 * Este chequeo es local/optimista para UX inmediata.
 */
function puedeUsar(feature) {
  const s = _getSus();
  if (!s || s.estado !== 'activa') return false;
  const plan  = s.plan  || 'free';
  const lim   = getPlanLimits(plan);
  const usos  = s.usos  || { whatsapp: 0, informesIA: 0 };
  const extra = s.extra || { whatsapp: 0 };

  if (plan === 'free' && lim.dias !== null) {
    if (diasDesdeInicio(s.fechaInicio) >= lim.dias) return false;
  }

  if (feature === 'whatsapp')
    return (usos.whatsapp || 0) < (lim.whatsapp + (extra.whatsapp || 0));

  if (feature === 'informesIA')
    return (usos.informesIA || 0) < lim.informesIA;

  return true;
}

/**
 * Registra un uso local y dispara sync a Supabase.
 * Retorna true si el uso fue registrado, false si el límite estaba alcanzado.
 */
function registrarUso(feature) {
  const s = _getSus();
  if (!s) return false;
  if (!puedeUsar(feature)) return false;
  if (!s.usos) s.usos = { whatsapp: 0, informesIA: 0 };

  if (feature === 'whatsapp')   s.usos.whatsapp   = (s.usos.whatsapp   || 0) + 1;
  if (feature === 'informesIA') s.usos.informesIA = (s.usos.informesIA || 0) + 1;

  _saveSus(s);

  // Sync a Supabase en background sin bloquear la UI
  if (feature === 'whatsapp' && typeof window._syncWaUsos === 'function') {
    window._syncWaUsos();
  }

  return true;
}

/**
 * Retorna uso actual: { usado, max, restante }
 */
function getUsoActual(feature) {
  const s     = _getSus();
  const plan  = s?.plan  || 'free';
  const lim   = getPlanLimits(plan);
  const usos  = s?.usos  || { whatsapp: 0, informesIA: 0 };
  const extra = s?.extra || { whatsapp: 0 };

  if (feature === 'whatsapp') {
    const max = lim.whatsapp + (extra.whatsapp || 0);
    return { usado: usos.whatsapp || 0, max, restante: Math.max(0, max - (usos.whatsapp || 0)) };
  }

  if (feature === 'informesIA') {
    return { usado: usos.informesIA || 0, max: lim.informesIA, restante: Math.max(0, lim.informesIA - (usos.informesIA || 0)) };
  }

  return { usado: 0, max: 0, restante: 0 };
}

/**
 * Retorna estado resumido del plan.
 */
function getEstadoPlan() {
  const s = _getSus();
  if (!s) return { plan: 'free', activo: false, diasRestantes: null };

  const plan   = s.plan  || 'free';
  const lim    = getPlanLimits(plan);
  const activo = s.estado === 'activa';
  let diasRestantes = null;

  if (plan === 'free' && lim.dias !== null) {
    diasRestantes = Math.max(0, lim.dias - diasDesdeInicio(s.fechaInicio));
  }

  return { plan, activo, diasRestantes };
}

/**
 * Mensaje de aviso cuando se acerca al límite.
 */
function avisoLimite(feature) {
  const s = _getSus();
  if (!s) return null;
  const lim  = getPlanLimits(s.plan || 'free');
  const usos = s.usos  || { whatsapp: 0, informesIA: 0 };
  const ext  = s.extra || { whatsapp: 0 };

  if (feature === 'whatsapp') {
    const r = (lim.whatsapp + (ext.whatsapp || 0)) - (usos.whatsapp || 0);
    if (r <= 0)  return '🚫 Sin mensajes WhatsApp disponibles. Actualizá tu plan.';
    if (r === 1) return '⚠️ Te queda 1 mensaje WhatsApp disponible';
    if (r <= 5)  return `⚠️ Te quedan ${r} mensajes WhatsApp`;
  }

  if (feature === 'informesIA') {
    const r = lim.informesIA - (usos.informesIA || 0);
    if (r <= 0)  return '🚫 Sin informes IA disponibles. Actualizá tu plan.';
    if (r === 1) return '⚠️ Te queda 1 informe IA disponible';
  }

  return null;
}
