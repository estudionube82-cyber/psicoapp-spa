// ═══════════════════════════════════════════════════════════════
//  google-calendar.js — PsicoApp
//  Servicio de integración con Google Calendar (Token model)
//  Usa Google Identity Services — sin OAuth redirect, sin backend
// ═══════════════════════════════════════════════════════════════

const GCal = (() => {

  // ── Config ────────────────────────────────────────────────────
  const CLIENT_ID = '258644442158-gid3k8d4ga7a9lem9e4tjl4aif33gsu1.apps.googleusercontent.com';
  const SCOPES    = 'https://www.googleapis.com/auth/calendar.events';
  const GCAL_API  = 'https://www.googleapis.com/calendar/v3';
  const STORAGE_KEY = 'gcal_connected';

  // ── Estado ────────────────────────────────────────────────────
  let _tokenClient = null;
  let _accessToken = null;
  let _tokenExpiry = 0;   // timestamp ms

  // ── Inicializar Google Identity Services ──────────────────────
  function _ensureGIS() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.onload  = resolve;
      s.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
      document.head.appendChild(s);
    });
  }

  // ── Obtener token (pide consentimiento si no hay uno válido) ──
  function _getToken() {
    return new Promise(async (resolve, reject) => {
      // Si el token vigente tiene más de 30 seg de vida, reutilizarlo
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
            localStorage.setItem(STORAGE_KEY, '1');
            resolve(_accessToken);
          },
        });
      }

      // Si hay token guardado (sesión previa), pedir silenciosamente
      const wasPrev = localStorage.getItem(STORAGE_KEY) === '1';
      _tokenClient.requestAccessToken({ prompt: wasPrev ? '' : 'consent' });
    });
  }

  // ── Llamada a la API de Google Calendar ───────────────────────
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

  // ── Construir objeto evento de Google Calendar ────────────────
  function _buildGCalEvent(turno, nombrePaciente) {
    const [y, m, d] = turno.fecha.split('-').map(Number);
    const [hh, mm]  = (turno.hora || '09:00').split(':').map(Number);
    const durMin    = turno.duracion || 50;

    const inicio = new Date(y, m - 1, d, hh, mm);
    const fin    = new Date(inicio.getTime() + durMin * 60_000);

    const tipoLabel = {
      sesion:'Sesión', online:'Online', evaluacion:'Evaluación',
      judicial:'Judicial', evento:'Evento', otro:'Otro',
    }[turno.tipo] || 'Sesión';

    const title = turno.tipo === 'evento'
      ? (turno.notas || 'Evento')
      : `${tipoLabel} — ${nombrePaciente || 'Paciente'}`;

    const desc = [
      turno.notas    ? `Notas: ${turno.notas}` : null,
      `Duración: ${durMin} min`,
      'Creado desde PsicoApp',
    ].filter(Boolean).join('\n');

    return {
      summary:     title,
      description: desc,
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

  /** Verifica si el usuario ya conectó Google Calendar */
  function isConnected() {
    return localStorage.getItem(STORAGE_KEY) === '1';
  }

  /** Desconectar — revoca token y limpia estado */
  function disconnect() {
    if (_accessToken && window.google?.accounts?.oauth2) {
      google.accounts.oauth2.revoke(_accessToken);
    }
    _accessToken  = null;
    _tokenExpiry  = 0;
    _tokenClient  = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Conectar: pide consentimiento y retorna true si OK
   * Llamar desde un click del usuario (requisito de navegador)
   */
  async function connect() {
    await _getToken();
    return true;
  }

  /**
   * Crear evento en Google Calendar
   * @param {object} turno — fila de la tabla turnos
   * @param {string} nombrePaciente
   * @returns {string} gcal_event_id del evento creado
   */
  async function createEvent(turno, nombrePaciente) {
    const evt  = _buildGCalEvent(turno, nombrePaciente);
    const data = await _api('POST', '/calendars/primary/events', evt);
    return data.id;   // gcal_event_id
  }

  /**
   * Actualizar evento existente
   */
  async function updateEvent(gcalEventId, turno, nombrePaciente) {
    const evt = _buildGCalEvent(turno, nombrePaciente);
    await _api('PUT', `/calendars/primary/events/${encodeURIComponent(gcalEventId)}`, evt);
  }

  /**
   * Eliminar evento de Google Calendar (silencioso si no existe)
   */
  async function deleteEvent(gcalEventId) {
    if (!gcalEventId) return;
    try {
      await _api('DELETE', `/calendars/primary/events/${encodeURIComponent(gcalEventId)}`);
    } catch(e) {
      // Si ya fue eliminado en Google, ignorar el error 404/410
      if (!e.message.includes('404') && !e.message.includes('410') && !e.message.includes('Gone')) throw e;
    }
  }

  return { isConnected, connect, disconnect, createEvent, updateEvent, deleteEvent };

})();
