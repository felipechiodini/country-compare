"use client";

import { useState, useMemo } from "react";
import SalaryInputs from "@/components/SalaryInputs";
import { BrazilTaxBreakdown, IrelandTaxBreakdown } from "@/components/TaxBreakdown";
import CostOfLiving from "@/components/CostOfLiving";
import Benefits from "@/components/Benefits";
import PowerComparison from "@/components/PowerComparison";
import { calcBrazil, calcIreland, Period } from "@/lib/calculations";

const DEFAULT_BRAZIL = "15000";
const DEFAULT_IRELAND = "80000";

export default function Home() {
  const [brazilMonthly, setBrazilMonthly] = useState(DEFAULT_BRAZIL);
  const [irelandAnnual, setIrelandAnnual] = useState(DEFAULT_IRELAND);
  const [period, setPeriod] = useState<Period>("monthly");

  const brazil = useMemo(() => calcBrazil(Number(brazilMonthly) || 0), [brazilMonthly]);
  const ireland = useMemo(() => calcIreland(Number(irelandAnnual) || 0), [irelandAnnual]);

  const hasValues = Number(brazilMonthly) > 0 && Number(irelandAnnual) > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💻</span>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Dev Internacional</h1>
              <p className="text-xs text-gray-600">
                Calculadora de salário — Brasil 🇧🇷 vs Irlanda 🇮🇪
              </p>
            </div>
          </div>

          {hasValues && (
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setPeriod("monthly")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setPeriod("annual")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === "annual"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Anual
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section>
          <p className="text-gray-600 mb-6 text-sm">
            Compare seu salário de desenvolvedor entre Brasil e Irlanda — impostos,
            custo de vida, benefícios e poder de compra real.
          </p>
          <SalaryInputs
            brazilMonthly={brazilMonthly}
            irelandAnnual={irelandAnnual}
            onBrazilChange={setBrazilMonthly}
            onIrelandChange={setIrelandAnnual}
          />
        </section>

        {hasValues && (
          <>
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">
                Impostos e deduções
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BrazilTaxBreakdown r={brazil} period={period} />
                <IrelandTaxBreakdown r={ireland} period={period} />
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">
                Poder de compra
              </h2>
              <PowerComparison brazil={brazil} ireland={ireland} period={period} />
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">
                Custo de vida
              </h2>
              <CostOfLiving brazil={brazil} ireland={ireland} period={period} />
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">
                Benefícios trabalhistas
              </h2>
              <Benefits />
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
        <div className="max-w-5xl mx-auto px-4 py-5 text-xs text-gray-500 text-center space-y-1">
          <p>
            Câmbio: R$6,20/€1 · Tabelas: IRPF/INSS 2024 · Irlanda: PAYE/USC/PRSI 2025
          </p>
          <p>
            Valores estimados para fins de comparação. Consulte um contador para decisões
            reais.
          </p>
        </div>
      </footer>
    </div>
  );
}
