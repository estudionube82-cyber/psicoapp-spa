import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MP_ACCESS_TOKEN      = Deno.env.get('MP_ACCESS_TOKEN')!

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function getPlan(amount: number): 'pro' | 'max' {
  return amount >= 24000 ? 'max' : 'pro'
}

function expiresAt(): string {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
}

serve(async (req) => {
  // MP hace GET para validar el endpoint al configurarlo
  if (req.method === 'GET') {
    return new Response('OK', { status: 200 })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: { type?: string; data?: { id?: string } }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // Solo procesamos eventos de pago
  if (body.type !== 'payment' || !body.data?.id) {
    return new Response('Ignored', { status: 200 })
  }

  const paymentId = body.data.id

  // Consultar pago a la API de Mercado Pago
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
  })

  if (!mpRes.ok) {
    console.error(`[mp-webhook] MP API error: ${mpRes.status}`)
    return new Response('MP API error', { status: 200 }) // 200 para que MP no reintente
  }

  const payment = await mpRes.json()

  // Solo procesar pagos aprobados
  if (payment.status !== 'approved') {
    return new Response('Payment not approved', { status: 200 })
  }

  const email  = payment.payer?.email as string | undefined
  const amount = payment.transaction_amount as number

  if (!email) {
    console.error('[mp-webhook] No email in payment payload')
    return new Response('No email', { status: 200 })
  }

  const plan      = getPlan(amount)
  const expiresAt_ = expiresAt()

  // Buscar usuario en profiles por email (NO usa listUsers)
  const { data: profile, error: profileErr } = await sb
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (profileErr || !profile) {
    console.error('[mp-webhook] Profile not found for email:', email, profileErr?.message)
    return new Response('Profile not found', { status: 200 })
  }

  const userId = profile.id

  // Upsert en users_plan
  const { error: upsertErr } = await sb
    .from('users_plan')
    .upsert(
      {
        user_id:        userId,
        plan,
        status:         'active',
        expires_at:     expiresAt_,
        mp_payment_id:  String(paymentId),
        updated_at:     new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (upsertErr) {
    console.error('[mp-webhook] upsert users_plan error:', upsertErr.message)
    return new Response('DB error', { status: 500 })
  }

  // Sincronizar plan en profiles también
  await sb
    .from('profiles')
    .update({ plan })
    .eq('id', userId)

  console.log(`[mp-webhook] Plan ${plan} activado para ${email} (payment ${paymentId})`)
  return new Response('OK', { status: 200 })
})
