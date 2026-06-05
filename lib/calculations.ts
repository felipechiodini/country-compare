import {
  BRAZIL_INSS_BRACKETS,
  BRAZIL_INSS_MAX,
  BRAZIL_IRPF_BRACKETS,
  IRELAND_PAYE_THRESHOLD,
  IRELAND_PAYE_STANDARD_RATE,
  IRELAND_PAYE_HIGHER_RATE,
  IRELAND_PERSONAL_TAX_CREDIT,
  IRELAND_USC_BRACKETS,
  IRELAND_PRSI_RATE,
  EXCHANGE_RATE_BRL_EUR,
} from "./data";

export interface BrazilResult {
  grossMonthly: number;
  grossAnnual: number;
  inss: number;
  irpf: number;
  netMonthly: number;
  netAnnual: number; // includes 13th + vacation bonus
  effectiveTaxRate: number;
  thirteenth: number;
  vacationBonus: number;
  // in EUR for comparison
  netMonthlyEUR: number;
  netAnnualEUR: number;
}

export type Period = "monthly" | "annual";

export interface IrelandResult {
  grossAnnual: number;
  grossMonthly: number;
  payeGross: number;   // PAYE antes dos créditos
  paye: number;        // PAYE líquido (já descontados os créditos)
  usc: number;
  prsi: number;
  taxCredits: number;
  netAnnual: number;
  netMonthly: number;
  effectiveTaxRate: number;
  // in BRL for comparison
  netMonthlyBRL: number;
  netAnnualBRL: number;
}

function calcBrazilINSS(gross: number): number {
  let inss = 0;
  let prev = 0;
  for (const bracket of BRAZIL_INSS_BRACKETS) {
    if (gross <= prev) break;
    const taxable = Math.min(gross, bracket.upTo) - prev;
    inss += taxable * bracket.rate;
    prev = bracket.upTo;
  }
  return Math.min(inss, BRAZIL_INSS_MAX);
}

function calcBrazilIRPF(grossAfterINSS: number): number {
  for (const bracket of BRAZIL_IRPF_BRACKETS) {
    if (grossAfterINSS <= bracket.upTo) {
      return Math.max(0, grossAfterINSS * bracket.rate - bracket.deduction);
    }
  }
  return 0;
}

export function calcBrazil(grossMonthly: number): BrazilResult {
  const inss = calcBrazilINSS(grossMonthly);
  const baseIRPF = grossMonthly - inss;
  const irpf = calcBrazilIRPF(baseIRPF);

  const netMonthly = grossMonthly - inss - irpf;
  const thirteenth = netMonthly; // 13th salary ≈ 1 net monthly
  const vacationBonus = grossMonthly / 3; // 1/3 of gross (taxed, simplified)
  const netAnnual = netMonthly * 12 + thirteenth + vacationBonus;
  const grossAnnual = grossMonthly * 13 + vacationBonus; // 13 months + bonus

  const totalTax = (inss + irpf) * 12;
  const effectiveTaxRate = totalTax / (grossMonthly * 12);

  return {
    grossMonthly,
    grossAnnual,
    inss,
    irpf,
    netMonthly,
    netAnnual,
    effectiveTaxRate,
    thirteenth,
    vacationBonus,
    netMonthlyEUR: netMonthly / EXCHANGE_RATE_BRL_EUR,
    netAnnualEUR: netAnnual / EXCHANGE_RATE_BRL_EUR,
  };
}

function calcIrelandUSC(annual: number): number {
  let usc = 0;
  let prev = 0;
  for (const bracket of IRELAND_USC_BRACKETS) {
    if (annual <= prev) break;
    const taxable = Math.min(annual, bracket.upTo) - prev;
    usc += taxable * bracket.rate;
    prev = bracket.upTo;
  }
  return usc;
}

export function calcIreland(grossAnnual: number): IrelandResult {
  // PAYE
  const standardBand = Math.min(grossAnnual, IRELAND_PAYE_THRESHOLD);
  const higherBand = Math.max(0, grossAnnual - IRELAND_PAYE_THRESHOLD);
  const payeBeforeCredits =
    standardBand * IRELAND_PAYE_STANDARD_RATE +
    higherBand * IRELAND_PAYE_HIGHER_RATE;
  const taxCredits = IRELAND_PERSONAL_TAX_CREDIT;
  const paye = Math.max(0, payeBeforeCredits - taxCredits);

  const usc = calcIrelandUSC(grossAnnual);
  const prsi = grossAnnual * IRELAND_PRSI_RATE;

  const netAnnual = grossAnnual - paye - usc - prsi;
  const netMonthly = netAnnual / 12;
  const grossMonthly = grossAnnual / 12;

  const totalTax = paye + usc + prsi;
  const effectiveTaxRate = totalTax / grossAnnual;

  return {
    grossAnnual,
    grossMonthly,
    payeGross: payeBeforeCredits,
    paye,
    usc,
    prsi,
    taxCredits,
    netAnnual,
    netMonthly,
    effectiveTaxRate,
    netMonthlyBRL: netMonthly * EXCHANGE_RATE_BRL_EUR,
    netAnnualBRL: netAnnual * EXCHANGE_RATE_BRL_EUR,
  };
}

// PPP-adjusted comparison: purchasing power parity index
// Ireland PPP factor relative to Brazil (approximate, World Bank 2024)
// A dollar in Ireland buys ~0.55x vs Brazil (Ireland is ~80% more expensive)
export const PPP_IRELAND_VS_BRAZIL = 0.55;

export function purchasingPowerBRL(irelandNetEUR: number): number {
  const inBRL = irelandNetEUR * EXCHANGE_RATE_BRL_EUR;
  return inBRL * PPP_IRELAND_VS_BRAZIL;
}
