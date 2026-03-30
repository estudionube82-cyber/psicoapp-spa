#!/usr/bin/env node
/**
 * migrate-lazy-views.js
 * ─────────────────────────────────────────────────────────
 * Transforma todos los view-*.js al patrón lazy-render:
 *   - El HTML se inyecta SOLO la primera vez (flag initialized)
 *   - Las llamadas a datos se ejecutan siempre
 *   - Cero cambios a lógica, estilos ni Supabase
 *
 * USO:
 *   node migrate-lazy-views.js             (dry-run, solo muestra cambios)
 *   node migrate-lazy-views.js --apply     (aplica los cambios)
 *   node migrate-lazy-views.js --apply --file view-dashboard.js  (un solo archivo)
 *
 * Corre desde la raíz del proyecto (donde están los view-*.js)
 * ─────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

// ── CLI args ──────────────────────────────────────────────
const args    = process.argv.slice(2);
const APPLY   = args.includes('--apply');
const fileArg = args.find(a => a.startsWith('--file'));
const singleFile = fileArg ? fileArg.split('=')[1] || args[args.indexOf(fileArg) + 1] : null;

// ── Config ────────────────────────────────────────────────
const VIEW_DIR = process.cwd();

// ── Colores para consola ──────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  red:    '\x1b[31m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
};

function log(msg, color = '') { console.log(`${color}${msg}${c.reset}`); }

// ── Descubrir archivos ────────────────────────────────────
function getViewFiles() {
  if (singleFile) {
    const f = path.resolve(VIEW_DIR, singleFile);
    if (!fs.existsSync(f)) { log(`❌ Archivo no encontrado: ${f}`, c.red); process.exit(1); }
    return [f];
  }
  return fs.readdirSync(VIEW_DIR)
    .filter(f => /^view-.+\.js$/.test(f))
    .map(f => path.join(VIEW_DIR, f));
}

// ── Extraer el "viewId" de un archivo ────────────────────
// view-dashboard.js → dashboard
function viewIdFromFile(filePath) {
  return path.basename(filePath, '.js').replace(/^view-/, '');
}

// ── Capitalizar para generar el flag ─────────────────────
// dashboard → dashboardInitialized
// view-pacientes → pacientesInitialized
function flagName(viewId) {
  const clean = viewId.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
  return `${clean}Initialized`;
}

// ── Detectar si ya fue migrado ────────────────────────────
function alreadyMigrated(src, flag) {
  return src.includes(`let ${flag}`) || src.includes(`var ${flag}`) || src.includes(`const ${flag}`);
}

/**
 * Transformar un archivo.
 *
 * Busca la función init de la vista (initX / onViewEnter_X / cargarX)
 * y envuelve la asignación de innerHTML con el flag.
 *
 * Retorna { transformed: bool, newSrc: string, details: string[] }
 */
function transformFile(filePath) {
  const viewId = viewIdFromFile(filePath);
  const flag   = flagName(viewId);
  const src    = fs.readFileSync(filePath, 'utf8');
  const details = [];

  if (alreadyMigrated(src, flag)) {
    return { transformed: false, newSrc: src, details: ['Ya migrado — se omite'] };
  }

  // ── ESTRATEGIA ──────────────────────────────────────────
  // Buscamos bloques del tipo:
  //
  //   container.innerHTML = `...`;         ← asignación directa
  //   container.innerHTML = "...";
  //   container.innerHTML = '...';
  //
  // dentro de la función init principal.
  // Los envolvemos con:
  //
  //   if (!flag) {
  //     container.innerHTML = `...`;
  //     flag = true;
  //   }
  //
  // Adicionalmente:
  //   - Agregamos `let flag = false;` al tope del archivo
  // ────────────────────────────────────────────────────────

  // Regex para capturar asignaciones innerHTML (template literals, strings simples)
  // Maneja multilínea con template literals
  const innerHTMLRegex = /(\s*)(container\.innerHTML\s*=\s*`[\s\S]*?`\s*;)/g;
  const innerHTMLRegexSimple = /(\s*)(container\.innerHTML\s*=\s*["'][^"']*["']\s*;)/g;

  let newSrc = src;
  let foundCount = 0;

  // Helper: envolver con el flag
  function wrapWithFlag(match, indent, assignment) {
    foundCount++;
    details.push(`  ✔ innerHTML envuelto con flag (${foundCount})`);
    return `${indent}if (!${flag}) {\n${indent}  ${assignment.trim()}\n${indent}  ${flag} = true;\n${indent}}`;
  }

  // Primero template literals (más comunes, pueden ser multilínea)
  newSrc = newSrc.replace(innerHTMLRegex, wrapWithFlag);

  // Luego strings simples (si los hubiera)
  if (foundCount === 0) {
    newSrc = newSrc.replace(innerHTMLRegexSimple, wrapWithFlag);
  }

  if (foundCount === 0) {
    // Fallback: puede que usen una variable intermedia o un helper
    // En ese caso marcamos para revisión manual
    details.push('  ⚠ No se encontró container.innerHTML — revisar manualmente');
    return { transformed: false, newSrc: src, details };
  }

  // Agregar flag al tope del archivo (antes del primer `function` o `let/var/const`)
  const flagDecl = `let ${flag} = false;\n`;
  const insertPos = findInsertPosition(newSrc);
  newSrc = newSrc.slice(0, insertPos) + flagDecl + newSrc.slice(insertPos);

  details.push(`  ✔ Flag agregado: let ${flag} = false`);

  return { transformed: true, newSrc, details };
}

/**
 * Encuentra el punto óptimo para insertar la declaración del flag:
 * - Si hay un bloque de comentario de cabecera (/* ... * /), después de él
 * - Si no, al inicio del archivo
 */
function findInsertPosition(src) {
  // Después del primer bloque de comentario /* */
  const blockCommentEnd = src.indexOf('*/');
  if (blockCommentEnd !== -1 && blockCommentEnd < 500) {
    // Avanzar hasta el siguiente \n
    const nl = src.indexOf('\n', blockCommentEnd);
    return nl !== -1 ? nl + 1 : blockCommentEnd + 2;
  }

  // Después de las líneas de comentario //
  let pos = 0;
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('//') || trimmed === '') {
      pos += lines[i].length + 1;
    } else {
      break;
    }
  }
  return pos;
}

// ── MAIN ─────────────────────────────────────────────────
function main() {
  const files = getViewFiles();

  log(`\n${c.bold}🔄 PsicoApp — Migración lazy-render${c.reset}`);
  log(`Modo: ${APPLY ? `${c.green}APLICAR CAMBIOS` : `${c.yellow}DRY-RUN (sin cambios)`}${c.reset}`);
  log(`Archivos encontrados: ${files.length}\n`);

  let migrated = 0;
  let skipped  = 0;
  let manual   = 0;

  for (const filePath of files) {
    const name = path.basename(filePath);
    log(`── ${name}`, c.cyan);

    const { transformed, newSrc, details } = transformFile(filePath);

    for (const d of details) log(d, c.dim);

    if (transformed) {
      if (APPLY) {
        // Backup
        fs.copyFileSync(filePath, filePath + '.bak');
        fs.writeFileSync(filePath, newSrc, 'utf8');
        log(`  💾 Guardado (backup en ${name}.bak)`, c.green);
      } else {
        log(`  → Se aplicaría la transformación`, c.yellow);
        // Mostrar diff resumido
        const flagLine = newSrc.split('\n').find(l => l.includes('Initialized = false'));
        if (flagLine) log(`  + ${flagLine.trim()}`, c.dim);
      }
      migrated++;
    } else if (details.some(d => d.includes('revisar manualmente'))) {
      manual++;
    } else {
      skipped++;
    }

    log('');
  }

  // ── Resumen ──
  log('─'.repeat(50));
  log(`${c.bold}Resumen:${c.reset}`);
  log(`  ✅ Transformados: ${migrated}`, c.green);
  log(`  ⏭  Ya migrados / sin cambios: ${skipped}`, c.dim);
  if (manual > 0) log(`  ⚠  Revisión manual requerida: ${manual}`, c.yellow);

  if (!APPLY && migrated > 0) {
    log(`\n${c.yellow}Para aplicar los cambios ejecuta:${c.reset}`);
    log(`  node migrate-lazy-views.js --apply\n`);
  }

  if (APPLY && migrated > 0) {
    log(`\n${c.green}✔ Migración completada.${c.reset}`);
    log(`Los .bak son tus backups — borrá una vez que confirmes que todo funciona.\n`);
  }
}

main();
