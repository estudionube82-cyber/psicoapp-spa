// ============================================================
//  PSICOAPP — SISTEMA DE LÍMITES DE PLAN
//  Incluir en todas las páginas que usen WA o IA:
//  <script src="/config.js"></script>
//  <script src="/psicoapp-limites.js"></script>
// ============================================================

const PLANES = {
  free: {
    nombre: 'Free',
    wa_mes:  10,
    ia_mes:  3,
    precio:  0,
  },
  pro: {
    nombre: 'Pro',
    wa_mes:  20,    // + wa_extra comprado
    ia_mes:  25,
    precio:  15000,
  },
  max: {
    nombre: 'Max',
    wa_mes:  99999, // ilimitado
    ia_mes:  80,
    precio:  22000,
  },
};

// Cache en memoria para no ir a Supabase en cada uso
window._planCache = null;

async function obtenerPlan(sb, userId) {
  if (window._planCache) return window._planCache;
  const { data } = await sb.from('profiles')
    .select('plan, wa_extra')
    .eq('id', userId)
    .maybeSingle();
  const plan = data?.plan || 'free';
  const wa_extra = data?.wa_extra || 0;
  window._planCache = { plan, wa_extra };
  return window._planCache;
}

function inicioMes() {
  const d = new Date();
  d.setDate(1); d.setHours(0,0,0,0);
  return d.toISOString();
}

// ── WHATSAPP ────────────────────────────────────────────────

async function verificarLimiteWA(sb, userId) {
  const { plan, wa_extra } = await obtenerPlan(sb, userId);
  const config = PLANES[plan];

  // Max = ilimitado
  if (plan === 'max') return true;

  // Contar WA enviados este mes
  const { count } = await sb.from('wa_usos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', inicioMes());

  const limite = config.wa_mes + wa_extra;

  if (count >= limite) {
    mostrarModalLimiteWA(plan, count, limite);
    return false;
  }
  return true;
}

async function registrarUsoWA(sb, userId, paciente_id = null) {
  await sb.from('wa_usos').insert({
    user_id: userId,
    paciente_id: paciente_id,
    created_at: new Date().toISOString(),
  });
}

function mostrarModalLimiteWA(plan, usado, limite) {
  const html = `
    <div id="modalLimiteWA" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center;">
      <div style="background:#fff;border-radius:24px 24px 0 0;padding:28px 24px 40px;width:100%;max-width:430px;">
        <div style="font-size:32px;text-align:center;margin-bottom:12px;">📱</div>
        <div style="font-size:18px;font-weight:800;text-align:center;margin-bottom:8px;">Límite de WhatsApp alcanzado</div>
        <div style="font-size:14px;color:#666;text-align:center;margin-bottom:20px;line-height:1.6;">
          Usaste <strong>${usado}/${limite}</strong> mensajes de este mes.<br>
          ${plan === 'free' ? 'Pasate a Pro para tener más mensajes.' : 'Comprá un pack extra o pasate a Max para WA ilimitado.'}
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${plan === 'free' ? `
            <button onclick="window.location.href='psicoapp-cuenta.html'" style="background:#2D6A4F;color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;">⭐ Pasarme a Pro — $15.000/mes</button>
            <button onclick="window.location.href='psicoapp-cuenta.html'" style="background:linear-gradient(135deg,#F4A261,#E76F51);color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;">🚀 Plan Max — WA ilimitado</button>
          ` : `
            <button onclick="comprarPackWA()" style="background:#2D6A4F;color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;">📦 Comprar 100 WA extra — $5.000</button>
            <button onclick="window.location.href='psicoapp-cuenta.html'" style="background:linear-gradient(135deg,#F4A261,#E76F51);color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;">🚀 Pasarme a Max — $22.000/mes</button>
          `}
          <button onclick="document.getElementById('modalLimiteWA').remove()" style="background:none;border:none;padding:12px;font-size:14px;color:#999;cursor:pointer;">Cerrar</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function comprarPackWA() {
  // ⚠️ Reemplazar con el link real de MercadoPago para el pack WA
  const linkPackWA = (typeof PSICOAPP_CONFIG !== 'undefined' && PSICOAPP_CONFIG.MP_PACK_WA)
    ? PSICOAPP_CONFIG.MP_PACK_WA
    : null;

  if (!linkPackWA) {
    alert('El link de compra no está configurado aún. Contactá al soporte.');
    return;
  }
  window.open(linkPackWA, '_blank');
}

// ── IA ──────────────────────────────────────────────────────

async function verificarLimiteIA(sb, userId) {
  const { plan } = await obtenerPlan(sb, userId);
  const config = PLANES[plan];

  const { count } = await sb.from('ia_usos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', inicioMes());

  if (count >= config.ia_mes) {
    mostrarModalLimiteIA(plan, count, config.ia_mes);
    return false;
  }
  return true;
}

async function registrarUsoIA(sb, userId, tipo) {
  await sb.from('ia_usos').insert({
    user_id: userId,
    tipo: tipo,
    created_at: new Date().toISOString(),
  });
}

function mostrarModalLimiteIA(plan, usado, limite) {
  const html = `
    <div id="modalLimiteIA" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center;">
      <div style="background:#fff;border-radius:24px 24px 0 0;padding:28px 24px 40px;width:100%;max-width:430px;">
        <div style="font-size:32px;text-align:center;margin-bottom:12px;">🧠</div>
        <div style="font-size:18px;font-weight:800;text-align:center;margin-bottom:8px;">Límite de IA alcanzado</div>
        <div style="font-size:14px;color:#666;text-align:center;margin-bottom:20px;line-height:1.6;">
          Usaste <strong>${usado}/${limite}</strong> consultas de IA este mes.<br>
          Upgradear tu plan para seguir usando el asistente.
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${plan === 'free' ? `<button onclick="window.location.href='psicoapp-cuenta.html'" style="background:#2D6A4F;color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;">⭐ Pasarme a Pro — $15.000/mes</button>` : ''}
          <button onclick="window.location.href='psicoapp-cuenta.html'" style="background:linear-gradient(135deg,#F4A261,#E76F51);color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;">🚀 Plan Max — 80 usos IA/mes</button>
          <button onclick="document.getElementById('modalLimiteIA').remove()" style="background:none;border:none;padding:12px;font-size:14px;color:#999;cursor:pointer;">Cerrar</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

// ── BADGE DE PLAN en header ──────────────────────────────────
async function mostrarBadgePlan(sb, userId, elementId) {
  const { plan } = await obtenerPlan(sb, userId);
  const el = document.getElementById(elementId);
  if (!el) return;
  const labels = { free: '🆓 Free', pro: '⭐ Pro', max: '🚀 Max' };
  el.textContent = labels[plan] || 'Free';
  el.className = `plan-badge ${plan}`;
}
