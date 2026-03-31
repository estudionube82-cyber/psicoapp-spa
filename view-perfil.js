/**
 * view-perfil.js
 * ─────────────────────────────────────────────────────────────
 * Vista de perfil profesional — lee y escribe en localStorage.
 * ─────────────────────────────────────────────────────────────
 */

(function injectPerfilStyles() {
  if (document.getElementById('view-perfil-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-perfil-styles';
  style.textContent = `
#view-perfil {
  min-height: 100vh;
  background: var(--bg);
}

/* ── HEADER ── */
#view-perfil .vp-header {
  background: linear-gradient(145deg, #1E1040 0%, #2D1B69 60%, #4C2A9A 100%);
  padding: 28px 20px 36px;
  position: relative; overflow: hidden;
}
#view-perfil .vp-header::after {
  content: ''; position: absolute;
  right: -40px; top: -40px;
  width: 180px; height: 180px; border-radius: 50%;
  background: rgba(255,255,255,0.05);
}
#view-perfil .vp-header::before {
  content: ''; position: absolute;
  left: -30px; bottom: -60px;
  width: 140px; height: 140px; border-radius: 50%;
  background: rgba(255,255,255,0.03);
}
#view-perfil .vp-header-inner {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 16px;
}
#view-perfil .vp-avatar-big {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, var(--v2), var(--v3));
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 800; color: white;
  flex-shrink: 0; border: 2px solid rgba(255,255,255,0.2);
}
#view-perfil .vp-header-title {
  font-size: 20px; font-weight: 800; color: white; line-height: 1.1;
}
#view-perfil .vp-header-sub {
  font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 3px;
}

/* ── BODY ── */
#view-perfil .vp-body {
  padding: 0 16px 40px;
  margin-top: -20px;
  position: relative; z-index: 5;
  display: flex; flex-direction: column; gap: 14px;
  max-width: 520px; margin-left: auto; margin-right: auto;
}
@media (min-width: 768px) {
  #view-perfil .vp-body { padding: 0 24px 40px; }
}

/* ── FORM CARD ── */
#view-perfil .vp-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-md);
  display: flex; flex-direction: column; gap: 16px;
}
#view-perfil .vp-card-title {
  font-size: 13px; font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .8px;
  margin-bottom: 2px;
}

/* ── FIELD ── */
#view-perfil .vp-field {
  display: flex; flex-direction: column; gap: 6px;
}
#view-perfil .vp-label {
  font-size: 12px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .5px;
}
#view-perfil .vp-input {
  width: 100%;
  padding: 13px 14px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 15px;
  font-weight: 500;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
#view-perfil .vp-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}
#view-perfil .vp-input::placeholder { color: var(--text-muted); opacity: .6; }

/* ── BOTÓN ── */
#view-perfil .vp-btn-guardar {
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, #5B2FA8 0%, #7C3AED 100%);
  color: white; border: none; border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 15px; font-weight: 800;
  cursor: pointer; transition: transform .12s, box-shadow .12s;
}
#view-perfil .vp-btn-guardar:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
#view-perfil .vp-btn-guardar:active { transform: translateY(0); }

/* ── TOAST ── */
#view-perfil .vp-toast {
  display: none;
  background: rgba(5,150,105,0.12);
  border: 1.5px solid rgba(5,150,105,0.25);
  color: #059669;
  border-radius: var(--radius-sm);
  padding: 13px 16px;
  font-size: 14px; font-weight: 700;
  text-align: center;
}
#view-perfil .vp-toast.show { display: block; }

/* ── LOGOUT ── */
#view-perfil .vp-logout-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
}
#view-perfil .vp-btn-logout {
  width: 100%; padding: 13px;
  background: var(--danger-light); color: var(--danger);
  border: 1.5px solid rgba(229,62,62,0.2);
  border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 14px; font-weight: 700;
  cursor: pointer; transition: transform .12s;
}
#view-perfil .vp-btn-logout:hover { transform: translateY(-1px); }

#view-perfil .vp-pad { height: 24px; }
  `;
  document.head.appendChild(style);
})();


/* ═══════════════════════════════════════
   FUNCIONES
   ═══════════════════════════════════════ */

function getPerfil() {
  try { return JSON.parse(localStorage.getItem('perfil')) || {}; }
  catch { return {}; }
}

function savePerfil(data) {
  localStorage.setItem('perfil', JSON.stringify(data));
}

function _vp_syncSidebar(data) {
  const sbName = document.getElementById('sb-user-name');
  if (sbName && data.nombre) sbName.textContent = data.nombre;

  const avatarEl = document.getElementById('sb-avatar-initials');
  if (avatarEl) {
    if (data.foto) {
      avatarEl.innerHTML = `<img src="${data.foto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else if (data.nombre) {
      avatarEl.innerHTML = `<span>${data.nombre.slice(0, 2).toUpperCase()}</span>`;
    }
  }
}

function handleSubmitPerfil(e) {
  if (e) e.preventDefault();
  const container = document.getElementById('view-perfil');
  if (!container) return;

  const data = {
    nombre:   container.querySelector('#vp-nombre').value.trim(),
    email:    container.querySelector('#vp-email').value.trim(),
    telefono: container.querySelector('#vp-telefono').value.trim(),
    estudio:  container.querySelector('#vp-estudio').value.trim(),
  };

  savePerfil(data);

  /* Emitir evento global para sincronizar otras vistas */
  window.dispatchEvent(new Event('perfilActualizado'));

  /* Sincronizar sidebar */
  _vp_syncSidebar(data);

  /* Actualizar avatar del header de perfil */
  const container2 = document.getElementById('view-perfil');
  if (container2) {
    const headerName = container2.querySelector('#vp-header-name');
    if (headerName && data.nombre) headerName.textContent = data.nombre;
    const avatarInitials = container2.querySelector('#vp-avatar-initials');
    if (avatarInitials && data.nombre) avatarInitials.textContent = data.nombre.slice(0, 2).toUpperCase();
  }

  /* Mostrar toast */
  const toast = container.querySelector('#vp-toast');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

function renderPerfil() {
  const container = document.getElementById('view-perfil');
  if (!container) return;

  const p = getPerfil();
  const iniciales = p.nombre ? p.nombre.slice(0, 2).toUpperCase() : '👤';
  const fotoHTML = p.foto
    ? `<img src="${p.foto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : `<span id="vp-avatar-initials">${iniciales}</span>`;

  container.innerHTML = `
<div class="vp-header">
  <div class="vp-header-inner">
    <div class="vp-avatar-big" id="vp-avatar-wrap" style="cursor:pointer;overflow:hidden;position:relative;" title="Cambiar foto">
      ${fotoHTML}
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);border-radius:50%;
                  display:flex;align-items:center;justify-content:center;
                  opacity:0;transition:opacity .15s;" id="vp-avatar-overlay">
        <span style="font-size:18px;">📷</span>
      </div>
    </div>
    <div>
      <div class="vp-header-title" id="vp-header-name">${p.nombre || 'Mi perfil'}</div>
      <div class="vp-header-sub">Toca el avatar para cambiar foto</div>
    </div>
  </div>
</div>

<!-- Input file oculto -->
<input type="file" id="vp-foto-input" accept="image/*" style="display:none">

<div class="vp-body">

  <!-- FORMULARIO -->
  <div class="vp-card">
    <div class="vp-card-title">Información personal</div>

    <div class="vp-field">
      <label class="vp-label" for="vp-nombre">Nombre completo</label>
      <input class="vp-input" id="vp-nombre" type="text"
        placeholder="Ej: María García"
        value="${p.nombre || ''}">
    </div>

    <div class="vp-field">
      <label class="vp-label" for="vp-email">Email</label>
      <input class="vp-input" id="vp-email" type="email"
        placeholder="tu@email.com"
        value="${p.email || ''}">
    </div>

    <div class="vp-field">
      <label class="vp-label" for="vp-telefono">Teléfono</label>
      <input class="vp-input" id="vp-telefono" type="tel"
        placeholder="Ej: +54 9 11 1234-5678"
        value="${p.telefono || ''}">
    </div>

    <div class="vp-field">
      <label class="vp-label" for="vp-estudio">Nombre del estudio / consultorio</label>
      <input class="vp-input" id="vp-estudio" type="text"
        placeholder="Ej: Consultorio Integral Mente"
        value="${p.estudio || ''}">
    </div>

    <div id="vp-toast" class="vp-toast">✅ Datos guardados correctamente</div>

    <button class="vp-btn-guardar" id="vp-btn-guardar">💾 Guardar cambios</button>
  </div>

  <!-- CERRAR SESIÓN -->
  <div class="vp-logout-card">
    <button class="vp-btn-logout" id="vp-btn-logout">🚪 Cerrar sesión</button>
  </div>

  <div class="vp-pad"></div>
</div>
  `;

  /* ── Hover sobre avatar ── */
  const avatarWrap = container.querySelector('#vp-avatar-wrap');
  const overlay = container.querySelector('#vp-avatar-overlay');
  avatarWrap.addEventListener('mouseenter', () => overlay.style.opacity = '1');
  avatarWrap.addEventListener('mouseleave', () => overlay.style.opacity = '0');

  /* ── Click en avatar → abrir selector de archivo ── */
  avatarWrap.addEventListener('click', () => {
    container.querySelector('#vp-foto-input').click();
  });

  /* ── Selección de foto → convertir a base64 y guardar ── */
  container.querySelector('#vp-foto-input').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      /* Guardar foto en el perfil */
      const perfilActual = getPerfil();
      perfilActual.foto = base64;
      savePerfil(perfilActual);

      /* Actualizar avatar en pantalla */
      avatarWrap.innerHTML = `
        <img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);border-radius:50%;
                    display:flex;align-items:center;justify-content:center;
                    opacity:0;transition:opacity .15s;" id="vp-avatar-overlay">
          <span style="font-size:18px;">📷</span>
        </div>
      `;
      /* Re-bindear hover */
      const newOverlay = avatarWrap.querySelector('#vp-avatar-overlay');
      avatarWrap.addEventListener('mouseenter', () => newOverlay.style.opacity = '1');
      avatarWrap.addEventListener('mouseleave', () => newOverlay.style.opacity = '0');

      /* Actualizar sidebar y sincronizar */
      _vp_syncSidebar(perfilActual);
      window.dispatchEvent(new Event('perfilActualizado'));

      /* Toast */
      const toast = container.querySelector('#vp-toast');
      if (toast) {
        toast.textContent = '📷 Foto actualizada';
        toast.classList.add('show');
        setTimeout(() => { toast.textContent = '✅ Datos guardados correctamente'; toast.classList.remove('show'); }, 2500);
      }
    };
    reader.readAsDataURL(file);
  });

  /* ── Event listeners ── */
  container.querySelector('#vp-btn-guardar').addEventListener('click', handleSubmitPerfil);

  container.querySelector('#vp-btn-logout').addEventListener('click', async () => {
    await sb.auth.signOut();
    window.location.href = 'login.html';
  });
}

function initPerfil() {
  const container = document.getElementById('view-perfil');
  if (!container) return;
  renderPerfil();
}

window.onViewEnter_perfil = initPerfil;
