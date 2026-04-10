// ═══════════════════════════════════════════════════════════════
//  google-calendar.js — PsicoApp
//  Integración con Google Calendar (Token model)
//  - Crea un calendario dedicado "PsicoApp · Turnos" en "Otros calendarios"
//  - Sesiones/pacientes → verde | Eventos → naranja
// ═══════════════════════════════════════════════════════════════

const GCal = (() => {

  // ── Config ────────────────────────────────────────────────────
  const CLIENT_ID   = '258644442158-gid3k8d4ga7a9lem9e4tjl4aif33gsu1.apps.googleusercontent.com';
  const SCOPES      = 'https://www.googleapis.com/auth/calendar';
  const GCAL_API    = 'https://www.googleapis.com/calendar/v3';

  const KEY_CONNECTED = 'gcal_connected';
  const KEY_CAL_ID    = 'gcal_calendar_id';   // ID del calendario "PsicoApp · Turnos"

  // Colores Google Calendar (colorId)
  // 10 = Basil (verde oscuro) → sesiones/pacientes
  // 6  = Tangerine (naranja)  → eventos
  const COLOR_SESION  = '10';   // verde
  const COLOR_EVENTO  = '6';    // naranja

  // ── Estado ────────────────────────────────────────────────────
  let _tokenClient = null;
  let _accessToken = null;
  let _tokenExpiry = 0;

  // ── Cargar Google Identity Services ──────────────────────────
  function _ensureGIS() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) { resolve(); return; }
      const s = document.createElement('script');
      s.src     = 'https://accounts.google.com/gsi/client';
      s.onload  = resolve;
      s.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
      document.head.appendChild(s);
    });
  }

  // ── Obtener access token ──────────────────────────────────────
  function _getToken() {
    return new Promise(async (resolve, reject) => {
      if (_accessToken && Date.now() < _tokenExpiry - 30_000) {
        resolve(_accessToken); return;
      }
      try { await _ensureGIS(); } catch(e) { reject(e); return; }

      if (!_tokenClient) {
        _tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope:     SCOPES,
          callback:  (resp) => {
            if (resp.error) { reject(new Error(resp.error)); return; }
            _accessToken = resp.access_token;
            _tokenExpiry = Date.now() + (resp.expires_in * 1000);
            localStorage.setItem(KEY_CONNECTED, '1');
            resolve(_accessToken);
          },
        });
      }
      const wasPrev = localStorage.getItem(KEY_CONNECTED) === '1';
      _tokenClient.requestAccessToken({ prompt: wasPrev ? '' : 'consent' });
    });
  }

  // ── Llamada genérica a la API ─────────────────────────────────
  async function _api(method, path, body) {
    const token = await _getToken();
    const opts  = {
      method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type':  'application/json',
      },
    };
    if (body) opts.body = JSON.stringify(body);
    const resp = await fetch(GCAL_API + path, opts);
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error ${resp.status}`);
    }
    if (resp.status === 204) return null;
    return resp.json();
  }

  // ── Obtener o crear el calendario "PsicoApp · Turnos" ─────────
  async function _getOrCreateCalendar() {
    // Si ya lo tenemos en localStorage, usarlo directamente
    const saved = localStorage.getItem(KEY_CAL_ID);
    if (saved) return saved;

    // Listar calendarios del usuario y buscar el nuestro
    const list = await _api('GET', '/users/me/calendarList');
    const existing = (list.items || []).find(c =>
      c.summary === 'PsicoApp · Turnos'
    );
    if (existing) {
      localStorage.setItem(KEY_CAL_ID, existing.id);
      return existing.id;
    }

    // No existe → crearlo con color verde (colorId 8 = Graphite para el calendario,
    // los eventos tendrán sus propios colores)
    const created = await _api('POST', '/calendars', {
      summary:     'PsicoApp · Turnos',
      description: 'Turnos y sesiones gestionados desde PsicoApp',
      timeZone:    'America/Argentina/Buenos_Aires',
    });

    // Setear color del calendario en la lista del usuario (verde = "sage" = #33B679)
    await _api('PATCH', `/users/me/calendarList/${encodeURIComponent(created.id)}`, {
      colorId:    '2',   // Sage (verde claro) para el calendario en sí
      selected:   true,
    }).catch(() => {});  // no crítico si falla

    localStorage.setItem(KEY_CAL_ID, created.id);
    return created.id;
  }

  // ── Construir objeto evento de Google Calendar ────────────────
  function _buildGCalEvent(turno, nombrePaciente) {
    const [y, m, d] = turno.fecha.split('-').map(Number);
    const [hh, mm]  = (turno.hora || '09:00').split(':').map(Number);
    const durMin    = turno.duracion || 50;

    const inicio = new Date(y, m - 1, d, hh, mm);
    const fin    = new Date(inicio.getTime() + durMin * 60_000);

    const esEvento  = turno.tipo === 'evento';
    const tipoLabel = {
      sesion:'Sesión', online:'Online', evaluacion:'Evaluación',
      judicial:'Judicial', evento:'Evento', otro:'Otro',
    }[turno.tipo] || 'Sesión';

    const title = esEvento
      ? (turno.notas || 'Evento')
      : `${tipoLabel} — ${nombrePaciente || 'Paciente'}`;

    const desc = [
      esEvento ? null : `Paciente: ${nombrePaciente || '—'}`,
      turno.notas && !esEvento ? `Notas: ${turno.notas}` : null,
      `Duración: ${durMin} min`,
      `Tipo: ${tipoLabel}`,
      'Creado desde PsicoApp',
    ].filter(Boolean).join('\n');

    return {
      summary:     title,
      description: desc,
      colorId:     esEvento ? COLOR_EVENTO : COLOR_SESION,
      start: { dateTime: inicio.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
      end:   { dateTime: fin.toISOString(),    timeZone: 'America/Argentina/Buenos_Aires' },
      reminders: {
        useDefault: false,
        overrides:  [{ method: 'popup', minutes: 30 }],
      },
    };
  }

  // ══════════════════════════════════════════════════════════════
  //  API PÚBLICA
  // ══════════════════════════════════════════════════════════════

  function isConnected() {
    return localStorage.getItem(KEY_CONNECTED) === '1';
  }

  function disconnect() {
    if (_accessToken && window.google?.accounts?.oauth2) {
      google.accounts.oauth2.revoke(_accessToken);
    }
    _accessToken = null;
    _tokenExpiry = 0;
    _tokenClient = null;
    localStorage.removeItem(KEY_CONNECTED);
    // NO borramos KEY_CAL_ID para que si reconecta use el mismo calendario
  }

  async function connect() {
    await _getToken();
    // Crear/obtener el calendario dedicado al conectar
    await _getOrCreateCalendar();
    return true;
  }

  async function createEvent(turno, nombrePaciente) {
    const calId = await _getOrCreateCalendar();
    const evt   = _buildGCalEvent(turno, nombrePaciente);
    const data  = await _api('POST', `/calendars/${encodeURIComponent(calId)}/events`, evt);
    return data.id;
  }

  async function updateEvent(gcalEventId, turno, nombrePaciente) {
    const calId = await _getOrCreateCalendar();
    const evt   = _buildGCalEvent(turno, nombrePaciente);
    await _api('PUT', `/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(gcalEventId)}`, evt);
  }

  async function deleteEvent(gcalEventId) {
    if (!gcalEventId) return;
    const calId = localStorage.getItem(KEY_CAL_ID) || 'primary';
    try {
      await _api('DELETE', `/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(gcalEventId)}`);
    } catch(e) {
      if (!e.message.includes('404') && !e.message.includes('410') && !e.message.includes('Gone')) throw e;
    }
  }

  return { isConnected, connect, disconnect, createEvent, updateEvent, deleteEvent };

})();
