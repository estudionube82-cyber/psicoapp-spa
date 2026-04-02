/**
 * view-whatsapp.js — PsicoApp SPA (refactorizado)
 * Registrado en PsicoRouter: init / onEnter / onLeave
 *
 * - init()    → HTML + listeners UNA SOLA VEZ
 * - onEnter() → carga userId, perfil, pacientes, turnos mañana
 * - onLeave() → cierra modal abierto
 * - window._wpGuardarEnHistorial → CONSERVADO (usado desde view-agenda.js)
 * - window.wpSetTab, wpFiltrarPacientes, etc. → CONSERVADOS (usados en HTML dinámico)
 */

/* ══════════════════════════════════════════
   ESTILOS — inyectados una sola vez
   ══════════════════════════════════════════ */
(function injectWpStyles() {
  if (document.getElementById('view-whatsapp-styles')) return;
  const s = document.createElement('style');
  s.id = 'view-whatsapp-styles';
  s.textContent = `
#view-whatsapp .wp-header{background:var(--surface);border-bottom:1px solid var(--border);box-shadow:var(--sh);}
#view-whatsapp .wp-header-top{display:flex;align-items:center;padding:14px 18px 10px;gap:10px;}
#view-whatsapp .wp-header-title{flex:1;text-align:center;font-size:16px;font-weight:800;}
#view-whatsapp .wp-tabs{display:flex;border-bottom:1px solid var(--border);}
#view-whatsapp .wp-tab{flex:1;padding:11px 4px;text-align:center;font-size:12px;font-weight:700;color:var(--muted);cursor:pointer;border-bottom:3px solid transparent;transition:all 0.2s;white-space:nowrap;}
#view-whatsapp .wp-tab.active{color:var(--wp-dark);border-bottom-color:var(--wp);}
#view-whatsapp .wp-tab-view{display:none;}
#view-whatsapp .wp-tab-view.active{display:block;animation:wpFadeUp 0.2s ease;}
@keyframes wpFadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
#view-whatsapp .search-bar{padding:12px 16px;}
#view-whatsapp .search-input{width:100%;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;padding:10px 16px 10px 38px;font-size:14px;font-family:var(--font);outline:none;color:var(--text);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A8FA8' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:12px center;}
#view-whatsapp .search-input:focus{border-color:var(--wp);}
#view-whatsapp .pac-list{padding:0 16px;display:flex;flex-direction:column;gap:8px;}
#view-whatsapp .pac-card{background:var(--surface);border-radius:14px;padding:13px 14px;display:flex;align-items:center;gap:12px;box-shadow:var(--sh);}
#view-whatsapp .pac-avatar{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:white;flex-shrink:0;}
#view-whatsapp .pac-info{flex:1;min-width:0;}
#view-whatsapp .pac-nombre{font-size:14px;font-weight:700;}
#view-whatsapp .pac-tel{font-size:12px;color:var(--muted);margin-top:2px;}
#view-whatsapp .pac-sin-tel{font-size:11px;color:#E65100;font-weight:600;margin-top:2px;}
#view-whatsapp .plantillas-list{padding:14px 16px;display:flex;flex-direction:column;gap:12px;}
#view-whatsapp .plantilla-card{background:var(--surface);border-radius:var(--r,16px);padding:16px;box-shadow:var(--sh);}
#view-whatsapp .plantilla-header{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
#view-whatsapp .plantilla-icon{width:36px;height:36px;border-radius:11px;background:rgba(124,58,237,0.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
#view-whatsapp .plantilla-titulo{font-size:14px;font-weight:700;}
#view-whatsapp .plantilla-sub{font-size:11px;color:var(--muted);margin-top:2px;}
#view-whatsapp .plantilla-preview{background:var(--wp-light);border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.6;color:#1a1a1a;border-left:4px solid var(--wp);margin-bottom:12px;white-space:pre-wrap;font-family:var(--font);}
#view-whatsapp .btn-usar{width:100%;background:var(--wp);color:white;border:none;border-radius:11px;padding:11px;font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;}
#view-whatsapp .historial-header{padding:14px 16px 8px;display:flex;align-items:center;justify-content:space-between;}
#view-whatsapp .hist-title{font-size:15px;font-weight:800;}
#view-whatsapp .hist-filtros{display:flex;gap:6px;padding:0 16px 10px;overflow-x:auto;}
#view-whatsapp .hist-filtro{flex-shrink:0;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;border:1.5px solid #C4B5FD;background:#F5F3FF;color:#5B2FA8;cursor:pointer;transition:all 0.15s;}
#view-whatsapp .hist-filtro.active{background:#5B2FA8;color:#fff;border-color:#5B2FA8;}
#view-whatsapp .hist-list{padding:0 16px;display:flex;flex-direction:column;gap:8px;}
#view-whatsapp .hist-card{background:var(--surface);border-radius:14px;padding:13px 14px;box-shadow:var(--sh);border:1px solid var(--border,#E5E2F5);}
#view-whatsapp .hist-top{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
#view-whatsapp .hist-avatar{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:white;flex-shrink:0;}
#view-whatsapp .hist-nombre{font-size:14px;font-weight:700;flex:1;color:var(--text,#1E1040);}
#view-whatsapp .hist-hora{font-size:11px;color:var(--muted);}
#view-whatsapp .hist-footer{display:flex;align-items:center;justify-content:space-between;}
#view-whatsapp .hist-tipo{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;}
#view-whatsapp .tipo-confirmacion{background:rgba(124,58,237,0.15);color:var(--primary);}
#view-whatsapp .tipo-recordatorio{background:#FEF3C7;color:#92400E;}
#view-whatsapp .tipo-pago{background:rgba(124,58,237,0.15);color:#7C3AED;}
#view-whatsapp .tipo-libre{background:rgba(124,58,237,0.10);color:var(--primary);}
#view-whatsapp .tipo-automatico{background:#FEF0E6;color:#EC4899;}
#view-whatsapp .auto-section{padding:14px 16px;display:flex;flex-direction:column;gap:12px;}
#view-whatsapp .auto-card{background:var(--surface);border-radius:var(--r,16px);padding:16px;box-shadow:var(--sh);}
#view-whatsapp .auto-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
#view-whatsapp .auto-titulo{font-size:14px;font-weight:800;color:var(--text,#1E1040);}
#view-whatsapp .auto-sub{font-size:12px;color:var(--text-muted);margin-bottom:12px;line-height:1.4;}
#view-whatsapp .wp-toggle{position:relative;width:44px;height:24px;flex-shrink:0;}
#view-whatsapp .wp-toggle input{opacity:0;width:0;height:0;}
#view-whatsapp .wp-toggle-slider{position:absolute;inset:0;background:var(--border);border-radius:24px;cursor:pointer;transition:0.3s;}
#view-whatsapp .wp-toggle-slider::before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;background:white;border-radius:50%;transition:0.3s;}
#view-whatsapp .wp-toggle input:checked+.wp-toggle-slider{background:var(--wp);}
#view-whatsapp .wp-toggle input:checked+.wp-toggle-slider::before{transform:translateX(20px);}
#view-whatsapp .auto-info{background:#E8F8EE;border-radius:10px;padding:10px 12px;font-size:12px;color:#166534;margin-top:10px;line-height:1.5;}
#view-whatsapp .auto-info strong{font-weight:800;}
#view-whatsapp .btn-probar{width:100%;background:var(--wp-dark);color:white;border:none;border-radius:11px;padding:12px;font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer;margin-top:10px;display:flex;align-items:center;justify-content:center;gap:8px;}
#view-whatsapp .btn-probar:active{opacity:0.85;}
#view-whatsapp .empty-sec{text-align:center;padding:40px 20px;color:var(--muted);}
#view-whatsapp .empty-icon{font-size:40px;margin-bottom:8px;}
#view-whatsapp .wp-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:60;display:none;align-items:flex-end;justify-content:center;}
#view-whatsapp .wp-overlay.open{display:flex;}
#view-whatsapp .wp-modal{background:var(--surface);border-radius:28px 28px 0 0;padding:20px 20px 40px;width:100%;max-width:430px;max-height:80vh;overflow-y:auto;animation:wpSlideUp 0.25s ease;}
@keyframes wpSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
#view-whatsapp .modal-handle{width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px;}
#view-whatsapp .modal-title{font-size:18px;font-weight:800;margin-bottom:4px;}
#view-whatsapp .modal-sub{font-size:13px;color:var(--muted);margin-bottom:16px;}
#view-whatsapp .wp-toast{position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#1A1A2E;color:white;padding:12px 22px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;display:none;animation:wpFadeUp 0.3s ease;}
  `;
  document.head.appendChild(s);
})();


/* ══════════════════════════════════════════
   ESTADO INTERNO
   ══════════════════════════════════════════ */
const _wp = {
  todosPacientes:    [],
  pacientesFiltrados:[],
  pacSeleccionado:   null,
  turnosProximos:    [],
  historialTodos:    [],
  filtroHistorial:   'todos',
  perfilPro:         { titulo:'', nombre_completo:'', direccion:'', telefono_profesional:'' },
  userId:            null,
  sessionToken:      null,
};

const WP_COLORES = ['#5B2FA8','#1976D2','#7B5EA7','#E65100','#388E3C','#C62828'];


/* ══════════════════════════════════════════
   RENDER HTML — UNA SOLA VEZ en init()
   ══════════════════════════════════════════ */
function _wpRenderHTML(container) {
  container.innerHTML = `
<div class="wp-header">
  <div class="wp-header-top">
    <div class="wp-header-title">WhatsApp</div>
  </div>
  <div class="wp-tabs">
    <div class="wp-tab active" id="wp-tab-pacientes">💬 Pacientes</div>
    <div class="wp-tab" id="wp-tab-plantillas">📋 Plantillas</div>
    <div class="wp-tab" id="wp-tab-historial">🕐 Historial</div>
    <div class="wp-tab" id="wp-tab-auto">⚡ Auto</div>
  </div>
</div>

<!-- TAB PACIENTES -->
<div class="wp-tab-view active" id="wp-view-pacientes">
  <div class="search-bar">
    <input class="search-input" id="wpSearchInput" placeholder="Buscar paciente...">
  </div>
  <div class="pac-list" id="wpPacList">
    <div class="empty-sec"><div class="empty-icon">⏳</div>Cargando...</div>
  </div>
</div>

<!-- TAB PLANTILLAS -->
<div class="wp-tab-view" id="wp-view-plantillas">
  <div class="plantillas-list">
    <div class="plantilla-card">
      <div class="plantilla-header">
        <div class="plantilla-icon">📅</div>
        <div><div class="plantilla-titulo">Confirmación de turno</div><div class="plantilla-sub">Al agendar una sesión</div></div>
      </div>
      <div class="plantilla-preview" id="wp-prev-confirmacion"></div>
      <button class="btn-usar" onclick="wpUsarPlantilla('confirmacion')">💬 Enviar a paciente</button>
    </div>
    <div class="plantilla-card">
      <div class="plantilla-header">
        <div class="plantilla-icon">🔔</div>
        <div><div class="plantilla-titulo">Recordatorio de turno</div><div class="plantilla-sub">El día anterior</div></div>
      </div>
      <div class="plantilla-preview" id="wp-prev-recordatorio"></div>
      <button class="btn-usar" onclick="wpUsarPlantilla('recordatorio')">💬 Enviar a paciente</button>
    </div>
    <div class="plantilla-card">
      <div class="plantilla-header">
        <div class="plantilla-icon">💰</div>
        <div><div class="plantilla-titulo">Recordatorio de pago</div><div class="plantilla-sub">Saldo pendiente</div></div>
      </div>
      <div class="plantilla-preview" id="wp-prev-pago"></div>
      <button class="btn-usar" onclick="wpUsarPlantilla('pago')">💬 Enviar a paciente</button>
    </div>
    <div class="plantilla-card">
      <div class="plantilla-header">
        <div class="plantilla-icon">✏️</div>
        <div><div class="plantilla-titulo">Mensaje libre</div><div class="plantilla-sub">Escribí lo que necesitás</div></div>
      </div>
      <textarea id="wp-msg-libre" style="width:100%;border:1.5px solid var(--border);border-radius:12px;padding:12px;font-size:13px;font-family:var(--font);resize:none;min-height:80px;background:var(--bg);outline:none;margin-bottom:12px" placeholder="Escribí tu mensaje aquí..."></textarea>
      <button class="btn-usar" onclick="wpUsarPlantilla('libre')">💬 Enviar a paciente</button>
    </div>
  </div>
</div>

<!-- TAB HISTORIAL -->
<div class="wp-tab-view" id="wp-view-historial">
  <div class="historial-header">
    <div class="hist-title">Mensajes enviados</div>
    <span id="wp-hist-count" style="font-size:12px;color:var(--muted);font-weight:600"></span>
  </div>
  <div class="hist-filtros">
    <div class="hist-filtro active" data-filtro="todos">Todos</div>
    <div class="hist-filtro" data-filtro="recordatorio">Recordatorios</div>
    <div class="hist-filtro" data-filtro="confirmacion">Confirmaciones</div>
    <div class="hist-filtro" data-filtro="automatico">Automáticos</div>
  </div>
  <div class="hist-list" id="wpHistList">
    <div class="empty-sec"><div class="empty-icon">⏳</div>Cargando historial...</div>
  </div>
</div>

<!-- TAB AUTOMATIZACIÓN -->
<div class="wp-tab-view" id="wp-view-auto">
  <div class="auto-section">
    <div class="auto-info">
      <strong>✅ WhatsApp Business activo</strong>
      Los mensajes se envían desde <strong>+54 9 2346 521129</strong> (PsicoApp).
    </div>
    <div class="auto-card">
      <div class="auto-header">
        <div class="auto-titulo">🔔 Recordatorio 24hs antes</div>
        <label class="wp-toggle">
          <input type="checkbox" id="wp-toggle-recordatorio">
          <span class="wp-toggle-slider"></span>
        </label>
      </div>
      <div class="auto-sub">PsicoApp envía automáticamente un WhatsApp a cada paciente el día anterior a su turno.</div>
      <div class="auto-info">
        <strong>¿Cómo funciona?</strong><br>
        Cada día a las <strong>17:00 hs</strong> el sistema busca los turnos del día siguiente y envía el recordatorio a todos los pacientes que tienen teléfono registrado.
      </div>
      <button class="btn-probar" id="wp-btn-probar">▶ Probar ahora — enviar recordatorios de mañana</button>
    </div>
    <div class="auto-card">
      <div class="auto-header">
        <div class="auto-titulo">📅 Confirmación al agendar</div>
        <label class="wp-toggle">
          <input type="checkbox" id="wp-toggle-confirmacion">
          <span class="wp-toggle-slider"></span>
        </label>
      </div>
      <div class="auto-sub">Al crear un turno nuevo, se envía automáticamente un WhatsApp de confirmación al paciente.</div>
      <div class="auto-info">Se activa desde la Agenda al guardar un nuevo turno.</div>
    </div>
    <div class="auto-card">
      <div class="auto-titulo" style="margin-bottom:8px">📋 Turnos de mañana</div>
      <div class="auto-sub">Estos pacientes recibirán el recordatorio automático.</div>
      <div id="wpTurnosMañanaList">
        <div style="text-align:center;color:var(--muted);padding:16px;font-size:13px">Cargando...</div>
      </div>
    </div>
  </div>
</div>

<!-- MODAL seleccionar paciente -->
<div class="wp-overlay" id="wpOverlayPac">
  <div class="wp-modal">
    <div class="modal-handle"></div>
    <div class="modal-title">💬 ¿A quién enviás?</div>
    <div class="modal-sub">Seleccioná el paciente para enviar el mensaje.</div>
    <div id="wpModalPacList"></div>
    <button id="wp-btn-cerrar-modal" style="width:100%;background:none;border:none;padding:14px;font-size:14px;color:var(--muted);font-family:var(--font);cursor:pointer;margin-top:4px">Cancelar</button>
  </div>
</div>

<div id="wpToast" class="wp-toast"></div>
`;
}


/* ══════════════════════════════════════════
   BIND DE EVENTOS — UNA SOLA VEZ en init()
   ══════════════════════════════════════════ */
function _wpBindEvents(container) {
  // Tabs
  container.querySelectorAll('.wp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.id.replace('wp-tab-', '');
      wpSetTab(id);
      if (id === 'historial') wpCargarHistorial();
      if (id === 'auto')      _wpCargarTurnosMañana();
    });
  });

  // Búsqueda
  container.querySelector('#wpSearchInput')?.addEventListener('input', wpFiltrarPacientes);

  // Filtros historial
  container.querySelectorAll('.hist-filtro').forEach(f => {
    f.addEventListener('click', () => {
      _wp.filtroHistorial = f.dataset.filtro;
      container.querySelectorAll('.hist-filtro').forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      _wpRenderHistorial();
    });
  });

  // Toggles automación
  container.querySelector('#wp-toggle-recordatorio')?.addEventListener('change', e => {
    wpGuardarConfig('recordatorio_auto', e.target.checked);
  });
  container.querySelector('#wp-toggle-confirmacion')?.addEventListener('change', e => {
    wpGuardarConfig('confirmacion_auto', e.target.checked);
  });

  // Botón probar recordatorios
  container.querySelector('#wp-btn-probar')?.addEventListener('click', _wpEnviarRecordatoriosManual);

  // Cerrar modal
  container.querySelector('#wp-btn-cerrar-modal')?.addEventListener('click', wpCerrarModalPac);
  container.querySelector('#wpOverlayPac')?.addEventListener('click', e => {
    if (e.target.id === 'wpOverlayPac') wpCerrarModalPac();
  });
}


/* ══════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════ */
function wpMostrarToast(msg, ok = true) {
  const t = document.getElementById('wpToast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = ok ? '#1A1A2E' : '#C62828';
  t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => { t.style.display = 'none'; }, 3500);
}
window.wpMostrarToast = wpMostrarToast;


/* ══════════════════════════════════════════
   TABS
   ══════════════════════════════════════════ */
window.wpSetTab = function(tab) {
  document.querySelectorAll('#view-whatsapp .wp-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#view-whatsapp .wp-tab-view').forEach(el => el.classList.remove('active'));
  document.getElementById('wp-tab-' + tab)?.classList.add('active');
  document.getElementById('wp-view-' + tab)?.classList.add('active');
};


/* ══════════════════════════════════════════
   PACIENTES
   ══════════════════════════════════════════ */
function _wpRenderPacientes() {
  const el = document.getElementById('wpPacList');
  if (!el) return;
  if (!_wp.pacientesFiltrados.length) {
    el.innerHTML = '<div class="empty-sec"><div class="empty-icon">👥</div>No hay pacientes</div>';
    return;
  }
  el.innerHTML = _wp.pacientesFiltrados.map(p => {
    const iniciales = [(p.nombre||'')[0], (p.apellido||'')[0]].join('').toUpperCase();
    const color = WP_COLORES[(p.nombre||'').charCodeAt(0) % WP_COLORES.length];
    const tieneWapp = !!p.telefono;
    return `
      <div class="pac-card" onclick="wpAbrirEnvio('${p.id}')" style="cursor:pointer;">
        <div class="pac-avatar" style="background:${color}">${escHtml(iniciales)}</div>
        <div class="pac-info">
          <div class="pac-nombre">${escHtml(p.nombre)} ${escHtml(p.apellido)}</div>
          <div class="pac-tel">${escHtml(p.telefono || '')}</div>
          ${!tieneWapp ? '<div class="pac-sin-tel">⚠ Sin teléfono</div>' : ''}
        </div>
        ${tieneWapp ? '<div style="font-size:20px">💬</div>' : ''}
      </div>`;
  }).join('');
}

window.wpFiltrarPacientes = function() {
  const q = (document.getElementById('wpSearchInput')?.value || '').toLowerCase();
  _wp.pacientesFiltrados = _wp.todosPacientes.filter(p =>
    (p.nombre + ' ' + p.apellido).toLowerCase().includes(q)
  );
  _wpRenderPacientes();
};


/* ══════════════════════════════════════════
   MODAL ENVÍO
   ══════════════════════════════════════════ */
window.wpAbrirEnvio = function(pacId) {
  _wp.pacSeleccionado = _wp.todosPacientes.find(p => p.id === pacId);
  if (!_wp.pacSeleccionado) return;
  if (!_wp.pacSeleccionado.telefono) {
    wpMostrarToast('⚠ Este paciente no tiene teléfono registrado', false);
    return;
  }
  wpSetTab('plantillas');
};

window.wpCerrarModalPac = function() {
  document.getElementById('wpOverlayPac')?.classList.remove('open');
};


/* ══════════════════════════════════════════
   PLANTILLAS
   ══════════════════════════════════════════ */
function _wpRenderPlantillas() {
  const p    = _wp.perfilPro;
  const nombreFull = [p.titulo, p.nombre_completo].filter(Boolean).join(' ') || 'tu psicólogo/a';
  const dir  = p.direccion || '';
  const tel  = p.telefono_profesional || '';

  const textos = {
    confirmacion: `Hola! Te confirmo tu turno 📅\n*Fecha:* [fecha]\n*Hora:* [hora]\n*Profesional:* ${nombreFull}${dir ? '\n*Consultorio:* ' + dir : ''}\n\nAnte cualquier cambio, avisame con anticipación. ¡Hasta pronto! 😊`,
    recordatorio: `Hola! Te recuerdo que mañana tenés turno 🔔\n*Hora:* [hora]\n*Profesional:* ${nombreFull}${dir ? '\n*Consultorio:* ' + dir : ''}\n\nSi no podés asistir, avisame a la brevedad.${tel ? ' Tel: ' + tel : ''}`,
    pago:         `Hola! Te comento que tenés un saldo pendiente 💰\nPodés coordinar el pago cuando gustes.${tel ? '\nContacto: ' + tel : ''}`,
  };

  for (const [key, txt] of Object.entries(textos)) {
    const el = document.getElementById('wp-prev-' + key);
    if (el) el.textContent = txt;
  }
}

window.wpUsarPlantilla = function(tipo) {
  if (!_wp.pacSeleccionado) {
    wpMostrarToast('⚠ Primero seleccioná un paciente desde la pestaña Pacientes', false);
    return;
  }
  let msg = '';
  if (tipo === 'libre') {
    msg = document.getElementById('wp-msg-libre')?.value?.trim();
    if (!msg) { wpMostrarToast('⚠ Escribí un mensaje primero', false); return; }
  } else {
    const el = document.getElementById('wp-prev-' + tipo);
    msg = el ? el.textContent : '';
  }
  _wpEnviarMensaje(_wp.pacSeleccionado, msg, tipo);
};


/* ══════════════════════════════════════════
   ENVIAR MENSAJE
   ══════════════════════════════════════════ */
async function _wpEnviarMensaje(pac, msg, tipo = 'libre') {
  try {
    /* ── Check de límite WhatsApp ── */
    if (!(await puedeUsar('whatsapp'))) {
      wpMostrarToast('🚫 Límite de WhatsApp alcanzado. Actualizá tu plan.', false);
      return;
    }

    let telNorm = (pac.telefono || '').replace(/\D/g, '');
    if (telNorm.startsWith('0')) telNorm = telNorm.slice(1);
    if (!telNorm.startsWith('54')) telNorm = '54' + telNorm;
    if (telNorm.startsWith('54') && !telNorm.startsWith('549')) telNorm = '549' + telNorm.slice(2);

    // Abrir WhatsApp Web (garantiza el envío)
    window.open(`https://wa.me/${telNorm}?text=${encodeURIComponent(msg)}`, '_blank');

    // Edge Function en paralelo (silencioso si falla)
    try {
      await fetch('https://terlbqrcampdqtxjbihg.supabase.co/functions/v1/enviar-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_wp.sessionToken}` },
        body: JSON.stringify({ to: '+' + telNorm, nombre: pac.nombre, mensaje: msg }),
      });
    } catch(_) {}

    // Guardar en historial
    await _wpGuardarEnHistorial({ paciente_id: pac.id, tipo, mensaje: msg });

    // Descontar del contador de suscripción
    if (typeof registrarUso === 'function') registrarUso('whatsapp');
    if (typeof window._syncWaUsos === 'function') window._syncWaUsos();

    wpMostrarToast(`✅ WhatsApp abierto para ${pac.nombre}`);
    _wp.pacSeleccionado = null;

    if (document.getElementById('wp-view-historial')?.classList.contains('active')) {
      await wpCargarHistorial();
    }
  } catch(e) {
    wpMostrarToast('❌ Error al enviar: ' + e.message, false);
  }
}


/* ══════════════════════════════════════════
   HISTORIAL
   ══════════════════════════════════════════ */
async function _wpGuardarEnHistorial({ paciente_id, tipo, mensaje }) {
  try {
    await sb.from('wa_historial').insert({
      user_id:     _wp.userId,
      paciente_id: paciente_id || null,
      tipo:        tipo || 'libre',
      mensaje:     mensaje || '',
    });
  } catch(e) {
    console.warn('[WA] No se pudo guardar en historial:', e.message);
  }
}

/* Expuesta globalmente — usada desde view-agenda.js */
window._wpGuardarEnHistorial = async function({ paciente_id, tipo, mensaje }) {
  if (!_wp.userId) {
    const { data: { session } } = await sb.auth.getSession();
    if (session) _wp.userId = session.user.id;
  }
  const { error } = await sb.from('wa_historial').insert({
    user_id:     _wp.userId,
    paciente_id: paciente_id || null,
    tipo:        tipo || 'confirmacion',
    mensaje:     mensaje || '',
  });
  if (error) console.warn('[WA Historial]', error.message);
};

window.wpCargarHistorial = async function() {
  const el = document.getElementById('wpHistList');
  if (el) el.innerHTML = '<div class="empty-sec"><div class="empty-icon">⏳</div>Cargando...</div>';

  const { data, error } = await sb.from('wa_historial')
    .select('id, created_at, tipo, mensaje, paciente_id, pacientes(nombre, apellido)')
    .eq('user_id', _wp.userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    if (el) el.innerHTML = `<div class="empty-sec"><div class="empty-icon">⚠️</div><p style="font-size:13px">Creá la tabla <strong>wa_historial</strong> en Supabase para activar el historial.</p></div>`;
    return;
  }

  _wp.historialTodos = data || [];
  _wpRenderHistorial();
};

function _wpRenderHistorial() {
  const el  = document.getElementById('wpHistList');
  const cnt = document.getElementById('wp-hist-count');
  if (!el) return;
  const lista = _wp.filtroHistorial === 'todos'
    ? _wp.historialTodos
    : _wp.historialTodos.filter(h => h.tipo === _wp.filtroHistorial);
  if (cnt) cnt.textContent = lista.length + ' mensajes';
  if (!lista.length) {
    el.innerHTML = '<div class="empty-sec"><div class="empty-icon">📭</div>Sin mensajes aún</div>';
    return;
  }
  const iconos    = { confirmacion:'📅', recordatorio:'🔔', pago:'💰', automatico:'⚡', libre:'✏️' };
  const tipoClass = { confirmacion:'tipo-confirmacion', recordatorio:'tipo-recordatorio', pago:'tipo-pago', automatico:'tipo-automatico' };
  const tipoLabel = { confirmacion:'Confirmación', recordatorio:'Recordatorio', pago:'Cobro', automatico:'Automático', libre:'Libre' };
  el.innerHTML = lista.map(h => {
    const pac      = h.pacientes;
    const nombre   = pac ? `${pac.nombre} ${pac.apellido}` : 'Paciente desconocido';
    const iniciales = pac ? [(pac.nombre||'?')[0],(pac.apellido||'?')[0]].join('').toUpperCase() : '??';
    const color    = WP_COLORES[nombre.charCodeAt(0) % WP_COLORES.length];
    const fecha    = new Date(h.created_at).toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    const preview  = h.mensaje ? escHtml(h.mensaje.replace(/\n/g,' ').slice(0, 80)) + (h.mensaje.length > 80 ? '…' : '') : '';
    return `
      <div class="hist-card">
        <div class="hist-top">
          <div class="hist-avatar" style="background:${color}">${escHtml(iniciales)}</div>
          <div style="flex:1;min-width:0">
            <div class="hist-nombre">${escHtml(nombre)}</div>
            ${preview ? `<div style="font-size:11px;color:var(--muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${preview}</div>` : ''}
          </div>
          <div class="hist-hora" style="white-space:nowrap;margin-left:8px">${fecha}</div>
        </div>
        <div class="hist-footer">
          <span class="hist-tipo ${tipoClass[h.tipo]||''}">${iconos[h.tipo]||'💬'} ${tipoLabel[h.tipo]||h.tipo||'mensaje'}</span>
          <span style="font-size:10px;color:#25D366;font-weight:700">✓ Enviado</span>
        </div>
      </div>`;
  }).join('');
}


/* ══════════════════════════════════════════
   AUTO: TURNOS MAÑANA
   ══════════════════════════════════════════ */
async function _wpCargarTurnosMañana() {
  const el = document.getElementById('wpTurnosMañanaList');
  if (!el) return;

  const manana = new Date(); manana.setDate(manana.getDate() + 1);
  const dStr   = manana.toISOString().split('T')[0];

  const { data } = await sb.from('turnos')
    .select('id,hora,paciente_id,pacientes(nombre,apellido,telefono)')
    .eq('user_id', _wp.userId)
    .eq('fecha', dStr)
    .neq('estado', 'cancelado')
    .order('hora');

  _wp.turnosProximos = data || [];

  if (!_wp.turnosProximos.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--muted);padding:16px;font-size:13px">No hay turnos para mañana</div>';
  } else {
    el.innerHTML = _wp.turnosProximos.map(t => {
      const pac = t.pacientes;
      if (!pac) return '';
      const tieneWapp = !!pac.telefono;
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:20px">${tieneWapp ? '✅' : '⚠️'}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">${escHtml(pac.nombre)} ${escHtml(pac.apellido)}</div>
            <div style="font-size:12px;color:var(--muted)">${t.hora} hs${tieneWapp ? '' : ' — sin teléfono'}</div>
          </div>
        </div>`;
    }).join('');
  }

  // Cargar config de toggles
  const { data: cfg } = await sb.from('profiles')
    .select('recordatorio_auto,confirmacion_auto').eq('id', _wp.userId).maybeSingle();
  if (cfg) {
    const tr = document.getElementById('wp-toggle-recordatorio');
    const tc = document.getElementById('wp-toggle-confirmacion');
    if (tr) tr.checked = !!cfg.recordatorio_auto;
    if (tc) tc.checked = !!cfg.confirmacion_auto;
  }
}

window.wpGuardarConfig = async function(campo, valor) {
  await sb.from('profiles').update({ [campo]: valor }).eq('id', _wp.userId);
  wpMostrarToast(valor ? '✅ Activado' : '⏸ Desactivado');
};

async function _wpEnviarRecordatoriosManual() {
  const btn = document.getElementById('wp-btn-probar');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }
  try {
    /* ── Check de límite WhatsApp ── */
    if (!(await puedeUsar('whatsapp'))) {
      wpMostrarToast('🚫 Límite de WhatsApp alcanzado. Actualizá tu plan.', false);
      if (btn) { btn.disabled = false; btn.textContent = '▶ Probar ahora — enviar recordatorios de mañana'; }
      return;
    }

    let enviados = 0;
    for (const t of _wp.turnosProximos) {
      const pac = t.pacientes;
      if (!pac?.telefono) continue;

      let tel = pac.telefono.replace(/\D/g,'');
      if (tel.startsWith('0')) tel = tel.slice(1);
      if (!tel.startsWith('54')) tel = '54' + tel;
      if (tel.startsWith('54') && !tel.startsWith('549')) tel = '549' + tel.slice(2);
      tel = '+' + tel;

      await fetch('https://terlbqrcampdqtxjbihg.supabase.co/functions/v1/enviar-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_wp.sessionToken}` },
        body: JSON.stringify({ to: tel, nombre: pac.nombre, hora: t.hora }),
      });
      enviados++;
    }
    wpMostrarToast(`✅ ${enviados} recordatorio${enviados !== 1 ? 's' : ''} enviado${enviados !== 1 ? 's' : ''}`);
  } catch(e) {
    wpMostrarToast('❌ Error: ' + e.message, false);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '▶ Probar ahora — enviar recordatorios de mañana'; }
  }
}


/* ══════════════════════════════════════════
   REGISTRO EN EL ROUTER
   ══════════════════════════════════════════ */
PsicoRouter.register('whatsapp', {

  init(container) {
    _wpRenderHTML(container);
    _wpBindEvents(container);
  },

  async onEnter() {
    // userId desde store
    _wp.userId = await PsicoRouter.store.ensureUserId();
    if (!_wp.userId) return;

    // Session token para Edge Functions
    const { data: { session } } = await sb.auth.getSession();
    _wp.sessionToken = session?.access_token || null;

    // Perfil profesional desde store
    const perfil = await PsicoRouter.store.ensurePerfil();
    _wp.perfilPro = {
      titulo:                perfil.titulo               || '',
      nombre_completo:       perfil.nombre_completo      || '',
      direccion:             perfil.direccion             || '',
      telefono_profesional:  perfil.telefono_profesional || '',
    };

    // Pacientes desde store (caché global)
    _wp.todosPacientes     = await PsicoRouter.store.ensurePacientes();
    _wp.pacientesFiltrados = [..._wp.todosPacientes];

    _wpRenderPlantillas();
    _wpRenderPacientes();
    await _wpCargarTurnosMañana();
  },

  onLeave() {
    document.getElementById('wpOverlayPac')?.classList.remove('open');
    _wp.pacSeleccionado = null;
  },
});

/* Compatibilidad legacy */
window.onViewEnter_whatsapp = () => PsicoRouter.navigate('whatsapp');
// Alias público para wpFiltrarHistorial (usado en onclick inline del historial si aplica)
window.wpFiltrarHistorial = function(tipo, el) {
  _wp.filtroHistorial = tipo;
  document.querySelectorAll('#view-whatsapp .hist-filtro').forEach(e => e.classList.remove('active'));
  if (el) el.classList.add('active');
  _wpRenderHistorial();
};
