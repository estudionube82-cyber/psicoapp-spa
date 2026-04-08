/**
 * view-dashboard-new.js — PsicoApp · Dashboard v2 (SaaS moderno)
 * Ruta: dashboard-new
 * Reutiliza: PsicoRouter.store, sb (Supabase), navigate()
 * NO toca: view-dashboard.js ni ningún otro archivo existente
 */

/* ══════════════════════════════════════════
   ESTILOS — inyectados una sola vez
   ══════════════════════════════════════════ */
(function injectDashNewStyles() {
  if (document.getElementById('view-dashboard-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-dashboard-styles';
  style.textContent = `
/* ── BASE ── */
#view-dashboard {
  min-height: 100vh;
  background: var(--bg);
  font-family: var(--font);
}

/* ── TOPBAR ── */
#view-dashboard .dn-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  background: var(--surface);
  border-bottom: 1.5px solid var(--border);
  position: sticky; top: 0; z-index: 50;
}
#view-dashboard .dn-topbar-logo {
  font-size: 18px; font-weight: 800; color: var(--text);
  font-family: var(--font-display, var(--font));
}
#view-dashboard .dn-topbar-logo span { color: var(--primary, #7C3AED); }
#view-dashboard .dn-topbar-right { display: flex; align-items: center; gap: 10px; }
#view-dashboard .dn-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #A78BFA);
  color: white; font-size: 14px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
}
#view-dashboard .dn-theme-btn {
  width: 34px; height: 34px; border-radius: 10px;
  background: var(--surface2, var(--border)); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}

/* ── MINI SUMMARY ── */
#view-dashboard .dn-mini-summary {
  margin: 10px 16px 0;
  background: rgba(124,58,237,0.07);
  border: 1px solid rgba(124,58,237,0.14);
  border-radius: 12px;
  padding: 9px 14px;
  font-size: 12px; font-weight: 600; color: var(--primary, #7C3AED);
  display: flex; align-items: center; gap: 6px;
  min-height: 36px;
}

/* ── KPI GRID ── */
#view-dashboard .dn-kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 14px 16px 0;
}
@media (min-width: 640px) {
  #view-dashboard .dn-kpi-grid { grid-template-columns: repeat(4, 1fr); }
}
#view-dashboard .dn-kpi {
  background: var(--surface);
  border-radius: 16px;
  padding: 16px 14px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
  border: 1.5px solid transparent;
  border-left: 4px solid transparent;
}
#view-dashboard .dn-kpi:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: var(--shadow-md);
}
#view-dashboard .dn-kpi-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; margin-bottom: 12px;
}
#view-dashboard .dn-kpi-icon-wrap.violet { background: rgba(124,58,237,0.12); }
#view-dashboard .dn-kpi-icon-wrap.amber  { background: rgba(251,191,36,0.12); }
#view-dashboard .dn-kpi-icon-wrap.teal   { background: rgba(20,184,166,0.12); }
#view-dashboard .dn-kpi-icon-wrap.rose   { background: rgba(236,72,153,0.10); }
#view-dashboard .dn-kpi-value {
  font-size: 22px; font-weight: 800; color: var(--text); line-height: 1;
}
#view-dashboard .dn-kpi-label {
  font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 4px;
}
#view-dashboard .dn-kpi-tag {
  display: inline-block; margin-top: 6px;
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
  background: rgba(124,58,237,0.10); color: var(--primary, #7C3AED);
}
#view-dashboard .dn-kpi-tag.muted {
  background: var(--surface2, var(--border)); color: var(--text-muted);
}

/* ── ALERTAS ── */
#view-dashboard .dn-alerts { padding: 14px 16px 0; display: flex; flex-direction: column; gap: 8px; }
#view-dashboard .dn-alert {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 14px;
  cursor: pointer; transition: transform .12s;
}
#view-dashboard .dn-alert:hover { transform: translateX(2px); }
#view-dashboard .dn-alert.warn {
  background: rgba(245,158,11,0.12); border: 1.5px solid rgba(245,158,11,0.45);
}
#view-dashboard .dn-alert.ok {
  background: rgba(16,185,129,0.10); border: 1.5px solid rgba(16,185,129,0.40);
}
#view-dashboard .dn-alert-icon { font-size: 20px; flex-shrink: 0; }
#view-dashboard .dn-alert-body { flex: 1; }
#view-dashboard .dn-alert-title { font-size: 13px; font-weight: 700; color: var(--text); }
#view-dashboard .dn-alert-sub   { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
#view-dashboard .dn-alert-arrow { font-size: 18px; color: var(--text-muted); }

/* ── SECCIÓN ── */
#view-dashboard .dn-section { padding: 16px 16px 0; }
#view-dashboard .dn-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
#view-dashboard .dn-section-title {
  font-size: 11px; font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 1px;
}
#view-dashboard .dn-section-link {
  font-size: 12px; font-weight: 600; color: var(--primary, #7C3AED); cursor: pointer;
}

/* ── QUICK ACCESS ── */
#view-dashboard .dn-quick {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
}
#view-dashboard .dn-qa {
  background: var(--surface); border-radius: 14px;
  padding: 16px 8px; display: flex; flex-direction: column;
  align-items: center; gap: 7px; border: 1.5px solid var(--border);
  cursor: pointer; transition: transform .12s, border-color .12s;
  font-family: var(--font); font-size: inherit;
}
#view-dashboard .dn-qa:hover { transform: translateY(-2px); border-color: rgba(124,58,237,0.3); }
#view-dashboard .dn-qa-icon  { font-size: 22px; }
#view-dashboard .dn-qa-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-align: center; }

/* ── TURNOS ── */
#view-dashboard .dn-turnos { display: flex; flex-direction: column; gap: 8px; }
#view-dashboard .dn-turno {
  background: var(--surface); border-radius: 14px;
  padding: 13px 14px; display: flex; align-items: center; gap: 12px;
  box-shadow: var(--shadow-sm); border-left: 3px solid var(--primary, #7C3AED);
  cursor: pointer; transition: transform .12s;
}
#view-dashboard .dn-turno:hover { transform: translateX(2px); }
#view-dashboard .dn-turno.past  { opacity: .5; }
#view-dashboard .dn-turno.now   { box-shadow: 0 0 0 2px rgba(124,58,237,.2); }
#view-dashboard .dn-turno.evento { border-left-color: #F97316; background: rgba(249,115,22,0.08); }
#view-dashboard .dn-t-hora  { font-size: 15px; font-weight: 800; color: var(--text); min-width: 46px; }
#view-dashboard .dn-t-hora.now { color: var(--primary, #7C3AED); }
#view-dashboard .dn-t-body  { flex: 1; }
#view-dashboard .dn-t-name  { font-size: 14px; font-weight: 700; color: var(--text); }
#view-dashboard .dn-t-meta  { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
#view-dashboard .dn-t-chip  {
  font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
}
#view-dashboard .dn-t-chip.done { background: var(--surface2, var(--border)); color: var(--text-muted); }
#view-dashboard .dn-t-chip.ok   { background: rgba(124,58,237,.12); color: #7C3AED; }
#view-dashboard .dn-t-chip.wait { background: rgba(251,191,36,.15); color: #D97706; }

/* ── NOW LINE ── */
#view-dashboard .dn-now-line {
  display: flex; align-items: center; gap: 8px; margin: 4px 0;
}
#view-dashboard .dn-now-dot  { width: 9px; height: 9px; border-radius: 50%; background: var(--primary, #7C3AED); flex-shrink: 0; }
#view-dashboard .dn-now-lbl  { font-size: 10px; font-weight: 800; color: var(--primary, #7C3AED); white-space: nowrap; letter-spacing: .5px; }
#view-dashboard .dn-now-line-bar { flex: 1; height: 1px; background: var(--primary, #7C3AED); opacity: .3; }

/* ── NOTAS ── */
#view-dashboard .dn-notas-wrap {
  background: var(--surface); border-radius: 16px;
  padding: 14px 16px; box-shadow: var(--shadow-sm);
}
#view-dashboard .dn-nota-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 0; border-bottom: 1px solid var(--border);
}
#view-dashboard .dn-nota-item:last-child { border-bottom: none; }
#view-dashboard .dn-nota-check {
  width: 20px; height: 20px; border-radius: 6px;
  border: 2px solid var(--border); background: transparent;
  cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: white; font-weight: 800; transition: all .15s;
}
#view-dashboard .dn-nota-check.done { background: var(--primary, #7C3AED); border-color: var(--primary, #7C3AED); }
#view-dashboard .dn-nota-texto {
  flex: 1; font-size: 13px; font-weight: 600; color: var(--text); line-height: 1.4;
}
#view-dashboard .dn-nota-texto.done { text-decoration: line-through; color: var(--text-muted); }
#view-dashboard .dn-nota-del {
  border: none; background: none; cursor: pointer;
  color: var(--text-muted); font-size: 17px; padding: 2px 4px; opacity: .6;
  transition: opacity .15s;
}
#view-dashboard .dn-nota-del:hover { opacity: 1; color: var(--danger, #E53E3E); }
#view-dashboard .dn-nota-input-row {
  display: flex; gap: 8px; margin-top: 10px;
}
#view-dashboard .dn-nota-input {
  flex: 1; padding: 9px 12px; border-radius: 10px;
  border: 1.5px solid var(--border); font-size: 13px;
  background: var(--bg); color: var(--text); font-family: var(--font);
  outline: none; transition: border .15s;
}
#view-dashboard .dn-nota-input:focus { border-color: var(--primary, #7C3AED); }
#view-dashboard .dn-nota-add-btn {
  padding: 9px 16px; border-radius: 10px; background: var(--primary, #7C3AED);
  color: white; border: none; font-size: 13px; font-weight: 800;
  font-family: var(--font); cursor: pointer; transition: opacity .15s;
}
#view-dashboard .dn-nota-add-btn:hover { opacity: .88; }

/* ── SKELETON ── */
#view-dashboard .dn-skel {
  background: linear-gradient(90deg, var(--border) 25%, var(--surface2, var(--border)) 50%, var(--border) 75%);
  background-size: 200% 100%; animation: dnSkel 1.4s infinite; border-radius: 8px;
}
@keyframes dnSkel { 0% { background-position: 200%; } 100% { background-position: -200%; } }

/* ── EMPTY STATE ── */
#view-dashboard .dn-empty {
  padding: 28px; text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 600;
}

/* ── LINK VOLVER ── */
#view-dashboard .dn-back-bar {
  display: flex; align-items: center; justify-content: center;
  padding: 10px 16px 0;
}
#view-dashboard .dn-back-link {
  font-size: 12px; color: var(--text-muted); font-weight: 600;
  cursor: pointer; text-decoration: underline; background: none; border: none;
  font-family: var(--font);
}

#view-dashboard .dn-pad { height: 40px; }

/* ── PROFILE HEADER (nuevo) ── */
#view-dashboard .dn-profile-header {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 20px 16px;
  background: linear-gradient(180deg, rgba(236,72,153,0.08), rgba(124,58,237,0.05));
  border-bottom: 1px solid rgba(124,58,237,0.10);
}
#view-dashboard .dn-ph-avatar {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #5B2FA8, #A78BFA);
  color: white; font-size: 17px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; border: 2px solid rgba(124,58,237,0.2);
}
#view-dashboard .dn-ph-avatar img {
  width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
}
#view-dashboard .dn-ph-body { flex: 1; min-width: 0; }
#view-dashboard .dn-ph-greeting {
  font-size: 11px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 1px;
}
#view-dashboard .dn-ph-name {
  font-size: 18px; font-weight: 800; color: var(--text);
  margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#view-dashboard .dn-ph-context {
  font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 3px;
}
#view-dashboard .dn-ph-frase {
  font-size: 11px; font-style: italic; color: var(--text-muted);
  margin-top: 6px; line-height: 1.5; opacity: 0.7; max-width: 420px;
}
#view-dashboard .dn-ph-frase-autor {
  font-size: 10px; font-weight: 700; color: var(--primary, #7C3AED);
  margin-top: 3px; opacity: 0.8;
}
#view-dashboard .dn-ph-right {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
#view-dashboard .dn-ph-theme-btn {
  width: 34px; height: 34px; border-radius: 10px;
  background: var(--surface2, var(--border)); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}

/* ── PROGRESO DEL DÍA ── */
#view-dashboard .dn-progress-bar {
  margin: 10px 16px 0;
  background: var(--surface);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: var(--shadow-sm);
}
#view-dashboard .dn-progress-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
#view-dashboard .dn-progress-label {
  font-size: 12px; font-weight: 700; color: var(--text);
}
#view-dashboard .dn-progress-badge {
  font-size: 10px; font-weight: 700; padding: 2px 10px; border-radius: 20px;
}
#view-dashboard .dn-progress-badge.tranquila { background: rgba(20,184,166,0.12); color: #0D9488; }
#view-dashboard .dn-progress-badge.estable   { background: rgba(124,58,237,0.12); color: #7C3AED; }
#view-dashboard .dn-progress-badge.alta       { background: rgba(251,191,36,0.12); color: #D97706; }
#view-dashboard .dn-progress-track {
  height: 6px; border-radius: 99px;
  background: var(--border); overflow: hidden;
}
#view-dashboard .dn-progress-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, #7C3AED, #EC4899);
  transition: width .4s ease;
}
  `;
  document.head.appendChild(style);
})();


/* ══════════════════════════════════════════
   ESTADO INTERNO
   ══════════════════════════════════════════ */
const _dn = { refreshTimer: null };
const _dnFmt = v => '$' + Number(v || 0).toLocaleString('es-AR');
const _dnEsc = s => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/* ── SALUDO DINÁMICO ── */
function _dnSaludo() {
  const h = new Date().getHours();
  if (h >= 6  && h < 13) return 'Buenos días';
  if (h >= 13 && h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/* ── FRASES PSICOANALÍTICAS — elegida una sola vez por sesión ── */
const _DN_FRASES = [
  { texto: 'Donde ello era, yo debo advenir.',                                        autor: 'S. Freud' },
  { texto: 'El inconsciente está estructurado como un lenguaje.',                     autor: 'J. Lacan' },
  { texto: 'Amar es dar lo que no se tiene.',                                         autor: 'J. Lacan' },
  { texto: 'El síntoma es una solución, no solo un problema.',                        autor: 'J.-A. Miller' },
  { texto: 'La transferencia es la puesta en acto de la realidad del inconsciente.',  autor: 'J. Lacan' },
  { texto: 'El sueño es la vía regia hacia el inconsciente.',                         autor: 'S. Freud' },
  { texto: 'El deseo del hombre es el deseo del Otro.',                               autor: 'J. Lacan' },
  { texto: 'La interpretación no apunta al sentido, sino al goce.',                   autor: 'J.-A. Miller' },
  { texto: 'Recordar, repetir, reelaborar: las tres tareas del análisis.',            autor: 'S. Freud' },
  { texto: 'La angustia no engaña.',                                                  autor: 'J. Lacan' },
  { texto: 'El inconsciente no conoce el tiempo.',                                    autor: 'S. Freud' },
  { texto: 'El amor es siempre recíproco.',                                           autor: 'J.-A. Miller' },
  { texto: 'El sujeto habla, pero no sabe lo que dice.',                              autor: 'J. Lacan' },
  { texto: 'No hay relación sexual.',                                                 autor: 'J. Lacan' },
  { texto: 'El analista paga con sus palabras, con su persona y con su juicio.',      autor: 'J. Lacan' },
];
const _dnFraseHoy = _DN_FRASES[Math.floor(Math.random() * _DN_FRASES.length)];


/* ══════════════════════════════════════════
   RENDER HTML — una sola vez en init()
   ══════════════════════════════════════════ */
function _dnRenderHTML(container) {
  const hoy      = new Date();
  const fechaStr = hoy.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
  const fechaCap = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);
  const tema     = document.documentElement.getAttribute('data-theme') || 'light';

  container.innerHTML = `
<div id="dn-root">

  <!-- PROFILE HEADER -->
  <div class="dn-profile-header">
    <div class="dn-ph-avatar" id="dn-ph-avatar">?</div>
    <div class="dn-ph-body">
      <div class="dn-ph-greeting" id="dn-ph-greeting">${_dnSaludo()}</div>
      <div class="dn-ph-name" id="dn-ph-name">…</div>
      <div class="dn-ph-context" id="dn-ph-context">Cargando agenda…</div>
      <div class="dn-ph-frase">
        "${_dnFraseHoy.texto}"
        <div class="dn-ph-frase-autor">— ${_dnFraseHoy.autor}</div>
      </div>
    </div>
    <div class="dn-ph-right">
      <button class="dn-ph-theme-btn" onclick="toggleTheme()" title="Cambiar tema">
        <span id="dn-toggle-thumb">${tema === 'dark' ? '🌙' : '☀️'}</span>
      </button>
    </div>
  </div>

  <!-- MINI RESUMEN DEL MES -->
  <div class="dn-mini-summary" id="dn-mini-summary">
    <span class="dn-skel" style="display:inline-block;width:200px;height:14px;border-radius:6px"></span>
  </div>

  <!-- KPIs -->
  <div class="dn-progress-bar" id="dn-progress-bar" style="display:none"></div>

  <!-- KPIs -->
  <div class="dn-kpi-grid" id="dn-kpi-grid">
    ${['Cobrado','Por cobrar','Pacientes','Turnos hoy'].map(l => `
      <div class="dn-kpi">
        <div class="dn-skel" style="height:20px;width:80%;margin-bottom:8px;"></div>
        <div class="dn-kpi-label">${l}</div>
      </div>`).join('')}
  </div>

  <!-- ALERTAS -->
  <div class="dn-alerts" id="dn-alerts"></div>

  <!-- ACCESOS RÁPIDOS -->
  <div class="dn-section" style="margin-top:20px">
    <div class="dn-section-header">
      <span class="dn-section-title">Accesos rápidos</span>
    </div>
    <div class="dn-quick">
      <button class="dn-qa" onclick="navigate('agenda')">
        <div class="dn-qa-icon">📅</div><div class="dn-qa-label">Agenda</div>
      </button>
      <button class="dn-qa" onclick="navigate('pacientes')">
        <div class="dn-qa-icon">👥</div><div class="dn-qa-label">Pacientes</div>
      </button>
      <button class="dn-qa" onclick="navigate('pagos')">
        <div class="dn-qa-icon">💳</div><div class="dn-qa-label">Pagos</div>
      </button>
      <button class="dn-qa" onclick="navigate('historia')">
        <div class="dn-qa-icon">📋</div><div class="dn-qa-label">Historia</div>
      </button>
    </div>
  </div>

  <!-- TURNOS HOY -->
  <div class="dn-section" style="margin-top:24px">
    <div class="dn-section-header">
      <span class="dn-section-title">Turnos de hoy</span>
      <span class="dn-section-link" onclick="navigate('agenda')">Ver agenda →</span>
    </div>
    <div class="dn-turnos" id="dn-turnos-list">
      <div class="dn-empty">⏳ Cargando…</div>
    </div>
  </div>

  <!-- NOTAS DEL DÍA -->
  <div class="dn-section" style="margin-top:24px">
    <div class="dn-section-header">
      <span class="dn-section-title">📝 Notas del día</span>
    </div>
    <div class="dn-notas-wrap">
      <div id="dn-notas-list"></div>
      <div class="dn-nota-input-row">
        <input id="dn-nota-input" type="text" class="dn-nota-input"
               placeholder="Nueva nota para hoy…"
               onkeydown="if(event.key==='Enter') window._dnNotaAgregar()">
        <button class="dn-nota-add-btn" onclick="window._dnNotaAgregar()">+ Agregar</button>
      </div>
    </div>
  </div>

  <div class="dn-pad"></div>
</div>
  `;
}


/* ══════════════════════════════════════════
   CARGA DE DATOS — misma lógica que dashboard original
   ══════════════════════════════════════════ */
async function _dnCargarDatos() {
  try {
    const uid = await PsicoRouter.store.ensureUserId();
    if (!uid) return;

    const hoy          = new Date();
    const fechaHoy     = hoy.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    const _y = hoy.getFullYear(), _m = hoy.getMonth();
    const primerDiaMes = new Date(_y, _m, 1).toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    const ultimoDiaMes = new Date(_y, _m + 1, 0).toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });

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
        .select('id,estado')
        .eq('user_id', uid)
        .gte('fecha', primerDiaMes)
        .lte('fecha', ultimoDiaMes),

      sb.from('pacientes')
        .select('id')
        .eq('user_id', uid),
    ]);

    const pagos        = resPagos.data || [];
    const turnos       = resTurnosHoy.data || [];
    const pacUnicos    = resPacientes.data?.length || 0;

    const totalCobrado    = pagos.filter(p => p.metodo !== 'pendiente').reduce((s, p) => s + (Number(p.monto) || 0), 0);
    const cantCobros      = pagos.filter(p => p.metodo !== 'pendiente').length;
    const totalPendiente  = pagos.filter(p => p.metodo === 'pendiente').reduce((s, p) => s + (Number(p.monto) || 0), 0);
    const pagosPendientes = pagos.filter(p => p.metodo === 'pendiente').length;
    const turnosHoyCant   = turnos.length;
    const completadosHoy  = turnos.filter(t => {
      const est = (t.estado || '').toLowerCase();
      return est === 'realizado' || est === 'completado';
    }).length;

    const turnosMesValidos = (resTurnosMes.data || []).filter(t => (t.estado || '').toLowerCase() !== 'cancelado');
    const sesionSinCobro   = turnosMesValidos.filter(t => {
      const est = (t.estado || '').toLowerCase();
      return est === 'realizado' || est === 'completado';
    }).length;

    _dnRenderMiniResumen(totalCobrado, cantCobros, pacUnicos, turnosMesValidos.length);
    _dnRenderProgreso(turnosHoyCant, completadosHoy);
    _dnRenderKPIs(totalCobrado, totalPendiente, pacUnicos, turnosHoyCant, turnosMesValidos.length, pagosPendientes);
    _dnRenderAlertas(sesionSinCobro, pacUnicos, pagos, pagosPendientes, turnosHoyCant);
    _dnRenderTurnos(turnos, hoy);
    await _dnRenderNombre(turnosHoyCant);
    await _dnRenderNotas();

  } catch(e) {
    console.error('[DashboardNew]', e.message);
  }
}


/* ══════════════════════════════════════════
   RENDERS
   ══════════════════════════════════════════ */
function _dnRenderMiniResumen(total, cant, pacUnicos, sesionesDelMes) {
  const el = document.getElementById('dn-mini-summary');
  if (!el) return;
  const s = sesionesDelMes !== undefined ? sesionesDelMes : cant;
  el.innerHTML =
    '🗓 <strong>' + s + ' sesión' + (s !== 1 ? 'es' : '') + ' este mes</strong>' +
    '<span style="opacity:.4;margin:0 4px">·</span>' +
    _dnFmt(total) + ' generados';
}

function _dnRenderProgreso(turnosHoy, completadosHoy) {
  const el = document.getElementById('dn-progress-bar');
  if (!el) return;
  if (turnosHoy === 0) { el.style.display = 'none'; return; }
  el.style.display = '';
  const pct   = Math.round((completadosHoy / turnosHoy) * 100);
  const label = turnosHoy <= 3 ? 'tranquila' : turnosHoy <= 6 ? 'estable' : 'alta';
  const emoji = label === 'tranquila' ? '🌿' : label === 'estable' ? '⚡' : '🔥';
  el.innerHTML =
    '<div class="dn-progress-row">' +
      '<span class="dn-progress-label">' + completadosHoy + ' de ' + turnosHoy + ' turnos completados hoy</span>' +
      '<span class="dn-progress-badge ' + label + '">' + emoji + ' Práctica ' + label + '</span>' +
    '</div>' +
    '<div class="dn-progress-track">' +
      '<div class="dn-progress-fill" style="width:' + pct + '%"></div>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:7px;font-weight:600">Buen ritmo de trabajo hoy</div>';
}

function _dnRenderKPIs(cobrado, pendiente, pacUnicos, turnosHoy, sesionesDelMes, pendiente_cant) {
  const el = document.getElementById('dn-kpi-grid');
  if (!el) return;
  el.innerHTML =
    '<div class="dn-kpi" style="border-left-color:#7C3AED" onclick="navigate(\'agenda\')">' +
      '<div class="dn-kpi-icon-wrap violet">🗓️</div>' +
      '<div class="dn-kpi-value">' + sesionesDelMes + '</div>' +
      '<div class="dn-kpi-label">Sesiones del mes</div>' +
      '<div class="dn-kpi-tag">Realizadas</div>' +
    '</div>' +
    '<div class="dn-kpi" style="border-left-color:#F59E0B" onclick="window._dnIrPendientes()">' +
      '<div class="dn-kpi-icon-wrap amber">⏳</div>' +
      '<div class="dn-kpi-value">' + pendiente_cant + '</div>' +
      '<div class="dn-kpi-label">Pendientes</div>' +
      '<div class="dn-kpi-tag muted">Sin cobrar</div>' +
    '</div>' +
    '<div class="dn-kpi" style="border-left-color:#14B8A6" onclick="navigate(\'pacientes\')">' +
      '<div class="dn-kpi-icon-wrap teal">👥</div>' +
      '<div class="dn-kpi-value">' + pacUnicos + '</div>' +
      '<div class="dn-kpi-label">Pacientes activos</div>' +
      '<div class="dn-kpi-tag muted">Total</div>' +
    '</div>' +
    '<div class="dn-kpi" style="border-left-color:#EC4899" onclick="navigate(\'agenda\')">' +
      '<div class="dn-kpi-icon-wrap rose">📅</div>' +
      '<div class="dn-kpi-value">' + turnosHoy + '</div>' +
      '<div class="dn-kpi-label">Turnos de hoy</div>' +
      '<div class="dn-kpi-tag muted">Hoy</div>' +
    '</div>';
}

function _dnRenderAlertas(sesionSinCobro, pacUnicos, pagos, pagosPendientes, turnosHoyCant) {
  const el = document.getElementById('dn-alerts');
  if (!el) return;
  const items = [];

  if (pagosPendientes > 0) {
    items.push(`
      <div class="dn-alert warn" onclick="window._dnIrPendientes()">
        <div class="dn-alert-icon">⏳</div>
        <div class="dn-alert-body">
          <div class="dn-alert-title">${pagosPendientes} pago${pagosPendientes > 1 ? 's' : ''} pendiente${pagosPendientes > 1 ? 's' : ''} de cobro</div>
          <div class="dn-alert-sub">Registrá el cobro en Pagos →</div>
        </div>
        <div class="dn-alert-arrow">›</div>
      </div>`);
  }

  if (sesionSinCobro > 0) {
    items.push(`
      <div class="dn-alert warn" onclick="window._dnIrPendientes()">
        <div class="dn-alert-icon">⚠️</div>
        <div class="dn-alert-body">
          <div class="dn-alert-title">${sesionSinCobro} sesión${sesionSinCobro > 1 ? 'es realizadas' : ' realizada'} sin cobro</div>
          <div class="dn-alert-sub">Registrá el pago en Pagos →</div>
        </div>
        <div class="dn-alert-arrow">›</div>
      </div>`);
  }

  if (pagosPendientes === 0 && turnosHoyCant > 0) {
    items.push(`
      <div class="dn-alert ok">
        <div class="dn-alert-icon">✔️</div>
        <div class="dn-alert-body">
          <div class="dn-alert-title">Todo al día</div>
          <div class="dn-alert-sub">Tu gestión está al día</div>
        </div>
      </div>`);
  }

  el.innerHTML = items.join('');
}

function _dnRenderTurnos(turnos, hoy) {
  const el = document.getElementById('dn-turnos-list');
  if (!el) return;

  if (!turnos.length) {
    el.innerHTML = `<div class="dn-empty">📭 Sin turnos para hoy</div>`;
    return;
  }

  const ahoraMs   = hoy.getTime();
  const aFmt      = hoy.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' });
  let nowInserted = false;
  let html        = '';

  turnos.forEach(t => {
    const dt       = new Date(t.fecha + 'T' + t.hora);
    const horaFmt  = dt.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' });
    const duracion = t.duracion ? `${t.duracion} min` : '50 min';
    const pac      = t.pacientes;
    const tipo     = (t.tipo || '').toLowerCase();
    const esEvento = tipo === 'evento' || !t.paciente_id;
    const nombre   = esEvento
      ? (t.notas || 'Evento')
      : (pac && (pac.nombre || pac.apellido)
          ? `${pac.nombre || ''} ${pac.apellido || ''}`.trim()
          : 'Paciente');
    const meta     = esEvento ? `Evento · ${duracion}` : `Sesión · ${duracion}`;
    const esPasado = dt.getTime() < ahoraMs - 30 * 60 * 1000;
    const esAhora  = !esPasado && dt.getTime() <= ahoraMs + 60 * 60 * 1000;
    const est      = (t.estado || '').toLowerCase();

    if (!nowInserted && !esPasado) {
      html += `<div class="dn-now-line">
        <div class="dn-now-dot"></div>
        <div class="dn-now-lbl">AHORA · ${aFmt}</div>
        <div class="dn-now-line-bar"></div>
      </div>`;
      nowInserted = true;
    }

    let chip = '';
    if      (est === 'realizado' || est === 'completado') chip = `<div class="dn-t-chip done">Realizada</div>`;
    else if (est === 'confirmado')                        chip = `<div class="dn-t-chip ok">✓ Confirmó</div>`;
    else if (est === 'cancelado')                         chip = `<div class="dn-t-chip done" style="color:var(--danger,#E53E3E)">Cancelado</div>`;
    else                                                  chip = `<div class="dn-t-chip wait">⏳ Pendiente</div>`;

    html += `
      <div class="dn-turno${esPasado ? ' past' : ''}${esAhora ? ' now' : ''}${esEvento ? ' evento' : ''}" onclick="navigate('agenda')">
        <div class="dn-t-hora${esAhora ? ' now' : ''}">${horaFmt}</div>
        <div class="dn-t-body">
          <div class="dn-t-name">${esEvento ? '🟠' : '🟢'} ${_dnEsc(nombre)}</div>
          <div class="dn-t-meta">${meta}</div>
        </div>
        ${chip}
      </div>`;
  });

  if (!nowInserted) {
    html += `<div class="dn-now-line">
      <div class="dn-now-dot"></div>
      <div class="dn-now-lbl">AHORA · ${aFmt}</div>
      <div class="dn-now-line-bar"></div>
    </div>`;
  }

  el.innerHTML = html;
}

async function _dnRenderNombre(turnosHoy) {
  const perfil = await PsicoRouter.store.ensurePerfil().catch(() => ({}));
  const nombre = perfil.nombre_completo || perfil.nombre || 'Psicólogo/a';
  const fotoBase = perfil.foto_url || perfil.foto || null;
  const foto     = fotoBase && !fotoBase.includes('?t=')
    ? fotoBase + '?t=' + Date.now()
    : fotoBase;

  /* Nombre en profile header */
  const nameEl = document.getElementById('dn-ph-name');
  if (nameEl) nameEl.textContent = nombre;

  /* Saludo dinámico (se actualiza al entrar por si cambia el horario) */
  const greetEl = document.getElementById('dn-ph-greeting');
  if (greetEl) greetEl.textContent = _dnSaludo();

  /* Contexto humano */
  const ctxEl = document.getElementById('dn-ph-context');
  if (ctxEl && turnosHoy !== undefined) {
    if (turnosHoy === 0) {
      ctxEl.textContent = 'Sin sesiones programadas para hoy';
    } else {
      ctxEl.textContent = 'Hoy acompañás a ' + turnosHoy + (turnosHoy !== 1 ? ' personas en su proceso' : ' persona en su proceso');
    }
  }

  /* Avatar: foto real o iniciales */
  const avatarEl = document.getElementById('dn-ph-avatar');
  if (avatarEl) {
    if (foto) {
      avatarEl.innerHTML = `<img src="${foto}" alt="${nombre}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      const partes    = nombre.split(' ').filter(Boolean);
      const iniciales = partes.length >= 2
        ? partes[0][0] + partes[1][0]
        : nombre.slice(0, 2);
      avatarEl.textContent = iniciales.toUpperCase();
    }
  }
}


/* ══════════════════════════════════════════
   NOTAS DEL DÍA
   Usa la MISMA clave localStorage que el dashboard original
   (psico_notas_UID_FECHA) → las notas son compartidas entre vistas
   ══════════════════════════════════════════ */
function _dnNotasFechaHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function _dnNotasKey(uid)  { return `psico_notas_${uid}_${_dnNotasFechaHoy()}`; }
function _dnNotasLoad(uid) {
  try { return JSON.parse(localStorage.getItem(_dnNotasKey(uid)) || '[]'); } catch { return []; }
}
function _dnNotasSave(uid, notas) {
  localStorage.setItem(_dnNotasKey(uid), JSON.stringify(notas));
}

async function _dnRenderNotas() {
  const uid = await PsicoRouter.store.ensureUserId();
  if (!uid) return;
  const el = document.getElementById('dn-notas-list');
  if (!el) return;
  el.dataset.uid = uid;

  const notas = _dnNotasLoad(uid);
  if (!notas.length) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:12px;font-weight:600;padding:4px 0 6px">Sin notas para hoy. ¡Agregá una!</div>';
    return;
  }
  el.innerHTML = notas.map((n, i) => `
    <div class="dn-nota-item">
      <button class="dn-nota-check${n.hecha ? ' done' : ''}" onclick="window._dnNotaToggle(${i})">
        ${n.hecha ? '✓' : ''}
      </button>
      <span class="dn-nota-texto${n.hecha ? ' done' : ''}">${_dnEsc(n.texto)}</span>
      <button class="dn-nota-del" onclick="window._dnNotaEliminar(${i})">×</button>
    </div>`).join('');
}

window._dnNotaToggle = function(i) {
  const uid = document.getElementById('dn-notas-list')?.dataset.uid;
  if (!uid) return;
  const notas = _dnNotasLoad(uid);
  if (notas[i] !== undefined) {
    notas[i].hecha = !notas[i].hecha;
    _dnNotasSave(uid, notas);
    _dnRenderNotas();
  }
};

window._dnNotaEliminar = function(i) {
  const uid = document.getElementById('dn-notas-list')?.dataset.uid;
  if (!uid) return;
  const notas = _dnNotasLoad(uid);
  notas.splice(i, 1);
  _dnNotasSave(uid, notas);
  _dnRenderNotas();
};

window._dnNotaAgregar = function() {
  const input = document.getElementById('dn-nota-input');
  const uid   = document.getElementById('dn-notas-list')?.dataset.uid;
  if (!uid || !input) return;
  const texto = input.value.trim();
  if (!texto) { input.focus(); return; }
  const notas = _dnNotasLoad(uid);
  notas.push({ texto, hecha: false });
  _dnNotasSave(uid, notas);
  input.value = '';
  _dnRenderNotas();
};

window._dnIrPendientes = function() {
  localStorage.setItem('pv_filtro_default', 'pendiente');
  navigate('pagos');
};


/* ══════════════════════════════════════════
   REGISTRO EN EL ROUTER
   ══════════════════════════════════════════ */
PsicoRouter.register('dashboard', {

  init(container) {
    _dnRenderHTML(container);
  },

  async onEnter() {
    // Siempre traer perfil fresco (foto puede haber cambiado)
    // Borramos solo el cache sin disparar storeUpdated para no crear loops
    PsicoRouter.store.perfil = null;
    await _dnCargarDatos();
    clearInterval(_dn.refreshTimer);
    _dn.refreshTimer = setInterval(_dnCargarDatos, 5 * 60 * 1000);
  },

  onLeave() {
    clearInterval(_dn.refreshTimer);
    _dn.refreshTimer = null;
  },
});

/* Reaccionar a cambios del store */
const _DN_RELEVANT = new Set(['pacientes', 'perfil', 'turnos', 'pagos']);
let _dnRefreshDebounceTimer = null;
function _dnStoreHandler(e) {
  const type = e?.detail?.type;
  if (type && !_DN_RELEVANT.has(type)) return;

  /* Actualización rápida de avatar cuando cambia el perfil —
     no esperar a _dnCargarDatos completo */
  if (type === 'perfil') {
    const p        = PsicoRouter.store.perfil;
    const fotoBase = p?.foto_url || p?.foto || null;
    const foto     = fotoBase && !fotoBase.includes('?t=')
      ? fotoBase + '?t=' + Date.now()
      : fotoBase;
    const nombre   = p?.nombre_completo || p?.nombre || '';
    const avatarEl = document.getElementById('dn-ph-avatar');
    if (avatarEl && foto) {
      avatarEl.innerHTML = `<img src="${foto}" alt="${nombre}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }
    const nameEl = document.getElementById('dn-ph-name');
    if (nameEl && nombre) nameEl.textContent = nombre;
  }

  clearTimeout(_dnRefreshDebounceTimer);
  _dnRefreshDebounceTimer = setTimeout(() => {
    if (document.getElementById('dn-kpi-grid')) _dnCargarDatos();
  }, 300);
}
window.addEventListener('storeUpdated',          _dnStoreHandler);
window.addEventListener('pacientesActualizados', _dnStoreHandler);
