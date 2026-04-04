/**
 * view-dashboard.js — PsicoApp SPA (refactorizado)
 * Registrado en PsicoRouter: init / onEnter / onLeave
 *
 * onEnter() siempre refresca datos (pagos + turnos cambian constantemente).
 * userId viene del store — sin getUser() duplicado.
 * Nombre/avatar se sincronizan también en sidebar via storeUpdated { type: 'perfil' }.
 */

/* ══════════════════════════════════════════
   ESTILOS — inyectados una sola vez
   ══════════════════════════════════════════ */
(function injectDashboardStyles() {
  if (document.getElementById('view-dashboard-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-dashboard-styles';
  style.textContent = `
#view-dashboard { min-height: 100vh; background: var(--bg); }

#view-dashboard .dash-header {
  background: linear-gradient(145deg, #1E1040 0%, #2D1B69 55%, #4C2A9A 100%);
  padding: 20px 20px 32px; position: relative; overflow: hidden;
}
#view-dashboard .dash-header::after {
  content:''; position:absolute; right:-40px; top:-40px;
  width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05);
}
#view-dashboard .dash-header::before {
  content:''; position:absolute; left:-30px; bottom:-60px;
  width:160px; height:160px; border-radius:50%; background:rgba(167,139,250,0.08);
}
@media (min-width:768px) { #view-dashboard .dash-header { padding:28px 32px 40px; } }

#view-dashboard .dash-header-row {
  display:flex; align-items:center; justify-content:space-between; position:relative; z-index:1;
}
#view-dashboard .dash-logo { font-family:var(--font-display); font-size:22px; color:white; }
#view-dashboard .dash-logo span { color:var(--v3); }
#view-dashboard .dash-header-actions { display:flex; gap:8px; }
#view-dashboard .dash-icon-btn {
  width:36px; height:36px; border-radius:11px;
  background:rgba(255,255,255,0.15); border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center; font-size:17px;
}
#view-dashboard .dash-greeting { margin-top:16px; position:relative; z-index:1; }
#view-dashboard .dash-greeting-sub {
  font-size:11px; color:rgba(255,255,255,0.55);
  text-transform:uppercase; letter-spacing:1.2px; font-weight:700;
}
#view-dashboard .dash-greeting-name {
  font-size:26px; font-weight:800; color:white; margin-top:3px; line-height:1.1;
}
#view-dashboard .dash-greeting-date { font-size:13px; color:rgba(255,255,255,0.6); margin-top:4px; }
#view-dashboard .dash-theme-btn {
  margin-top:12px; background:rgba(255,255,255,0.12); border:none; border-radius:20px;
  padding:5px 14px; cursor:pointer; font-size:15px; color:white; font-family:var(--font);
}

/* ── HERO ── */
#view-dashboard .dash-hero-fin {
  margin:-18px 16px 0; position:relative; z-index:10;
  background:var(--surface); border-radius:var(--radius); box-shadow:var(--shadow-md);
  padding:18px 20px 16px; display:flex; align-items:center; gap:16px;
  cursor:pointer; transition:transform .12s;
}
#view-dashboard .dash-hero-fin:hover { transform:translateY(-2px); }
#view-dashboard .dash-hero-fin-left { flex:1; }
#view-dashboard .dash-hero-label {
  font-size:11px; font-weight:700; color:var(--text-muted);
  text-transform:uppercase; letter-spacing:.8px;
}
#view-dashboard .dash-hero-amount {
  font-size:32px; font-weight:800; color:var(--text); line-height:1.1; margin-top:3px;
}
#view-dashboard .dash-hero-sub { font-size:12px; color:var(--text-muted); margin-top:4px; }
#view-dashboard .dash-hero-badge {
  padding:5px 12px; border-radius:20px; font-size:11px; font-weight:800;
  background:rgba(124,58,237,0.15); color:#7C3AED; white-space:nowrap;
}

/* ── ALERTAS ── */
#view-dashboard .dash-alerts { padding:12px 16px 0; display:flex; flex-direction:column; gap:8px; }
#view-dashboard .dash-alert {
  display:flex; align-items:center; gap:12px; padding:12px 14px;
  border-radius:var(--radius-sm); cursor:pointer; transition:transform .12s;
}
#view-dashboard .dash-alert:hover { transform:translateX(2px); }
#view-dashboard .dash-alert-yellow { background:rgba(251,191,36,0.08); border:1.5px solid rgba(251,191,36,0.25); }
#view-dashboard .dash-alert-green  { background:rgba(124,58,237,0.08);  border:1.5px solid rgba(124,58,237,0.25); }
#view-dashboard .dash-alert-icon   { font-size:20px; flex-shrink:0; }
#view-dashboard .dash-alert-text   { flex:1; }
#view-dashboard .dash-alert-title  { font-size:13px; font-weight:700; color:var(--text); }
#view-dashboard .dash-alert-sub    { font-size:11px; color:var(--text-muted); margin-top:1px; }
#view-dashboard .dash-alert-arrow  { font-size:16px; color:var(--text-muted); }

/* ── STATS ── */
#view-dashboard .dash-stats-row {
  display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:14px 16px 0;
}
@media (min-width:768px) {
  #view-dashboard .dash-stats-row { grid-template-columns:repeat(4,1fr); padding:16px 24px 0; }
}
#view-dashboard .dash-stat {
  background:var(--surface); border-radius:var(--radius-sm);
  padding:14px 16px; box-shadow:var(--shadow-sm); cursor:pointer; transition:transform .12s;
}
#view-dashboard .dash-stat:hover { transform:translateY(-2px); }
#view-dashboard .dash-stat-top {
  display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;
}
#view-dashboard .dash-stat-icon {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center; font-size:16px;
}
#view-dashboard .dsi-violet { background:var(--primary-light); }
#view-dashboard .dsi-orange { background:rgba(124,58,237,0.10); }
#view-dashboard .dsi-green  { background:rgba(124,58,237,0.12); }
#view-dashboard .dash-stat-badge {
  font-size:10px; font-weight:700; padding:2px 7px; border-radius:20px;
}
#view-dashboard .dsb-up  { background:rgba(124,58,237,0.15); color:#7C3AED; }
#view-dashboard .dsb-neu { background:var(--surface2); color:var(--text-muted); }
#view-dashboard .dash-stat-num   { font-size:22px; font-weight:800; color:var(--text); line-height:1; }
#view-dashboard .dash-stat-label { font-size:11px; color:var(--text-muted); font-weight:600; margin-top:3px; }

/* ── SECTION ── */
#view-dashboard .dash-section { padding:16px 16px 0; }
@media (min-width:768px) { #view-dashboard .dash-section { padding:16px 24px 0; } }
#view-dashboard .dash-section-title {
  font-size:12px; font-weight:800; color:var(--text-muted);
  text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;
  display:flex; align-items:center; justify-content:space-between;
}
#view-dashboard .dash-section-link {
  font-size:12px; font-weight:600; color:var(--primary); cursor:pointer;
  text-transform:none; letter-spacing:0;
}

/* ── QUICK ACCESS ── */
#view-dashboard .dash-quick { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
#view-dashboard .dash-qa {
  background:var(--surface); border-radius:var(--radius-sm);
  padding:14px 8px; display:flex; flex-direction:column;
  align-items:center; gap:6px; box-shadow:var(--shadow-sm);
  cursor:pointer; transition:transform .12s; border:none;
}
#view-dashboard .dash-qa:hover { transform:translateY(-2px); }
#view-dashboard .dash-qa-icon  { font-size:22px; }
#view-dashboard .dash-qa-label { font-size:10px; font-weight:700; color:var(--text-muted); text-align:center; }

/* ── TURNOS ── */
#view-dashboard .dash-turnos { display:flex; flex-direction:column; gap:8px; }
#view-dashboard .dash-turno {
  background:var(--surface); border-radius:var(--radius-sm);
  padding:12px 14px; display:flex; align-items:center; gap:12px;
  box-shadow:var(--shadow-sm); border-left:3px solid var(--primary-mid);
  cursor:pointer; transition:transform .12s;
}
#view-dashboard .dash-turno:hover { transform:translateX(2px); }
#view-dashboard .dash-turno.tc-past { opacity:.55; }
#view-dashboard .dash-turno.tc-now  { border-left-color:var(--primary); box-shadow:0 0 0 2px rgba(124,58,237,.18); }
#view-dashboard .dash-turno.tc-evento { border-left:4px solid #F97316; background:rgba(249,115,22,0.18); }
#view-dashboard .dt-tag { font-size:9px; font-weight:800; padding:2px 6px; border-radius:6px; margin-bottom:3px; display:inline-block; }
#view-dashboard .tag-evento  { background:rgba(249,115,22,0.25); color:#F97316; }
#view-dashboard .tag-paciente { background:rgba(124,58,237,0.2); color:#7C3AED; }
#view-dashboard .dt-hora      { font-size:15px; font-weight:800; color:var(--text); min-width:44px; }
#view-dashboard .dt-hora.now  { color:var(--primary); }
#view-dashboard .dt-info      { flex:1; }
#view-dashboard .dt-nombre    { font-size:14px; font-weight:700; color:var(--text); }
#view-dashboard .dt-meta      { font-size:11px; color:var(--text-muted); margin-top:1px; }
#view-dashboard .dt-badge     { font-size:10px; font-weight:700; padding:3px 8px; border-radius:20px; }
#view-dashboard .dtb-done     { background:var(--surface2); color:var(--text-muted); }
#view-dashboard .dtb-ok       { background:rgba(124,58,237,.15); color:#7C3AED; }
#view-dashboard .dtb-wait     { background:var(--primary-light); color:var(--primary); }
#view-dashboard .dash-now-line { display:flex; align-items:center; gap:8px; margin:4px 0; }
#view-dashboard .dnl-dot  { width:9px; height:9px; border-radius:50%; background:var(--primary); flex-shrink:0; }
#view-dashboard .dnl-lbl  { font-size:10px; font-weight:800; color:var(--primary); letter-spacing:.5px; white-space:nowrap; }
#view-dashboard .dnl-line { flex:1; height:1px; background:var(--primary); opacity:.35; }
#view-dashboard .dash-pad { height:32px; }

/* ── SKELETON LOADER ── */
#view-dashboard .dash-skeleton {
  background: linear-gradient(90deg, var(--border) 25%, var(--surface2) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: dashSkel 1.4s infinite;
  border-radius: 8px;
}
@keyframes dashSkel { 0%{background-position:200%} 100%{background-position:-200%} }
  `;
  document.head.appendChild(style);
})();


/* ══════════════════════════════════════════
   ESTADO INTERNO
   ══════════════════════════════════════════ */
const _dash = {
  // Timer para auto-refresh de turnos del día (cada 5 min)
  refreshTimer: null,
};

const _dashFmt = v => '$' + Number(v || 0).toLocaleString('es-AR');


/* ══════════════════════════════════════════
   RENDER HTML — una sola vez en init()
   ══════════════════════════════════════════ */
function _dashRenderHTML(container) {
  const hoy     = new Date();
  const fechaStr = hoy.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
  const tema    = document.documentElement.getAttribute('data-theme') || 'light';
  const fechaCap = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);

  container.innerHTML = `
<div class="dash-header">
  <div class="dash-header-row">
    <div class="dash-logo">Psico<span>App</span></div>
    <div class="dash-header-actions">
      <button class="dash-icon-btn" onclick="navigate('whatsapp')" title="WhatsApp">💬</button>
    </div>
  </div>
  <div class="dash-greeting">
    <div class="dash-greeting-sub">Bienvenido/a</div>
    <div class="dash-greeting-name" id="dash-user-name">…</div>
    <div class="dash-greeting-date">${fechaCap}</div>
    <button class="dash-theme-btn" onclick="toggleTheme()">
      <span id="toggle-thumb">${tema === 'dark' ? '🌙' : '☀️'}</span>
    </button>
  </div>
</div>

<!-- HERO FINANCIERO -->
<div class="dash-hero-fin" onclick="navigate('pagos')">
  <div class="dash-hero-fin-left">
    <div class="dash-hero-label">💰 Cobrado este mes</div>
    <div class="dash-hero-amount" id="dash-hero-amount">
      <span class="dash-skeleton" style="display:inline-block;width:140px;height:32px;"></span>
    </div>
    <div class="dash-hero-sub" id="dash-hero-sub"> </div>
  </div>
  <div class="dash-hero-badge">Ver pagos →</div>
</div>

<!-- ALERTAS -->
<div class="dash-alerts" id="dash-alerts"></div>

<!-- ACCESOS RÁPIDOS -->
<div class="dash-section" style="margin-top:14px">
  <div class="dash-quick">
    <button class="dash-qa" onclick="navigate('agenda')">
      <div class="dash-qa-icon">📅</div><div class="dash-qa-label">Agenda</div>
    </button>
    <button class="dash-qa" onclick="navigate('pacientes')">
      <div class="dash-qa-icon">👥</div><div class="dash-qa-label">Pacientes</div>
    </button>
    <button class="dash-qa" onclick="navigate('pagos')">
      <div class="dash-qa-icon">💰</div><div class="dash-qa-label">Pagos</div>
    </button>
    <button class="dash-qa" onclick="navigate('whatsapp')">
      <div class="dash-qa-icon">💬</div><div class="dash-qa-label">WhatsApp</div>
    </button>
  </div>
</div>

<!-- STATS -->
<div class="dash-stats-row" id="dash-stats-row">
  ${['Cobrado','Por cobrar','Pacientes','Turnos hoy'].map(l => `
    <div class="dash-stat">
      <div class="dash-skeleton" style="height:22px;margin-bottom:6px;"></div>
      <div class="dash-stat-label">${l}</div>
    </div>`).join('')}
</div>

<!-- TURNOS DE HOY -->
<div class="dash-section" style="margin-top:18px">
  <div class="dash-section-title">
    Turnos de hoy
    <span class="dash-section-link" onclick="navigate('agenda')">Ver agenda →</span>
  </div>
  <div class="dash-turnos" id="dash-turnos-list">
    <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">⏳ Cargando…</div>
  </div>
</div>

<div class="dash-pad"></div>
  `;
}


/* ══════════════════════════════════════════
   CARGA DE DATOS — se ejecuta en cada onEnter
   ══════════════════════════════════════════ */
async function _dashCargarDatos() {
  try {
    /* userId desde store — sin llamada extra a Supabase */
    const uid = await PsicoRouter.store.ensureUserId();
    if (!uid) return;

    const hoy          = new Date();
    const fechaHoy     = hoy.toISOString().split('T')[0];
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

    /* 4 queries en paralelo — incluye pacientes reales */
    const [resPagos, resTurnosHoy, resTurnosMes, resPacientes] = await Promise.all([
      sb.from('pagos')
        .select('id,paciente_id,monto,fecha,metodo')
        .eq('user_id', uid)
        .gte('fecha', primerDiaMes)
        .lte('fecha', ultimoDiaMes),

      sb.from('turnos')
        .select('id,fecha,hora,duracion,estado,tipo,notas,paciente_id,pacientes(nombre,apellido)')
        .eq('user_id', uid)
        .eq('fecha', fechaHoy)
        .order('hora', { ascending: true }),

      sb.from('turnos')
        .select('id,estado,precio')
        .eq('user_id', uid)
        .gte('fecha', primerDiaMes)
        .lte('fecha', ultimoDiaMes)
        .neq('estado', 'cancelado'),

      sb.from('pacientes')
        .select('id')
        .eq('user_id', uid)
        .eq('activo', true),
    ]);

    const pagos     = resPagos.data     || [];
    const turnos    = resTurnosHoy.data || [];
    const turnosMes = resTurnosMes.data || [];

    /* Calcular métricas */
    const totalCobrado   = pagos.filter(p => p.metodo !== 'pendiente').reduce((s, p) => s + (Number(p.monto) || 0), 0);
    const cantPagos      = pagos.filter(p => p.metodo !== 'pendiente').length;
    const pacUnicos      = resPacientes.data?.length || 0;
    const turnosHoyCant  = turnos.length;

    console.log('[Dashboard] pacientes reales:', pacUnicos);

    const turnosPendientes = turnosMes.filter(t => {
      const est = (t.estado || '').toLowerCase();
      return est === 'pendiente' || est === 'confirmado';
    });
    const totalPendienteTurnos = turnosPendientes.reduce((s, t) => s + (Number(t.precio) || 0), 0);
    const totalPendientePagos  = pagos.filter(p => p.metodo === 'pendiente').reduce((s, p) => s + (Number(p.monto) || 0), 0);
    const totalPendiente = totalPendienteTurnos + totalPendientePagos;

    const sesionSinCobro = turnosMes.filter(t => {
      const est = (t.estado || '').toLowerCase();
      return est === 'realizado' || est === 'completado';
    }).length;

    const pagosPendientes = pagos.filter(p => p.metodo === 'pendiente').length;

    /* Render de secciones */
    _dashRenderHero(totalCobrado, cantPagos, pacUnicos);
    _dashRenderAlertas(sesionSinCobro, pacUnicos, pagos, pagosPendientes);
    _dashRenderStats(totalCobrado, totalPendiente, pacUnicos, turnosHoyCant);
    _dashRenderTurnos(turnos, hoy);
    await _dashRenderNombre();

  } catch(e) {
    console.error('[Dashboard]', e.message);
  }
}


/* ══════════════════════════════════════════
   RENDER: HERO FINANCIERO
   ══════════════════════════════════════════ */
function _dashRenderHero(total, cant, pacUnicos) {
  const mes      = new Date().toLocaleString('es-AR', { month: 'long' });
  const amountEl = document.getElementById('dash-hero-amount');
  const subEl    = document.getElementById('dash-hero-sub');
  if (amountEl) amountEl.textContent = _dashFmt(total);
  if (subEl)    subEl.textContent =
    `${cant} cobro${cant !== 1 ? 's' : ''} · ${pacUnicos} paciente${pacUnicos !== 1 ? 's' : ''} · ${mes}`;
}


/* ══════════════════════════════════════════
   RENDER: ALERTAS
   ══════════════════════════════════════════ */
function _dashRenderAlertas(sesionSinCobro, pacUnicos, pagos, pagosPendientes) {
  const el = document.getElementById('dash-alerts');
  if (!el) return;
  const items = [];

  if (pagosPendientes > 0) {
    items.push(`
      <div class="dash-alert dash-alert-yellow" onclick="_irPagosPendientes()">
        <div class="dash-alert-icon">⏳</div>
        <div class="dash-alert-text">
          <div class="dash-alert-title">${pagosPendientes} pago${pagosPendientes > 1 ? 's' : ''} pendiente${pagosPendientes > 1 ? 's' : ''} de cobro</div>
          <div class="dash-alert-sub">Registrá el cobro en Pagos →</div>
        </div>
        <div class="dash-alert-arrow">›</div>
      </div>`);
  }

  if (sesionSinCobro > 0) {
    items.push(`
      <div class="dash-alert dash-alert-yellow" onclick="_irPagosPendientes()">
        <div class="dash-alert-icon">⚠️</div>
        <div class="dash-alert-text">
          <div class="dash-alert-title">${sesionSinCobro} sesión${sesionSinCobro > 1 ? 'es realizadas' : ' realizada'} sin cobro registrado</div>
          <div class="dash-alert-sub">Registrá el pago en Pagos →</div>
        </div>
        <div class="dash-alert-arrow">›</div>
      </div>`);
  }

  if (pagos.length === 0) {
    items.push(`
      <div class="dash-alert dash-alert-green" onclick="navigate('pagos')">
        <div class="dash-alert-icon">💡</div>
        <div class="dash-alert-text">
          <div class="dash-alert-title">Registrá tu primer cobro del mes</div>
          <div class="dash-alert-sub">Llevá el control de tus ingresos →</div>
        </div>
        <div class="dash-alert-arrow">›</div>
      </div>`);
  } else if (pacUnicos > 0) {
    items.push(`
      <div class="dash-alert dash-alert-green" onclick="navigate('pagos')">
        <div class="dash-alert-icon">🎉</div>
        <div class="dash-alert-text">
          <div class="dash-alert-title">${pacUnicos} paciente${pacUnicos > 1 ? 's' : ''} pagaron este mes</div>
          <div class="dash-alert-sub">Ver detalle de cobros →</div>
        </div>
        <div class="dash-alert-arrow">›</div>
      </div>`);
  }

  el.innerHTML = items.join('');
}


/* ══════════════════════════════════════════
   RENDER: STATS
   ══════════════════════════════════════════ */
function _dashRenderStats(cobrado, pendiente, pacUnicos, turnosHoy) {
  const el = document.getElementById('dash-stats-row');
  if (!el) return;
  el.innerHTML = `
    <div class="dash-stat" onclick="navigate('pagos')">
      <div class="dash-stat-top">
        <div class="dash-stat-icon dsi-violet">💰</div>
        <div class="dash-stat-badge dsb-up">Este mes</div>
      </div>
      <div class="dash-stat-num">${_dashFmt(cobrado)}</div>
      <div class="dash-stat-label">Cobrado</div>
    </div>
    <div class="dash-stat" onclick="_irPagosPendientes()">
      <div class="dash-stat-top">
        <div class="dash-stat-icon dsi-orange">⏳</div>
        <div class="dash-stat-badge dsb-neu">Pendiente</div>
      </div>
      <div class="dash-stat-num">${_dashFmt(pendiente)}</div>
      <div class="dash-stat-label">Por cobrar</div>
    </div>
    <div class="dash-stat" onclick="navigate('pacientes')">
      <div class="dash-stat-top">
        <div class="dash-stat-icon dsi-orange">👥</div>
        <div class="dash-stat-badge dsb-neu">Mes</div>
      </div>
      <div class="dash-stat-num">${pacUnicos}</div>
      <div class="dash-stat-label">Pacientes activos</div>
    </div>
    <div class="dash-stat" onclick="navigate('agenda')">
      <div class="dash-stat-top">
        <div class="dash-stat-icon dsi-green">📅</div>
        <div class="dash-stat-badge dsb-neu">Hoy</div>
      </div>
      <div class="dash-stat-num">${turnosHoy}</div>
      <div class="dash-stat-label">Turnos de hoy</div>
    </div>`;
}


/* ══════════════════════════════════════════
   RENDER: TURNOS DE HOY
   ══════════════════════════════════════════ */
function _dashRenderTurnos(turnos, hoy) {
  const el = document.getElementById('dash-turnos-list');
  if (!el) return;

  if (!turnos.length) {
    el.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">📭 Sin turnos para hoy</div>`;
    return;
  }

  const ahoraMs    = hoy.getTime();
  const aFmt       = hoy.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' });
  let nowInserted  = false;
  let html         = '';

  turnos.forEach(t => {
    const dt       = new Date(t.fecha + 'T' + t.hora);
    const horaFmt  = dt.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' });
    const duracion = t.duracion ? `${t.duracion} min` : '50 min';
    const pac      = t.pacientes;
    const tipo     = (t.tipo || '').toLowerCase();
    const esEvento = tipo === 'evento' || !t.paciente_id;
    const nombre   = esEvento
      ? (t.notas || 'Evento')
      : ((pac && (pac.nombre || pac.apellido))
          ? `${pac.nombre || ''} ${pac.apellido || ''}`.trim()
          : 'Paciente');
    const meta     = esEvento ? `Evento · ${duracion}` : `Sesión · ${duracion}`;
    const icono    = esEvento ? '🟠' : '🟢';
    const tag      = esEvento
      ? '<span class="dt-tag tag-evento">EVENTO</span>'
      : '<span class="dt-tag tag-paciente">SESIÓN</span>';
    const esPasado = dt.getTime() < ahoraMs - 30 * 60 * 1000;
    const esAhora  = !esPasado && dt.getTime() <= ahoraMs + 60 * 60 * 1000;

    if (!nowInserted && !esPasado) {
      html += `<div class="dash-now-line">
        <div class="dnl-dot"></div>
        <div class="dnl-lbl">AHORA · ${aFmt}</div>
        <div class="dnl-line"></div>
      </div>`;
      nowInserted = true;
    }

    const est = (t.estado || '').toLowerCase();
    let badge = '';
    if      (est === 'realizado' || est === 'completado') badge = `<div class="dt-badge dtb-done">Realizada</div>`;
    else if (est === 'confirmado')                        badge = `<div class="dt-badge dtb-ok">✓ Confirmó</div>`;
    else if (est === 'cancelado')                         badge = `<div class="dt-badge dtb-done" style="background:var(--danger-light);color:var(--danger)">Cancelado</div>`;
    else                                                  badge = `<div class="dt-badge dtb-wait">⏳ Pendiente</div>`;

    html += `
      <div class="dash-turno${esPasado ? ' tc-past' : ''}${esAhora ? ' tc-now' : ''}${esEvento ? ' tc-evento' : ''}" onclick="navigate('agenda')">
        <div class="dt-hora${esAhora ? ' now' : ''}">${horaFmt}</div>
        <div class="dt-info">
          ${tag}
          <div class="dt-nombre">${icono} ${nombre}</div>
          <div class="dt-meta">${meta}</div>
        </div>
        ${badge}
      </div>`;
  });

  /* Línea "AHORA" al final si todos los turnos ya pasaron */
  if (!nowInserted) {
    html += `<div class="dash-now-line">
      <div class="dnl-dot"></div>
      <div class="dnl-lbl">AHORA · ${aFmt}</div>
      <div class="dnl-line"></div>
    </div>`;
  }

  el.innerHTML = html;
}


/* ══════════════════════════════════════════
   RENDER: NOMBRE EN HEADER
   Lee siempre desde el store (fuente de verdad).
   Si el cache está vacío, lo pide a Supabase.
   ══════════════════════════════════════════ */
async function _dashRenderNombre() {
  /* ensurePerfil() devuelve el cache si existe, o hace fetch a Supabase */
  const perfil = await PsicoRouter.store.ensurePerfil().catch(() => ({}));
  const nombre = perfil.nombre_completo || perfil.nombre || 'Psicólogo/a';

  const nameEl = document.getElementById('dash-user-name');
  if (nameEl) nameEl.textContent = nombre;
}


/* ══════════════════════════════════════════
   REGISTRO EN EL ROUTER
   ══════════════════════════════════════════ */
/* Navega a pagos activando el filtro pendiente automáticamente */
window._irPagosPendientes = function() {
  localStorage.setItem('pv_filtro_default', 'pendiente');
  navigate('pagos');
};

PsicoRouter.register('dashboard', {

  /* init — monta el HTML y la estructura estática UNA SOLA VEZ */
  init(container) {
    _dashRenderHTML(container);
  },

  /* onEnter — refresca datos CADA VEZ que se navega al dashboard */
  async onEnter() {
    await _dashCargarDatos();

    /* Auto-refresh cada 5 minutos mientras el dashboard está visible
       (los turnos del día se actualizan solos) */
    clearInterval(_dash.refreshTimer);
    _dash.refreshTimer = setInterval(_dashCargarDatos, 5 * 60 * 1000);
  },

  /* onLeave — para el timer al salir */
  onLeave() {
    clearInterval(_dash.refreshTimer);
    _dash.refreshTimer = null;
  },
});

/* ── Tipos de storeUpdated que afectan al dashboard ── */
const _DASH_RELEVANT_TYPES = new Set(['pacientes', 'perfil', 'turnos', 'pagos']);

/* ── Debounce: colapsa ráfagas de eventos en una sola recarga ── */
let _dashRefreshTimer = null;
function _dashRefreshDebounced(e) {
  /* Filtrar: si viene con type y NO es relevante, ignorar */
  const type = e?.detail?.type;
  if (type && !_DASH_RELEVANT_TYPES.has(type)) return;

  clearTimeout(_dashRefreshTimer);
  _dashRefreshTimer = setTimeout(() => {
    /* Solo renderizar si el dashboard ya fue inicializado */
    if (document.getElementById('dash-stats-row')) _dashCargarDatos();
  }, 150);
}

/* Escuchar storeUpdated con detail.type (nuevo) y sin detail (compatibilidad) */
window.addEventListener('storeUpdated',          _dashRefreshDebounced);
window.addEventListener('pacientesActualizados', _dashRefreshDebounced);

/* Compatibilidad legacy */
window.onViewEnter_dashboard = () => PsicoRouter.navigate('dashboard');
