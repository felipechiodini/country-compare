export type Period = "monthly" | "annual";

export type TaxLineType = "gross" | "deduction" | "credit" | "extra" | "net";

export interface TaxLine {
  label: string;
  sublabel?: string;
  value: number;
  type: TaxLineType;
}

export interface CountryResult {
  grossMonthly: number;
  grossAnnual: number;
  netMonthly: number;
  netAnnual: number;
  effectiveTaxRate: number;
  monthlyLines: TaxLine[];
  annualLines: TaxLine[];
}

export interface CostItem {
  id: string;
  monthly: number; // in local currency
}

export interface CountryConfig {
  id: string;
  flag: string;
  country: string;
  modality: string;         // "CLT", "PJ", "PAYE" …
  modalityNote?: string;    // short description shown in the select
  currency: string;         // "BRL", "EUR" …
  currencySymbol: string;   // "R$", "€" …
  inputLabelBase: string;  // e.g. "Salário bruto" — period suffix added by the component
  inputPlaceholder: string;
  inputPeriod: "monthly" | "annual";
  baseRate: number;              // 1 local unit → common base (USD-ish) for cross-currency math
  purchasingPowerIndex: number;  // World Bank PPP, US = 100
  costOfLiving: CostItem[];
  benefits: Record<string, { description: string; positive: boolean }>;
  calculate: (grossInput: number) => CountryResult;
}
