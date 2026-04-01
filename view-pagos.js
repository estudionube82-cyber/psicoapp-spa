/**
 * view-pagos.js — PsicoApp SPA (refactorizado)
 * Registrado en PsicoRouter con ciclo de vida: init / onEnter / onLeave
 * Supabase: tabla `pagos` (id, user_id, paciente_id, monto, fecha, metodo)
 */

/* ══════════════════════════════════════════
   ESTILOS — inyectados una sola vez
   ══════════════════════════════════════════ */
(function injectPagosStyles() {
  if (document.getElementById('view-pagos-styles')) return;
  const s = document.createElement('style');
  s.id = 'view-pagos-styles';
  s.textContent = `
#view-pagos { min-height: 100vh; background: var(--bg); }
#view-pagos .pv-header { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 50; box-shadow: var(--shadow-sm); }
#view-pagos .pv-header-top { display: flex; align-items: center; padding: 14px 18px 10px; gap: 10px; }
#view-pagos .pv-header-title { flex: 1; text-align: center; font-size: 16px; font-weight: 800; color: var(--text); }
#view-pagos .pv-month-nav-row { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 6px 16px 12px; }
#view-pagos .pv-month-btn { width: 32px; height: 32px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--bg); font-size: 18px; cursor: pointer; color: var(--text); display: flex; align-items: center; justify-content: center; }
#view-pagos .pv-month-label { font-size: 15px; font-weight: 800; color: var(--text); min-width: 160px; text-align: center; }
#view-pagos .pv-balance-card { margin: -1px 16px 0; position: relative; z-index: 5; background: linear-gradient(135deg,#1E1040 0%,#2D1B69 60%,#4C2A9A 100%); border-radius: 0 0 var(--radius) var(--radius); padding: 20px 20px 18px; color: white; }
#view-pagos .pv-balance-label { font-size: 11px; font-weight: 700; opacity: .65; text-transform: uppercase; letter-spacing: 1px; }
#view-pagos .pv-balance-amount { font-size: 34px; font-weight: 800; margin: 4px 0 2px; }
#view-pagos .pv-balance-sub { font-size: 12px; opacity: .65; margin-bottom: 14px; }
#view-pagos .pv-chips { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
#view-pagos .pv-chip { background: rgba(255,255,255,.1); border-radius: 10px; padding: 8px 6px; text-align: center; }
#view-pagos .pv-chip-label { font-size: 9px; font-weight: 700; opacity: .65; margin-bottom: 3px; text-transform: uppercase; }
#view-pagos .pv-chip-val { font-size: 13px; font-weight: 800; }
#view-pagos .pv-green { color: #34D399; }
#view-pagos .pv-filter-bar { display: flex; gap: 8px; padding: 14px 16px 6px; overflow-x: auto; scrollbar-width: none; }
#view-pagos .pv-filter-bar::-webkit-scrollbar { display: none; }
#view-pagos .pv-fchip { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; cursor: pointer; border: 1.5px solid var(--border); background: var(--bg); color: var(--text-muted); font-family: var(--font); transition: all .15s; }
#view-pagos .pv-fchip.on { background: var(--primary); color: white; border-color: var(--primary); }
#view-pagos .pv-list-wrap { padding: 6px 16px 100px; }
#view-pagos .pv-date-group { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: .8px; padding: 12px 4px 6px; }
#view-pagos .pv-card { background: var(--surface); border-radius: var(--radius-sm); padding: 13px 14px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-sm); margin-bottom: 8px; cursor: pointer; transition: transform .12s; border-left: 3px solid transparent; }
#view-pagos .pv-card:hover { transform: translateX(2px); }
#view-pagos .pv-card-icon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
#view-pagos .pv-icon-efectivo { background: rgba(124,58,237,0.12); }
#view-pagos .pv-icon-transferencia { background: rgba(124,58,237,0.15); }
#view-pagos .pv-icon-mercado_pago { background: rgba(124,58,237,0.18); }
#view-pagos .pv-card-info { flex: 1; min-width: 0; }
#view-pagos .pv-card-nombre { font-size: 14px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#view-pagos .pv-card-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
#view-pagos .pv-card-monto { font-size: 16px; font-weight: 800; color: var(--text); flex-shrink: 0; }
#view-pagos .pv-empty { text-align: center; padding: 48px 24px; color: var(--text-muted); }
#view-pagos .pv-empty-icon { font-size: 48px; margin-bottom: 12px; }
#view-pagos .pv-loading { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; }
#view-pagos .pv-fab { position: fixed; bottom: 80px; right: 20px; width: 52px; height: 52px; background: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(91,47,168,.4); cursor: pointer; font-size: 28px; color: white; border: none; z-index: 40; transition: transform .15s; }
#view-pagos .pv-fab:active { transform: scale(.93); }
@media (min-width: 768px) { #view-pagos .pv-fab { bottom: 24px; } }
#view-pagos .pv-toast { position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%); background: #1A1040; color: white; padding: 11px 22px; border-radius: 12px; font-size: 13px; font-weight: 600; z-index: 9999; display: none; white-space: nowrap; }
.pv-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 200; display: none; align-items: flex-end; justify-content: center; }
.pv-overlay.open { display: flex; }
.pv-modal { background: var(--surface); border-radius: 28px 28px 0 0; padding: 20px 20px 40px; width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto; animation: pvSlideUp .25s ease; }
@keyframes pvSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.pv-modal-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 20px; }
.pv-modal-title { font-size: 20px; font-weight: 800; margin-bottom: 4px; color: var(--text); }
.pv-modal-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
.pv-field { margin-bottom: 14px; }
.pv-field-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.pv-req { color: var(--primary); }
.pv-input { width: 100%; border: 1.5px solid var(--border); border-radius: 14px; padding: 14px 16px; font-size: 15px; font-family: var(--font); color: var(--text); background: var(--bg); outline: none; }
.pv-input:focus { border-color: var(--primary); }
.pv-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.pv-btn-guardar { width: 100%; background: var(--primary); color: white; border: none; border-radius: 14px; padding: 16px; font-size: 15px; font-weight: 700; font-family: var(--font); cursor: pointer; margin-top: 4px; }
.pv-btn-guardar:disabled { opacity: .6; cursor: not-allowed; }
.pv-btn-cancel { width: 100%; background: none; border: none; padding: 14px; font-size: 14px; color: var(--text-muted); font-family: var(--font); cursor: pointer; margin-top: 4px; }
.pv-msg-error { background: #fdf0ef; color: #B94A48; border: 1px solid #f0c8c7; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 12px; display: none; }
.pv-det-monto { font-size: 28px; font-weight: 800; margin-bottom: 4px; color: var(--text); }
.pv-det-pac { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
.pv-det-rows { display: flex; flex-direction: column; gap: 10px; }
.pv-det-row { display: flex; justify-content: space-between; font-size: 14px; }
.pv-det-row span:first-child { color: var(--text-muted); }
.pv-det-row span:last-child { font-weight: 700; }
.pv-det-actions { display: flex; gap: 10px; margin-top: 20px; }
.pv-btn-det { flex: 1; padding: 13px; border-radius: 12px; border: none; font-family: var(--font); font-size: 13px; font-weight: 700; cursor: pointer; }
.pv-btn-del { background: #fdf0ef; color: #B94A48; }
  `;
  document.head.appendChild(s);
})();


/* ══════════════════════════════════════════
   CONSTANTES
   ══════════════════════════════════════════ */
const PV_MESES       = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const PV_METODO_ICON = { efectivo:'💵', transferencia:'🏦', mercado_pago:'📲' };
const PV_METODO_LBL  = { efectivo:'Efectivo', transferencia:'Transferencia', mercado_pago:'Mercado Pago' };


/* ══════════════════════════════════════════
   ESTADO INTERNO DEL MÓDULO
   ══════════════════════════════════════════ */
const _pv = {
  container:  null,
  pagos:      [],
  pacientes:  [],
  userId:     null,
  mes:        new Date().getMonth(),
  anio:       new Date().getFullYear(),
  filtro:     'todos',
  sel:        null,   // pago seleccionado para detalle
};


/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
const _pvFmt = v => '$' + Number(v || 0).toLocaleString('es-AR');

function _pvToast(msg) {
  const t = _pv.container?.querySelector('#pv-toast');
  if (!t) return;
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function _pvNombre(pid) {
  const p = _pv.pacientes.find(x => x.id === pid);
  return p ? `${p.nombre || ''} ${p.apellido || ''}`.trim() : 'Paciente';
}

function _pvQ(sel) { return _pv.container?.querySelector(sel); }


/* ══════════════════════════════════════════
   RENDER HTML (init — una sola vez)
   ══════════════════════════════════════════ */
function _pvRenderHTML(container) {
  container.innerHTML = `
<div class="pv-header">
  <div class="pv-header-top">
    <div class="pv-header-title">💰 Pagos</div>
  </div>
  <div class="pv-month-nav-row">
    <button class="pv-month-btn" id="pv-mes-prev">‹</button>
    <div class="pv-month-label" id="pv-month-label"></div>
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
  <div class="pv-fchip" data-filtro="transferencia">🏦 Transf.</div>
  <div class="pv-fchip" data-filtro="mercado_pago">📲 MP</div>
</div>

<div class="pv-list-wrap">
  <div id="pagos-list"><div class="pv-loading">⏳ Cargando pagos…</div></div>
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
        <input class="pv-input" id="pv-f-fecha" type="date">
      </div>
    </div>
    <div class="pv-field">
      <div class="pv-field-label">Método</div>
      <select class="pv-input" id="pv-f-metodo">
        <option value="efectivo">💵 Efectivo</option>
        <option value="transferencia">🏦 Transferencia</option>
        <option value="mercado_pago">📲 Mercado Pago</option>
      </select>
    </div>
    <button class="pv-btn-guardar" id="pv-btn-guardar">✓ Guardar pago</button>
    <button class="pv-btn-cancel"  id="pv-btn-cancel-modal">Cancelar</button>
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
}


/* ══════════════════════════════════════════
   LISTENERS (init — una sola vez)
   ══════════════════════════════════════════ */
function _pvBindEvents() {
  _pvQ('#pv-mes-prev').addEventListener('click', () => {
    _pv.mes--;
    if (_pv.mes < 0) { _pv.mes = 11; _pv.anio--; }
    _pvActualizarLabelMes();
    _pvRenderResumen(); _pvRenderLista();
  });

  _pvQ('#pv-mes-next').addEventListener('click', () => {
    _pv.mes++;
    if (_pv.mes > 11) { _pv.mes = 0; _pv.anio++; }
    _pvActualizarLabelMes();
    _pvRenderResumen(); _pvRenderLista();
  });

  _pv.container.querySelectorAll('.pv-fchip').forEach(chip => {
    chip.addEventListener('click', () => {
      _pv.filtro = chip.dataset.filtro;
      _pv.container.querySelectorAll('.pv-fchip').forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      _pvRenderLista();
    });
  });

  _pvQ('#pv-fab-btn').addEventListener('click', () => {
    // Resetear form
    _pvQ('#pv-f-fecha').value = new Date().toISOString().split('T')[0];
    _pvQ('#pv-f-monto').value = '';
    _pvQ('#pv-f-paciente').value = '';
    _pvQ('#pv-msg-error').style.display = 'none';
    _pvQ('#pv-overlay').classList.add('open');
  });

  _pvQ('#pv-btn-cancel-modal').addEventListener('click', () => _pvQ('#pv-overlay').classList.remove('open'));
  _pvQ('#pv-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) _pvQ('#pv-overlay').classList.remove('open'); });

  _pvQ('#pv-btn-guardar').addEventListener('click', _pvHandleSubmit);
  _pvQ('#pv-btn-cancel-det').addEventListener('click', _pvCerrarDetalle);
  _pvQ('#pv-btn-eliminar').addEventListener('click', _pvEliminar);
  _pvQ('#pv-overlay-det').addEventListener('click', e => { if (e.target === e.currentTarget) _pvCerrarDetalle(); });
}


/* ══════════════════════════════════════════
   CARGA DATOS DESDE SUPABASE
   ══════════════════════════════════════════ */
async function _pvCargarTodo() {
  /* Usar store global para pacientes (evita re-fetch si ya están cacheados) */
  _pv.pacientes = await PsicoRouter.store.ensurePacientes();
  _pv.userId    = PsicoRouter.store.userId;

  /* Los pagos siempre se re-cargan (datos financieros deben estar frescos) */
  const { data } = await sb.from('pagos')
    .select('id,paciente_id,monto,fecha,metodo')
    .eq('user_id', _pv.userId)
    .order('fecha', { ascending: false });

  _pv.pagos = data || [];

  _pvRellenarSelectPaciente();
  _pvRenderResumen();
  _pvRenderLista();
}

function _pvActualizarLabelMes() {
  const el = _pvQ('#pv-month-label');
  if (el) el.textContent = `${PV_MESES[_pv.mes]} ${_pv.anio}`;
}

function _pvRellenarSelectPaciente() {
  const sel = _pvQ('#pv-f-paciente');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Seleccioná un paciente —</option>';
  _pv.pacientes.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = `${p.apellido || ''}, ${p.nombre || ''}`.replace(/^,\s*/, '');
    sel.appendChild(o);
  });
}


/* ══════════════════════════════════════════
   RENDER RESUMEN
   ══════════════════════════════════════════ */
function _pvRenderResumen() {
  const el = _pvQ('#pagos-balance');
  if (!el) return;
  const del_mes = _pv.pagos.filter(p => {
    if (!p.fecha) return false;
    const d = new Date(p.fecha + 'T12:00:00');
    return d.getMonth() === _pv.mes && d.getFullYear() === _pv.anio;
  });
  const total  = del_mes.reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const ef     = del_mes.filter(p => p.metodo === 'efectivo').reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const tr     = del_mes.filter(p => p.metodo === 'transferencia').reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const mp     = del_mes.filter(p => p.metodo === 'mercado_pago').reduce((s, p) => s + (Number(p.monto) || 0), 0);
  el.innerHTML = `
    <div class="pv-balance-label">Total cobrado</div>
    <div class="pv-balance-amount">${_pvFmt(total)}</div>
    <div class="pv-balance-sub">${del_mes.length} pago${del_mes.length !== 1 ? 's' : ''} · ${PV_MESES[_pv.mes]} ${_pv.anio}</div>
    <div class="pv-chips">
      <div class="pv-chip"><div class="pv-chip-label">Total</div><div class="pv-chip-val">${del_mes.length}</div></div>
      <div class="pv-chip"><div class="pv-chip-label">Efectivo</div><div class="pv-chip-val pv-green">${_pvFmt(ef)}</div></div>
      <div class="pv-chip"><div class="pv-chip-label">Transf.</div><div class="pv-chip-val pv-green">${_pvFmt(tr)}</div></div>
      <div class="pv-chip"><div class="pv-chip-label">MP</div><div class="pv-chip-val pv-green">${_pvFmt(mp)}</div></div>
    </div>`;
}


/* ══════════════════════════════════════════
   RENDER LISTA
   ══════════════════════════════════════════ */
function _pvRenderLista() {
  const el = _pvQ('#pagos-list');
  if (!el) return;
  let lista = _pv.pagos.filter(p => {
    if (!p.fecha) return false;
    const d = new Date(p.fecha + 'T12:00:00');
    return d.getMonth() === _pv.mes && d.getFullYear() === _pv.anio;
  });
  if (_pv.filtro !== 'todos') lista = lista.filter(p => p.metodo === _pv.filtro);
  lista.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  if (!lista.length) {
    el.innerHTML = `<div class="pv-empty"><div class="pv-empty-icon">💰</div><p>Sin pagos registrados este mes</p></div>`;
    return;
  }

  const grupos = {};
  lista.forEach(p => { if (!grupos[p.fecha]) grupos[p.fecha] = []; grupos[p.fecha].push(p); });

  el.innerHTML = Object.entries(grupos).map(([fecha, items]) => {
    const fLabel = new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday:'short', day:'numeric', month:'short' });
    return `
      <div class="pv-date-group">${fLabel}</div>
      ${items.map(p => `
        <div class="pv-card" data-id="${p.id}">
          <div class="pv-card-icon pv-icon-${p.metodo}">${PV_METODO_ICON[p.metodo] || '💰'}</div>
          <div class="pv-card-info">
            <div class="pv-card-nombre">${_pvNombre(p.paciente_id)}</div>
            <div class="pv-card-meta">${PV_METODO_LBL[p.metodo] || p.metodo}</div>
          </div>
          <div class="pv-card-monto">${_pvFmt(p.monto)}</div>
        </div>`).join('')}`;
  }).join('');

  el.querySelectorAll('.pv-card').forEach(card => {
    card.addEventListener('click', () => _pvAbrirDetalle(card.dataset.id));
  });
}


/* ══════════════════════════════════════════
   GUARDAR PAGO
   ══════════════════════════════════════════ */
async function _pvHandleSubmit() {
  const err       = _pvQ('#pv-msg-error');
  const pacId     = _pvQ('#pv-f-paciente').value;
  const monto     = _pvQ('#pv-f-monto').value;
  const metodo    = _pvQ('#pv-f-metodo').value;
  const fecha     = _pvQ('#pv-f-fecha').value;
  err.style.display = 'none';

  if (!pacId)               { err.textContent = 'Seleccioná un paciente'; err.style.display = 'block'; return; }
  if (!monto || monto <= 0) { err.textContent = 'Ingresá un monto válido'; err.style.display = 'block'; return; }
  if (!fecha)               { err.textContent = 'Seleccioná una fecha'; err.style.display = 'block'; return; }

  const btn = _pvQ('#pv-btn-guardar');
  btn.disabled = true; btn.textContent = 'Guardando…';

  try {
    const { error } = await sb.from('pagos').insert({
      user_id: _pv.userId, paciente_id: pacId, monto: Number(monto), metodo, fecha,
    });
    if (error) throw error;
    _pvQ('#pv-overlay').classList.remove('open');
    _pvToast('✅ Pago registrado');
    await _pvCargarTodo();
  } catch(e) {
    err.textContent = 'Error: ' + e.message; err.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = '✓ Guardar pago';
  }
}


/* ══════════════════════════════════════════
   DETALLE / ELIMINAR
   ══════════════════════════════════════════ */
function _pvAbrirDetalle(id) {
  _pv.sel = _pv.pagos.find(p => p.id === id);
  if (!_pv.sel) return;
  const p = _pv.sel;
  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' });
  _pvQ('#pv-det-content').innerHTML = `
    <div class="pv-det-monto">${_pvFmt(p.monto)}</div>
    <div class="pv-det-pac">${_pvNombre(p.paciente_id)} · ${fecha}</div>
    <div class="pv-det-rows">
      <div class="pv-det-row"><span>Método</span><span>${PV_METODO_ICON[p.metodo] || ''} ${PV_METODO_LBL[p.metodo] || p.metodo}</span></div>
      <div class="pv-det-row"><span>Fecha</span><span>${fecha}</span></div>
      <div class="pv-det-row"><span>Monto</span><span>${_pvFmt(p.monto)}</span></div>
    </div>`;
  _pvQ('#pv-overlay-det').classList.add('open');
}

function _pvCerrarDetalle() {
  _pvQ('#pv-overlay-det')?.classList.remove('open');
  _pv.sel = null;
}

async function _pvEliminar() {
  if (!_pv.sel) return;
  if (!confirm('¿Eliminar este pago?')) return;
  try {
    const { error } = await sb.from('pagos').delete().eq('id', _pv.sel.id);
    if (error) throw error;
    _pvCerrarDetalle();
    _pvToast('🗑 Pago eliminado');
    await _pvCargarTodo();
  } catch(e) { _pvToast('⚠️ Error: ' + e.message); }
}


/* ══════════════════════════════════════════
   REGISTRO EN EL ROUTER
   ══════════════════════════════════════════ */
PsicoRouter.register('pagos', {

  init(container) {
    _pv.container = container;
    _pvRenderHTML(container);
    _pvBindEvents();
    _pvActualizarLabelMes();
  },

  async onEnter() {
    /* Siempre re-carga pagos frescos; usa caché de pacientes del store */
    await _pvCargarTodo();
  },

  onLeave() {
    /* Cerrar modales abiertos al salir de la vista */
    _pvQ('#pv-overlay')?.classList.remove('open');
    _pvQ('#pv-overlay-det')?.classList.remove('open');
  },
});

/* Compatibilidad legacy por si algo llama initPagos() directamente */
window.onViewEnter_pagos = () => PsicoRouter.navigate('pagos');
