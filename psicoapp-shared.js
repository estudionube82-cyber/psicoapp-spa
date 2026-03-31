/* ================================================================
   PSICOAPP — SHARED JS
   psicoapp-shared.js — v1.0.0
   Incluir en TODAS las páginas internas después de config.js y supabase:
   <script src="/psicoapp-shared.js"></script>
   ================================================================ */

// ── CONFIRM MODAL ──────────────────────────────────────────────
function paConfirm({ icon='🗑️', title='¿Estás seguro?', msg='Esta acción no se puede deshacer.', okLabel='Eliminar', okColor='#DC2626', onOk }) {
  const existing = document.getElementById('pa-confirm-overlay');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'pa-confirm-overlay';
  el.innerHTML = `
    <div id="pa-confirm-box">
      <div id="pa-confirm-icon">${icon}</div>
      <div id="pa-confirm-title">${title}</div>
      <div id="pa-confirm-msg">${msg}</div>
      <div class="pa-confirm-actions">
        <button class="pa-confirm-cancel" id="pa-confirm-cancel-btn">Cancelar</button>
        <button class="pa-confirm-ok" id="pa-confirm-ok-btn" style="background:${okColor};box-shadow:0 4px 14px ${okColor}55">${okLabel}</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  const close = () => { el.style.opacity='0'; el.style.transition='opacity .15s'; setTimeout(()=>el.remove(),160); };
  document.getElementById('pa-confirm-cancel-btn').onclick = close;
  el.addEventListener('click', e => { if(e.target===el) close(); });
  document.getElementById('pa-confirm-ok-btn').onclick = () => { close(); if(onOk) onOk(); };
}

// ── DEBOUNCE BÚSQUEDA ──────────────────────────────────────────
let _searchTimer = null;
function debouncedFiltrar(fn, delay=280) {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(fn, delay);
}

// ── TOGGLE TEMA ────────────────────────────────────────────────
function toggleTheme(){
  var html = document.documentElement;
  var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('psicoapp-theme', next);
  var th = document.getElementById('toggle-thumb');
  if(th) th.textContent = next === 'dark' ? '🌙' : '☀️';
}

// ── DRAWER MOBILE ──────────────────────────────────────────────
function toggleDrawer() {
  document.getElementById('sideDrawer').classList.toggle('open');
  document.getElementById('menuOverlay').classList.toggle('open');
}

function closeDrawer() {
  document.getElementById('sideDrawer').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('open');
}

// ── LOGOUT ─────────────────────────────────────────────────────
async function doLogout() {
  const {createClient} = supabase;
  const sb = createClient(PSICOAPP_CONFIG.SUPA_URL, PSICOAPP_CONFIG.SUPA_KEY);
  window._psicoSigningOut = true;
  try { await sb.auth.signOut(); } catch(e) {}
  window.location.replace('/login.html');
}

// ── OFFLINE BANNER ─────────────────────────────────────────────
(function(){
  const banner = document.getElementById('pa-offline-banner');
  if (!banner) return;
  const msg = document.getElementById('pa-offline-msg');
  const dot = document.getElementById('pa-offline-dot');
  function update() {
    if (!navigator.onLine) {
      banner.classList.add('visible');
      msg.textContent = 'Sin conexión — los cambios no se guardarán';
      dot.style.background = '#EF4444';
    } else {
      if (banner.classList.contains('visible')) {
        msg.textContent = '✓ Conexión restaurada';
        dot.style.background = '#22C55E';
        dot.style.animation = 'none';
        setTimeout(() => banner.classList.remove('visible'), 2200);
      }
    }
  }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
})();


// ── VALIDADORES ───────────────────────────────────────────────
const PA = {
  // Teléfono argentino: 10 dígitos, acepta espacios y guiones
  telefono: v => !v || /^[\d\s\-+]{8,15}$/.test(v.trim()),
  // DNI argentino: 6-9 dígitos, acepta puntos
  dni:      v => !v || /^[\d\.]{6,10}$/.test(v.trim()),
  // Email básico
  email:    v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  // Matrícula: números, puntos y guiones
  matricula:v => !v || /^[\d\s./-]{3,15}$/.test(v.trim()),
  // Monto positivo
  monto:    v => !v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0),
  // Fecha válida
  fecha:    v => !v || !isNaN(new Date(v).getTime()),
};

// Mostrar error en un campo
function paFieldError(inputId, msg) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.style.borderColor = '#DC2626';
  el.style.boxShadow   = '0 0 0 3px rgba(220,38,38,.15)';
  // Crear o actualizar mensaje de error
  let errEl = document.getElementById(inputId + '-err');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.id = inputId + '-err';
    errEl.style.cssText = 'font-size:.75rem;color:#DC2626;font-weight:600;margin-top:4px;';
    el.parentNode.insertBefore(errEl, el.nextSibling);
  }
  errEl.textContent = msg;
  el.addEventListener('input', () => paClearFieldError(inputId), { once: true });
}

// Limpiar error de un campo
function paClearFieldError(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }
  const errEl = document.getElementById(inputId + '-err');
  if (errEl) errEl.remove();
}

// Toast de error genérico de red
function paNetworkError(context) {
  const msg = context
    ? `Error al ${context}. Verificá tu conexión e intentá de nuevo.`
    : 'Error de conexión. Intentá de nuevo.';
  // Usar showToast si existe, sino crear uno inline
  if (typeof showToast === 'function') {
    showToast('❌ ' + msg, true);
  } else {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#DC2626;color:white;padding:12px 22px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;max-width:320px;text-align:center;';
    t.textContent = '❌ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }
}

// Resetear botón de submit
function paResetBtn(btnId, label) {
  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = false; btn.textContent = label; }
}
// ──────────────────────────────────────────────────────────────
