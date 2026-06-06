import { CountryConfig, CountryResult, TaxLine } from "../types";

const PAYE_THRESHOLD = 42000;
const PERSONAL_TAX_CREDIT = 1875;

const USC_BRACKETS = [
  { upTo: 12012, rate: 0.005 },
  { upTo: 25760, rate: 0.02 },
  { upTo: 70044, rate: 0.04 },
  { upTo: Infinity, rate: 0.08 },
];

function calcUSC(annual: number): number {
  let total = 0, prev = 0;
  for (const b of USC_BRACKETS) {
    if (annual <= prev) break;
    total += (Math.min(annual, b.upTo) - prev) * b.rate;
    prev = b.upTo;
  }
  return total;
}

function calculate(grossAnnual: number): CountryResult {
  const payeGross =
    Math.min(grossAnnual, PAYE_THRESHOLD) * 0.2 +
    Math.max(0, grossAnnual - PAYE_THRESHOLD) * 0.4;
  const paye = Math.max(0, payeGross - PERSONAL_TAX_CREDIT);
  const usc = calcUSC(grossAnnual);
  const prsi = grossAnnual * 0.04;

  const netAnnual = grossAnnual - paye - usc - prsi;
  const netMonthly = netAnnual / 12;
  const grossMonthly = grossAnnual / 12;
  const effectiveTaxRate = grossAnnual > 0 ? (paye + usc + prsi) / grossAnnual : 0;

  const monthlyLines: TaxLine[] = [
    { label: "Salário bruto mensal", value: grossMonthly, type: "gross" },
    { label: "PAYE", sublabel: "Imposto de Renda (bruto)", value: payeGross / 12, type: "deduction" },
    { label: "Tax Credits", sublabel: "Crédito pessoal", value: PERSONAL_TAX_CREDIT / 12, type: "credit" },
    { label: "USC", sublabel: "Universal Social Charge", value: usc / 12, type: "deduction" },
    { label: "PRSI", sublabel: "Seguro social (4%)", value: prsi / 12, type: "deduction" },
    { label: "Líquido mensal", value: netMonthly, type: "net" },
  ];

  const annualLines: TaxLine[] = [
    { label: "Salário bruto anual", value: grossAnnual, type: "gross" },
    { label: "PAYE", sublabel: "Imposto de Renda (bruto)", value: payeGross, type: "deduction" },
    { label: "Tax Credits", sublabel: "Crédito pessoal", value: PERSONAL_TAX_CREDIT, type: "credit" },
    { label: "USC", sublabel: "Universal Social Charge", value: usc, type: "deduction" },
    { label: "PRSI", sublabel: "Seguro social (4%)", value: prsi, type: "deduction" },
    { label: "Líquido anual", value: netAnnual, type: "net" },
  ];

  return { grossMonthly, grossAnnual, netMonthly, netAnnual, effectiveTaxRate, monthlyLines, annualLines };
}

export const irelandPAYE: CountryConfig = {
  id: "ireland-paye",
  flag: "🇮🇪",
  country: "Irlanda",
  modality: "PAYE",
  modalityNote: "Pay As You Earn (empregado)",
  currency: "EUR",
  currencySymbol: "€",
  city: "Dublin",
  inputLabel: "Salário bruto anual",
  inputPlaceholder: "80.000",
  inputPeriod: "annual",
  eurPerUnit: 1,
  purchasingPowerIndex: 80,
  costOfLiving: [
    { label: "Aluguel 1-quarto (centro)", monthly: 2400 },
    { label: "Aluguel 1-quarto (fora do centro)", monthly: 1800 },
    { label: "Alimentação mensal", monthly: 500 },
    { label: "Transporte público", monthly: 145 },
    { label: "Internet + celular", monthly: 80 },
    { label: "Saúde (seguro privado)", monthly: 150 },
    { label: "Lazer e entretenimento", monthly: 400 },
  ],
  benefits: {
    "13º salário": { description: "Não usual no mercado", positive: false },
    "Férias": { description: "20 dias úteis (mínimo legal)", positive: true },
    "Vale-refeição / alimentação": { description: "Meal allowance €10,14/dia", positive: true },
    "Plano de saúde": { description: "HSE público gratuito", positive: true },
    "FGTS / Previdência": { description: "Pension 5%+ (disponível agora)", positive: true },
    "Licença parental": { description: "26 semanas (mãe) / 9 semanas (pai)", positive: true },
    "Estabilidade / aviso prévio": { description: "Notice period 1–8 semanas", positive: false },
  },
  calculate,
};
