/**
 * psicoapp-onboarding.js — PsicoApp
 * ──────────────────────────────────────────────────────────────
 * Muestra un wizard de 3 pasos la primera vez que un usuario
 * se registra y no tiene perfil configurado.
 *
 * Trigger automático: si profiles.nombre_completo está vacío.
 * Se activa desde window._psicoAuthReady (Promise de auth).
 *
 * Pasos:
 *   1. Configurá tu perfil (nombre, especialidad, teléfono)
 *   2. Agregá tu primer paciente (nombre, apellido, teléfono)
 *   3. ¡Todo listo! → accesos rápidos a Agenda y Pacientes
 * ──────────────────────────────────────────────────────────────
 */

const PsicoOnboarding = (() => {

  /* ── Estado ─────────────────────────────────────────────── */
  let _step     = 1;
  let _overlay  = null;
  const STEPS   = 3;

  /* ── Estilos ─────────────────────────────────────────────── */
  function _injectStyles() {
    if (document.getElementById('psico-onboarding-styles')) return;
    const s = document.createElement('style');
    s.id = 'psico-onboarding-styles';
    s.textContent = `
/* ── OVERLAY ── */
#psico-onboarding {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(15, 11, 30, 0.85);
  backdrop-filter: blur(6px);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0;
  animation: ob-fadein .3s ease;
}
@keyframes ob-fadein { from{opacity:0} to{opacity:1} }

/* ── SHEET ── */
#psico-onboarding .ob-sheet {
  background: var(--surface);
  border-radius: 24px 24px 0 0;
  width: 100%; max-width: 520px;
  padding: 0 0 env(safe-area-inset-bottom);
  max-height: 92vh; overflow-y: auto;
  animation: ob-slideup .3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes ob-slideup {
  from { transform: translateY(60px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ── HEADER DEL SHEET ── */
#psico-onboarding .ob-top {
  background: linear-gradient(145deg, #1E1040, #2D1B69 60%, #4C2A9A);
  border-radius: 24px 24px 0 0;
  padding: 28px 24px 24px;
  position: relative;
}
#psico-onboarding .ob-brand {
  font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;
}
#psico-onboarding .ob-title {
  font-size: 22px; font-weight: 800; color: #fff; line-height: 1.2;
  margin-bottom: 6px;
}
#psico-onboarding .ob-sub {
  font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5;
}

/* ── PASOS ── */
#psico-onboarding .ob-steps {
  display: flex; gap: 8px; margin-bottom: 18px;
}
#psico-onboarding .ob-step-dot {
  height: 4px; border-radius: 2px;
  background: rgba(255,255,255,0.25);
  flex: 1; transition: background .3s;
}
#psico-onboarding .ob-step-dot.done   { background: #A78BFA; }
#psico-onboarding .ob-step-dot.active { background: #fff; }

/* ── CUERPO ── */
#psico-onboarding .ob-body {
  padding: 24px 24px 8px;
}
#psico-onboarding .ob-field {
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;
}
#psico-onboarding .ob-label {
  font-size: 11px; font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .6px;
}
#psico-onboarding .ob-input {
  width: 100%; padding: 13px 14px;
  border-radius: 11px; border: 1.5px solid var(--border);
  background: var(--bg); color: var(--text);
  font-family: var(--font); font-size: 15px; font-weight: 500;
  outline: none; transition: border-color .15s, box-shadow .15s;
}
#psico-onboarding .ob-input:focus {
  border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light);
}
#psico-onboarding .ob-input::placeholder { color: var(--text-muted); opacity: .6; }

/* ── TOAST DE ERROR EN FORM ── */
#psico-onboarding .ob-error {
  display: none; background: rgba(229,62,62,.1);
  border: 1.5px solid rgba(229,62,62,.2);
  color: var(--danger); border-radius: 10px;
  padding: 10px 14px; font-size: 13px; font-weight: 600;
  margin-bottom: 14px;
}
#psico-onboarding .ob-error.show { display: block; }

/* ── ACCIONES ── */
#psico-onboarding .ob-actions {
  padding: 0 24px 28px;
  display: flex; flex-direction: column; gap: 10px;
}
#psico-onboarding .ob-btn-primary {
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, #5B2FA8, #7C3AED);
  color: #fff; border: none; border-radius: 11px;
  font-family: var(--font); font-size: 15px; font-weight: 800;
  cursor: pointer; transition: transform .12s, box-shadow .12s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
#psico-onboarding .ob-btn-primary:hover  { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.35); }
#psico-onboarding .ob-btn-primary:active { transform: translateY(0); }
#psico-onboarding .ob-btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }
#psico-onboarding .ob-btn-secondary {
  width: 100%; padding: 13px;
  background: transparent; color: var(--text-muted);
  border: 1.5px solid var(--border); border-radius: 11px;
  font-family: var(--font); font-size: 14px; font-weight: 700;
  cursor: pointer; transition: background .12s;
}
#psico-onboarding .ob-btn-secondary:hover { background: var(--surface2); }

/* ── PASO 3 — ÉXITO ── */
#psico-onboarding .ob-success {
  padding: 10px 0 16px; text-align: center;
}
#psico-onboarding .ob-success-icon {
  font-size: 56px; margin-bottom: 12px; display: block;
  animation: ob-bounce .6s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes ob-bounce {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
#psico-onboarding .ob-success-title {
  font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 8px;
}
#psico-onboarding .ob-success-sub {
  font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 24px;
}
#psico-onboarding .ob-quick-links {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;
}
#psico-onboarding .ob-ql-btn {
  padding: 14px 10px;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 12px; font-family: var(--font);
  font-size: 13px; font-weight: 700; color: var(--text);
  cursor: pointer; transition: all .15s;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
#psico-onboarding .ob-ql-btn:hover {
  border-color: var(--primary); background: var(--primary-light); color: var(--primary);
}
#psico-onboarding .ob-ql-icon { font-size: 24px; }

/* ── SPINNER ── */
#psico-onboarding .ob-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: ob-spin .6s linear infinite;
  display: none;
}
@keyframes ob-spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(s);
  }

  /* ── HTML de cada paso ───────────────────────────────────── */

  function _htmlStep1() {
    return `
<div class="ob-body">
  <div class="ob-field">
    <label class="ob-label" for="ob-nombre">Nombre completo *</label>
    <input class="ob-input" id="ob-nombre" type="text"
           placeholder="Ej: María García" autocomplete="name">
  </div>
  <div class="ob-field">
    <label class="ob-label" for="ob-especialidad">Especialidad</label>
    <input class="ob-input" id="ob-especialidad" type="text"
           placeholder="Ej: Psicología Clínica">
  </div>
  <div class="ob-field">
    <label class="ob-label" for="ob-telefono">Teléfono profesional</label>
    <input class="ob-input" id="ob-telefono" type="tel"
           placeholder="Ej: +54 9 11 1234-5678">
  </div>
  <div class="ob-error" id="ob-error"></div>
</div>
<div class="ob-actions">
  <button class="ob-btn-primary" id="ob-btn-next1">
    <span class="ob-spinner" id="ob-sp1"></span>
    <span id="ob-lbl1">Guardar y continuar →</span>
  </button>
  <button class="ob-btn-secondary" id="ob-btn-skip1">Saltear por ahora</button>
</div>`;
  }

  function _htmlStep2() {
    return `
<div class="ob-body">
  <div class="ob-field">
    <label class="ob-label" for="ob-pac-nombre">Nombre del paciente *</label>
    <input class="ob-input" id="ob-pac-nombre" type="text"
           placeholder="Ej: Lucía">
  </div>
  <div class="ob-field">
    <label class="ob-label" for="ob-pac-apellido">Apellido</label>
    <input class="ob-input" id="ob-pac-apellido" type="text"
           placeholder="Ej: Rodríguez">
  </div>
  <div class="ob-field">
    <label class="ob-label" for="ob-pac-tel">Teléfono del paciente</label>
    <input class="ob-input" id="ob-pac-tel" type="tel"
           placeholder="Ej: +54 9 11 5678-9012">
  </div>
  <div class="ob-error" id="ob-error"></div>
</div>
<div class="ob-actions">
  <button class="ob-btn-primary" id="ob-btn-next2">
    <span class="ob-spinner" id="ob-sp2"></span>
    <span id="ob-lbl2">Agregar paciente →</span>
  </button>
  <button class="ob-btn-secondary" id="ob-btn-skip2">Saltear — lo agrego después</button>
</div>`;
  }

  function _htmlStep3() {
    return `
<div class="ob-body">
  <div class="ob-success">
    <span class="ob-success-icon">🎉</span>
    <div class="ob-success-title">¡Todo listo para empezar!</div>
    <div class="ob-success-sub">
      Tu cuenta está configurada. Ya podés agendar sesiones,
      gestionar pacientes y enviar recordatorios.
    </div>
    <div class="ob-quick-links">
      <button class="ob-ql-btn" id="ob-go-agenda">
        <span class="ob-ql-icon">📅</span>
        <span>Ir a la Agenda</span>
      </button>
      <button class="ob-ql-btn" id="ob-go-pacientes">
        <span class="ob-ql-icon">👥</span>
        <span>Ver Pacientes</span>
      </button>
    </div>
  </div>
</div>
<div class="ob-actions">
  <button class="ob-btn-secondary" id="ob-btn-close">Explorar la app →</button>
</div>`;
  }

  /* ── Títulos y subtítulos por paso ───────────────────────── */
  const _STEPS_META = {
    1: {
      title : '¡Bienvenido/a a PsicoApp!',
      sub   : 'Antes de comenzar, completá los datos de tu consultorio.',
    },
    2: {
      title : 'Agregá tu primer paciente',
      sub   : 'Podés incorporar todos tus pacientes desde la sección Pacientes.',
    },
    3: {
      title : '¡Tu consultorio está listo!',
      sub   : '',
    },
  };

  /* ── Render ─────────────────────────────────────────────── */
  function _render(step) {
    if (!_overlay) return;
    const meta = _STEPS_META[step];

    // Dots de pasos
    let dotsHtml = '';
    for (let i = 1; i <= STEPS; i++) {
      const cls = i < step ? 'done' : i === step ? 'active' : '';
      dotsHtml += `<div class="ob-step-dot ${cls}"></div>`;
    }

    // Contenido dinámico según el paso
    const bodyHtml = step === 1 ? _htmlStep1()
                   : step === 2 ? _htmlStep2()
                   : _htmlStep3();

    _overlay.innerHTML = `
<div class="ob-sheet">
  <div class="ob-top">
    <div class="ob-brand">PsicoApp · Paso ${step} de ${STEPS}</div>
    <div class="ob-steps">${dotsHtml}</div>
    <div class="ob-title">${meta.title}</div>
    ${meta.sub ? `<div class="ob-sub">${meta.sub}</div>` : ''}
  </div>
  ${bodyHtml}
</div>`;

    _bindStep(step);
  }

  /* ── Bind de eventos por paso ────────────────────────────── */
  function _bindStep(step) {
    const $ = id => _overlay.querySelector('#' + id);

    function _showError(msg) {
      const el = $('ob-error');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
    }
    function _clearError() {
      const el = $('ob-error');
      if (el) el.classList.remove('show');
    }
    function _setLoading(id, spId, loading) {
      const btn = $(id); const sp = $(spId);
      if (!btn) return;
      btn.disabled = loading;
      if (sp) sp.style.display = loading ? 'block' : 'none';
    }

    if (step === 1) {
      // ── Guardar perfil ───────────────────────────────────
      $('ob-btn-next1')?.addEventListener('click', async () => {
        _clearError();
        const nombre = $('ob-nombre')?.value.trim();
        if (!nombre) { _showError('El nombre es obligatorio.'); return; }

        _setLoading('ob-btn-next1', 'ob-sp1', true);
        $('ob-lbl1').textContent = 'Guardando…';

        try {
          const userId = await PsicoRouter.store.ensureUserId();
          const especialidad = $('ob-especialidad')?.value.trim() || null;
          const telefono     = $('ob-telefono')?.value.trim()     || null;

          const { error } = await sb.from('profiles').upsert({
            id: userId,
            nombre_completo:      nombre,
            especialidad,
            telefono_profesional: telefono,
          }, { onConflict: 'id' });

          if (error) throw error;

          // Actualizar store
          PsicoRouter.store.setPerfil({ nombre_completo: nombre, especialidad, telefono_profesional: telefono });

          // Actualizar sidebar
          const nameEl = document.getElementById('sb-user-name');
          if (nameEl) nameEl.textContent = nombre;

          _step = 2;
          _render(2);
        } catch (e) {
          _showError('❌ Error al guardar: ' + e.message);
          _setLoading('ob-btn-next1', 'ob-sp1', false);
          $('ob-lbl1').textContent = 'Guardar y continuar →';
        }
      });

      $('ob-btn-skip1')?.addEventListener('click', () => {
        _step = 2;
        _render(2);
      });
    }

    if (step === 2) {
      // ── Guardar primer paciente ──────────────────────────
      $('ob-btn-next2')?.addEventListener('click', async () => {
        _clearError();
        const nombre = $('ob-pac-nombre')?.value.trim();
        if (!nombre) { _showError('El nombre del paciente es obligatorio.'); return; }

        _setLoading('ob-btn-next2', 'ob-sp2', true);
        $('ob-lbl2').textContent = 'Guardando…';

        try {
          const userId   = await PsicoRouter.store.ensureUserId();
          const apellido = $('ob-pac-apellido')?.value.trim() || null;
          const telefono = $('ob-pac-tel')?.value.trim()      || null;

          const { error } = await sb.from('pacientes').insert({
            user_id: userId,
            nombre,
            apellido,
            telefono,
            activo: true,
          });

          if (error) throw error;

          // Invalidar cache de pacientes para que la agenda lo vea
          PsicoRouter.store.invalidatePacientes();

          _step = 3;
          _render(3);
        } catch (e) {
          _showError('❌ Error al guardar paciente: ' + e.message);
          _setLoading('ob-btn-next2', 'ob-sp2', false);
          $('ob-lbl2').textContent = 'Agregar paciente →';
        }
      });

      $('ob-btn-skip2')?.addEventListener('click', () => {
        _step = 3;
        _render(3);
      });
    }

    if (step === 3) {
      // ── Navegar desde el step final ──────────────────────
      $('ob-go-agenda')?.addEventListener('click', () => {
        _dismiss();
        PsicoRouter.navigate('agenda');
      });
      $('ob-go-pacientes')?.addEventListener('click', () => {
        _dismiss();
        PsicoRouter.navigate('pacientes');
      });
      $('ob-btn-close')?.addEventListener('click', () => {
        _dismiss();
      });
    }
  }

  /* ── Cerrar overlay ──────────────────────────────────────── */
  function _dismiss() {
    if (!_overlay) return;
    _overlay.style.opacity = '0';
    setTimeout(() => { _overlay?.remove(); _overlay = null; }, 300);
    // Marcar como visto en sessionStorage (no vuelve a aparecer en esta sesión)
    try { sessionStorage.setItem('ob_done', '1'); } catch {}
  }

  /* ── API pública ─────────────────────────────────────────── */

  /**
   * check() — verifica si el onboarding es necesario y lo muestra.
   * Llamar después de que auth esté confirmado.
   */
  async function check() {
    // Ya visto en esta sesión → no volver a mostrar
    try { if (sessionStorage.getItem('ob_done')) return; } catch {}

    let perfil = {};
    try {
      perfil = await PsicoRouter.store.ensurePerfil();
    } catch (e) {
      console.warn('[Onboarding] No se pudo verificar perfil:', e.message);
      return;
    }

    // Si ya tiene nombre configurado → usuario existente, saltar
    if (perfil.nombre_completo?.trim()) return;

    _show();
  }

  function _show() {
    if (_overlay) return;  // ya visible

    _injectStyles();
    _overlay = document.createElement('div');
    _overlay.id = 'psico-onboarding';
    document.body.appendChild(_overlay);

    _step = 1;
    _render(1);

    // Foco en el primer input
    setTimeout(() => {
      _overlay?.querySelector('#ob-nombre')?.focus();
    }, 350);
  }

  return { check };

})();

/* ── Auto-inicializar después de auth ─────────────────────── */
(function _autoInit() {
  const ready = window._psicoAuthReady || Promise.resolve();
  ready.then(() => {
    // Pequeño delay para que el router ya haya cargado la vista inicial
    setTimeout(() => PsicoOnboarding.check(), 800);
  });
})();
