"use client";

import { useState, useMemo } from "react";
import CountrySelect from "@/components/CountrySelect";
import SalaryInput from "@/components/SalaryInput";
import TaxBreakdown from "@/components/TaxBreakdown";
import CostOfLiving from "@/components/CostOfLiving";
import Benefits from "@/components/Benefits";
import PowerComparison from "@/components/PowerComparison";
import { COUNTRIES, brazilCLT, irelandPAYE } from "@/lib/countries";
import { Period } from "@/lib/types";

const SIDE_A_DEFAULTS: Record<string, string> = { "monthly": "15000", "annual": "180000" };
const SIDE_B_DEFAULTS: Record<string, string> = { "monthly": "15000", "annual": "80000" };

const ACCENT_A = {
  accentClass: "border-green-300 text-green-900 focus:ring-green-400",
  labelClass: "text-green-800",
  noteClass: "text-green-600",
};
const ACCENT_B = {
  accentClass: "border-blue-300 text-blue-900 focus:ring-blue-400",
  labelClass: "text-blue-800",
  noteClass: "text-blue-600",
};

export default function Home() {
  const [configA, setConfigA] = useState(brazilCLT);
  const [configB, setConfigB] = useState(irelandPAYE);
  const [inputA, setInputA] = useState("15000");
  const [inputB, setInputB] = useState("80000");
  const [period, setPeriod] = useState<Period>("monthly");

  const resultA = useMemo(() => configA.calculate(Number(inputA) || 0), [configA, inputA]);
  const resultB = useMemo(() => configB.calculate(Number(inputB) || 0), [configB, inputB]);

  const hasValues = Number(inputA) > 0 && Number(inputB) > 0;

  function handleConfigAChange(c: typeof configA) {
    setConfigA(c);
    setInputA(c.inputPeriod === "monthly" ? "15000" : "180000");
  }
  function handleConfigBChange(c: typeof configB) {
    setConfigB(c);
    setInputB(c.inputPeriod === "monthly" ? "15000" : "80000");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Comparar Países</h1>
              <p className="text-xs text-gray-600">
                Calculadora de salário — compare qualquer país e modalidade
              </p>
            </div>
          </div>
          <a
            href="https://github.com/felipechiodini/country-compare"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden sm:inline">Contribuir</span>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section>
          <p className="text-gray-600 mb-6 text-sm">
            Compare salários de desenvolvedor entre países — impostos reais, custo de vida,
            benefícios e poder de compra. Selecione o país e a modalidade em cada lado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Side A */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">País A</span>
              </div>
              <CountrySelect value={configA} onChange={handleConfigAChange} exclude={configB.id} />
              <SalaryInput config={configA} value={inputA} onChange={setInputA} {...ACCENT_A} />
            </div>

            {/* Side B */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">País B</span>
              </div>
              <CountrySelect value={configB} onChange={handleConfigBChange} exclude={configA.id} />
              <SalaryInput config={configB} value={inputB} onChange={setInputB} {...ACCENT_B} />
            </div>
          </div>
        </section>

        {hasValues && (
          <>
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Visualizar por</span>
                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setPeriod("monthly")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      period === "monthly" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setPeriod("annual")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      period === "annual" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Anual
                  </button>
                </div>
              </div>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Impostos e deduções</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TaxBreakdown
                  config={configA} result={resultA} period={period}
                  bgClass="bg-green-50 border-green-200"
                  headingClass="text-green-900"
                  barColorClass="bg-green-500"
                  dividerClass="border-green-200"
                />
                <TaxBreakdown
                  config={configB} result={resultB} period={period}
                  bgClass="bg-blue-50 border-blue-200"
                  headingClass="text-blue-900"
                  barColorClass="bg-blue-500"
                  dividerClass="border-blue-200"
                />
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Poder de compra</h2>
              <PowerComparison
                configA={configA} resultA={resultA}
                configB={configB} resultB={resultB}
                period={period}
              />
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Custo de vida</h2>
              <CostOfLiving
                configA={configA} resultA={resultA}
                configB={configB} resultB={resultB}
                period={period}
              />
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Benefícios trabalhistas</h2>
              <Benefits configA={configA} configB={configB} />
            </section>
          </>
        )}

        {!hasValues && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">⬆️</p>
            <p>Preencha os salários acima para ver a comparação</p>
          </div>
        )}
      </main>
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center space-y-3">
          <div className="text-xs text-gray-400 space-y-1">
            <p>Câmbio e PPP aproximados (2025) · IRPF/INSS 2024 · PAYE/USC/PRSI 2025</p>
            <p>Valores estimados para fins de comparação. Consulte um contador para decisões reais.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
