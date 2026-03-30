let whatsappInitialized = false;
console.log("WhatsApp SPA OK");

function initWhatsapp() {
  const container = document.getElementById('view-whatsapp');
  if (!container) return;

  if (!whatsappInitialized) {
    container.innerHTML = `
<style>
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
#view-whatsapp .plantilla-icon{width:36px;height:36px;border-radius:11px;background:#E8F8EE;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
#view-whatsapp .plantilla-titulo{font-size:14px;font-weight:700;}
#view-whatsapp .plantilla-sub{font-size:11px;color:var(--muted);margin-top:2px;}
#view-whatsapp .plantilla-preview{background:var(--wp-light);border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.6;color:#1a1a1a;border-left:4px solid var(--wp);margin-bottom:12px;white-space:pre-wrap;font-family:var(--font);}
#view-whatsapp .btn-usar{width:100%;background:var(--wp);color:white;border:none;border-radius:11px;padding:11px;font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;}
#view-whatsapp .historial-header{padding:14px 16px 8px;display:flex;align-items:center;justify-content:space-between;}
#view-whatsapp .hist-title{font-size:15px;font-weight:800;}
#view-whatsapp .hist-filtros{display:flex;gap:6px;padding:0 16px 10px;overflow-x:auto;}
#view-whatsapp .hist-filtro{flex-shrink:0;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;border:1.5px solid var(--border);background:var(--surface);color:var(--muted);cursor:pointer;transition:all 0.15s;}
#view-whatsapp .hist-filtro.active{background:var(--wp-dark);color:white;border-color:var(--wp-dark);}
#view-whatsapp .hist-list{padding:0 16px;display:flex;flex-direction:column;gap:8px;}
#view-whatsapp .hist-card{background:var(--surface);border-radius:14px;padding:13px 14px;box-shadow:var(--sh);}
#view-whatsapp .hist-top{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
#view-whatsapp .hist-avatar{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:white;flex-shrink:0;}
#view-whatsapp .hist-nombre{font-size:14px;font-weight:700;flex:1;}
#view-whatsapp .hist-hora{font-size:11px;color:var(--muted);}
#view-whatsapp .hist-footer{display:flex;align-items:center;justify-content:space-between;}
#view-whatsapp .hist-tipo{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;}
#view-whatsapp .tipo-confirmacion{background:#EDE9FE;color:#5B2FA8;}
#view-whatsapp .tipo-recordatorio{background:#FEF3C7;color:#92400E;}
#view-whatsapp .tipo-pago{background:#EDE9FE;color:#5B21B6;}
#view-whatsapp .tipo-libre{background:#E3F2FD;color:#1976D2;}
#view-whatsapp .tipo-automatico{background:#FEF0E6;color:#EC4899;}
#view-whatsapp .auto-section{padding:14px 16px;display:flex;flex-direction:column;gap:12px;}
#view-whatsapp .auto-card{background:var(--surface);border-radius:var(--r,16px);padding:16px;box-shadow:var(--sh);}
#view-whatsapp .auto-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
#view-whatsapp .auto-titulo{font-size:14px;font-weight:800;}
#view-whatsapp .auto-sub{font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.4;}
#view-whatsapp .wp-toggle{position:relative;width:44px;height:24px;flex-shrink:0;}
#view-whatsapp .wp-toggle input{opacity:0;width:0;height:0;}
#view-whatsapp .wp-toggle-slider{position:absolute;inset:0;background:var(--border);border-radius:24px;cursor:pointer;transition:0.3s;}
#view-whatsapp .wp-toggle-slider::before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;background:white;border-radius:50%;transition:0.3s;}
#view-whatsapp .wp-toggle input:checked+.wp-toggle-slider{background:var(--wp);}
#view-whatsapp .wp-toggle input:checked+.wp-toggle-slider::before{transform:translateX(20px);}
#view-whatsapp .auto-info{background:#E8F8EE;border-radius:10px;padding:10px 12px;font-size:12px;color:#5B2FA8;margin-top:10px;line-height:1.5;}
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
</style>

<div class="wp-header">
  <div class="wp-header-top">
    <div class="wp-header-title">WhatsApp</div>
  </div>
  <div class="wp-tabs">
    <div class="wp-tab active" id="wp-tab-pacientes" onclick="wpSetTab('pacientes')">💬 Pacientes</div>
    <div class="wp-tab" id="wp-tab-plantillas" onclick="wpSetTab('plantillas')">📋 Plantillas</div>
    <div class="wp-tab" id="wp-tab-historial" onclick="wpSetTab('historial');wpCargarHistorial()">🕐 Historial</div>
    <div class="wp-tab" id="wp-tab-auto" onclick="wpSetTab('auto');wpCargarTurnosMañana()">⚡ Auto</div>
  </div>
</div>

<!-- TAB PACIENTES -->
<div class="wp-tab-view active" id="wp-view-pacientes">
  <div class="search-bar">
    <input class="search-input" id="wpSearchInput" placeholder="Buscar paciente..." oninput="wpFiltrarPacientes()">
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
    <div class="hist-filtro active" onclick="wpFiltrarHistorial('todos',this)">Todos</div>
    <div class="hist-filtro" onclick="wpFiltrarHistorial('recordatorio',this)">Recordatorios</div>
    <div class="hist-filtro" onclick="wpFiltrarHistorial('confirmacion',this)">Confirmaciones</div>
    <div class="hist-filtro" onclick="wpFiltrarHistorial('automatico',this)">Automáticos</div>
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
      Los mensajes se envían desde <strong>+54 9 2346 521129</strong> (PsicoApp). Los pacientes reciben los mensajes directamente sin ninguna acción previa.
    </div>

    <div class="auto-card">
      <div class="auto-header">
        <div class="auto-titulo">🔔 Recordatorio 24hs antes</div>
        <label class="wp-toggle">
          <input type="checkbox" id="wp-toggle-recordatorio" onchange="wpGuardarConfig('recordatorio_auto', this.checked)">
          <span class="wp-toggle-slider"></span>
        </label>
      </div>
      <div class="auto-sub">PsicoApp envía automáticamente un WhatsApp a cada paciente el día anterior a su turno.</div>
      <div class="auto-info">
        <strong>¿Cómo funciona?</strong><br>
        Cada día a las <strong>9:00 hs</strong> el sistema busca los turnos del día siguiente y envía el recordatorio a todos los pacientes que tienen teléfono registrado.
      </div>
      <button class="btn-probar" onclick="wpEnviarRecordatoriosManual()">
        ▶ Probar ahora — enviar recordatorios de mañana
      </button>
    </div>

    <div class="auto-card">
      <div class="auto-header">
        <div class="auto-titulo">📅 Confirmación al agendar</div>
        <label class="wp-toggle">
          <input type="checkbox" id="wp-toggle-confirmacion" onchange="wpGuardarConfig('confirmacion_auto', this.checked)">
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
    <button onclick="wpCerrarModalPac()" style="width:100%;background:none;border:none;padding:14px;font-size:14px;color:var(--muted);font-family:var(--font);cursor:pointer;margin-top:4px">Cancelar</button>
  </div>
</div>

<div id="wpToast" class="wp-toast"></div>
`;
    whatsappInitialized = true;
  }

  // ── ESTADO LOCAL ──
  const WP_COLORES = ['#5B2FA8','#1976D2','#7B5EA7','#E65100','#388E3C','#C62828'];
  let wpTodosPacientes = [], wpPacientesFiltrados = [];
  let wpPacSeleccionado = null;
  let wpTurnosProximos = [];
  let wpHistorialTodos = [];
  let wpFiltroHistorial = 'todos';
  let wpPerfilPro = { titulo:'', nombre_completo:'', direccion:'', telefono_profesional:'' };
  let wpUserId = null, wpSessionToken = null;

  // ── TOAST ──
  function wpMostrarToast(msg, ok=true) {
    const t = document.getElementById('wpToast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = ok ? '#1A1A2E' : '#C62828';
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3500);
  }
  window.wpMostrarToast = wpMostrarToast;

  // ── TABS ──
  window.wpSetTab = function(tab) {
    container.querySelectorAll('.wp-tab').forEach(el => el.classList.remove('active'));
    container.querySelectorAll('.wp-tab-view').forEach(el => el.classList.remove('active'));
    const tabEl = document.getElementById('wp-tab-' + tab);
    const viewEl = document.getElementById('wp-view-' + tab);
    if (tabEl) tabEl.classList.add('active');
    if (viewEl) viewEl.classList.add('active');
  };

  // ── PACIENTES ──
  async function wpCargarPacientes() {
    const { data } = await sb.from('pacientes')
      .select('id,nombre,apellido,telefono')
      .eq('user_id', wpUserId)
      .neq('archivado', true)
      .order('apellido');
    wpTodosPacientes = data || [];
    wpPacientesFiltrados = [...wpTodosPacientes];
    wpRenderPacientes();
  }

  window.wpFiltrarPacientes = function() {
    const q = (document.getElementById('wpSearchInput')?.value || '').toLowerCase();
    wpPacientesFiltrados = wpTodosPacientes.filter(p =>
      (p.nombre + ' ' + p.apellido).toLowerCase().includes(q)
    );
    wpRenderPacientes();
  };

  function wpRenderPacientes() {
    const el = document.getElementById('wpPacList');
    if (!el) return;
    if (!wpPacientesFiltrados.length) {
      el.innerHTML = '<div class="empty-sec"><div class="empty-icon">👥</div>No hay pacientes</div>';
      return;
    }
    el.innerHTML = wpPacientesFiltrados.map(p => {
      const iniciales = [(p.nombre||'')[0], (p.apellido||'')[0]].join('').toUpperCase();
      const color = WP_COLORES[(p.nombre||'').charCodeAt(0) % WP_COLORES.length];
      const tieneWapp = !!p.telefono;
      return `
        <div class="pac-card" onclick="wpAbrirEnvio('${p.id}')" style="cursor:pointer;">
          <div class="pac-avatar" style="background:${color}">${iniciales}</div>
          <div class="pac-info">
            <div class="pac-nombre">${p.nombre} ${p.apellido}</div>
            <div class="pac-tel">${p.telefono || ''}</div>
            ${!tieneWapp ? '<div class="pac-sin-tel">⚠ Sin teléfono</div>' : ''}
          </div>
          ${tieneWapp ? '<div style="font-size:20px">💬</div>' : ''}
        </div>`;
    }).join('');
  }

  // ── MODAL ENVÍO ──
  window.wpAbrirEnvio = function(pacId) {
    wpPacSeleccionado = wpTodosPacientes.find(p => p.id === pacId);
    if (!wpPacSeleccionado) return;
    if (!wpPacSeleccionado.telefono) {
      wpMostrarToast('⚠ Este paciente no tiene teléfono registrado', false);
      return;
    }
    wpSetTab('plantillas');
  };

  window.wpCerrarModalPac = function() {
    const el = document.getElementById('wpOverlayPac');
    if (el) el.classList.remove('open');
  };

  // ── PLANTILLAS ──
  function wpRenderPlantillas() {
    const nombre = wpPerfilPro.nombre_completo || 'tu psicólogo/a';
    const titulo = wpPerfilPro.titulo || '';
    const nombreFull = [titulo, nombre].filter(Boolean).join(' ');
    const dir = wpPerfilPro.direccion || '';
    const tel = wpPerfilPro.telefono_profesional || '';

    const textos = {
      confirmacion: `Hola! Te confirmo tu turno 📅\n*Fecha:* [fecha]\n*Hora:* [hora]\n*Profesional:* ${nombreFull}${dir ? '\n*Consultorio:* ' + dir : ''}\n\nAnte cualquier cambio, avisame con anticipación. ¡Hasta pronto! 😊`,
      recordatorio: `Hola! Te recuerdo que mañana tenés turno 🔔\n*Hora:* [hora]\n*Profesional:* ${nombreFull}${dir ? '\n*Consultorio:* ' + dir : ''}\n\nSi no podés asistir, avisame a la brevedad.${tel ? ' Tel: ' + tel : ''}`,
      pago: `Hola! Te comento que tenés un saldo pendiente 💰\nPodés coordinar el pago cuando gustes.${tel ? '\nContacto: ' + tel : ''}`
    };

    for (const [key, txt] of Object.entries(textos)) {
      const el = document.getElementById('wp-prev-' + key);
      if (el) el.textContent = txt;
    }
  }

  window.wpUsarPlantilla = function(tipo) {
    if (!wpPacSeleccionado) {
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
    wpEnviarMensaje(wpPacSeleccionado, msg, tipo);
  };

  // ── ENVIAR MENSAJE ──
  async function wpEnviarMensaje(pac, msg, tipo='libre') {
    try {
      // Normalizar teléfono a formato internacional Argentina
      let telNorm = (pac.telefono || '').replace(/\D/g,'');
      if (telNorm.startsWith('0')) telNorm = telNorm.slice(1);
      if (!telNorm.startsWith('54')) telNorm = '54' + telNorm;
      if (telNorm.startsWith('54') && !telNorm.startsWith('549')) telNorm = '549' + telNorm.slice(2);

      // ── Abrir WhatsApp Web directamente (garantiza el envío) ──
      const waUrl = `https://wa.me/${telNorm}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');

      // ── Intentar Edge Function en paralelo (silencioso) ──
      try {
        const tel = '+' + telNorm;
        await fetch('https://terlbqrcampdqtxjbihg.supabase.co/functions/v1/enviar-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${wpSessionToken}` },
          body: JSON.stringify({ to: tel, nombre: pac.nombre, mensaje: msg }),
        });
      } catch(_) { /* Edge Function opcional, wa.me ya fue abierto */ }

      // ── Guardar en historial (tabla wa_historial) ──
      await wpGuardarEnHistorial({ paciente_id: pac.id, tipo, mensaje: msg });

      // Descontar del contador de suscripción
      if (typeof registrarUso === 'function') registrarUso('whatsapp');
      if (typeof window._syncWaUsos === 'function') window._syncWaUsos();

      wpMostrarToast(`✅ WhatsApp abierto para ${pac.nombre}`);
      wpPacSeleccionado = null;

      // Recargar historial si está visible
      if (document.getElementById('wp-view-historial')?.classList.contains('active')) {
        await wpCargarHistorial();
      }
    } catch(e) {
      wpMostrarToast('❌ Error al enviar: ' + e.message, false);
    }
  }

  // ── GUARDAR EN HISTORIAL ──
  async function wpGuardarEnHistorial({ paciente_id, tipo, mensaje }) {
    try {
      await sb.from('wa_historial').insert({
        user_id:    wpUserId,
        paciente_id: paciente_id || null,
        tipo:       tipo || 'libre',
        mensaje:    mensaje || '',
      });
    } catch(e) {
      console.warn('[WA] No se pudo guardar en historial:', e.message);
    }
  }
  // Exponerla globalmente para que view-agenda.js también pueda usarla
  window._wpGuardarEnHistorial = async function({ paciente_id, tipo, mensaje }) {
    if (!wpUserId) {
      const { data: { session } } = await sb.auth.getSession();
      if (session) wpUserId = session.user.id;
    }
    await sb.from('wa_historial').insert({
      user_id:    wpUserId,
      paciente_id: paciente_id || null,
      tipo:       tipo || 'confirmacion',
      mensaje:    mensaje || '',
    }).catch(e => console.warn('[WA Historial]', e.message));
  };

  // ── HISTORIAL ──
  window.wpCargarHistorial = async function() {
    const el = document.getElementById('wpHistList');
    if (el) el.innerHTML = '<div class="empty-sec"><div class="empty-icon">⏳</div>Cargando...</div>';

    // Lee de wa_historial (tabla con un registro por mensaje enviado)
    const { data, error } = await sb.from('wa_historial')
      .select('id, created_at, tipo, mensaje, paciente_id, pacientes(nombre, apellido)')
      .eq('user_id', wpUserId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('[WA Historial] Error al cargar:', error.message);
      // Si la tabla no existe todavía, mostrar mensaje amigable
      if (el) el.innerHTML = `
        <div class="empty-sec">
          <div class="empty-icon">⚠️</div>
          <p style="font-size:13px">Creá la tabla <strong>wa_historial</strong> en Supabase para activar el historial.</p>
        </div>`;
      return;
    }

    wpHistorialTodos = data || [];
    wpRenderHistorial();
  };

  window.wpFiltrarHistorial = function(tipo, el) {
    wpFiltroHistorial = tipo;
    container.querySelectorAll('.hist-filtro').forEach(e => e.classList.remove('active'));
    if (el) el.classList.add('active');
    wpRenderHistorial();
  };

  function wpRenderHistorial() {
    const el = document.getElementById('wpHistList');
    const cnt = document.getElementById('wp-hist-count');
    if (!el) return;
    const lista = wpFiltroHistorial === 'todos'
      ? wpHistorialTodos
      : wpHistorialTodos.filter(h => h.tipo === wpFiltroHistorial);
    if (cnt) cnt.textContent = lista.length + ' mensajes';
    if (!lista.length) {
      el.innerHTML = '<div class="empty-sec"><div class="empty-icon">📭</div>Sin mensajes aún</div>';
      return;
    }
    const iconos = { confirmacion:'📅', recordatorio:'🔔', pago:'💰', automatico:'⚡', libre:'✏️' };
    const tipoClass = { confirmacion:'tipo-confirmacion', recordatorio:'tipo-recordatorio', pago:'tipo-pago', automatico:'tipo-automatico' };
    el.innerHTML = lista.map(h => {
      const pac = h.pacientes;
      const nombre = pac ? `${pac.nombre} ${pac.apellido}` : 'Paciente desconocido';
      const iniciales = pac ? [(pac.nombre||'?')[0],(pac.apellido||'?')[0]].join('').toUpperCase() : '??';
      const color = WP_COLORES[(nombre).charCodeAt(0) % WP_COLORES.length];
      const fecha = new Date(h.created_at).toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      // Vista previa del mensaje (primeras 80 chars)
      const preview = h.mensaje ? h.mensaje.replace(/\n/g,' ').slice(0, 80) + (h.mensaje.length > 80 ? '…' : '') : '';
      const tipoLabel = { confirmacion:'Confirmación', recordatorio:'Recordatorio', pago:'Cobro', automatico:'Automático', libre:'Libre' };
      return `
        <div class="hist-card">
          <div class="hist-top">
            <div class="hist-avatar" style="background:${color}">${iniciales}</div>
            <div style="flex:1;min-width:0">
              <div class="hist-nombre">${nombre}</div>
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

  // ── AUTO: TURNOS MAÑANA ──
  window.wpCargarTurnosMañana = async function() {
    const el = document.getElementById('wpTurnosMañanaList');
    if (!el) return;

    const hoy = new Date();
    const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
    const dStr = manana.toISOString().split('T')[0];

    const { data } = await sb.from('turnos')
      .select('id,hora,paciente_id,pacientes(nombre,apellido,telefono)')
      .eq('user_id', wpUserId)
      .eq('fecha', dStr)
      .neq('estado', 'cancelado')
      .order('hora');

    wpTurnosProximos = data || [];

    if (!wpTurnosProximos.length) {
      el.innerHTML = '<div style="text-align:center;color:var(--muted);padding:16px;font-size:13px">No hay turnos para mañana</div>';
      return;
    }
    el.innerHTML = wpTurnosProximos.map(t => {
      const pac = t.pacientes;
      if (!pac) return '';
      const tieneWapp = !!pac.telefono;
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:20px">${tieneWapp ? '✅' : '⚠️'}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">${pac.nombre} ${pac.apellido}</div>
            <div style="font-size:12px;color:var(--muted)">${t.hora} hs${tieneWapp ? '' : ' — sin teléfono'}</div>
          </div>
        </div>`;
    }).join('');

    const { data: cfg } = await sb.from('profiles').select('recordatorio_auto,confirmacion_auto').eq('id', wpUserId).maybeSingle();
    if (cfg) {
      const tr = document.getElementById('wp-toggle-recordatorio');
      const tc = document.getElementById('wp-toggle-confirmacion');
      if (tr) tr.checked = !!cfg.recordatorio_auto;
      if (tc) tc.checked = !!cfg.confirmacion_auto;
    }
  };

  window.wpGuardarConfig = async function(campo, valor) {
    await sb.from('profiles').update({ [campo]: valor }).eq('id', wpUserId);
    wpMostrarToast(valor ? '✅ Activado' : '⏸ Desactivado');
  };

  window.wpEnviarRecordatoriosManual = async function() {
    const btn = container.querySelector('.btn-probar');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }
    try {
      let enviados = 0;
      for (const t of wpTurnosProximos) {
        const pac = t.pacientes;
        if (!pac?.telefono) continue;
        const puedeEnviar = typeof verificarLimiteWA !== 'undefined'
          ? await verificarLimiteWA(sb, wpUserId) : true;
        if (!puedeEnviar) break;

        let tel = pac.telefono.replace(/\D/g,'');
        if (tel.startsWith('0')) tel = tel.slice(1);
        if (!tel.startsWith('54')) tel = '54' + tel;
        if (tel.startsWith('54') && !tel.startsWith('549')) tel = '549' + tel.slice(2);
        tel = '+' + tel;

        await fetch('https://terlbqrcampdqtxjbihg.supabase.co/functions/v1/enviar-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${wpSessionToken}` },
          body: JSON.stringify({ to: tel, nombre: pac.nombre, hora: t.hora }),
        });
        if (typeof registrarUsoWA !== 'undefined') await registrarUsoWA(sb, wpUserId, pac.id || null);
        enviados++;
      }
      wpMostrarToast(`✅ ${enviados} recordatorio${enviados !== 1 ? 's' : ''} enviado${enviados !== 1 ? 's' : ''}`);
    } catch(e) {
      wpMostrarToast('❌ Error: ' + e.message, false);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '▶ Probar ahora — enviar recordatorios de mañana'; }
    }
  };

  // ── INIT PRINCIPAL ──
  async function wpInit() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;
    wpUserId = session.user.id;
    wpSessionToken = session.access_token;

    const { data: p } = await sb.from('profiles')
      .select('titulo,nombre_completo,direccion,telefono_profesional')
      .eq('id', wpUserId).maybeSingle();
    if (p) wpPerfilPro = p;

    wpRenderPlantillas();
    await wpCargarPacientes();
    await wpCargarTurnosMañana();
  }

  wpInit();
}

window.onViewEnter_whatsapp = initWhatsapp;
