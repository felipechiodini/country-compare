"use client";

import { CountryConfig } from "@/lib/types";

interface Props {
  config: CountryConfig;
  value: string;
  onChange: (v: string) => void;
  accentClass: string; // e.g. "border-green-300 bg-green-50 focus:ring-green-400 text-green-900"
  labelClass: string;  // e.g. "text-green-800"
  noteClass: string;   // e.g. "text-green-600"
}

export default function SalaryInput({ config, value, onChange, accentClass, labelClass, noteClass }: Props) {
  const displayValue = value
    ? `${config.currencySymbol} ${Number(value).toLocaleString("pt-BR")}`
    : "";

  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
        {config.inputLabel} ({config.currencySymbol})
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          onChange(raw);
        }}
        placeholder={`${config.currencySymbol} ${config.inputPlaceholder}`}
        className={`w-full rounded-xl border px-4 py-3 text-lg font-semibold bg-white focus:outline-none focus:ring-2 ${accentClass}`}
      />
      <p className={`mt-2 text-xs ${noteClass}`}>
        {config.inputPeriod === "monthly" ? "Valor mensal bruto" : "Valor anual bruto"} ·{" "}
        {config.city}
      </p>
    </div>
  );
}
