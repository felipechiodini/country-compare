export interface ComparisonCurrency {
  code: string;
  symbol: string;
  name: string;
  rateFromBase: number; // 1 EUR (base) → this many units of this currency (approx 2025)
}

export const COMPARISON_CURRENCIES: ComparisonCurrency[] = [
  { code: "USD", symbol: "$",  name: "Dólar (USD)", rateFromBase: 1.08 },
  { code: "EUR", symbol: "€",  name: "Euro (EUR)",  rateFromBase: 1 },
  { code: "BRL", symbol: "R$", name: "Real (BRL)",  rateFromBase: 6.20 },
  { code: "GBP", symbol: "£",  name: "Libra (GBP)", rateFromBase: 0.86 },
];
