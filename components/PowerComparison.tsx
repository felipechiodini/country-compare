"use client";

import { CountryConfig, CountryResult, Period } from "@/lib/types";
import { ComparisonCurrency } from "@/lib/currencies";

interface Props {
  configA: CountryConfig;
  resultA: CountryResult;
  configB: CountryConfig;
  resultB: CountryResult;
  period: Period;
  compCurrency: ComparisonCurrency;
}

function fmt(v: number, symbol: string) {
  return `${symbol} ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

export default function PowerComparison({ configA, resultA, configB, resultB, period, compCurrency }: Props) {
  const isAnnual = period === "annual";
  const suffix = isAnnual ? "/ano" : "/mês";

  const netA = isAnnual ? resultA.netAnnual : resultA.netMonthly;
  const netB = isAnnual ? resultB.netAnnual : resultB.netMonthly;

  // Convert both to comparison currency: local → base (EUR) → compCurrency
  const toComp = (net: number, cfg: CountryConfig) =>
    net * cfg.baseRate * compCurrency.rateFromBase;

  const netAcomp = toComp(netA, configA);
  const netBcomp = toComp(netB, configB);

  // Nominal ratio in comparison currency
  const nominalRatio = netAcomp > 0 ? netBcomp / netAcomp : 0;

  // PPP-adjusted ratio (comparison currency cancels out)
  const pppRatio =
    netAcomp > 0 && configB.purchasingPowerIndex > 0
      ? (netBcomp * configA.purchasingPowerIndex) /
        (netAcomp * configB.purchasingPowerIndex)
      : 0;

  // B's PPP-adjusted value in comparison currency, normalized to A's purchasing power
  const netBpppComp =
    configB.purchasingPowerIndex > 0
      ? (netBcomp / configB.purchasingPowerIndex) * configA.purchasingPowerIndex
      : 0;

  const winner = pppRatio >= 1 ? "B" : "A";
  const sym = compCurrency.symbol;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 text-lg mb-2">Poder de compra comparado</h3>
      <p className="text-sm text-gray-700 mb-5">
        Salários convertidos para <strong>{compCurrency.name}</strong> e ajustados pelo
        índice PPP do Banco Mundial para medir o poder de compra real em cada país.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-700 mb-1">{configA.flag} Líquido {isAnnual ? "anual" : "mensal"}</p>
          <p className="text-xl font-bold text-green-700">{fmt(netAcomp, sym)}</p>
          {configA.currency !== compCurrency.code && (
            <p className="text-xs text-gray-500 mt-1">
              {configA.currencySymbol} {netA.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} local
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-700 mb-1">{configB.flag} Líquido {isAnnual ? "anual" : "mensal"}</p>
          <p className="text-xl font-bold text-blue-700">{fmt(netBcomp, sym)}</p>
          {configB.currency !== compCurrency.code && (
            <p className="text-xs text-gray-500 mt-1">
              {configB.currencySymbol} {netB.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} local
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-700 mb-1">{configB.flag} PPP equiv. — padrão de {configA.country}</p>
          <p className="text-xl font-bold text-purple-700">{fmt(netBpppComp, sym)}</p>
          <p className="text-xs text-gray-600 mt-1">poder de compra real</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Vantagem nominal (câmbio)</span>
            <span className="font-semibold text-gray-800">{nominalRatio.toFixed(1)}×</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-400 rounded-l-full"
              style={{ width: `${Math.min((1 / (nominalRatio || 1)) * 100, 100)}%` }}
            />
            <div className="h-full bg-blue-400 flex-1 rounded-r-full" />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{configA.flag} {configA.country} · {configA.modality}</span>
            <span>{configB.flag} {configB.country} · {configB.modality}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              Vantagem real (PPP · {configA.purchasingPowerIndex} vs {configB.purchasingPowerIndex})
            </span>
            <span className={`font-semibold ${winner === "B" ? "text-blue-700" : "text-green-700"}`}>
              {winner === "B"
                ? `${configB.country} ${pppRatio.toFixed(1)}×`
                : `${configA.country} ${(1 / (pppRatio || 1)).toFixed(1)}×`}
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {winner === "B" ? (
              <>
                <div className="h-full bg-green-400 rounded-l-full" style={{ width: `${(1 / (pppRatio || 1)) * 100}%` }} />
                <div className="h-full bg-blue-400 flex-1 rounded-r-full" />
              </>
            ) : (
              <>
                <div className="h-full bg-green-400 rounded-l-full" style={{ width: `${pppRatio * 100}%` }} />
                <div className="h-full bg-gray-200 flex-1 rounded-r-full" />
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`mt-5 rounded-xl p-4 text-sm ${winner === "B" ? "bg-blue-100 border border-blue-200 text-blue-900" : "bg-green-100 border border-green-200 text-green-900"}`}>
        {winner === "B" ? (
          <>
            <strong>{configB.country} ({configB.modality}) vence em poder de compra.</strong>{" "}
            O salário equivale a <strong>{fmt(netBpppComp, sym)}{suffix}</strong> em poder
            de compra ajustado por PPP — vs <strong>{fmt(netAcomp, sym)}</strong> de{" "}
            {configA.country} ({configA.modality}).
          </>
        ) : (
          <>
            <strong>{configA.country} ({configA.modality}) vence em poder de compra.</strong>{" "}
            O salário equivale a <strong>{fmt(netAcomp, sym)}{suffix}</strong> — com maior
            poder de compra ajustado por PPP no contexto local.
          </>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-600">
        * Índices PPP: {configA.country} {configA.purchasingPowerIndex} · {configB.country}{" "}
        {configB.purchasingPowerIndex} (Banco Mundial 2024, EUA = 100). Câmbio aproximado 2025.
      </p>
    </div>
  );
}
