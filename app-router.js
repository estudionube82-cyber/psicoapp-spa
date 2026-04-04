/**
 * app-router.js — PsicoApp SPA Router
 * ─────────────────────────────────────────────────────────────
 * Ciclo de vida por vista:
 *   init()    → una sola vez, monta HTML + listeners
 *   onEnter() → cada vez que se navega a la vista (carga datos)
 *   onLeave() → limpieza opcional (cancelar timers, etc.)
 *
 * Las views se registran con: PsicoRouter.register(name, { init, onEnter, onLeave })
 * La navegación global sigue siendo: navigate(viewName)
 * ─────────────────────────────────────────────────────────────
 */

const PsicoRouter = (() => {

  /* ── Registro de vistas ─────────────────────────────────── */
  const _views      = {};   // { name: { init, onEnter, onLeave } }
  const _mounted    = {};   // { name: boolean }
  let   _current    = null;

  const VALID_VIEWS = [
    'dashboard','agenda','pacientes','historia',
    'whatsapp','pagos','informes','pericias','perfil','cuenta'
  ];

  /* ── Store global mínimo ─────────────────────────────────── */
  // Cachés compartidos entre vistas para evitar re-fetches
  const store = {
    userId:    window._psicoUserId || null,
    pacientes: null,  // null = no cargado; [] = cargado pero vacío
    perfil:    null,

    async ensureUserId() {
      if (this.userId) return this.userId;
      if (window._psicoUserId) { this.userId = window._psicoUserId; return this.userId; }
      const { data: { user } } = await sb.auth.getUser();
      this.userId = user?.id || null;
      return this.userId;
    },

    async ensurePacientes() {
      if (this.pacientes !== null) return this.pacientes;
      const uid = await this.ensureUserId();
      if (!uid) return [];
      const { data } = await sb.from('pacientes')
        .select('*')
        .eq('user_id', uid)
        .eq('activo', true)
        .order('apellido');
      this.pacientes = data || [];
      return this.pacientes;
    },
    invalidatePacientes() {
      this.pacientes = null;
      window.dispatchEvent(new CustomEvent('storeUpdated', { detail: { type: 'pacientes' } }));
    },

    async ensurePerfil() {
      if (this.perfil !== null) return this.perfil;
      const uid = await this.ensureUserId();
      if (!uid) return {};
      const { data } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
      this.perfil = data || {};
      return this.perfil;
    },
    /* Actualiza el cache con datos ya conocidos (sin round-trip a Supabase).
       Usar después de un save exitoso para que los listeners reciban datos frescos. */
    setPerfil(data) {
      this.perfil = { ...(this.perfil || {}), ...data };
    },
    /* Borra el cache y fuerza re-fetch en el próximo ensurePerfil(). */
    invalidatePerfil() {
      this.perfil = null;
      window.dispatchEvent(new CustomEvent('storeUpdated', { detail: { type: 'perfil' } }));
    },

    /* ── Turnos: cache por rango de fechas ───────────────────
     * ensureTurnos({ desde, hasta }) → solo carga el rango pedido.
     * invalidateTurnos() → limpia todo el cache (tras crear/editar/borrar).
     * ─────────────────────────────────────────────────────── */
    _turnosCache: {},
    async ensureTurnos({ desde, hasta }) {
      const uid = await this.ensureUserId();
      if (!uid) return [];
      if (!this._turnosCache) this._turnosCache = {};
      const key = `${desde}_${hasta}`;
      if (this._turnosCache[key]) return this._turnosCache[key];
      const { data } = await sb.from('turnos')
        .select('*')
        .eq('user_id', uid)
        .gte('fecha', desde)
        .lte('fecha', hasta)
        .order('fecha', { ascending: true })
        .order('hora',  { ascending: true });
      this._turnosCache[key] = data || [];
      return this._turnosCache[key];
    },
    invalidateTurnos() {
      this._turnosCache = {};
      window.dispatchEvent(new CustomEvent('storeUpdated', { detail: { type: 'turnos' } }));
    },
  };

  /* ── Registrar una vista ─────────────────────────────────── */
  function register(name, { init, onEnter, onLeave } = {}) {
    _views[name] = {
      init:    typeof init    === 'function' ? init    : null,
      onEnter: typeof onEnter === 'function' ? onEnter : null,
      onLeave: typeof onLeave === 'function' ? onLeave : null,
    };
  }

  /* ── Navegar ─────────────────────────────────────────────── */
  async function navigate(viewName) {
    if (!VALID_VIEWS.includes(viewName)) viewName = 'dashboard';
    if (viewName === _current) return;

    /* 1. onLeave de la vista actual */
    if (_current) {
      const prev = _views[_current];
      if (prev?.onLeave) prev.onLeave();
      const prevEl = document.getElementById('view-' + _current);
      if (prevEl) prevEl.classList.remove('view-active');
    }

    /* 2. Mostrar contenedor */
    const el = document.getElementById('view-' + viewName);
    if (!el) { console.warn('[Router] contenedor no encontrado:', viewName); return; }
    el.classList.add('view-active');
    _current = viewName;

    /* 3. Actualizar nav activo */
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.classList.toggle('sb-active', btn.dataset.view === viewName);
      btn.classList.toggle('bn-active', btn.dataset.view === viewName);
    });

    /* 4. URL */
    history.pushState({ view: viewName }, '', '/?v=' + viewName);

    /* 5. Scroll arriba */
    const cont = document.getElementById('view-container');
    if (cont) cont.scrollTop = 0;

    /* 6. init() — solo la primera vez */
    const view = _views[viewName];
    if (view && !_mounted[viewName]) {
      if (view.init) {
        try { await view.init(el); }
        catch(e) { console.error('[Router] init error en', viewName, e); }
      }
      _mounted[viewName] = true;
    }

    /* 7. onEnter() — cada vez */
    if (view?.onEnter) {
      try { await view.onEnter(el); }
      catch(e) { console.error('[Router] onEnter error en', viewName, e); }
    }

    /* 8. Compatibilidad: respetar hooks legacy window.onViewEnter_X */
    const legacyHook = window['onViewEnter_' + viewName];
    if (!view && typeof legacyHook === 'function') legacyHook();
  }

  /* ── Init del router ────────────────────────────────────── */
  function init() {
    /* Popstate (botón Atrás) */
    window.addEventListener('popstate', (e) => {
      navigate(e.state?.view || 'dashboard');
    });

    /* Primera vista desde URL — espera a que auth esté confirmado */
    document.addEventListener('DOMContentLoaded', () => {
      const params  = new URLSearchParams(window.location.search);
      const initial = VALID_VIEWS.includes(params.get('v')) ? params.get('v') : 'dashboard';

      // _psicoAuthReady es una Promise creada en index.html que se resuelve
      // solo cuando getSession() confirmó sesión válida. Esto elimina la
      // race condition: el router nunca navega antes de que auth esté listo.
      const authReady = window._psicoAuthReady || Promise.resolve();
      authReady.then(() => navigate(initial));
    });
  }

  /* ── Exponer API pública ─────────────────────────────────── */
  return { register, navigate, store, init };

})();

/* ── navigate() global para mantener compatibilidad con onclick="navigate(...)" ── */
function navigate(viewName) {
  PsicoRouter.navigate(viewName);
}

/* Arrancar el router */
PsicoRouter.init();
