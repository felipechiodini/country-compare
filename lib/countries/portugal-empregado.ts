import { CountryConfig, CountryResult, TaxLine } from "../types";

const SS_RATE = 0.11;         // Segurança Social — trabalhador
const DEDUCAO_ESPECIFICA = 4462; // Cat. A — rendimentos do trabalho (2024)
const DEDUCAO_COLETA = 600;   // Dedução pessoal à coleta (solteiro)

const IRS_BRACKETS = [
  { upTo: 7703,      rate: 0.1325 },
  { upTo: 11623,     rate: 0.18 },
  { upTo: 16472,     rate: 0.23 },
  { upTo: 21321,     rate: 0.26 },
  { upTo: 27146,     rate: 0.3275 },
  { upTo: 39791,     rate: 0.37 },
  { upTo: 51997,     rate: 0.435 },
  { upTo: 81199,     rate: 0.45 },
  { upTo: Infinity,  rate: 0.48 },
];

function calcIRS(taxable: number): number {
  let tax = 0, prev = 0;
  for (const b of IRS_BRACKETS) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, b.upTo) - prev) * b.rate;
    prev = b.upTo;
  }
  return tax;
}

function calculate(grossMonthly: number): CountryResult {
  // Portugal: 14 monthly payments (12 base + subsídio férias + subsídio natal)
  const grossAnnual = grossMonthly * 14;

  const ss = grossAnnual * SS_RATE;
  const deducaoEspecifica = Math.min(DEDUCAO_ESPECIFICA, grossAnnual);
  const rendimentoColetavel = Math.max(0, grossAnnual - ss - deducaoEspecifica);

  const irsGross = calcIRS(rendimentoColetavel);
  const irs = Math.max(0, irsGross - DEDUCAO_COLETA);

  const netAnnual = grossAnnual - ss - irs;
  const netMonthly = netAnnual / 14;
  const effectiveTaxRate = grossAnnual > 0 ? (ss + irs) / grossAnnual : 0;

  const monthlyLines: TaxLine[] = [
    { label: "Salário bruto mensal", value: grossMonthly, type: "gross" },
    { label: "Segurança Social", sublabel: `Trabalhador ${(SS_RATE * 100).toFixed(0)}%`, value: grossMonthly * SS_RATE, type: "deduction" },
    { label: "IRS (retenção estimada)", sublabel: "Calculado sobre base anual", value: irs / 14, type: "deduction" },
    { label: "Líquido mensal", value: netMonthly, type: "net" },
  ];

  const annualLines: TaxLine[] = [
    { label: "Bruto anual (14 meses)", value: grossAnnual, type: "gross" },
    { label: "Segurança Social", sublabel: `Trabalhador ${(SS_RATE * 100).toFixed(0)}%`, value: ss, type: "deduction" },
    { label: "Deduções específicas", sublabel: "Cat. A — rendimentos do trabalho", value: deducaoEspecifica, type: "credit" },
    { label: "IRS (bruto)", sublabel: "Sobre rendimento coletável", value: irsGross, type: "deduction" },
    { label: "Deduções à coleta", sublabel: "Dedução pessoal (solteiro)", value: DEDUCAO_COLETA, type: "credit" },
    { label: "Líquido anual", value: netAnnual, type: "net" },
  ];

  return { grossMonthly, grossAnnual, netMonthly, netAnnual, effectiveTaxRate, monthlyLines, annualLines };
}

export const portugalEmpregado: CountryConfig = {
  id: "portugal-empregado",
  flag: "🇵🇹",
  country: "Portugal",
  modality: "Empregado",
  modalityNote: "Contrato de trabalho (IRS + SS 2024)",
  currency: "EUR",
  currencySymbol: "€",
  inputLabelBase: "Salário bruto",
  inputPlaceholder: "2.000",
  inputPeriod: "monthly",
  baseRate: 1,
  purchasingPowerIndex: 72,
  costOfLiving: [
    { id: "moradia",    monthly: 1400 },
    { id: "comida",     monthly: 350 },
    { id: "saude",      monthly: 80 },
    { id: "transporte", monthly: 100 },
  ],
  benefits: {
    "13º salário": { description: "Sim — subsídio de Natal (obrigatório)", positive: true },
    "Férias": { description: "22 dias úteis + subsídio de férias (1 mês)", positive: true },
    "Vale-refeição / alimentação": { description: "Comum (€7,63/dia isento de IRS)", positive: true },
    "Plano de saúde": { description: "Raramente incluído pelo empregador", positive: false },
    "FGTS / Previdência": { description: "Segurança Social 11% + fundo de compensação", positive: false },
    "Licença parental": { description: "120–150 dias (mãe) / 20+ dias (pai)", positive: true },
    "Estabilidade / aviso prévio": { description: "Aviso prévio 15–75 dias + indemnização", positive: false },
  },
  calculate,
};
