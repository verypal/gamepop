import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";           // 👈 prevent build-time eval
export const runtime = "nodejs";


export async function POST(req: Request) {
  //const sig = headers().get("stripe-signature") as string;
  //const rawBody = await req.text();

  const hdrs = await headers();                            // 👈 await it
  const sig = hdrs.get("stripe-signature") as string;      // 👈 now .get works
  const rawBody = await req.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

  
try {
    const evt = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (evt.type === "checkout.session.completed") {
      const s = evt.data.object as Stripe.Checkout.Session;
      const sessionId = s.metadata?.gamepop_session_id;
      const payerName = s.customer_details?.name || "Player";

      if (sessionId) {
        const { data: current } = await supabase
          .from("sessions").select("spots_left, roster").eq("id", sessionId).single();

        const newSpots = Math.max(0, (current?.spots_left ?? 0) - 1);
        const newRoster = [...(current?.roster ?? []), payerName];

        await supabase.from("sessions")
          .update({ spots_left: newSpots, roster: newRoster })
          .eq("id", sessionId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Webhook verify failed: ${msg}` }, { status: 400 }); 
  }
}
