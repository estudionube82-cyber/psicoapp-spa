/**
 * view-pacientes.js
 * ─────────────────────────────────────────────────────────────
 * Inyecta el HTML de Pacientes y registra su lógica propia.
 * NO duplica: Supabase (sb), toggleTheme, auth guard, ni fuentes.
 * Usa la instancia global `sb` definida en index.html.
 * ─────────────────────────────────────────────────────────────
 */

/* ── 1. CSS PROPIO DE ESTA VISTA ── */
(function injectPacientesStyles() {
  if (document.getElementById('view-pacientes-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-pacientes-styles';
  style.textContent = `
/* ── HEADER PACIENTES ── */
#view-pacientes .pac-header {
  background: linear-gradient(180deg, rgba(236,72,153,0.07) 0%, rgba(124,58,237,0.04) 100%);
  border-bottom: 1px solid rgba(124,58,237,0.10);
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: blur(8px);
}
#view-pacientes .pac-header-top {
  display: flex; align-items: center;
  padding: 14px 18px 10px; gap: 10px;
}
#view-pacientes .pac-header-title {
  flex: 1; text-align: center;
  font-size: 16px; font-weight: 800;
  color: var(--text);
}

/* ── SEARCH ── */
#view-pacientes .pac-search-bar { padding: 10px 16px 8px; display: flex; gap: 8px; }
#view-pacientes .pac-search-wrap { flex: 1; position: relative; }
#view-pacientes .pac-search-icon {
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%); font-size: 15px; color: var(--text-muted);
}
#view-pacientes .pac-search-input {
  width: 100%; background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 12px; padding: 10px 14px 10px 36px;
  font-size: 14px; font-family: var(--font); color: var(--text); outline: none;
}
#view-pacientes .pac-search-input:focus { border-color: var(--primary); }

/* ── FILTER CHIPS ── */
#view-pacientes .pac-filter-row {
  display: flex; gap: 8px; padding: 0 16px 12px;
  overflow-x: auto; scrollbar-width: none; align-items: center;
}
#view-pacientes .pac-filter-row::-webkit-scrollbar { display: none; }
#view-pacientes .fchip-p {
  padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;
  white-space: nowrap; cursor: pointer; border: 1.5px solid var(--border);
  background: var(--bg); color: var(--text-muted); font-family: var(--font);
}
#view-pacientes .fchip-p.active { background: var(--primary); color: white; border-color: var(--primary); }

/* ── STATS ── */
#view-pacientes .pac-stats-mini { display: flex; gap: 10px; padding: 0 16px 14px; }
#view-pacientes .pac-stat-mini {
  flex: 1; background: var(--surface); border-radius: 12px;
  padding: 10px 6px; box-shadow: var(--shadow-sm); text-align: center;
}
#view-pacientes .pac-stat-mini-num { font-size: 20px; font-weight: 800; color: var(--primary); }
#view-pacientes .pac-stat-mini-label { font-size: 10px; color: var(--text-muted); font-weight: 600; margin-top: 1px; }

/* ── PATIENT LIST ── */
#view-pacientes .pac-patient-list { padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }
#view-pacientes .pac-alpha-divider {
  font-size: 11px; font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 1.5px; padding: 8px 4px 2px;
}
#view-pacientes .pac-patient-card {
  background: var(--surface); border-radius: var(--radius);
  padding: 13px 14px; display: flex; align-items: center; gap: 12px;
  box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.15s;
  border: 1px solid var(--border);
}
#view-pacientes .pac-patient-card:active { transform: scale(0.98); }
#view-pacientes .pac-patient-avatar {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; flex-shrink: 0;
}
#view-pacientes .av-green  { background: var(--primary-light); color: var(--primary); }
#view-pacientes .av-blue   { background: rgba(124,58,237,0.12); color: #7C3AED; }
#view-pacientes .av-purple { background: rgba(124,58,237,0.15); color: var(--primary); }
#view-pacientes .av-orange { background: var(--accent-light,#FDE8F5); color: #9A3412; }
#view-pacientes .av-teal   { background: rgba(124,58,237,0.10); color: #7C3AED; }
#view-pacientes .pac-patient-info { flex: 1; min-width: 0; }
#view-pacientes .pac-patient-name { font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#view-pacientes .pac-patient-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
#view-pacientes .pac-patient-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
#view-pacientes .pac-patient-badge { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 20px; white-space: nowrap; }
#view-pacientes .pb-os         { background: rgba(124,58,237,0.15); color: var(--primary); }
#view-pacientes .pb-particular { background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); }

/* ── EMPTY / LOADING ── */
#view-pacientes .pac-empty-state {
  text-align: center; padding: 48px 24px; color: var(--text-muted);
}
#view-pacientes .pac-empty-icon { font-size: 48px; margin-bottom: 12px; }
#view-pacientes .pac-empty-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
#view-pacientes .pac-empty-sub { font-size: 13px; }
#view-pacientes .pac-loading-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; }

/* ── FAB ── */
#view-pacientes .pac-fab {
  position: fixed; bottom: 80px; right: 20px;
  width: 52px; height: 52px; background: var(--primary);
  border-radius: 16px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(91,47,168,0.4);
  cursor: pointer; font-size: 28px; color: white; border: none; z-index: 40;
  transition: transform 0.15s;
}
#view-pacientes .pac-fab:active { transform: scale(0.93); }
@media (min-width: 768px) {
  #view-pacientes .pac-fab { bottom: 24px; }
}

/* ── MODALS (overlay + sheet) ── */
.pac-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  z-index: 200; display: none; align-items: flex-end; justify-content: center;
}
.pac-overlay.open { display: flex; }
.pac-modal {
  background: var(--surface); border-radius: 28px 28px 0 0;
  padding: 20px 20px 40px;
  width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto;
  animation: pacSlideUp 0.25s ease;
}
@keyframes pacSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.pac-modal-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 20px; }
.pac-modal-title { font-size: 20px; font-weight: 800; margin-bottom: 2px; color: var(--text); }
.pac-modal-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 22px; }

/* ── FORM FIELDS ── */
.pac-field { margin-bottom: 14px; }
.pac-field-label {
  font-size: 11px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;
  display: flex; align-items: center; gap: 6px;
}
.pac-req-star { color: var(--primary); font-size: 14px; }
.pac-field-input {
  width: 100%; border: 1.5px solid var(--border); border-radius: 14px;
  padding: 14px 16px; font-size: 16px; font-family: var(--font);
  color: var(--text); background: var(--bg); outline: none;
}
.pac-field-input:focus { border-color: var(--primary); background: var(--surface); }
.pac-field-input.wp { padding-left: 46px; }
.pac-field-wrap { position: relative; }
.pac-field-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 18px; }

.pac-divider { display: flex; align-items: center; gap: 10px; margin: 18px 0 16px; }
.pac-divider-line { flex: 1; height: 1px; background: var(--border); }
.pac-divider-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }

.pac-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.pac-btn-crear {
  width: 100%; background: var(--primary); color: white;
  border: none; border-radius: 14px; padding: 16px;
  font-size: 16px; font-weight: 700; font-family: var(--font);
  cursor: pointer; margin-top: 8px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.pac-btn-crear:disabled { opacity: 0.6; cursor: not-allowed; }

.pac-msg-error {
  background: #fdf0ef; color: #B94A48; border: 1px solid #f0c8c7;
  border-radius: 10px; padding: 10px 14px; font-size: 13px;
  margin-bottom: 12px; display: none;
}

/* ── DETALLE ── */
.pac-detail-actions { display: flex; gap: 10px; margin-top: 20px; }
.pac-btn-action {
  flex: 1; padding: 13px; border-radius: 12px; border: none;
  font-family: var(--font); font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.pac-btn-wp  { background: #E8F8EE; color: #1B5E20; }
.pac-btn-del { background: #fdf0ef; color: #B94A48; }

/* ── IA PULSE ── */
@keyframes iaPulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
  `;
  document.head.appendChild(style);
})();


/* ── 2. HTML DE LA VISTA ── */
(function injectPacientesHTML() {
  const view = document.getElementById('view-pacientes');
  if (!view) return;

  view.innerHTML = `
<!-- HEADER -->
<div class="pac-header">
  <div class="pac-header-top">
    <div style="width:34px"></div>
    <div class="pac-header-title">Pacientes</div>
    <div style="width:34px"></div>
  </div>
  <div class="pac-search-bar">
    <div class="pac-search-wrap">
      <div class="pac-search-icon">🔍</div>
      <input class="pac-search-input" id="pac-searchInput"
        placeholder="Buscar paciente...">
    </div>
  </div>
  <div class="pac-filter-row">
    <button class="fchip-p active" id="pac-chip-todos">
      Todos (<span id="pac-cnt-todos">0</span>)
    </button>
    <button class="fchip-p" id="pac-chip-os">🏥 Obra social</button>
    <button class="fchip-p" id="pac-chip-particular">💳 Particular</button>
  </div>
</div>

<!-- STATS -->
<div class="pac-stats-mini">
  <div class="pac-stat-mini">
    <div class="pac-stat-mini-num" id="pac-stat-activos">—</div>
    <div class="pac-stat-mini-label">Activos</div>
  </div>
  <div class="pac-stat-mini">
    <div class="pac-stat-mini-num" id="pac-stat-os" style="color:var(--primary)">—</div>
    <div class="pac-stat-mini-label">Obra social</div>
  </div>
  <div class="pac-stat-mini">
    <div class="pac-stat-mini-num" id="pac-stat-part" style="color:var(--accent)">—</div>
    <div class="pac-stat-mini-label">Particular</div>
  </div>
</div>

<!-- LISTA -->
<div class="pac-patient-list" id="pac-patientList">
  <div class="pac-loading-state">Cargando pacientes...</div>
</div>

<!-- FAB -->
<button class="pac-fab" id="pac-fabBtn">＋</button>

<!-- MODAL NUEVO PACIENTE -->
<div class="pac-overlay" id="pac-overlay">
  <div class="pac-modal">
    <div class="pac-modal-handle"></div>
    <div class="pac-modal-title">➕ Nuevo paciente</div>
    <div class="pac-modal-sub">Solo nombre y apellido son obligatorios.</div>
    <div id="pac-msgError" class="pac-msg-error"></div>
    <div class="pac-two-col">
      <div class="pac-field">
        <label class="pac-field-label">Nombre <span class="pac-req-star">*</span></label>
        <input class="pac-field-input" id="pac-f-nombre" placeholder="María" type="text">
      </div>
      <div class="pac-field">
        <label class="pac-field-label">Apellido <span class="pac-req-star">*</span></label>
        <input class="pac-field-input" id="pac-f-apellido" placeholder="González" type="text">
      </div>
    </div>
    <div class="pac-field">
      <label class="pac-field-label">WhatsApp</label>
      <div class="pac-field-wrap">
        <div class="pac-field-prefix">💬</div>
        <input class="pac-field-input wp" id="pac-f-telefono" placeholder="2346 699176" type="tel">
      </div>
    </div>
    <div class="pac-field">
      <label class="pac-field-label">Email</label>
      <input class="pac-field-input" id="pac-f-email" placeholder="mail@ejemplo.com" type="email">
    </div>
    <div class="pac-divider">
      <div class="pac-divider-line"></div>
      <div class="pac-divider-label">Datos opcionales</div>
      <div class="pac-divider-line"></div>
    </div>
    <div class="pac-two-col">
      <div class="pac-field">
        <label class="pac-field-label">DNI</label>
        <input class="pac-field-input" id="pac-f-dni" placeholder="12.345.678" type="text">
      </div>
      <div class="pac-field">
        <label class="pac-field-label">Fecha de nac.</label>
        <input class="pac-field-input" id="pac-f-fnac" type="date">
      </div>
    </div>
    <div class="pac-field">
      <label class="pac-field-label">Obra social</label>
      <input class="pac-field-input" id="pac-f-os" placeholder="OSDE, IOMA..." type="text">
    </div>
    <div class="pac-field">
      <label class="pac-field-label">Nº de afiliado</label>
      <input class="pac-field-input" id="pac-f-nroafil" placeholder="Solo si tiene obra social" type="text">
    </div>
    <div class="pac-field">
      <label class="pac-field-label">Notas / Motivo de consulta</label>
      <textarea class="pac-field-input" id="pac-f-notas"
        placeholder="Derivación, motivo de consulta..."
        style="resize:none;min-height:72px;font-size:15px;line-height:1.5"></textarea>
    </div>
    <button class="pac-btn-crear" id="pac-btnCrear">
      ✓ Crear paciente
    </button>
    <button id="pac-btnCancelarModal"
      style="width:100%;background:none;border:none;padding:14px;font-size:14px;color:var(--text-muted);font-family:var(--font);cursor:pointer;margin-top:4px">
      Cancelar
    </button>
  </div>
</div>

<!-- MODAL DETALLE -->
<div class="pac-overlay" id="pac-overlayDetalle">
  <div class="pac-modal">
    <div class="pac-modal-handle"></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div class="pac-patient-avatar av-green" id="pac-det-avatar"
        style="width:54px;height:54px;font-size:18px"></div>
      <div>
        <div style="font-size:20px;font-weight:800;color:var(--text)" id="pac-det-nombre"></div>
        <div style="font-size:13px;color:var(--text-muted)" id="pac-det-meta"></div>
      </div>
    </div>
    <div id="pac-det-body" style="display:flex;flex-direction:column;gap:8px;font-size:14px"></div>

    <div class="pac-detail-actions">
      <button class="pac-btn-action pac-btn-wp" id="pac-det-wp-btn">💬 WhatsApp</button>
      <button class="pac-btn-action" id="pac-btnEditar"
        style="background:var(--primary-light);color:var(--primary)">✏️ Editar</button>
      <button class="pac-btn-action pac-btn-del" id="pac-btnEliminar">🗑 Eliminar</button>
    </div>

    <!-- PANEL IA -->
    <div style="margin-top:12px">
      <button id="pac-btnToggleIA"
        style="width:100%;background:linear-gradient(135deg,#059669,#10B981);color:white;border:none;border-radius:14px;padding:13px;font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
        🤖 Mensaje con IA
      </button>
      <div id="pac-panelIA" style="display:none;margin-top:10px;background:var(--surface2);border-radius:14px;padding:14px">

        <div id="pac-proximoTurnoPA" style="display:none;background:var(--surface);border-radius:11px;padding:10px 12px;margin-bottom:10px;border-left:3px solid var(--primary)">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">Próximo turno agendado</div>
          <div id="pac-proximoTurnoTextoPA" style="font-size:13px;font-weight:700;color:var(--primary)"></div>
        </div>

        <div id="pac-iaOpcionesWrap">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Tipo de mensaje</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button id="pac-ia-recordatorio" style="background:var(--primary-light);color:var(--primary);border:none;border-radius:11px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;text-align:left">⏰ Recordatorio de turno</button>
            <button id="pac-ia-ausente" style="background:#FEE2E2;color:#991B1B;border:none;border-radius:11px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;text-align:left">❌ Paciente ausente</button>
            <button id="pac-ia-seguimiento" style="background:#ECFDF5;color:#065F46;border:none;border-radius:11px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;text-align:left">💚 Seguimiento / Cómo estás</button>
            <button id="pac-ia-reprogramar" style="background:#FEF3C7;color:#92400E;border:none;border-radius:11px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;text-align:left">🔄 Reprogramar turno</button>
          </div>
        </div>

        <div id="pac-reprogramarWrap" style="display:none">
          <div id="pac-turnoActualWrap" style="display:none;background:#FFFBEB;border-radius:9px;padding:8px 10px;margin-bottom:8px;font-size:12px;color:#92400E">
            <strong>Turno actual:</strong> <span id="pac-turnoActualTexto"></span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">¿Cuál es la nueva fecha y hora?</div>
          <textarea id="pac-reprogramarInput"
            style="width:100%;background:var(--surface);border:1.5px solid var(--border);border-radius:11px;padding:10px 12px;font-size:13px;font-family:var(--font);min-height:60px;outline:none;resize:vertical;color:var(--text)"
            placeholder='Ej: "mañana a las 18hs" o "el 3/4 a las 10:00"'></textarea>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button id="pac-ia-generar-reprog" style="flex:1;background:var(--sb-bg,#1E1040);color:white;border:none;border-radius:11px;padding:10px;font-size:13px;font-weight:700;cursor:pointer">✨ Generar mensaje</button>
            <button id="pac-ia-cancelar-reprog"
              style="background:var(--border);color:var(--text-muted);border:none;border-radius:11px;padding:10px 14px;font-size:13px;font-weight:700;cursor:pointer">✕</button>
          </div>
        </div>

        <div id="pac-iaLoading" style="display:none;align-items:center;gap:8px;padding:12px 0">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--primary);animation:iaPulse 1.2s infinite"></div>
          <div style="width:8px;height:8px;border-radius:50%;background:var(--primary);animation:iaPulse 1.2s infinite;animation-delay:.2s"></div>
          <div style="width:8px;height:8px;border-radius:50%;background:var(--primary);animation:iaPulse 1.2s infinite;animation-delay:.4s"></div>
          <span style="font-size:12px;color:var(--text-muted)">Redactando mensaje…</span>
        </div>

        <div id="pac-iaResultado" style="display:none;margin-top:10px">
          <div id="pac-iaMensaje" style="background:var(--surface);border-radius:11px;padding:12px 14px;font-size:13px;line-height:1.7;color:var(--text);white-space:pre-wrap"></div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button id="pac-ia-copiar" style="flex:1;background:var(--primary-light);color:var(--primary);border:none;border-radius:11px;padding:10px;font-size:13px;font-weight:700;cursor:pointer">📋 Copiar</button>
            <button id="pac-ia-enviar-wa" style="flex:1;background:#25D366;color:white;border:none;border-radius:11px;padding:10px;font-size:13px;font-weight:700;cursor:pointer">📱 WhatsApp</button>
          </div>
          <button id="pac-ia-otro-mensaje"
            style="width:100%;background:none;border:none;padding:8px;font-size:12px;color:var(--text-muted);cursor:pointer;margin-top:4px">← Otro mensaje</button>
        </div>
      </div>
    </div>

    <button id="pac-btnHistoria"
      style="width:100%;background:var(--primary);color:white;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:700;font-family:var(--font);cursor:pointer;margin-top:10px;display:flex;align-items:center;justify-content:center;gap:8px">
      🧠 Ver Historia Clínica
    </button>
    <button id="pac-btnCerrarDetalle"
      style="width:100%;background:none;border:none;padding:14px;font-size:14px;color:var(--text-muted);font-family:var(--font);cursor:pointer;margin-top:4px">
      Cerrar
    </button>
  </div>
</div>
  `;

  /* Cerrar overlays al tocar fuera */
  document.getElementById('pac-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('pac-overlay')) pacCerrarModal();
  });
  document.getElementById('pac-overlayDetalle').addEventListener('click', e => {
    if (e.target === document.getElementById('pac-overlayDetalle')) pacCerrarDetalle();
  });

  /* ── Binds de eventos (reemplazan todos los onclick/oninput inline) ── */
  document.getElementById('pac-searchInput')
    .addEventListener('input', pacFiltrar);

  document.getElementById('pac-chip-todos')
    .addEventListener('click', function() { pacSetFiltro('todos', this); });
  document.getElementById('pac-chip-os')
    .addEventListener('click', function() { pacSetFiltro('os', this); });
  document.getElementById('pac-chip-particular')
    .addEventListener('click', function() { pacSetFiltro('particular', this); });

  document.getElementById('pac-fabBtn')
    .addEventListener('click', pacAbrirModal);

  document.getElementById('pac-btnCrear')
    .addEventListener('click', pacCrearPaciente);
  document.getElementById('pac-btnCancelarModal')
    .addEventListener('click', pacCerrarModal);

  document.getElementById('pac-btnEditar')
    .addEventListener('click', pacAbrirEditar);
  document.getElementById('pac-btnEliminar')
    .addEventListener('click', pacEliminarPaciente);
  document.getElementById('pac-btnToggleIA')
    .addEventListener('click', pacTogglePanelIA);
  document.getElementById('pac-btnHistoria')
    .addEventListener('click', pacIrHistoriaClinica);
  document.getElementById('pac-btnCerrarDetalle')
    .addEventListener('click', pacCerrarDetalle);

  document.getElementById('pac-ia-recordatorio')
    .addEventListener('click', () => pacGenerarMensajeIA('recordatorio'));
  document.getElementById('pac-ia-ausente')
    .addEventListener('click', () => pacGenerarMensajeIA('ausente'));
  document.getElementById('pac-ia-seguimiento')
    .addEventListener('click', () => pacGenerarMensajeIA('seguimiento'));
  document.getElementById('pac-ia-reprogramar')
    .addEventListener('click', pacMostrarReprogramar);
  document.getElementById('pac-ia-generar-reprog')
    .addEventListener('click', pacProcesarReprogramar);
  document.getElementById('pac-ia-cancelar-reprog')
    .addEventListener('click', () => {
      document.getElementById('pac-reprogramarWrap').style.display = 'none';
      document.getElementById('pac-iaOpcionesWrap').style.display = 'block';
    });
  document.getElementById('pac-ia-copiar')
    .addEventListener('click', pacCopiarMensaje);
  document.getElementById('pac-ia-enviar-wa')
    .addEventListener('click', pacEnviarWA);
  document.getElementById('pac-ia-otro-mensaje')
    .addEventListener('click', () => {
      document.getElementById('pac-iaResultado').style.display = 'none';
      document.getElementById('pac-iaOpcionesWrap').style.display = 'block';
    });
})();


/* ── 3. ESTADO Y LÓGICA DE ESTA VISTA ── */

let _pacTodos = [];
let _pacFiltro = 'todos';
let _pacSeleccionado = null;
let _pacActualIA = null;
let _pacProximoTurno = null;
let _pacModoEdicion = false;   // true = modal crear está en modo edición
let _pacEditandoId  = null;    // id del paciente que se está editando

const PAC_COLORES = ['av-green','av-blue','av-purple','av-orange','av-teal'];

/* ── Carga ── */
async function pacCargar() {
  const list = document.getElementById('pac-patientList');
  list.innerHTML = '<div class="pac-loading-state">Cargando pacientes...</div>';
  try {
    const data = await PsicoRouter.store.ensurePacientes();
    _pacTodos = data || [];
    pacActualizarStats();
    pacRenderLista(_pacTodos);
  } catch(e) {
    list.innerHTML = '<div class="pac-loading-state">Error al cargar pacientes.</div>';
  }
}

// Refrescar automáticamente si otra vista modifica pacientes
window.addEventListener('storeUpdated', (e) => {
  const type = e.detail?.type;
  if (type === 'pacientes' || !type) pacCargar();
});

function pacActualizarStats() {
  const total = _pacTodos.length;
  const conOS  = _pacTodos.filter(p => p.obra_social).length;
  const part   = total - conOS;
  document.getElementById('pac-stat-activos').textContent = total;
  document.getElementById('pac-stat-os').textContent = conOS;
  document.getElementById('pac-stat-part').textContent = part;
  document.getElementById('pac-cnt-todos').textContent = total;
}

function pacRenderLista(lista) {
  const container = document.getElementById('pac-patientList');
  if (!lista.length) {
    container.innerHTML = `
      <div class="pac-empty-state">
        <div class="pac-empty-icon">👥</div>
        <div class="pac-empty-title">Sin pacientes aún</div>
        <div class="pac-empty-sub">Tocá el botón + para agregar tu primer paciente.</div>
      </div>`;
    return;
  }
  let html = '';
  let letraActual = '';
  lista.forEach((p, i) => {
    const i1 = (p.nombre  || '?')[0].toUpperCase();
    const i2 = (p.apellido|| '?')[0].toUpperCase();
    const color = PAC_COLORES[i % PAC_COLORES.length];
    const letra = i2;
    if (letra !== letraActual) {
      letraActual = letra;
      html += `<div class="pac-alpha-divider">${escHtml(letra)}</div>`;
    }
    const badge = p.obra_social
      ? `<div class="pac-patient-badge pb-os">${escHtml(p.obra_social)}</div>`
      : `<div class="pac-patient-badge pb-particular">Particular</div>`;
    const tel = p.telefono ? `💬 ${escHtml(p.telefono)}` : 'Sin teléfono';
    html += `
      <div class="pac-patient-card" data-pac-id="${escAttr(String(p.id))}">
        <div class="pac-patient-avatar ${color}">${escHtml(i1)}${escHtml(i2)}</div>
        <div class="pac-patient-info">
          <div class="pac-patient-name">${escHtml(p.apellido)}, ${escHtml(p.nombre)}</div>
          <div class="pac-patient-meta">${tel}</div>
        </div>
        <div class="pac-patient-right">${badge}</div>
      </div>`;
  });
  container.innerHTML = html;
  container.querySelectorAll('.pac-patient-card').forEach(el => {
    el.addEventListener('click', () => pacAbrirDetalle(el.dataset.pacId));
  });
}

function pacFiltrar() {
  const q = document.getElementById('pac-searchInput').value.toLowerCase();
  let lista = _pacTodos;
  if (_pacFiltro === 'os')         lista = lista.filter(p => p.obra_social);
  if (_pacFiltro === 'particular') lista = lista.filter(p => !p.obra_social);
  if (q) lista = lista.filter(p =>
    (p.nombre + ' ' + p.apellido).toLowerCase().includes(q) ||
    (p.telefono || '').includes(q)
  );
  pacRenderLista(lista);
}

function pacSetFiltro(f, el) {
  _pacFiltro = f;
  document.querySelectorAll('#view-pacientes .fchip-p').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  pacFiltrar();
}

/* ── Modal nuevo ── */
function pacAbrirModal() {
  _pacModoEdicion = false;
  _pacEditandoId  = null;
  ['pac-f-nombre','pac-f-apellido','pac-f-telefono','pac-f-email','pac-f-dni','pac-f-os','pac-f-nroafil','pac-f-notas','pac-f-fnac'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelector('#pac-overlay .pac-modal-title').textContent = '➕ Nuevo paciente';
  document.getElementById('pac-btnCrear').textContent = '✓ Crear paciente';
  document.getElementById('pac-msgError').style.display = 'none';
  document.getElementById('pac-overlay').classList.add('open');
  setTimeout(() => document.getElementById('pac-f-nombre').focus(), 300);
}

/* ── Modal editar ── */
function pacAbrirEditar() {
  if (!_pacSeleccionado) return;
  const p = _pacSeleccionado;
  _pacModoEdicion = true;
  _pacEditandoId  = p.id;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('pac-f-nombre',   p.nombre);
  set('pac-f-apellido', p.apellido);
  set('pac-f-telefono', p.telefono);
  set('pac-f-email',    p.email);
  set('pac-f-dni',      p.dni);
  set('pac-f-fnac',     p.fecha_nacimiento);
  set('pac-f-os',       p.obra_social);
  set('pac-f-nroafil',  p.nro_afiliado);
  set('pac-f-notas',    p.notas);

  document.querySelector('#pac-overlay .pac-modal-title').textContent = '✏️ Editar paciente';
  document.getElementById('pac-btnCrear').textContent = '✓ Guardar cambios';
  document.getElementById('pac-msgError').style.display = 'none';

  pacCerrarDetalle();
  document.getElementById('pac-overlay').classList.add('open');
  setTimeout(() => document.getElementById('pac-f-nombre').focus(), 300);
}

function pacCerrarModal() {
  document.getElementById('pac-overlay').classList.remove('open');
}

async function pacCrearPaciente() {
  const nombre   = document.getElementById('pac-f-nombre').value.trim();
  const apellido = document.getElementById('pac-f-apellido').value.trim();
  if (!nombre || !apellido) { pacMostrarError('Nombre y apellido son obligatorios.'); return; }

  const btn = document.getElementById('pac-btnCrear');
  btn.disabled = true; btn.textContent = 'Guardando...';

  const campos = {
    nombre,
    apellido,
    telefono:         document.getElementById('pac-f-telefono').value.trim() || null,
    email:            document.getElementById('pac-f-email').value.trim() || null,
    dni:              document.getElementById('pac-f-dni').value.trim() || null,
    fecha_nacimiento: document.getElementById('pac-f-fnac').value || null,
    obra_social:      document.getElementById('pac-f-os').value.trim() || null,
    nro_afiliado:     document.getElementById('pac-f-nroafil').value.trim() || null,
    notas:            document.getElementById('pac-f-notas').value.trim() || null,
  };

  let error;
  if (_pacModoEdicion && _pacEditandoId) {
    /* Edición */
    ({ error } = await sb.from('pacientes')
      .update(campos)
      .eq('id', _pacEditandoId)
      .eq('user_id', PsicoRouter.store.userId));
  } else {
    /* Creación */
    ({ error } = await sb.from('pacientes').insert({
      user_id: PsicoRouter.store.userId,
      activo:  true,
      ...campos,
    }));
  }

  btn.disabled = false; btn.textContent = _pacModoEdicion ? '✓ Guardar cambios' : '✓ Crear paciente';
  if (error) { pacMostrarError('Error al guardar. Intentá de nuevo.'); return; }
  PsicoRouter.store.invalidatePacientes();
  window.dispatchEvent(new CustomEvent('storeUpdated', { detail: { type: 'pacientes' } }));
  pacCerrarModal();
  await pacCargar();
}

function pacMostrarError(msg) {
  const el = document.getElementById('pac-msgError');
  el.textContent = msg; el.style.display = 'block';
}

/* ── Detalle ── */
function pacAbrirDetalle(id) {
  const p = _pacTodos.find(x => x.id === id);
  if (!p) return;
  _pacSeleccionado = p;
  _pacActualIA = p;

  document.getElementById('pac-det-avatar').textContent =
    (p.nombre||'?')[0].toUpperCase() + (p.apellido||'?')[0].toUpperCase();
  document.getElementById('pac-det-nombre').textContent = `${p.nombre || ''} ${p.apellido || ''}`.trim();
  document.getElementById('pac-det-meta').textContent = p.obra_social || 'Particular';

  const detBody = document.getElementById('pac-det-body');
  detBody.textContent = '';
  const filas = [];
  if (p.telefono)         filas.push(pacFila('💬','Teléfono', p.telefono));
  if (p.email)            filas.push(pacFila('✉️','Email', p.email));
  if (p.dni)              filas.push(pacFila('🪪','DNI', p.dni));
  if (p.fecha_nacimiento) filas.push(pacFila('🎂','Nacimiento', pacFormatFecha(p.fecha_nacimiento)));
  if (p.obra_social)      filas.push(pacFila('🏥','Obra social', p.obra_social + (p.nro_afiliado ? ` · Afil. ${p.nro_afiliado}` : '')));
  if (p.notas)            filas.push(pacFila('📝','Notas', p.notas));
  if (filas.length) {
    filas.forEach(fila => detBody.appendChild(fila));
  } else {
    const empty = document.createElement('div');
    empty.style.cssText = 'color:var(--text-muted);font-size:13px';
    empty.textContent = 'Sin datos adicionales.';
    detBody.appendChild(empty);
  }

  const wpBtn = document.getElementById('pac-det-wp-btn');
  wpBtn._waClickHandler && wpBtn.removeEventListener('click', wpBtn._waClickHandler);
  if (p.telefono) {
    let num = p.telefono.replace(/\D/g,'');
    if (!num.startsWith('549')) num = '549' + num.replace(/^0?/,'');
    wpBtn._waNum = num;
    wpBtn._waClickHandler = () => window.open(`https://wa.me/${num}`, '_blank');
    wpBtn.addEventListener('click', wpBtn._waClickHandler);
    wpBtn.style.opacity = '1';
  } else {
    wpBtn._waNum = '';
    wpBtn._waClickHandler = null;
    wpBtn.style.opacity = '0.4';
  }

  /* Reset panel IA */
  document.getElementById('pac-panelIA').style.display = 'none';
  document.getElementById('pac-btnToggleIA').textContent = '🤖 Mensaje con IA';
  document.getElementById('pac-iaOpcionesWrap').style.display = 'block';
  document.getElementById('pac-iaResultado').style.display = 'none';
  document.getElementById('pac-reprogramarWrap').style.display = 'none';
  document.getElementById('pac-proximoTurnoPA').style.display = 'none';

  document.getElementById('pac-overlayDetalle').classList.add('open');
  pacCargarProximoTurno(p.id);
}

function pacFila(icon, label, val) {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)';

  const iconSpan = document.createElement('span');
  iconSpan.style.fontSize = '16px';
  iconSpan.textContent = icon;

  const inner = document.createElement('div');

  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = 'font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.5px';
  labelDiv.textContent = label;

  const valDiv = document.createElement('div');
  valDiv.style.cssText = 'font-size:14px;font-weight:600;margin-top:2px;color:var(--text)';
  valDiv.textContent = val;

  inner.appendChild(labelDiv);
  inner.appendChild(valDiv);
  row.appendChild(iconSpan);
  row.appendChild(inner);
  return row;
}

function pacCerrarDetalle() {
  document.getElementById('pac-overlayDetalle').classList.remove('open');
  _pacSeleccionado = null;
}

function pacIrHistoriaClinica() {
  if (!_pacSeleccionado) return;
  PsicoRouter.store.pacienteSeleccionado = _pacSeleccionado;
  navigate('historia');
}

async function pacEliminarPaciente() {
  if (!_pacSeleccionado) return;
  if (!confirm(`¿Eliminar a ${_pacSeleccionado.nombre} ${_pacSeleccionado.apellido}?`)) return;
  const _uid = PsicoRouter.store.userId;
  await sb.from('pacientes').update({ activo: false }).eq('id', _pacSeleccionado.id).eq('user_id', _uid);
  PsicoRouter.store.invalidatePacientes();
  window.dispatchEvent(new CustomEvent('storeUpdated', { detail: { type: 'pacientes' } }));
  pacCerrarDetalle();
  await pacCargar();
}

function pacFormatFecha(f) {
  if (!f) return '';
  const [y,m,d] = f.split('-');
  return `${d}/${m}/${y}`;
}

/* ── IA ── */
async function pacCargarProximoTurno(pacienteId) {
  _pacProximoTurno = null;
  document.getElementById('pac-proximoTurnoPA').style.display = 'none';
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await sb
      .from('turnos')
      .select('id, fecha, hora')
      .eq('paciente_id', pacienteId)
      .eq('user_id', PsicoRouter.store.userId)
      .gte('fecha', hoy)
      .order('fecha', { ascending: true })
      .order('hora',  { ascending: true })
      .limit(1);
    if (data && data.length > 0) {
      const t = data[0];
      const [anio,mes,dia] = t.fecha.split('-');
      const fechaFormateada = `${dia}/${mes}/${anio}`;
      const horaFormateada = t.hora ? t.hora.substring(0,5) : '';
      _pacProximoTurno = { id: t.id, fecha: t.fecha, hora: t.hora, fechaFormateada, horaFormateada };
      document.getElementById('pac-proximoTurnoTextoPA').textContent =
        `${fechaFormateada} a las ${horaFormateada} hs`;
      document.getElementById('pac-proximoTurnoPA').style.display = 'block';
    }
  } catch(e) { /* sin turno */ }
}

function pacTogglePanelIA() {
  const panel = document.getElementById('pac-panelIA');
  const btn   = document.getElementById('pac-btnToggleIA');
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'block';
  btn.textContent = visible ? '🤖 Mensaje con IA' : '✕ Cerrar IA';
  if (!visible) {
    document.getElementById('pac-iaOpcionesWrap').style.display = 'block';
    document.getElementById('pac-iaResultado').style.display = 'none';
    document.getElementById('pac-reprogramarWrap').style.display = 'none';
  }
}

function pacMostrarReprogramar() {
  document.getElementById('pac-iaOpcionesWrap').style.display = 'none';
  document.getElementById('pac-reprogramarWrap').style.display = 'block';
  if (_pacProximoTurno) {
    document.getElementById('pac-turnoActualTexto').textContent =
      `${_pacProximoTurno.fechaFormateada} a las ${_pacProximoTurno.horaFormateada} hs`;
    document.getElementById('pac-turnoActualWrap').style.display = 'block';
  } else {
    document.getElementById('pac-turnoActualWrap').style.display = 'none';
  }
  document.getElementById('pac-reprogramarInput').focus();
}

function pacParsearFechaHora(texto) {
  let fecha = null, hora = null;
  const matchHora  = texto.match(/(\d{1,2})[:\.]?(\d{2})?\s*hs?/i);
  if (matchHora) {
    const h = matchHora[1].padStart(2,'0');
    const m = matchHora[2] ? matchHora[2].padStart(2,'0') : '00';
    hora = `${h}:${m}:00`;
  }
  const matchFecha = texto.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (matchFecha) {
    const d  = matchFecha[1].padStart(2,'0');
    const mo = matchFecha[2].padStart(2,'0');
    let y = matchFecha[3];
    if (!y) { const hoy = new Date(); y = hoy.getFullYear().toString(); }
    if (y.length === 2) y = '20' + y;
    fecha = `${y}-${mo}-${d}`;
  }
  if (!fecha && /mañana/i.test(texto)) {
    const man = new Date(); man.setDate(man.getDate()+1);
    fecha = man.toISOString().split('T')[0];
  }
  return { fecha, hora };
}

async function pacProcesarReprogramar() {
  const nuevaFechaTexto = document.getElementById('pac-reprogramarInput').value.trim();
  if (!nuevaFechaTexto) { alert('Escribí la nueva fecha/hora primero'); return; }
  const nombre = _pacActualIA ? _pacActualIA.nombre
    : document.getElementById('pac-det-nombre').textContent.split(' ')[0];
  const turnoActual = _pacProximoTurno
    ? `Turno ACTUAL del paciente: ${_pacProximoTurno.fechaFormateada} a las ${_pacProximoTurno.horaFormateada} hs.`
    : 'No hay turno previo registrado.';
  let agendaActualizada = false;
  if (_pacProximoTurno && _pacProximoTurno.id) {
    const { fecha: nf, hora: nh } = pacParsearFechaHora(nuevaFechaTexto);
    if (nf || nh) {
      const updates = {};
      if (nf) updates.fecha = nf;
      if (nh) updates.hora  = nh;
      try {
        const { error } = await sb.from('turnos').update(updates).eq('id', _pacProximoTurno.id).eq('user_id', PsicoRouter.store.userId);
        if (!error) {
          agendaActualizada = true;
          if (nf) { const [y,m,d] = nf.split('-'); _pacProximoTurno.fecha = nf; _pacProximoTurno.fechaFormateada = `${d}/${m}/${y}`; }
          if (nh) { _pacProximoTurno.hora = nh; _pacProximoTurno.horaFormateada = nh.slice(0,5); }
          document.getElementById('pac-proximoTurnoTextoPA').textContent =
            `${_pacProximoTurno.fechaFormateada} a las ${_pacProximoTurno.horaFormateada} hs`;
        }
      } catch(e) {}
    }
  }
  const prompt = `Sos un psicólogo clínico argentino. Redactá un mensaje de WhatsApp para avisarle a un paciente que su turno fue reprogramado.

PACIENTE: ${nombre}
${turnoActual}
NUEVA FECHA/HORA: ${nuevaFechaTexto}

REQUISITOS:
- Máximo 3-4 líneas
- Tono empático y profesional
- Español argentino informal pero respetuoso
- Mencioná el turno anterior y el nuevo claramente
- Sin asteriscos ni markdown
- Listo para copiar y pegar en WhatsApp`;
  document.getElementById('pac-reprogramarWrap').style.display = 'none';
  await pacLlamarIA(prompt, agendaActualizada);
}

async function pacGenerarMensajeIA(tipo) {
  const nombre = _pacActualIA ? _pacActualIA.nombre
    : document.getElementById('pac-det-nombre').textContent.split(' ')[0];
  const turnoInfo = _pacProximoTurno
    ? `El próximo turno agendado es el ${_pacProximoTurno.fechaFormateada} a las ${_pacProximoTurno.horaFormateada} hs.`
    : '';
  const tipoDesc = {
    recordatorio: `recordatorio amigable de su próximo turno de psicología. ${turnoInfo}`,
    ausente:      `mensaje para un paciente que no se presentó sin avisar. ${turnoInfo} Tono comprensivo, sin reproches, invitando a reagendar.`,
    seguimiento:  'mensaje de seguimiento entre sesiones preguntando cómo está. Breve, cálido, profesional.'
  };
  const prompt = `Sos un psicólogo clínico argentino. Redactá un ${tipoDesc[tipo]}

PACIENTE: ${nombre}

REQUISITOS:
- Máximo 3-4 líneas
- Tono empático y profesional
- Español argentino informal pero respetuoso
- Sin asteriscos ni markdown
- Listo para WhatsApp`;
  await pacLlamarIA(prompt);
}

async function pacLlamarIA(prompt, agendaActualizada = false) {
  document.getElementById('pac-iaOpcionesWrap').style.display = 'none';
  document.getElementById('pac-iaLoading').style.display = 'flex';
  document.getElementById('pac-iaResultado').style.display = 'none';
  try {
    const resp = await fetch(PSICOAPP_CONFIG.SUPA_URL + '/functions/v1/generar-informe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + await (async () => {
          const { data: { session } } = await sb.auth.getSession();
          if (!session) throw new Error('Usuario no autenticado');
          return session.access_token;
        })()
      },
      body: JSON.stringify({ prompt })
    });
    if (!resp.ok) {
      throw new Error('Error en el servidor');
    }
    const data = await resp.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Respuesta inválida del servidor');
    }
    document.getElementById('pac-iaLoading').style.display = 'none';
    document.getElementById('pac-iaMensaje').textContent = data.texto || data.error || 'Sin respuesta';

    let badge = document.getElementById('pac-agendaBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'pac-agendaBadge';
      badge.style.cssText = 'margin-bottom:8px;padding:7px 12px;background:#D1FAE5;color:#065F46;border-radius:9px;font-size:13px;font-weight:700;display:none';
      document.getElementById('pac-iaResultado').insertBefore(badge, document.getElementById('pac-iaResultado').firstChild);
    }
    badge.style.display = agendaActualizada ? 'block' : 'none';
    if (agendaActualizada) badge.textContent = '✅ Turno actualizado en agenda';
    document.getElementById('pac-iaResultado').style.display = 'block';
  } catch(e) {
    document.getElementById('pac-iaLoading').style.display = 'none';
    document.getElementById('pac-iaMensaje').textContent = '❌ Error: ' + e.message;
    document.getElementById('pac-iaResultado').style.display = 'block';
  }
}

function pacCopiarMensaje() {
  const texto = document.getElementById('pac-iaMensaje').textContent;
  navigator.clipboard.writeText(texto).then(() => {
    const btn = event.target;
    btn.textContent = '✅ Copiado';
    setTimeout(() => btn.textContent = '📋 Copiar', 2000);
  });
}

function pacEnviarWA() {
  const texto  = document.getElementById('pac-iaMensaje').textContent.trim();
  if (!texto) return;
  const wpBtn  = document.getElementById('pac-det-wp-btn');
  const url = wpBtn._waNum
    ? `https://wa.me/${wpBtn._waNum}?text=${encodeURIComponent(texto)}`
    : `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
}

/* ── Hook: se llama cada vez que navigate('pacientes') ── */
window.onViewEnter_pacientes = async function() {
  /* Limpiar búsqueda y filtro al volver a la vista */
  const inp = document.getElementById('pac-searchInput');
  if (inp) inp.value = '';
  _pacFiltro = 'todos';
  document.querySelectorAll('#view-pacientes .fchip-p').forEach((c,i) => {
    c.classList.toggle('active', i === 0);
  });
  await pacCargar();
};

/* ── INIT al cargar por primera vez si la vista ya está activa ── */
if (document.getElementById('view-pacientes')?.classList.contains('view-active')) {
  pacCargar();
}
