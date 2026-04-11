import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const body = await req.json();

    if (body.type !== "payment") {
      return new Response("ignored", { status: 200 });
    }

    const paymentId = body.data.id;

    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");

    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const payment = await paymentRes.json();

    if (payment.status !== "approved") {
      return new Response("not approved", { status: 200 });
    }

    const metadata = payment.metadata;
    const user_id = metadata.user_id;
    const plan = metadata.plan;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const sb = createClient(supabaseUrl, supabaseKey);

    // ACTIVAR PLAN
    await sb.from("users_plan").upsert({
      user_id,
      plan,
      status: "active",
      updated_at: new Date().toISOString(),
    });

    return new Response("ok", { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("error", { status: 500 });
  }
});
