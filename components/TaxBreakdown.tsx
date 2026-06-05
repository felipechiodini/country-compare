"use client";

import { BrazilResult, IrelandResult, Period } from "@/lib/calculations";

function pct(v: number) {
  return (v * 100).toFixed(1) + "%";
}

function brl(v: number) {
  return "R$ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function eur(v: number) {
  return "€ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

interface RowProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  negative?: boolean;
  positive?: boolean;
  muted?: boolean;
}

function Row({ label, value, sub, highlight, negative, positive, muted }: RowProps) {
  const valueColor = negative
    ? "text-red-600"
    : positive
    ? "text-emerald-700"
    : highlight
    ? "text-gray-900"
    : "text-gray-800";

  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${highlight ? "font-semibold" : ""}`}>
      <span className={`text-sm ${highlight ? "font-semibold text-gray-900" : muted ? "text-gray-500" : "text-gray-700"}`}>
        {label}
        {sub && <span className="block text-xs text-gray-600 font-normal">{sub}</span>}
      </span>
      <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}

function TaxBar({ rate, color }: { rate: number; color: string }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-700 mb-1">
        <span>Alíquota efetiva total</span>
        <span className="font-semibold">{pct(rate)}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(rate * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function BrazilTaxBreakdown({ r, period }: { r: BrazilResult; period: Period }) {
  const isAnnual = period === "annual";

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
      <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
        <span>🇧🇷</span> Deduções – Brasil (CLT)
      </h3>
      <div className="space-y-1">
        {isAnnual ? (
          <>
            <Row label="Bruto anual (12 meses)" value={brl(r.grossMonthly * 12)} highlight />
            <Row label="INSS anual" sub="Previdência social" value={`- ${brl(r.inss * 12)}`} negative />
            <Row label="IRPF anual" sub="Imposto de Renda" value={`- ${brl(r.irpf * 12)}`} negative />
            <div className="border-t border-green-200 mt-2 pt-2">
              <Row label="Líquido base anual" value={brl(r.netMonthly * 12)} />
            </div>
            <Row label="+ 13º salário" sub="Líquido, pago em dezembro" value={`+ ${brl(r.thirteenth)}`} positive />
            <Row label="+ Abono de férias" sub="1/3 do salário bruto" value={`+ ${brl(r.vacationBonus)}`} positive />
            <div className="border-t border-green-200 mt-2 pt-2">
              <Row label="Líquido total anual" value={brl(r.netAnnual)} highlight />
            </div>
            <Row label="Em euros" sub="câmbio R$6,20/€1" value={`≈ ${eur(r.netAnnualEUR)}/ano`} muted />
          </>
        ) : (
          <>
            <Row label="Salário bruto mensal" value={brl(r.grossMonthly)} highlight />
            <Row label="INSS" sub="Previdência social" value={`- ${brl(r.inss)}`} negative />
            <Row label="IRPF" sub="Imposto de Renda" value={`- ${brl(r.irpf)}`} negative />
            <div className="border-t border-green-200 mt-2 pt-2">
              <Row label="Líquido mensal" value={brl(r.netMonthly)} highlight />
            </div>
            <Row label="Em euros" sub="câmbio R$6,20/€1" value={`≈ ${eur(r.netMonthlyEUR)}/mês`} muted />
          </>
        )}
      </div>
      <TaxBar rate={r.effectiveTaxRate} color="bg-green-500" />
    </div>
  );
}

export function IrelandTaxBreakdown({ r, period }: { r: IrelandResult; period: Period }) {
  const isAnnual = period === "annual";

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
      <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
        <span>🇮🇪</span> Deduções – Irlanda (PAYE)
      </h3>
      <div className="space-y-1">
        {isAnnual ? (
          <>
            <Row label="Salário bruto anual" value={eur(r.grossAnnual)} highlight />
            <Row label="PAYE" sub="Imposto de Renda (bruto)" value={`- ${eur(r.payeGross)}`} negative />
            <Row label="Tax Credits" sub="Crédito pessoal (Personal Credit)" value={`+ ${eur(r.taxCredits)}`} positive />
            <Row label="USC" sub="Universal Social Charge" value={`- ${eur(r.usc)}`} negative />
            <Row label="PRSI" sub="Seguro social (4%)" value={`- ${eur(r.prsi)}`} negative />
            <div className="border-t border-blue-200 mt-2 pt-2">
              <Row label="Líquido anual" value={eur(r.netAnnual)} highlight />
            </div>
            <Row label="Em reais" sub="câmbio R$6,20/€1" value={`≈ ${brl(r.netAnnualBRL)}/ano`} muted />
          </>
        ) : (
          <>
            <Row label="Salário bruto mensal" value={eur(r.grossMonthly)} highlight />
            <Row label="PAYE" sub="Imposto de Renda (bruto)" value={`- ${eur(r.payeGross / 12)}`} negative />
            <Row label="Tax Credits" sub="Crédito pessoal" value={`+ ${eur(r.taxCredits / 12)}`} positive />
            <Row label="USC" sub="Universal Social Charge" value={`- ${eur(r.usc / 12)}`} negative />
            <Row label="PRSI" sub="Seguro social (4%)" value={`- ${eur(r.prsi / 12)}`} negative />
            <div className="border-t border-blue-200 mt-2 pt-2">
              <Row label="Líquido mensal" value={eur(r.netMonthly)} highlight />
            </div>
            <Row label="Em reais" sub="câmbio R$6,20/€1" value={`≈ ${brl(r.netMonthlyBRL)}/mês`} muted />
          </>
        )}
      </div>
      <TaxBar rate={r.effectiveTaxRate} color="bg-blue-500" />
    </div>
  );
}
