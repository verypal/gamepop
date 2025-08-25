import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";


export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    //build-time safe: create clients inside handler. 
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // (Optional) dynamic origin if you want to avoid APP_BASE_URL
    const hdrs = headers();
    const proto = hdrs.get("x-forwarded-proto") ?? "http";
    const host  = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
    const origin = `${proto}://${host}`;


    const { data: s, error } = await supabase
      .from("sessions")
      .select("id,title,payg_price_cents")
      .eq("id", sessionId)
      .single();

    if (error || !s || !s.payg_price_cents)
      return NextResponse.json({ error: "Session not found or missing price" }, { status: 400 });

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "gbp",
          unit_amount: s.payg_price_cents,
          product_data: { name: s.title }
        },
        quantity: 1
      }],
      customer_creation: "if_required",
      success_url: `${process.env.APP_BASE_URL}/success?cs={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}/s/${s.id}`,
      metadata: { gamepop_session_id: s.id }
    });

    return NextResponse.json({ url: checkout.url });
 } catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  return NextResponse.json({ error: message }, { status: 500 });
}

}
