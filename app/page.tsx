"use client";

import { useState, useMemo } from "react";
import CountrySelect from "@/components/CountrySelect";
import SalaryInput from "@/components/SalaryInput";
import TaxBreakdown from "@/components/TaxBreakdown";
import CostOfLiving from "@/components/CostOfLiving";
import ThemeToggle from "@/components/ThemeToggle";
import { brazilCLT, irelandPAYE } from "@/lib/countries";
import { CountryConfig, Period } from "@/lib/types";
import { COMPARISON_CURRENCIES, ComparisonCurrency } from "@/lib/currencies";

const ACCENT_A = {
  accentClass: "border-gray-300 text-gray-900 focus:ring-gray-400 dark:border-gray-600 dark:text-gray-100",
  labelClass: "text-gray-800 dark:text-gray-200",
  noteClass: "text-gray-500 dark:text-gray-400",
};
const ACCENT_B = {
  accentClass: "border-gray-300 text-gray-900 focus:ring-gray-400 dark:border-gray-600 dark:text-gray-100",
  labelClass: "text-gray-800 dark:text-gray-200",
  noteClass: "text-gray-500 dark:text-gray-400",
};

function defaultInput(config: CountryConfig, activePeriod: Period, compCurrency: ComparisonCurrency): string {
  const native = parseInt(config.inputPlaceholder.replace(/\./g, ""), 10);
  const inComp = native * config.baseRate * compCurrency.rateFromBase;
  if (config.inputPeriod === activePeriod) return String(Math.round(inComp));
  return config.inputPeriod === "monthly"
    ? String(Math.round(inComp * 12))
    : String(Math.round(inComp / 12));
}

function toNative(raw: string, config: CountryConfig, activePeriod: Period, compCurrency: ComparisonCurrency): number {
  const compValue = Number(raw) || 0;
  const localValue = compValue / (config.baseRate * compCurrency.rateFromBase);
  if (config.inputPeriod === activePeriod) return localValue;
  return config.inputPeriod === "monthly" ? localValue / 12 : localValue * 12;
}

export default function Home() {
  const [configA, setConfigA] = useState(brazilCLT);
  const [configB, setConfigB] = useState(irelandPAYE);
  const [period, setPeriod] = useState<Period>("monthly");
  const [compCurrency, setCompCurrency] = useState<ComparisonCurrency>(COMPARISON_CURRENCIES[0]);
  const [inputA, setInputA] = useState(() => defaultInput(brazilCLT, "monthly", COMPARISON_CURRENCIES[0]));
  const [inputB, setInputB] = useState(() => defaultInput(irelandPAYE, "monthly", COMPARISON_CURRENCIES[0]));

  const resultA = useMemo(
    () => configA.calculate(toNative(inputA, configA, period, compCurrency)),
    [configA, inputA, period, compCurrency]
  );
  const resultB = useMemo(
    () => configB.calculate(toNative(inputB, configB, period, compCurrency)),
    [configB, inputB, period, compCurrency]
  );

  const hasValues = Number(inputA) > 0 && Number(inputB) > 0;

  function handlePeriodChange(newPeriod: Period) {
    if (newPeriod === period) return;
    const factor = newPeriod === "annual" ? 12 : 1 / 12;
    setInputA((v) => String(Math.round(Number(v) * factor)));
    setInputB((v) => String(Math.round(Number(v) * factor)));
    setPeriod(newPeriod);
  }

  function handleCompCurrencyChange(newCurr: ComparisonCurrency) {
    const ratio = newCurr.rateFromBase / compCurrency.rateFromBase;
    setInputA((v) => String(Math.round(Number(v) * ratio)));
    setInputB((v) => String(Math.round(Number(v) * ratio)));
    setCompCurrency(newCurr);
  }

  function handleConfigAChange(c: CountryConfig) {
    setConfigA(c);
    setInputA(defaultInput(c, period, compCurrency));
  }
  function handleConfigBChange(c: CountryConfig) {
    setConfigB(c);
    setInputB(defaultInput(c, period, compCurrency));
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white leading-tight">Comparar Países</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Calculadora de salário — compare qualquer país e modalidade
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://github.com/felipechiodini/country-compare"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="hidden sm:inline">Contribuir</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Config bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Período</span>
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
              <button
                onClick={() => handlePeriodChange("monthly")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === "monthly"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => handlePeriodChange("annual")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === "annual"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Anual
              </button>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Moeda de comparação</span>
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-1 gap-0.5">
              {COMPARISON_CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCompCurrencyChange(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    compCurrency.code === c.code
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Country selectors */}
        <section>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Compare salários entre países — impostos reais, custo de vida e poder de compra.
            Selecione o país e a modalidade em cada lado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4">
              <CountrySelect value={configA} onChange={handleConfigAChange} exclude={configB.id} />
              <SalaryInput config={configA} value={inputA} period={period} compCurrency={compCurrency} onChange={setInputA} {...ACCENT_A} />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4">
              <CountrySelect value={configB} onChange={handleConfigBChange} exclude={configA.id} />
              <SalaryInput config={configB} value={inputB} period={period} compCurrency={compCurrency} onChange={setInputB} {...ACCENT_B} />
            </div>
          </div>
        </section>

        {hasValues && (
          <>
            <section>
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">Impostos e deduções</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TaxBreakdown
                  config={configA} result={resultA} period={period} compCurrency={compCurrency}
                  bgClass="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                  headingClass="text-gray-900 dark:text-white"
                  barColorClass="bg-gray-500 dark:bg-gray-400"
                  dividerClass="border-gray-200 dark:border-gray-700"
                />
                <TaxBreakdown
                  config={configB} result={resultB} period={period} compCurrency={compCurrency}
                  bgClass="bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                  headingClass="text-gray-900 dark:text-white"
                  barColorClass="bg-gray-500 dark:bg-gray-400"
                  dividerClass="border-gray-200 dark:border-gray-700"
                />
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">Custo de vida</h2>
              <CostOfLiving
                configA={configA} resultA={resultA}
                configB={configB} resultB={resultB}
                period={period}
                compCurrency={compCurrency}
              />
            </section>
          </>
        )}

        {!hasValues && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-3">⬆️</p>
            <p>Preencha os salários acima para ver a comparação</p>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p>Câmbio e PPP aproximados · cálculos estimados para fins de comparação.</p>
            <p>Consulte um contador para decisões reais.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
