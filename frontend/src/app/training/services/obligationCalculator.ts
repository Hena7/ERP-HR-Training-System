/**
 * Training Service Obligation Calculator
 *
 * Rules (cost in ETB):
 *  200,000 –  400,000 : base  6 months, +1 month per 34,000 above 200,000, max 12 months
 *  400,001 –  800,000 : base 12 months, +1 month per 34,000 above 400,000, max 24 months
 *  800,001 – 1,200,000: base 24 months, +1 month per 34,000 above 800,000, max 36 months
 *1,200,001 – 1,600,000: base 36 months, +1 month per 34,000 above 1,200,000, max 48 months
 *1,600,001 – 2,000,000: base 48 months, +1 month per 34,000 above 1,600,000, max 60 months
 *2,000,001 – 2,600,000: base 60 months, +1 month per 50,000 above 2,000,000, max 72 months
 *2,600,001+            : base 84 months, +1 month per 100,000 above 2,600,000, max 120 months
 */

export interface ObligationResult {
  months: number;
  years: number;
  remainderMonths: number;
  label: string;
  requiresContract: boolean;
}

const TIERS = [
  { from: 200_000, to: 400_000, baseMonths: 6, step: 34_000, maxMonths: 12 },
  { from: 400_000, to: 800_000, baseMonths: 12, step: 34_000, maxMonths: 24 },
  { from: 800_000, to: 1_200_000, baseMonths: 24, step: 34_000, maxMonths: 36 },
  { from: 1_200_000, to: 1_600_000, baseMonths: 36, step: 34_000, maxMonths: 48 },
  { from: 1_600_000, to: 2_000_000, baseMonths: 48, step: 34_000, maxMonths: 60 },
  { from: 2_000_000, to: 2_600_000, baseMonths: 60, step: 50_000, maxMonths: 72 },
  { from: 2_600_000, to: Infinity, baseMonths: 84, step: 100_000, maxMonths: 120 },
];

export function calculateObligation(cost: number): ObligationResult {
  if (cost < 200_000) {
    return {
      months: 0,
      years: 0,
      remainderMonths: 0,
      label: "No obligation (below 200,000 ETB)",
      requiresContract: false,
    };
  }

  // Find the appropriate tier based on cost
  const tier = TIERS.find((t) => cost > t.from && cost <= t.to) || 
               (cost === 200_000 ? TIERS[0] : TIERS[TIERS.length - 1]);

  if (!tier) {
    return { months: 0, years: 0, remainderMonths: 0, label: "Unable to calculate", requiresContract: false };
  }

  const excess = cost - tier.from;
  const extra = Math.floor(excess / tier.step);
  const months = Math.min(tier.baseMonths + extra, tier.maxMonths);
  const years = Math.floor(months / 12);
  const remainderMonths = months % 12;

  const yearsLabel = years > 0 ? `${years} year${years > 1 ? "s" : ""}` : "";
  const monthsLabel = remainderMonths > 0 ? `${remainderMonths} month${remainderMonths > 1 ? "s" : ""}` : "";
  const label = [yearsLabel, monthsLabel].filter(Boolean).join(" and ");

  return { months, years, remainderMonths, label, requiresContract: true };
}

export function formatCost(n: number): string {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
