"use client";

import { CountryConfig, CountryResult, Period, TaxLine } from "@/lib/types";

function fmt(v: number, symbol: string) {
  return `${symbol} ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

function fmtEUR(v: number) {
  return `€ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

interface RowProps {
  line: TaxLine;
  symbol: string;
  sign?: string;
}

function Row({ line, symbol, sign }: RowProps) {
  const isDeduction = line.type === "deduction";
  const isCredit = line.type === "credit";
  const isExtra = line.type === "extra";
  const isNet = line.type === "net";
  const isGross = line.type === "gross";

  const valueColor = isDeduction
    ? "text-red-600"
    : isCredit || isExtra
    ? "text-emerald-700"
    : isNet || isGross
    ? "text-gray-900"
    : "text-gray-800";

  const prefix = isDeduction ? "− " : isCredit || isExtra ? "+ " : "";

  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${isNet || isGross ? "font-semibold" : ""}`}>
      <span className={`text-sm ${isNet || isGross ? "font-semibold text-gray-900" : "text-gray-700"}`}>
        {line.label}
        {line.sublabel && (
          <span className="block text-xs text-gray-600 font-normal">{line.sublabel}</span>
        )}
      </span>
      <span className={`text-sm font-medium ${valueColor}`}>
        {prefix}{fmt(line.value, symbol)}
      </span>
    </div>
  );
}

function TaxBar({ rate, colorClass }: { rate: number; colorClass: string }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-700 mb-1">
        <span>Alíquota efetiva total</span>
        <span className="font-semibold">{(rate * 100).toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${Math.min(rate * 100, 100)}%` }} />
      </div>
    </div>
  );
}

interface Props {
  config: CountryConfig;
  result: CountryResult;
  period: Period;
  bgClass: string;       // e.g. "bg-green-50 border-green-200"
  headingClass: string;  // e.g. "text-green-900"
  barColorClass: string; // e.g. "bg-green-500"
  dividerClass: string;  // e.g. "border-green-200"
}

export default function TaxBreakdown({ config, result, period, bgClass, headingClass, barColorClass, dividerClass }: Props) {
  const lines = period === "monthly" ? result.monthlyLines : result.annualLines;
  const otherEurPerUnit = 1; // EUR is the reference
  const netInEur = period === "monthly"
    ? result.netMonthly * config.eurPerUnit
    : result.netAnnual * config.eurPerUnit;
  const suffix = period === "monthly" ? "/mês" : "/ano";

  // Show cross-currency conversion only when currency isn't EUR
  const showEurLine = config.currency !== "EUR";

  // Find net lines to insert dividers before them
  const netIndexes = new Set(lines.map((l, i) => l.type === "net" ? i : -1).filter(i => i >= 0));

  return (
    <div className={`border rounded-2xl p-5 ${bgClass}`}>
      <h3 className={`font-bold mb-3 flex items-center gap-2 ${headingClass}`}>
        <span>{config.flag}</span>
        Deduções – {config.country} ({config.modality})
      </h3>
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={i}>
            {netIndexes.has(i) && i > 0 && (
              <div className={`border-t my-2 ${dividerClass}`} />
            )}
            <Row line={line} symbol={config.currencySymbol} />
          </div>
        ))}
        {showEurLine && (
          <Row
            line={{
              label: "Em euros",
              sublabel: `câmbio 1 ${config.currency} = €${config.eurPerUnit.toFixed(3)}`,
              value: netInEur,
              type: "gross",
            }}
            symbol="€"
          />
        )}
      </div>
      <TaxBar rate={result.effectiveTaxRate} colorClass={barColorClass} />
    </div>
  );
}
