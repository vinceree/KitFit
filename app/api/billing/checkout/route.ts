import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/client";
import { stripe, PLAN_PRICES } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await request.json();

  const planConfig = PLAN_PRICES[plan];
  if (!planConfig || !planConfig.priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // If they already have a Stripe customer, create portal session
  if (brand.stripe_customer_id) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: brand.stripe_customer_id,
      return_url: `${appUrl}/dashboard/billing`,
    });
    return NextResponse.json({ url: portalSession.url });
  }

  // Otherwise create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    metadata: { brand_id: userData.user.id },
    customer_email: brand.email,
  });

  return NextResponse.json({ url: session.url });
}
