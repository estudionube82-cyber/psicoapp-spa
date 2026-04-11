/**
 * view-dashboard-new.js — PsicoApp · Dashboard v2 (SaaS moderno)
 * Ruta: dashboard-new
 * Reutiliza: PsicoRouter.store, sb (Supabase), navigate()
 * NO toca: view-dashboard.js ni ningún otro archivo existente
 */

/* ══════════════════════════════════════════
   ESTILOS — inyectados una sola vez
   ══════════════════════════════════════════ */
function injectDashNewStyles() {
  // Siempre reemplazar: así los cambios de CSS se aplican sin hard-reload
  const old = document.getElementById('view-dashboard-styles');
  if (old) old.remove();
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
  margin: 14px 16px 0;
  background: linear-gradient(90deg, rgba(124,58,237,0.10), rgba(236,72,153,0.07));
  border: 1.5px solid rgba(124,58,237,0.18);
  border-radius: 14px;
  padding: 11px 16px;
  font-size: 12px; font-weight: 700; color: var(--primary, #7C3AED);
  display: flex; align-items: center; gap: 8px;
  min-height: 40px;
  box-shadow: 0 2px 8px rgba(124,58,237,0.06);
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
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  cursor: pointer;
  transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s;
  border: 1.5px solid var(--border);
  position: relative; overflow: hidden;
}
#view-dashboard .dn-kpi::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  border-radius: 18px 18px 0 0;
  opacity: 0; transition: opacity .18s;
}
#view-dashboard .dn-kpi.violet::before { background: linear-gradient(90deg,#7C3AED,#A78BFA); }
#view-dashboard .dn-kpi.amber::before  { background: linear-gradient(90deg,#F59E0B,#FCD34D); }
#view-dashboard .dn-kpi.teal::before   { background: linear-gradient(90deg,#14B8A6,#5EEAD4); }
#view-dashboard .dn-kpi.rose::before   { background: linear-gradient(90deg,#EC4899,#F9A8D4); }
#view-dashboard .dn-kpi:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 8px 28px rgba(0,0,0,0.13); }
#view-dashboard .dn-kpi:hover::before  { opacity: 1; }
#view-dashboard .dn-kpi-icon-wrap {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 19px; margin-bottom: 14px;
}
#view-dashboard .dn-kpi-icon-wrap.violet { background: linear-gradient(135deg,rgba(124,58,237,0.15),rgba(167,139,250,0.08)); }
#view-dashboard .dn-kpi-icon-wrap.amber  { background: linear-gradient(135deg,rgba(251,191,36,0.18),rgba(252,211,77,0.08)); }
#view-dashboard .dn-kpi-icon-wrap.teal   { background: linear-gradient(135deg,rgba(20,184,166,0.15),rgba(94,234,212,0.08)); }
#view-dashboard .dn-kpi-icon-wrap.rose   { background: linear-gradient(135deg,rgba(236,72,153,0.14),rgba(249,168,212,0.07)); }
#view-dashboard .dn-kpi-value {
  font-size: 23px; font-weight: 900; color: var(--text); line-height: 1; letter-spacing: -0.5px;
}
#view-dashboard .dn-kpi-label {
  font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.2px;
}
#view-dashboard .dn-kpi-tag {
  display: inline-block; margin-top: 8px;
  font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 20px;
  background: rgba(124,58,237,0.10); color: var(--primary, #7C3AED);
  letter-spacing: 0.2px;
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

/* ── GRÁFICO INGRESOS ── */
#view-dashboard .dn-chart-wrap {
  background: var(--surface); border-radius: 16px;
  padding: 14px 16px; box-shadow: var(--shadow-sm);
}
#view-dashboard .dn-chart-title {
  font-size: 11px; font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .8px; margin-bottom: 12px;
}
#view-dashboard .dn-chart-bars {
  display: flex; align-items: flex-end; gap: 6px; height: 60px;
}
#view-dashboard .dn-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
#view-dashboard .dn-bar {
  width: 100%; border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, #7C3AED, #A78BFA);
  transition: height .4s ease; min-height: 3px;
}
#view-dashboard .dn-bar-label { font-size: 9px; font-weight: 700; color: var(--text-muted); }
#view-dashboard .dn-bar-val   { font-size: 8px; color: var(--text-muted); }

/* ── PRÓXIMOS TURNOS ── */
#view-dashboard .dn-prox-dia { margin-top: 12px; }
#view-dashboard .dn-prox-dia-label {
  font-size: 11px; font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .6px;
  margin-bottom: 6px; padding: 0 2px;
}
#view-dashboard .dn-prox-item {
  background: var(--surface); border-radius: 12px;
  padding: 10px 12px; display: flex; align-items: center; gap: 10px;
  border: 1px solid var(--border); margin-bottom: 6px; cursor: pointer;
  transition: transform .1s;
}
#view-dashboard .dn-prox-item:hover { transform: translateX(2px); }
#view-dashboard .dn-prox-hora { font-size: 13px; font-weight: 800; color: var(--primary); min-width: 42px; }
#view-dashboard .dn-prox-name { font-size: 13px; font-weight: 700; color: var(--text); }
#view-dashboard .dn-prox-meta { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

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

/* ── PROFILE HEADER — Premium SaaS hero ── */
#view-dashboard .dn-profile-header {
  position: relative; overflow: hidden;
  padding: 28px 20px 24px;
  background: linear-gradient(135deg, #1E0A3C 0%, #3B1278 45%, #6D28D9 80%, #A21CAF 100%);
  border-bottom: none;
}
/* ruido decorativo sutil */
#view-dashboard .dn-profile-header::before {
  content: '';
  position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(ellipse 60% 70% at 80% -20%, rgba(236,72,153,0.35) 0%, transparent 65%),
    radial-gradient(ellipse 40% 50% at -10% 100%, rgba(124,58,237,0.25) 0%, transparent 60%);
  pointer-events: none;
}
/* círculo decorativo fondo */
#view-dashboard .dn-profile-header::after {
  content: '';
  position: absolute; top: -60px; right: -60px;
  width: 220px; height: 220px; border-radius: 50%; z-index: 0;
  background: rgba(255,255,255,0.04);
  pointer-events: none;
}
/* fila top: avatar + texto + btn */
#view-dashboard .dn-ph-top-row {
  display: flex; align-items: center; gap: 16px;
  position: relative; z-index: 1;
}
#view-dashboard .dn-ph-avatar {
  width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #7C3AED, #EC4899);
  color: white; font-size: 28px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  border: 3px solid rgba(255,255,255,0.25);
  box-shadow: 0 0 0 6px rgba(236,72,153,0.18), 0 8px 24px rgba(0,0,0,0.35);
}
#view-dashboard .dn-ph-avatar img {
  width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
}
#view-dashboard .dn-ph-body { flex: 1; min-width: 0; }
#view-dashboard .dn-ph-greeting {
  font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.55);
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2px;
}
#view-dashboard .dn-ph-name {
  font-size: 24px; font-weight: 900; color: #fff; line-height: 1.1;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#view-dashboard .dn-ph-context {
  font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.65);
  margin-top: 4px;
}
#view-dashboard .dn-ph-right {
  display: flex; align-items: flex-start; gap: 8px; flex-shrink: 0; align-self: flex-start;
}
#view-dashboard .dn-ph-theme-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2); cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
  transition: background .15s;
}
#view-dashboard .dn-ph-theme-btn:hover { background: rgba(255,255,255,0.2); }
/* frase — como pull-quote */
#view-dashboard .dn-ph-quote-wrap {
  position: relative; z-index: 1;
  margin-top: 18px;
  border-left: 3px solid rgba(236,72,153,0.7);
  padding: 8px 14px;
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(6px);
  border-radius: 0 12px 12px 0;
}
#view-dashboard .dn-ph-frase {
  font-size: 13px; font-style: italic; font-weight: 500;
  color: rgba(255,255,255,0.90); line-height: 1.55;
  margin: 0;
}
#view-dashboard .dn-ph-frase-autor {
  font-size: 11px; font-weight: 800; color: #F9A8D4;
  margin-top: 5px; letter-spacing: 0.3px;
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
}
injectDashNewStyles(); // Ejecutar al cargar el script


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
    <div class="dn-ph-top-row">
      <div class="dn-ph-avatar" id="dn-ph-avatar">?</div>
      <div class="dn-ph-body">
        <div class="dn-ph-greeting" id="dn-ph-greeting">${_dnSaludo()}</div>
        <div class="dn-ph-name" id="dn-ph-name">…</div>
        <div class="dn-ph-context" id="dn-ph-context">Cargando agenda…</div>
      </div>
      <div class="dn-ph-right">
        <button class="dn-ph-theme-btn" onclick="toggleTheme()" title="Cambiar tema">
          <span id="dn-toggle-thumb">${tema === 'dark' ? '🌙' : '☀️'}</span>
        </button>
      </div>
    </div>
    <div class="dn-ph-quote-wrap">
      <div class="dn-ph-frase">"${_dnEsc(_dnFraseHoy.texto)}"</div>
      <div class="dn-ph-frase-autor">— ${_dnEsc(_dnFraseHoy.autor)}</div>
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

  <!-- GRÁFICO INGRESOS -->
  <div class="dn-section" id="dn-chart-section" style="margin-top:20px;display:none">
    <div class="dn-chart-wrap">
      <div class="dn-chart-title">💰 Ingresos del mes por semana</div>
      <div class="dn-chart-bars" id="dn-chart-bars">
        <div class="dn-empty" style="font-size:11px">Cargando…</div>
      </div>
    </div>
  </div>

  <!-- TURNOS HOY -->
  <div class="dn-section" style="margin-top:20px">
    <div class="dn-section-header">
      <span class="dn-section-title">📅 Hoy</span>
      <span class="dn-section-link" onclick="navigate('agenda')">Ver agenda →</span>
    </div>
    <div class="dn-turnos" id="dn-turnos-list">
      <div class="dn-empty">⏳ Cargando…</div>
    </div>
  </div>

  <!-- PRÓXIMOS 3 DÍAS -->
  <div class="dn-section" style="margin-top:16px" id="dn-proximos-section">
    <div class="dn-section-header">
      <span class="dn-section-title">🗓 Próximos días</span>
      <span class="dn-section-link" onclick="navigate('agenda')">Ver todo →</span>
    </div>
    <div id="dn-proximos-list"></div>
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
   CARGA DE DATOS
   ══════════════════════════════════════════ */
async function _dnCargarDatos() {
  console.log('[Dashboard] Iniciando carga...');
  try {
    // Intentar obtener userId; reintentar hasta 3 veces si tarda
    let uid = await PsicoRouter.store.ensureUserId();
    if (!uid) {
      await new Promise(r => setTimeout(r, 1200));
      uid = await PsicoRouter.store.ensureUserId();
    }
    if (!uid) {
      console.warn('[Dashboard] Sin sesión activa');
      const el = document.getElementById('dn-kpi-grid');
      if (el) el.innerHTML = '<div style="grid-column:1/-1;padding:20px;text-align:center;color:var(--text-muted);font-size:13px">🔒 Sesión no iniciada. Recargá la página.</div>';
      const tEl = document.getElementById('dn-turnos-list');
      if (tEl) tEl.innerHTML = '<div class="dn-empty">Recargá la página para iniciar sesión</div>';
      return;
    }
    console.log('[Dashboard] UID ok:', uid);

    const hoy = new Date();
    // Ajustar a zona Argentina (UTC-3) sin Intl/timeZone (compatible con cualquier mobile)
    const AR_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3
    const _hoyAR = new Date(hoy.getTime() - AR_OFFSET_MS);
    const _y = _hoyAR.getUTCFullYear();
    const _m = _hoyAR.getUTCMonth();   // 0-11
    const _d = _hoyAR.getUTCDate();

    // Serializa Date a YYYY-MM-DD usando UTC (así evita saltos de TZ en mobile)
    const toYMD = dt => {
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dt.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    // Dado un offset en días desde hoy (en AR), devuelve YYYY-MM-DD
    const diaAR = offset => toYMD(new Date(_hoyAR.getTime() + offset * 86400000));

    const fechaHoy     = diaAR(0);
    // Primer / último día del mes actual en AR
    const primerDiaMes = toYMD(new Date(Date.UTC(_y, _m, 1)));
    const ultimoDiaMes = toYMD(new Date(Date.UTC(_y, _m + 1, 0)));
    // Primer / último día del mes anterior
    const primerMesAnt = toYMD(new Date(Date.UTC(_y, _m - 1, 1)));
    const ultimoMesAnt = toYMD(new Date(Date.UTC(_y, _m, 0)));

    // Próximos 3 días
    const fecha1 = diaAR(1);
    const fecha2 = diaAR(2);
    const fecha3 = diaAR(3);

    const [
      resPagos, resPagosAnt,
      resTurnosHoy, resTurnosMes, resTurnosMesAnt,
      resPacientes, resProximos,
    ] = await Promise.all([
      sb.from('pagos').select('id,paciente_id,monto,fecha,metodo').eq('user_id', uid).gte('fecha', primerDiaMes).lte('fecha', ultimoDiaMes),
      sb.from('pagos').select('id,monto,metodo').eq('user_id', uid).gte('fecha', primerMesAnt).lte('fecha', ultimoMesAnt),
      sb.from('turnos').select('id,fecha,hora,duracion,estado,tipo,notas,paciente_id').eq('user_id', uid).eq('fecha', fechaHoy).order('hora', { ascending: true }),
      sb.from('turnos').select('id,fecha,estado').eq('user_id', uid).gte('fecha', primerDiaMes).lte('fecha', ultimoDiaMes),
      sb.from('turnos').select('id,estado').eq('user_id', uid).gte('fecha', primerMesAnt).lte('fecha', ultimoMesAnt),
      sb.from('pacientes').select('id,nombre,apellido').eq('user_id', uid),
      sb.from('turnos').select('id,fecha,hora,duracion,estado,tipo,notas,paciente_id').eq('user_id', uid).in('fecha', [fecha1, fecha2, fecha3]).order('fecha', { ascending: true }).order('hora', { ascending: true }),
    ]);

    // Chequear errores individuales de Supabase (no tiran exception, ponen .error)
    const queryErrors = [resPagos, resPagosAnt, resTurnosHoy, resTurnosMes, resTurnosMesAnt, resPacientes, resProximos]
      .map(r => r.error?.message).filter(Boolean);
    if (queryErrors.length) console.warn('[Dashboard] Query errors:', queryErrors);

    const pagos     = resPagos.data || [];
    const pagosAnt  = resPagosAnt.data || [];
    const pacientes = resPacientes.data || [];
    const turnos    = (resTurnosHoy.data || []).map(t => ({
      ...t,
      _nomPac: _dnNombrePac(t, pacientes),
    }));
    const proximos  = (resProximos.data || []).map(t => ({
      ...t,
      _nomPac: _dnNombrePac(t, pacientes),
    }));
    const pacUnicos = pacientes.length;

    const cobrado      = pagos.filter(p => p.metodo !== 'pendiente').reduce((s, p) => s + (Number(p.monto) || 0), 0);
    const cobradoAnt   = pagosAnt.filter(p => p.metodo !== 'pendiente').reduce((s, p) => s + (Number(p.monto) || 0), 0);
    const pendienteMonto = pagos.filter(p => p.metodo === 'pendiente').reduce((s, p) => s + (Number(p.monto) || 0), 0);
    const pendienteCant  = pagos.filter(p => p.metodo === 'pendiente').length;

    const turnosMes    = (resTurnosMes.data || []).filter(t => (t.estado||'').toLowerCase() !== 'cancelado');
    const turnosMesAnt = (resTurnosMesAnt.data || []).filter(t => (t.estado||'').toLowerCase() !== 'cancelado');
    const sesionesRealizadas    = turnosMes.filter(t => ['realizado','completado'].includes((t.estado||'').toLowerCase())).length;
    const sesionesRealizadasAnt = turnosMesAnt.filter(t => ['realizado','completado'].includes((t.estado||'').toLowerCase())).length;

    const completadosHoy = turnos.filter(t => ['realizado','completado'].includes((t.estado||'').toLowerCase())).length;

    console.log('[Dashboard] Datos ok — pagos:', pagos.length, '| turnos hoy:', turnos.length, '| pacientes:', pacUnicos);

    // Ingresos por semana (para gráfico)
    const semanas = _dnIngresosSemanales(pagos, _y, _m);

    _dnRenderMiniResumen(cobrado, turnosMes.length, sesionesRealizadas);
    _dnRenderProgreso(turnos.length, completadosHoy);
    _dnRenderKPIs(cobrado, cobradoAnt, pendienteCant, pendienteMonto, pacUnicos, turnos.length, sesionesRealizadas, sesionesRealizadasAnt);
    _dnRenderGrafico(semanas);
    _dnRenderAlertas(pendienteCant, pagos, turnos.length, sesionesRealizadas);
    _dnRenderTurnos(turnos, hoy);
    _dnRenderProximos(proximos);
    await _dnRenderNombre(turnos.length);
    await _dnRenderNotas();
    console.log('[Dashboard] Render completo ✓');

  } catch(e) {
    console.error('[Dashboard] ERROR:', e.message, e);
    const kpiEl = document.getElementById('dn-kpi-grid');
    if (kpiEl) kpiEl.innerHTML = '<div style="grid-column:1/-1;padding:20px;text-align:center;color:var(--text-muted);font-size:13px;font-weight:600">⚠️ ' + (e.message || 'Error') + '<br><small style="opacity:.6">Abrí la consola del navegador (F12) para más detalles</small></div>';
    const turnosEl = document.getElementById('dn-turnos-list');
    if (turnosEl) turnosEl.innerHTML = '<div class="dn-empty">⚠️ ' + (e.message || 'Error de conexión') + '</div>';
    const summEl = document.getElementById('dn-mini-summary');
    if (summEl) summEl.innerHTML = '⚠️ Error — abrí F12 para ver el detalle';
  }
}

function _dnNombrePac(turno, pacientes) {
  if (turno.tipo === 'evento' || !turno.paciente_id) return turno.notas || 'Evento';
  const p = pacientes.find(x => x.id === turno.paciente_id);
  return p ? `${p.nombre || ''} ${p.apellido || ''}`.trim() : 'Paciente';
}

function _dnIngresosSemanales(pagos, year, month) {
  // Dividir el mes en 4-5 semanas y sumar ingresos por semana
  const cobrados = pagos.filter(p => p.metodo !== 'pendiente');
  const semanas  = [0, 0, 0, 0, 0];
  cobrados.forEach(p => {
    const d = new Date(p.fecha + 'T12:00:00');
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const sem = Math.min(4, Math.floor((d.getDate() - 1) / 7));
    semanas[sem] += Number(p.monto) || 0;
  });
  return semanas;
}


/* ══════════════════════════════════════════
   RENDERS
   ══════════════════════════════════════════ */
function _dnRenderMiniResumen(cobrado, turnosMes, sesionesRealizadas) {
  const el = document.getElementById('dn-mini-summary');
  if (!el) return;
  el.innerHTML =
    '🗓 <strong>' + turnosMes + ' sesión' + (turnosMes !== 1 ? 'es' : '') + ' este mes</strong>' +
    '<span style="opacity:.4;margin:0 6px">·</span>' +
    '✅ ' + sesionesRealizadas + ' realizadas' +
    '<span style="opacity:.4;margin:0 6px">·</span>' +
    '💰 ' + _dnFmt(cobrado) + ' cobrados';
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

function _dnTrend(actual, anterior) {
  if (!anterior) return '';
  const pct  = Math.round(((actual - anterior) / anterior) * 100);
  const up   = pct >= 0;
  const col  = up ? '#10B981' : '#EF4444';
  const icon = up ? '↑' : '↓';
  return `<span style="font-size:10px;font-weight:700;color:${col};margin-left:4px">${icon}${Math.abs(pct)}% vs mes ant.</span>`;
}

function _dnRenderKPIs(cobrado, cobradoAnt, pendienteCant, pendienteMonto, pacUnicos, turnosHoy, sesiones, sesionesAnt) {
  const el = document.getElementById('dn-kpi-grid');
  if (!el) return;
  el.innerHTML =
    '<div class="dn-kpi teal" onclick="navigate(\'pagos\')">' +
      '<div class="dn-kpi-icon-wrap teal">💰</div>' +
      '<div class="dn-kpi-value">' + _dnFmt(cobrado) + '</div>' +
      '<div class="dn-kpi-label">Cobrado este mes</div>' +
      '<div class="dn-kpi-tag">' + _dnTrend(cobrado, cobradoAnt) + '</div>' +
    '</div>' +
    '<div class="dn-kpi violet" onclick="navigate(\'agenda\')">' +
      '<div class="dn-kpi-icon-wrap violet">🗓️</div>' +
      '<div class="dn-kpi-value">' + sesiones + '</div>' +
      '<div class="dn-kpi-label">Sesiones realizadas</div>' +
      '<div class="dn-kpi-tag">' + _dnTrend(sesiones, sesionesAnt) + '</div>' +
    '</div>' +
    '<div class="dn-kpi amber" onclick="window._dnIrPendientes()">' +
      '<div class="dn-kpi-icon-wrap amber">⏳</div>' +
      '<div class="dn-kpi-value">' + pendienteCant + '</div>' +
      '<div class="dn-kpi-label">Pagos pendientes</div>' +
      '<div class="dn-kpi-tag muted">' + _dnFmt(pendienteMonto) + ' sin cobrar</div>' +
    '</div>' +
    '<div class="dn-kpi rose" onclick="navigate(\'agenda\')">' +
      '<div class="dn-kpi-icon-wrap rose">📅</div>' +
      '<div class="dn-kpi-value">' + turnosHoy + '</div>' +
      '<div class="dn-kpi-label">Turnos hoy</div>' +
      '<div class="dn-kpi-tag muted">' + pacUnicos + ' pacientes totales</div>' +
    '</div>';
}

function _dnRenderAlertas(pendienteCant, pagos, turnosHoyCant, sesionesRealizadas) {
  const el = document.getElementById('dn-alerts');
  if (!el) return;
  const items = [];

  if (pendienteCant > 0) {
    const monto = pagos.filter(p => p.metodo === 'pendiente').reduce((s, p) => s + (Number(p.monto) || 0), 0);
    items.push(`
      <div class="dn-alert warn" onclick="window._dnIrPendientes()">
        <div class="dn-alert-icon">💸</div>
        <div class="dn-alert-body">
          <div class="dn-alert-title">${pendienteCant} pago${pendienteCant > 1 ? 's' : ''} pendiente${pendienteCant > 1 ? 's' : ''} · ${_dnFmt(monto)}</div>
          <div class="dn-alert-sub">Tocá para registrar los cobros →</div>
        </div>
        <div class="dn-alert-arrow">›</div>
      </div>`);
  }

  if (pendienteCant === 0 && sesionesRealizadas > 0) {
    items.push(`
      <div class="dn-alert ok">
        <div class="dn-alert-icon">✅</div>
        <div class="dn-alert-body">
          <div class="dn-alert-title">Gestión al día</div>
          <div class="dn-alert-sub">${sesionesRealizadas} sesiones realizadas · sin deudas pendientes</div>
        </div>
      </div>`);
  }

  el.innerHTML = items.join('');
}

function _dnRenderGrafico(semanas) {
  const sec = document.getElementById('dn-chart-section');
  const el  = document.getElementById('dn-chart-bars');
  if (!el) return;

  const max = Math.max(...semanas, 1);
  if (max === 0) { if (sec) sec.style.display = 'none'; return; }
  if (sec) sec.style.display = '';

  const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
  el.innerHTML = semanas.map((v, i) => {
    const h   = Math.round((v / max) * 56) + 4;
    const lbl = v > 0 ? _dnFmt(v).replace('$', '') : '';
    return `<div class="dn-bar-col">
      <div class="dn-bar-val">${lbl ? '$' + (v >= 1000 ? Math.round(v/1000)+'k' : lbl) : ''}</div>
      <div class="dn-bar" style="height:${h}px;${v === 0 ? 'opacity:.2;background:var(--border)' : ''}"></div>
      <div class="dn-bar-label">${labels[i]}</div>
    </div>`;
  }).join('');
}

function _dnRenderProximos(proximos) {
  const sec = document.getElementById('dn-proximos-section');
  const el  = document.getElementById('dn-proximos-list');
  if (!el) return;

  if (!proximos.length) {
    sec.style.display = 'none';
    return;
  }
  sec.style.display = '';

  // Agrupar por fecha
  const porFecha = {};
  proximos.forEach(t => {
    if (!porFecha[t.fecha]) porFecha[t.fecha] = [];
    porFecha[t.fecha].push(t);
  });

  const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const mesesCorto = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  let html = '';
  Object.entries(porFecha).forEach(([fecha, turnos]) => {
    const d     = new Date(fecha + 'T12:00:00');
    const label = `${diasSemana[d.getDay()]} ${d.getDate()} de ${mesesCorto[d.getMonth()]}`;
    html += `<div class="dn-prox-dia"><div class="dn-prox-dia-label">${label}</div>`;
    turnos.forEach(t => {
      const esEv = t.tipo === 'evento' || !t.paciente_id;
      const nom  = t._nomPac || (esEv ? (t.notas || 'Evento') : 'Paciente');
      const hora = (t.hora || '').slice(0, 5);
      const meta = `${esEv ? '🟠 Evento' : '🟢 Sesión'} · ${t.duracion || 50} min`;
      html += `<div class="dn-prox-item" onclick="navigate('agenda')">
        <div class="dn-prox-hora">${hora}</div>
        <div><div class="dn-prox-name">${_dnEsc(nom)}</div><div class="dn-prox-meta">${meta}</div></div>
      </div>`;
    });
    html += '</div>';
  });
  el.innerHTML = html;
}

function _dnRenderTurnos(turnos, hoy) {
  const el = document.getElementById('dn-turnos-list');
  if (!el) return;

  if (!turnos.length) {
    el.innerHTML = `<div class="dn-empty">📭 Sin turnos para hoy</div>`;
    return;
  }

  const ahoraMs   = hoy.getTime();
  // Formato HH:MM seguro para mobile (no usa toLocaleTimeString con locale)
  const _fmt2 = n => String(n).padStart(2, '0');
  const _horaFmtSafe = dt => _fmt2(dt.getHours()) + ':' + _fmt2(dt.getMinutes());
  const aFmt = _horaFmtSafe(hoy);
  let nowInserted = false;
  let html        = '';

  turnos.forEach(t => {
    // Parseo seguro de fecha+hora: extraer partes manualmente para evitar bugs de timezone en mobile
    const [fy, fm, fd] = (t.fecha || '2000-01-01').split('-').map(Number);
    const [fh, fmin]   = (t.hora  || '00:00').split(':').map(Number);
    const dt      = new Date(fy, fm - 1, fd, fh, fmin, 0);
    const horaFmt = _horaFmtSafe(dt);
    const duracion = t.duracion ? `${t.duracion} min` : '50 min';
    const esEvento = (t.tipo || '').toLowerCase() === 'evento' || !t.paciente_id;
    const nombre   = t._nomPac || (esEvento ? (t.notas || 'Evento') : 'Paciente');
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
  // Cache-buster solo para URLs HTTP, nunca para data: (base64)
  const foto = fotoBase && !fotoBase.startsWith('data:') && !fotoBase.includes('?t=')
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
    injectDashNewStyles(); // Re-inyectar siempre para que los cambios de CSS se vean
    _dnRenderHTML(container);
  },

  async onEnter() {
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
    const foto = fotoBase && !fotoBase.startsWith('data:') && !fotoBase.includes('?t=')
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
