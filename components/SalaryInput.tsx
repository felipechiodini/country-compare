"use client";

import { CountryConfig, Period } from "@/lib/types";
import { ComparisonCurrency } from "@/lib/currencies";

interface Props {
  config: CountryConfig;
  value: string;
  period: Period;
  compCurrency: ComparisonCurrency;
  onChange: (v: string) => void;
  accentClass: string;
  labelClass: string;
  noteClass: string;
}

export default function SalaryInput({ config, value, period, compCurrency, onChange, accentClass, labelClass, noteClass }: Props) {
  const periodLabel = period === "monthly" ? "mensal" : "anual";
  const sym = compCurrency.symbol;

  const displayValue = value
    ? `${sym} ${Number(value).toLocaleString("pt-BR")}`
    : "";

  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
        {config.inputLabelBase} {periodLabel} ({sym})
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          onChange(raw);
        }}
        placeholder={`${sym} ...`}
        className={`w-full rounded-xl border px-4 py-3 text-lg font-semibold bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 ${accentClass}`}
      />
      <p className={`mt-2 text-xs ${noteClass}`}>
        Valor {periodLabel} bruto em {compCurrency.code}
        {config.modalityNote && ` · ${config.modalityNote}`}
      </p>
    </div>
  );
}
