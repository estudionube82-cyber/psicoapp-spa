/**
 * view-informes.js — PsicoApp SPA (refactorizado)
 * Registrado en PsicoRouter con ciclo de vida: init / onEnter / onLeave
 * Generador de informes clínicos con IA (Claude via Supabase Edge Function)
 */


/* ══════════════════════════════════════════
   ESTILOS — inyectados una sola vez
   ══════════════════════════════════════════ */
(function injectInformesStyles() {
  if (document.getElementById('view-informes-styles')) return;
  const s = document.createElement('style');
  s.id = 'view-informes-styles';
  s.textContent = `
#view-informes { min-height: 100vh; background: var(--bg); }
#view-informes .inf-header { background: linear-gradient(145deg,#1E1040 0%,#4C2A9A 55%,#6B21A8 100%); padding: 20px 20px 28px; position: relative; overflow: hidden; }
#view-informes .inf-header::after { content:''; position:absolute; right:-40px; top:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.05); }
#view-informes .inf-header-row { display:flex; align-items:flex-start; justify-content:space-between; position:relative; z-index:1; }
#view-informes .inf-title { font-family:var(--font-display); font-size:22px; font-weight:700; color:white; }
#view-informes .inf-title span { color:#C4B5FD; }
#view-informes .inf-subtitle { font-size:13px; color:rgba(255,255,255,0.6); margin-top:4px; }
#view-informes .inf-badge-plan { font-size:11px; font-weight:700; padding:5px 11px; border-radius:20px; background:rgba(255,255,255,0.15); color:white; flex-shrink:0; margin-top:2px; }
#view-informes .inf-body { padding: 16px 16px 80px; display:flex; flex-direction:column; gap:14px; max-width:680px; margin:0 auto; }
#view-informes .inf-card { background:var(--surface); border-radius:var(--radius); box-shadow:var(--shadow-sm); overflow:hidden; }
#view-informes .inf-card-title { font-size:13px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; padding:14px 16px 10px; border-bottom:1px solid var(--border); }

/* Selector de paciente */
#view-informes .inf-pac-list { padding:8px; display:flex; flex-direction:column; gap:4px; max-height:260px; overflow-y:auto; }
#view-informes .inf-pac-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:background .12s; }
#view-informes .inf-pac-item:hover, #view-informes .inf-pac-item.inf-pac-active { background:var(--primary-light); }
#view-informes .inf-pac-avatar { width:36px; height:36px; border-radius:10px; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; flex-shrink:0; }
#view-informes .inf-pac-name { font-size:14px; font-weight:700; color:var(--text); }
#view-informes .inf-pac-tel { font-size:11px; color:var(--text-muted); }
#view-informes .inf-search { width:100%; border:none; border-bottom:1px solid var(--border); padding:12px 16px; font-size:14px; font-family:var(--font); background:var(--surface); color:var(--text); outline:none; }

/* Chip paciente seleccionado */
#view-informes .inf-pac-chip { display:none; align-items:center; gap:10px; padding:12px 16px; cursor:pointer; }
#view-informes .inf-chip-avatar { width:36px; height:36px; border-radius:10px; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; flex-shrink:0; }
#view-informes .inf-chip-nombre { font-size:14px; font-weight:700; color:var(--text); flex:1; }
#view-informes .inf-chip-cambiar { font-size:12px; color:var(--primary); font-weight:700; }

/* Tipo de informe */
#view-informes .inf-tipos { display:flex; gap:8px; padding:12px 16px; overflow-x:auto; }
#view-informes .inf-tipo-btn { flex-shrink:0; padding:8px 16px; border-radius:20px; border:1.5px solid var(--border); background:var(--bg); color:var(--text-muted); font-size:13px; font-weight:700; cursor:pointer; font-family:var(--font); transition:all .15s; }
#view-informes .inf-tipo-btn.inf-tipo-sel { background:var(--primary); color:white; border-color:var(--primary); }

/* Límite de uso */
#view-informes .inf-limite-bar { margin:0 16px 12px; }
#view-informes .inf-limite-track { height:5px; border-radius:99px; background:var(--border); overflow:hidden; margin-top:4px; }
#view-informes .inf-limite-fill { height:100%; border-radius:99px; background:var(--primary); transition:width .4s; }
#view-informes .inf-limite-text { font-size:11px; color:var(--text-muted); }

/* Botón generar */
#view-informes .inf-btn-generar { width:calc(100% - 32px); margin:0 16px 16px; background:linear-gradient(135deg,#5B2FA8,#7C3AED); color:white; border:none; border-radius:14px; padding:16px; font-size:15px; font-weight:800; font-family:var(--font); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:transform .12s; }
#view-informes .inf-btn-generar:hover { transform:translateY(-1px); }
#view-informes .inf-btn-generar:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* Loading */
#view-informes .inf-loading { display:none; flex-direction:column; align-items:center; gap:12px; padding:32px; }
#view-informes .inf-spinner { width:32px; height:32px; border:3px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation:infSpin .8s linear infinite; }
@keyframes infSpin { to { transform:rotate(360deg); } }
#view-informes .inf-loading-text { font-size:13px; color:var(--text-muted); font-weight:600; }

/* Output */
#view-informes .inf-output-wrap { display:none; }
#view-informes .inf-output { font-size:13.5px; line-height:1.8; color:var(--text); padding:16px; font-family:var(--font); }
#view-informes .inf-output .inf-seccion { font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin:20px 0 6px; }
#view-informes .inf-output .inf-seccion:first-child { margin-top:0; }
#view-informes .inf-output .inf-parrafo { margin-bottom:10px; }
#view-informes .inf-output strong { font-weight:700; color:var(--text); }
#view-informes .inf-alerta-riesgo { display:none; margin:0 16px 8px; padding:12px 14px; background:rgba(229,62,62,.08); border:1.5px solid rgba(229,62,62,.25); border-radius:12px; font-size:13px; color:var(--danger); }
#view-informes .inf-output-actions { display:flex; gap:8px; padding:0 16px 16px; }
#view-informes .inf-action-btn { flex:1; padding:12px; border-radius:12px; border:1.5px solid var(--border); background:var(--bg); color:var(--text); font-family:var(--font); font-size:13px; font-weight:700; cursor:pointer; transition:background .12s; }
#view-informes .inf-action-btn:hover { background:var(--surface2); }
#view-informes .inf-action-primary { background:var(--primary-light); color:var(--primary); border-color:transparent; }

/* Informes guardados */
#view-informes .inf-guardado-item { padding:12px 16px; border-bottom:1px solid var(--border); cursor:pointer; transition:background .12s; }
#view-informes .inf-guardado-item:hover { background:var(--surface2); }
#view-informes .inf-guardado-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
#view-informes .inf-guardado-tipo { font-size:12px; font-weight:800; color:var(--primary); }
#view-informes .inf-guardado-fecha { font-size:11px; color:var(--text-muted); }
#view-informes .inf-guardado-preview { font-size:12px; color:var(--text-muted); line-height:1.5; }

/* Extra IA */
#view-informes .inf-extra-btns { display:flex; flex-direction:column; gap:8px; padding:0 16px 12px; }
#view-informes .inf-extra-btn { padding:12px 16px; border-radius:12px; border:1.5px solid var(--border); background:var(--bg); color:var(--text); font-family:var(--font); font-size:13px; font-weight:700; cursor:pointer; text-align:left; transition:background .12s; }
#view-informes .inf-extra-btn:hover { background:var(--surface2); }
#view-informes .inf-extra-btn:disabled { opacity:.4; cursor:not-allowed; }
#view-informes .inf-extra-output { display:none; border-top:1px solid var(--border); }
#view-informes .inf-extra-result { white-space:pre-wrap; font-size:13px; line-height:1.7; color:var(--text); padding:16px; }

/* Toast */
#view-informes #inf-toast { position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:#1A1040; color:white; padding:11px 22px; border-radius:12px; font-size:13px; font-weight:600; z-index:9999; display:none; white-space:nowrap; }
  `;
  document.head.appendChild(s);
})();


/* ══════════════════════════════════════════
   ESTADO INTERNO
   ══════════════════════════════════════════ */
const _inf = {
  pacientes:      [],
  pacActual:      null,
  tipo:           'clinico',
  infoClinica:    null,
  sesiones:       [],
  perfil:         null,
  sessionToken:   null,
};


/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
function _infToast(msg) {
  const t = document.getElementById('inf-toast');
  if (!t) return;
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(t._to);
  t._to = setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function _infFmtFecha(f) {
  if (!f) return '';
  return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' });
}


/* ══════════════════════════════════════════
   RENDER HTML (init — una sola vez)
   ══════════════════════════════════════════ */
function _infRenderHTML(container) {
  container.innerHTML = `
<div class="inf-header">
  <div class="inf-header-row">
    <div>
      <div class="inf-title">Informes <span>IA</span></div>
      <div class="inf-subtitle">Generá informes clínicos en segundos</div>
    </div>
    <div class="inf-badge-plan" id="inf-badge-plan">free · 0/1</div>
  </div>
</div>

<div class="inf-body">

  <!-- SELECTOR PACIENTE -->
  <div class="inf-card" id="inf-pac-selector">
    <div class="inf-card-title">👤 Seleccioná un paciente</div>
    <input class="inf-search" id="inf-pac-buscar" placeholder="🔍 Buscar paciente…">
    <div class="inf-pac-list" id="inf-pac-list">
      <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">⏳ Cargando…</div>
    </div>
  </div>

  <!-- CHIP PACIENTE SELECCIONADO -->
  <div class="inf-card" id="inf-pac-chip" style="display:none">
    <div class="inf-pac-chip" id="inf-pac-chip-btn">
      <div class="inf-chip-avatar" id="inf-chip-avatar"></div>
      <div class="inf-chip-nombre" id="inf-chip-nombre"></div>
      <div class="inf-chip-cambiar">Cambiar →</div>
    </div>
  </div>

  <!-- GENERADOR (visible solo con paciente seleccionado) -->
  <div id="inf-generador" style="display:none; display:flex; flex-direction:column; gap:14px;">

    <!-- TIPO -->
    <div class="inf-card">
      <div class="inf-card-title">📄 Tipo de informe</div>
      <div class="inf-tipos">
        <button class="inf-tipo-btn inf-tipo-sel" id="inf-tipo-clinico">🏥 Clínico</button>
        <button class="inf-tipo-btn"              id="inf-tipo-juzgado">⚖️ Juzgado</button>
        <button class="inf-tipo-btn"              id="inf-tipo-obrasocial">📋 Obra Social</button>
      </div>
    </div>

    <!-- GENERAR -->
    <div class="inf-card">
      <div class="inf-card-title">🤖 Generar con IA</div>
      <div class="inf-limite-bar">
        <div class="inf-limite-text" id="inf-limite-text">Cargando…</div>
        <div class="inf-limite-track"><div class="inf-limite-fill" id="inf-limite-fill" style="width:0%"></div></div>
      </div>
      <button class="inf-btn-generar" id="inf-btn-generar">🤖 Generar informe</button>

      <!-- Loading -->
      <div class="inf-loading" id="inf-loading">
        <div class="inf-spinner"></div>
        <div class="inf-loading-text" id="inf-loading-text">Generando informe…</div>
      </div>

      <!-- Output -->
      <div class="inf-output-wrap" id="inf-output-wrap">
        <div class="inf-alerta-riesgo" id="inf-alerta-riesgo">⚠️ Se detectaron indicadores de riesgo clínico. Revisá el informe con atención.</div>
        <div class="inf-output" id="inf-output"></div>
        <div class="inf-output-actions">
          <button class="inf-action-btn" id="inf-btn-copiar">📋 Copiar</button>
          <button class="inf-action-btn" id="inf-btn-pdf">📄 PDF</button>
          <button class="inf-action-btn inf-action-primary" id="inf-btn-guardar">💾 Guardar</button>
        </div>
      </div>
    </div>

    <!-- HISTORIAL -->
    <div class="inf-card">
      <div class="inf-card-title">📁 Historial del paciente</div>
      <div id="inf-guardados-list">
        <div style="font-size:12px;color:var(--text-muted);text-align:center;padding:12px">Sin informes guardados</div>
      </div>
    </div>

    <!-- EXTRA IA -->
    <div class="inf-card">
      <div class="inf-card-title">🧠 Más funciones IA</div>
      <div class="inf-extra-btns">
        <button class="inf-extra-btn" id="inf-btn-evolucion">📈 Ver evolución del paciente</button>
        <button class="inf-extra-btn" id="inf-btn-diag">🔍 Sugerir diagnóstico CIE-11</button>
        <button class="inf-extra-btn" id="inf-btn-plan">📋 Sugerir plan terapéutico</button>
      </div>
      <div class="inf-extra-output" id="inf-extra-output">
        <div class="inf-loading" id="inf-extra-loading">
          <div class="inf-spinner"></div>
          <div class="inf-loading-text" id="inf-extra-loading-text">Analizando…</div>
        </div>
        <div class="inf-extra-result" id="inf-extra-result"></div>
        <div class="inf-output-actions" style="padding:8px 16px 16px">
          <button class="inf-action-btn" id="inf-btn-copiar-extra">📋 Copiar</button>
          <button class="inf-action-btn inf-action-primary" id="inf-btn-guardar-extra">💾 Guardar</button>
        </div>
      </div>
    </div>

  </div><!-- /#inf-generador -->

</div><!-- /.inf-body -->
<div id="inf-toast"></div>
  `;

  /* ── Bind de eventos (reemplaza todos los onclick/oninput inline) ── */

  // Input de búsqueda
  document.getElementById('inf-pac-buscar')
    .addEventListener('input', infFiltrarPacientes);

  // Chip "Cambiar paciente"
  document.getElementById('inf-pac-chip-btn')
    .addEventListener('click', infCambiarPaciente);

  // Botones de tipo de informe
  document.getElementById('inf-tipo-clinico')
    .addEventListener('click', () => infSelTipo('clinico'));
  document.getElementById('inf-tipo-juzgado')
    .addEventListener('click', () => infSelTipo('juzgado'));
  document.getElementById('inf-tipo-obrasocial')
    .addEventListener('click', () => infSelTipo('obrasocial'));

  // Botón generar
  document.getElementById('inf-btn-generar')
    .addEventListener('click', infGenerar);

  // Botones de output
  document.getElementById('inf-btn-copiar')
    .addEventListener('click', infCopiar);
  document.getElementById('inf-btn-guardar')
    .addEventListener('click', infGuardar);
  document.getElementById('inf-btn-pdf')
    .addEventListener('click', infExportarPDF);

  // Botones extra IA
  document.getElementById('inf-btn-evolucion')
    .addEventListener('click', infVerEvolucion);
  document.getElementById('inf-btn-diag')
    .addEventListener('click', infSugerirDiag);
  document.getElementById('inf-btn-plan')
    .addEventListener('click', infSugerirPlan);

  // Botones extra
  document.getElementById('inf-btn-copiar-extra')
    .addEventListener('click', infCopiarExtra);
  document.getElementById('inf-btn-guardar-extra')
    .addEventListener('click', infGuardarExtra);
}


/* ══════════════════════════════════════════
   CARGA DE DATOS
   ══════════════════════════════════════════ */
async function _infCargarPacientes() {
  _inf.pacientes = await PsicoRouter.store.ensurePacientes();
  _infRenderListaPacientes(_inf.pacientes);
}

function _infRenderListaPacientes(lista) {
  const cont = document.getElementById('inf-pac-list');
  if (!cont) return;
  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Sin pacientes registrados</div>';
    return;
  }
  cont.innerHTML = lista.map(p => {
    const nombre = `${p.nombre || ''} ${p.apellido || ''}`.trim();
    const activo = _inf.pacActual?.id === p.id ? 'inf-pac-active' : '';
    return `<div class="inf-pac-item ${activo}" data-pac-id="${escAttr(String(p.id))}">
      <div class="inf-pac-avatar">${escHtml(nombre.slice(0,2).toUpperCase())}</div>
      <div>
        <div class="inf-pac-name">${escHtml(nombre)}</div>
        ${p.telefono ? `<div class="inf-pac-tel">${escHtml(p.telefono)}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  // Bind clicks via addEventListener — evita onclick con id dinámico
  cont.querySelectorAll('.inf-pac-item').forEach(el => {
    const id = el.dataset.pacId;
    el.addEventListener('click', () => infSeleccionarPaciente(id));
  });
}

window.infFiltrarPacientes = function() {
  const q = document.getElementById('inf-pac-buscar')?.value.toLowerCase() || '';
  _infRenderListaPacientes(_inf.pacientes.filter(p => `${p.nombre} ${p.apellido}`.toLowerCase().includes(q)));
};

window.infSeleccionarPaciente = async function(id) {
  _inf.pacActual = _inf.pacientes.find(p => p.id === id);
  if (!_inf.pacActual) return;

  const nombre = `${_inf.pacActual.nombre || ''} ${_inf.pacActual.apellido || ''}`.trim();
  document.getElementById('inf-pac-selector').style.display = 'none';
  document.getElementById('inf-chip-avatar').textContent = nombre.slice(0,2).toUpperCase();
  document.getElementById('inf-chip-nombre').textContent = nombre;
  document.getElementById('inf-pac-chip').style.display = 'block';
  document.getElementById('inf-generador').style.display = 'flex';
  document.getElementById('inf-output-wrap').style.display = 'none';
  document.getElementById('inf-extra-output').style.display = 'none';

  await Promise.all([
    _infCargarInfoClinica(),
    _infCargarSesiones(),
    _infCargarInformesGuardados(),
  ]);
  await _infActualizarBadge();
};

window.infCambiarPaciente = function() {
  _inf.pacActual = null;
  document.getElementById('inf-pac-selector').style.display = 'block';
  document.getElementById('inf-pac-chip').style.display = 'none';
  document.getElementById('inf-generador').style.display = 'none';
  const inp = document.getElementById('inf-pac-buscar');
  if (inp) inp.value = '';
  _infRenderListaPacientes(_inf.pacientes);
};

async function _infCargarInfoClinica() {
  if (!_inf.pacActual) return;
  try {
    const { data } = await sb.from('historia_clinica').select('*').eq('paciente_id', _inf.pacActual.id).eq('user_id', PsicoRouter.store.userId).maybeSingle();
    _inf.infoClinica = data || null;
  } catch { _inf.infoClinica = null; }
}

async function _infCargarSesiones() {
  if (!_inf.pacActual) return;
  try {
    const { data } = await sb.from('sesiones')
      .select('id,fecha,tipo,estado,motivo,notas,estado_animo,diagnosticos,numero')
      .eq('paciente_id', _inf.pacActual.id)
      .eq('user_id', PsicoRouter.store.userId)
      .order('fecha', { ascending: true });
    _inf.sesiones = data || [];
  } catch { _inf.sesiones = []; }
}

async function _infCargarInformesGuardados() {
  if (!_inf.pacActual) return;
  const cont = document.getElementById('inf-guardados-list');
  if (!cont) return;
  try {
    const uid = PsicoRouter.store.userId;
    const { data } = await sb.from('informes_clinicos')
      .select('*').eq('paciente_id', _inf.pacActual.id).eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (!data?.length) {
      cont.innerHTML = '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:12px">Sin informes guardados aún</div>';
      return;
    }
    const tipoLabel = { clinico:'🏥 Clínico', juzgado:'⚖️ Juzgado', obrasocial:'📋 Obra Social' };
    cont.innerHTML = data.map(inf => `
      <div class="inf-guardado-item" data-inf-id="${escAttr(String(inf.id))}">
        <div class="inf-guardado-top">
          <span class="inf-guardado-tipo">${tipoLabel[inf.tipo] || escHtml(inf.tipo)}</span>
          <span class="inf-guardado-fecha">${new Date(inf.created_at).toLocaleDateString('es-AR')}</span>
        </div>
        <div class="inf-guardado-preview">${escHtml(inf.texto.slice(0,120))}…</div>
      </div>`).join('');
    // Bind clicks via addEventListener — evita JSON en onclick
    cont.querySelectorAll('.inf-guardado-item').forEach(el => {
      const id  = el.dataset.infId;
      const inf = data.find(x => String(x.id) === id);
      if (inf) el.addEventListener('click', () => infVerGuardado(inf));
    });
  } catch {
    cont.innerHTML = '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:12px">Error al cargar historial</div>';
  }
}

window.infVerGuardado = function(inf) {
  document.getElementById('inf-output').innerHTML = _infRenderTexto(inf.texto);
  document.getElementById('inf-output-wrap').style.display = 'block';
  document.getElementById('inf-loading').style.display = 'none';
  document.getElementById('inf-alerta-riesgo').style.display = 'none';
  document.getElementById('inf-output-wrap').scrollIntoView({ behavior: 'smooth' });
};


/* ══════════════════════════════════════════
   RENDERIZADO DE TEXTO → HTML LIMPIO
   Convierte el texto plano de la IA en HTML
   sin mostrar asteriscos ni almohadillas.
   ══════════════════════════════════════════ */
function _infRenderTexto(texto) {
  if (!texto) return ''

  const lines = texto.split('\n')
  let html = ''

  for (let line of lines) {
    // Quitar markdown residual: ###, ##, #, **, *
    line = line
      .replace(/^#{1,4}\s*/,  '')   // títulos markdown → texto plano
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **negrita** → <strong>
      .replace(/\*(.*?)\*/g,   '$1')  // *cursiva* → texto plano
      .trim()

    if (!line) {
      // Línea vacía → separador entre párrafos
      continue
    }

    // Detectar si es un título de sección (todo mayúsculas o termina en ":")
    const esTitulo = /^[A-ZÁÉÍÓÚÑ\s\d]{4,}[:\.]?$/.test(line)
                  || /^[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ\s\d]{2,}:$/.test(line)

    if (esTitulo) {
      html += `<div class="inf-seccion">${line}</div>`
    } else {
      html += `<div class="inf-parrafo">${line}</div>`
    }
  }

  return html
}

/* ══════════════════════════════════════════
   TIPO DE INFORME
   ══════════════════════════════════════════ */
window.infSelTipo = function(tipo) {
  _inf.tipo = tipo;
  ['clinico','juzgado','obrasocial'].forEach(t =>
    document.getElementById('inf-tipo-' + t)?.classList.toggle('inf-tipo-sel', t === tipo)
  );
};


/* ══════════════════════════════════════════
   BADGE DE USOS
   ══════════════════════════════════════════ */
async function _infGetPlanData() {
  const { data, error } = await sb.from('users_plan')
    .select('plan, ia_used, ia_limit')
    .eq('user_id', PsicoRouter.store.userId)
    .maybeSingle();
  if (error || !data) return { plan: 'free', ia_used: 0, ia_limit: 1 };
  return data;
}

async function _infActualizarBadge() {
  const badge = document.getElementById('inf-badge-plan');
  const fill  = document.getElementById('inf-limite-fill');
  const text  = document.getElementById('inf-limite-text');
  try {
    const { plan, ia_used: usos, ia_limit: max } = await _infGetPlanData();
    const pct  = Math.min(100, Math.round(usos / max * 100));
    if (badge) badge.textContent = `${plan} · ${usos}/${max} informes`;
    if (fill)  fill.style.width  = pct + '%';
    if (text)  text.textContent  = `${usos} de ${max} usados`;
    const btn = document.getElementById('inf-btn-generar');
    if (btn) btn.disabled = usos >= max;
    ['inf-btn-evolucion','inf-btn-diag','inf-btn-plan'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.disabled = usos >= max;
    });
  } catch {}
}


/* ══════════════════════════════════════════
   CONSTRUIR PROMPT
   ══════════════════════════════════════════ */
function _infArmarContexto() {
  const pac    = _inf.pacActual;
  const info   = _inf.infoClinica || {};
  const perfil = _inf.perfil || {};
  const ses    = (_inf.sesiones || []).filter(s => s.estado === 'realizada');
  const hoy    = new Date().toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' });

  const totalSes    = ses.length;
  const primeraFec  = ses.length ? _infFmtFecha(ses[0].fecha) : 'sin registros';
  const ultimaFec   = ses.length ? _infFmtFecha(ses[ses.length-1].fecha) : 'sin registros';
  const moods       = ses.filter(s => s.estado_animo).map(s => s.estado_animo);
  const moodProm    = moods.length ? (moods.reduce((a,b) => a+b,0)/moods.length).toFixed(1) : null;
  const moodDesc    = {1:'muy bajo',2:'bajo',3:'regular',4:'bueno',5:'muy bueno'};
  const moodStr     = moodProm ? moodDesc[Math.round(parseFloat(moodProm))] : null;
  const ultimasNotas = ses.slice(-5).map((s,i) => `Sesión ${totalSes-(4-i)}: ${s.notas || 'Sin notas'}`).join('\n');

  return `
DATOS DEL PROFESIONAL:
Nombre: ${perfil.nombre_completo || 'Profesional'} | Matrícula: ${perfil.matricula || 'N/A'} | Institución: ${perfil.institucion || 'N/A'}

DATOS DEL PACIENTE:
Nombre: ${escHtml(pac.nombre)} ${escHtml(pac.apellido)} | Teléfono: ${escHtml(pac.telefono || 'N/A')}
Motivo de consulta: ${info.motivo_consulta || 'No registrado'}
Diagnóstico: ${info.diagnostico || 'No registrado'} | Tratamiento: ${info.tratamiento_actual || 'No especificado'}

ESTADÍSTICAS DEL TRATAMIENTO:
Total sesiones realizadas: ${totalSes} | Primera sesión: ${primeraFec} | Última sesión: ${ultimaFec}
${moodStr ? `Estado de ánimo promedio: ${moodStr} (${moodProm}/5)` : ''}

NOTAS DE LAS ÚLTIMAS SESIONES:
${ultimasNotas || 'Sin notas registradas'}

Fecha del informe: ${hoy}
  `.trim();
}

function _infArmarPrompt() {
  const tipos = {
    clinico:     'Redactá un INFORME CLÍNICO PSICOLÓGICO profesional y detallado en español argentino formal.',
    juzgado:     'Redactá un INFORME PERICIAL PSICOLÓGICO para presentar ante un juzgado, en lenguaje técnico-jurídico formal, con estructura: datos del peritado, antecedentes, metodología, resultados, conclusiones y firma.',
    obrasocial:  'Redactá un INFORME PSICOLÓGICO PARA OBRA SOCIAL en formato estándar, incluyendo diagnóstico CIE-11, justificación del tratamiento y plan terapéutico.',
  };
  return `${tipos[_inf.tipo] || tipos.clinico}

DATOS DISPONIBLES:
${_infArmarContexto()}

INSTRUCCIONES:
- Usá lenguaje técnico y profesional
- Estructura clara con secciones
- No inventés datos no provistos
- Si hay indicadores de riesgo clínico, comenzá el informe con "⚠️ INDICADOR DE RIESGO:"
- Extensión: 300-600 palabras`;
}


/* ══════════════════════════════════════════
   GENERAR INFORME
   ══════════════════════════════════════════ */
window.infGenerar = async function() {
  if (!_inf.pacActual) { _infToast('⚠ Seleccioná un paciente primero', false); return; }
  if (!_inf.sessionToken) { _infToast('❌ Usuario no autenticado'); return; }

  /* ── Check de uso en FRONTEND (optimista, evita llamada innecesaria al backend) ── */
  if (!(await puedeUsar('informesIA'))) {
    _infToast('🚫 Límite de informes alcanzado. Actualizá tu plan.');
    PsicoRouter.navigate('cuenta');
    return;
  }

  /* ── Check de uso en backend ── */
  try {
    const checkResp = await fetch(PSICOAPP_CONFIG.SUPA_URL + '/functions/v1/check-ia-usage', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + _inf.sessionToken,
      },
    });
    const checkData = await checkResp.json();
    if (checkData.allowed === false) {
      _infToast('🚫 Límite de informes alcanzado');
      PsicoRouter.navigate('cuenta');
      return;
    }
  } catch(e) {
    _infToast('❌ Error al verificar límite: ' + e.message);
    return;
  }

  const loading = document.getElementById('inf-loading');
  const wrap    = document.getElementById('inf-output-wrap');
  const output  = document.getElementById('inf-output');
  const alerta  = document.getElementById('inf-alerta-riesgo');
  const btn     = document.getElementById('inf-btn-generar');

  wrap.style.display = 'none';
  loading.style.display = 'flex';
  if (btn) btn.disabled = true;

  const textos = ['Analizando historial…','Construyendo contexto clínico…','Redactando informe…','Revisando coherencia…'];
  let ti = 0;
  const intervalo = setInterval(() => {
    const el = document.getElementById('inf-loading-text');
    if (el) el.textContent = textos[ti++ % textos.length];
  }, 2000);

  try {
    const resp = await fetch(PSICOAPP_CONFIG.SUPA_URL + '/functions/v1/generar-informe', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + _inf.sessionToken,
      },
      body: JSON.stringify({ prompt: _infArmarPrompt() }),
    });
    const data = await resp.json();
    const texto = data.texto || data.error || 'Error al generar el informe.';

    clearInterval(intervalo);
    loading.style.display = 'none';
    output.innerHTML = _infRenderTexto(texto);
    wrap.style.display = 'block';
    alerta.style.display = texto.includes('⚠️ INDICADOR DE RIESGO') ? 'block' : 'none';
    wrap.scrollIntoView({ behavior: 'smooth' });
    await _infActualizarBadge();

  } catch(e) {
    clearInterval(intervalo);
    loading.style.display = 'none';
    _infToast('❌ Error al generar: ' + e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
};


/* ══════════════════════════════════════════
   ACCIONES DEL OUTPUT
   ══════════════════════════════════════════ */
window.infCopiar = function() {
  // Usar innerText para obtener texto legible sin tags HTML
  const txt = document.getElementById('inf-output')?.innerText;
  if (!txt) return;
  navigator.clipboard.writeText(txt).then(() => _infToast('✅ Copiado al portapapeles'));
};

window.infGuardar = async function() {
  // innerText para obtener texto plano sin tags HTML
  const txt = document.getElementById('inf-output')?.innerText?.trim();
  if (!txt || !_inf.pacActual) {
    _infToast('⚠️ No hay informe para guardar');
    return;
  }
  try {
    const uid = PsicoRouter.store.userId;
    if (!uid) { _infToast('❌ Usuario no identificado'); return; }
    const { error } = await sb.from('informes_clinicos').insert({
      user_id:     uid,
      paciente_id: _inf.pacActual.id,
      tipo:        _inf.tipo,
      texto:       txt,
    });
    if (error) throw error;
    _infToast('✅ Informe guardado');
    await _infCargarInformesGuardados();
  } catch(e) {
    console.error('[Informes] Error al guardar:', e.message, e);
    _infToast('❌ Error al guardar: ' + e.message);
  }
};


/* ══════════════════════════════════════════
   FUNCIONES EXTRA IA
   ══════════════════════════════════════════ */
async function _infLlamarExtra(prompt, loadingText) {
  const wrap    = document.getElementById('inf-extra-output');
  const loading = document.getElementById('inf-extra-loading');
  const result  = document.getElementById('inf-extra-result');
  const lt      = document.getElementById('inf-extra-loading-text');

  wrap.style.display = 'block';
  loading.style.display = 'flex';
  result.textContent = '';
  if (lt) lt.textContent = loadingText;

  try {
    if (!_inf.sessionToken) throw new Error('Usuario no autenticado');

    const resp = await fetch(PSICOAPP_CONFIG.SUPA_URL + '/functions/v1/generar-informe', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + _inf.sessionToken,
      },
      body: JSON.stringify({ prompt: prompt + '\n\n' + _infArmarContexto() }),
    });
    const data = await resp.json();
    loading.style.display = 'none';
    result.innerHTML = _infRenderTexto(data.texto || data.error || 'Sin resultado.');
    _inf._extraTipo = loadingText; // guardar qué tipo de análisis es
    wrap.scrollIntoView({ behavior: 'smooth' });
  } catch(e) {
    loading.style.display = 'none';
    result.textContent = '❌ Error: ' + e.message;
  }
}

window.infVerEvolucion = () => _infLlamarExtra(
  'Analizá la evolución clínica del paciente a lo largo del tratamiento, identificando cambios, patrones y progreso terapéutico. Respondé en español argentino.',
  'Analizando evolución…'
);

window.infSugerirDiag = () => _infLlamarExtra(
  'Basándote en los datos clínicos disponibles, sugerí posibles diagnósticos según el sistema CIE-11. Aclará que son orientativos y sujetos a evaluación profesional.',
  'Analizando diagnóstico CIE-11…'
);

window.infSugerirPlan = () => _infLlamarExtra(
  'Sugerí un plan terapéutico estructurado para este paciente, incluyendo objetivos, técnicas recomendadas y frecuencia de sesiones sugerida.',
  'Diseñando plan terapéutico…'
);

window.infCopiarExtra = function() {
  const txt = document.getElementById('inf-extra-result')?.innerText;
  if (!txt) return;
  navigator.clipboard.writeText(txt).then(() => _infToast('✅ Copiado'));
};

window.infGuardarExtra = async function() {
  const txt = document.getElementById('inf-extra-result')?.innerText?.trim();
  if (!txt || !_inf.pacActual) { _infToast('⚠️ No hay análisis para guardar'); return; }
  try {
    const uid = PsicoRouter.store.userId;
    if (!uid) { _infToast('❌ Usuario no identificado'); return; }
    // El tipo refleja qué función extra generó el texto
    const tipoExtra = _inf._extraTipo || 'analisis_extra';
    const { error } = await sb.from('informes_clinicos').insert({
      user_id:     uid,
      paciente_id: _inf.pacActual.id,
      tipo:        tipoExtra,
      texto:       txt,
    });
    if (error) throw error;
    _infToast('✅ Análisis guardado');
    await _infCargarInformesGuardados();
  } catch(e) {
    console.error('[Informes] Error al guardar extra:', e.message);
    _infToast('❌ Error al guardar: ' + e.message);
  }
};


/* ══════════════════════════════════════════
   EXPORTAR INFORME COMO PDF
   Usa la API nativa del navegador (window.print)
   con una ventana de impresión estilizada.
   ══════════════════════════════════════════ */
window.infExportarPDF = function() {
  const texto = document.getElementById('inf-output')?.innerText?.trim();
  if (!texto) { _infToast('⚠️ No hay informe para exportar'); return; }

  const pac  = _inf.pacActual;
  const nombre = pac ? `${pac.nombre || ''} ${pac.apellido || ''}`.trim() : 'Paciente';
  const fecha  = new Date().toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' });
  const tipo   = { clinico:'Informe Clínico', juzgado:'Informe Pericial', obrasocial:'Informe Obra Social' }[_inf.tipo] || 'Informe Clínico';

  // Convertir el HTML del output a texto estructurado
  const outputEl = document.getElementById('inf-output');
  let contenidoHTML = '';
  if (outputEl) {
    outputEl.querySelectorAll('.inf-seccion, .inf-parrafo').forEach(el => {
      if (el.classList.contains('inf-seccion')) {
        contenidoHTML += `<h3>${el.textContent}</h3>`;
      } else {
        contenidoHTML += `<p>${el.innerHTML}</p>`;
      }
    });
  }
  if (!contenidoHTML) contenidoHTML = texto.split('\n').filter(l=>l.trim()).map(l=>`<p>${l}</p>`).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${tipo} — ${nombre}</title>
<style>
  @page { size: A4; margin: 2.5cm 2cm 2.5cm 2cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #1a1a1a; line-height: 1.7; }

  .header { border-bottom: 2px solid #5B2FA8; padding-bottom: 16px; margin-bottom: 24px; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .app-name { font-size: 11pt; font-weight: 700; color: #5B2FA8; letter-spacing: 1px; text-transform: uppercase; }
  .doc-tipo { font-size: 18pt; font-weight: 700; color: #1a1a1a; margin: 8px 0 4px; }
  .doc-meta { font-size: 10pt; color: #555; }
  .doc-fecha { font-size: 10pt; color: #555; text-align: right; }

  .paciente-box { background: #f5f3ff; border-left: 4px solid #5B2FA8; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0; }
  .paciente-label { font-size: 9pt; font-weight: 700; color: #5B2FA8; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 4px; }
  .paciente-nombre { font-size: 14pt; font-weight: 700; color: #1a1a1a; }

  .contenido h3 { font-size: 10pt; font-weight: 700; color: #5B2FA8; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 6px; border-bottom: 1px solid #e5e2f5; padding-bottom: 4px; }
  .contenido p { font-size: 11.5pt; margin-bottom: 8px; text-align: justify; }
  .contenido strong { font-weight: 700; }

  .footer { margin-top: 48px; border-top: 1px solid #ccc; padding-top: 16px; display: flex; justify-content: space-between; }
  .firma-box { text-align: center; }
  .firma-linea { border-top: 1px solid #333; width: 200px; margin: 40px auto 6px; }
  .firma-label { font-size: 9pt; color: #555; }
  .watermark { font-size: 8pt; color: #aaa; }

  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>

<div class="header">
  <div class="header-top">
    <div>
      <div class="app-name">PsicoApp · Documentación Clínica</div>
      <div class="doc-tipo">${tipo}</div>
      <div class="doc-meta">Documento generado con asistencia de IA · Marco psicoanalítico</div>
    </div>
    <div class="doc-fecha">Fecha: ${fecha}</div>
  </div>
</div>

<div class="paciente-box">
  <div class="paciente-label">Paciente</div>
  <div class="paciente-nombre">${nombre}</div>
</div>

<div class="contenido">
${contenidoHTML}
</div>

<div class="footer">
  <div class="firma-box">
    <div class="firma-linea"></div>
    <div class="firma-label">Firma y sello del profesional</div>
  </div>
  <div class="watermark">Generado por PsicoApp · ${fecha}</div>
</div>

</body>
</html>`;

  const ventana = window.open('', '_blank', 'width=800,height=900');
  if (!ventana) { _infToast('⚠️ Habilitá las ventanas emergentes para generar el PDF'); return; }
  ventana.document.write(html);
  ventana.document.close();
  ventana.onload = () => {
    setTimeout(() => {
      ventana.print();
    }, 500);
  };
};


/* ══════════════════════════════════════════
   REGISTRO EN EL ROUTER
   ══════════════════════════════════════════ */
PsicoRouter.register('informes', {

  init(container) {
    _infRenderHTML(container);
  },

  async onEnter() {
    /* Cargar sesión para el token */
    const { data: { session } } = await sb.auth.getSession();
    _inf.sessionToken = session?.access_token || null;

    /* Cargar perfil del profesional (desde store o Supabase) */
    _inf.perfil = await PsicoRouter.store.ensurePerfil();

    /* Cargar pacientes desde store (evita re-fetch si ya están cacheados) */
    await _infCargarPacientes();
    await _infActualizarBadge();
  },

  onLeave() {
    /* Nada que limpiar — el estado de paciente seleccionado se mantiene */
  },
});

/* Compatibilidad legacy */
window.onViewEnter_informes = () => PsicoRouter.navigate('informes');
