import { CountryConfig, CountryResult, TaxLine } from "../types";

// Simples Nacional Anexo V 2024 (típico para serviços de TI)
const SIMPLES_BRACKETS = [
  { upTo: 180000,    rate: 0.155, deduction: 0 },
  { upTo: 360000,    rate: 0.180, deduction: 4500 },
  { upTo: 720000,    rate: 0.195, deduction: 9900 },
  { upTo: 1440000,   rate: 0.205, deduction: 17100 },
  { upTo: 3600000,   rate: 0.230, deduction: 62100 },
];

function calcSimples(rbt12: number): number {
  for (const b of SIMPLES_BRACKETS) {
    if (rbt12 <= b.upTo) {
      if (b.deduction === 0) return b.rate;
      return (rbt12 * b.rate - b.deduction) / rbt12;
    }
  }
  return 0.30; // acima do limite do Simples
}

function calculate(grossMonthly: number): CountryResult {
  const rbt12 = grossMonthly * 12;
  const effectiveRate = calcSimples(rbt12);
  const taxMonthly = grossMonthly * effectiveRate;
  const netMonthly = grossMonthly - taxMonthly;
  const netAnnual = netMonthly * 12;
  const grossAnnual = grossMonthly * 12;

  const monthlyLines: TaxLine[] = [
    { label: "Faturamento bruto mensal", value: grossMonthly, type: "gross" },
    { label: "Simples Nacional", sublabel: `Anexo V · ${(effectiveRate * 100).toFixed(1)}% efetivo`, value: taxMonthly, type: "deduction" },
    { label: "Líquido mensal (pró-labore livre)", value: netMonthly, type: "net" },
  ];

  const annualLines: TaxLine[] = [
    { label: "Faturamento bruto anual", value: grossAnnual, type: "gross" },
    { label: "Simples Nacional", sublabel: `Anexo V · ${(effectiveRate * 100).toFixed(1)}% efetivo`, value: taxMonthly * 12, type: "deduction" },
    { label: "Líquido anual", value: netAnnual, type: "net" },
  ];

  return { grossMonthly, grossAnnual, netMonthly, netAnnual, effectiveTaxRate: effectiveRate, monthlyLines, annualLines };
}

export const brazilPJ: CountryConfig = {
  id: "brazil-pj",
  flag: "🇧🇷",
  country: "Brasil",
  modality: "PJ",
  modalityNote: "Simples Nacional Anexo V",
  currency: "BRL",
  currencySymbol: "R$",
  inputLabelBase: "Faturamento bruto",
  inputPlaceholder: "20.000",
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
    "13º salário": { description: "Não obrigatório (pode criar reserva)", positive: false },
    "Férias": { description: "Não obrigatório (você decide", positive: false },
    "Vale-refeição / alimentação": { description: "Por conta própria", positive: false },
    "Plano de saúde": { description: "Por conta própria (dedutível)", positive: false },
    "FGTS / Previdência": { description: "Sem FGTS — previdência privada", positive: false },
    "Licença parental": { description: "Sem cobertura do empregador", positive: false },
    "Estabilidade / aviso prévio": { description: "Contrato pode ser rescindido a qualquer momento", positive: false },
  },
  calculate,
};
