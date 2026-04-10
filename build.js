/**
 * build.js — PsicoApp pre-deploy script
 * Ejecutado por Vercel en cada deploy via package.json "build"
 * Reemplaza la versión del SW y el cache-bust de index.html
 * con el timestamp del build para invalidar caches automáticamente.
 */

const fs   = require('fs');
const path = require('path');

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
