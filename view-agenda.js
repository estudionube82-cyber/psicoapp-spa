// ============================================================
//  view-agenda.js — PsicoApp SPA (refactorizado)
//  Registrado en PsicoRouter: init / onEnter / onLeave
//
//  CAMBIOS RESPECTO AL ORIGINAL:
//  - init()    → renderiza HTML + bind eventos UNA SOLA VEZ
//  - onEnter() → carga datos frescos cada visita, NO re-renderiza DOM
//  - onLeave() → cierra modales abiertos (evita quedarse colgados)
//  - userId    → desde PsicoRouter.store (sin getSession duplicado)
//  - pacientes → desde PsicoRouter.store.ensurePacientes() (caché global)
//  - console.log de debug eliminados
//  - hooks globales window._agDetalle / _agModalHora / _agModalFechaHora
//    CONSERVADOS igual que antes (son llamados desde HTML generado)
// ============================================================

(function () {

  // ── Estado interno del módulo ────────────────────────────
  let _userId      = null;
  let _todosTurnos = [];
  let _todosPacientes = [];
  let _fechaActual = new Date();
  let _hoy         = new Date();
  let _turnoSel    = null;
  let _modoModal   = 'turno';   // 'turno' | 'evento'
  let _currentView = 'semana';

  // ── Constantes ───────────────────────────────────────────
  const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const HORAS = [8,9,10,11,12,13,14,15,16,17,18,19,20];

  // ── Helpers ──────────────────────────────────────────────
  function fmtDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function fmtFechaLinda(f) {
    if (!f) return '';
    const [y,m,d] = f.split('-');
    return `${d}/${m}/${y}`;
  }
  function tipoLabel(tipo) {
    return {sesion:'Sesión',online:'Online',evaluacion:'Evaluación',
            judicial:'Judicial',evento:'Evento',otro:'Otro'}[tipo] || tipo || 'Sesión';
  }
  function tipoEmoji(tipo) {
    return {sesion:'🟢',online:'🔵',evaluacion:'🟡',judicial:'🟣',evento:'🟠',otro:'⚪'}[tipo] || '🟢';
  }
  function evBg(tipo) {
    return {sesion:'#E8F5EE',online:'#E3F2FD',evaluacion:'#FFF8E1',
            judicial:'#EDE9FE',evento:'#FEF0E6',otro:'#F3F4F6'}[tipo] || '#E8F5EE';
  }
  function evBorder(tipo) {
    return {sesion:'#2D6A4F',online:'#1976D2',evaluacion:'#F9A825',
            judicial:'#7B5EA7',evento:'#E8873A',otro:'#9CA3AF'}[tipo] || '#2D6A4F';
  }
  function turnosDeFecha(fecha) {
    const key = fmtDate(fecha);
    return _todosTurnos.filter(t => t.fecha === key).sort((a,b) => (a.hora||'').localeCompare(b.hora||''));
  }
  function nombrePaciente(t) {
    const p = _todosPacientes.find(x => x.id === t.paciente_id);
    if (p) return `${p.nombre || ''} ${p.apellido || ''}`.trim();
    return t.notas || tipoLabel(t.tipo);
  }
  function lunesDe(d) {
    const lunes = new Date(d);
    lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
    lunes.setHours(0,0,0,0);
    return lunes;
  }

  // ── Toast ────────────────────────────────────────────────
  function toast(msg, dur = 3000) {
    let el = document.getElementById('ag-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ag-toast';
      el.style.cssText = 'position:fixed;bottom:88px;left:50%;transform:translateX(-50%);background:#1A1040;color:#fff;padding:11px 22px;border-radius:12px;font-size:13px;font-weight:600;z-index:9999;max-width:320px;text-align:center;transition:opacity .3s;pointer-events:none;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    el.style.display = 'block';
    clearTimeout(el._t);
    if (dur > 0) el._t = setTimeout(() => { el.style.opacity='0'; setTimeout(()=>el.style.display='none',300); }, dur);
  }

  // ── Helpers de formulario ────────────────────────────────
  function agQ(id) { return document.getElementById(id); }
  function mostrarError(msg) {
    const el = agQ('ag-msg-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  // ────────────────────────────────────────────────────────
  //  CARGA DE DATOS
  // ────────────────────────────────────────────────────────

  function _rellenarSelectPaciente() {
    const sel = agQ('ag-f-paciente');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Seleccioná un paciente —</option>';
    _todosPacientes.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = `${p.apellido || ''}, ${p.nombre || ''}`.trim().replace(/^,\s*/,'');
      sel.appendChild(o);
    });
  }

  async function cargarTurnos() {
    try {
      const { data, error } = await sb.from('turnos')
        .select('*')
        .eq('user_id', _userId)
        .order('fecha', { ascending: true })
        .order('hora',  { ascending: true });
      if (error) throw error;
      _todosTurnos = data || [];
    } catch(e) {
      console.error('[Agenda] cargarTurnos:', e.message);
      _todosTurnos = [];
    }
  }

  // ────────────────────────────────────────────────────────
  //  RENDER HTML — se ejecuta UNA SOLA VEZ en init()
  // ────────────────────────────────────────────────────────
  function _renderHTML(container) {
    container.innerHTML = `
    <style>
      #ag-wrap { font-family: var(--font, 'Plus Jakarta Sans', sans-serif); color: var(--text, #1E1040); }
      #ag-toolbar {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 16px 10px;
        background: var(--surface, #fff);
        border-bottom: 1px solid var(--border, #E5E2F5);
        position: sticky; top: 0; z-index: 20;
      }
      #ag-title { flex: 1; }
      #ag-title .ag-t-main { font-size: 16px; font-weight: 800; }
      #ag-title .ag-t-sub  { font-size: 11px; color: var(--text-muted, #7C6FAE); }
      .ag-nav-btn {
        width: 32px; height: 32px; border-radius: 9px;
        background: var(--bg, #F8F7FF); border: 1px solid var(--border, #E5E2F5);
        font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      }
      .ag-view-toggle { display: flex; padding: 8px 16px; gap: 0; background: var(--surface, #fff); border-bottom: 1px solid var(--border, #E5E2F5); }
      .ag-vbtn {
        flex: 1; padding: 7px 4px; font-size: 12px; font-weight: 700;
        font-family: inherit; border: 1.5px solid var(--border, #E5E2F5);
        background: var(--bg, #F8F7FF); color: var(--text-muted, #7C6FAE);
        cursor: pointer; transition: all .15s;
      }
      .ag-vbtn:first-child { border-radius: 9px 0 0 9px; }
      .ag-vbtn:last-child  { border-radius: 0 9px 9px 0; }
      .ag-vbtn:not(:last-child) { border-right: none; }
      .ag-vbtn.active { background: var(--primary, #5B2FA8); color: #fff; border-color: var(--primary, #5B2FA8); z-index:1; }

      /* Day strip */
      #ag-day-strip {
        display: flex; padding: 8px 14px 6px; gap: 4px;
        background: var(--surface, #fff); border-bottom: 1px solid var(--border, #E5E2F5);
        overflow-x: auto; scrollbar-width: none;
      }
      #ag-day-strip::-webkit-scrollbar { display: none; }
      .ag-day-pill {
        display: flex; flex-direction: column; align-items: center;
        padding: 7px 11px; border-radius: 11px; cursor: pointer; min-width: 44px;
        transition: background .15s;
      }
      .ag-day-pill.selected { background: var(--primary, #5B2FA8); }
      .ag-dp-name { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; color: var(--text-muted, #7C6FAE); }
      .ag-dp-num  { font-size: 18px; font-weight: 800; color: var(--text, #1E1040); }
      .ag-day-pill.selected .ag-dp-name,
      .ag-day-pill.selected .ag-dp-num { color: #fff; }
      .ag-dp-pip  { width: 5px; height: 5px; border-radius: 50%; background: var(--accent, #F472B6); margin-top: 3px; }
      .ag-day-pill.selected .ag-dp-pip { background: rgba(255,255,255,.6); }

      /* Time grid */
      #ag-time-grid { overflow-y: auto; max-height: calc(100vh - 280px); padding-bottom: 80px; }
      .ag-time-row { display: flex; min-height: 52px; border-bottom: 1px solid var(--border, #E5E2F5); }
      .ag-time-lbl { width: 46px; flex-shrink: 0; padding: 6px 6px 0 10px; font-size: 10px; font-weight: 600; color: var(--text-muted, #7C6FAE); }
      .ag-slot-area { flex: 1; padding: 4px 8px 4px 2px; }
      .ag-free-slot {
        min-height: 36px; border-radius: 8px; display: flex; align-items: center;
        padding: 0 12px; font-size: 11px; font-weight: 600;
        border: 1.5px dashed var(--border, #E5E2F5); color: var(--text-muted, #7C6FAE);
        cursor: pointer; transition: all .15s; user-select: none;
      }
      .ag-free-slot:hover { background: var(--primary-light, #EDE9FE); border-color: var(--primary, #5B2FA8); color: var(--primary, #5B2FA8); }
      .ag-ev-block {
        border-radius: 8px; padding: 8px 10px 8px 14px;
        cursor: pointer; position: relative; overflow: hidden;
        transition: transform .12s; border-left: 4px solid;
      }
      .ag-ev-block:active { transform: scale(.98); }
      .ag-ev-name { font-size: 13px; font-weight: 700; }
      .ag-ev-meta { font-size: 11px; margin-top: 2px; opacity: .75; }

      /* Week grid */
      #ag-week-header { display: flex; background: var(--surface,#fff); border-bottom: 2px solid var(--border,#E5E2F5); overflow-x: auto; }
      .ag-wh-col {
        flex:1; min-width: 44px; text-align:center;
        padding: 14px 6px;
        border-left:1px solid var(--border,#E5E2F5);
        transition: all 0.15s ease;
      }
      .ag-wh-col:first-child { flex: 0 0 46px; border-left: none; }
      .ag-wh-col:not(.dia-hoy-header) {
        opacity: 0.75;
      }
      .ag-wh-col:not(.dia-hoy-header):hover {
        opacity: 1;
        background: rgba(124,58,237,0.06);
        border-radius: 10px;
      }
      .ag-wh-day {
        font-size: 9px; font-weight: 800;
        text-transform: uppercase; color: var(--text-muted,#7C6FAE);
        margin-bottom: 4px; opacity: 0.7;
      }
      .ag-wh-num { font-size: 18px; font-weight: 800; }
      .ag-wh-num.today { color: var(--primary,#5B2FA8); }
      /* ── Día actual en header semana ── */
      .ag-wh-col.dia-hoy-header {
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        border-radius: 14px;
        padding: 16px 8px;
        color: white;
        font-weight: 800;
        transform: scale(1.05);
        box-shadow: 0 10px 25px rgba(124,58,237,0.35);
      }
      .ag-wh-col.dia-hoy-header .ag-wh-day { color: white; opacity: 1; font-weight: 700; }
      .ag-wh-col.dia-hoy-header .ag-wh-num { color: white; font-size: 20px; }
      #ag-week-grid { overflow-y:auto; overflow-x:auto; max-height:calc(100vh - 280px); padding-bottom:80px; position:relative; }
      .ag-week-row { display:flex; border-bottom:1px solid var(--border,#E5E2F5); min-height:46px; }
      .ag-week-time { flex:0 0 46px; padding:6px 6px 0 8px; font-size:10px; font-weight:600; color:var(--text-muted,#7C6FAE); border-right:1px solid var(--border,#E5E2F5); }
      .ag-week-cell { flex:1; min-width:44px; border-left:1px solid var(--border,#E5E2F5); padding:2px; min-height:46px; cursor:pointer; transition:background .1s; }
      .ag-week-cell:hover { background: var(--primary-light, #EDE9FE); }
      .ag-week-cell.has-turno { cursor: default; }
      .ag-week-cell.has-turno:hover { background: transparent; }
      .ag-week-ev {
        border-radius:5px; padding:3px 6px; font-size:10px; font-weight:700;
        cursor:pointer; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        border-left:3px solid;
      }

      /* Month */
      #ag-month-names { display:grid; grid-template-columns:repeat(7,1fr); background:var(--surface,#fff); border-bottom:1px solid var(--border,#E5E2F5); padding:6px 0 3px; }
      .ag-mn { text-align:center; font-size:10px; font-weight:800; color:var(--text-muted,#7C6FAE); text-transform:uppercase; }
      #ag-month-grid { display:grid; grid-template-columns:repeat(7,1fr); padding-bottom:80px; }
      .ag-mc {
        border-right:1px solid var(--border,#E5E2F5); border-bottom:1px solid var(--border,#E5E2F5);
        min-height:68px; padding:5px 3px; cursor:pointer; transition: all 0.15s ease;
      }
      .ag-mc:hover { background:var(--primary-light,#EDE9FE); }
      .ag-mc.other { opacity:.35; }
      .ag-mc.today-cell {
        background: linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.18));
        border: 1.5px solid rgba(168,85,247,0.35);
        border-radius: 12px;
      }
      .ag-mc.today-cell:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 20px rgba(124,58,237,0.25);
      }
      .ag-mc-num { font-size:12px; font-weight:800; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:3px; }
      .ag-mc.today-cell .ag-mc-num {
        background: linear-gradient(135deg, #7c3aed, #ec4899);
        color: #fff;
        box-shadow: 0 4px 12px rgba(124,58,237,0.4);
      }
      .ag-mc-pill { font-size:9px; font-weight:700; padding:2px 4px; border-radius:4px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

      /* Empty */
      .ag-empty { text-align:center; padding:40px 20px; color:var(--text-muted,#7C6FAE); }
      .ag-empty-icon { font-size:36px; margin-bottom:8px; }

      /* FAB */
      #ag-fab {
        position:fixed; bottom:72px; right:20px; width:52px; height:52px;
        background:var(--primary,#5B2FA8); border-radius:16px; border:none;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 8px 24px rgba(91,47,168,.35); cursor:pointer;
        font-size:26px; color:#fff; z-index:40;
      }

      /* Modal */
      .ag-overlay {
        position:fixed; inset:0; background:rgba(0,0,0,.5);
        z-index:60; display:none; align-items:flex-end; justify-content:center;
      }
      .ag-overlay.open { display:flex; }
      .ag-modal {
        background:var(--surface,#fff); border-radius:20px 20px 0 0;
        width:100%; max-width:520px; padding:20px 20px 36px;
        max-height:90vh; overflow-y:auto;
      }
      .ag-modal-handle { width:36px; height:4px; background:var(--border,#E5E2F5); border-radius:2px; margin:0 auto 16px; }
      .ag-modal-title { font-size:17px; font-weight:800; margin-bottom:4px; }
      .ag-modal-sub { font-size:12px; color:var(--text-muted,#7C6FAE); margin-bottom:16px; }
      .ag-field { margin-bottom:14px; }
      .ag-field label { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text-muted,#7C6FAE); margin-bottom:5px; }
      .ag-field select, .ag-field input, .ag-field textarea {
        width:100%; padding:10px 12px; border-radius:10px;
        border:1.5px solid var(--border,#E5E2F5); font-size:14px; font-weight:500;
        background:var(--bg,#F8F7FF); color:var(--text,#1E1040); font-family:inherit;
        outline:none; transition:border .15s; box-sizing:border-box;
      }
      .ag-field select:focus, .ag-field input:focus, .ag-field textarea:focus { border-color:var(--primary,#5B2FA8); }
      .ag-row2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
      .ag-btn-primary {
        width:100%; padding:14px; border-radius:12px;
        background:var(--primary,#5B2FA8); color:#fff; border:none;
        font-size:15px; font-weight:800; font-family:inherit; cursor:pointer;
        margin-top:6px; transition:opacity .15s;
      }
      .ag-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
      .ag-msg-error { color:#D32F2F; font-size:12px; font-weight:600; margin-bottom:10px; display:none; padding:8px 12px; background:#FEE2E2; border-radius:8px; }

      /* Detalle */
      .ag-det-header { margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid var(--border,#E5E2F5); }
      .ag-det-row { display:flex; gap:10px; padding:9px 0; border-bottom:1px solid var(--border,#E5E2F5); }
      .ag-det-icon { font-size:16px; flex-shrink:0; }
      .ag-det-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text-muted,#7C6FAE); }
      .ag-det-val { font-size:14px; font-weight:600; margin-top:2px; }
      .ag-det-actions { display:flex; gap:10px; margin-top:16px; flex-wrap:wrap; }
      .ag-det-btn {
        flex:1; min-width:100px; padding:11px; border-radius:10px; border:none;
        font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; transition:opacity .15s;
      }
      .ag-det-btn:hover { opacity:.85; }
      .ag-det-btn.confirm { background:var(--primary,#5B2FA8); color:#fff; }
      .ag-det-btn.done    { background:#D1FAE5; color:#065F46; }
      .ag-det-btn.cancel  { background:var(--bg,#F8F7FF); color:var(--text-muted,#7C6FAE); border:1px solid var(--border,#E5E2F5); }
      .ag-det-btn.delete  { background:#FEE2E2; color:#B91C1C; }
      .ag-badge { display:inline-flex; align-items:center; gap:3px; font-size:10px; font-weight:700; padding:3px 8px; border-radius:20px; margin-top:4px; }
      .ag-badge.pend   { background:#FEF3C7; color:#92400E; }
      .ag-badge.conf   { background:#D1FAE5; color:#065F46; }
      .ag-badge.done   { background:var(--bg,#F8F7FF); color:var(--text-muted,#7C6FAE); }
      .ag-badge.cancel { background:#FEE2E2; color:#B91C1C; }

      /* ── Header vista día cuando es HOY ── */
      #ag-title.ag-dia-hoy-header {
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        color: white;
        padding: 8px 12px;
        border-radius: 10px;
      }
      #ag-title.ag-dia-hoy-header .ag-t-main,
      #ag-title.ag-dia-hoy-header .ag-t-sub { color: white; }

      /* today-column: overlay unificado para semana/día — sin bottom:0, usa --agenda-height */
      .today-column {
        position: absolute;
        top: 0;
        height: var(--agenda-height, 100%);
        background: linear-gradient(to bottom,
          rgba(139,92,246,0.06) 0%,
          rgba(139,92,246,0.03) 60%,
          rgba(139,92,246,0.01) 100%);
        border-left: 1.5px solid rgba(139,92,246,0.25);
        border-right: none;
        pointer-events: none;
        z-index: 1;
      }
      /* Vista día: today-column más prominente cuando es hoy */
      #ag-time-grid .today-column {
        background: linear-gradient(to bottom,
          rgba(168,85,247,0.10) 0%,
          rgba(168,85,247,0.05) 60%,
          rgba(168,85,247,0.02) 100%);
        border-left: 3px solid #a855f7;
      }
      /* Eventos y slots siempre encima del overlay */
      .ag-week-ev,
      .ag-ev-block,
      .ag-free-slot,
      .ag-slot-area { position: relative; z-index: 2; }

      /* ── Fila de hora actual (match visual con línea roja) ── */
      .ag-time-row.current-hour {
        background: rgba(255, 59, 59, 0.05);
      }

      /* Mobile: contenedor scrollable flexible */
      #ag-week-grid, #ag-time-grid {
        flex: 1;
        min-height: 0;
      }

      /* ── Línea hora actual ── */
      .current-time-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 3px;
        background: #ff3b3b;
        z-index: 999;
        pointer-events: none;
        box-shadow: 0 0 6px 1px rgba(255,59,59,0.55);
      }
      .current-time-line::before {
        content: '';
        position: absolute;
        left: 44px;
        top: 50%;
        transform: translateY(-50%);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ff3b3b;
        box-shadow: 0 0 8px 3px rgba(255,59,59,0.7);
      }
      /* En semana: el círculo va pegado al borde izquierdo de la columna */
      #ag-week-grid .current-time-line::before {
        left: 0;
        transform: translate(-50%, -50%);
      }
    </style>

    <div id="ag-wrap">

      <!-- TOOLBAR -->
      <div id="ag-toolbar">
        <button class="ag-nav-btn" id="ag-nav-back">‹</button>
        <div id="ag-title">
          <div class="ag-t-main" id="ag-t-main"></div>
          <div class="ag-t-sub"  id="ag-t-sub"></div>
        </div>
        <button class="ag-nav-btn" id="ag-nav-fwd">›</button>
      </div>

      <!-- VIEW TOGGLE -->
      <div class="ag-view-toggle">
        <button class="ag-vbtn" id="ag-btn-dia"    data-view="dia">Día</button>
        <button class="ag-vbtn active" id="ag-btn-semana" data-view="semana">Semana</button>
        <button class="ag-vbtn" id="ag-btn-mes"    data-view="mes">Mes</button>
      </div>

      <!-- DIA VIEW -->
      <div id="ag-dia-view" style="display:none">
        <div id="ag-day-strip"></div>
        <div id="ag-time-grid"></div>
      </div>

      <!-- SEMANA VIEW -->
      <div id="ag-semana-view">
        <div id="ag-week-header"></div>
        <div id="ag-week-grid"></div>
      </div>

      <!-- MES VIEW -->
      <div id="ag-mes-view" style="display:none">
        <div id="ag-month-names">
          <div class="ag-mn">D</div><div class="ag-mn">L</div><div class="ag-mn">M</div>
          <div class="ag-mn">X</div><div class="ag-mn">J</div><div class="ag-mn">V</div><div class="ag-mn">S</div>
        </div>
        <div id="ag-month-grid"></div>
      </div>

    </div>

    <!-- FAB -->
    <button id="ag-fab">＋</button>

    <!-- MODAL NUEVO TURNO / EVENTO -->
    <div class="ag-overlay" id="ag-overlay">
      <div class="ag-modal">
        <div class="ag-modal-handle"></div>
        <div class="ag-modal-title" id="ag-modal-title">📅 Nuevo turno</div>
        <div class="ag-modal-sub"   id="ag-modal-sub">Agendá un turno con un paciente.</div>
        <div class="ag-msg-error"   id="ag-msg-error"></div>

        <div class="ag-field" id="ag-sec-paciente">
          <label>Paciente <span style="color:#E53935">*</span></label>
          <select id="ag-f-paciente">
            <option value="">— Seleccioná un paciente —</option>
          </select>
        </div>

        <div class="ag-field" id="ag-sec-titulo" style="display:none">
          <label>Título <span style="color:#E53935">*</span></label>
          <input type="text" id="ag-f-titulo" placeholder="Ej: Supervisión, Reunión...">
        </div>

        <div class="ag-field" id="ag-sec-tipo">
          <label>Tipo de sesión</label>
          <select id="ag-f-tipo">
            <option value="sesion">🟢 Sesión</option>
            <option value="online">🔵 Online</option>
            <option value="evaluacion">🟡 Evaluación</option>
            <option value="judicial">🟣 Judicial</option>
            <option value="otro">⚪ Otro</option>
          </select>
        </div>

        <div class="ag-row2">
          <div class="ag-field">
            <label>Fecha <span style="color:#E53935">*</span></label>
            <input type="date" id="ag-f-fecha">
          </div>
          <div class="ag-field">
            <label>Hora <span style="color:#E53935">*</span></label>
            <input type="time" id="ag-f-hora" step="900">
          </div>
        </div>

        <div class="ag-field">
          <label>Duración</label>
          <select id="ag-f-duracion">
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="50" selected>50 min</option>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
          </select>
        </div>

        <div class="ag-field">
          <label>Notas (opcional)</label>
          <textarea id="ag-f-notas" rows="2" placeholder="Notas internas..."></textarea>
        </div>

        <button class="ag-btn-primary" id="ag-btn-crear">✓ Agendar turno</button>
        <button class="ag-btn-primary" id="ag-btn-cancelar"
          style="background:var(--bg,#F8F7FF);color:var(--text-muted,#7C6FAE);border:1.5px solid var(--border,#E5E2F5);margin-top:8px">
          Cancelar
        </button>
      </div>
    </div>

    <!-- MODAL DETALLE TURNO -->
    <div class="ag-overlay" id="ag-overlay-det">
      <div class="ag-modal">
        <div class="ag-modal-handle"></div>
        <div class="ag-det-header" id="ag-det-header"></div>
        <div id="ag-det-body"></div>
        <div class="ag-det-actions">
          <button class="ag-det-btn confirm" id="ag-det-confirmar">✓ Confirmar</button>
          <button class="ag-det-btn done"    id="ag-det-realizada">✅ Realizada</button>
          <button class="ag-det-btn delete"  id="ag-det-eliminar">🗑 Eliminar</button>
          <button class="ag-det-btn cancel"  id="ag-det-cerrar">Cerrar</button>
        </div>
      </div>
    </div>
    `;
  }

  // ────────────────────────────────────────────────────────
  //  BIND DE EVENTOS — se ejecuta UNA SOLA VEZ en init()
  // ────────────────────────────────────────────────────────
  function _bindEvents() {
    agQ('ag-nav-back').addEventListener('click', navBack);
    agQ('ag-nav-fwd').addEventListener('click', navFwd);
    agQ('ag-fab').addEventListener('click', () => abrirModal('turno', null, null));

    ['dia','semana','mes'].forEach(v => {
      agQ(`ag-btn-${v}`).addEventListener('click', () => setView(v));
    });

    agQ('ag-btn-crear').addEventListener('click', crearTurno);
    agQ('ag-btn-cancelar').addEventListener('click', cerrarModal);
    agQ('ag-overlay').addEventListener('click', e => { if (e.target.id === 'ag-overlay') cerrarModal(); });

    agQ('ag-det-confirmar').addEventListener('click', () => cambiarEstado('confirmado'));
    agQ('ag-det-realizada').addEventListener('click', () => cambiarEstado('realizado'));
    agQ('ag-det-eliminar').addEventListener('click', eliminarTurno);
    agQ('ag-det-cerrar').addEventListener('click', cerrarDetalle);
    agQ('ag-overlay-det').addEventListener('click', e => { if (e.target.id === 'ag-overlay-det') cerrarDetalle(); });

    // Reposicionar columna hoy al redimensionar ventana
    window.addEventListener('resize', () => {
      requestAnimationFrame(() => {
        if (_currentView === 'semana') {
          const gridEl = document.getElementById('ag-week-grid');
          if (gridEl) posicionarColumnaHoy(gridEl, lunesDe(_fechaActual), fmtDate(new Date()));
          actualizarLineaHoraActualSemana();
        }
        if (_currentView === 'dia') {
          updateAgendaHeight('ag-time-grid');
          posicionarColumnaHoyDia();
          actualizarLineaHoraActualDia();
        }
      });
    });

    // Refrescar pacientes si otra vista los modificó
    window.addEventListener('storeUpdated', (e) => {
      if (e.detail?.key === 'pacientes') {
        PsicoRouter.store.ensurePacientes().then(p => {
          _todosPacientes = p;
          _rellenarSelectPaciente();
        });
      }
    });

    // Scroll listeners: recalculan topVisible = offsetTop - scrollTop
    // para mantener la línea alineada visualmente al hacer scroll
    agQ('ag-time-grid').addEventListener('scroll', () => {
      if (_currentView === 'dia') actualizarLineaHoraActualDia();
    });
    agQ('ag-week-grid').addEventListener('scroll', () => {
      if (_currentView === 'semana') actualizarLineaHoraActualSemana();
    });
  }

  // ────────────────────────────────────────────────────────
  //  HOY — altura dinámica y posicionamiento del overlay
  // ────────────────────────────────────────────────────────

  /**
   * Lee el scrollHeight real del contenedor y actualiza --agenda-height.
   * Usa requestAnimationFrame doble para garantizar layout completo.
   * @param {string} containerId — id del contenedor scrollable
   * @param {Function} [callback] — opcional, se ejecuta tras actualizar
   */
  function updateAgendaHeight(containerId, callback) {
    const el = document.getElementById(containerId);
    if (!el) return;
    // Doble rAF: primer frame completa el paint, segundo lee dimensiones reales
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const h = el.scrollHeight;
        if (h > 0) el.style.setProperty('--agenda-height', h + 'px');
        if (typeof callback === 'function') callback(el, h);
      });
    });
  }

  /**
   * Crea el overlay .today-column dentro del grid de semana.
   * Espera a que updateAgendaHeight resuelva para garantizar altura real.
   */
  function posicionarColumnaHoy(gridEl, lunes, todayKey) {
    // Eliminar overlay previo
    gridEl.querySelectorAll('.today-column').forEach(el => el.remove());

    let hoyIdx = -1;
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes); d.setDate(lunes.getDate() + i);
      if (fmtDate(d) === todayKey) { hoyIdx = i; break; }
    }
    if (hoyIdx < 0) return; // Esta semana no contiene hoy

    // Crear overlay; la altura la setea updateAgendaHeight vía --agenda-height
    const col = document.createElement('div');
    col.className = 'today-column';
    const cellW = (gridEl.clientWidth - 46) / 7;
    col.style.left  = (46 + hoyIdx * cellW) + 'px';
    col.style.width = cellW + 'px';
    gridEl.appendChild(col);

    // Actualizar --agenda-height con doble rAF; el overlay ya está en el DOM
    updateAgendaHeight('ag-week-grid');
  }

  /**
   * Crea el overlay .today-column en vista día, cubriendo todo #ag-time-grid.
   * Solo se muestra si _fechaActual es hoy.
   */
  function posicionarColumnaHoyDia() {
    const grid = document.getElementById('ag-time-grid');
    if (!grid) return;
    // Limpiar overlay previo
    grid.querySelectorAll('.today-column').forEach(el => el.remove());

    const esHoy = fmtDate(_fechaActual) === fmtDate(_hoy);
    if (!esHoy) return;

    const col = document.createElement('div');
    col.className = 'today-column';
    // En vista día ocupa todo el ancho del área de slots (sin columna de hora)
    col.style.left  = '46px';
    col.style.width = 'calc(100% - 46px)';
    grid.appendChild(col);

    updateAgendaHeight('ag-time-grid');
  }

  // ────────────────────────────────────────────────────────
  //  LÍNEA DE HORA ACTUAL
  //  Funciona en vista día (#ag-time-grid) y semana (#ag-week-grid)
  // ────────────────────────────────────────────────────────

  /** Intervalo activo del setInterval; se limpia en onLeave */
  let _currentTimeInterval = null;

  /** Constantes del rango horario de la agenda */
  const HORA_INICIO = 8;   // 08:00
  const HORA_FIN    = 20;  // 20:00 (última fila visible)
  const TOTAL_MINUTOS = (HORA_FIN - HORA_INICIO) * 60; // 720 min

  /**
   * Calcula el porcentaje vertical (0–1) de la hora actual
   * dentro del rango 08:00–20:00.
   * Devuelve null si está fuera del rango.
   */
  function _calcPorcentajeHoraActual() {
    const ahora = new Date();
    const minutosDesdeInicio = (ahora.getHours() - HORA_INICIO) * 60 + ahora.getMinutes();
    if (minutosDesdeInicio < 0 || minutosDesdeInicio > TOTAL_MINUTOS) return null;
    return minutosDesdeInicio / TOTAL_MINUTOS;
  }

  /**
   * Renderiza la línea en un overlay absoluto que es HERMANO del container scrollable,
   * no hijo. Así la línea no scrollea con el contenido y siempre queda alineada
   * visualmente con la hora correcta.
   *
   * Posición: offsetTop de la fila (fijo en el contenido) - scrollTop del container
   * = coordenada visible dentro del parent no-scrollable.
   *
   * @param {HTMLElement} container — el grid scrollable
   * @param {number} leftPx  — left en px (vista semana); 0 = ancho completo
   * @param {number} widthPx — width en px (vista semana); 0 = ancho completo
   */
  function _renderLineaHoraActual(container, leftPx, widthPx) {
    // ── 1. Obtener / crear overlay hermano del container ──────────────────
    const overlayId = container.id + '-time-overlay';
    let overlay = document.getElementById(overlayId);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = overlayId;
      overlay.style.cssText = [
        'position:absolute',
        'top:0', 'left:0', 'right:0', 'bottom:0',
        'pointer-events:none',
        'z-index:5',           // por debajo de modales (z-index: 60)
        'overflow:hidden',
      ].join(';');
      const parent = container.parentElement;
      parent.style.position = 'relative';
      parent.appendChild(overlay);
    }

    // ── 2. Limpiar línea previa ───────────────────────────────────────────
    overlay.querySelectorAll('.current-time-line').forEach(el => el.remove());

    // ── 3. Cálculo definitivo de posición ─────────────────────────────────
    // La línea vive en el overlay (position:absolute, top:0 relativo al parent).
    // El parent NO scrollea — solo el container scrollea dentro de él.
    // Por eso topVisible debe ser relativo al parent, no al container.
    //
    // Fórmula:
    //   topVisible = container.offsetTop           ← dónde empieza el container dentro del parent
    //              + posición de la fila dentro del container (sin scroll)
    //              - container.scrollTop           ← descontar lo que ya scrolleó
    //
    // Para medir la posición de la fila dentro del container SIN scroll usamos
    // getBoundingClientRect de la fila y del container, cuya diferencia da la
    // posición visible, y luego sumamos scrollTop para obtener la posición absoluta.

    const selector = container.id === 'ag-time-grid' ? '.ag-time-row' : '.ag-week-row';
    const filas    = container.querySelectorAll(selector);
    if (filas.length < 13) return;

    const now              = new Date();
    const minutesFromStart = (now.getHours() - 8) * 60 + now.getMinutes();
    if (minutesFromStart < 0 || minutesFromStart > 720) return;

    // Altura real de UNA fila medida en el viewport (no depende de scroll ni offsetParent)
    const r0  = filas[0].getBoundingClientRect();
    const r1  = filas[1].getBoundingClientRect();
    const rowH = r1.top - r0.top;   // distancia entre tops consecutivos = altura real de fila
    if (rowH <= 0) return;

    // Total de 12 horas × altura de fila = rango completo 08:00→20:00
    const totalHeight = rowH * 12;

    // Posición de la fila 08:00 dentro del contenido scrollable:
    // top visible de fila0 + scrollTop = top absoluto dentro del container
    const cRect    = container.getBoundingClientRect();
    const fila0Top = r0.top - cRect.top + container.scrollTop;  // abs dentro del container

    // Posición de la línea dentro del contenido
    const topEnContenido = fila0Top + (minutesFromStart / 720) * totalHeight;

    // Para el overlay (relativo al parent): container.offsetTop + topEnContenido - scrollTop
    const topVisible = container.offsetTop + topEnContenido - container.scrollTop;

    // ── 4. Crear y posicionar la línea ────────────────────────────────────
    const linea = document.createElement('div');
    linea.className = 'current-time-line';
    linea.style.top = topVisible + 'px';
    if (widthPx > 0) {
      linea.style.left  = leftPx + 'px';
      linea.style.width = widthPx + 'px';
    }
    overlay.appendChild(linea);
  }

  /**
   * Actualiza la línea de hora actual en vista DÍA.
   * Solo se muestra si _fechaActual es hoy.
   */
  function actualizarLineaHoraActualDia() {
    const grid = document.getElementById('ag-time-grid');
    if (!grid) return;
    const esHoy = fmtDate(_fechaActual) === fmtDate(_hoy);
    if (!esHoy) {
      // Limpiar overlay si existe
      const overlay = document.getElementById('ag-time-grid-time-overlay');
      if (overlay) overlay.querySelectorAll('.current-time-line').forEach(el => el.remove());
      return;
    }
    _renderLineaHoraActual(grid, 0, 0);
  }

  /**
   * Actualiza la línea de hora actual en vista SEMANA.
   * La línea se posiciona sobre la columna del día actual (si está en la semana visible).
   */
  function actualizarLineaHoraActualSemana() {
    const gridEl = document.getElementById('ag-week-grid');
    if (!gridEl) return;

    const overlay = document.getElementById('ag-week-grid-time-overlay');
    if (overlay) overlay.querySelectorAll('.current-time-line').forEach(el => el.remove());

    const todayKey = fmtDate(new Date());
    const lunes = lunesDe(_fechaActual);
    let hoyIdx = -1;
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes); d.setDate(lunes.getDate() + i);
      if (fmtDate(d) === todayKey) { hoyIdx = i; break; }
    }
    if (hoyIdx < 0) return;

    const cellW  = (gridEl.clientWidth - 46) / 7;
    const leftPx = 46 + hoyIdx * cellW;
    _renderLineaHoraActual(gridEl, leftPx, cellW);
  }

  /**
   * Dispatcher: actualiza la línea según la vista activa.
   */
  function actualizarLineaHoraActual() {
    if (_currentView === 'dia')    actualizarLineaHoraActualDia();
    if (_currentView === 'semana') actualizarLineaHoraActualSemana();
  }

  /**
   * Hace scroll automático para centrar la hora actual en pantalla.
   * @param {string} containerId — id del contenedor scrollable
   */
  function scrollAHoraActual(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Doble rAF: garantiza scrollHeight real tras pintar
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const pct = _calcPorcentajeHoraActual();
      if (pct === null) return;
      const topPx = pct * container.scrollHeight;
      container.scrollTop = topPx - (container.clientHeight / 2);
    }));
  }

  /**
   * Inicia el ciclo de actualización automática de la línea (cada 60 s).
   * Limpia el intervalo anterior si existía.
   */
  function iniciarLineaHoraActual() {
    detenerLineaHoraActual();
    actualizarLineaHoraActual(); // render inmediato
    _currentTimeInterval = setInterval(actualizarLineaHoraActual, 60_000);
  }

  /**
   * Detiene el setInterval. Llamar en onLeave para no acumular timers.
   */
  function detenerLineaHoraActual() {
    if (_currentTimeInterval) {
      clearInterval(_currentTimeInterval);
      _currentTimeInterval = null;
    }
  }


  function setView(v) {
    _currentView = v;
    ['dia','semana','mes'].forEach(x => {
      const el  = agQ(`ag-${x}-view`);
      const btn = agQ(`ag-btn-${x}`);
      if (el)  el.style.display = x === v ? '' : 'none';
      if (btn) btn.classList.toggle('active', x === v);
    });
    actualizarHeader();
    if (v === 'dia') {
      buildDayStrip();
      renderDia();
      // rAF doble: garantiza DOM pintado antes de medir scrollHeight
      requestAnimationFrame(() => requestAnimationFrame(() => {
        updateAgendaHeight('ag-time-grid');
        posicionarColumnaHoyDia();
        // ── Línea hora actual + auto scroll ──
        actualizarLineaHoraActualDia();
        scrollAHoraActual('ag-time-grid');
        setTimeout(() => { actualizarLineaHoraActual(); }, 100);
        iniciarLineaHoraActual();
      }));
    }
    if (v === 'semana') {
      renderSemana(); // posicionarColumnaHoy() ya se llama al final de renderSemana
      // ── Línea hora actual + auto scroll ──
      requestAnimationFrame(() => requestAnimationFrame(() => {
        actualizarLineaHoraActualSemana();
        scrollAHoraActual('ag-week-grid');
        setTimeout(() => { actualizarLineaHoraActual(); }, 100);
        iniciarLineaHoraActual();
      }));
    }
    if (v === 'mes') renderMes();
  }

  function actualizarHeader() {
    const d     = _fechaActual;
    const el    = agQ('ag-t-main');
    const es    = agQ('ag-t-sub');
    const title = agQ('ag-title');
    if (!el) return;

    // Header highlight: solo en vista día cuando es HOY
    const esHoyDia = _currentView === 'dia' && fmtDate(_fechaActual) === fmtDate(_hoy);
    title?.classList.toggle('ag-dia-hoy-header', esHoyDia);

    if (_currentView === 'dia') {
      el.textContent = `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
      es.textContent = d.getFullYear();
    } else if (_currentView === 'semana') {
      const lunes   = lunesDe(d);
      const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
      el.textContent = `${lunes.getDate()} ${MESES[lunes.getMonth()].slice(0,3)} – ${domingo.getDate()} ${MESES[domingo.getMonth()].slice(0,3)}`;
      es.textContent = lunes.getFullYear();
    } else {
      el.textContent = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
      es.textContent = '';
    }
  }

  function navBack() {
    if (_currentView === 'dia')    _fechaActual.setDate(_fechaActual.getDate() - 1);
    if (_currentView === 'semana') _fechaActual.setDate(_fechaActual.getDate() - 7);
    if (_currentView === 'mes')    _fechaActual.setMonth(_fechaActual.getMonth() - 1);
    setView(_currentView);
  }
  function navFwd() {
    if (_currentView === 'dia')    _fechaActual.setDate(_fechaActual.getDate() + 1);
    if (_currentView === 'semana') _fechaActual.setDate(_fechaActual.getDate() + 7);
    if (_currentView === 'mes')    _fechaActual.setMonth(_fechaActual.getMonth() + 1);
    setView(_currentView);
  }

  // ── Day strip ────────────────────────────────────────────
  function buildDayStrip() {
    const strip = agQ('ag-day-strip');
    if (!strip) return;
    strip.innerHTML = '';
    const lunes = lunesDe(_fechaActual);
    for (let i = 0; i < 7; i++) {
      const d     = new Date(lunes); d.setDate(lunes.getDate() + i);
      const tieneT = _todosTurnos.some(t => t.fecha === fmtDate(d));
      const sel    = fmtDate(d) === fmtDate(_fechaActual);
      const pill   = document.createElement('div');
      pill.className = 'ag-day-pill' + (sel ? ' selected' : '');
      pill.innerHTML = `<div class="ag-dp-name">${DIAS[d.getDay()]}</div>
                        <div class="ag-dp-num">${d.getDate()}</div>
                        ${tieneT ? '<div class="ag-dp-pip"></div>' : ''}`;
      pill.addEventListener('click', () => {
        _fechaActual = new Date(d);
        actualizarHeader();
        buildDayStrip();
        renderDia();
        // La línea se actualiza dentro de renderDia vía rAF
      });
      strip.appendChild(pill);
    }
  }

  // ── Day grid ─────────────────────────────────────────────
  function renderDia() {
    const grid = agQ('ag-time-grid');
    if (!grid) return;
    const turnos  = turnosDeFecha(_fechaActual);
    const esHoy   = fmtDate(_fechaActual) === fmtDate(_hoy);
    const horaAct = esHoy ? new Date().getHours() : -1;
    let html = '';
    HORAS.forEach(h => {
      const horaStr    = String(h).padStart(2,'0') + ':00';
      const turno      = turnos.find(t => parseInt((t.hora||'0').split(':')[0]) === h);
      const esCurrHour = esHoy && h === horaAct;
      html += `<div class="ag-time-row${esCurrHour ? ' current-hour' : ''}" data-hour="${h}">
                 <div class="ag-time-lbl">${horaStr}</div>
                 <div class="ag-slot-area">`;
      if (turno) {
        const bg  = evBg(turno.tipo);
        const brd = evBorder(turno.tipo);
        const nom = nombrePaciente(turno);
        html += `<div class="ag-ev-block" style="background:${bg};border-left-color:${brd}"
                      onclick="window._agDetalle('${turno.id}')">
                   <div class="ag-ev-name">${tipoEmoji(turno.tipo)} ${nom}</div>
                   <div class="ag-ev-meta">${horaStr} · ${turno.duracion || 50} min · ${tipoLabel(turno.tipo)}</div>
                 </div>`;
      } else {
        html += `<div class="ag-free-slot" onclick="window._agModalHora('${horaStr}')">+ Agendar</div>`;
      }
      html += `</div></div>`;
    });
    grid.innerHTML = html;

    // Overlay HOY en vista día (misma lógica que semana, clase unificada)
    // Se llama desde setView con rAF, pero también al hacer click en day-strip
    requestAnimationFrame(() => requestAnimationFrame(() => {
      updateAgendaHeight('ag-time-grid');
      posicionarColumnaHoyDia();
      actualizarLineaHoraActualDia();
    }));
  }
  function renderSemana() {
    const hdrEl  = agQ('ag-week-header');
    const gridEl = agQ('ag-week-grid');
    if (!hdrEl || !gridEl) return;
    const lunes = lunesDe(_fechaActual);

    const _todayKey = fmtDate(new Date());
    let hdr = '<div class="ag-wh-col"></div>';
    for (let i = 0; i < 7; i++) {
      const d    = new Date(lunes); d.setDate(lunes.getDate() + i);
      const esHoy = fmtDate(d) === _todayKey;
      hdr += `<div class="ag-wh-col${esHoy ? ' dia-hoy-header' : ''}">
                <div class="ag-wh-day">${DIAS[d.getDay()]}</div>
                <div class="ag-wh-num ${esHoy ? 'today' : ''}">${d.getDate()}</div>
              </div>`;
    }
    hdrEl.innerHTML = hdr;

    let rows = '';
    HORAS.forEach(h => {
      const horaStr = String(h).padStart(2,'0') + ':00';
      rows += `<div class="ag-week-row" data-hour="${h}"><div class="ag-week-time">${horaStr}</div>`;
      for (let i = 0; i < 7; i++) {
        const d     = new Date(lunes); d.setDate(lunes.getDate() + i);
        const fecha = fmtDate(d);
        const turno = _todosTurnos.find(t => t.fecha === fecha && parseInt((t.hora||'0').split(':')[0]) === h);
        const esCeldaHoy = fecha === _todayKey;
        if (turno) {
          const bg  = evBg(turno.tipo);
          const brd = evBorder(turno.tipo);
          const nom = nombrePaciente(turno);
          rows += `<div class="ag-week-cell has-turno">
                     <div class="ag-week-ev" style="background:${bg};border-left-color:${brd};color:${brd}"
                          onclick="window._agDetalle('${turno.id}')">${nom}</div>
                   </div>`;
        } else {
          rows += `<div class="ag-week-cell" onclick="window._agModalFechaHora('${fecha}','${horaStr}')"></div>`;
        }
      }
      rows += '</div>';
    });
    gridEl.innerHTML = rows;

    // Overlay columna HOY — usa posicionarColumnaHoy() que maneja scrollHeight real
    posicionarColumnaHoy(gridEl, lunes, _todayKey);
  }

  // ── Month grid ───────────────────────────────────────────
  function renderMes() {
    const grid = agQ('ag-month-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const y = _fechaActual.getFullYear(), m = _fechaActual.getMonth();
    const primerDia = new Date(y, m, 1).getDay();
    const diasEnMes = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < primerDia; i++) {
      const cell = document.createElement('div');
      cell.className = 'ag-mc other';
      grid.appendChild(cell);
    }
    for (let d = 1; d <= diasEnMes; d++) {
      const fecha  = new Date(y, m, d);
      const esHoy  = fmtDate(fecha) === fmtDate(_hoy);
      const turnos = turnosDeFecha(fecha);
      const cell   = document.createElement('div');
      cell.className = 'ag-mc' + (esHoy ? ' today-cell' : '');
      cell.innerHTML = `<div class="ag-mc-num">${d}</div>`;
      turnos.slice(0, 3).forEach(t => {
        const bg  = evBg(t.tipo);
        const brd = evBorder(t.tipo);
        const pill = document.createElement('div');
        pill.className = 'ag-mc-pill';
        pill.style.cssText = `background:${bg};color:${brd}`;
        pill.textContent = nombrePaciente(t);
        pill.addEventListener('click', e => { e.stopPropagation(); abrirDetalle(t.id); });
        cell.appendChild(pill);
      });
      if (turnos.length > 3) {
        const mas = document.createElement('div');
        mas.style.cssText = 'font-size:9px;color:var(--text-muted,#7C6FAE);font-weight:700;padding:1px 3px';
        mas.textContent = `+${turnos.length - 3} más`;
        cell.appendChild(mas);
      }
      cell.addEventListener('click', () => { _fechaActual = fecha; setView('dia'); });
      grid.appendChild(cell);
    }
  }

  // ────────────────────────────────────────────────────────
  //  MODAL NUEVO TURNO / EVENTO
  // ────────────────────────────────────────────────────────
  function abrirModal(modo, fecha, hora) {
    _modoModal = modo || 'turno';
    const esTurno = _modoModal === 'turno';
    agQ('ag-modal-title').textContent              = esTurno ? '📅 Nuevo turno' : '🗓 Nuevo evento';
    agQ('ag-modal-sub').textContent                = esTurno ? 'Agendá un turno con un paciente.' : 'Agregá un evento a tu agenda.';
    agQ('ag-btn-crear').textContent                = esTurno ? '✓ Agendar turno' : '✓ Guardar evento';
    agQ('ag-sec-paciente').style.display           = esTurno ? '' : 'none';
    agQ('ag-sec-tipo').style.display               = esTurno ? '' : 'none';
    agQ('ag-sec-titulo').style.display             = esTurno ? 'none' : '';

    agQ('ag-f-fecha').value    = fecha || fmtDate(_fechaActual);
    agQ('ag-f-hora').value     = hora  || (String(new Date().getHours()).padStart(2,'0') + ':00');
    agQ('ag-f-paciente').value = '';
    agQ('ag-f-titulo').value   = '';
    agQ('ag-f-notas').value    = '';
    agQ('ag-f-tipo').value     = 'sesion';
    agQ('ag-f-duracion').value = '50';

    const errEl = agQ('ag-msg-error');
    errEl.style.display = 'none';
    errEl.textContent   = '';

    agQ('ag-overlay').classList.add('open');
  }

  function cerrarModal() {
    agQ('ag-overlay').classList.remove('open');
  }

  // ────────────────────────────────────────────────────────
  //  CREAR TURNO (Supabase + WhatsApp)
  // ────────────────────────────────────────────────────────
  async function crearTurno() {
    const fecha = agQ('ag-f-fecha').value;
    const hora  = agQ('ag-f-hora').value;
    if (!fecha || !hora) { mostrarError('Fecha y hora son obligatorios.'); return; }

    const btn = agQ('ag-btn-crear');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { mostrarError('No hay sesión activa.'); btn.disabled = false; btn.textContent = '✓ Agendar turno'; return; }

      const horaFmt = hora.length === 5 ? hora + ':00' : hora;

      let insertData = {
        user_id:  session.user.id,
        fecha,
        hora:     horaFmt,
        duracion: parseInt(agQ('ag-f-duracion').value) || 50,
        estado:   'pendiente',
        notas:    agQ('ag-f-notas').value.trim() || null,
      };

      if (_modoModal === 'turno') {
        const pacId = agQ('ag-f-paciente').value;
        if (!pacId) { btn.disabled = false; btn.textContent = '✓ Agendar turno'; mostrarError('Seleccioná un paciente.'); return; }
        insertData.paciente_id = pacId;
        insertData.tipo = agQ('ag-f-tipo').value;
      } else {
        const titulo = agQ('ag-f-titulo').value.trim();
        if (!titulo) { btn.disabled = false; btn.textContent = '✓ Guardar evento'; mostrarError('Escribí un título para el evento.'); return; }
        insertData.tipo  = 'evento';
        insertData.notas = titulo + (insertData.notas ? ' — ' + insertData.notas : '');
      }

      const { error } = await sb.from('turnos').insert(insertData);
      if (error) throw error;

      // ── WhatsApp: envío de confirmación (no bloquea si falla) ──
      if (_modoModal === 'turno' && insertData.paciente_id) {
        _enviarConfirmacionWA(insertData, session).catch(e =>
          console.warn('[Agenda] WhatsApp no enviado:', e.message)
        );
      }

      cerrarModal();
      toast('✅ Turno agendado');
      await cargarTurnos();
      buildDayStrip();
      setView(_currentView);

    } catch(e) {
      mostrarError('Error al guardar: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = _modoModal === 'turno' ? '✓ Agendar turno' : '✓ Guardar evento';
    }
  }

  // ── WhatsApp helper — extraído para no contaminar crearTurno ──
  async function _enviarConfirmacionWA(insertData, session) {
    const paciente = _todosPacientes.find(p => p.id === insertData.paciente_id);
    const tel      = paciente?.telefono;
    const nombre   = paciente?.nombre || 'Paciente';
    if (!tel) return;

    let telNorm = tel.replace(/\D/g, '');
    if (telNorm.startsWith('0')) telNorm = telNorm.slice(1);
    if (!telNorm.startsWith('54')) telNorm = '54' + telNorm;
    if (telNorm.startsWith('54') && !telNorm.startsWith('549')) telNorm = '549' + telNorm.slice(2);
    telNorm = '+' + telNorm;

    const [y, m, d] = insertData.fecha.split('-');
    const fechaLinda = `${d}/${m}/${y}`;
    const horaLinda  = insertData.hora.slice(0, 5);

    await fetch('https://terlbqrcampdqtxjbihg.supabase.co/functions/v1/enviar-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ to: telNorm, nombre, fecha: fechaLinda, hora: horaLinda }),
    });

    const msgHistorial = `Hola ${nombre}, te recuerdo tu turno para el día ${fechaLinda} a las ${horaLinda}. En caso de no poder asistir, por favor avisá con anticipación.`;

    if (typeof window._wpGuardarEnHistorial === 'function') {
      window._wpGuardarEnHistorial({ paciente_id: insertData.paciente_id, tipo: 'confirmacion', mensaje: msgHistorial });
    } else {
      // Fallback: guardar directo si view-whatsapp no está montado aún
      await sb.from('wa_historial').insert({
        user_id: session.user.id, paciente_id: insertData.paciente_id || null,
        tipo: 'confirmacion', mensaje: msgHistorial,
      }).then(({ error }) => { if (error) console.warn('[Agenda] wa_historial:', error.message); });
    }
  }

  // ────────────────────────────────────────────────────────
  //  DETALLE DEL TURNO
  // ────────────────────────────────────────────────────────
  function abrirDetalle(id) {
    _turnoSel = _todosTurnos.find(t => String(t.id) === String(id));
    if (!_turnoSel) return;
    const t   = _turnoSel;
    const nom = nombrePaciente(t);

    agQ('ag-det-header').innerHTML = `
      <div style="font-size:19px;font-weight:800">${tipoEmoji(t.tipo)} ${nom}</div>
      <div style="font-size:12px;color:var(--text-muted,#7C6FAE);margin-top:4px">
        ${tipoLabel(t.tipo)} · ${fmtFechaLinda(t.fecha)} · ${(t.hora||'').slice(0,5)}
      </div>`;

    const badgeMap = {
      pendiente:  '<span class="ag-badge pend">⏳ Pendiente</span>',
      confirmado: '<span class="ag-badge conf">✓ Confirmado</span>',
      realizado:  '<span class="ag-badge done">✅ Realizado</span>',
      cancelado:  '<span class="ag-badge cancel">❌ Cancelado</span>',
    };

    let body = detRow('🕐', 'Duración', `${t.duracion || 50} min`);
    body += detRow('📋', 'Estado', badgeMap[t.estado] || t.estado || '—');
    if (t.notas) body += detRow('📝', 'Notas', t.notas);
    agQ('ag-det-body').innerHTML = body;

    agQ('ag-det-confirmar').style.display = t.estado === 'pendiente'  ? '' : 'none';
    agQ('ag-det-realizada').style.display = t.estado !== 'realizado'  ? '' : 'none';

    agQ('ag-overlay-det').classList.add('open');
  }

  function detRow(icon, label, val) {
    return `<div class="ag-det-row">
              <div class="ag-det-icon">${icon}</div>
              <div><div class="ag-det-lbl">${label}</div><div class="ag-det-val">${val}</div></div>
            </div>`;
  }

  function cerrarDetalle() {
    agQ('ag-overlay-det').classList.remove('open');
    _turnoSel = null;
  }

  async function cambiarEstado(estado) {
    if (!_turnoSel) return;
    try {
      const { error } = await sb.from('turnos').update({ estado }).eq('id', _turnoSel.id);
      if (error) throw error;
      cerrarDetalle();
      await cargarTurnos();
      setView(_currentView);
      toast(estado === 'realizado' ? '✅ Sesión marcada como realizada' : '✓ Estado actualizado');
    } catch(e) {
      toast('⚠️ Error al actualizar: ' + e.message);
    }
  }

  async function eliminarTurno() {
    if (!_turnoSel) return;
    if (!confirm('¿Eliminar este turno?')) return;
    try {
      const { error } = await sb.from('turnos').delete().eq('id', _turnoSel.id);
      if (error) throw error;
      cerrarDetalle();
      await cargarTurnos();
      buildDayStrip();
      setView(_currentView);
      toast('🗑 Turno eliminado');
    } catch(e) {
      toast('⚠️ Error al eliminar: ' + e.message);
    }
  }

  // ────────────────────────────────────────────────────────
  //  HOOKS GLOBALES para onclick en HTML generado dinámicamente
  //  (deben vivir en window — no cambiar nombres)
  // ────────────────────────────────────────────────────────
  window._agDetalle        = (id)          => abrirDetalle(id);
  window._agModalHora      = (hora)        => abrirModal('turno', null, hora);
  window._agModalFechaHora = (fecha, hora) => abrirModal('turno', fecha, hora);

  // ────────────────────────────────────────────────────────
  //  REGISTRO EN EL ROUTER
  // ────────────────────────────────────────────────────────
  PsicoRouter.register('agenda', {

    /* init — monta HTML + listeners UNA SOLA VEZ */
    init(container) {
      _renderHTML(container);
      _bindEvents();
    },

    /* onEnter — refresca datos en cada visita, NO re-renderiza el DOM */
    async onEnter() {
      _hoy         = new Date();
      _fechaActual = new Date();
      _currentView = 'semana';

      // userId desde store (sin getSession adicional)
      _userId = await PsicoRouter.store.ensureUserId();
      if (!_userId) return;

      // Pacientes desde caché global; turnos siempre frescos
      _todosPacientes = await PsicoRouter.store.ensurePacientes();
      _rellenarSelectPaciente();

      await cargarTurnos();

      // Restaurar vista semana centrada en hoy
      actualizarHeader();
      setView('semana');
      // setView ya dispara rAF internamente vía posicionarColumnaHoy
    },

    /* onLeave — cerrar modales para que no queden colgados al volver */
    onLeave() {
      agQ('ag-overlay')?.classList.remove('open');
      agQ('ag-overlay-det')?.classList.remove('open');
      _turnoSel = null;
      detenerLineaHoraActual(); // ← limpiar setInterval de la línea
    },
  });

  /* Compatibilidad legacy */
  window.onViewEnter_agenda = () => PsicoRouter.navigate('agenda');

})();
