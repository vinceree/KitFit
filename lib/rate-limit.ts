import type { PlanTier } from "./supabase/types";

/** Monthly try-on limits per plan tier */
const PLAN_LIMITS: Record<PlanTier, number> = {
  starter: 500,
  growth: 2000,
  pro: 10000,
};

export function getMonthlyLimit(tier: PlanTier): number {
  return PLAN_LIMITS[tier] ?? 500;
}
