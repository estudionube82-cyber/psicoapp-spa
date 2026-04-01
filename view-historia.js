/**
 * view-historia.js — PsicoApp SPA (refactorizado)
 * Registrado en PsicoRouter: init / onEnter / onLeave
 *
 * - init()    → HTML + listeners UNA SOLA VEZ
 * - onEnter() → siempre vuelve a panel lista y recarga pacientes
 * - onLeave() → cierra modales abiertos
 * - Funciones globales hcAbrirDetalle, hcVolverLista, etc. CONSERVADAS
 *   (son llamadas desde onclick en HTML generado)
 */

/* ══════════════════════════════════════════
   ESTILOS — inyectados una sola vez
   ══════════════════════════════════════════ */
(function injectHistoriaStyles() {
  if (document.getElementById('view-historia-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-historia-styles';
  style.textContent = `
#view-historia { min-height: 100vh; background: var(--bg); position: relative; }
#view-historia .hc-panel { display: none; }
#view-historia .hc-panel.hc-active { display: block; animation: hcFadeIn .18s ease; }
@keyframes hcFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
#view-historia .hc-header { background: linear-gradient(145deg, #2D1B69 0%, #5B2FA8 55%, #7C3AED 100%); padding: 20px 20px 26px; position: relative; overflow: hidden; }
#view-historia .hc-header::after { content:''; position:absolute; right:-40px; top:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.05); }
#view-historia .hc-header-row { display:flex; align-items:center; gap:12px; position:relative; z-index:1; }
#view-historia .hc-back-btn { width:34px; height:34px; border-radius:10px; background:rgba(255,255,255,0.15); border:1.5px solid rgba(255,255,255,0.2); color:white; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
#view-historia .hc-back-btn:hover { background:rgba(255,255,255,0.25); }
#view-historia .hc-header-title { font-family:var(--font-display); font-size:20px; font-weight:700; color:white; flex:1; }
#view-historia .hc-header-subtitle { font-size:12px; color:rgba(255,255,255,0.6); margin-top:3px; }
#view-historia .hc-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:14px 16px; }
#view-historia .hc-stat { background:var(--surface); border-radius:14px; padding:12px 10px; box-shadow:var(--shadow-sm); text-align:center; }
#view-historia .hc-stat-num { font-size:20px; font-weight:800; color:var(--primary); }
#view-historia .hc-stat-label { font-size:10px; color:var(--text-muted); font-weight:600; margin-top:2px; }
#view-historia .hc-search-wrap { margin:0 16px 12px; display:flex; align-items:center; gap:8px; background:var(--surface); border-radius:14px; padding:0 14px; border:1.5px solid var(--border); box-shadow:var(--shadow-sm); }
#view-historia .hc-search-wrap input { flex:1; border:none; background:transparent; padding:12px 0; font-size:14px; font-family:var(--font); color:var(--text); outline:none; }
#view-historia .hc-pac-card { display:flex; align-items:center; gap:12px; background:var(--surface); border-radius:14px; margin:0 16px 8px; padding:13px 14px; box-shadow:var(--shadow-sm); cursor:pointer; transition:transform .12s; }
#view-historia .hc-pac-card:active { transform:scale(0.98); }
#view-historia .hc-pac-avatar { width:42px; height:42px; border-radius:50%; color:white; font-size:15px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
#view-historia .hc-pac-name { font-size:15px; font-weight:700; color:var(--text); }
#view-historia .hc-pac-sub  { font-size:12px; color:var(--text-muted); margin-top:2px; }
#view-historia .hc-pac-arrow { font-size:20px; color:var(--text-muted); margin-left:auto; }
#view-historia .hc-det-avatar-wrap { display:flex; align-items:center; gap:14px; position:relative; z-index:1; }
#view-historia .hc-det-avatar { width:52px; height:52px; border-radius:50%; color:white; font-size:19px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:2px solid rgba(255,255,255,0.3); }
#view-historia .hc-det-nombre { font-size:18px; font-weight:800; color:white; }
#view-historia .hc-det-sub    { font-size:12px; color:rgba(255,255,255,0.65); margin-top:2px; }
#view-historia .hc-tabs { display:flex; border-bottom:1.5px solid var(--border); background:var(--surface); }
#view-historia .hc-tab { flex:1; padding:12px 8px; text-align:center; font-size:13px; font-weight:700; color:var(--text-muted); cursor:pointer; border-bottom:3px solid transparent; border:none; background:transparent; font-family:var(--font); transition:color .15s,border-color .15s; }
#view-historia .hc-tab-active { color:var(--primary); border-bottom:3px solid var(--primary) !important; }
#view-historia .hc-tab-content { display:none; }
#view-historia .hc-tab-show { display:block; }
#view-historia .hc-ses-header { display:flex; align-items:center; justify-content:space-between; padding:14px 16px 8px; }
#view-historia .hc-ses-header-title { font-size:15px; font-weight:800; }
#view-historia .hc-btn-nueva { background:var(--primary); color:white; border:none; border-radius:10px; padding:8px 14px; font-size:13px; font-weight:700; font-family:var(--font); cursor:pointer; }
#view-historia .hc-ses-card { background:var(--surface); border-radius:14px; margin:0 16px 10px; padding:13px 14px; box-shadow:var(--shadow-sm); cursor:pointer; border-left:3px solid var(--primary-mid); transition:transform .12s; }
#view-historia .hc-ses-card:active { transform:scale(0.98); }
#view-historia .hc-ses-pendiente { opacity:.75; border-left-color:#FBBF24; }
#view-historia .hc-ses-cancelada { opacity:.55; border-left-color:#F87171; }
#view-historia .hc-ses-top { display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap; }
#view-historia .hc-ses-num   { font-size:12px; font-weight:800; color:var(--primary); }
#view-historia .hc-ses-fecha { font-size:11px; color:var(--text-muted); }
#view-historia .hc-ses-mood  { font-size:16px; }
#view-historia .hc-ses-tipo  { font-size:10px; font-weight:700; background:var(--surface2); color:var(--text-muted); padding:2px 7px; border-radius:20px; }
#view-historia .hc-ses-motivo { font-size:13px; font-weight:600; color:var(--text); margin-bottom:6px; }
#view-historia .hc-ses-footer { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
#view-historia .hc-diag-chip { font-size:10px; font-weight:700; padding:2px 7px; border-radius:20px; background:var(--primary-light); color:var(--primary); }
#view-historia .hc-estado-chip { font-size:10px; font-weight:700; padding:2px 7px; border-radius:20px; margin-left:auto; }
#view-historia .hc-estado-realizada { background: rgba(124,58,237,0.15); color: #7C3AED; }
#view-historia .hc-estado-cancelada { background:#FEE2E2; color:#B91C1C; }
#view-historia .hc-estado-pendiente { background:#FEF3C7; color:#92400E; }
#view-historia .hc-info-card { background:var(--surface); border-radius:14px; margin:12px 16px; padding:14px; box-shadow:var(--shadow-sm); }
#view-historia .hc-info-card-title { font-size:13px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; margin-bottom:10px; }
#view-historia .hc-info-row { padding:8px 0; border-bottom:1px solid var(--border); }
#view-historia .hc-info-label { font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px; }
#view-historia .hc-info-value { font-size:13px; font-weight:600; color:var(--text); line-height:1.5; }
#view-historia .hc-info-empty { color:var(--text-muted); font-weight:400; }
#view-historia .hc-btn-edit { width:100%; margin-top:12px; padding:10px; border-radius:10px; border:1.5px solid var(--border); background:var(--bg); color:var(--text); font-family:var(--font); font-size:13px; font-weight:700; cursor:pointer; }
#view-historia .hc-sd-header { background:linear-gradient(145deg,#2D1B69 0%,#5B2FA8 55%,#7C3AED 100%); padding:18px 18px 16px; position:relative; overflow:hidden; }
#view-historia .hc-sd-title  { font-size:16px; font-weight:800; color:white; }
#view-historia .hc-sd-meta   { font-size:12px; color:rgba(255,255,255,0.65); margin-top:3px; }
#view-historia .hc-sd-actions { display:flex; gap:8px; margin-top:12px; position:relative; z-index:1; }
#view-historia .hc-sd-btn { padding:9px 16px; border-radius:10px; border:none; font-family:var(--font); font-size:12px; font-weight:700; cursor:pointer; background:rgba(255,255,255,0.15); color:white; }
#view-historia .hc-section { padding:12px 16px; border-bottom:1px solid var(--border); }
#view-historia .hc-section-title { font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; margin-bottom:6px; }
#view-historia .hc-section-body  { font-size:14px; color:var(--text); line-height:1.6; }
#view-historia .hc-mood-display { display:flex; align-items:center; gap:8px; }
#view-historia .hc-mood-emoji   { font-size:24px; }
#view-historia .hc-mood-label   { font-size:14px; font-weight:700; }
#view-historia .hc-btn-ia { width:calc(100% - 32px); margin:16px; background:linear-gradient(135deg,#5B2FA8,#7C3AED); color:white; border:none; border-radius:14px; padding:14px; font-size:15px; font-weight:800; font-family:var(--font); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
#view-historia .hc-btn-ia:disabled { opacity:.5; cursor:not-allowed; }
#view-historia .hc-ia-result-wrap { margin:0 16px 16px; display:none; }
#view-historia .hc-ia-loading { display:none; flex-direction:column; align-items:center; gap:10px; padding:20px; }
#view-historia .hc-ia-spinner { width:28px; height:28px; border:3px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation:hcSpin .8s linear infinite; }
@keyframes hcSpin { to { transform:rotate(360deg); } }
#view-historia .hc-ia-output { white-space:pre-wrap; font-size:13px; line-height:1.7; color:var(--text); padding:14px; background:var(--surface); border-radius:12px; box-shadow:var(--shadow-sm); }
#view-historia .hc-ia-alerta { display:none; background:rgba(229,62,62,.08); border:1.5px solid rgba(229,62,62,.25); border-radius:12px; padding:12px 14px; margin-top:10px; }
#view-historia .hc-ia-alerta-title { font-size:13px; font-weight:800; color:var(--danger); margin-bottom:4px; }
#view-historia .hc-empty { text-align:center; padding:40px 20px; color:var(--text-muted); }
#view-historia .hc-empty-icon { font-size:40px; margin-bottom:10px; }
#view-historia .hc-empty h3 { color:var(--text); font-size:17px; margin-bottom:6px; }
#view-historia .hc-spacer { height:80px; }

/* Modal */
#hc-overlay-sesion, #hc-overlay-info { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:200; display:none; align-items:flex-end; justify-content:center; overflow-y:auto; }
#hc-overlay-sesion.hc-open, #hc-overlay-info.hc-open { display:flex; }
#view-historia .hc-modal { background:var(--surface); border-radius:20px 20px 0 0; width:100%; max-width:540px; padding:20px 20px 40px; max-height:92vh; overflow-y:auto; animation:hcSlideUp .25s ease; }
@keyframes hcSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
#view-historia .hc-modal-handle { width:36px; height:4px; background:var(--border); border-radius:2px; margin:0 auto 16px; }
#view-historia .hc-modal-title  { font-size:18px; font-weight:800; margin-bottom:14px; }
#view-historia .hc-field        { margin-bottom:12px; }
#view-historia .hc-field-label  { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
#view-historia .hc-field-input  { width:100%; border:1.5px solid var(--border); border-radius:12px; padding:10px 14px; font-size:14px; font-family:var(--font); background:var(--bg); color:var(--text); outline:none; transition:border .15s; box-sizing:border-box; }
#view-historia .hc-field-input:focus { border-color:var(--primary); }
#view-historia .hc-two-col { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
#view-historia .hc-mood-btns { display:flex; gap:6px; flex-wrap:wrap; }
#view-historia .hc-mood-btn { display:flex; flex-direction:column; align-items:center; gap:2px; padding:8px 10px; border-radius:10px; border:1.5px solid var(--border); background:var(--bg); cursor:pointer; font-family:var(--font); font-size:12px; transition:all .15s; }
#view-historia .hc-mood-btn:hover { background:var(--primary-light); border-color:var(--primary); }
#view-historia .hc-mood-sel { background:var(--primary-light) !important; border-color:var(--primary) !important; color:var(--primary); font-weight:700; }
#view-historia .hc-diag-grid { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; }
#view-historia .hc-diag-chip-sel { font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; background:var(--bg); border:1.5px solid var(--border); color:var(--text-muted); cursor:pointer; transition:all .15s; }
#view-historia .hc-diag-on { background:var(--primary-light) !important; border-color:var(--primary) !important; color:var(--primary) !important; }
#view-historia .hc-btn-primary { width:100%; padding:14px; border-radius:12px; background:var(--primary); color:white; border:none; font-family:var(--font); font-size:15px; font-weight:700; cursor:pointer; margin-top:6px; }
#view-historia .hc-btn-danger  { width:100%; padding:12px; border-radius:12px; background:var(--danger-light); color:var(--danger); border:none; font-family:var(--font); font-size:14px; font-weight:700; cursor:pointer; margin-top:6px; }
#view-historia .hc-btn-ghost   { width:100%; padding:12px; border-radius:12px; background:none; border:none; color:var(--text-muted); font-family:var(--font); font-size:14px; cursor:pointer; margin-top:4px; }

/* Toast */
#hc-toast { position:fixed; bottom:88px; left:50%; transform:translateX(-50%); background:#1A1040; color:white; padding:10px 20px; border-radius:12px; font-size:13px; font-weight:600; z-index:9999; opacity:0; pointer-events:none; transition:opacity .25s; white-space:nowrap; }
#hc-toast.hc-toast-show { opacity:1; }
  `;
  document.head.appendChild(style);
})();


/* ══════════════════════════════════════════
   ESTADO INTERNO
   ══════════════════════════════════════════ */
let _hcTodosPacientes = [];
let _hcPaciente       = null;
let _hcSesiones       = [];
let _hcInfoClinica    = null;
let _hcSesionActual   = null;
let _hcEditandoId     = null;
let _hcMood           = 0;
let _hcDiags          = [];
let _hcDiagsCustom    = [];
let _hcTabActual      = 'sesiones';
let _hcUserId         = null;

const HC_COLORES    = ['#5B2FA8','#1976D2','#2D6A4F','#D97706','#7B5EA7','#0369A1','#E65100'];
const HC_MOOD_MAP   = { 1:'😞', 2:'😕', 3:'😐', 4:'🙂', 5:'😄' };
const HC_MOOD_LABELS= { 1:'Muy mal', 2:'Mal', 3:'Regular', 4:'Bien', 5:'Muy bien' };


/* ══════════════════════════════════════════
   RENDER HTML — UNA SOLA VEZ en init()
   ══════════════════════════════════════════ */
function _hcRenderHTML(container) {
  container.innerHTML = `
    <!-- ── PANEL LISTA ── -->
    <div class="hc-panel hc-active" id="hc-panel-lista">
      <div class="hc-header">
        <div class="hc-header-row">
          <div>
            <div class="hc-header-title">Historia Clínica</div>
            <div class="hc-header-subtitle">Historial de pacientes</div>
          </div>
        </div>
      </div>
      <div class="hc-stats">
        <div class="hc-stat"><div class="hc-stat-num" id="hc-stat-pac">—</div><div class="hc-stat-label">Pacientes</div></div>
        <div class="hc-stat"><div class="hc-stat-num" id="hc-stat-ses">—</div><div class="hc-stat-label">Sesiones</div></div>
        <div class="hc-stat"><div class="hc-stat-num" id="hc-stat-mes">—</div><div class="hc-stat-label">Este mes</div></div>
      </div>
      <div class="hc-search-wrap">
        <span>🔍</span>
        <input type="text" id="hc-search" placeholder="Buscar paciente…">
      </div>
      <div id="hc-pac-list">
        <div style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px">Cargando…</div>
      </div>
      <div class="hc-spacer"></div>
    </div>

    <!-- ── PANEL DETALLE ── -->
    <div class="hc-panel" id="hc-panel-detalle">
      <div class="hc-header">
        <div class="hc-header-row">
          <button class="hc-back-btn" id="hc-btn-volver-lista">←</button>
          <div>
            <div class="hc-header-title" id="hc-det-title">Paciente</div>
          </div>
        </div>
        <div style="margin-top:14px;position:relative;z-index:1">
          <div class="hc-det-avatar-wrap">
            <div class="hc-det-avatar" id="hc-det-avatar">??</div>
            <div>
              <div class="hc-det-nombre" id="hc-det-nombre">—</div>
              <div class="hc-det-sub"    id="hc-det-sub">—</div>
            </div>
          </div>
        </div>
      </div>
      <div class="hc-tabs">
        <button class="hc-tab hc-tab-active" id="hc-tab-ses">📋 Sesiones</button>
        <button class="hc-tab"               id="hc-tab-info">🩺 Info clínica</button>
      </div>
      <div class="hc-tab-content hc-tab-show" id="hc-tc-sesiones">
        <div class="hc-ses-header">
          <div class="hc-ses-header-title">Historial de sesiones</div>
          <button class="hc-btn-nueva" id="hc-btn-nueva-ses">+ Nueva</button>
        </div>
        <div id="hc-ses-list">
          <div style="text-align:center;padding:32px;color:var(--text-muted);font-size:13px">Cargando sesiones…</div>
        </div>
      </div>
      <div class="hc-tab-content" id="hc-tc-info">
        <div id="hc-info-content">
          <div style="text-align:center;padding:32px;color:var(--text-muted);font-size:13px">Cargando…</div>
        </div>
        <div class="hc-spacer"></div>
      </div>
      <div class="hc-spacer"></div>
    </div>

    <!-- ── PANEL SESIÓN ── -->
    <div class="hc-panel" id="hc-panel-sesion">
      <div class="hc-sd-header" id="hc-sd-header">
        <div class="hc-header-row" style="position:relative;z-index:1">
          <button class="hc-back-btn" id="hc-btn-volver-detalle">←</button>
          <div style="flex:1">
            <div class="hc-sd-title" id="hc-sd-title">Sesión</div>
            <div class="hc-sd-meta"  id="hc-sd-meta">—</div>
          </div>
        </div>
        <div class="hc-sd-actions">
          <button class="hc-sd-btn" id="hc-btn-editar-ses">✏️ Editar</button>
        </div>
      </div>
      <div id="hc-sd-body"></div>
      <button class="hc-btn-ia" id="hc-btn-ia-sesion">🧠 Procesar sesión con IA</button>
      <div class="hc-ia-result-wrap" id="hc-ia-result-wrap">
        <div class="hc-ia-loading" id="hc-ia-loading">
          <div class="hc-ia-spinner"></div>
          <span>Analizando sesión…</span>
        </div>
        <div class="hc-ia-output" id="hc-ia-output"></div>
        <div class="hc-ia-alerta" id="hc-ia-alerta">
          <div class="hc-ia-alerta-title">⚠️ Señal de alerta detectada</div>
          <div style="font-size:12px;color:var(--text);line-height:1.5" id="hc-ia-alerta-texto"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button style="flex:1;padding:10px;border-radius:11px;border:1.5px solid var(--border);background:var(--surface);font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer" id="hc-btn-copiar-ia">📋 Copiar</button>
        </div>
      </div>
      <div class="hc-spacer"></div>
    </div>

    <!-- ══ MODAL SESIÓN ══ -->
    <div id="hc-overlay-sesion">
      <div class="hc-modal">
        <div class="hc-modal-handle"></div>
        <div class="hc-modal-title" id="hc-modal-ses-title">Nueva sesión</div>
        <div class="hc-two-col">
          <div class="hc-field"><div class="hc-field-label">Fecha</div><input class="hc-field-input" id="hc-ses-fecha" type="date"></div>
          <div class="hc-field"><div class="hc-field-label">Nº sesión</div><input class="hc-field-input" id="hc-ses-num" type="number" placeholder="Ej: 1"></div>
        </div>
        <div class="hc-two-col">
          <div class="hc-field">
            <div class="hc-field-label">Tipo</div>
            <select class="hc-field-input" id="hc-ses-tipo">
              <option value="individual">Individual</option><option value="pareja">Pareja</option>
              <option value="familia">Familia</option><option value="evaluacion">Evaluación</option>
              <option value="seguimiento">Seguimiento</option>
            </select>
          </div>
          <div class="hc-field">
            <div class="hc-field-label">Estado</div>
            <select class="hc-field-input" id="hc-ses-estado">
              <option value="realizada">Realizada</option><option value="pendiente">Pendiente</option><option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
        <div class="hc-field">
          <div class="hc-field-label">Estado de ánimo</div>
          <div class="hc-mood-btns" id="hc-mood-btns">
            <button class="hc-mood-btn" data-v="1"><span>😞</span><span>Muy mal</span></button>
            <button class="hc-mood-btn" data-v="2"><span>😕</span><span>Mal</span></button>
            <button class="hc-mood-btn" data-v="3"><span>😐</span><span>Regular</span></button>
            <button class="hc-mood-btn" data-v="4"><span>🙂</span><span>Bien</span></button>
            <button class="hc-mood-btn" data-v="5"><span>😄</span><span>Muy bien</span></button>
          </div>
        </div>
        <div class="hc-field"><div class="hc-field-label">Motivo / tema de la sesión</div><input class="hc-field-input" id="hc-ses-motivo" type="text" placeholder="Ej: Ansiedad laboral, cierre de duelo…"></div>
        <div class="hc-field"><div class="hc-field-label">Notas clínicas</div><textarea class="hc-field-input" id="hc-ses-notas" placeholder="Observaciones, intervenciones, evolución…" style="resize:none;min-height:80px;font-size:13px;line-height:1.5"></textarea></div>
        <div class="hc-field"><div class="hc-field-label">Tareas para próxima sesión</div><input class="hc-field-input" id="hc-ses-tareas" type="text" placeholder="Ej: Registro de pensamientos…"></div>
        <div class="hc-field">
          <div class="hc-field-label">Diagnóstico (CIE-11)</div>
          <div class="hc-diag-grid" id="hc-diag-grid">
            <div class="hc-diag-chip-sel" data-v="F32 – Episodio depresivo">F32 – Dep.</div>
            <div class="hc-diag-chip-sel" data-v="F41.1 – TAG">F41.1 – TAG</div>
            <div class="hc-diag-chip-sel" data-v="F41.0 – Pánico">F41.0 – Pánico</div>
            <div class="hc-diag-chip-sel" data-v="F43.1 – TEPT">F43.1 – TEPT</div>
            <div class="hc-diag-chip-sel" data-v="F60.3 – TLP">F60.3 – TLP</div>
            <div class="hc-diag-chip-sel" data-v="F84.0 – TEA">F84.0 – TEA</div>
            <div class="hc-diag-chip-sel" data-v="F90 – TDAH">F90 – TDAH</div>
            <div class="hc-diag-chip-sel" data-v="F20 – Esquizofrenia">F20 – Esq.</div>
            <div class="hc-diag-chip-sel" data-v="F31 – TAB">F31 – TAB</div>
            <div class="hc-diag-chip-sel" data-v="Z65.3 – Orientación">Z65.3 – Orient.</div>
          </div>
          <div style="display:flex;gap:8px">
            <input class="hc-field-input" id="hc-diag-custom" type="text" placeholder="Otro diagnóstico…" style="flex:1">
            <button id="hc-btn-add-diag" style="background:var(--primary-light);color:var(--primary);border:none;border-radius:12px;padding:0 14px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">+ Agregar</button>
          </div>
          <div id="hc-diag-custom-list" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"></div>
        </div>
        <button class="hc-btn-primary" id="hc-btn-guardar-ses">💾 Guardar sesión</button>
        <button class="hc-btn-danger"  id="hc-btn-eliminar-ses">🗑 Eliminar sesión</button>
        <button class="hc-btn-ghost"   id="hc-btn-cancelar-ses">Cancelar</button>
      </div>
    </div>

    <!-- ══ MODAL INFO CLÍNICA ══ -->
    <div id="hc-overlay-info">
      <div class="hc-modal">
        <div class="hc-modal-handle"></div>
        <div class="hc-modal-title">🩺 Información clínica</div>
        <div class="hc-field"><div class="hc-field-label">Motivo de consulta</div><textarea class="hc-field-input" id="hc-info-motivo" placeholder="Describí el motivo inicial de consulta…" style="resize:none;min-height:60px;font-size:13px;line-height:1.5"></textarea></div>
        <div class="hc-field"><div class="hc-field-label">Antecedentes</div><textarea class="hc-field-input" id="hc-info-antecedentes" placeholder="Antecedentes personales, familiares, etc." style="resize:none;min-height:60px;font-size:13px;line-height:1.5"></textarea></div>
        <div class="hc-two-col">
          <div class="hc-field"><div class="hc-field-label">Diagnóstico principal</div><input class="hc-field-input" id="hc-info-diagnostico" type="text" placeholder="Ej: F41.1 – TAG"></div>
          <div class="hc-field"><div class="hc-field-label">Medicación actual</div><input class="hc-field-input" id="hc-info-medicacion" type="text" placeholder="Ej: Sertralina 50mg"></div>
        </div>
        <div class="hc-field">
          <div class="hc-field-label">Enfoque terapéutico</div>
          <select class="hc-field-input" id="hc-info-enfoque">
            <option value="">— Sin especificar —</option>
            <option value="TCC">TCC – Cognitivo conductual</option><option value="Psicoanalítico">Psicoanalítico</option>
            <option value="Sistémico">Sistémico</option><option value="Gestalt">Gestalt</option>
            <option value="EMDR">EMDR</option><option value="Integrativo">Integrativo</option>
            <option value="Humanista">Humanista</option><option value="ACT">ACT</option>
          </select>
        </div>
        <div class="hc-field"><div class="hc-field-label">Objetivos terapéuticos</div><textarea class="hc-field-input" id="hc-info-objetivos" placeholder="Objetivos acordados con el paciente…" style="resize:none;min-height:60px;font-size:13px;line-height:1.5"></textarea></div>
        <div class="hc-field"><div class="hc-field-label">Notas generales</div><textarea class="hc-field-input" id="hc-info-notas-gen" placeholder="Observaciones generales del caso…" style="resize:none;min-height:60px;font-size:13px;line-height:1.5"></textarea></div>
        <button class="hc-btn-primary" id="hc-btn-guardar-info">💾 Guardar</button>
        <button class="hc-btn-ghost"   id="hc-btn-cancelar-info">Cancelar</button>
      </div>
    </div>

    <div id="hc-toast"></div>
  `;
}


/* ══════════════════════════════════════════
   BIND DE EVENTOS — UNA SOLA VEZ en init()
   ══════════════════════════════════════════ */
function _hcBindEvents() {
  const q = id => document.getElementById(id);

  // Navegación entre paneles
  q('hc-btn-volver-lista')?.addEventListener('click', hcVolverLista);
  q('hc-btn-volver-detalle')?.addEventListener('click', hcVolverDetalle);

  // Tabs
  q('hc-tab-ses')?.addEventListener('click',  () => hcSwitchTab('sesiones'));
  q('hc-tab-info')?.addEventListener('click', () => hcSwitchTab('info'));

  // Búsqueda
  q('hc-search')?.addEventListener('input', hcFiltrar);

  // Sesiones
  q('hc-btn-nueva-ses')?.addEventListener('click', hcAbrirModalNueva);
  q('hc-btn-editar-ses')?.addEventListener('click', hcEditarSesion);
  q('hc-btn-guardar-ses')?.addEventListener('click', hcGuardarSesion);
  q('hc-btn-eliminar-ses')?.addEventListener('click', hcEliminarSesion);
  q('hc-btn-cancelar-ses')?.addEventListener('click', hcCerrarModalSesion);

  // Mood buttons
  document.querySelectorAll('#hc-mood-btns .hc-mood-btn').forEach(btn => {
    btn.addEventListener('click', () => hcSelMood(parseInt(btn.dataset.v)));
  });

  // Diagnósticos chips
  document.querySelectorAll('#hc-diag-grid .hc-diag-chip-sel').forEach(chip => {
    chip.addEventListener('click', () => hcToggleDiag(chip));
  });
  q('hc-btn-add-diag')?.addEventListener('click', hcAddDiagCustom);

  // Info clínica
  q('hc-btn-guardar-info')?.addEventListener('click', hcGuardarInfo);
  q('hc-btn-cancelar-info')?.addEventListener('click', hcCerrarModalInfo);

  // IA
  q('hc-btn-ia-sesion')?.addEventListener('click', hcProcesarIA);
  q('hc-btn-copiar-ia')?.addEventListener('click', hcCopiarIA);

  // Cerrar modales al tocar fuera
  q('hc-overlay-sesion')?.addEventListener('click', e => { if (e.target.id === 'hc-overlay-sesion') hcCerrarModalSesion(); });
  q('hc-overlay-info')?.addEventListener('click',   e => { if (e.target.id === 'hc-overlay-info')   hcCerrarModalInfo();   });
}


/* ══════════════════════════════════════════
   PANELES
   ══════════════════════════════════════════ */
function hcShowPanel(name) {
  ['lista','detalle','sesion'].forEach(n =>
    document.getElementById('hc-panel-' + n)?.classList.toggle('hc-active', n === name)
  );
}
window.hcVolverLista   = function() { hcShowPanel('lista'); };
window.hcVolverDetalle = function() { _hcSesionActual = null; hcShowPanel('detalle'); };


/* ══════════════════════════════════════════
   CARGAR PACIENTES
   ══════════════════════════════════════════ */
async function _hcCargarPacientes() {
  // Usar store global
  _hcTodosPacientes = await PsicoRouter.store.ensurePacientes();
  _hcUserId         = PsicoRouter.store.userId;
  _hcRenderPacientes(_hcTodosPacientes);
  _hcCargarStats();
}

async function _hcCargarStats() {
  const el = document.getElementById('hc-stat-pac');
  if (el) el.textContent = _hcTodosPacientes.length;

  const { count: total } = await sb.from('sesiones_clinicas')
    .select('id', { count: 'exact', head: true }).eq('user_id', _hcUserId);

  const mesInicio = new Date(); mesInicio.setDate(1); mesInicio.setHours(0,0,0,0);
  const { count: mes } = await sb.from('sesiones_clinicas')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', _hcUserId)
    .gte('fecha', mesInicio.toISOString().split('T')[0]);

  const s1 = document.getElementById('hc-stat-ses');
  const s2 = document.getElementById('hc-stat-mes');
  if (s1) s1.textContent = total || 0;
  if (s2) s2.textContent = mes   || 0;
}

function _hcRenderPacientes(lista) {
  const cont = document.getElementById('hc-pac-list');
  if (!cont) return;
  if (!lista.length) {
    cont.innerHTML = `<div class="hc-empty"><div class="hc-empty-icon">👥</div><h3>Sin pacientes</h3><p>Agregá pacientes en el módulo Pacientes primero.</p></div>`;
    return;
  }
  cont.innerHTML = lista.map((p, i) => {
    const nombre   = `${p.apellido || ''}, ${p.nombre || ''}`.trim().replace(/^,\s*/, '');
    const initials = `${(p.nombre || '?')[0]}${(p.apellido || '?')[0]}`.toUpperCase();
    const color    = HC_COLORES[i % HC_COLORES.length];
    return `<div class="hc-pac-card" onclick="hcAbrirDetalle('${p.id}')">
      <div class="hc-pac-avatar" style="background:${color}">${initials}</div>
      <div style="flex:1">
        <div class="hc-pac-name">${nombre}</div>
        <div class="hc-pac-sub" id="hc-sub-${p.id}">Cargando…</div>
      </div>
      <div class="hc-pac-arrow">›</div>
    </div>`;
  }).join('');

  lista.forEach(async p => {
    const { count } = await sb.from('sesiones_clinicas')
      .select('id', { count: 'exact', head: true }).eq('paciente_id', p.id);
    const el = document.getElementById('hc-sub-' + p.id);
    if (el) el.textContent = count ? `${count} sesión${count > 1 ? 'es' : ''}` : 'Sin sesiones';
  });
}

function hcFiltrar() {
  const q = document.getElementById('hc-search')?.value.toLowerCase() || '';
  _hcRenderPacientes(_hcTodosPacientes.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(q)
  ));
}


/* ══════════════════════════════════════════
   DETALLE PACIENTE
   ══════════════════════════════════════════ */
window.hcAbrirDetalle = async function(id) {
  _hcPaciente = _hcTodosPacientes.find(p => p.id === id);
  if (!_hcPaciente) return;
  const idx      = _hcTodosPacientes.findIndex(p => p.id === id);
  const color    = HC_COLORES[idx % HC_COLORES.length];
  const initials = `${(_hcPaciente.nombre || '?')[0]}${(_hcPaciente.apellido || '?')[0]}`.toUpperCase();
  const nombre   = `${_hcPaciente.nombre || ''} ${_hcPaciente.apellido || ''}`.trim();

  document.getElementById('hc-det-title').textContent  = 'Historia clínica';
  document.getElementById('hc-det-avatar').textContent  = initials;
  document.getElementById('hc-det-avatar').style.background = color;
  document.getElementById('hc-det-nombre').textContent  = nombre;
  document.getElementById('hc-det-sub').textContent     = _hcPaciente.telefono || 'Sin teléfono';

  hcShowPanel('detalle');
  hcSwitchTab('sesiones');
  await Promise.all([_hcCargarSesiones(), _hcCargarInfo()]);
};


/* ══════════════════════════════════════════
   TABS DETALLE
   ══════════════════════════════════════════ */
function hcSwitchTab(tab) {
  _hcTabActual = tab;
  document.getElementById('hc-tab-ses') ?.classList.toggle('hc-tab-active', tab === 'sesiones');
  document.getElementById('hc-tab-info')?.classList.toggle('hc-tab-active', tab === 'info');
  document.getElementById('hc-tc-sesiones')?.classList.toggle('hc-tab-show', tab === 'sesiones');
  document.getElementById('hc-tc-info')    ?.classList.toggle('hc-tab-show', tab === 'info');
}


/* ══════════════════════════════════════════
   SESIONES
   ══════════════════════════════════════════ */
async function _hcCargarSesiones() {
  const { data } = await sb.from('sesiones_clinicas')
    .select('*')
    .eq('paciente_id', _hcPaciente.id)
    .eq('user_id', _hcUserId)
    .order('fecha', { ascending: false });
  _hcSesiones = data || [];
  _hcRenderSesiones(_hcSesiones);
}

function _hcRenderSesiones(lista) {
  const cont = document.getElementById('hc-ses-list');
  if (!cont) return;
  if (!lista.length) {
    cont.innerHTML = `<div class="hc-empty"><div class="hc-empty-icon">📋</div><h3>Sin sesiones</h3><p>Tocá "+ Nueva" para registrar la primera sesión.</p></div>`;
    return;
  }
  cont.innerHTML = lista.map((s, i) => {
    const diags    = _hcParseDiags(s.diagnosticos);
    const diagHtml = diags.slice(0, 2).map(d => `<span class="hc-diag-chip">${d.split('–')[0].trim()}</span>`).join('');
    const estadoCls = { realizada:'hc-estado-realizada', cancelada:'hc-estado-cancelada', pendiente:'hc-estado-pendiente' }[s.estado] || 'hc-estado-realizada';
    const pendCls   = s.estado === 'pendiente' ? ' hc-ses-pendiente' : s.estado === 'cancelada' ? ' hc-ses-cancelada' : '';
    return `<div class="hc-ses-card${pendCls}" onclick="hcVerSesion(${s.id})">
      <div class="hc-ses-top">
        <span class="hc-ses-num">N° ${s.numero_sesion || (lista.length - i)}</span>
        <span class="hc-ses-fecha">${_hcFmtFecha(s.fecha)}</span>
        ${s.estado_animo ? `<span class="hc-ses-mood">${HC_MOOD_MAP[s.estado_animo]}</span>` : ''}
        <span class="hc-ses-tipo">${s.tipo || 'individual'}</span>
      </div>
      ${s.motivo ? `<div class="hc-ses-motivo">${s.motivo}</div>` : ''}
      <div class="hc-ses-footer">
        ${diagHtml}
        <span class="hc-estado-chip ${estadoCls}">${s.estado || 'realizada'}</span>
      </div>
    </div>`;
  }).join('');
}

window.hcVerSesion = function(id) {
  _hcSesionActual = _hcSesiones.find(s => s.id === id);
  if (!_hcSesionActual) return;
  const s     = _hcSesionActual;
  const diags = _hcParseDiags(s.diagnosticos);

  document.getElementById('hc-sd-title').textContent = `Sesión N° ${s.numero_sesion || '—'} · ${s.tipo || 'Individual'}`;
  document.getElementById('hc-sd-meta').textContent  = _hcFmtFecha(s.fecha);

  document.getElementById('hc-sd-body').innerHTML = `
    ${s.estado_animo ? `<div class="hc-section"><div class="hc-section-title">Estado de ánimo</div><div class="hc-section-body"><div class="hc-mood-display"><span class="hc-mood-emoji">${HC_MOOD_MAP[s.estado_animo]}</span><span class="hc-mood-label">${HC_MOOD_LABELS[s.estado_animo]}</span></div></div></div>` : ''}
    ${s.motivo ? `<div class="hc-section"><div class="hc-section-title">Motivo / tema</div><div class="hc-section-body">${s.motivo}</div></div>` : ''}
    ${s.notas  ? `<div class="hc-section"><div class="hc-section-title">Notas clínicas</div><div class="hc-section-body">${s.notas.replace(/\n/g,'<br>')}</div></div>` : ''}
    ${s.tareas ? `<div class="hc-section"><div class="hc-section-title">Tareas para próxima sesión</div><div class="hc-section-body">${s.tareas}</div></div>` : ''}
    ${diags.length ? `<div class="hc-section"><div class="hc-section-title">Diagnóstico</div><div class="hc-section-body" style="display:flex;flex-wrap:wrap;gap:6px">${diags.map(d=>`<span class="hc-diag-chip">${d}</span>`).join('')}</div></div>` : ''}
  `;

  document.getElementById('hc-ia-result-wrap').style.display = 'none';
  document.getElementById('hc-ia-output').textContent = '';
  document.getElementById('hc-ia-alerta').style.display = 'none';
  hcShowPanel('sesion');
};


/* ══════════════════════════════════════════
   INFO CLÍNICA
   ══════════════════════════════════════════ */
async function _hcCargarInfo() {
  const { data } = await sb.from('historias_clinicas')
    .select('*').eq('paciente_id', _hcPaciente.id).eq('user_id', _hcUserId).maybeSingle();
  _hcInfoClinica = data || null;
  _hcRenderInfo(_hcInfoClinica);
}

function _hcRenderInfo(info) {
  const cont = document.getElementById('hc-info-content');
  if (!cont) return;
  const campo = (label, val) => `<div class="hc-info-row"><div class="hc-info-label">${label}</div><div class="hc-info-value ${val ? '' : 'hc-info-empty'}">${val || 'Sin datos'}</div></div>`;
  cont.innerHTML = `
    <div class="hc-info-card">
      <div class="hc-info-card-title">📋 Motivo y antecedentes</div>
      ${campo('Motivo de consulta', info?.motivo_consulta)}
      ${campo('Antecedentes', info?.antecedentes)}
      <button class="hc-btn-edit" onclick="hcAbrirModalInfo()">✏️ Editar información clínica</button>
    </div>
    <div class="hc-info-card">
      <div class="hc-info-card-title">🩺 Diagnóstico y tratamiento</div>
      ${campo('Diagnóstico principal', info?.diagnostico_principal)}
      ${campo('Medicación', info?.medicacion)}
      ${campo('Enfoque terapéutico', info?.enfoque_terapeutico)}
      <button class="hc-btn-edit" onclick="hcAbrirModalInfo()">✏️ Editar</button>
    </div>
    <div class="hc-info-card">
      <div class="hc-info-card-title">🎯 Objetivos</div>
      ${campo('Objetivos terapéuticos', info?.objetivos)}
      ${campo('Notas generales', info?.notas_generales)}
      <button class="hc-btn-edit" onclick="hcAbrirModalInfo()">✏️ Editar</button>
    </div>
  `;
}


/* ══════════════════════════════════════════
   MODAL SESIÓN
   ══════════════════════════════════════════ */
function hcAbrirModalNueva() {
  _hcEditandoId = null; _hcMood = 0; _hcDiags = []; _hcDiagsCustom = [];
  document.getElementById('hc-modal-ses-title').textContent = 'Nueva sesión';
  document.getElementById('hc-ses-fecha').value   = new Date().toISOString().split('T')[0];
  document.getElementById('hc-ses-num').value     = _hcSesiones.length + 1;
  document.getElementById('hc-ses-tipo').value    = 'individual';
  document.getElementById('hc-ses-estado').value  = 'realizada';
  document.getElementById('hc-ses-motivo').value  = '';
  document.getElementById('hc-ses-notas').value   = '';
  document.getElementById('hc-ses-tareas').value  = '';
  document.getElementById('hc-btn-eliminar-ses').style.display = 'none';
  _hcResetMood(); _hcResetDiags();
  document.getElementById('hc-overlay-sesion').classList.add('hc-open');
}

function hcEditarSesion() {
  if (!_hcSesionActual) return;
  const s = _hcSesionActual;
  _hcEditandoId = s.id; _hcMood = s.estado_animo || 0; _hcDiags = []; _hcDiagsCustom = [];
  document.getElementById('hc-modal-ses-title').textContent = 'Editar sesión';
  document.getElementById('hc-ses-fecha').value   = s.fecha || '';
  document.getElementById('hc-ses-num').value     = s.numero_sesion || '';
  document.getElementById('hc-ses-tipo').value    = s.tipo || 'individual';
  document.getElementById('hc-ses-estado').value  = s.estado || 'realizada';
  document.getElementById('hc-ses-motivo').value  = s.motivo || '';
  document.getElementById('hc-ses-notas').value   = s.notas || '';
  document.getElementById('hc-ses-tareas').value  = s.tareas || '';
  document.getElementById('hc-btn-eliminar-ses').style.display = 'block';
  _hcResetMood();
  if (_hcMood) document.querySelector(`.hc-mood-btn[data-v="${_hcMood}"]`)?.classList.add('hc-mood-sel');
  _hcResetDiags();
  const saved = _hcParseDiags(s.diagnosticos);
  saved.forEach(d => {
    const chip = Array.from(document.querySelectorAll('.hc-diag-chip-sel')).find(c => c.dataset.v === d);
    if (chip) { chip.classList.add('hc-diag-on'); _hcDiags.push(d); }
    else { _hcDiagsCustom.push(d); }
  });
  _hcRenderDiagCustom();
  document.getElementById('hc-overlay-sesion').classList.add('hc-open');
}

function hcCerrarModalSesion() {
  document.getElementById('hc-overlay-sesion').classList.remove('hc-open');
}

function hcSelMood(v) {
  _hcMood = v;
  document.querySelectorAll('.hc-mood-btn').forEach(b =>
    b.classList.toggle('hc-mood-sel', parseInt(b.dataset.v) === v)
  );
}

function hcToggleDiag(el) {
  const v = el.dataset.v;
  if (el.classList.toggle('hc-diag-on')) { _hcDiags.push(v); }
  else { _hcDiags = _hcDiags.filter(d => d !== v); }
}

function hcAddDiagCustom() {
  const inp = document.getElementById('hc-diag-custom');
  const val = inp.value.trim();
  if (!val || _hcDiagsCustom.includes(val)) return;
  _hcDiagsCustom.push(val);
  _hcRenderDiagCustom();
  inp.value = '';
}

function _hcRenderDiagCustom() {
  document.getElementById('hc-diag-custom-list').innerHTML = _hcDiagsCustom.map(d =>
    `<div class="hc-diag-chip-sel hc-diag-on">${d} <span onclick="hcRemoveDiagCustom('${d}')" style="cursor:pointer;margin-left:4px;font-size:11px">✕</span></div>`
  ).join('');
}

window.hcRemoveDiagCustom = function(v) {
  _hcDiagsCustom = _hcDiagsCustom.filter(d => d !== v);
  _hcRenderDiagCustom();
};

function _hcResetMood() {
  document.querySelectorAll('.hc-mood-btn').forEach(b => b.classList.remove('hc-mood-sel'));
}

function _hcResetDiags() {
  document.querySelectorAll('.hc-diag-chip-sel').forEach(c => c.classList.remove('hc-diag-on'));
  document.getElementById('hc-diag-custom-list').innerHTML = '';
  const inp = document.getElementById('hc-diag-custom');
  if (inp) inp.value = '';
}

async function hcGuardarSesion() {
  const btn = document.getElementById('hc-btn-guardar-ses');
  btn.disabled = true; btn.textContent = 'Guardando…';
  try {
    const allDiags = [..._hcDiags, ..._hcDiagsCustom];
    const payload = {
      user_id:       _hcUserId,
      paciente_id:   _hcPaciente.id,
      fecha:         document.getElementById('hc-ses-fecha').value,
      tipo:          document.getElementById('hc-ses-tipo').value,
      estado:        document.getElementById('hc-ses-estado').value,
      estado_animo:  _hcMood || null,
      motivo:        document.getElementById('hc-ses-motivo').value.trim()  || null,
      notas:         document.getElementById('hc-ses-notas').value.trim()   || null,
      tareas:        document.getElementById('hc-ses-tareas').value.trim()  || null,
      numero_sesion: parseInt(document.getElementById('hc-ses-num').value)  || null,
      diagnosticos:  allDiags.length ? JSON.stringify(allDiags) : null,
    };
    let error;
    if (_hcEditandoId) {
      ({ error } = await sb.from('sesiones_clinicas').update(payload).eq('id', _hcEditandoId));
    } else {
      ({ error } = await sb.from('sesiones_clinicas').insert(payload));
    }
    if (error) throw new Error(error.message);
    hcCerrarModalSesion();
    hcToast(_hcEditandoId ? '✅ Sesión actualizada' : '✅ Sesión guardada');
    await _hcCargarSesiones();
    if (_hcEditandoId) { hcVolverDetalle(); _hcSesionActual = null; }
  } catch(e) {
    hcToast('❌ Error: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = '💾 Guardar sesión';
  }
}

async function hcEliminarSesion() {
  if (!_hcEditandoId || !confirm('¿Eliminar esta sesión?')) return;
  const { error } = await sb.from('sesiones_clinicas').delete().eq('id', _hcEditandoId);
  if (error) { hcToast('❌ Error al eliminar'); return; }
  hcCerrarModalSesion();
  hcToast('🗑️ Sesión eliminada');
  await _hcCargarSesiones();
  hcVolverDetalle();
}


/* ══════════════════════════════════════════
   MODAL INFO CLÍNICA
   ══════════════════════════════════════════ */
window.hcAbrirModalInfo = function() {
  const info = _hcInfoClinica || {};
  document.getElementById('hc-info-motivo').value       = info.motivo_consulta        || '';
  document.getElementById('hc-info-antecedentes').value = info.antecedentes           || '';
  document.getElementById('hc-info-diagnostico').value  = info.diagnostico_principal  || '';
  document.getElementById('hc-info-medicacion').value   = info.medicacion             || '';
  document.getElementById('hc-info-enfoque').value      = info.enfoque_terapeutico    || '';
  document.getElementById('hc-info-objetivos').value    = info.objetivos              || '';
  document.getElementById('hc-info-notas-gen').value    = info.notas_generales        || '';
  document.getElementById('hc-overlay-info').classList.add('hc-open');
};

function hcCerrarModalInfo() {
  document.getElementById('hc-overlay-info').classList.remove('hc-open');
}

async function hcGuardarInfo() {
  const btn = document.getElementById('hc-btn-guardar-info');
  btn.disabled = true; btn.textContent = 'Guardando…';
  try {
    const payload = {
      user_id:               _hcUserId,
      paciente_id:           _hcPaciente.id,
      motivo_consulta:       document.getElementById('hc-info-motivo').value.trim()       || null,
      antecedentes:          document.getElementById('hc-info-antecedentes').value.trim() || null,
      diagnostico_principal: document.getElementById('hc-info-diagnostico').value.trim()  || null,
      medicacion:            document.getElementById('hc-info-medicacion').value.trim()   || null,
      enfoque_terapeutico:   document.getElementById('hc-info-enfoque').value             || null,
      objetivos:             document.getElementById('hc-info-objetivos').value.trim()    || null,
      notas_generales:       document.getElementById('hc-info-notas-gen').value.trim()   || null,
    };
    let error;
    if (_hcInfoClinica?.id) {
      ({ error } = await sb.from('historias_clinicas').update(payload).eq('id', _hcInfoClinica.id));
    } else {
      ({ error } = await sb.from('historias_clinicas').insert(payload));
    }
    if (error) throw new Error(error.message);
    hcCerrarModalInfo();
    hcToast('✅ Info clínica guardada');
    await _hcCargarInfo();
  } catch(e) {
    hcToast('❌ Error: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = '💾 Guardar';
  }
}


/* ══════════════════════════════════════════
   PROCESAR SESIÓN CON IA
   ══════════════════════════════════════════ */
async function hcProcesarIA() {
  if (!_hcSesionActual) return;
  if (!_hcVerificarLimiteIA()) return;

  const btn   = document.getElementById('hc-btn-ia-sesion');
  const wrap  = document.getElementById('hc-ia-result-wrap');
  const load  = document.getElementById('hc-ia-loading');
  const out   = document.getElementById('hc-ia-output');
  const alerta = document.getElementById('hc-ia-alerta');

  btn.disabled = true; btn.textContent = '⏳ Analizando…';
  wrap.style.display = 'block'; load.style.display = 'flex';
  out.textContent = ''; alerta.style.display = 'none';
  wrap.scrollIntoView({ behavior: 'smooth' });

  try {
    const s       = _hcSesionActual;
    const previas = _hcSesiones.filter(x => x.estado === 'realizada' && x.id !== s.id)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 3);
    const contexto = previas.length
      ? previas.map(x => `[${_hcFmtFecha(x.fecha)}] ${x.notas || x.motivo || 'Sin notas'}`).join('\n')
      : 'Primera sesión del paciente';
    const notas = [s.motivo, s.notas].filter(Boolean).join('. ') || 'Sin notas registradas';

    const prompt = `Sos un psicólogo clínico argentino supervisando una sesión. Analizá las notas y generá un informe de procesamiento clínico.

PACIENTE: ${_hcPaciente.nombre} ${_hcPaciente.apellido || ''}
SESIÓN N°: ${s.numero_sesion || '?'} — Fecha: ${_hcFmtFecha(s.fecha)}
TIPO: ${s.tipo || 'Individual'}
ESTADO DE ÁNIMO: ${s.estado_animo ? s.estado_animo + '/5' : 'No registrado'}

NOTAS DE ESTA SESIÓN:
${notas}

SESIONES ANTERIORES (contexto):
${contexto}

RESPONDÉ EXACTAMENTE CON ESTE FORMATO (sin negrita ni markdown):

RESUMEN CLÍNICO:
[3-5 líneas con síntesis de lo trabajado]

EVOLUCIÓN RESPECTO A SESIONES ANTERIORES:
[Comparación con el proceso previo]

SUGERENCIA CLÍNICA:
[Líneas de abordaje recomendadas para próximas sesiones]

ALERTA:
[Si detectás riesgo emocional, ideación, angustia elevada u otra señal de riesgo, describilo. Si no hay, escribí: Sin alertas.]

Lenguaje técnico-clínico argentino.`;

    const resp = await fetch(PSICOAPP_CONFIG.SUPA_URL + '/functions/v1/generar-informe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + PSICOAPP_CONFIG.SUPA_KEY },
      body: JSON.stringify({ prompt }),
    });
    const data  = await resp.json();
    load.style.display = 'none';
    const texto = data.error ? '❌ Error: ' + data.error : (data.texto || 'Sin respuesta');
    out.textContent = texto;

    if (!data.error) {
      _hcRegistrarUsoIA();
      const alertaMatch = texto.match(/ALERTA:([\s\S]*?)(?:\n[A-Z]|$)/i);
      if (alertaMatch) {
        const contenido = alertaMatch[1].trim();
        if (contenido && !contenido.toLowerCase().includes('sin alerta') && contenido.length > 10) {
          document.getElementById('hc-ia-alerta-texto').textContent = contenido;
          alerta.style.display = 'block';
        }
      }
    }
  } catch(e) {
    document.getElementById('hc-ia-loading').style.display = 'none';
    document.getElementById('hc-ia-output').textContent = '❌ Error: ' + e.message;
  } finally {
    btn.disabled = false; btn.innerHTML = '🧠 Procesar sesión con IA';
  }
}

function hcCopiarIA() {
  const texto = document.getElementById('hc-ia-output').textContent;
  navigator.clipboard.writeText(texto).then(() => hcToast('✅ Copiado'));
}

function _hcVerificarLimiteIA() {
  if (typeof puedeUsar === 'function') {
    if (!puedeUsar('informesIA')) { hcToast('🚫 Límite de IA alcanzado. Actualizá tu plan.'); return false; }
    return true;
  }
  try {
    const sus = JSON.parse(localStorage.getItem('suscripcion')) || {};
    const usos = sus.usos?.informesIA || 0;
    const max  = { free:1, pro:3, max:25 }[sus.plan || 'free'] ?? 1;
    if (usos >= max) { hcToast('🚫 Límite de IA alcanzado. Actualizá tu plan.'); return false; }
    return true;
  } catch { return true; }
}

function _hcRegistrarUsoIA() {
  if (typeof registrarUso === 'function') { registrarUso('informesIA'); return; }
  try {
    const sus = JSON.parse(localStorage.getItem('suscripcion')) || {};
    if (!sus.usos) sus.usos = { whatsapp:0, informesIA:0 };
    sus.usos.informesIA = (sus.usos.informesIA || 0) + 1;
    localStorage.setItem('suscripcion', JSON.stringify(sus));
  } catch {}
}


/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
function _hcFmtFecha(f) {
  if (!f) return '—';
  return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

function _hcParseDiags(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function hcToast(msg) {
  const el = document.getElementById('hc-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('hc-toast-show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('hc-toast-show'), 2800);
}


/* ══════════════════════════════════════════
   REGISTRO EN EL ROUTER
   ══════════════════════════════════════════ */
PsicoRouter.register('historia', {

  init(container) {
    _hcRenderHTML(container);
    _hcBindEvents();
  },

  async onEnter() {
    // Resetear al panel lista siempre que se entra
    hcShowPanel('lista');
    _hcPaciente    = null;
    _hcSesionActual = null;
    // userId desde store
    _hcUserId = await PsicoRouter.store.ensureUserId();
    // Pacientes desde store (invalida si viene de agregar nuevo paciente)
    await _hcCargarPacientes();
  },

  onLeave() {
    hcCerrarModalSesion();
    hcCerrarModalInfo();
  },
});

/* Compatibilidad legacy */
window.onViewEnter_historia = () => PsicoRouter.navigate('historia');

/* Funciones de onclick en HTML dinámico — deben ser globales */
window.hcFiltrar      = hcFiltrar;
window.hcSwitchTab    = hcSwitchTab;
window.hcAbrirModalNueva = hcAbrirModalNueva;
window.hcEditarSesion    = hcEditarSesion;
window.hcGuardarSesion   = hcGuardarSesion;
window.hcEliminarSesion  = hcEliminarSesion;
window.hcCerrarModalSesion = hcCerrarModalSesion;
window.hcGuardarInfo     = hcGuardarInfo;
window.hcCerrarModalInfo = hcCerrarModalInfo;
window.hcProcesarIA      = hcProcesarIA;
window.hcCopiarIA        = hcCopiarIA;
window.hcSelMood         = hcSelMood;
window.hcToggleDiag      = hcToggleDiag;
window.hcAddDiagCustom   = hcAddDiagCustom;
