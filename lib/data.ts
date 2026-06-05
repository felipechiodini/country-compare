export const EXCHANGE_RATE_BRL_EUR = 6.2; // 1 EUR = 6.20 BRL (aproximado 2025)

// ─── Brazil Tax Brackets (2024) ──────────────────────────────────────────────

export const BRAZIL_INSS_BRACKETS = [
  { upTo: 1412.0, rate: 0.075 },
  { upTo: 2666.68, rate: 0.09 },
  { upTo: 4000.03, rate: 0.12 },
  { upTo: 7786.02, rate: 0.14 },
];
export const BRAZIL_INSS_MAX = 908.96;

export const BRAZIL_IRPF_BRACKETS = [
  { upTo: 2259.2, rate: 0, deduction: 0 },
  { upTo: 2826.65, rate: 0.075, deduction: 169.44 },
  { upTo: 3751.05, rate: 0.15, deduction: 381.44 },
  { upTo: 4664.68, rate: 0.225, deduction: 662.77 },
  { upTo: Infinity, rate: 0.275, deduction: 896.0 },
];

// ─── Ireland Tax Brackets (2025) ─────────────────────────────────────────────

export const IRELAND_PAYE_THRESHOLD = 42000; // 20% below, 40% above
export const IRELAND_PAYE_STANDARD_RATE = 0.2;
export const IRELAND_PAYE_HIGHER_RATE = 0.4;
export const IRELAND_PERSONAL_TAX_CREDIT = 1875; // annual

export const IRELAND_USC_BRACKETS = [
  { upTo: 12012, rate: 0.005 },
  { upTo: 25760, rate: 0.02 },
  { upTo: 70044, rate: 0.04 },
  { upTo: Infinity, rate: 0.08 },
];

export const IRELAND_PRSI_RATE = 0.04;

// ─── Cost of Living (monthly, 2025 estimates) ─────────────────────────────────

export interface CostCategory {
  label: string;
  brazilBRL: number;
  irelandEUR: number;
}

export const COST_OF_LIVING: CostCategory[] = [
  { label: "Aluguel 1-quarto centro", brazilBRL: 4500, irelandEUR: 2400 },
  { label: "Aluguel 1-quarto fora do centro", brazilBRL: 2800, irelandEUR: 1800 },
  { label: "Alimentação mensal", brazilBRL: 1600, irelandEUR: 500 },
  { label: "Transporte público", brazilBRL: 260, irelandEUR: 145 },
  { label: "Internet + celular", brazilBRL: 180, irelandEUR: 80 },
  { label: "Saúde (particular/seguro)", brazilBRL: 600, irelandEUR: 150 },
  { label: "Lazer e entretenimento", brazilBRL: 800, irelandEUR: 400 },
];

// ─── Benefits ─────────────────────────────────────────────────────────────────

export interface Benefit {
  label: string;
  brazil: string;
  ireland: string;
  brazilPositive: boolean;
  irelandPositive: boolean;
}

export const BENEFITS: Benefit[] = [
  {
    label: "13º salário",
    brazil: "Sim (obrigatório)",
    ireland: "Não usual",
    brazilPositive: true,
    irelandPositive: false,
  },
  {
    label: "Férias",
    brazil: "30 dias + 1/3 adicional",
    ireland: "20 dias úteis (mínimo legal)",
    brazilPositive: true,
    irelandPositive: false,
  },
  {
    label: "Vale-refeição/alimentação",
    brazil: "Comum (R$800–1.500/mês)",
    ireland: "Meal allowance (€10,5/dia)",
    brazilPositive: true,
    irelandPositive: true,
  },
  {
    label: "Plano de saúde",
    brazil: "Comum (empresa paga parcial)",
    ireland: "Sistema público (HSE gratuito)",
    brazilPositive: true,
    irelandPositive: true,
  },
  {
    label: "FGTS / Pensão",
    brazil: "FGTS 8% (só ao demitir)",
    ireland: "Pension 5%+ (disponível agora)",
    brazilPositive: false,
    irelandPositive: true,
  },
  {
    label: "Licença maternidade/paternidade",
    brazil: "126 dias (mãe) / 20 dias (pai)",
    ireland: "26 semanas (mãe) / 9 semanas (pai)",
    brazilPositive: false,
    irelandPositive: true,
  },
  {
    label: "Estabilidade no emprego",
    brazil: "Aviso prévio proporcional",
    ireland: "Notice period (1-8 semanas)",
    brazilPositive: true,
    irelandPositive: false,
  },
];
