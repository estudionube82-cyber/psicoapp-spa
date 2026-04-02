/**
 * psicoapp-sanitize.js — Utilidades de seguridad frontend
 * Incluir ANTES de cualquier view-*.js en index.html:
 *   <script src="/psicoapp-sanitize.js"></script>
 *
 * Expone globalmente:
 *   escHtml(str)  — escapa caracteres HTML peligrosos (previene XSS)
 *   escAttr(str)  — escapa para uso dentro de atributos HTML
 */

(function () {

  /**
   * Escapa caracteres HTML especiales en un string.
   * Usar en TODOS los datos de usuario antes de insertar en innerHTML.
   *
   * @param {*} str — valor a escapar (cualquier tipo)
   * @returns {string} string escapado seguro para innerHTML
   *
   * @example
   * element.innerHTML = `<div>${escHtml(paciente.nombre)}</div>`;
   */
  function escHtml(str = '') {
    return String(str == null ? '' : str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#039;');
  }

  /**
   * Escapa para uso dentro de atributos HTML (data-*, onclick strings, etc.).
   * Más estricto que escHtml: también escapa backtick y slash.
   *
   * @param {*} str
   * @returns {string}
   */
  function escAttr(str = '') {
    return escHtml(str)
      .replace(/`/g, '&#096;')
      .replace(/\//g, '&#047;');
  }

  // Exponer globalmente
  window.escHtml = escHtml;
  window.escAttr = escAttr;

})();
