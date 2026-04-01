let cuentaInitialized = false;
/**
 * view-cuenta.js — PsicoApp
 * Planes: Free / Pro / Max con control de uso real.
 */

(function injectCuentaStyles() {
  if (document.getElementById('view-cuenta-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-cuenta-styles';
  style.textContent = `
#view-cuenta { min-height:100vh; background:var(--bg); }
#view-cuenta .vc-hero { background:linear-gradient(145deg,#1E1040 0%,#2D1B69 55%,#4C2A9A 100%); padding:28px 20px 56px; position:relative; overflow:hidden; }
#view-cuenta .vc-hero::before { content:''; position:absolute; width:260px; height:260px; border-radius:50%; background:rgba(255,255,255,.04); right:-60px; top:-60px; }
#view-cuenta .vc-hero::after  { content:''; position:absolute; width:180px; height:180px; border-radius:50%; background:rgba(167,139,250,.1); left:-40px; bottom:-40px; }
#view-cuenta .vc-hero-inner   { position:relative; z-index:1; display:flex; align-items:center; gap:16px; }
#view-cuenta .vc-avatar { width:64px; height:64px; border-radius:20px; background:linear-gradient(135deg,#5B2FA8,#A78BFA); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; color:white; flex-shrink:0; border:2px solid rgba(255,255,255,.18); box-shadow:0 4px 20px rgba(0,0,0,.3); overflow:hidden; }
#view-cuenta .vc-avatar img { width:100%; height:100%; object-fit:cover; border-radius:18px; }
#view-cuenta .vc-hero-name  { font-size:20px; font-weight:800; color:white; line-height:1.1; }
#view-cuenta .vc-hero-email { font-size:13px; color:rgba(255,255,255,.55); margin-top:3px; }
#view-cuenta .vc-hero-badge { display:inline-flex; align-items:center; gap:5px; margin-top:7px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:800; }
#view-cuenta .hb-pro  { background:linear-gradient(135deg,rgba(124,58,237,.6),rgba(167,139,250,.4)); border:1px solid rgba(167,139,250,.4); color:#DDD6FE; }
#view-cuenta .hb-max  { background:linear-gradient(135deg,rgba(190,24,93,.5),rgba(244,114,182,.4)); border:1px solid rgba(244,114,182,.4); color:#FDE8F5; }
#view-cuenta .hb-free { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); color:rgba(255,255,255,.6); }

#view-cuenta .vc-body { padding:0 16px 40px; margin-top:-28px; position:relative; z-index:5; display:flex; flex-direction:column; gap:16px; max-width:560px; margin-left:auto; margin-right:auto; }
@media (min-width:768px) { #view-cuenta .vc-body { padding:0 28px 40px; } }

#view-cuenta .vc-status-strip { background:var(--surface); border-radius:var(--radius); padding:14px 18px; display:flex; align-items:center; justify-content:space-between; box-shadow:var(--shadow-md); }
#view-cuenta .vc-strip-left   { display:flex; align-items:center; gap:10px; }
#view-cuenta .vc-strip-dot    { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
#view-cuenta .dot-activa   { background:#10B981; box-shadow:0 0 8px rgba(16,185,129,.5); }
#view-cuenta .dot-inactiva { background:#9CA3AF; }
#view-cuenta .vc-strip-label { font-size:13px; font-weight:600; color:var(--text-muted); }
#view-cuenta .vc-strip-val   { font-size:14px; font-weight:800; color:var(--text); }
#view-cuenta .vc-strip-fecha { font-size:11px; color:var(--text-muted); font-weight:500; }

#view-cuenta .vc-section-title { font-size:13px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; }

#view-cuenta .vc-usage-card { background:var(--surface); border-radius:var(--radius); padding:20px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:14px; }
#view-cuenta .vc-usage-row  { display:flex; flex-direction:column; gap:6px; }
#view-cuenta .vc-usage-label-row { display:flex; justify-content:space-between; align-items:center; }
#view-cuenta .vc-usage-label { font-size:12px; font-weight:700; color:var(--text-muted); }
#view-cuenta .vc-usage-count { font-size:13px; font-weight:800; color:var(--text); }
#view-cuenta .vc-usage-count.alerta { color:#EF4444; }
#view-cuenta .vc-bar-track { height:7px; border-radius:99px; background:var(--border); overflow:hidden; }
#view-cuenta .vc-bar-fill  { height:100%; border-radius:99px; transition:width .4s; }
#view-cuenta .vc-dias-badge { display:flex; align-items:center; gap:10px; border-radius:10px; padding:11px 14px; background:var(--surface2); }
#view-cuenta .vc-dias-badge.alerta { background:rgba(239,68,68,.08); }

#view-cuenta .vc-planes-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(145px,1fr)); gap:12px; }
#view-cuenta .vc-plan-card { background:var(--surface); border-radius:var(--radius); padding:18px 14px 14px; border:2px solid var(--border); position:relative; display:flex; flex-direction:column; gap:10px; box-shadow:var(--shadow-sm); }
#view-cuenta .vc-plan-card.plan-actual { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-light),var(--shadow-md); }
#view-cuenta .plan-pro-card { background:linear-gradient(160deg,#1E1040,#2D1B69); border-color:rgba(167,139,250,.4); }
#view-cuenta .plan-max-card { background:linear-gradient(160deg,#0F0B1E,#1E0A3C); border-color:rgba(244,114,182,.4); }

#view-cuenta .vc-plan-badge-wrap { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
#view-cuenta .vc-badge { font-size:10px; font-weight:800; padding:3px 9px; border-radius:20px; }
#view-cuenta .badge-actual      { background:rgba(16,185,129,.15); color:#10B981; border:1px solid rgba(16,185,129,.3); }
#view-cuenta .badge-recomendado { background:linear-gradient(135deg,#5B2FA8,#7C3AED); color:white; }
#view-cuenta .badge-max         { background:linear-gradient(135deg,#BE185D,#F472B6); color:white; }
#view-cuenta .badge-free-tag    { background:var(--surface2); color:var(--text-muted); }

#view-cuenta .vc-plan-name  { font-size:22px; font-weight:800; line-height:1; }
#view-cuenta .vc-plan-price { font-size:12px; font-weight:600; }
#view-cuenta .plan-pro-card .vc-plan-name, #view-cuenta .plan-max-card .vc-plan-name  { color:white; }
#view-cuenta .plan-pro-card .vc-plan-price, #view-cuenta .plan-max-card .vc-plan-price { color:rgba(255,255,255,.5); }
#view-cuenta .plan-free-card .vc-plan-name  { color:var(--text); }
#view-cuenta .plan-free-card .vc-plan-price { color:var(--text-muted); }
#view-cuenta .vc-plan-features { display:flex; flex-direction:column; gap:6px; flex:1; }
#view-cuenta .vc-pf { display:flex; align-items:flex-start; gap:6px; font-size:11px; font-weight:500; line-height:1.3; }
#view-cuenta .plan-pro-card .vc-pf, #view-cuenta .plan-max-card .vc-pf { color:rgba(255,255,255,.75); }
#view-cuenta .plan-free-card .vc-pf { color:var(--text-muted); }
#view-cuenta .vc-pf-icon { font-size:12px; flex-shrink:0; margin-top:1px; }
#view-cuenta .pf-lock { opacity:.4; }

#view-cuenta .vc-plan-btn { width:100%; padding:10px; border-radius:var(--radius-sm); border:none; font-family:var(--font); font-size:12px; font-weight:800; cursor:pointer; transition:transform .12s; display:flex; align-items:center; justify-content:center; gap:5px; }
#view-cuenta .vc-plan-btn:hover { transform:translateY(-1px); }
#view-cuenta .btn-plan-actual  { background:var(--surface2); color:var(--text-muted); cursor:default; }
#view-cuenta .btn-plan-actual:hover { transform:none; }
#view-cuenta .btn-upgrade     { background:linear-gradient(135deg,#5B2FA8,#7C3AED); color:white; box-shadow:0 4px 16px rgba(92,47,168,.4); }
#view-cuenta .btn-upgrade-max { background:linear-gradient(135deg,#BE185D,#F472B6); color:white; box-shadow:0 4px 16px rgba(244,114,182,.4); }

#view-cuenta .vc-yapague-card  { background:var(--surface); border-radius:var(--radius); padding:18px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:10px; }
#view-cuenta .vc-yapague-title { font-size:14px; font-weight:700; color:var(--text); }
#view-cuenta .vc-yapague-sub   { font-size:12px; color:var(--text-muted); line-height:1.5; }
#view-cuenta .vc-btns-yapague  { display:flex; gap:10px; }
#view-cuenta .vc-btn-yapague { flex:1; padding:12px; border-radius:var(--radius-sm); background:rgba(16,185,129,.1); color:#059669; border:1.5px solid rgba(16,185,129,.25); font-family:var(--font); font-size:13px; font-weight:800; cursor:pointer; transition:transform .12s; }
#view-cuenta .vc-btn-yapague:hover { transform:translateY(-1px); }
#view-cuenta .vc-btn-yapague-max { background:rgba(244,114,182,.1); color:#BE185D; border-color:rgba(244,114,182,.25); }
#view-cuenta .vc-btn-extra { width:100%; padding:12px; border-radius:var(--radius-sm); background:linear-gradient(135deg,rgba(92,47,168,.1),rgba(124,58,237,.08)); border:1.5px dashed rgba(124,58,237,.35); color:var(--primary); font-family:var(--font); font-size:12px; font-weight:800; cursor:pointer; transition:transform .12s; }
#view-cuenta .vc-btn-extra:hover { transform:translateY(-1px); }
#view-cuenta .vc-logout-wrap { display:flex; flex-direction:column; gap:8px; }
#view-cuenta .vc-btn-logout { width:100%; padding:13px; border-radius:var(--radius-sm); background:var(--danger-light); color:var(--danger); border:1.5px solid rgba(229,62,62,.2); font-family:var(--font); font-size:14px; font-weight:700; cursor:pointer; transition:transform .12s; }
#view-cuenta .vc-btn-logout:hover { transform:translateY(-1px); }
#view-cuenta .vc-toast { position:fixed; top:80px; left:50%; transform:translateX(-50%); background:#1A1530; color:white; padding:12px 22px; border-radius:12px; font-size:14px; font-weight:700; z-index:9999; display:none; white-space:nowrap; box-shadow:0 8px 32px rgba(0,0,0,.35); }
#view-cuenta .vc-toast.show { display:block; animation:vcFadeUp .25s ease; }
@keyframes vcFadeUp { from{opacity:0;transform:translate(-50%,8px)} to{opacity:1;transform:translate(-50%,0)} }
#view-cuenta .vc-pad { height:24px; }
  `;
  document.head.appendChild(style);
})();

/* ══ FUNCIONES SAAS ══
   getPlanLimits, diasDesdeInicio, puedeUsar, registrarUso, avisoLimite
   se cargan desde suscripcion-control.js (cargado antes en index.html)
*/

function vc_getPerfil() {
  try { return JSON.parse(localStorage.getItem('perfil')) || {}; } catch { return {}; }
}

function getSuscripcion() {
  try { return JSON.parse(localStorage.getItem('suscripcion')) || null; } catch { return null; }
}

async function activarSuscripcion(planElegido) {
  const planFinal = planElegido || 'pro';
  const s = getSuscripcion();
  const nuevoEstado = {
    plan: planFinal, estado: 'activa',
    fechaInicio: s?.fechaInicio || new Date().toISOString(),
    usos:  s?.usos  || { whatsapp:0, informesIA:0 },
    extra: s?.extra || { whatsapp:0 },
  };
  saveSuscripcion(nuevoEstado);

  // Sincronizar con Supabase
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      await sb.from('profiles').update({ plan: planFinal }).eq('id', session.user.id);
    }
  } catch(e) {
    console.warn('[Cuenta] No se pudo sincronizar plan a Supabase:', e.message);
  }

  renderCuenta();
  vcToast('✅ ¡Plan ' + planFinal.toUpperCase() + ' activado!');
}

function comprarExtraWhatsapp() {
  const s = getSuscripcion();
  if (!s) return;
  if (!s.extra) s.extra = { whatsapp:0 };
  s.extra.whatsapp = (s.extra.whatsapp || 0) + 100;
  saveSuscripcion(s);
  renderCuenta();
  vcToast('✅ 100 mensajes WhatsApp extra agregados');
}

function vcToast(msg) {
  const t = document.getElementById('vc-toast-global');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

function _usageBar(usado, tope, label, color) {
  const pct    = tope > 0 ? Math.min(100, Math.round(usado / tope * 100)) : 0;
  const alerta = pct >= 80;
  return `
  <div class="vc-usage-row">
    <div class="vc-usage-label-row">
      <span class="vc-usage-label">${label}</span>
      <span class="vc-usage-count ${alerta ? 'alerta' : ''}">${usado} / ${tope}</span>
    </div>
    <div class="vc-bar-track">
      <div class="vc-bar-fill" style="width:${pct}%;background:${alerta ? '#EF4444' : color};"></div>
    </div>
  </div>`;
}

/* ══ RENDER ══ */

function renderCuenta() {
  const container = document.getElementById('view-cuenta');
  if (!container) return;

  const perfil      = vc_getPerfil();
  const sus         = getSuscripcion();
  const plan        = sus?.plan   || 'free';
  const estado      = sus?.estado || 'inactiva';
  const estaActiva  = estado === 'activa';
  const lim         = getPlanLimits(plan);
  const usos        = sus?.usos  || { whatsapp:0, informesIA:0 };
  const ext         = sus?.extra || { whatsapp:0 };
  const linkPagoPro   = (typeof PSICOAPP_CONFIG !== 'undefined' && PSICOAPP_CONFIG.LINK_PAGO_PRO)
    ? PSICOAPP_CONFIG.LINK_PAGO_PRO   : 'https://mpago.la/TU_LINK_PRO';
  const linkPagoMax   = (typeof PSICOAPP_CONFIG !== 'undefined' && PSICOAPP_CONFIG.LINK_PAGO_MAX)
    ? PSICOAPP_CONFIG.LINK_PAGO_MAX   : 'https://mpago.la/TU_LINK_MAX';
  const linkPagoExtra = 'https://mpago.la/23Lff3N';

  const nombre    = perfil.nombre || 'Profesional';
  const email     = perfil.email  || '';
  const iniciales = nombre.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const avatarHTML = perfil.foto ? `<img src="${perfil.foto}">` : (iniciales || '👤');

  const diasUsados    = diasDesdeInicio(sus?.fechaInicio);
  const diasRestantes = lim.dias !== null ? Math.max(0, lim.dias - diasUsados) : null;
  const fechaLabel    = estaActiva && sus?.fechaInicio
    ? new Date(sus.fechaInicio).toLocaleDateString('es-AR',{day:'2-digit',month:'long',year:'numeric'})
    : null;

  const topeWA = lim.whatsapp + (ext.whatsapp || 0);
  const topeIA = lim.informesIA;

  const heroBadge = plan === 'max'
    ? `<div class="vc-hero-badge hb-max">💎 Plan Max activo</div>`
    : plan === 'pro'
      ? `<div class="vc-hero-badge hb-pro">⭐ Plan Pro activo</div>`
      : `<div class="vc-hero-badge hb-free">🔒 Plan Free</div>`;

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  if (!cuentaInitialized) {
    container.innerHTML = `
<div id="vc-toast-global" class="vc-toast"></div>

<div class="vc-hero">
  <div class="vc-hero-inner">
    <div class="vc-avatar">${avatarHTML}</div>
    <div>
      <div class="vc-hero-name">${nombre}</div>
      ${email ? `<div class="vc-hero-email">${email}</div>` : ''}
      ${heroBadge}
    </div>
  </div>
</div>

<div class="vc-body">

  <div class="vc-status-strip">
    <div class="vc-strip-left">
      <div class="vc-strip-dot ${estaActiva ? 'dot-activa' : 'dot-inactiva'}"></div>
      <div>
        <div class="vc-strip-label">Estado de suscripción</div>
        <div class="vc-strip-val">${estaActiva ? 'Activa' : 'Inactiva'}</div>
      </div>
    </div>
    <div style="text-align:right">
      <div class="vc-strip-label">Plan</div>
      <div class="vc-strip-val">${planLabel}</div>
      ${fechaLabel ? `<div class="vc-strip-fecha">Desde ${fechaLabel}</div>` : ''}
    </div>
  </div>

  <div class="vc-usage-card">
    <div class="vc-section-title">Uso del plan</div>
    ${plan === 'free' && diasRestantes !== null ? `
    <div class="vc-dias-badge ${diasRestantes <= 3 ? 'alerta' : ''}">
      <span style="font-size:20px;">${diasRestantes <= 3 ? '🔴' : '📅'}</span>
      <div>
        <div style="font-size:13px;font-weight:800;color:${diasRestantes <= 3 ? '#EF4444' : 'var(--text)'};">${diasRestantes} días restantes del período Free</div>
        <div style="font-size:11px;color:var(--text-muted);">Período de prueba de 15 días</div>
      </div>
    </div>` : ''}
    <div id="vc-usage-bars"></div>
    <div id="vc-extra-wa-wrap"></div>
  </div>

  <div class="vc-section-title">Elegí tu plan</div>

  <div class="vc-planes-grid">

    <div class="vc-plan-card plan-free-card ${plan === 'free' ? 'plan-actual' : ''}">
      <div class="vc-plan-badge-wrap">
        ${plan === 'free' ? '<span class="vc-badge badge-actual">✓ Actual</span>' : '<span class="vc-badge badge-free-tag">Free</span>'}
      </div>
      <div><div class="vc-plan-name">Free</div><div class="vc-plan-price">15 días de prueba</div></div>
      <div class="vc-plan-features">
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>20 msj WhatsApp</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>1 informe IA</div>
        <div class="vc-pf pf-lock"><span class="vc-pf-icon">🔒</span>Pacientes ilimitados</div>
        <div class="vc-pf pf-lock"><span class="vc-pf-icon">🔒</span>Soporte prioritario</div>
      </div>
      <button class="vc-plan-btn btn-plan-actual" disabled>${plan === 'free' ? '✓ Plan actual' : 'Plan básico'}</button>
    </div>

    <div class="vc-plan-card plan-pro-card ${plan === 'pro' ? 'plan-actual' : ''}">
      <div class="vc-plan-badge-wrap">
        <span class="vc-badge badge-recomendado">⭐ Recomendado</span>
        ${plan === 'pro' ? '<span class="vc-badge badge-actual">✓ Actual</span>' : ''}
      </div>
      <div><div class="vc-plan-name">Pro</div><div class="vc-plan-price">$18.000 / mes</div></div>
      <div class="vc-plan-features">
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>100 msj WhatsApp</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>3 informes IA</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>Pacientes ilimitados</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>Extras disponibles</div>
      </div>
      ${plan === 'pro'
        ? '<button class="vc-plan-btn btn-plan-actual" disabled>✓ Plan actual</button>'
        : '<button class="vc-plan-btn btn-upgrade" id="vc-btn-upgrade-pro">🚀 Activar Pro</button>'}
    </div>

    <div class="vc-plan-card plan-max-card ${plan === 'max' ? 'plan-actual' : ''}">
      <div class="vc-plan-badge-wrap">
        <span class="vc-badge badge-max">💎 Max</span>
        ${plan === 'max' ? '<span class="vc-badge badge-actual">✓ Actual</span>' : ''}
      </div>
      <div><div class="vc-plan-name">Max</div><div class="vc-plan-price">$24.000 / mes</div></div>
      <div class="vc-plan-features">
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>250 msj WhatsApp</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>25 informes IA</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>Pacientes ilimitados</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>Soporte prioritario</div>
      </div>
      ${plan === 'max'
        ? '<button class="vc-plan-btn btn-plan-actual" disabled>✓ Plan actual</button>'
        : '<button class="vc-plan-btn btn-upgrade-max" id="vc-btn-upgrade-max">💎 Activar Max</button>'}
    </div>

  </div>



  <div class="vc-logout-wrap">
    <button class="vc-btn-logout" id="vc-btn-logout">🚪 Cerrar sesión</button>
  </div>

  <div class="vc-pad"></div>
</div>
  `;
    cuentaInitialized = true;
  }

  // ── Siempre actualizar barras de uso (desktop Y mobile, primer render y re-renders) ──
  const usageBarsEl = container.querySelector('#vc-usage-bars');
  if (usageBarsEl) {
    const usadoWA = usos.whatsapp   ?? 0;
    const usadoIA = usos.informesIA ?? 0;
    usageBarsEl.innerHTML =
      _usageBar(usadoWA, topeWA, '💬 Mensajes WhatsApp', '#7C3AED') +
      _usageBar(usadoIA, topeIA, '🤖 Informes IA',       '#A78BFA');
  }

  // ── Botón extra WhatsApp: visible solo en plan pro, siempre actualizado ──
  const extraWaWrap = container.querySelector('#vc-extra-wa-wrap');
  if (extraWaWrap) {
    extraWaWrap.innerHTML = `<button class="vc-btn-extra" id="vc-btn-extra-wa">➕ Comprar 100 mensajes WhatsApp extra ($5.000)</button>`;
  }

  const q = id => container.querySelector(id);
  const on = (id, fn) => { const el = q(id); if (el) el.addEventListener('click', fn); };

  on('#vc-btn-upgrade-pro', () => {
    const retorno = encodeURIComponent(window.location.origin + '/?plan=pro');
    window.location.href = linkPagoPro + '?back_url=' + retorno;
  });
  on('#vc-btn-upgrade-max', () => {
    const retorno = encodeURIComponent(window.location.origin + '/?plan=max');
    window.location.href = linkPagoMax + '?back_url=' + retorno;
  });
  on('#vc-btn-extra-wa',    () => { window.location.href = linkPagoExtra; });
  on('#vc-btn-logout',      async () => {
    window._psicoSigningOut = true;
    try { await sb.auth.signOut(); } catch(e) {}
    window.location.replace('/login.html');
  });
}

window.addEventListener('perfilActualizado', () => {
  const c = document.getElementById('view-cuenta');
  if (c && c.classList.contains('view-active')) renderCuenta();
});

function initCuenta() {
  try {
    const c = document.getElementById('view-cuenta');
    if (!c) return;
    renderCuenta();
  } catch(e) {
    console.error('initCuenta error:', e);
  }
}

window.onViewEnter_cuenta = initCuenta;
