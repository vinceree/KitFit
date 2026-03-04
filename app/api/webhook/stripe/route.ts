import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/client";
import type { PlanTier } from "@/lib/supabase/types";
import Stripe from "stripe";

// Map Stripe price IDs to plan tiers
function getPlanTierFromPriceId(priceId: string): PlanTier {
  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
  const growthPriceId = process.env.STRIPE_GROWTH_PRICE_ID;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

  if (priceId === proPriceId) return "pro";
  if (priceId === growthPriceId) return "growth";
  if (priceId === starterPriceId) return "starter";
  return "starter";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const brandId = session.metadata?.brand_id;

      if (brandId) {
        await supabase
          .from("brands")
          .update({ stripe_customer_id: customerId })
          .eq("id", brandId);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id;

      if (priceId) {
        const planTier = getPlanTierFromPriceId(priceId);
        await supabase
          .from("brands")
          .update({ plan_tier: planTier })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from("brands")
        .update({ plan_tier: "starter" })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
