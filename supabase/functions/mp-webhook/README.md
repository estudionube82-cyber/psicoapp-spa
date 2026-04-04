# Webhook Mercado Pago — Deploy Guide

## 1. Requisitos previos

```bash
npm install -g supabase
supabase login
supabase link --project-ref terlbqrcampdqtxjbihg
```

---

## 2. Configurar variables de entorno en Supabase

Panel Supabase → **Settings → Edge Functions → Secrets**

Agregar estos 3 secrets:

| Nombre | Valor |
|--------|-------|
| `MP_ACCESS_TOKEN` | Tu Access Token de **producción** de Mercado Pago |
| `SUPABASE_URL` | `https://terlbqrcampdqtxjbihg.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Panel Supabase → Settings → API → `service_role` key |

---

## 3. Deploy de la Edge Function

Desde la raíz del proyecto:

```bash
supabase functions deploy mp-webhook --no-verify-jwt
```

`--no-verify-jwt` es obligatorio: Mercado Pago no envía JWT de Supabase.

URL resultante:
```
https://terlbqrcampdqtxjbihg.supabase.co/functions/v1/mp-webhook
```

---

## 4. Configurar webhook en Mercado Pago

1. Ir a **mercadopago.com.ar → Tu negocio → Configuración → Webhooks**
2. Clic en **Agregar nueva URL de webhook**
3. Completar:
   - **URL:** `https://terlbqrcampdqtxjbihg.supabase.co/functions/v1/mp-webhook`
   - **Eventos:** tildar solo `Pagos`
4. Guardar → MP hace un GET automático para validar (la función responde 200 OK)

---

## 5. Verificar que funciona

Supabase → **Edge Functions → mp-webhook → Logs**

Después de un pago real o de prueba deberías ver:
```
[mp-webhook] Plan pro activado para usuario@email.com (payment 12345678)
```

---

## 6. Requisito: columna `email` en tabla `profiles`

La función busca usuarios por `profiles.email`. Verificar que existe:

```sql
-- Ejecutar en Supabase SQL Editor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Poblar con emails existentes (solo si la columna estaba vacía)
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
```

---

## 7. Lógica de planes por monto

| Monto pagado | Plan activado |
|--------------|--------------|
| < $24.000    | Pro          |
| ≥ $24.000    | Max          |
