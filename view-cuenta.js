/**
 * view-cuenta.js — PsicoApp
 * Planes: Free / Pro / Max + Preferencias + Integraciones + Tutoriales
 * Fuente de verdad: PsicoRouter.store (perfil) + PlanService (plan/uso)
 */

(function injectCuentaStyles() {
  if (document.getElementById('view-cuenta-styles')) return;
  const style = document.createElement('style');
  style.id = 'view-cuenta-styles';
  style.textContent = `
#view-cuenta { min-height:100vh; background:var(--bg); }
#view-cuenta .vc-hero { background:linear-gradient(145deg,#1E1040 0%,#2D1B69 55%,#4C2A9A 100%); padding:28px 20px 56px; position:relative; overflow:hidden; }
#view-cuenta .vc-hero::before { content:''; position:absolute; width:260px; height:260px; border-radius:50%; background:rgba(255,255,255,.04); right:-60px; top:-60px; }
#view-cuenta .vc-hero::after  { content:''; position:absolute; width:180px; height:180px; border-radius:50%; background:rgba(167,139,250,.1); left:-40px; bottom:-40px; }
#view-cuenta .vc-hero-inner   { position:relative; z-index:1; display:flex; align-items:center; gap:16px; }
#view-cuenta .vc-avatar { width:64px; height:64px; border-radius:20px; background:linear-gradient(135deg,#5B2FA8,#A78BFA); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; color:white; flex-shrink:0; border:2px solid rgba(255,255,255,.18); box-shadow:0 4px 20px rgba(0,0,0,.3); overflow:hidden; }
#view-cuenta .vc-avatar img { width:100%; height:100%; object-fit:cover; border-radius:18px; }
#view-cuenta .vc-hero-name  { font-size:20px; font-weight:800; color:white; line-height:1.1; }
#view-cuenta .vc-hero-email { font-size:13px; color:rgba(255,255,255,.55); margin-top:3px; }
#view-cuenta .vc-hero-badge { display:inline-flex; align-items:center; gap:5px; margin-top:7px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:800; }
#view-cuenta .hb-pro  { background:linear-gradient(135deg,rgba(124,58,237,.6),rgba(167,139,250,.4)); border:1px solid rgba(167,139,250,.4); color:#DDD6FE; }
#view-cuenta .hb-max  { background:linear-gradient(135deg,rgba(190,24,93,.5),rgba(244,114,182,.4)); border:1px solid rgba(244,114,182,.4); color:#FDE8F5; }
#view-cuenta .hb-free { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); color:rgba(255,255,255,.6); }

#view-cuenta .vc-body { padding:0 16px 40px; margin-top:-28px; position:relative; z-index:5; display:flex; flex-direction:column; gap:16px; max-width:560px; margin-left:auto; margin-right:auto; }
@media (min-width:768px) { #view-cuenta .vc-body { padding:0 28px 40px; } }

#view-cuenta .vc-status-strip { background:var(--surface); border-radius:var(--radius); padding:14px 18px; display:flex; align-items:center; justify-content:space-between; box-shadow:var(--shadow-md); }
#view-cuenta .vc-strip-left   { display:flex; align-items:center; gap:10px; }
#view-cuenta .vc-strip-dot    { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
#view-cuenta .dot-activa   { background:#7C3AED; box-shadow:0 0 8px rgba(124,58,237,.5); }
#view-cuenta .dot-inactiva { background:#9CA3AF; }
#view-cuenta .vc-strip-label { font-size:13px; font-weight:600; color:var(--text-muted); }
#view-cuenta .vc-strip-val   { font-size:14px; font-weight:800; color:var(--text); }

#view-cuenta .vc-section-title { font-size:13px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; }

#view-cuenta .vc-usage-card { background:var(--surface); border-radius:var(--radius); padding:20px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:14px; }
#view-cuenta .vc-usage-row  { display:flex; flex-direction:column; gap:6px; }
#view-cuenta .vc-usage-label-row { display:flex; justify-content:space-between; align-items:center; }
#view-cuenta .vc-usage-label { font-size:12px; font-weight:700; color:var(--text-muted); }
#view-cuenta .vc-usage-count { font-size:13px; font-weight:800; color:var(--text); }
#view-cuenta .vc-usage-count.alerta { color:#EF4444; }
#view-cuenta .vc-bar-track { height:7px; border-radius:99px; background:var(--border); overflow:hidden; }
#view-cuenta .vc-bar-fill  { height:100%; border-radius:99px; transition:width .4s; }

#view-cuenta .vc-planes-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(145px,1fr)); gap:12px; }
#view-cuenta .vc-plan-card { background:var(--surface); border-radius:var(--radius); padding:18px 14px 14px; border:2px solid var(--border); position:relative; display:flex; flex-direction:column; gap:10px; box-shadow:var(--shadow-sm); }
#view-cuenta .vc-plan-card.plan-actual { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-light),var(--shadow-md); }
#view-cuenta .plan-pro-card { background:linear-gradient(160deg,#1E1040,#2D1B69); border-color:rgba(167,139,250,.4); }
#view-cuenta .plan-max-card { background:linear-gradient(160deg,#0F0B1E,#1E0A3C); border-color:rgba(244,114,182,.4); }

#view-cuenta .vc-plan-badge-wrap { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
#view-cuenta .vc-badge { font-size:10px; font-weight:800; padding:3px 9px; border-radius:20px; }
#view-cuenta .badge-actual      { background:rgba(124,58,237,.15); color:#7C3AED; border:1px solid rgba(124,58,237,.3); }
#view-cuenta .badge-recomendado { background:linear-gradient(135deg,#5B2FA8,#7C3AED); color:white; }
#view-cuenta .badge-max         { background:linear-gradient(135deg,#BE185D,#F472B6); color:white; }
#view-cuenta .badge-free-tag    { background:var(--surface2); color:var(--text-muted); }

#view-cuenta .vc-plan-name  { font-size:22px; font-weight:800; line-height:1; }
#view-cuenta .vc-plan-price { font-size:12px; font-weight:600; }
#view-cuenta .plan-pro-card .vc-plan-name, #view-cuenta .plan-max-card .vc-plan-name  { color:white; }
#view-cuenta .plan-pro-card .vc-plan-price, #view-cuenta .plan-max-card .vc-plan-price { color:rgba(255,255,255,.5); }
#view-cuenta .plan-free-card .vc-plan-name  { color:var(--text); }
#view-cuenta .plan-free-card .vc-plan-price { color:var(--text-muted); }
#view-cuenta .vc-plan-features { display:flex; flex-direction:column; gap:6px; flex:1; }
#view-cuenta .vc-pf { display:flex; align-items:flex-start; gap:6px; font-size:11px; font-weight:500; line-height:1.3; }
#view-cuenta .plan-pro-card .vc-pf, #view-cuenta .plan-max-card .vc-pf { color:rgba(255,255,255,.75); }
#view-cuenta .plan-free-card .vc-pf { color:var(--text-muted); }
#view-cuenta .vc-pf-icon { font-size:12px; flex-shrink:0; margin-top:1px; }
#view-cuenta .pf-lock { opacity:.4; }

#view-cuenta .vc-plan-btn { width:100%; padding:10px; border-radius:var(--radius-sm); border:none; font-family:var(--font); font-size:12px; font-weight:800; cursor:pointer; transition:transform .12s; display:flex; align-items:center; justify-content:center; gap:5px; }
#view-cuenta .vc-plan-btn:hover { transform:translateY(-1px); }
#view-cuenta .btn-plan-actual  { background:var(--surface2); color:var(--text-muted); cursor:default; }
#view-cuenta .btn-plan-actual:hover { transform:none; }
#view-cuenta .btn-upgrade     { background:linear-gradient(135deg,#5B2FA8,#7C3AED); color:white; box-shadow:0 4px 16px rgba(92,47,168,.4); }
#view-cuenta .btn-upgrade-max { background:linear-gradient(135deg,#BE185D,#F472B6); color:white; box-shadow:0 4px 16px rgba(244,114,182,.4); }

#view-cuenta .vc-btn-extra { width:100%; padding:12px; border-radius:var(--radius-sm); background:linear-gradient(135deg,rgba(92,47,168,.1),rgba(124,58,237,.08)); border:1.5px dashed rgba(124,58,237,.35); color:var(--primary); font-family:var(--font); font-size:12px; font-weight:800; cursor:pointer; transition:transform .12s; }
#view-cuenta .vc-btn-extra:hover { transform:translateY(-1px); }
#view-cuenta .vc-logout-wrap { display:flex; flex-direction:column; gap:8px; }
#view-cuenta .vc-btn-logout { width:100%; padding:13px; border-radius:var(--radius-sm); background:var(--danger-light); color:var(--danger); border:1.5px solid rgba(229,62,62,.2); font-family:var(--font); font-size:14px; font-weight:700; cursor:pointer; transition:transform .12s; }
#view-cuenta .vc-btn-logout:hover { transform:translateY(-1px); }
#view-cuenta .vc-toast { position:fixed; top:80px; left:50%; transform:translateX(-50%); background:#1A1530; color:white; padding:12px 22px; border-radius:12px; font-size:14px; font-weight:700; z-index:9999; display:none; white-space:nowrap; box-shadow:0 8px 32px rgba(0,0,0,.35); }
#view-cuenta .vc-toast.show { display:block; animation:vcFadeUp .25s ease; }
@keyframes vcFadeUp { from{opacity:0;transform:translate(-50%,8px)} to{opacity:1;transform:translate(-50%,0)} }
#view-cuenta .vc-pad { height:24px; }

/* ── PREFERENCIAS ── */
#view-cuenta .vc-pref-card { background:var(--surface); border-radius:var(--radius); padding:20px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:0; }
#view-cuenta .vc-pref-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 0; }
#view-cuenta .vc-pref-row:first-child { padding-top:0; }
#view-cuenta .vc-pref-row:last-of-type { padding-bottom:0; }
#view-cuenta .vc-pref-label { font-size:13px; font-weight:700; color:var(--text); flex:1; min-width:0; }
#view-cuenta .vc-pref-sub { font-size:11px; font-weight:500; color:var(--text-muted); margin-top:2px; }
#view-cuenta .vc-pref-divider { height:1px; background:var(--border); margin:0 -4px; }

#view-cuenta .vc-vista-toggle { display:flex; gap:4px; background:var(--surface2); border-radius:8px; padding:3px; flex-shrink:0; }
#view-cuenta .vc-vt-btn { border:none; background:transparent; font-family:var(--font); font-size:11px; font-weight:700; color:var(--text-muted); padding:5px 10px; border-radius:6px; cursor:pointer; transition:all .15s; white-space:nowrap; }
#view-cuenta .vc-vt-btn.active { background:var(--primary); color:white; box-shadow:0 2px 8px rgba(124,58,237,.3); }

#view-cuenta .vc-hora-range { display:flex; align-items:center; gap:6px; flex-shrink:0; }
#view-cuenta .vc-hora-sep { font-size:12px; color:var(--text-muted); font-weight:600; }
#view-cuenta .vc-select { border:1px solid var(--border); border-radius:8px; background:var(--surface2); color:var(--text); font-family:var(--font); font-size:12px; font-weight:700; padding:6px 8px; cursor:pointer; outline:none; appearance:none; -webkit-appearance:none; min-width:64px; text-align:center; }
#view-cuenta .vc-select:focus { border-color:var(--primary); }

#view-cuenta .vc-prefs-saved { font-size:11px; font-weight:700; color:#10B981; text-align:right; padding-top:8px; border-top:1px solid var(--border); margin-top:4px; animation:vcFadeUp .2s ease; }

/* ── INTEGRACIONES ── */
#view-cuenta .vc-integ-card { background:var(--surface); border-radius:var(--radius); padding:4px 0; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; }
#view-cuenta .vc-integ-row { display:flex; align-items:center; gap:14px; padding:16px 20px; }
#view-cuenta .vc-integ-row + .vc-integ-row { border-top:1px solid var(--border); }
#view-cuenta .vc-integ-logo { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
#view-cuenta .vc-integ-logo-gcal { background:linear-gradient(135deg,#E8F0FE,#4285F4); }
#view-cuenta .vc-integ-info { flex:1; min-width:0; }
#view-cuenta .vc-integ-name { font-size:14px; font-weight:800; color:var(--text); }
#view-cuenta .vc-integ-desc { font-size:11px; font-weight:500; color:var(--text-muted); margin-top:2px; }
#view-cuenta .vc-integ-status { display:flex; align-items:center; gap:5px; margin-top:4px; }
#view-cuenta .vc-integ-dot { width:7px; height:7px; border-radius:50%; background:#9CA3AF; flex-shrink:0; }
#view-cuenta .vc-integ-dot.conectado { background:#10B981; box-shadow:0 0 6px rgba(16,185,129,.4); }
#view-cuenta .vc-integ-status-text { font-size:11px; font-weight:600; color:var(--text-muted); }
#view-cuenta .vc-integ-status-text.conectado { color:#10B981; }

#view-cuenta .vc-btn-conectar { padding:7px 14px; border-radius:8px; border:1.5px solid rgba(124,58,237,.3); background:rgba(124,58,237,.08); color:var(--primary); font-family:var(--font); font-size:12px; font-weight:800; cursor:pointer; transition:all .15s; white-space:nowrap; flex-shrink:0; }
#view-cuenta .vc-btn-conectar:hover { background:rgba(124,58,237,.15); transform:translateY(-1px); }
#view-cuenta .vc-btn-conectar.conectado { border-color:rgba(16,185,129,.3); background:rgba(16,185,129,.08); color:#10B981; }
#view-cuenta .vc-btn-desconectar { padding:7px 14px; border-radius:8px; border:1.5px solid rgba(239,68,68,.2); background:rgba(239,68,68,.06); color:#EF4444; font-family:var(--font); font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; white-space:nowrap; flex-shrink:0; }

/* ── MODAL GCAL ── */
#vc-gcal-modal { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(4px); z-index:9990; display:flex; align-items:flex-end; justify-content:center; padding:0; animation:vcFadeIn .2s ease; }
#vc-gcal-modal.hidden { display:none; }
@keyframes vcFadeIn { from{opacity:0} to{opacity:1} }
#vc-gcal-modal .vcm-sheet { background:var(--surface); border-radius:20px 20px 0 0; padding:28px 24px 40px; width:100%; max-width:520px; animation:vcSlideUp .25s ease; }
@keyframes vcSlideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
#vc-gcal-modal .vcm-title { font-size:18px; font-weight:800; color:var(--text); margin-bottom:6px; display:flex; align-items:center; gap:10px; }
#vc-gcal-modal .vcm-sub { font-size:13px; color:var(--text-muted); margin-bottom:20px; line-height:1.5; }
#vc-gcal-modal .vcm-steps { display:flex; flex-direction:column; gap:12px; margin-bottom:24px; }
#vc-gcal-modal .vcm-step { display:flex; align-items:flex-start; gap:12px; }
#vc-gcal-modal .vcm-step-num { width:24px; height:24px; border-radius:50%; background:rgba(124,58,237,.15); color:var(--primary); font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
#vc-gcal-modal .vcm-step-text { font-size:13px; color:var(--text); line-height:1.5; }
#vc-gcal-modal .vcm-step-text strong { color:var(--primary); }
#vc-gcal-modal .vcm-actions { display:flex; gap:10px; }
#vc-gcal-modal .vcm-btn-primary { flex:1; padding:13px; border-radius:var(--radius-sm); background:linear-gradient(135deg,#4285F4,#34A853); color:white; border:none; font-family:var(--font); font-size:14px; font-weight:800; cursor:pointer; }
#vc-gcal-modal .vcm-btn-cancel { padding:13px 18px; border-radius:var(--radius-sm); background:var(--surface2); color:var(--text-muted); border:none; font-family:var(--font); font-size:14px; font-weight:700; cursor:pointer; }

/* ── TUTORIALES ── */
#view-cuenta .vc-tuto-list { display:flex; flex-direction:column; gap:0; background:var(--surface); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow-sm); }
#view-cuenta .vc-tuto-item { border-bottom:1px solid var(--border); }
#view-cuenta .vc-tuto-item:last-child { border-bottom:none; }
#view-cuenta .vc-tuto-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; cursor:pointer; user-select:none; gap:12px; }
#view-cuenta .vc-tuto-header:active { background:var(--surface2); }
#view-cuenta .vc-tuto-icon { font-size:18px; flex-shrink:0; }
#view-cuenta .vc-tuto-htitle { font-size:13px; font-weight:700; color:var(--text); flex:1; }
#view-cuenta .vc-tuto-arrow { font-size:18px; color:var(--text-muted); transition:transform .2s; font-weight:300; flex-shrink:0; }
#view-cuenta .vc-tuto-item.open .vc-tuto-arrow { transform:rotate(90deg); }
#view-cuenta .vc-tuto-body { padding:0 20px 18px; display:none; }
#view-cuenta .vc-tuto-item.open .vc-tuto-body { display:block; }
#view-cuenta .vc-tuto-body p { font-size:13px; color:var(--text-muted); line-height:1.6; margin:0 0 10px; }
#view-cuenta .vc-tuto-body ol { padding-left:18px; margin:0 0 10px; }
#view-cuenta .vc-tuto-body li { font-size:13px; color:var(--text-muted); line-height:1.7; }
#view-cuenta .vc-tuto-body li strong { color:var(--text); }
#view-cuenta .vc-tuto-tag { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(124,58,237,.1); color:var(--primary); margin-top:4px; }
  `;
  document.head.appendChild(style);
})();

/* ══ PREFERENCIAS — clave localStorage ══ */
const VC_PREFS_KEY = 'psicoapp_prefs_v1';

/**
 * Lee preferencias con Supabase como fuente de verdad.
 * Si el store ya tiene `perfil.preferencias` (cargado por ensurePerfil),
 * los usa y los sincroniza a localStorage.
 * Si no, cae a localStorage (modo offline / primer render).
 */
function _vcLoadPrefs() {
  const defaults = { cal_vista: 'semana', agenda_inicio: 8, agenda_fin: 20 };
  try {
    const supaPrefs = PsicoRouter.store.perfil?.preferencias;
    if (supaPrefs && typeof supaPrefs === 'object' && Object.keys(supaPrefs).length > 0) {
      // Supabase es autoritativo — mergeamos con defaults y sincronizamos a localStorage
      const merged = { ...defaults, ...supaPrefs };
      try { localStorage.setItem(VC_PREFS_KEY, JSON.stringify(merged)); } catch {}
      return merged;
    }
    // Sin datos en Supabase aún → usamos localStorage como fallback
    const raw = localStorage.getItem(VC_PREFS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch { return { ...defaults }; }
}

/**
 * Guarda preferencias:
 * 1. Actualiza el store en memoria (lectura síncrona inmediata)
 * 2. Sincroniza a localStorage (offline cache)
 * 3. Persiste en Supabase profiles.preferencias (JSONB)
 */
async function _vcSavePrefs(prefs) {
  // 1. Store en memoria — primero para que vcGetPref() lo lea de inmediato
  if (PsicoRouter.store.perfil) PsicoRouter.store.perfil.preferencias = prefs;
  // 2. localStorage — cache offline
  try { localStorage.setItem(VC_PREFS_KEY, JSON.stringify(prefs)); } catch {}
  // 3. Supabase — fuente de verdad remota
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const { error } = await sb.from('profiles')
        .upsert({ id: user.id, preferencias: prefs }, { onConflict: 'id' });
      if (error) console.warn('[Prefs] Supabase error al guardar preferencias:', error.message);
    }
  } catch (e) { console.warn('[Prefs] Supabase no pudo guardar (ignorado):', e.message); }
}

/**
 * API pública sincrónica — lee desde localStorage (siempre sincronizado con Supabase).
 * Usado por view-agenda.js para obtener HORAS y vista por defecto.
 */
window.vcGetPref = function(key, fallback) {
  try {
    // Intentar desde el store en memoria primero (más actualizado)
    const supaPrefs = PsicoRouter.store?.perfil?.preferencias;
    if (supaPrefs && typeof supaPrefs === 'object' && key in supaPrefs) return supaPrefs[key];
    // Fallback a localStorage
    const raw = localStorage.getItem(VC_PREFS_KEY);
    if (raw) { const p = JSON.parse(raw); if (key in p) return p[key]; }
  } catch {}
  return fallback;
};

/** Genera <option> para horas */
function _vcHorasOptions(desde, hasta, seleccionado) {
  let html = '';
  for (let h = desde; h <= hasta; h++) {
    const label = h === 0 ? '0:00' : h + ':00';
    html += `<option value="${h}" ${h === seleccionado ? 'selected' : ''}>${label}hs</option>`;
  }
  return html;
}

/**
 * Estado de Google Calendar.
 * Lee en este orden: store en memoria → localStorage → false.
 * El store se actualiza en _vcLoadPrefs() cuando Supabase tiene el valor.
 */
const VC_GCAL_KEY = 'psicoapp_gcal_conectado';
function _vcGCalConectado() {
  // 1. Store en memoria (sincronizado con Supabase por _vcLoadPrefs)
  const fromStore = PsicoRouter.store?.perfil?.preferencias?.gcal_conectado;
  if (fromStore !== undefined) return !!fromStore;
  // 2. localStorage como fallback
  try { return localStorage.getItem(VC_GCAL_KEY) === '1'; } catch { return false; }
}

/**
 * Persiste el estado de GCal en:
 * 1. Store en memoria  (lectura síncrona inmediata)
 * 2. localStorage      (offline cache)
 * 3. Supabase profiles.preferencias (fuente de verdad)
 */
async function _vcGCalSetConectado(val) {
  // 1. Store en memoria
  if (PsicoRouter.store.perfil) {
    PsicoRouter.store.perfil.preferencias = {
      ...(PsicoRouter.store.perfil.preferencias || {}),
      gcal_conectado: !!val
    };
  }
  // 2. localStorage
  try {
    val ? localStorage.setItem(VC_GCAL_KEY, '1') : localStorage.removeItem(VC_GCAL_KEY);
    // Sincronizar también con VC_PREFS_KEY para consistencia
    const raw   = localStorage.getItem(VC_PREFS_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    prefs.gcal_conectado = !!val;
    localStorage.setItem(VC_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
  // 3. Supabase
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      // Leer preferencias actuales de Supabase antes de mergear
      const { data: profile } = await sb.from('profiles')
        .select('preferencias')
        .eq('id', user.id)
        .maybeSingle();
      const currentPrefs = profile?.preferencias || {};
      const newPrefs     = { ...currentPrefs, gcal_conectado: !!val };
      const { error } = await sb.from('profiles')
        .upsert({ id: user.id, preferencias: newPrefs }, { onConflict: 'id' });
      if (error) console.warn('[GCal] No se pudo persistir estado en Supabase:', error.message);
      else if (PsicoRouter.store.perfil) PsicoRouter.store.perfil.preferencias = newPrefs;
    }
  } catch (e) { console.warn('[GCal] Error al persistir estado:', e.message); }
}

/* ══ TOAST ══ */
function vcToast(msg) {
  const t = document.getElementById('vc-toast-global');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ══ BARRA DE USO ══ */
function _usageBar(usado, tope, label, color) {
  const pct    = tope > 0 ? Math.min(100, Math.round(usado / tope * 100)) : 0;
  const alerta = pct >= 80;
  return `
  <div class="vc-usage-row">
    <div class="vc-usage-label-row">
      <span class="vc-usage-label">${label}</span>
      <span class="vc-usage-count ${alerta ? 'alerta' : ''}">${usado} / ${tope}</span>
    </div>
    <div class="vc-bar-track">
      <div class="vc-bar-fill" style="width:${pct}%;background:${alerta ? '#EF4444' : color};"></div>
    </div>
  </div>`;
}

/* ══ RENDER PRINCIPAL ══
   Fuentes de verdad:
   - perfil  → PsicoRouter.store.ensurePerfil()   (nombre, foto, email)
   - plan    → PlanService.getPlan()               (plan, status, uso IA)
   Sin localStorage. Sin variables globales de cache.
═══════════════════════════════════════════════════ */
async function renderCuenta() {
  const container = document.getElementById('view-cuenta');
  if (!container) return;

  /* ── 1. Perfil desde el store (cache en memoria o fetch a Supabase) ── */
  let perfil = {};
  try {
    perfil = await PsicoRouter.store.ensurePerfil();
  } catch(e) {
    console.warn('[Cuenta] No se pudo obtener perfil:', e.message);
  }

  const nombre   = perfil.nombre_completo || perfil.nombre || 'Profesional';
  const email    = perfil.email           || '';
  const fotoUrl  = perfil.foto_url        || perfil.foto  || null;
  const iniciales = nombre.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const avatarHTML = fotoUrl
    ? `<img src="${fotoUrl}">`
    : (iniciales || '👤');

  /* ── 2. Plan desde PlanService (invalida cache para datos frescos) ── */
  let planData = { plan: 'free', status: 'active', ia_used: 0, ia_limit: 5 };
  try {
    if (typeof PlanService !== 'undefined') {
      PlanService.invalidar();
      planData = await PlanService.getPlan();
    }
  } catch(e) {
    console.warn('[Cuenta] No se pudo obtener plan:', e.message);
  }

  const plan       = planData.plan   || 'free';
  const estaActiva = planData.status === 'active';
  const iaUsado    = planData.ia_used  || 0;
  const iaLimit    = planData.ia_limit || 5;
  const lim        = typeof getPlanLimits === 'function'
    ? getPlanLimits(plan)
    : { whatsapp: 20, informesIA: iaLimit, dias: 15 };
  const planLabel  = plan.charAt(0).toUpperCase() + plan.slice(1);

  const heroBadge = plan === 'max'
    ? `<div class="vc-hero-badge hb-max">💎 Plan Max activo</div>`
    : plan === 'pro'
      ? `<div class="vc-hero-badge hb-pro">⭐ Plan Pro activo</div>`
      : `<div class="vc-hero-badge hb-free">🔒 Plan Free</div>`;

  /* ── 3. Preferencias e integraciones ── */
  const prefs = _vcLoadPrefs();
  const gcalConectado = _vcGCalConectado();

  /* ── 4. Renderizar ── */
  container.innerHTML = `
<div id="vc-toast-global" class="vc-toast"></div>

<div class="vc-hero">
  <div class="vc-hero-inner">
    <div class="vc-avatar">${avatarHTML}</div>
    <div>
      <div class="vc-hero-name">${nombre}</div>
      ${email ? `<div class="vc-hero-email">${email}</div>` : ''}
      ${heroBadge}
    </div>
  </div>
</div>

<div class="vc-body">

  <div class="vc-status-strip">
    <div class="vc-strip-left">
      <div class="vc-strip-dot ${estaActiva ? 'dot-activa' : 'dot-inactiva'}"></div>
      <div>
        <div class="vc-strip-label">Estado de suscripción</div>
        <div class="vc-strip-val">${estaActiva ? 'Activa' : 'Inactiva'}</div>
      </div>
    </div>
    <div style="text-align:right">
      <div class="vc-strip-label">Plan</div>
      <div class="vc-strip-val">${planLabel}</div>
    </div>
  </div>

  <div class="vc-usage-card">
    <div class="vc-section-title">Uso del plan</div>
    ${_usageBar(iaUsado, iaLimit, '🤖 Informes IA', '#A78BFA')}
    ${_usageBar(0, lim.whatsapp, '💬 Mensajes WhatsApp', '#7C3AED')}
    <div id="vc-extra-wa-wrap">
      <button class="vc-btn-extra" id="vc-btn-extra-wa">➕ Comprar 100 mensajes WhatsApp extra ($5.000)</button>
    </div>
  </div>

  <!-- ══ PREFERENCIAS ══ -->
  <div class="vc-section-title">⚙️ Preferencias</div>
  <div class="vc-pref-card">
    <div class="vc-pref-row">
      <div>
        <div class="vc-pref-label">Vista de calendario</div>
        <div class="vc-pref-sub">Vista al abrir la Agenda</div>
      </div>
      <div class="vc-vista-toggle" id="vc-vista-toggle">
        <button class="vc-vt-btn ${prefs.cal_vista === 'dia' ? 'active' : ''}" data-vista="dia">Día</button>
        <button class="vc-vt-btn ${prefs.cal_vista === 'semana' ? 'active' : ''}" data-vista="semana">Semana</button>
        <button class="vc-vt-btn ${prefs.cal_vista === 'mes' ? 'active' : ''}" data-vista="mes">Mes</button>
      </div>
    </div>
    <div class="vc-pref-divider"></div>
    <div class="vc-pref-row">
      <div>
        <div class="vc-pref-label">Horario de agenda</div>
        <div class="vc-pref-sub">Rango visible en la vista Día</div>
      </div>
      <div class="vc-hora-range">
        <select id="vc-hora-inicio" class="vc-select">
          ${_vcHorasOptions(0, 22, prefs.agenda_inicio)}
        </select>
        <span class="vc-hora-sep">a</span>
        <select id="vc-hora-fin" class="vc-select">
          ${_vcHorasOptions(1, 23, prefs.agenda_fin)}
        </select>
      </div>
    </div>
    <div id="vc-prefs-saved" class="vc-prefs-saved" style="display:none">✅ Preferencias guardadas</div>
  </div>

  <!-- ══ INTEGRACIONES ══ -->
  <div class="vc-section-title">🔗 Integraciones</div>
  <div class="vc-integ-card">
    <div class="vc-integ-row">
      <div class="vc-integ-logo vc-integ-logo-gcal">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="4" fill="white" fill-opacity="0"/>
          <path d="M19.5 3H18V1.5C18 1.22 17.78 1 17.5 1s-.5.22-.5.5V3H7V1.5C7 1.22 6.78 1 6.5 1S6 1.22 6 1.5V3H4.5C3.12 3 2 4.12 2 5.5v15C2 21.88 3.12 23 4.5 23h15c1.38 0 2.5-1.12 2.5-2.5v-15C22 4.12 20.88 3 19.5 3z" fill="#4285F4"/>
          <rect x="2" y="8" width="20" height="2" fill="#4285F4"/>
          <text x="12" y="18" text-anchor="middle" font-size="7" font-weight="800" fill="white" font-family="Arial">CAL</text>
        </svg>
      </div>
      <div class="vc-integ-info">
        <div class="vc-integ-name">Google Calendar</div>
        <div class="vc-integ-desc">Sincronizá tus turnos automáticamente</div>
        <div class="vc-integ-status">
          <div class="vc-integ-dot ${gcalConectado ? 'conectado' : ''}"></div>
          <span class="vc-integ-status-text ${gcalConectado ? 'conectado' : ''}">${gcalConectado ? 'Conectado' : 'Sin conectar'}</span>
        </div>
      </div>
      ${gcalConectado
        ? `<button class="vc-btn-desconectar" id="vc-btn-gcal-desc">Desconectar</button>`
        : `<button class="vc-btn-conectar" id="vc-btn-gcal-conn">Conectar</button>`
      }
    </div>
  </div>

  <!-- ══ TUTORIALES ══ -->
  <div class="vc-section-title">📚 Tutoriales</div>
  <div class="vc-tuto-list">

    <div class="vc-tuto-item" id="vc-tuto-gcal">
      <div class="vc-tuto-header">
        <span class="vc-tuto-icon">📅</span>
        <span class="vc-tuto-htitle">Google Calendar — próximamente</span>
        <span class="vc-tuto-arrow">›</span>
      </div>
      <div class="vc-tuto-body">
        <p>La integración con Google Calendar está en desarrollo. Cuando esté lista, tus turnos confirmados se agregarán automáticamente a tu calendario personal sin que tengas que hacer nada.</p>
        <ol>
          <li>Vas a presionar <strong>Conectar</strong> una sola vez.</li>
          <li>Google te pedirá autorizar el acceso al calendario.</li>
          <li>Desde ese momento, cada turno confirmado crea un evento automáticamente.</li>
          <li>Podés desconectar en cualquier momento.</li>
        </ol>
        <span class="vc-tuto-tag">🚧 En desarrollo</span>
      </div>
    </div>

    <div class="vc-tuto-item" id="vc-tuto-prefs">
      <div class="vc-tuto-header">
        <span class="vc-tuto-icon">⚙️</span>
        <span class="vc-tuto-htitle">Personalizá tu agenda</span>
        <span class="vc-tuto-arrow">›</span>
      </div>
      <div class="vc-tuto-body">
        <p>Configurá la agenda para que muestre exactamente el rango horario que usás en tu consulta.</p>
        <ol>
          <li>En <strong>Vista de calendario</strong>, elegí si preferís ver el día, la semana o el mes al entrar a Agenda.</li>
          <li>En <strong>Horario de agenda</strong>, ajustá la hora de inicio y fin según tu jornada (ej. 7:00 a 18:00).</li>
          <li>Los cambios se guardan automáticamente.</li>
        </ol>
        <span class="vc-tuto-tag">⏱ 1 minuto</span>
      </div>
    </div>

    <div class="vc-tuto-item" id="vc-tuto-google">
      <div class="vc-tuto-header">
        <span class="vc-tuto-icon">🔑</span>
        <span class="vc-tuto-htitle">Ingreso con Google</span>
        <span class="vc-tuto-arrow">›</span>
      </div>
      <div class="vc-tuto-body">
        <p>Podés iniciar sesión en PsicoApp usando tu cuenta de Google, sin necesidad de recordar una contraseña.</p>
        <ol>
          <li>Al cerrar sesión, en la pantalla de login presioná <strong>Ingresar con Google</strong>.</li>
          <li>Seleccioná tu cuenta de Google y listo.</li>
          <li>La primera vez, tu cuenta se vincula automáticamente al mismo email.</li>
        </ol>
        <span class="vc-tuto-tag">⏱ 30 segundos</span>
      </div>
    </div>

    <div class="vc-tuto-item" id="vc-tuto-foto">
      <div class="vc-tuto-header">
        <span class="vc-tuto-icon">🖼️</span>
        <span class="vc-tuto-htitle">Cómo cambiar tu foto de perfil</span>
        <span class="vc-tuto-arrow">›</span>
      </div>
      <div class="vc-tuto-body">
        <p>Tu foto aparece en el dashboard y en la barra lateral. Actualizarla es simple:</p>
        <ol>
          <li>Andá a la sección <strong>Perfil</strong> desde el menú inferior.</li>
          <li>Tocá el círculo con tu foto o iniciales para abrir el selector de imagen.</li>
          <li>Elegí una foto de tu galería (se comprime automáticamente).</li>
          <li>La foto se guarda y se actualiza en toda la app.</li>
        </ol>
        <span class="vc-tuto-tag">⏱ 1 minuto</span>
      </div>
    </div>

  </div>

  <div class="vc-section-title">Elegí tu plan</div>

  <div class="vc-planes-grid">

    <div class="vc-plan-card plan-free-card ${plan === 'free' ? 'plan-actual' : ''}">
      <div class="vc-plan-badge-wrap">
        ${plan === 'free' ? '<span class="vc-badge badge-actual">✓ Actual</span>' : '<span class="vc-badge badge-free-tag">Free</span>'}
      </div>
      <div><div class="vc-plan-name">Free</div><div class="vc-plan-price">15 días de prueba</div></div>
      <div class="vc-plan-features">
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>20 msj WhatsApp</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>1 informe IA</div>
        <div class="vc-pf pf-lock"><span class="vc-pf-icon">🔒</span>Pacientes ilimitados</div>
        <div class="vc-pf pf-lock"><span class="vc-pf-icon">🔒</span>Soporte prioritario</div>
      </div>
      <button class="vc-plan-btn btn-plan-actual" disabled>${plan === 'free' ? '✓ Plan actual' : 'Plan básico'}</button>
    </div>

    <div class="vc-plan-card plan-pro-card ${plan === 'pro' ? 'plan-actual' : ''}">
      <div class="vc-plan-badge-wrap">
        <span class="vc-badge badge-recomendado">⭐ Recomendado</span>
        ${plan === 'pro' ? '<span class="vc-badge badge-actual">✓ Actual</span>' : ''}
      </div>
      <div><div class="vc-plan-name">Pro</div><div class="vc-plan-price">$18.000 / mes</div></div>
      <div class="vc-plan-features">
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>100 msj WhatsApp</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>3 informes IA</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>Pacientes ilimitados</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>Extras disponibles</div>
      </div>
      ${plan === 'pro'
        ? '<button class="vc-plan-btn btn-plan-actual" disabled>✓ Plan actual</button>'
        : '<button class="vc-plan-btn btn-upgrade" id="vc-btn-upgrade-pro">🚀 Activar Pro</button>'}
    </div>

    <div class="vc-plan-card plan-max-card ${plan === 'max' ? 'plan-actual' : ''}">
      <div class="vc-plan-badge-wrap">
        <span class="vc-badge badge-max">💎 Max</span>
        ${plan === 'max' ? '<span class="vc-badge badge-actual">✓ Actual</span>' : ''}
      </div>
      <div><div class="vc-plan-name">Max</div><div class="vc-plan-price">$24.000 / mes</div></div>
      <div class="vc-plan-features">
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>250 msj WhatsApp</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>25 informes IA</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>Pacientes ilimitados</div>
        <div class="vc-pf"><span class="vc-pf-icon">✅</span>Soporte prioritario</div>
      </div>
      ${plan === 'max'
        ? '<button class="vc-plan-btn btn-plan-actual" disabled>✓ Plan actual</button>'
        : '<button class="vc-plan-btn btn-upgrade-max" id="vc-btn-upgrade-max">💎 Activar Max</button>'}
    </div>

  </div>

  <div class="vc-logout-wrap">
    <button class="vc-btn-logout" id="vc-btn-logout">🚪 Cerrar sesión</button>
  </div>

  <div class="vc-pad"></div>
</div>
  `;

  /* ── 5. Binds de botones (post-render) ── */
  const q  = id => container.querySelector(id);
  const on = (id, fn) => { const el = q(id); if (el) el.addEventListener('click', fn); };

  on('#vc-btn-upgrade-pro', () => irAPago('pro'));
  on('#vc-btn-upgrade-max', () => irAPago('max'));
  on('#vc-btn-extra-wa',    () => irAPago('extra_whatsapp'));
  on('#vc-btn-logout', async () => {
    window._psicoSigningOut = true;
    try { await sb.auth.signOut(); } catch(e) {}
    window.location.replace('/login.html');
  });

  /* ── Binds preferencias ── */
  let _prefSaveTimer = null;
  const _showPrefsSaved = () => {
    const el = document.getElementById('vc-prefs-saved');
    if (!el) return;
    el.style.display = 'block';
    clearTimeout(_prefSaveTimer);
    _prefSaveTimer = setTimeout(() => { el.style.display = 'none'; }, 2500);
  };

  // Vista de calendario — toggle buttons
  const vistaToggle = document.getElementById('vc-vista-toggle');
  if (vistaToggle) {
    vistaToggle.addEventListener('click', async (e) => {
      const btn = e.target.closest('.vc-vt-btn');
      if (!btn) return;
      vistaToggle.querySelectorAll('.vc-vt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const newPrefs = _vcLoadPrefs();
      newPrefs.cal_vista = btn.dataset.vista;
      await _vcSavePrefs(newPrefs);
      _showPrefsSaved();
    });
  }

  // Horario de agenda
  const selInicio = document.getElementById('vc-hora-inicio');
  const selFin    = document.getElementById('vc-hora-fin');
  if (selInicio && selFin) {
    const onHoraChange = async () => {
      let inicio = parseInt(selInicio.value);
      let fin    = parseInt(selFin.value);
      // Validar: fin debe ser mayor que inicio
      if (fin <= inicio) {
        fin = inicio + 1;
        selFin.value = fin;
      }
      const newPrefs = _vcLoadPrefs();
      newPrefs.agenda_inicio = inicio;
      newPrefs.agenda_fin    = fin;
      await _vcSavePrefs(newPrefs);
      _showPrefsSaved();
    };
    selInicio.addEventListener('change', onHoraChange);
    selFin.addEventListener('change', onHoraChange);
  }

  /* ── Binds integraciones — Google Calendar ── */
  on('#vc-btn-gcal-conn', () => _vcShowGCalModal());
  on('#vc-btn-gcal-desc', async () => {
    if (!confirm('¿Desconectar Google Calendar?')) return;
    await _vcGCalSetConectado(false);
    vcToast('Google Calendar desconectado');
    await renderCuenta();
  });

  /* ── Binds tutoriales — acordeón ── */
  container.querySelectorAll('.vc-tuto-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.vc-tuto-item');
      const isOpen = item.classList.contains('open');
      // Cerrar todos
      container.querySelectorAll('.vc-tuto-item.open').forEach(i => i.classList.remove('open'));
      // Si no estaba abierto, abrir este
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ══ MODAL GOOGLE CALENDAR ══
   La integración real con Google Calendar API requiere un proyecto
   en Google Cloud con Calendar API habilitada y un backend/Edge Function
   para manejar el OAuth 2.0 y almacenar los refresh tokens de forma segura.
   Por ahora mostramos los pasos de configuración pendientes.
══════════════════════════════════════════════════════ */
function _vcShowGCalModal() {
  const old = document.getElementById('vc-gcal-modal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'vc-gcal-modal';
  modal.innerHTML = `
    <div class="vcm-sheet">
      <div class="vcm-title">
        <svg width="24" height="24" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" fill="#4285F4" opacity=".15"/><path d="M3 9h18M8 3v3M16 3v3" stroke="#4285F4" stroke-width="1.5" stroke-linecap="round"/></svg>
        Google Calendar
      </div>
      <div class="vcm-sub">
        La sincronización automática con Google Calendar está en desarrollo.
        Próximamente podrás conectar tu cuenta y tus turnos se agregarán solos.
      </div>

      <div class="vcm-steps">
        <div class="vcm-step">
          <div class="vcm-step-num" style="background:rgba(251,191,36,.15);color:#D97706;">⏳</div>
          <div class="vcm-step-text"><strong>Sincronización automática</strong> — cuando un turno se confirma, se crea el evento en Google Calendar.</div>
        </div>
        <div class="vcm-step">
          <div class="vcm-step-num" style="background:rgba(251,191,36,.15);color:#D97706;">⏳</div>
          <div class="vcm-step-text"><strong>Recordatorios nativos</strong> — Google Calendar enviará recordatorios automáticos al paciente.</div>
        </div>
        <div class="vcm-step">
          <div class="vcm-step-num" style="background:rgba(251,191,36,.15);color:#D97706;">⏳</div>
          <div class="vcm-step-text"><strong>Una sola configuración</strong> — conectás una vez y funciona para siempre.</div>
        </div>
      </div>

      <div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.3);border-radius:10px;padding:12px 14px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;color:#D97706;margin-bottom:4px;">🚧 En desarrollo</div>
        <div style="font-size:12px;color:var(--text-muted);line-height:1.5;">
          Esta función requiere configuración en Google Cloud. Estará disponible en una próxima actualización de PsicoApp.
        </div>
      </div>

      <div class="vcm-actions">
        <button class="vcm-btn-cancel" id="vcm-cancel" style="flex:1">Entendido</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  document.getElementById('vcm-cancel').addEventListener('click', () => modal.remove());
}

/* ══ LISTENER: reacciona a cambios de perfil o plan ══
   - storeUpdated { type: 'perfil' } → perfil cambió
   - storeUpdated { type: 'plan'   } → plan cambió (webhook MP)
   - storeUpdated sin detail         → compatibilidad genérica
   Solo re-renderiza si la vista está visible.
══════════════════════════════════════════════════════ */
window.addEventListener('storeUpdated', (e) => {
  const type = e.detail?.type;
  /* Filtrar: solo tipos relevantes o eventos sin type (genéricos) */
  if (type && type !== 'perfil' && type !== 'plan') return;
  const c = document.getElementById('view-cuenta');
  if (c && c.classList.contains('view-active')) renderCuenta();
});

/* ══ ENTRY POINT ══ */
function initCuenta() {
  const c = document.getElementById('view-cuenta');
  if (!c) return;
  renderCuenta().then(() => {
    _chequearPagoExitoso();
    _chequearGCalExitoso();
  });
}

/* ══ POST-REDIRECT GOOGLE CALENDAR ══ */
async function _chequearGCalExitoso() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('gcal') !== 'ok') return;
  const urlLimpia = window.location.pathname + window.location.hash;
  history.replaceState({}, '', urlLimpia);
  await _vcGCalSetConectado(true);
  vcToast('✅ Google Calendar conectado correctamente');
  renderCuenta();
}

/* ══ POLLING POST-PAGO ══
   Cuando MP redirige de vuelta con ?pago=ok, mostramos
   un toast y hacemos polling hasta que el plan se actualice.
══════════════════════════════════════════════════════ */
async function _chequearPagoExitoso() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('pago') !== 'ok') return;

  // Limpiar el param de la URL sin recargar
  const urlLimpia = window.location.pathname + window.location.hash;
  history.replaceState({}, '', urlLimpia);

  vcToast('✅ ¡Pago recibido! Actualizando tu plan…');

  // Polling: reintentamos hasta 10 veces cada 3 segundos
  let intentos = 0;
  const poll = setInterval(async () => {
    intentos++;
    if (intentos > 10) {
      clearInterval(poll);
      vcToast('⚠️ Si el plan no se actualizó, recargá la página en unos segundos.');
      return;
    }
    try {
      if (typeof PlanService !== 'undefined') {
        PlanService.invalidar();
        const p = await PlanService.getPlan();
        if (p.plan && p.plan !== 'free') {
          clearInterval(poll);
          vcToast(`🎉 ¡Plan ${p.plan.toUpperCase()} activado exitosamente!`);
          await renderCuenta();
        }
      }
    } catch (e) {
      console.warn('[Cuenta] Polling plan error:', e.message);
    }
  }, 3000);
}

window.onViewEnter_cuenta = initCuenta;

/* ══ PAGO VIA MERCADOPAGO ══ */
function irAPago(plan) {
  const btnIds = {
    pro:            '#vc-btn-upgrade-pro',
    max:            '#vc-btn-upgrade-max',
    extra_whatsapp: '#vc-btn-extra-wa',
  };
  const labels = {
    pro:            '🚀 Activar Pro',
    max:            '💎 Activar Max',
    extra_whatsapp: '➕ Comprar 100 mensajes WhatsApp extra ($5.000)',
  };
  const links = {
    pro:            PSICOAPP_CONFIG.LINK_PAGO_PRO,
    max:            PSICOAPP_CONFIG.LINK_PAGO_MAX,
    extra_whatsapp: PSICOAPP_CONFIG.LINK_PAGO_EXTRA,
  };

  const btn  = document.querySelector(btnIds[plan]);
  const link = links[plan];

  if (!link || link.includes('TU_LINK') || link === '') {
    vcToast('❌ Link de pago no configurado. Contactá al administrador.');
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Redirigiendo…'; }
  window.location.href = link;
}
