import { CountryConfig, CountryResult, TaxLine } from "../types";

const INSS_BRACKETS = [
  { upTo: 1412.0, rate: 0.075 },
  { upTo: 2666.68, rate: 0.09 },
  { upTo: 4000.03, rate: 0.12 },
  { upTo: 7786.02, rate: 0.14 },
];
const INSS_MAX = 908.96;

const IRPF_BRACKETS = [
  { upTo: 2259.2, rate: 0, deduction: 0 },
  { upTo: 2826.65, rate: 0.075, deduction: 169.44 },
  { upTo: 3751.05, rate: 0.15, deduction: 381.44 },
  { upTo: 4664.68, rate: 0.225, deduction: 662.77 },
  { upTo: Infinity, rate: 0.275, deduction: 896.0 },
];

function calcINSS(gross: number): number {
  let total = 0, prev = 0;
  for (const b of INSS_BRACKETS) {
    if (gross <= prev) break;
    total += (Math.min(gross, b.upTo) - prev) * b.rate;
    prev = b.upTo;
  }
  return Math.min(total, INSS_MAX);
}

function calcIRPF(base: number): number {
  for (const b of IRPF_BRACKETS) {
    if (base <= b.upTo) return Math.max(0, base * b.rate - b.deduction);
  }
  return 0;
}

function calculate(grossMonthly: number): CountryResult {
  const inss = calcINSS(grossMonthly);
  const irpf = calcIRPF(grossMonthly - inss);
  const netMonthly = grossMonthly - inss - irpf;
  const thirteenth = netMonthly;
  const vacationBonus = grossMonthly / 3;
  const netAnnual = netMonthly * 12 + thirteenth + vacationBonus;
  const grossAnnual = grossMonthly * 13 + vacationBonus;
  const effectiveTaxRate = grossMonthly > 0 ? (inss + irpf) / grossMonthly : 0;

  const monthlyLines: TaxLine[] = [
    { label: "Salário bruto mensal", value: grossMonthly, type: "gross" },
    { label: "INSS", sublabel: "Previdência social", value: inss, type: "deduction" },
    { label: "IRPF", sublabel: "Imposto de Renda", value: irpf, type: "deduction" },
    { label: "Líquido mensal", value: netMonthly, type: "net" },
  ];

  const annualLines: TaxLine[] = [
    { label: "Bruto anual (12 meses)", value: grossMonthly * 12, type: "gross" },
    { label: "INSS anual", sublabel: "Previdência social", value: inss * 12, type: "deduction" },
    { label: "IRPF anual", sublabel: "Imposto de Renda", value: irpf * 12, type: "deduction" },
    { label: "Líquido base anual", value: netMonthly * 12, type: "net" },
    { label: "+ 13º salário", sublabel: "Líquido, pago em dezembro", value: thirteenth, type: "extra" },
    { label: "+ Abono de férias", sublabel: "1/3 do salário bruto", value: vacationBonus, type: "extra" },
    { label: "Líquido total anual", value: netAnnual, type: "net" },
  ];

  return { grossMonthly, grossAnnual, netMonthly, netAnnual, effectiveTaxRate, monthlyLines, annualLines };
}

export const brazilCLT: CountryConfig = {
  id: "brazil-clt",
  flag: "🇧🇷",
  country: "Brasil",
  modality: "CLT",
  modalityNote: "Consolidação das Leis do Trabalho",
  currency: "BRL",
  currencySymbol: "R$",
  inputLabelBase: "Salário bruto",
  inputPlaceholder: "15.000",
  inputPeriod: "monthly",
  baseRate: 1 / 6.2,
  purchasingPowerIndex: 44,
  costOfLiving: [
    { id: "moradia",    monthly: 3500 },
    { id: "comida",     monthly: 1500 },
    { id: "saude",      monthly: 600 },
    { id: "transporte", monthly: 400 },
  ],
  benefits: {
    "13º salário": { description: "Sim (obrigatório por lei)", positive: true },
    "Férias": { description: "30 dias + 1/3 adicional", positive: true },
    "Vale-refeição / alimentação": { description: "Comum (R$ 800–1.500/mês)", positive: true },
    "Plano de saúde": { description: "Empresa paga total ou parcial", positive: true },
    "FGTS / Previdência": { description: "FGTS 8% (resgatável ao demitir)", positive: false },
    "Licença parental": { description: "126 dias (mãe) / 20 dias (pai)", positive: false },
    "Estabilidade / aviso prévio": { description: "Aviso prévio proporcional", positive: true },
  },
  calculate,
};
