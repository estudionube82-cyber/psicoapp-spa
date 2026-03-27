/**
 * view-dashboard.js
 * ─────────────────────────────────────────────────────────────
 * Inyecta el HTML del dashboard y registra su lógica propia.
 * NO duplica: Supabase, toggleTheme, auth guard, ni fuentes.
 * ─────────────────────────────────────────────────────────────
 */

/* ── 1. CSS PROPIO DE ESTA VISTA ── */
(function injectDashboardStyles() {
  const style = document.createElement('style');
  style.id = 'view-dashboard-styles';
  style.textContent = `
/* ── HEADER ── */
#view-dashboard .header {
  background: linear-gradient(145deg, #1E1040 0%, #2D1B69 60%, #4C2A9A 100%);
  padding: 20px 20px 28px;
  position: relative; overflow: hidden;
}
#view-dashboard .header::after {
  content: ''; position: absolute;
  right: -40px; top: -40px;
  width: 180px; height: 180px; border-radius: 50%;
  background: rgba(255,255,255,0.05);
}
#view-dashboard .header::before {
  content: ''; position: absolute;
  left: -30px; bottom: -60px;
  width: 160px; height: 160px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
@media (min-width: 768px) {
  #view-dashboard .header { padding: 24px 32px 32px; }
}
.header-row {
  display: flex; align-items: center; justify-content: space-between;
  position: relative; z-index: 1;
}
.logo { font-family: var(--font-display); font-size: 22px; color: white; }
.logo span { color: var(--accent); }
.header-icons { display: flex; gap: 8px; }
.icon-btn {
  width: 36px; height: 36px; border-radius: 11px;
  background: rgba(255,255,255,0.15); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; position: relative;
}
.notif-badge {
  position: absolute; top: -3px; right: -3px;
  width: 16px; height: 16px; background: var(--accent);
  border-radius: 50%; font-size: 9px; font-weight: 800;
  color: white; display: flex; align-items: center; justify-content: center;
}
.greeting { margin-top: 16px; position: relative; z-index: 1; }
.greeting-sub { font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
.greeting-name { font-size: 24px; font-weight: 800; color: white; margin-top: 2px; line-height: 1.1; }
.greeting-date { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 4px; }
.theme-toggle {
  margin-top: 10px; background: rgba(255,255,255,0.12);
  border: none; border-radius: 20px; padding: 4px 12px;
  cursor: pointer; font-size: 16px;
}
.toggle-thumb { display: inline-block; }

/* ── QUICK STATS ── */
.quick-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  padding: 16px 16px 0; margin-top: -20px; position: relative; z-index: 5;
}
@media (min-width: 768px) {
  .quick-stats { grid-template-columns: repeat(4, 1fr) !important; padding: 20px 24px !important; }
}
.stat-card {
  background: var(--surface); border-radius: var(--radius);
  padding: 14px 16px; box-shadow: var(--shadow-md);
  cursor: pointer; transition: transform 0.15s;
}
.stat-card:hover { transform: translateY(-2px); }
.stat-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.stat-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; }
.si-green { background: var(--primary-light); }
.si-orange { background: var(--accent-light); }
.si-red { background: var(--danger-light); }
.si-blue { background: #E3F2FD; }
.stat-trend { font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 20px; }
.trend-up { background: var(--primary-light); color: var(--primary); }
.trend-down { background: var(--danger-light); color: var(--danger); }
.trend-neutral { background: var(--bg); color: var(--text-muted); }
.stat-num { font-size: 26px; font-weight: 800; line-height: 1; color: var(--text); }
.stat-label { font-size: 11px; color: var(--text-muted); font-weight: 600; margin-top: 3px; }

/* ── SECTION ── */
.section { padding: 16px 16px 0; }
.section-title {
  font-size: 13px; font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;
  display: flex; align-items: center; justify-content: space-between;
}
.section-link { font-size: 12px; font-weight: 600; color: var(--primary); cursor: pointer; text-transform: none; letter-spacing: 0; }

/* ── TURNOS ── */
.turnos-list { display: flex; flex-direction: column; gap: 8px; }
.turno-card {
  background: var(--surface); border-radius: var(--radius-sm);
  padding: 12px 14px; display: flex; align-items: center; gap: 12px;
  box-shadow: var(--shadow-sm); border-left: 3px solid transparent;
  cursor: pointer; transition: transform .12s;
}
.turno-card:hover { transform: translateX(2px); }
.tc-pac { border-left-color: var(--primary-mid); }
.tc-past { opacity: 0.6; }
.tc-now { border-left-color: var(--accent2); box-shadow: 0 0 0 2px rgba(52,211,153,0.2); }
.turno-time { font-size: 15px; font-weight: 800; color: var(--text); min-width: 40px; }
.turno-time.now { color: var(--accent2); }
.turno-info { flex: 1; }
.turno-name { font-size: 14px; font-weight: 700; color: var(--text); }
.turno-meta { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
.turno-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
.tb-done { background: var(--surface2); color: var(--text-muted); }
.tb-ok { background: rgba(52,211,153,0.15); color: #059669; }
.tb-wait { background: var(--primary-light); color: var(--primary); }
.now-indicator { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
.now-dot-h { width: 10px; height: 10px; border-radius: 50%; background: var(--accent2); flex-shrink: 0; }
.now-label { font-size: 10px; font-weight: 800; color: var(--accent2); letter-spacing: .5px; white-space: nowrap; }
.now-line-h { flex: 1; height: 1px; background: var(--accent2); opacity: 0.4; }

/* ── INGRESOS ── */
.income-card { background: var(--surface); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow-sm); }
.income-main { margin-bottom: 10px; }
.income-amount { font-size: 28px; font-weight: 800; color: var(--text); }
.income-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.income-bar-container { height: 6px; background: var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
.income-bar { height: 100%; width: 75%; background: linear-gradient(90deg, var(--v1), var(--v3)); border-radius: 10px; }
.income-rows { display: flex; flex-direction: column; gap: 10px; }
.income-row { display: flex; align-items: center; justify-content: space-between; }
.income-row-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
.income-dot { width: 8px; height: 8px; border-radius: 50%; }
.income-val { font-size: 14px; font-weight: 700; color: var(--text); text-align: right; }
.income-meta { font-size: 11px; color: var(--text-muted); text-align: right; }

/* ── WHATSAPP ── */
.wp-pending-list { display: flex; flex-direction: column; gap: 8px; }
.wp-pending-item {
  background: var(--surface); border-radius: var(--radius-sm);
  padding: 11px 13px; display: flex; align-items: center; gap: 10px;
  border-left: 3px solid var(--accent2); box-shadow: var(--shadow-sm);
}
.wp-pi-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.wp-pi-info { flex: 1; }
.wp-pi-name { font-size: 13px; font-weight: 700; color: var(--text); }
.wp-pi-meta { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
.wp-pi-time { font-size: 11px; color: var(--text-muted); font-weight: 600; white-space: nowrap; }

/* ── ACCESOS RÁPIDOS ── */
.quick-access { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.qa-item {
  background: var(--surface); border-radius: var(--radius-sm);
  padding: 14px 8px; display: flex; flex-direction: column;
  align-items: center; gap: 6px; box-shadow: var(--shadow-sm);
  cursor: pointer; transition: transform .12s;
}
.qa-item:hover { transform: translateY(-2px); }
.qa-icon { font-size: 22px; }
.qa-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-align: center; }
  `;
  document.head.appendChild(style);
})();


/* ── 2. HTML DE LA VISTA ── */
(function injectDashboardHTML() {
  const view = document.getElementById('view-dashboard');
  if (!view) return;

  view.innerHTML = `
<div class="header">
  <div class="header-row">
    <div class="logo">Psico<span>App</span></div>
    <div class="header-icons">
      <button class="icon-btn">💬<div class="notif-badge">3</div></button>
      <button class="icon-btn">🔔<div class="notif-badge">5</div></button>
    </div>
  </div>
  <div class="greeting">
    <div class="greeting-sub">Buenos días</div>
    <div class="greeting-name" id="dash-user-name">Cargando…</div>
    <div class="greeting-date" id="dash-fecha"></div>
    <button class="theme-toggle" onclick="toggleTheme()" title="Cambiar tema">
      <div class="toggle-thumb" id="toggle-thumb">☀️</div>
    </button>
  </div>
</div>

<!-- QUICK STATS -->
<div class="quick-stats">
  <div class="stat-card" onclick="navigate('agenda')">
    <div class="stat-card-top">
      <div class="stat-icon si-green">📅</div>
      <div class="stat-trend trend-up">4 confirmados</div>
    </div>
    <div class="stat-num">6</div>
    <div class="stat-label">Turnos hoy</div>
  </div>
  <div class="stat-card" onclick="navigate('pacientes')">
    <div class="stat-card-top">
      <div class="stat-icon si-blue">👥</div>
      <div class="stat-trend trend-neutral">En curso</div>
    </div>
    <div class="stat-num" style="color:#1976D2">20</div>
    <div class="stat-label">Pacientes activos</div>
  </div>
  <div class="stat-card">
    <div class="stat-card-top">
      <div class="stat-icon" style="background:var(--primary-light)">🌱</div>
      <div class="stat-trend trend-up">Este mes</div>
    </div>
    <div class="stat-num" style="color:#388E3C">2</div>
    <div class="stat-label">Pacientes nuevos</div>
  </div>
  <div class="stat-card" onclick="navigate('pagos')">
    <div class="stat-card-top">
      <div class="stat-icon si-orange">💰</div>
      <div class="stat-trend trend-up">↑ 12%</div>
    </div>
    <div class="stat-num" style="font-size:18px">$900k</div>
    <div class="stat-label">Facturado Feb</div>
  </div>
</div>

<!-- TURNOS DE HOY -->
<div class="section" style="margin-top:16px">
  <div class="section-title">
    Turnos de hoy
    <span class="section-link" onclick="navigate('agenda')">Ver agenda →</span>
  </div>
  <div class="turnos-list">
    <div class="turno-card tc-pac tc-past">
      <div class="turno-time">9:00</div>
      <div class="turno-info">
        <div class="turno-name">María González</div>
        <div class="turno-meta">Sesión individual · 50 min</div>
      </div>
      <div class="turno-badge tb-done">Realizada</div>
    </div>
    <div class="turno-card tc-pac tc-past">
      <div class="turno-time">10:00</div>
      <div class="turno-info">
        <div class="turno-name">Carlos Fernández</div>
        <div class="turno-meta">Sesión individual · 50 min</div>
      </div>
      <div class="turno-badge tb-done">Realizada</div>
    </div>
    <div class="now-indicator">
      <div class="now-dot-h"></div>
      <div class="now-label" id="dash-now-label">AHORA</div>
      <div class="now-line-h"></div>
    </div>
    <div class="turno-card tc-pac tc-now">
      <div class="turno-time now">15:00</div>
      <div class="turno-info">
        <div class="turno-name">Ana Rodríguez</div>
        <div class="turno-meta">Sesión individual · 50 min</div>
      </div>
      <div class="turno-badge tb-ok">✓ Confirmó</div>
    </div>
    <div class="turno-card tc-pac">
      <div class="turno-time">18:00</div>
      <div class="turno-info">
        <div class="turno-name">Diego Martínez</div>
        <div class="turno-meta">Sesión individual · 50 min</div>
      </div>
      <div class="turno-badge tb-ok">✓ Confirmó</div>
    </div>
    <div class="turno-card tc-pac">
      <div class="turno-time">19:00</div>
      <div class="turno-info">
        <div class="turno-name">Laura Pérez</div>
        <div class="turno-meta">Sesión individual · 50 min</div>
      </div>
      <div class="turno-badge tb-wait">⏳ Sin confirmar</div>
    </div>
  </div>
</div>

<!-- INGRESOS DEL MES -->
<div class="section" style="margin-top:16px">
  <div class="section-title">
    Ingresos — Febrero
    <span class="section-link" onclick="navigate('pagos')">Ver detalle →</span>
  </div>
  <div class="income-card">
    <div class="income-main">
      <div class="income-amount">$900.000</div>
      <div class="income-sub">de $1.200.000 esperados</div>
    </div>
    <div class="income-bar-container"><div class="income-bar"></div></div>
    <div class="income-rows">
      <div class="income-row">
        <div class="income-row-label">
          <div class="income-dot" style="background:var(--primary)"></div>
          Sesiones particulares
        </div>
        <div>
          <div class="income-val">$720.000</div>
          <div class="income-meta">16 sesiones cobradas</div>
        </div>
      </div>
      <div class="income-row">
        <div class="income-row-label">
          <div class="income-dot" style="background:#7B5EA7"></div>
          Obras sociales
        </div>
        <div>
          <div class="income-val">$180.000</div>
          <div class="income-meta">⏳ Pendiente presentación</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- WHATSAPP PENDIENTES -->
<div class="section" style="margin-top:16px">
  <div class="section-title">
    WhatsApp
    <span class="section-link" onclick="navigate('whatsapp')">Ver historial →</span>
  </div>
  <div class="wp-pending-list">
    <div class="wp-pending-item">
      <div class="wp-pi-avatar">👤</div>
      <div class="wp-pi-info">
        <div class="wp-pi-name">Recordatorio enviado — Ana Rodríguez</div>
        <div class="wp-pi-meta">Turno hoy 15:00 · Entregado y leído ✓✓</div>
      </div>
      <div class="wp-pi-time">08:00</div>
    </div>
    <div class="wp-pending-item">
      <div class="wp-pi-avatar">👤</div>
      <div class="wp-pi-info">
        <div class="wp-pi-name">Recordatorio enviado — Diego Martínez</div>
        <div class="wp-pi-meta">Turno hoy 18:00 · Entregado ✓</div>
      </div>
      <div class="wp-pi-time">08:00</div>
    </div>
    <div class="wp-pending-item" style="border-left-color:var(--danger);background:var(--danger-light)">
      <div class="wp-pi-avatar" style="background:#FFCDD2">⚠️</div>
      <div class="wp-pi-info">
        <div class="wp-pi-name" style="color:var(--danger)">Error — Laura Pérez</div>
        <div class="wp-pi-meta">Número inválido · Actualizá el teléfono</div>
      </div>
      <div class="wp-pi-time" style="color:var(--danger)">Error</div>
    </div>
  </div>
</div>

<!-- ACCESOS RÁPIDOS -->
<div class="section" style="margin-top:16px; margin-bottom:24px">
  <div class="section-title">Acceso rápido</div>
  <div class="quick-access">
    <div class="qa-item" onclick="navigate('agenda')"><div class="qa-icon">➕</div><div class="qa-label">Nuevo turno</div></div>
    <div class="qa-item" onclick="navigate('pacientes')"><div class="qa-icon">👤</div><div class="qa-label">Nuevo paciente</div></div>
    <div class="qa-item" onclick="navigate('pagos')"><div class="qa-icon">💰</div><div class="qa-label">Registrar pago</div></div>
    <div class="qa-item" onclick="navigate('whatsapp')"><div class="qa-icon">💬</div><div class="qa-label">WhatsApp</div></div>
  </div>
</div>
  `;
})();


/* ── 3. LÓGICA PROPIA DE ESTA VISTA ── */

/** Muestra fecha y hora actuales en el header */
function dashUpdateFecha() {
  const el = document.getElementById('dash-fecha');
  const nl = document.getElementById('dash-now-label');
  if (!el) return;
  const now = new Date();
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  el.textContent = `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]} · ${hora}`;
  if (nl) nl.textContent = `AHORA · ${hora}`;

  // Actualizar toggle tema
  const th = document.getElementById('toggle-thumb');
  const tema = document.documentElement.getAttribute('data-theme');
  if (th) th.textContent = tema === 'dark' ? '🌙' : '☀️';
}

/** Carga nombre del usuario desde Supabase */
async function dashLoadUser() {
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data: profile } = await sb
      .from('profiles')
      .select('titulo, nombre_completo, foto_url')
      .eq('id', user.id)
      .single();

    if (profile) {
      const nombre = profile.nombre_completo || user.email;
      const titulo = profile.titulo ? profile.titulo + ' ' : '';
      const fullName = titulo + nombre;

      // Header de la vista
      const el = document.getElementById('dash-user-name');
      if (el) el.textContent = fullName;

      // Sidebar
      const sbName = document.getElementById('sb-user-name');
      if (sbName) sbName.textContent = fullName;

      // Avatar con iniciales
      const sbAvatar = document.getElementById('sb-avatar-initials');
      if (sbAvatar) {
        const parts = nombre.split(' ');
        sbAvatar.textContent = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
      }
    }
  } catch (e) {
    console.warn('dashLoadUser:', e.message);
  }
}

/** Hook llamado por navigate() cada vez que se entra a esta vista */
window.onViewEnter_dashboard = function() {
  dashUpdateFecha();
};

/* ── INIT al cargar por primera vez ── */
dashUpdateFecha();
dashLoadUser();
