let pagosInitialized = false;
/**
 * view-pagos.js — PsicoApp SPA
 * Conectado a Supabase: tabla `pagos` (id, user_id, paciente_id, turno_id, monto, fecha, metodo)
 * Tabla `pacientes` para el selector.
 */

(function injectPagosStyles() {
  if (document.getElementById('view-pagos-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-pagos-styles';
  style.textContent = `
#view-pagos { min-height: 100vh; background: var(--bg); }

/* ── HEADER ── */
#view-pagos .pv-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 50;
  box-shadow: var(--shadow-sm);
}
#view-pagos .pv-header-top {
  display: flex; align-items: center;
  padding: 14px 18px 10px; gap: 10px;
}
#view-pagos .pv-header-title {
  flex: 1; text-align: center;
  font-size: 16px; font-weight: 800; color: var(--text);
}
#view-pagos .pv-month-nav-row {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 6px 16px 12px;
}
#view-pagos .pv-month-btn {
  width: 32px; height: 32px; border-radius: 10px;
  border: 1.5px solid var(--border); background: var(--bg);
  font-size: 18px; cursor: pointer; color: var(--text);
  display: flex; align-items: center; justify-content: center;
}
#view-pagos .pv-month-label {
  font-size: 15px; font-weight: 800; color: var(--text); min-width: 160px; text-align: center;
}

/* ── BALANCE CARD ── */
#view-pagos .pv-balance-card {
  margin: -1px 16px 0; position: relative; z-index: 5;
  background: linear-gradient(135deg, #1E1040 0%, #2D1B69 60%, #4C2A9A 100%);
  border-radius: 0 0 var(--radius) var(--radius);
  padding: 20px 20px 18px;
  color: white;
}
#view-pagos .pv-balance-label { font-size: 11px; font-weight: 700; opacity: .65; text-transform: uppercase; letter-spacing: 1px; }
#view-pagos .pv-balance-amount { font-size: 34px; font-weight: 800; margin: 4px 0 2px; }
#view-pagos .pv-balance-sub { font-size: 12px; opacity: .65; margin-bottom: 14px; }
#view-pagos .pv-chips {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
}
#view-pagos .pv-chip {
  background: rgba(255,255,255,.1); border-radius: 10px;
  padding: 8px 6px; text-align: center;
}
#view-pagos .pv-chip-label { font-size: 9px; font-weight: 700; opacity: .65; margin-bottom: 3px; text-transform: uppercase; }
#view-pagos .pv-chip-val { font-size: 13px; font-weight: 800; }
#view-pagos .pv-green  { color: #34D399; }
#view-pagos .pv-orange { color: #FBBF24; }

/* ── FILTROS ── */
#view-pagos .pv-filter-bar {
  display: flex; gap: 8px; padding: 14px 16px 6px;
  overflow-x: auto; scrollbar-width: none;
}
#view-pagos .pv-filter-bar::-webkit-scrollbar { display: none; }
#view-pagos .pv-fchip {
  padding: 6px 14px; border-radius: 20px;
  font-size: 12px; font-weight: 700; white-space: nowrap;
  cursor: pointer; border: 1.5px solid var(--border);
  background: var(--bg); color: var(--text-muted);
  font-family: var(--font); transition: all .15s;
}
#view-pagos .pv-fchip.on {
  background: var(--primary); color: white; border-color: var(--primary);
}

/* ── LISTA ── */
#view-pagos .pv-list-wrap { padding: 6px 16px 100px; }
#view-pagos .pv-date-group {
  font-size: 11px; font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .8px;
  padding: 12px 4px 6px;
}
#view-pagos .pv-card {
  background: var(--surface); border-radius: var(--radius-sm);
  padding: 13px 14px; display: flex; align-items: center; gap: 12px;
  box-shadow: var(--shadow-sm); margin-bottom: 8px;
  cursor: pointer; transition: transform .12s;
  border-left: 3px solid transparent;
}
#view-pagos .pv-card:hover { transform: translateX(2px); }
#view-pagos .pv-card.pv-pendiente { border-left-color: #FBBF24; opacity: .85; }
#view-pagos .pv-card-icon {
  width: 38px; height: 38px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
}
#view-pagos .pv-icon-efectivo      { background: #D1FAE5; }
#view-pagos .pv-icon-transferencia { background: #DBEAFE; }
#view-pagos .pv-icon-mercado_pago  { background: #EDE9FE; }
#view-pagos .pv-card-info { flex: 1; min-width: 0; }
#view-pagos .pv-card-nombre { font-size: 14px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#view-pagos .pv-card-meta  { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
#view-pagos .pv-card-monto { font-size: 16px; font-weight: 800; color: var(--text); flex-shrink: 0; }
#view-pagos .pv-monto-pend { color: #FBBF24; }

/* ── EMPTY / LOADING ── */
#view-pagos .pv-empty {
  text-align: center; padding: 48px 24px;
  color: var(--text-muted);
}
#view-pagos .pv-empty-icon { font-size: 48px; margin-bottom: 12px; }
#view-pagos .pv-loading { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; }

/* ── FAB ── */
#view-pagos .pv-fab {
  position: fixed; bottom: 80px; right: 20px;
  width: 52px; height: 52px; background: var(--primary);
  border-radius: 16px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(91,47,168,.4);
  cursor: pointer; font-size: 28px; color: white; border: none; z-index: 40;
  transition: transform .15s;
}
#view-pagos .pv-fab:active { transform: scale(.93); }
@media (min-width: 768px) { #view-pagos .pv-fab { bottom: 24px; } }

/* ── TOAST ── */
#view-pagos .pv-toast {
  position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
  background: #1A1040; color: white; padding: 11px 22px;
  border-radius: 12px; font-size: 13px; font-weight: 600;
  z-index: 9999; display: none; white-space: nowrap;
}

/* ── OVERLAYS / MODALES ── */
.pv-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  z-index: 200; display: none; align-items: flex-end; justify-content: center;
}
.pv-overlay.open { display: flex; }
.pv-modal {
  background: var(--surface); border-radius: 28px 28px 0 0;
  padding: 20px 20px 40px;
  width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto;
  animation: pvSlideUp .25s ease;
}
@keyframes pvSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.pv-modal-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 20px; }
.pv-modal-title { font-size: 20px; font-weight: 800; margin-bottom: 4px; color: var(--text); }
.pv-modal-sub   { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }

/* Form */
.pv-field { margin-bottom: 14px; }
.pv-field-label {
  font-size: 11px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;
}
.pv-req { color: var(--primary); }
.pv-input {
  width: 100%; border: 1.5px solid var(--border); border-radius: 14px;
  padding: 14px 16px; font-size: 15px; font-family: var(--font);
  color: var(--text); background: var(--bg); outline: none;
}
.pv-input:focus { border-color: var(--primary); }
.pv-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.pv-btn-guardar {
  width: 100%; background: var(--primary); color: white;
  border: none; border-radius: 14px; padding: 16px;
  font-size: 15px; font-weight: 700; font-family: var(--font);
  cursor: pointer; margin-top: 4px;
}
.pv-btn-guardar:disabled { opacity: .6; cursor: not-allowed; }
.pv-btn-cancel {
  width: 100%; background: none; border: none; padding: 14px;
  font-size: 14px; color: var(--text-muted); font-family: var(--font); cursor: pointer; margin-top: 4px;
}
.pv-msg-error {
  background: #fdf0ef; color: #B94A48; border: 1px solid #f0c8c7;
  border-radius: 10px; padding: 10px 14px; font-size: 13px;
  margin-bottom: 12px; display: none;
}

/* Detalle */
.pv-det-monto { font-size: 28px; font-weight: 800; margin-bottom: 4px; color: var(--text); }
.pv-det-pac   { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
.pv-det-rows  { display: flex; flex-direction: column; gap: 10px; }
.pv-det-row   { display: flex; justify-content: space-between; font-size: 14px; }
.pv-det-row span:first-child { color: var(--text-muted); }
.pv-det-row span:last-child  { font-weight: 700; }
.pv-det-actions { display: flex; gap: 10px; margin-top: 20px; }
.pv-btn-det { flex: 1; padding: 13px; border-radius: 12px; border: none; font-family: var(--font); font-size: 13px; font-weight: 700; cursor: pointer; }
.pv-btn-del   { background: #fdf0ef; color: #B94A48; }
.pv-btn-pagar { background: var(--primary-light); color: var(--primary); }
  `;
  document.head.appendChild(style);
})();


/* ════════════════════════════════════════
   ESTADO INTERNO
   ════════════════════════════════════════ */
let _pv_pagos      = [];   // array de pagos desde Supabase
let _pv_pacientes  = [];   // array de pacientes para el selector
let _pv_userId     = null;
let _pv_mesActual  = new Date().getMonth();
let _pv_anio       = new Date().getFullYear();
let _pv_filtro     = 'todos';
let _pv_sel        = null; // pago seleccionado para detalle
let _pv_container  = null;

const MESES        = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const METODO_ICON  = { efectivo: '💵', transferencia: '🏦', mercado_pago: '📲' };
const METODO_LABEL = { efectivo: 'Efectivo', transferencia: 'Transferencia', mercado_pago: 'Mercado Pago' };


/* ════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════ */
function _pvFmt(v) { return '$' + Number(v || 0).toLocaleString('es-AR'); }

function _pvToast(msg) {
  const t = _pv_container?.querySelector('#pv-toast');
  if (!t) return;
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function _pvNombrePaciente(paciente_id) {
  const p = _pv_pacientes.find(x => x.id === paciente_id);
  if (!p) return 'Paciente';
  return `${p.nombre || ''} ${p.apellido || ''}`.trim();
}


/* ════════════════════════════════════════
   CARGA DESDE SUPABASE
   ════════════════════════════════════════ */
async function _pvCargarTodo() {
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    _pv_userId = user.id;

    const [resPagos, resPacientes] = await Promise.all([
      sb.from('pagos')
        .select('id, paciente_id, turno_id, monto, fecha, metodo')
        .eq('user_id', _pv_userId)
        .order('fecha', { ascending: false }),
      sb.from('pacientes')
        .select('id, nombre, apellido')
        .eq('user_id', _pv_userId)
        .order('apellido')
    ]);

    _pv_pagos     = resPagos.data     || [];
    _pv_pacientes = resPacientes.data || [];

    _pvRellenarSelectPaciente();
    _pvRenderResumen();
    _pvRenderLista();
  } catch(e) {
    console.error('[Pagos] cargarTodo:', e.message);
  }
}

function _pvRellenarSelectPaciente() {
  const sel = _pv_container?.querySelector('#pv-f-paciente');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Seleccioná un paciente —</option>';
  _pv_pacientes.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = `${p.apellido || ''}, ${p.nombre || ''}`.replace(/^,\s*/, '');
    sel.appendChild(o);
  });
}


/* ════════════════════════════════════════
   RENDER RESUMEN
   ════════════════════════════════════════ */
function _pvRenderResumen() {
  const el = _pv_container?.querySelector('#pagos-balance');
  if (!el) return;

  const del_mes = _pv_pagos.filter(p => {
    if (!p.fecha) return false;
    const d = new Date(p.fecha + 'T12:00:00');
    return d.getMonth() === _pv_mesActual && d.getFullYear() === _pv_anio;
  });

  // En Supabase los pagos no tienen campo estado propio —
  // todo registro = cobrado. Mostramos totales por método.
  const total     = del_mes.reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const efectivo  = del_mes.filter(p => p.metodo === 'efectivo').reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const transf    = del_mes.filter(p => p.metodo === 'transferencia').reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const mp        = del_mes.filter(p => p.metodo === 'mercado_pago').reduce((s, p) => s + (Number(p.monto) || 0), 0);

  el.innerHTML = `
    <div class="pv-balance-label">Total cobrado</div>
    <div class="pv-balance-amount">${_pvFmt(total)}</div>
    <div class="pv-balance-sub">${del_mes.length} pago${del_mes.length !== 1 ? 's' : ''} · ${MESES[_pv_mesActual]} ${_pv_anio}</div>
    <div class="pv-chips">
      <div class="pv-chip">
        <div class="pv-chip-label">Pagos</div>
        <div class="pv-chip-val">${del_mes.length}</div>
      </div>
      <div class="pv-chip">
        <div class="pv-chip-label">Efectivo</div>
        <div class="pv-chip-val pv-green">${_pvFmt(efectivo)}</div>
      </div>
      <div class="pv-chip">
        <div class="pv-chip-label">Transf.</div>
        <div class="pv-chip-val pv-green">${_pvFmt(transf)}</div>
      </div>
      <div class="pv-chip">
        <div class="pv-chip-label">MP</div>
        <div class="pv-chip-val pv-green">${_pvFmt(mp)}</div>
      </div>
    </div>`;
}


/* ════════════════════════════════════════
   RENDER LISTA
   ════════════════════════════════════════ */
function _pvRenderLista() {
  const el = _pv_container?.querySelector('#pagos-list');
  if (!el) return;

  let lista = _pv_pagos.filter(p => {
    if (!p.fecha) return false;
    const d = new Date(p.fecha + 'T12:00:00');
    return d.getMonth() === _pv_mesActual && d.getFullYear() === _pv_anio;
  });

  // Filtro por método
  if (_pv_filtro !== 'todos') {
    lista = lista.filter(p => p.metodo === _pv_filtro);
  }

  lista.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  if (!lista.length) {
    el.innerHTML = `
      <div class="pv-empty">
        <div class="pv-empty-icon">💰</div>
        <p>Sin pagos registrados este mes</p>
      </div>`;
    return;
  }

  // Agrupar por fecha
  const grupos = {};
  lista.forEach(p => {
    if (!grupos[p.fecha]) grupos[p.fecha] = [];
    grupos[p.fecha].push(p);
  });

  el.innerHTML = Object.entries(grupos).map(([fecha, items]) => {
    const fLabel = new Date(fecha + 'T12:00:00')
      .toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
    return `
      <div class="pv-date-group">${fLabel}</div>
      ${items.map(p => `
        <div class="pv-card pv-met-${p.metodo}" data-id="${p.id}">
          <div class="pv-card-icon pv-icon-${p.metodo}">${METODO_ICON[p.metodo] || '💰'}</div>
          <div class="pv-card-info">
            <div class="pv-card-nombre">${_pvNombrePaciente(p.paciente_id)}</div>
            <div class="pv-card-meta">${METODO_LABEL[p.metodo] || p.metodo}</div>
          </div>
          <div class="pv-card-monto">${_pvFmt(p.monto)}</div>
        </div>`).join('')}`;
  }).join('');

  el.querySelectorAll('.pv-card').forEach(card => {
    card.addEventListener('click', () => _pvAbrirDetalle(card.dataset.id));
  });
}


/* ════════════════════════════════════════
   GUARDAR PAGO (Supabase)
   ════════════════════════════════════════ */
async function _pvHandleSubmit() {
  const err        = _pv_container.querySelector('#pv-msg-error');
  const paciente_id = _pv_container.querySelector('#pv-f-paciente').value;
  const monto      = _pv_container.querySelector('#pv-f-monto').value;
  const metodo     = _pv_container.querySelector('#pv-f-metodo').value;
  const fecha      = _pv_container.querySelector('#pv-f-fecha').value;

  err.style.display = 'none';
  if (!paciente_id)              { err.textContent = 'Seleccioná un paciente'; err.style.display = 'block'; return; }
  if (!monto || Number(monto) <= 0) { err.textContent = 'Ingresá un monto válido'; err.style.display = 'block'; return; }
  if (!fecha)                    { err.textContent = 'Seleccioná una fecha'; err.style.display = 'block'; return; }

  const btn = _pv_container.querySelector('#pv-btn-guardar');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  try {
    const { error } = await sb.from('pagos').insert({
      user_id: _pv_userId,
      paciente_id,
      monto: Number(monto),
      metodo,
      fecha,
    });
    if (error) throw error;

    _pv_container.querySelector('#pv-overlay').classList.remove('open');
    _pv_container.querySelector('#pv-f-paciente').value = '';
    _pv_container.querySelector('#pv-f-monto').value    = '';
    _pv_container.querySelector('#pv-f-fecha').value    = new Date().toISOString().split('T')[0];

    _pvToast('✅ Pago registrado');
    await _pvCargarTodo();
  } catch(e) {
    err.textContent = 'Error al guardar: ' + e.message;
    err.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = '✓ Guardar pago';
  }
}


/* ════════════════════════════════════════
   DETALLE / ELIMINAR
   ════════════════════════════════════════ */
function _pvAbrirDetalle(id) {
  _pv_sel = _pv_pagos.find(p => p.id === id);
  if (!_pv_sel) return;
  const p = _pv_sel;
  const fecha = new Date(p.fecha + 'T12:00:00')
    .toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

  _pv_container.querySelector('#pv-det-content').innerHTML = `
    <div class="pv-det-monto">${_pvFmt(p.monto)}</div>
    <div class="pv-det-pac">${_pvNombrePaciente(p.paciente_id)} · ${fecha}</div>
    <div class="pv-det-rows">
      <div class="pv-det-row"><span>Método</span><span>${METODO_ICON[p.metodo] || ''} ${METODO_LABEL[p.metodo] || p.metodo}</span></div>
      <div class="pv-det-row"><span>Fecha</span><span>${fecha}</span></div>
      <div class="pv-det-row"><span>Monto</span><span>${_pvFmt(p.monto)}</span></div>
    </div>`;
  _pv_container.querySelector('#pv-overlay-det').classList.add('open');
}

function _pvCerrarDetalle() {
  _pv_container?.querySelector('#pv-overlay-det')?.classList.remove('open');
  _pv_sel = null;
}

async function _pvEliminar() {
  if (!_pv_sel) return;
  if (!confirm('¿Eliminar este pago?')) return;
  try {
    const { error } = await sb.from('pagos').delete().eq('id', _pv_sel.id);
    if (error) throw error;
    _pvCerrarDetalle();
    _pvToast('🗑 Pago eliminado');
    await _pvCargarTodo();
  } catch(e) {
    _pvToast('⚠️ Error: ' + e.message);
  }
}


/* ════════════════════════════════════════
   RENDER HTML + INIT
   ════════════════════════════════════════ */
function initPagos() {
  _pv_container = document.getElementById('view-pagos');
  if (!_pv_container) return;

  _pv_mesActual = new Date().getMonth();
  _pv_anio      = new Date().getFullYear();
  _pv_filtro    = 'todos';

  if (!pagosInitialized) {
    _pv_container.innerHTML = `
<div class="pv-header">
  <div class="pv-header-top">
    <div class="pv-header-title">💰 Pagos</div>
  </div>
  <div class="pv-month-nav-row">
    <button class="pv-month-btn" id="pv-mes-prev">‹</button>
    <div class="pv-month-label" id="pv-month-label">${MESES[_pv_mesActual]} ${_pv_anio}</div>
    <button class="pv-month-btn" id="pv-mes-next">›</button>
  </div>
</div>

<div class="pv-balance-card">
  <div id="pagos-balance">
    <div class="pv-balance-label">Total cobrado</div>
    <div class="pv-balance-amount">⏳ Cargando…</div>
  </div>
</div>

<div class="pv-filter-bar">
  <div class="pv-fchip on"  data-filtro="todos">Todos</div>
  <div class="pv-fchip" data-filtro="efectivo">💵 Efectivo</div>
  <div class="pv-fchip" data-filtro="transferencia">🏦 Transferencia</div>
  <div class="pv-fchip" data-filtro="mercado_pago">📲 Mercado Pago</div>
</div>

<div class="pv-list-wrap">
  <div id="pagos-list">
    <div class="pv-loading">⏳ Cargando pagos…</div>
  </div>
</div>

<button class="pv-fab" id="pv-fab-btn">＋</button>
<div class="pv-toast" id="pv-toast"></div>

<!-- MODAL NUEVO PAGO -->
<div class="pv-overlay" id="pv-overlay">
  <div class="pv-modal">
    <div class="pv-modal-handle"></div>
    <div class="pv-modal-title">💰 Registrar pago</div>
    <div class="pv-modal-sub">Registrá el cobro de una sesión.</div>
    <div class="pv-msg-error" id="pv-msg-error"></div>
    <div class="pv-field">
      <div class="pv-field-label">Paciente <span class="pv-req">*</span></div>
      <select class="pv-input" id="pv-f-paciente">
        <option value="">— Seleccioná un paciente —</option>
      </select>
    </div>
    <div class="pv-two-col">
      <div class="pv-field">
        <div class="pv-field-label">Monto <span class="pv-req">*</span></div>
        <input class="pv-input" id="pv-f-monto" type="number" placeholder="0" min="0">
      </div>
      <div class="pv-field">
        <div class="pv-field-label">Fecha <span class="pv-req">*</span></div>
        <input class="pv-input" id="pv-f-fecha" type="date" value="${new Date().toISOString().split('T')[0]}">
      </div>
    </div>
    <div class="pv-field">
      <div class="pv-field-label">Método de pago</div>
      <select class="pv-input" id="pv-f-metodo">
        <option value="efectivo">💵 Efectivo</option>
        <option value="transferencia">🏦 Transferencia</option>
        <option value="mercado_pago">📲 Mercado Pago</option>
      </select>
    </div>
    <button class="pv-btn-guardar" id="pv-btn-guardar">✓ Guardar pago</button>
    <button class="pv-btn-cancel" id="pv-btn-cancel-modal">Cancelar</button>
  </div>
</div>

<!-- MODAL DETALLE -->
<div class="pv-overlay" id="pv-overlay-det">
  <div class="pv-modal">
    <div class="pv-modal-handle"></div>
    <div id="pv-det-content"></div>
    <div class="pv-det-actions">
      <button class="pv-btn-det pv-btn-del" id="pv-btn-eliminar">🗑 Eliminar</button>
    </div>
    <button class="pv-btn-cancel" id="pv-btn-cancel-det">Cerrar</button>
  </div>
</div>`;
    pagosInitialized = true;
  }

  /* ── Event listeners ── */
  _pv_container.querySelector('#pv-mes-prev').addEventListener('click', () => {
    _pv_mesActual--;
    if (_pv_mesActual < 0) { _pv_mesActual = 11; _pv_anio--; }
    _pv_container.querySelector('#pv-month-label').textContent = `${MESES[_pv_mesActual]} ${_pv_anio}`;
    _pvRenderResumen(); _pvRenderLista();
  });

  _pv_container.querySelector('#pv-mes-next').addEventListener('click', () => {
    _pv_mesActual++;
    if (_pv_mesActual > 11) { _pv_mesActual = 0; _pv_anio++; }
    _pv_container.querySelector('#pv-month-label').textContent = `${MESES[_pv_mesActual]} ${_pv_anio}`;
    _pvRenderResumen(); _pvRenderLista();
  });

  _pv_container.querySelectorAll('.pv-fchip').forEach(chip => {
    chip.addEventListener('click', () => {
      _pv_filtro = chip.dataset.filtro;
      _pv_container.querySelectorAll('.pv-fchip').forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      _pvRenderLista();
    });
  });

  _pv_container.querySelector('#pv-fab-btn').addEventListener('click', () => {
    _pv_container.querySelector('#pv-overlay').classList.add('open');
  });
  _pv_container.querySelector('#pv-btn-cancel-modal').addEventListener('click', () => {
    _pv_container.querySelector('#pv-overlay').classList.remove('open');
  });
  _pv_container.querySelector('#pv-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) _pv_container.querySelector('#pv-overlay').classList.remove('open');
  });

  _pv_container.querySelector('#pv-btn-guardar').addEventListener('click', _pvHandleSubmit);
  _pv_container.querySelector('#pv-btn-cancel-det').addEventListener('click', _pvCerrarDetalle);
  _pv_container.querySelector('#pv-btn-eliminar').addEventListener('click', _pvEliminar);
  _pv_container.querySelector('#pv-overlay-det').addEventListener('click', e => {
    if (e.target === e.currentTarget) _pvCerrarDetalle();
  });

  /* ── Cargar datos de Supabase ── */
  _pvCargarTodo();
}

window.onViewEnter_pagos = initPagos;
