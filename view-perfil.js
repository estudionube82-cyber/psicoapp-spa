/**
 * view-perfil.js — PsicoApp
 * Lee y guarda en Supabase (tabla profiles).
 * localStorage se usa solo como caché para el sidebar.
 */

(function injectPerfilStyles() {
  if (document.getElementById('view-perfil-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-perfil-styles';
  style.textContent = `
#view-perfil { min-height: 100vh; background: var(--bg); }

/* ── HEADER ── */
#view-perfil .vp-header {
  background: linear-gradient(145deg, #1E1040 0%, #2D1B69 60%, #4C2A9A 100%);
  padding: 28px 20px 36px; position: relative; overflow: hidden;
}
#view-perfil .vp-header::after {
  content:''; position:absolute; right:-40px; top:-40px;
  width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.05);
}
#view-perfil .vp-header::before {
  content:''; position:absolute; left:-30px; bottom:-60px;
  width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,0.03);
}
#view-perfil .vp-header-inner {
  position:relative; z-index:1; display:flex; align-items:center; gap:16px;
}
#view-perfil .vp-avatar-big {
  width:64px; height:64px; border-radius:50%;
  background:linear-gradient(135deg,var(--v2),var(--v3));
  display:flex; align-items:center; justify-content:center;
  font-size:24px; font-weight:800; color:white;
  flex-shrink:0; border:2px solid rgba(255,255,255,0.2);
  cursor:pointer; overflow:hidden; position:relative;
}
#view-perfil .vp-header-title { font-size:20px; font-weight:800; color:white; line-height:1.1; }
#view-perfil .vp-header-sub   { font-size:13px; color:rgba(255,255,255,0.6); margin-top:3px; }

/* ── BODY ── */
#view-perfil .vp-body {
  padding:0 16px 40px; margin-top:-20px;
  position:relative; z-index:5;
  display:flex; flex-direction:column; gap:14px;
  max-width:520px; margin-left:auto; margin-right:auto;
}
@media (min-width:768px) { #view-perfil .vp-body { padding:0 24px 40px; } }

/* ── CARD ── */
#view-perfil .vp-card {
  background:var(--surface); border-radius:var(--radius);
  padding:20px; box-shadow:var(--shadow-md);
  display:flex; flex-direction:column; gap:16px;
}
#view-perfil .vp-card-title {
  font-size:13px; font-weight:800; color:var(--text-muted);
  text-transform:uppercase; letter-spacing:.8px; margin-bottom:2px;
}

/* ── FIELD ── */
#view-perfil .vp-field  { display:flex; flex-direction:column; gap:6px; }
#view-perfil .vp-label  { font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px; }
#view-perfil .vp-input  {
  width:100%; padding:13px 14px; border-radius:var(--radius-sm);
  border:1.5px solid var(--border); background:var(--bg); color:var(--text);
  font-family:var(--font); font-size:15px; font-weight:500; outline:none;
  transition:border-color .15s, box-shadow .15s;
}
#view-perfil .vp-input:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-light); }
#view-perfil .vp-input::placeholder { color:var(--text-muted); opacity:.6; }
#view-perfil .vp-input:disabled { opacity:.5; cursor:not-allowed; }

/* ── ROW 2 COLS ── */
#view-perfil .vp-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:400px) { #view-perfil .vp-row { grid-template-columns:1fr; } }

/* ── BOTÓN GUARDAR ── */
#view-perfil .vp-btn-guardar {
  width:100%; padding:15px;
  background:linear-gradient(135deg,#5B2FA8 0%,#7C3AED 100%);
  color:white; border:none; border-radius:var(--radius-sm);
  font-family:var(--font); font-size:15px; font-weight:800;
  cursor:pointer; transition:transform .12s, box-shadow .12s;
  display:flex; align-items:center; justify-content:center; gap:8px;
}
#view-perfil .vp-btn-guardar:hover  { transform:translateY(-1px); box-shadow:var(--shadow-md); }
#view-perfil .vp-btn-guardar:active { transform:translateY(0); }
#view-perfil .vp-btn-guardar:disabled { opacity:.6; cursor:not-allowed; transform:none; }

/* ── SECCIÓN SEGURIDAD ── */
#view-perfil .vp-btn-cambiar-pass {
  width:100%; padding:13px;
  background:var(--surface2); color:var(--primary);
  border:1.5px solid var(--border); border-radius:var(--radius-sm);
  font-family:var(--font); font-size:14px; font-weight:700;
  cursor:pointer; transition:transform .12s;
}
#view-perfil .vp-btn-cambiar-pass:hover { transform:translateY(-1px); }
#view-perfil .vp-pass-fields { display:flex; flex-direction:column; gap:12px; margin-top:4px; }
#view-perfil .vp-pass-hint { font-size:11px; color:var(--text-muted); margin-top:2px; }

/* ── TOAST ── */
#view-perfil .vp-toast {
  display:none; border-radius:var(--radius-sm);
  padding:13px 16px; font-size:14px; font-weight:700; text-align:center;
}
#view-perfil .vp-toast.show { display:block; }
#view-perfil .vp-toast.ok   { background:rgba(5,150,105,.12); border:1.5px solid rgba(5,150,105,.25); color:#059669; }
#view-perfil .vp-toast.err  { background:rgba(229,62,62,.1);  border:1.5px solid rgba(229,62,62,.25);  color:var(--danger); }

/* ── LOGOUT ── */
#view-perfil .vp-logout-card { background:var(--surface); border-radius:var(--radius); padding:16px 20px; box-shadow:var(--shadow-sm); }
#view-perfil .vp-btn-logout  {
  width:100%; padding:13px;
  background:var(--danger-light); color:var(--danger);
  border:1.5px solid rgba(229,62,62,.2); border-radius:var(--radius-sm);
  font-family:var(--font); font-size:14px; font-weight:700; cursor:pointer; transition:transform .12s;
}
#view-perfil .vp-btn-logout:hover { transform:translateY(-1px); }
#view-perfil .vp-pad { height:24px; }

/* ── SPINNER ── */
#view-perfil .vp-spinner {
  display:flex; align-items:center; justify-content:center;
  min-height:40vh; color:var(--text-muted); font-size:14px; gap:10px;
}
  `;
  document.head.appendChild(style);
})();


/* ═══════════════════════════════════════════
   HELPERS LOCALSTORAGE (solo caché sidebar)
   ═══════════════════════════════════════════ */

function _vp_getCache() {
  try { return JSON.parse(localStorage.getItem('perfil')) || {}; } catch { return {}; }
}

function _vp_setCache(data) {
  try { localStorage.setItem('perfil', JSON.stringify(data)); } catch {}
}

function _vp_syncSidebar(data) {
  const nameEl   = document.getElementById('sb-user-name');
  const avatarEl = document.getElementById('sb-avatar-initials');
  if (nameEl)   nameEl.textContent = data.nombre || 'Mi perfil';
  if (avatarEl) {
    if (data.foto) {
      avatarEl.innerHTML = `<img src="${data.foto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      const ini = (data.nombre || '').slice(0, 2).toUpperCase() || '👤';
      avatarEl.innerHTML = `<span>${ini}</span>`;
    }
  }
}


/* ═══════════════════════════════════════════
   CARGAR PERFIL DESDE SUPABASE
   ═══════════════════════════════════════════ */

async function _vp_cargarPerfil() {
  // Primero mostramos caché mientras carga Supabase
  const cache = _vp_getCache();

  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return cache;

    const { data, error } = await sb
      .from('profiles')
      .select('nombre_completo, titulo, especialidad, telefono_profesional, direccion, foto_url, matricula_provincial, matricula_nacional')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return cache;

    // Mapear columnas Supabase → objeto local
    const perfil = {
      nombre:              data.nombre_completo         || '',
      titulo:              data.titulo                  || '',
      especialidad:        data.especialidad            || '',
      telefono:            data.telefono_profesional    || '',
      direccion:           data.direccion               || '',
      foto:                data.foto_url                || '',
      matricula_prov:      data.matricula_provincial    || '',
      matricula_nac:       data.matricula_nacional      || '',
      email:               session.user.email           || '',
    };

    // Actualizar caché
    _vp_setCache(perfil);
    _vp_syncSidebar(perfil);
    window.dispatchEvent(new Event('perfilActualizado'));

    return perfil;
  } catch(e) {
    console.warn('[Perfil] Error cargando desde Supabase:', e.message);
    return cache;
  }
}


/* ═══════════════════════════════════════════
   GUARDAR PERFIL EN SUPABASE
   ═══════════════════════════════════════════ */

async function _vp_guardarPerfil(datos) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { error } = await sb
    .from('profiles')
    .update({
      nombre_completo:      datos.nombre,
      titulo:               datos.titulo,
      especialidad:         datos.especialidad,
      telefono_profesional: datos.telefono,
      direccion:            datos.direccion,
      foto_url:             datos.foto,
      matricula_provincial: datos.matricula_prov,
      matricula_nacional:   datos.matricula_nac,
      updated_at:           new Date().toISOString(),
    })
    .eq('id', session.user.id);

  if (error) throw error;

  // Actualizar caché y sidebar
  _vp_setCache({ ...datos, email: session.user.email });
  _vp_syncSidebar(datos);
  window.dispatchEvent(new Event('perfilActualizado'));
}


/* ═══════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════ */

async function renderPerfil() {
  const container = document.getElementById('view-perfil');
  if (!container) return;

  // Mostrar spinner mientras carga
  container.innerHTML = `<div class="vp-spinner">⏳ Cargando perfil…</div>`;

  const p = await _vp_cargarPerfil();
  const iniciales = p.nombre ? p.nombre.slice(0, 2).toUpperCase() : '👤';
  const fotoHTML  = p.foto
    ? `<img src="${p.foto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : `<span>${iniciales}</span>`;

  container.innerHTML = `
<div class="vp-header">
  <div class="vp-header-inner">
    <div class="vp-avatar-big" id="vp-avatar-wrap" title="Cambiar foto">
      ${fotoHTML}
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);border-radius:50%;
                  display:flex;align-items:center;justify-content:center;
                  opacity:0;transition:opacity .15s;" id="vp-avatar-overlay">
        <span style="font-size:20px;">📷</span>
      </div>
    </div>
    <div>
      <div class="vp-header-title" id="vp-header-name">${p.nombre || 'Mi perfil'}</div>
      <div class="vp-header-sub">${p.email || ''}</div>
    </div>
  </div>
</div>

<input type="file" id="vp-foto-input" accept="image/*" style="display:none">

<div class="vp-body">

  <!-- INFORMACIÓN PROFESIONAL -->
  <div class="vp-card">
    <div class="vp-card-title">Información profesional</div>

    <div class="vp-row">
      <div class="vp-field">
        <label class="vp-label" for="vp-titulo">Título</label>
        <input class="vp-input" id="vp-titulo" type="text" placeholder="Ej: Lic. / Dr." value="${p.titulo || ''}">
      </div>
      <div class="vp-field">
        <label class="vp-label" for="vp-especialidad">Especialidad</label>
        <input class="vp-input" id="vp-especialidad" type="text" placeholder="Ej: Clínica" value="${p.especialidad || ''}">
      </div>
    </div>

    <div class="vp-field">
      <label class="vp-label" for="vp-nombre">Nombre completo</label>
      <input class="vp-input" id="vp-nombre" type="text" placeholder="Ej: María García" value="${p.nombre || ''}">
    </div>

    <div class="vp-row">
      <div class="vp-field">
        <label class="vp-label" for="vp-mat-prov">Matrícula provincial</label>
        <input class="vp-input" id="vp-mat-prov" type="text" placeholder="Ej: 30220" value="${p.matricula_prov || ''}">
      </div>
      <div class="vp-field">
        <label class="vp-label" for="vp-mat-nac">Matrícula nacional</label>
        <input class="vp-input" id="vp-mat-nac" type="text" placeholder="Ej: 12345" value="${p.matricula_nac || ''}">
      </div>
    </div>
  </div>

  <!-- CONTACTO -->
  <div class="vp-card">
    <div class="vp-card-title">Contacto y consultorio</div>

    <div class="vp-field">
      <label class="vp-label" for="vp-email">Email</label>
      <input class="vp-input" id="vp-email" type="email" value="${p.email || ''}" disabled>
      <span class="vp-pass-hint">El email se gestiona desde Seguridad</span>
    </div>

    <div class="vp-field">
      <label class="vp-label" for="vp-telefono">Teléfono</label>
      <input class="vp-input" id="vp-telefono" type="tel" placeholder="Ej: +54 9 11 1234-5678" value="${p.telefono || ''}">
    </div>

    <div class="vp-field">
      <label class="vp-label" for="vp-direccion">Dirección del consultorio</label>
      <input class="vp-input" id="vp-direccion" type="text" placeholder="Ej: Av. Corrientes 1234, CABA" value="${p.direccion || ''}">
    </div>
  </div>

  <!-- TOAST + GUARDAR -->
  <div id="vp-toast" class="vp-toast ok"></div>
  <button class="vp-btn-guardar" id="vp-btn-guardar">💾 Guardar cambios</button>

  <!-- SEGURIDAD -->
  <div class="vp-card">
    <div class="vp-card-title">🔒 Seguridad</div>
    <button class="vp-btn-cambiar-pass" id="vp-btn-show-pass">🔑 Cambiar contraseña</button>
    <div class="vp-pass-fields" id="vp-pass-section" style="display:none;">
      <div class="vp-field">
        <label class="vp-label" for="vp-pass-nueva">Nueva contraseña</label>
        <input class="vp-input" id="vp-pass-nueva" type="password" placeholder="Mínimo 6 caracteres">
      </div>
      <div class="vp-field">
        <label class="vp-label" for="vp-pass-confirmar">Confirmar contraseña</label>
        <input class="vp-input" id="vp-pass-confirmar" type="password" placeholder="Repetí la contraseña">
      </div>
      <button class="vp-btn-guardar" id="vp-btn-guardar-pass" style="background:linear-gradient(135deg,#059669,#10B981);">
        🔒 Actualizar contraseña
      </button>
      <div id="vp-toast-pass" class="vp-toast ok"></div>
    </div>
  </div>

  <!-- CERRAR SESIÓN -->
  <div class="vp-logout-card">
    <button class="vp-btn-logout" id="vp-btn-logout">🚪 Cerrar sesión</button>
  </div>

  <div class="vp-pad"></div>
</div>
  `;

  /* ── Avatar hover ── */
  const avatarWrap = container.querySelector('#vp-avatar-wrap');
  const overlay    = container.querySelector('#vp-avatar-overlay');
  avatarWrap.addEventListener('mouseenter', () => overlay.style.opacity = '1');
  avatarWrap.addEventListener('mouseleave', () => overlay.style.opacity = '0');
  avatarWrap.addEventListener('click', () => container.querySelector('#vp-foto-input').click());

  /* ── Cambio de foto → base64 → Supabase ── */
  container.querySelector('#vp-foto-input').addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      _vp_toast('container', '⚠️ La imagen no debe superar 2 MB', 'err');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      // Actualizar avatar en pantalla
      avatarWrap.innerHTML = `
        <img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);border-radius:50%;
                    display:flex;align-items:center;justify-content:center;
                    opacity:0;transition:opacity .15s;" id="vp-avatar-overlay">
          <span style="font-size:20px;">📷</span>
        </div>`;
      const newOverlay = avatarWrap.querySelector('#vp-avatar-overlay');
      avatarWrap.addEventListener('mouseenter', () => newOverlay.style.opacity = '1');
      avatarWrap.addEventListener('mouseleave', () => newOverlay.style.opacity = '0');

      // Guardar foto en Supabase
      try {
        const cache = _vp_getCache();
        cache.foto = base64;
        await _vp_guardarPerfil(cache);
        _vp_toast('container', '📷 Foto actualizada', 'ok');
      } catch(e) {
        _vp_toast('container', '❌ No se pudo guardar la foto', 'err');
      }
    };
    reader.readAsDataURL(file);
  });

  /* ── Guardar datos del perfil ── */
  container.querySelector('#vp-btn-guardar').addEventListener('click', async () => {
    const btn = container.querySelector('#vp-btn-guardar');
    btn.disabled = true;
    btn.innerHTML = '⏳ Guardando…';

    const datos = {
      nombre:        container.querySelector('#vp-nombre').value.trim(),
      titulo:        container.querySelector('#vp-titulo').value.trim(),
      especialidad:  container.querySelector('#vp-especialidad').value.trim(),
      telefono:      container.querySelector('#vp-telefono').value.trim(),
      direccion:     container.querySelector('#vp-direccion').value.trim(),
      matricula_prov: container.querySelector('#vp-mat-prov').value.trim(),
      matricula_nac:  container.querySelector('#vp-mat-nac').value.trim(),
      foto:          _vp_getCache().foto || '',
    };

    try {
      await _vp_guardarPerfil(datos);
      // Actualizar nombre en header
      const headerName = container.querySelector('#vp-header-name');
      if (headerName && datos.nombre) headerName.textContent = datos.nombre;
      _vp_toast('container', '✅ Datos guardados correctamente', 'ok');
    } catch(e) {
      _vp_toast('container', '❌ Error al guardar: ' + e.message, 'err');
    }

    btn.disabled = false;
    btn.innerHTML = '💾 Guardar cambios';
  });

  /* ── Mostrar/ocultar sección de contraseña ── */
  container.querySelector('#vp-btn-show-pass').addEventListener('click', () => {
    const sec = container.querySelector('#vp-pass-section');
    const visible = sec.style.display !== 'none';
    sec.style.display = visible ? 'none' : 'flex';
    container.querySelector('#vp-btn-show-pass').textContent = visible
      ? '🔑 Cambiar contraseña'
      : '✖ Cancelar';
  });

  /* ── Cambiar contraseña ── */
  container.querySelector('#vp-btn-guardar-pass').addEventListener('click', async () => {
    const nueva     = container.querySelector('#vp-pass-nueva').value;
    const confirmar = container.querySelector('#vp-pass-confirmar').value;

    if (!nueva || nueva.length < 6) {
      _vp_toastPass('⚠️ La contraseña debe tener al menos 6 caracteres', 'err'); return;
    }
    if (nueva !== confirmar) {
      _vp_toastPass('⚠️ Las contraseñas no coinciden', 'err'); return;
    }

    const btn = container.querySelector('#vp-btn-guardar-pass');
    btn.disabled = true;
    btn.innerHTML = '⏳ Actualizando…';

    try {
      const { error } = await sb.auth.updateUser({ password: nueva });
      if (error) throw error;
      _vp_toastPass('✅ Contraseña actualizada correctamente', 'ok');
      container.querySelector('#vp-pass-nueva').value     = '';
      container.querySelector('#vp-pass-confirmar').value = '';
    } catch(e) {
      _vp_toastPass('❌ ' + e.message, 'err');
    }

    btn.disabled = false;
    btn.innerHTML = '🔒 Actualizar contraseña';
  });

  /* ── Logout ── */
  container.querySelector('#vp-btn-logout').addEventListener('click', async () => {
    await sb.auth.signOut();
    window.location.href = 'login.html';
  });
}


/* ─── helpers toast ─── */
function _vp_toast(scope, msg, tipo) {
  const el = document.querySelector('#view-perfil #vp-toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `vp-toast ${tipo} show`;
  setTimeout(() => el.classList.remove('show'), 3500);
}

function _vp_toastPass(msg, tipo) {
  const el = document.querySelector('#view-perfil #vp-toast-pass');
  if (!el) return;
  el.textContent = msg;
  el.className = `vp-toast ${tipo} show`;
  setTimeout(() => el.classList.remove('show'), 3500);
}


/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */

function initPerfil() {
  const container = document.getElementById('view-perfil');
  if (!container) return;
  renderPerfil();
}

window.onViewEnter_perfil = initPerfil;
