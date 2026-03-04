import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLAN_PRICES: Record<string, { name: string; priceId: string; amount: number }> = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "",
    amount: 19900, // €199
  },
  growth: {
    name: "Growth",
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || "",
    amount: 49900, // €499
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    amount: 99900, // €999
  },
};
