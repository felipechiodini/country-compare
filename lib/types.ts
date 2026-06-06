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
  label: string;
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
  city: string;
  inputLabel: string;
  inputPlaceholder: string;
  inputPeriod: "monthly" | "annual";
  eurPerUnit: number;            // 1 local unit → how many EUR
  purchasingPowerIndex: number;  // World Bank PPP, US = 100
  costOfLiving: CostItem[];
  benefits: Record<string, { description: string; positive: boolean }>;
  calculate: (grossInput: number) => CountryResult;
}
