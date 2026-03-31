# PsicoApp

SaaS de gestión para psicólogos — Agenda · Pacientes · Pagos · WhatsApp · Informes IA · Pericias

## Stack
- **Frontend:** Vanilla JS SPA (single `index.html` + views separados)
- **Backend:** Supabase (auth + postgres + storage)
- **Deploy:** cualquier hosting estático (Netlify, Vercel, Hostinger, etc.)

## Setup local

```bash
# 1. Clonar
git clone <repo>
cd psicoapp

# 2. Configurar credenciales
cp config.example.js config.js
# Editar config.js con tu URL y anon key de Supabase, y tu link de pago
```

## Deploy

Subir todos los archivos al hosting. Asegurarse de incluir `config.js` (está en `.gitignore` para el repo, pero se sube al server).

## Estructura de archivos

```
index.html              ← Shell SPA: layout, router, auth guard
config.js               ← Secrets (NO subir al repo, sí al server)
config.example.js       ← Plantilla pública
suscripcion-control.js  ← Lógica de planes: FREE / PRO / MAX
view-dashboard.js       ← Dashboard con métricas financieras
view-agenda.js          ← Agenda semanal/mensual con turnos
view-pacientes.js       ← ABM de pacientes
view-historia.js        ← Historia clínica por paciente
view-whatsapp.js        ← Mensajería WhatsApp con plantillas
view-pagos.js           ← Registro y reporte de cobros
view-informes.js        ← Generador de informes con IA
view-pericias.js        ← Gestión de pericias judiciales
view-cuenta.js          ← Suscripción: ver plan, upgrades, logout
view-perfil.js          ← Perfil del profesional
```

## Planes

| Plan | Precio | WhatsApp | Informes IA | Duración |
|------|--------|----------|-------------|----------|
| Free | $0     | 20 msg   | 1           | 15 días  |
| Pro  | $XX/mes | 100 msg | 3           | Mensual  |
| Max  | $XX/mes | 250 msg | 25          | Mensual  |

Los extras de WhatsApp se compran desde la vista Suscripción (+100 msg por bloque).

## Tablas Supabase requeridas

- `profiles` — `id, plan, wa_usos, wa_extra`
- `pacientes` — `id, user_id, nombre, apellido, telefono, email, ...`
- `turnos` — `id, user_id, paciente_id, fecha, hora, duracion, estado, precio, tipo`
- `pagos` — `id, user_id, paciente_id, turno_id, monto, fecha, metodo`
- `mensajes_wa` — `id, user_id, paciente_id, tipo, texto, created_at`
- `pericias` — `id, user_id, expediente, tribunal, estado, ...`

## Seguridad importante

- Los planes se sincronizan desde Supabase al login (no solo localStorage).
- El campo `plan` en `profiles` debe estar protegido con RLS en Supabase: solo el backend/admin puede modificarlo.
- La activación manual de plan (botón "Ya pagué") escribe en Supabase y requiere validación manual por el admin hasta implementar webhook de MercadoPago.
