"use client";

import { CountryConfig, CountryResult, Period, TaxLine } from "@/lib/types";
import { ComparisonCurrency } from "@/lib/currencies";

function fmt(v: number, symbol: string) {
  return `${symbol} ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

interface RowProps {
  line: TaxLine;
  symbol: string;
  toComp: (v: number) => number;
}

function Row({ line, symbol, toComp }: RowProps) {
  const isDeduction = line.type === "deduction";
  const isCredit = line.type === "credit";
  const isExtra = line.type === "extra";
  const isNet = line.type === "net";
  const isGross = line.type === "gross";

  const valueColor = isDeduction
    ? "text-red-600 dark:text-red-400"
    : isNet || isGross
    ? "text-gray-900 dark:text-white"
    : "text-gray-700 dark:text-gray-300";

  const prefix = isDeduction ? "− " : isCredit || isExtra ? "+ " : "";

  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${isNet || isGross ? "font-semibold" : ""}`}>
      <span className={`text-sm ${isNet || isGross ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
        {line.label}
        {line.sublabel && (
          <span className="block text-xs text-gray-500 dark:text-gray-400 font-normal">{line.sublabel}</span>
        )}
      </span>
      <span className={`text-sm font-medium ${valueColor}`}>
        {prefix}{fmt(toComp(line.value), symbol)}
      </span>
    </div>
  );
}

function TaxBar({ rate, colorClass }: { rate: number; colorClass: string }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span>Alíquota efetiva total</span>
        <span className="font-semibold">{(rate * 100).toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${Math.min(rate * 100, 100)}%` }} />
      </div>
    </div>
  );
}

interface Props {
  config: CountryConfig;
  result: CountryResult;
  period: Period;
  compCurrency: ComparisonCurrency;
  bgClass: string;
  headingClass: string;
  barColorClass: string;
  dividerClass: string;
}

export default function TaxBreakdown({ config, result, period, compCurrency, bgClass, headingClass, barColorClass, dividerClass }: Props) {
  const lines = period === "monthly" ? result.monthlyLines : result.annualLines;

  const toComp = (v: number) => v * config.baseRate * compCurrency.rateFromBase;
  const sym = compCurrency.symbol;

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
            <Row line={line} symbol={sym} toComp={toComp} />
          </div>
        ))}
      </div>
      <TaxBar rate={result.effectiveTaxRate} colorClass={barColorClass} />
    </div>
  );
}
