/**
 * view-perfil.js — PsicoApp
 * ─────────────────────────────────────────────────────────────
 * Vista de perfil profesional.
 * Lee y escribe en Supabase (tabla `profiles`).
 * Sin localStorage. Compatible con PsicoRouter lifecycle.
 *
 * Ciclo de vida:
 *   init(container)  → renderiza HTML, bindea eventos (una sola vez)
 *   onEnter()        → carga perfil desde Supabase
 *   onLeave()        → limpieza (no necesaria por ahora)
 * ─────────────────────────────────────────────────────────────
 */

/* ── Estilos ─────────────────────────────────────────────── */
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
#view-perfil .vp-input:disabled {
  opacity: .55; cursor: not-allowed;
}

/* ── BOTÓN GUARDAR ── */
#view-perfil .vp-btn-guardar {
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, #5B2FA8 0%, #7C3AED 100%);
  color: white; border: none; border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 15px; font-weight: 800;
  cursor: pointer; transition: transform .12s, box-shadow .12s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
#view-perfil .vp-btn-guardar:hover  { transform: translateY(-1px); box-shadow: var(--shadow-md); }
#view-perfil .vp-btn-guardar:active { transform: translateY(0); }
#view-perfil .vp-btn-guardar:disabled { opacity: .6; cursor: not-allowed; transform: none; }

/* ── SPINNER (botón) ── */
#view-perfil .vp-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: vp-spin .6s linear infinite;
  display: none;
}
@keyframes vp-spin { to { transform: rotate(360deg); } }

/* ── TOAST ── */
#view-perfil .vp-toast {
  display: none;
  border-radius: var(--radius-sm);
  padding: 13px 16px;
  font-size: 14px; font-weight: 700;
  text-align: center;
}
#view-perfil .vp-toast.show  { display: block; }
#view-perfil .vp-toast.ok    { background: rgba(5,150,105,0.12);  border: 1.5px solid rgba(5,150,105,0.25);  color: #059669; }
#view-perfil .vp-toast.error { background: rgba(229,62,62,0.10);  border: 1.5px solid rgba(229,62,62,0.25);  color: var(--danger); }

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


/* ═══════════════════════════════════════════════════════════
   MÓDULO PERFIL
   ═══════════════════════════════════════════════════════════ */

const _PerfilView = (() => {

  /* ── Helpers UI ─────────────────────────────────────────── */

  function _setLoading(container, loading) {
    const btn     = container.querySelector('#vp-btn-guardar');
    const spinner = container.querySelector('#vp-spinner');
    const lbl     = container.querySelector('#vp-btn-lbl');
    const inputs  = container.querySelectorAll('.vp-input');
    btn.disabled = loading;
    spinner.style.display = loading ? 'block' : 'none';
    lbl.textContent       = loading ? '' : '💾 Guardar cambios';
    inputs.forEach(i => { i.disabled = loading; });
  }

  function _showToast(container, msg, type = 'ok', ms = 3000) {
    const toast = container.querySelector('#vp-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className   = `vp-toast show ${type}`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), ms);
  }

  /* ── Sincronizar sidebar con datos frescos ──────────────── */
  function _syncSidebar(nombre, fotoUrl) {
    const nameEl   = document.getElementById('sb-user-name');
    const avatarEl = document.getElementById('sb-avatar-initials');
    if (nameEl)   nameEl.textContent = nombre || 'Mi perfil';
    if (avatarEl) {
      avatarEl.innerHTML = fotoUrl
        ? `<img src="${fotoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
        : `<span>${nombre ? nombre.slice(0, 2).toUpperCase() : '👤'}</span>`;
    }
    window.dispatchEvent(new Event('perfilActualizado'));
  }

  /* ── Actualizar cabecera de la vista ────────────────────── */
  function _updateHeader(container, nombre, fotoUrl) {
    const headerTitle = container.querySelector('#vp-header-name');
    const avatarWrap  = container.querySelector('#vp-avatar-wrap');
    if (headerTitle) headerTitle.textContent = nombre || 'Mi perfil';
    if (avatarWrap) {
      const iniciales = nombre ? nombre.slice(0, 2).toUpperCase() : '👤';
      _rebuildAvatar(avatarWrap, fotoUrl, iniciales);
    }
  }

  /* ── Reconstruir avatar (mantiene overlay de hover) ─────── */
  function _rebuildAvatar(wrap, fotoUrl, iniciales) {
    wrap.innerHTML = fotoUrl
      ? `<img src="${fotoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
         <div class="vp-avatar-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.35);border-radius:50%;
              display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;">
           <span style="font-size:18px;">📷</span>
         </div>`
      : `<span id="vp-avatar-initials">${iniciales}</span>
         <div class="vp-avatar-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.35);border-radius:50%;
              display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;">
           <span style="font-size:18px;">📷</span>
         </div>`;

    const overlay = wrap.querySelector('.vp-avatar-overlay');
    wrap.addEventListener('mouseenter', () => overlay.style.opacity = '1');
    wrap.addEventListener('mouseleave', () => overlay.style.opacity = '0');
  }


  /* ── loadProfile ────────────────────────────────────────────
   * Lee perfil desde Supabase y rellena los inputs.
   * ─────────────────────────────────────────────────────────── */
  async function loadProfile(container) {
    try {
      const userId = await PsicoRouter.store.ensureUserId();
      if (!userId) return;

      const { data, error } = await sb
        .from('profiles')
        .select('nombre, telefono, matricula, foto_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Perfil] Error al cargar:', error.message);
        return;
      }

      // Rellenar inputs con datos existentes (o vacíos si es perfil nuevo)
      const p = data || {};
      container.querySelector('#vp-nombre').value    = p.nombre    || '';
      container.querySelector('#vp-telefono').value  = p.telefono  || '';
      container.querySelector('#vp-matricula').value = p.matricula || '';

      // Actualizar cabecera y sidebar con los datos cargados
      _updateHeader(container, p.nombre, p.foto_url);
      _syncSidebar(p.nombre, p.foto_url);

    } catch (e) {
      console.error('[Perfil] Error inesperado al cargar:', e.message);
    }
  }


  /* ── saveProfile ────────────────────────────────────────────
   * Lee los inputs y hace upsert en Supabase.
   * ─────────────────────────────────────────────────────────── */
  async function saveProfile(container) {
    const userId = await PsicoRouter.store.ensureUserId();
    if (!userId) {
      _showToast(container, '⚠️ No se pudo identificar al usuario.', 'error');
      return;
    }

    const nombre    = container.querySelector('#vp-nombre').value.trim();
    const telefono  = container.querySelector('#vp-telefono').value.trim();
    const matricula = container.querySelector('#vp-matricula').value.trim();

    _setLoading(container, true);

    try {
      const { error } = await sb.from('profiles').upsert(
        { id: userId, nombre, telefono, matricula },
        { onConflict: 'id' }
      );

      if (error) {
        _showToast(container, '❌ Error al guardar: ' + error.message, 'error');
        return;
      }

      // Invalidar caché del store para que otras vistas reciban datos frescos
      PsicoRouter.store.invalidatePerfil();

      // Actualizar UI sin recargar la vista
      _updateHeader(container, nombre, null);
      _syncSidebar(nombre, null);

      _showToast(container, '✅ Datos guardados correctamente', 'ok');

    } catch (e) {
      _showToast(container, '❌ Error inesperado: ' + e.message, 'error');
    } finally {
      _setLoading(container, false);
    }
  }


  /* ── renderHTML ─────────────────────────────────────────────
   * Inyecta el HTML de la vista en el contenedor.
   * Los inputs quedan vacíos; loadProfile() los rellena en onEnter.
   * ─────────────────────────────────────────────────────────── */
  function renderHTML(container) {
    container.innerHTML = `
<div class="vp-header">
  <div class="vp-header-inner">
    <div class="vp-avatar-big" id="vp-avatar-wrap"
         style="cursor:pointer;overflow:hidden;position:relative;" title="Cambiar foto">
      <span id="vp-avatar-initials">👤</span>
      <div class="vp-avatar-overlay"
           style="position:absolute;inset:0;background:rgba(0,0,0,0.35);border-radius:50%;
                  display:flex;align-items:center;justify-content:center;
                  opacity:0;transition:opacity .15s;">
        <span style="font-size:18px;">📷</span>
      </div>
    </div>
    <div>
      <div class="vp-header-title" id="vp-header-name">Mi perfil</div>
      <div class="vp-header-sub">Tocá el avatar para cambiar foto</div>
    </div>
  </div>
</div>

<!-- Input file oculto para foto de perfil -->
<input type="file" id="vp-foto-input" accept="image/*" style="display:none">

<div class="vp-body">

  <!-- FORMULARIO -->
  <div class="vp-card">
    <div class="vp-card-title">Información profesional</div>

    <div class="vp-field">
      <label class="vp-label" for="vp-nombre">Nombre completo</label>
      <input class="vp-input" id="vp-nombre" type="text"
        placeholder="Ej: María García">
    </div>

    <div class="vp-field">
      <label class="vp-label" for="vp-telefono">Teléfono</label>
      <input class="vp-input" id="vp-telefono" type="tel"
        placeholder="Ej: +54 9 11 1234-5678">
    </div>

    <div class="vp-field">
      <label class="vp-label" for="vp-matricula">Matrícula profesional</label>
      <input class="vp-input" id="vp-matricula" type="text"
        placeholder="Ej: 12345">
    </div>

    <div id="vp-toast" class="vp-toast"></div>

    <button class="vp-btn-guardar" id="vp-btn-guardar">
      <span class="vp-spinner" id="vp-spinner"></span>
      <span id="vp-btn-lbl">💾 Guardar cambios</span>
    </button>
  </div>

  <!-- CERRAR SESIÓN -->
  <div class="vp-logout-card">
    <button class="vp-btn-logout" id="vp-btn-logout">🚪 Cerrar sesión</button>
  </div>

  <div class="vp-pad"></div>
</div>
    `;
  }


  /* ── bindEvents ─────────────────────────────────────────────
   * Todos los addEventListener en un solo lugar, llamado una vez
   * desde init(). Sin onclick en HTML.
   * ─────────────────────────────────────────────────────────── */
  function bindEvents(container) {
    /* Avatar: hover */
    const avatarWrap = container.querySelector('#vp-avatar-wrap');
    const overlay    = avatarWrap.querySelector('.vp-avatar-overlay');
    avatarWrap.addEventListener('mouseenter', () => overlay.style.opacity = '1');
    avatarWrap.addEventListener('mouseleave', () => overlay.style.opacity = '0');

    /* Avatar: abrir selector de archivo */
    avatarWrap.addEventListener('click', () => {
      container.querySelector('#vp-foto-input').click();
    });

    /* Foto: selección → subir a Supabase Storage y guardar URL */
    container.querySelector('#vp-foto-input').addEventListener('change', async function () {
      const file = this.files[0];
      if (!file) return;

      const userId = await PsicoRouter.store.ensureUserId();
      if (!userId) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result;

        /* Subir a Supabase Storage (bucket: avatars) */
        let fotoUrl = null;
        try {
          const ext      = file.name.split('.').pop();
          const path     = `${userId}/avatar.${ext}`;
          const { error: upErr } = await sb.storage
            .from('avatars')
            .upload(path, file, { upsert: true, contentType: file.type });

          if (!upErr) {
            const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
            fotoUrl = urlData?.publicUrl || null;
            // Guardar URL en profiles
            await sb.from('profiles').upsert(
              { id: userId, foto_url: fotoUrl },
              { onConflict: 'id' }
            );
            PsicoRouter.store.invalidatePerfil();
          }
        } catch (e) {
          console.warn('[Perfil] No se pudo subir foto a Storage:', e.message);
        }

        /* Actualizar avatar en pantalla (usar base64 localmente aunque falle Storage) */
        const displayUrl = fotoUrl || base64;
        _rebuildAvatar(avatarWrap, displayUrl, '👤');
        _syncSidebar(container.querySelector('#vp-nombre').value.trim(), displayUrl);

        /* Toast */
        _showToast(container, '📷 Foto actualizada', 'ok', 2500);
      };
      reader.readAsDataURL(file);
    });

    /* Guardar cambios */
    container.querySelector('#vp-btn-guardar').addEventListener('click', () => {
      saveProfile(container);
    });

    /* Cerrar sesión
     * Usamos window._psicoSigningOut = true ANTES de llamar signOut()
     * para que el router no intente navegar ni cargar datos mientras
     * Supabase procesa el cierre de sesión internamente.
     * Usamos location.replace() para no dejar la SPA en el historial.
     */
    container.querySelector('#vp-btn-logout').addEventListener('click', async () => {
      const btn = container.querySelector('#vp-btn-logout');
      btn.disabled = true;
      btn.textContent = 'Cerrando sesión…';
      window._psicoSigningOut = true;
      try {
        await sb.auth.signOut();
      } catch(e) {
        console.warn('[Perfil] signOut error:', e.message);
      }
      window.location.replace('/login.html');
    });
  }


  /* ── Lifecycle: init ────────────────────────────────────────
   * Llamado una sola vez por el router cuando se monta la vista.
   * ─────────────────────────────────────────────────────────── */
  async function init(container) {
    renderHTML(container);
    bindEvents(container);
  }

  /* ── Lifecycle: onEnter ─────────────────────────────────────
   * Llamado cada vez que el usuario navega a esta vista.
   * ─────────────────────────────────────────────────────────── */
  async function onEnter(container) {
    await loadProfile(container);
  }

  /* ── Lifecycle: onLeave ─────────────────────────────────────
   * Por ahora no hay limpieza necesaria.
   * ─────────────────────────────────────────────────────────── */
  function onLeave() {}

  return { init, onEnter, onLeave };

})();


/* ── Registro en PsicoRouter ────────────────────────────── */
PsicoRouter.register('perfil', {
  init:    (el) => _PerfilView.init(el),
  onEnter: (el) => _PerfilView.onEnter(el),
  onLeave: ()   => _PerfilView.onLeave(),
});
