/**
 * build.js — PsicoApp pre-deploy script
 * Ejecutado por Vercel en cada deploy via package.json "build"
 *
 * 1. Genera config.js desde variables de entorno de Vercel
 * 2. Reemplaza la versión del SW y el cache-bust de index.html
 *
 * Variables requeridas en Vercel → Settings → Environment Variables:
 *   SUPA_URL        → URL del proyecto Supabase
 *   SUPA_KEY        → anon/public key de Supabase
 *   LINK_PAGO_PRO   → Link MercadoPago plan Pro
 *   LINK_PAGO_MAX   → Link MercadoPago plan Max
 *   LINK_PAGO_EXTRA → Link MercadoPago pack WA extra
 */

const fs   = require('fs');
const path = require('path');

// ── 0. Generar config.js desde variables de entorno ───────────
const supaUrl  = process.env.SUPA_URL;
const supaKey  = process.env.SUPA_KEY;

if (!supaUrl || !supaKey) {
  console.error('[build] ❌ SUPA_URL y SUPA_KEY son obligatorias.');
  console.error('[build]    Configurálas en Vercel → Settings → Environment Variables');
  process.exit(1);
}

const configContent = `// Generado automáticamente por build.js — NO editar manualmente.
const PSICOAPP_CONFIG = {
  SUPA_URL:        '${supaUrl}',
  SUPA_KEY:        '${supaKey}',
  LINK_PAGO_PRO:   '${process.env.LINK_PAGO_PRO   || ''}',
  LINK_PAGO_MAX:   '${process.env.LINK_PAGO_MAX   || ''}',
  LINK_PAGO_EXTRA: '${process.env.LINK_PAGO_EXTRA || ''}',
};
`;

fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
console.log('[build] ✅ config.js generado desde variables de entorno');

// Versión basada en timestamp del build (ej: "20260410-1523")
const now     = new Date();
const version = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;

console.log(`[build] Cache version: psicoapp-${version}`);

// ── 1. sw.js — actualizar CACHE_VERSION ───────────────────────
const swPath    = path.join(__dirname, 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');
const swFixed   = swContent.replace(
  /const CACHE_VERSION = 'psicoapp-[^']+'/,
  `const CACHE_VERSION = 'psicoapp-${version}'`
);
fs.writeFileSync(swPath, swFixed);
console.log(`[build] sw.js → CACHE_VERSION = 'psicoapp-${version}'`);

// ── 2. index.html — actualizar ?v= en todos los scripts ───────
const htmlPath    = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const htmlFixed   = htmlContent.replace(/\?v=[\w-]+/g, `?v=${version}`);
fs.writeFileSync(htmlPath, htmlFixed);
console.log(`[build] index.html → ?v=${version} en todos los scripts`);

console.log('[build] ✅ Cache busting actualizado correctamente');
