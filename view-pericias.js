/**
 * view-pericias.js — PsicoApp SPA (refactorizado)
 * Registrado en PsicoRouter: init / onEnter / onLeave
 *
 * - init()    → HTML + listeners UNA SOLA VEZ
 * - onEnter() → carga pericias frescas de Supabase
 * - onLeave() → cierra modales
 * - perAbrirDetalle, perAbrirModal, etc. → CONSERVADOS en window
 *   (usados en onclick de HTML generado dinámicamente)
 */

/* ══════════════════════════════════════════
   ESTILOS — inyectados una sola vez
   ══════════════════════════════════════════ */
(function injectPericiaStyles() {
  if (document.getElementById('view-pericias-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-pericias-styles';
  style.textContent = `
#view-pericias { min-height: 100vh; background: var(--bg); }
#view-pericias .per-header { background: linear-gradient(145deg, #2D1B69 0%, #5B2FA8 55%, #7C3AED 100%); padding: 20px 20px 28px; position: relative; overflow: hidden; }
#view-pericias .per-header::after { content: ''; position: absolute; right: -40px; top: -40px; width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.05); }
#view-pericias .per-header-row { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
#view-pericias .per-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: white; }
#view-pericias .per-title span { color: #c4b5fd; }
#view-pericias .per-subtitle { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 4px; position: relative; z-index: 1; }
#view-pericias .per-fab { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.25); color: white; font-size: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
#view-pericias .per-fab:hover { background: rgba(255,255,255,0.25); }
#view-pericias .per-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 14px 16px; }
#view-pericias .per-stat { background: var(--surface); border-radius: 14px; padding: 12px 10px; box-shadow: var(--shadow-sm); text-align: center; }
#view-pericias .per-stat-num { font-size: 20px; font-weight: 800; }
#view-pericias .per-stat-label { font-size: 10px; color: var(--text-muted); font-weight: 600; margin-top: 2px; }
#view-pericias .per-tabs { display: flex; border-bottom: 1.5px solid var(--border); background: var(--surface); margin-bottom: 4px; }
#view-pericias .per-tab { flex: 1; padding: 12px 8px; text-align: center; font-size: 13px; font-weight: 700; color: var(--text-muted); cursor: pointer; border-bottom: 3px solid transparent; border: none; background: transparent; font-family: var(--font); transition: color .15s, border-color .15s; }
#view-pericias .per-tab.per-tab-active { color: var(--primary); border-bottom: 3px solid var(--primary); }
#view-pericias .per-stage { margin-bottom: 4px; }
#view-pericias .per-stage-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px 6px; }
#view-pericias .per-stage-badge { display: flex; align-items: center; gap: 8px; }
#view-pericias .per-stage-dot { width: 10px; height: 10px; border-radius: 50%; }
#view-pericias .per-stage-name { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; }
#view-pericias .per-stage-count { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
#view-pericias .per-card { background: var(--surface); border-radius: 14px; margin: 0 16px 8px; padding: 13px 14px; box-shadow: var(--shadow-sm); cursor: pointer; position: relative; overflow: hidden; transition: transform .15s; border-left: 4px solid transparent; }
#view-pericias .per-card:active { transform: scale(0.98); }
#view-pericias .per-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 5px; }
#view-pericias .per-card-exp { font-size: 13px; font-weight: 800; }
#view-pericias .per-card-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; flex-shrink: 0; }
#view-pericias .per-card-caratula { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#view-pericias .per-card-meta { display: flex; gap: 12px; flex-wrap: wrap; }
#view-pericias .per-card-meta-item { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
#view-pericias .per-alerta { background: rgba(124,58,237,0.12); color: #7C3AED; border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 700; margin-top: 8px; display: flex; align-items: center; gap: 6px; }
[data-theme="dark"] #view-pericias .per-alerta { background: rgba(124,58,237,0.20); color: #a78bfa; }
#view-pericias .per-empty { text-align: center; padding: 48px 20px; color: var(--text-muted); background: var(--surface); border-radius: var(--radius); margin: 16px; }
#view-pericias .per-empty-icon { font-size: 40px; margin-bottom: 10px; }
#view-pericias .per-empty h3 { color: var(--text); font-size: 17px; margin-bottom: 6px; }
#per-overlay, #per-overlay-det { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: none; align-items: flex-end; justify-content: center; }
#per-overlay.per-open, #per-overlay-det.per-open { display: flex; }
#per-overlay .per-modal, #per-overlay-det .per-modal { background: var(--surface); border-radius: 28px 28px 0 0; padding: 20px 20px 40px; width: 100%; max-width: 600px; max-height: 92vh; overflow-y: auto; animation: perSlideUp .25s ease; }
@keyframes perSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
#view-pericias .per-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 20px; }
.per-modal-title { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
.per-modal-sub   { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
.per-field       { margin-bottom: 14px; }
.per-field-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.per-field-req   { color: var(--primary); }
.per-field-input { width: 100%; border: 1.5px solid var(--border); border-radius: 14px; padding: 13px 16px; font-size: 15px; font-family: var(--font); color: var(--text); background: var(--bg); outline: none; transition: border-color .2s, background .2s; }
.per-field-input:focus { border-color: var(--primary); background: var(--surface); }
.per-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.per-btn-save { width: 100%; background: var(--primary); color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 700; font-family: var(--font); cursor: pointer; margin-top: 8px; transition: opacity .2s; }
.per-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.per-btn-cancel { width: 100%; background: none; border: none; padding: 14px; font-size: 14px; color: var(--text-muted); font-family: var(--font); cursor: pointer; margin-top: 4px; }
.per-msg-error { background: var(--danger-light); color: var(--danger); border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 12px; display: none; }
#per-overlay-det .per-det-fila { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); }
#per-overlay-det .per-det-fila-icon { font-size: 16px; flex-shrink: 0; }
#per-overlay-det .per-det-fila-label { font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
#per-overlay-det .per-det-fila-val { font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--text); }
.per-estado-select { width: 100%; border: 1.5px solid var(--border); border-radius: 12px; padding: 10px 14px; font-size: 14px; font-family: var(--font); background: var(--bg); color: var(--text); margin-top: 8px; outline: none; }
.per-det-actions { display: flex; gap: 10px; margin-top: 16px; }
.per-btn-del { flex: 1; padding: 12px; border-radius: 12px; border: none; background: var(--danger-light); color: var(--danger); font-family: var(--font); font-size: 13px; font-weight: 700; cursor: pointer; }
#view-pericias .per-s1 .per-stage-dot { background: #5B2FA8; }
#view-pericias .per-s1 .per-stage-count { background: rgba(124,58,237,0.15); color: #7C3AED; }
#view-pericias .per-s1 .per-stage-name  { color: #7C3AED; }
#view-pericias .per-s1 .per-card        { border-left-color: #5B2FA8; }
#view-pericias .per-s2 .per-stage-dot { background: #7C3AED; }
#view-pericias .per-s2 .per-stage-count { background: rgba(124,58,237,0.15); color: #7C3AED; }
#view-pericias .per-s2 .per-stage-name  { color: #7C3AED; }
#view-pericias .per-s2 .per-card        { border-left-color: #7C3AED; }
#view-pericias .per-s3 .per-stage-dot { background: #5B2FA8; }
#view-pericias .per-s3 .per-stage-count { background: rgba(124,58,237,0.15); color: #7C3AED; }
#view-pericias .per-s3 .per-stage-name  { color: #7C3AED; }
#view-pericias .per-s3 .per-card        { border-left-color: #5B2FA8; }
#view-pericias .per-s4 .per-stage-dot { background: var(--primary); }
#view-pericias .per-s4 .per-stage-count { background: var(--primary-light); color: var(--primary); }
#view-pericias .per-s4 .per-stage-name  { color: var(--primary); }
#view-pericias .per-s4 .per-card        { border-left-color: var(--primary); }
  `;
  document.head.appendChild(style);
})();


/* ══════════════════════════════════════════
   ESTADO INTERNO
   ══════════════════════════════════════════ */
let _perPericias     = [];
let _perSeleccionada = null;
let _perTabActual    = 'pipeline';

const PER_ESTADOS = {
  en_curso:   { label: 'En curso',   cls: 'per-s1', icon: '⚙️',  color: '#7C3AED', light: 'rgba(124,58,237,0.15)' },
  entrevista: { label: 'Entrevista', cls: 'per-s2', icon: '🗣',  color: '#7C3AED', light: 'rgba(124,58,237,0.15)' },
  redaccion:  { label: 'Redacción',  cls: 'per-s3', icon: '✍️',  color: '#7C3AED', light: 'rgba(124,58,237,0.15)' },
  presentado: { label: 'Presentado', cls: 'per-s3', icon: '📬',  color: '#7C3AED', light: 'rgba(124,58,237,0.15)' },
  cobrado:    { label: 'Cobrado',    cls: 'per-s4', icon: '✅',  color: null,      light: null       },
};


/* ══════════════════════════════════════════
   RENDER HTML — UNA SOLA VEZ en init()
   ══════════════════════════════════════════ */
function _perRenderHTML(container) {
  container.innerHTML = `
    <div class="per-header">
      <div class="per-header-row">
        <div>
          <div class="per-title">Peri<span>cias</span></div>
          <div class="per-subtitle">Gestión de expedientes periciales</div>
        </div>
        <button class="per-fab" id="per-btn-nueva" title="Nueva pericia">＋</button>
      </div>
    </div>

    <div class="per-stats">
      <div class="per-stat"><div class="per-stat-num" id="per-stat-encurso" style="color:var(--primary)">—</div><div class="per-stat-label">En curso</div></div>
      <div class="per-stat"><div class="per-stat-num" id="per-stat-venc" style="color:var(--primary)">—</div><div class="per-stat-label">Próx. venc.</div></div>
      <div class="per-stat"><div class="per-stat-num" id="per-stat-honorarios" style="color:var(--primary);font-size:16px">$0</div><div class="per-stat-label">Honor. pend.</div></div>
    </div>

    <div class="per-tabs">
      <button class="per-tab per-tab-active" id="per-tab-pipeline">⚖️ Pipeline</button>
      <button class="per-tab"               id="per-tab-lista">📋 Todas</button>
    </div>

    <div id="per-tab-content" style="padding-top:4px">
      <div style="text-align:center;padding:40px;color:var(--text-muted)">Cargando...</div>
    </div>

    <!-- MODAL NUEVA PERICIA -->
    <div id="per-overlay">
      <div class="per-modal">
        <div class="per-handle"></div>
        <div class="per-modal-title">⚖️ Nueva pericia</div>
        <div class="per-modal-sub">Registrá los datos del expediente.</div>
        <div id="per-msg-error" class="per-msg-error"></div>
        <div class="per-two-col">
          <div class="per-field"><div class="per-field-label">Expediente <span class="per-field-req">*</span></div><input class="per-field-input" id="per-f-expediente" type="text" placeholder="Nº expediente"></div>
          <div class="per-field"><div class="per-field-label">Juzgado</div><input class="per-field-input" id="per-f-juzgado" type="text" placeholder="Ej: Civil Nº3"></div>
        </div>
        <div class="per-field"><div class="per-field-label">Carátula <span class="per-field-req">*</span></div><input class="per-field-input" id="per-f-caratula" type="text" placeholder="Ej: García c/ Empresa SA"></div>
        <div class="per-field"><div class="per-field-label">Peritado</div><input class="per-field-input" id="per-f-peritado" type="text" placeholder="Nombre del peritado"></div>
        <div class="per-two-col">
          <div class="per-field"><div class="per-field-label">Fecha entrevista</div><input class="per-field-input" id="per-f-entrevista" type="date"></div>
          <div class="per-field"><div class="per-field-label">Fecha vencimiento</div><input class="per-field-input" id="per-f-vencimiento" type="date"></div>
        </div>
        <div class="per-two-col">
          <div class="per-field"><div class="per-field-label">Honorarios</div><input class="per-field-input" id="per-f-honorarios" type="number" placeholder="$0"></div>
          <div class="per-field">
            <div class="per-field-label">Estado</div>
            <select class="per-field-input" id="per-f-estado">
              <option value="en_curso">⚙️ En curso</option>
              <option value="entrevista">🗣 Entrevista</option>
              <option value="redaccion">✍️ Redacción</option>
              <option value="presentado">📬 Presentado</option>
              <option value="cobrado">✅ Cobrado</option>
            </select>
          </div>
        </div>
        <div class="per-field"><div class="per-field-label">Notas</div><textarea class="per-field-input" id="per-f-notas" placeholder="Observaciones..." style="resize:none;min-height:70px;font-size:14px;line-height:1.5"></textarea></div>
        <button class="per-btn-save" id="per-btn-guardar">✓ Guardar pericia</button>
        <button class="per-btn-cancel" id="per-btn-cancelar-modal">Cancelar</button>
      </div>
    </div>

    <!-- MODAL DETALLE -->
    <div id="per-overlay-det">
      <div class="per-modal">
        <div class="per-handle"></div>
        <div id="per-det-content"></div>
        <div style="margin-top:14px">
          <div class="per-field-label">Cambiar estado</div>
          <select class="per-estado-select" id="per-det-estado">
            <option value="en_curso">⚙️ En curso</option>
            <option value="entrevista">🗣 Entrevista programada</option>
            <option value="redaccion">✍️ En redacción</option>
            <option value="presentado">📬 Presentado</option>
            <option value="cobrado">✅ Cobrado</option>
          </select>
        </div>
        <div class="per-det-actions">
          <button class="per-btn-del" id="per-btn-eliminar">🗑 Eliminar</button>
        </div>
        <button class="per-btn-cancel" id="per-btn-cerrar-det">Cerrar</button>
      </div>
    </div>
  `;
}


/* ══════════════════════════════════════════
   BIND DE EVENTOS — UNA SOLA VEZ en init()
   ══════════════════════════════════════════ */
function _perBindEvents() {
  const q = id => document.getElementById(id);

  // FAB nueva pericia
  q('per-btn-nueva')?.addEventListener('click', perAbrirModal);

  // Tabs
  q('per-tab-pipeline')?.addEventListener('click', () => perSetTab('pipeline'));
  q('per-tab-lista')?.addEventListener('click',    () => perSetTab('lista'));

  // Modal nuevo
  q('per-btn-guardar')?.addEventListener('click',         perGuardar);
  q('per-btn-cancelar-modal')?.addEventListener('click',  perCerrarModal);
  q('per-overlay')?.addEventListener('click', e => { if (e.target.id === 'per-overlay') perCerrarModal(); });

  // Modal detalle
  q('per-det-estado')?.addEventListener('change', e => perCambiarEstado(e.target.value));
  q('per-btn-eliminar')?.addEventListener('click',   perEliminar);
  q('per-btn-cerrar-det')?.addEventListener('click', perCerrarDetalle);
  q('per-overlay-det')?.addEventListener('click', e => { if (e.target.id === 'per-overlay-det') perCerrarDetalle(); });
}


/* ══════════════════════════════════════════
   CARGA DESDE SUPABASE
   ══════════════════════════════════════════ */
async function _perCargar() {
  const uid = await PsicoRouter.store.ensureUserId();
  if (!uid) return;
  const { data } = await sb.from('pericias')
    .select('*').eq('user_id', uid).order('created_at', { ascending: false });
  _perPericias = data || [];
  _perActualizarStats();
  _perRenderTab();
}


/* ══════════════════════════════════════════
   STATS
   ══════════════════════════════════════════ */
function _perActualizarStats() {
  const hoy  = new Date();
  const en15 = new Date(); en15.setDate(hoy.getDate() + 15);

  const enCurso  = _perPericias.filter(p => p.estado !== 'cobrado').length;
  const proxVenc = _perPericias.filter(p => {
    if (!p.fecha_vencimiento || p.estado === 'cobrado') return false;
    const fv = new Date(p.fecha_vencimiento);
    return fv >= hoy && fv <= en15;
  }).length;
  const honorarios = _perPericias
    .filter(p => p.estado !== 'cobrado')
    .reduce((s, p) => s + (p.honorarios || 0), 0);

  const el = id => document.getElementById(id);
  if (el('per-stat-encurso'))   el('per-stat-encurso').textContent    = enCurso;
  if (el('per-stat-venc'))      el('per-stat-venc').textContent       = proxVenc;
  if (el('per-stat-honorarios'))el('per-stat-honorarios').textContent = _perFmtPeso(honorarios);
}


/* ══════════════════════════════════════════
   TABS
   ══════════════════════════════════════════ */
window.perSetTab = function(t) {
  _perTabActual = t;
  ['pipeline','lista'].forEach(tab => {
    document.getElementById('per-tab-' + tab)?.classList.toggle('per-tab-active', tab === t);
  });
  _perRenderTab();
};

function _perRenderTab() {
  if (_perTabActual === 'pipeline') _perRenderPipeline();
  else _perRenderLista();
}


/* ══════════════════════════════════════════
   PIPELINE
   ══════════════════════════════════════════ */
function _perRenderPipeline() {
  const cont = document.getElementById('per-tab-content');
  const activas = _perPericias.filter(p => p.estado !== 'cobrado');
  if (!activas.length) {
    cont.innerHTML = `<div class="per-empty"><div class="per-empty-icon">⚖️</div><h3>Sin pericias activas</h3><p>Tocá + para registrar la primera.</p></div>`;
    return;
  }
  const grupos = {};
  activas.forEach(p => { if (!grupos[p.estado]) grupos[p.estado] = []; grupos[p.estado].push(p); });
  const orden = ['en_curso', 'entrevista', 'redaccion', 'presentado'];
  let html = '';
  orden.forEach(estado => {
    const items = grupos[estado];
    if (!items?.length) return;
    const est = PER_ESTADOS[estado] || PER_ESTADOS.en_curso;
    html += `<div class="per-stage ${est.cls}">
      <div class="per-stage-header">
        <div class="per-stage-badge"><div class="per-stage-dot"></div><div class="per-stage-name">${est.label}</div></div>
        <div class="per-stage-count">${items.length}</div>
      </div>`;
    items.forEach(p => { html += _perCardHtml(p, est); });
    html += `</div>`;
  });
  cont.innerHTML = html;
}

function _perRenderLista() {
  const cont = document.getElementById('per-tab-content');
  if (!_perPericias.length) {
    cont.innerHTML = `<div class="per-empty"><div class="per-empty-icon">📋</div><h3>Sin pericias registradas</h3></div>`;
    return;
  }
  let html = '<div style="padding:14px 0 0">';
  _perPericias.forEach(p => {
    const est = PER_ESTADOS[p.estado] || PER_ESTADOS.en_curso;
    html += _perCardHtml(p, est);
  });
  html += '</div>';
  cont.innerHTML = html;
}

function _perCardHtml(p, est) {
  const hoy   = new Date();
  const fv    = p.fecha_vencimiento ? new Date(p.fecha_vencimiento) : null;
  const dias  = fv ? Math.ceil((fv - hoy) / 86400000) : null;
  const alerta = dias !== null && dias <= 15 && dias >= 0;
  return `<div class="per-card ${est.cls}" onclick="perAbrirDetalle('${p.id}')">
    <div class="per-card-top">
      <div class="per-card-exp">📋 ${p.expediente || 'Sin nº'}</div>
      <div class="per-card-badge" style="background:${est.light || 'var(--primary-light)'};color:${est.color || 'var(--primary)'}">
        ${est.icon} ${est.label}
      </div>
    </div>
    <div class="per-card-caratula">${p.caratula || '—'}</div>
    <div class="per-card-meta">
      ${p.juzgado         ? `<div class="per-card-meta-item">⚖️ ${p.juzgado}</div>`                  : ''}
      ${p.peritado        ? `<div class="per-card-meta-item">👤 ${p.peritado}</div>`                  : ''}
      ${p.honorarios      ? `<div class="per-card-meta-item">💰 ${_perFmtPeso(p.honorarios)}</div>`  : ''}
      ${p.fecha_entrevista ? `<div class="per-card-meta-item">📅 ${_perFmtFecha(p.fecha_entrevista)}</div>` : ''}
    </div>
    ${alerta ? `<div class="per-alerta">⏰ Vence en ${dias} día${dias !== 1 ? 's' : ''}</div>` : ''}
  </div>`;
}


/* ══════════════════════════════════════════
   MODAL NUEVA PERICIA
   ══════════════════════════════════════════ */
window.perAbrirModal = function() {
  ['per-f-expediente','per-f-juzgado','per-f-caratula','per-f-peritado',
   'per-f-entrevista','per-f-vencimiento','per-f-notas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const hon = document.getElementById('per-f-honorarios');
  if (hon) hon.value = '';
  const est = document.getElementById('per-f-estado');
  if (est) est.value = 'en_curso';
  const err = document.getElementById('per-msg-error');
  if (err) err.style.display = 'none';
  document.getElementById('per-overlay').classList.add('per-open');
};

function perCerrarModal() {
  document.getElementById('per-overlay').classList.remove('per-open');
}

async function perGuardar() {
  const expediente = document.getElementById('per-f-expediente').value.trim();
  const caratula   = document.getElementById('per-f-caratula').value.trim();
  if (!expediente || !caratula) {
    const err = document.getElementById('per-msg-error');
    err.textContent = 'Expediente y carátula son obligatorios.';
    err.style.display = 'block';
    return;
  }
  const btn = document.getElementById('per-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    const uid = PsicoRouter.store.userId;
    const hon = document.getElementById('per-f-honorarios').value;
    const { error } = await sb.from('pericias').insert({
      user_id:           uid,
      expediente,
      caratula,
      juzgado:           document.getElementById('per-f-juzgado').value.trim()    || null,
      peritado:          document.getElementById('per-f-peritado').value.trim()   || null,
      fecha_entrevista:  document.getElementById('per-f-entrevista').value        || null,
      fecha_vencimiento: document.getElementById('per-f-vencimiento').value       || null,
      honorarios:        hon ? parseFloat(hon) : null,
      estado:            document.getElementById('per-f-estado').value,
      notas:             document.getElementById('per-f-notas').value.trim()      || null,
    });
    if (error) throw new Error(error.message);
    perCerrarModal();
    await _perCargar();
  } catch(e) {
    const err = document.getElementById('per-msg-error');
    err.textContent = 'Error al guardar: ' + e.message;
    err.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = '✓ Guardar pericia';
  }
}


/* ══════════════════════════════════════════
   MODAL DETALLE
   ══════════════════════════════════════════ */
window.perAbrirDetalle = function(id) {
  _perSeleccionada = _perPericias.find(p => p.id === id);
  if (!_perSeleccionada) return;
  const p   = _perSeleccionada;
  const est = PER_ESTADOS[p.estado] || PER_ESTADOS.en_curso;

  document.getElementById('per-det-content').innerHTML = `
    <div style="font-size:20px;font-weight:800;margin-bottom:2px">📋 ${p.expediente || 'Sin nº'}</div>
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:14px">${p.caratula || '—'}</div>
    <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;
      background:${est.light || 'var(--primary-light)'};color:${est.color || 'var(--primary)'};
      font-size:12px;font-weight:700;margin-bottom:16px">${est.icon} ${est.label}</div>
    ${_perFilaDet('⚖️', 'Juzgado',         p.juzgado            || '—')}
    ${_perFilaDet('👤', 'Peritado',         p.peritado           || '—')}
    ${p.fecha_entrevista  ? _perFilaDet('📅', 'Fecha entrevista',  _perFmtFecha(p.fecha_entrevista))  : ''}
    ${p.fecha_vencimiento ? _perFilaDet('⏰', 'Vencimiento',       _perFmtFecha(p.fecha_vencimiento)) : ''}
    ${p.honorarios        ? _perFilaDet('💰', 'Honorarios',        _perFmtPeso(p.honorarios))         : ''}
    ${p.notas             ? _perFilaDet('📝', 'Notas',             p.notas)                           : ''}
  `;

  const sel = document.getElementById('per-det-estado');
  if (sel) sel.value = p.estado;
  document.getElementById('per-overlay-det').classList.add('per-open');
};

function perCerrarDetalle() {
  document.getElementById('per-overlay-det').classList.remove('per-open');
  _perSeleccionada = null;
}

async function perCambiarEstado(nuevoEstado) {
  if (!_perSeleccionada) return;
  await sb.from('pericias').update({ estado: nuevoEstado }).eq('id', _perSeleccionada.id);
  perCerrarDetalle();
  await _perCargar();
}

async function perEliminar() {
  if (!_perSeleccionada) return;
  if (!confirm(`¿Eliminar la pericia "${_perSeleccionada.expediente}"?`)) return;
  await sb.from('pericias').delete().eq('id', _perSeleccionada.id);
  perCerrarDetalle();
  await _perCargar();
}


/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
function _perFmtFecha(f) {
  if (!f) return '—';
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
}

function _perFmtPeso(n) {
  if (!n) return '$0';
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return '$' + Math.round(n / 1000) + 'k';
  return '$' + n;
}

function _perFilaDet(icon, label, val) {
  return `<div class="per-det-fila">
    <div class="per-det-fila-icon">${icon}</div>
    <div><div class="per-det-fila-label">${label}</div><div class="per-det-fila-val">${val}</div></div>
  </div>`;
}


/* ══════════════════════════════════════════
   REGISTRO EN EL ROUTER
   ══════════════════════════════════════════ */
PsicoRouter.register('pericias', {

  init(container) {
    _perRenderHTML(container);
    _perBindEvents();
  },

  async onEnter() {
    _perTabActual = 'pipeline';
    // Resetear tab activo visualmente
    document.getElementById('per-tab-pipeline')?.classList.add('per-tab-active');
    document.getElementById('per-tab-lista')?.classList.remove('per-tab-active');
    await _perCargar();
  },

  onLeave() {
    perCerrarModal();
    perCerrarDetalle();
  },
});

/* Compatibilidad legacy */
window.onViewEnter_pericias = () => PsicoRouter.navigate('pericias');

/* Exponer para onclick en HTML generado */
window.perGuardar        = perGuardar;
window.perCerrarModal    = perCerrarModal;
window.perCerrarDetalle  = perCerrarDetalle;
window.perCambiarEstado  = perCambiarEstado;
window.perEliminar       = perEliminar;
