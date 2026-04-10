// ═══════════════════════════════════════════════════════════════
//  google-calendar.js — PsicoApp
//  Integración con Google Calendar (Token model / GIS)
//  - Sesiones → verde (colorId 10)
//  - Eventos  → naranja (colorId 6)
//  - Usa calendar primary por defecto; intenta crear "PsicoApp · Turnos"
// ═══════════════════════════════════════════════════════════════

const GCal = (() => {

  const CLIENT_ID     = '258644442158-gid3k8d4ga7a9lem9e4tjl4aif33gsu1.apps.googleusercontent.com';
  // Scope amplio: permite crear calendarios Y eventos
  const SCOPES        = 'https://www.googleapis.com/auth/calendar';
  const GCAL_API      = 'https://www.googleapis.com/calendar/v3';
  const KEY_CONNECTED = 'gcal_connected';
  const KEY_CAL_ID    = 'gcal_calendar_id';

  let _tokenClient = null;
  let _accessToken = null;
  let _tokenExpiry = 0;

  // ── Cargar GIS ────────────────────────────────────────────────
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

  // ── Obtener token — SIEMPRE pide consent para forzar scope nuevo ─
  function _getToken(forceConsent = false) {
    return new Promise(async (resolve, reject) => {
      if (!forceConsent && _accessToken && Date.now() < _tokenExpiry - 30_000) {
        resolve(_accessToken); return;
      }
      try { await _ensureGIS(); } catch(e) { reject(e); return; }

      // Siempre recrear el tokenClient para asegurar el scope correcto
      _tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope:     SCOPES,
        callback:  (resp) => {
          if (resp.error) {
            console.error('[GCal] Token error:', resp.error, resp.error_description);
            reject(new Error(resp.error_description || resp.error));
            return;
          }
          _accessToken = resp.access_token;
          _tokenExpiry = Date.now() + (resp.expires_in * 1000);
          localStorage.setItem(KEY_CONNECTED, '1');
          console.log('[GCal] Token OK, expires_in:', resp.expires_in, 'scope:', resp.scope);
          resolve(_accessToken);
        },
      });

      const prompt = forceConsent ? 'consent' : (localStorage.getItem(KEY_CONNECTED) === '1' ? '' : 'consent');
      console.log('[GCal] Pidiendo token con prompt:', prompt);
      _tokenClient.requestAccessToken({ prompt });
    });
  }

  // ── API call ──────────────────────────────────────────────────
  async function _api(method, path, body) {
    const token = await _getToken();
    const opts  = {
      method,
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    console.log('[GCal] API', method, path);
    const resp = await fetch(GCAL_API + path, opts);

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${resp.status}`;
      console.error('[GCal] API error:', resp.status, msg, err);
      throw new Error(msg);
    }
    if (resp.status === 204) return null;
    return resp.json();
  }

  // ── Obtener o crear calendario dedicado ───────────────────────
  async function _getOrCreateCalendar() {
    const saved = localStorage.getItem(KEY_CAL_ID);
    if (saved) {
      console.log('[GCal] Usando calendario guardado:', saved);
      return saved;
    }

    try {
      // Buscar si ya existe
      const list = await _api('GET', '/users/me/calendarList');
      const existing = (list.items || []).find(c => c.summary === 'PsicoApp · Turnos');
      if (existing) {
        console.log('[GCal] Calendario encontrado:', existing.id);
        localStorage.setItem(KEY_CAL_ID, existing.id);
        return existing.id;
      }

      // Crear nuevo
      const created = await _api('POST', '/calendars', {
        summary:     'PsicoApp · Turnos',
        description: 'Turnos y sesiones gestionados desde PsicoApp',
        timeZone:    'America/Argentina/Buenos_Aires',
      });
      console.log('[GCal] Calendario creado:', created.id);

      // Setear color verde en la lista
      await _api('PATCH', `/users/me/calendarList/${encodeURIComponent(created.id)}`, {
        colorId: '2', selected: true,
      }).catch(e => console.warn('[GCal] No se pudo setear color del calendario:', e.message));

      localStorage.setItem(KEY_CAL_ID, created.id);
      return created.id;

    } catch(e) {
      console.warn('[GCal] No se pudo crear calendario dedicado, usando primary:', e.message);
      return 'primary';
    }
  }

  // ── Construir evento ──────────────────────────────────────────
  function _buildEvent(turno, nombrePaciente) {
    const [y, m, d] = turno.fecha.split('-').map(Number);
    const [hh, mm]  = (turno.hora || '09:00').split(':').map(Number);
    const durMin    = turno.duracion || 50;

    const inicio = new Date(y, m - 1, d, hh, mm);
    const fin    = new Date(inicio.getTime() + durMin * 60_000);

    const esEvento = turno.tipo === 'evento';
    const labels   = { sesion:'Sesión', online:'Online', evaluacion:'Evaluación', judicial:'Judicial', evento:'Evento', otro:'Otro' };
    const label    = labels[turno.tipo] || 'Sesión';

    const title = esEvento
      ? (turno.notas || 'Evento')
      : `${label} — ${nombrePaciente || 'Paciente'}`;

    const desc = [
      esEvento ? null : `Paciente: ${nombrePaciente || '—'}`,
      turno.notas && !esEvento ? `Notas: ${turno.notas}` : null,
      `Duración: ${durMin} min`,
      `Tipo: ${label}`,
      'Generado por PsicoApp',
    ].filter(Boolean).join('\n');

    return {
      summary:     title,
      description: desc,
      colorId:     esEvento ? '6' : '10',   // naranja : verde
      start: { dateTime: inicio.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
      end:   { dateTime: fin.toISOString(),    timeZone: 'America/Argentina/Buenos_Aires' },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }] },
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
      google.accounts.oauth2.revoke(_accessToken, () => console.log('[GCal] Token revocado'));
    }
    _accessToken = null;
    _tokenExpiry = 0;
    _tokenClient = null;
    localStorage.removeItem(KEY_CONNECTED);
    localStorage.removeItem(KEY_CAL_ID);
  }

  async function connect() {
    // Forzar consent para obtener scope completo (calendar, no solo calendar.events)
    await _getToken(true);
    await _getOrCreateCalendar();
    return true;
  }

  async function createEvent(turno, nombrePaciente) {
    const calId = await _getOrCreateCalendar();
    const evt   = _buildEvent(turno, nombrePaciente);
    console.log('[GCal] Creando evento en calendario:', calId, evt);
    const data  = await _api('POST', `/calendars/${encodeURIComponent(calId)}/events`, evt);
    console.log('[GCal] Evento creado:', data.id, data.htmlLink);
    return data.id;
  }

  async function updateEvent(gcalEventId, turno, nombrePaciente) {
    const calId = localStorage.getItem(KEY_CAL_ID) || 'primary';
    const evt   = _buildEvent(turno, nombrePaciente);
    await _api('PUT', `/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(gcalEventId)}`, evt);
  }

  async function deleteEvent(gcalEventId) {
    if (!gcalEventId) return;
    const calId = localStorage.getItem(KEY_CAL_ID) || 'primary';
    try {
      await _api('DELETE', `/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(gcalEventId)}`);
    } catch(e) {
      if (!e.message.includes('404') && !e.message.includes('Gone')) throw e;
    }
  }

  return { isConnected, connect, disconnect, createEvent, updateEvent, deleteEvent };

})();
