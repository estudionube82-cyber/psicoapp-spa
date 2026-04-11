import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function expiresAt(): string {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

function inferPlan(metadataPlan: unknown, amount: number): "pro" | "max" {
  if (metadataPlan === "pro" || metadataPlan === "max") return metadataPlan;
  return amount >= 24000 ? "max" : "pro";
}

serve(async (req) => {
  if (req.method === "GET") {
    return new Response("OK", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();

    if (body?.type !== "payment" || !body?.data?.id) {
      return new Response("ignored", { status: 200 });
    }

    const paymentId = String(body.data.id);

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    if (!paymentRes.ok) {
      console.error(`[mp-webhook] MP API error: ${paymentRes.status} paymentId=${paymentId}`);
      return new Response("mp api error", { status: 200 });
    }

    const payment = await paymentRes.json();

    if (payment?.status !== "approved") {
      console.log(`[mp-webhook] payment not approved: ${payment?.status} paymentId=${paymentId}`);
      return new Response("not approved", { status: 200 });
    }

    const metadata = payment?.metadata || {};
    const payerEmail = payment?.payer?.email as string | undefined;
    const amount = Number(payment?.transaction_amount || 0);
    const currencyId = String(payment?.currency_id || "");
    const metadataPlan = metadata?.plan as string | undefined;

    if (currencyId !== "ARS") {
      console.log(`[mp-webhook] ignored currency=${currencyId} paymentId=${paymentId}`);
      return new Response("ignored currency", { status: 200 });
    }

    if (metadataPlan === "pro" && amount < 12000) {
      console.log(`[mp-webhook] invalid amount for pro amount=${amount} paymentId=${paymentId}`);
      return new Response("invalid amount", { status: 200 });
    }

    if (metadataPlan === "max" && amount < 24000) {
      console.log(`[mp-webhook] invalid amount for max amount=${amount} paymentId=${paymentId}`);
      return new Response("invalid amount", { status: 200 });
    }

    let userId = (metadata?.user_id as string | undefined) || null;
    const plan = inferPlan(metadataPlan, amount);

    if (!userId && payerEmail) {
      const { data: profileByEmail, error: profileErr } = await sb
        .from("profiles")
        .select("id")
        .eq("email", payerEmail)
        .maybeSingle();

      if (profileErr) {
        console.error(`[mp-webhook] profile lookup error email=${payerEmail}: ${profileErr.message}`);
      }

      userId = profileByEmail?.id || null;
    }

    if (!userId) {
      console.error(`[mp-webhook] user_id not found for paymentId=${paymentId}`);
      return new Response("user not found", { status: 200 });
    }

    const expires_at = expiresAt();

    const { data: existingPayment, error: existingPaymentErr } = await sb
      .from("users_plan")
      .select("user_id")
      .eq("mp_payment_id", paymentId)
      .maybeSingle();

    if (existingPaymentErr) {
      console.error(`[mp-webhook] duplicate check error paymentId=${paymentId}: ${existingPaymentErr.message}`);
    }

    if (existingPayment) {
      console.log(`[mp-webhook] duplicate payment ignored paymentId=${paymentId}`);
      return new Response("duplicate ignored", { status: 200 });
    }

    const { error: upsertErr } = await sb.from("users_plan").upsert(
      {
        user_id: userId,
        plan,
        status: "active",
        expires_at,
        mp_payment_id: paymentId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (upsertErr) {
      console.error(`[mp-webhook] users_plan upsert error userId=${userId}: ${upsertErr.message}`);
      return new Response("db error", { status: 500 });
    }

    const { error: profileUpdateErr } = await sb
      .from("profiles")
      .update({ plan })
      .eq("id", userId);

    if (profileUpdateErr) {
      console.error(`[mp-webhook] profiles plan update error userId=${userId}: ${profileUpdateErr.message}`);
    }

    console.log(`[mp-webhook] plan activated userId=${userId} plan=${plan} paymentId=${paymentId}`);
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("[mp-webhook] unexpected error:", err);
    return new Response("error", { status: 500 });
  }
});