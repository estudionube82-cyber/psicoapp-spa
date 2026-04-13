/**
 * config.example.js — PsicoApp
 *
 * Copiá este archivo como "config.js" y completá los valores reales.
 * NUNCA subas config.js al repositorio (está en .gitignore).
 *
 * En producción (Vercel/Netlify) estas variables se inyectan como
 * Environment Variables en el panel del hosting.
 */
const PSICOAPP_CONFIG = {
  // ── Supabase ──────────────────────────────────────────────────
  // Panel Supabase → Project Settings → API
  SUPA_URL: '',   // ej: https://xyzxyzxyz.supabase.co
  SUPA_KEY: '',   // anon / public key

  // ── Links de pago Mercado Pago ────────────────────────────────
  // Panel MP → Cobros → Cobrar con link → Crear link
  LINK_PAGO_PRO:   '',   // Plan Pro  (~$18.000/mes)
  LINK_PAGO_MAX:   '',   // Plan Max  (~$24.000/mes)
  LINK_PAGO_EXTRA: '',   // Pack WA extra (~$5.000)
};
