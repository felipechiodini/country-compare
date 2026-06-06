"use client";

import { CountryConfig, CountryResult, Period } from "@/lib/types";

interface Props {
  configA: CountryConfig;
  resultA: CountryResult;
  configB: CountryConfig;
  resultB: CountryResult;
  period: Period;
}

function fmtLocal(v: number, symbol: string) {
  return `${symbol} ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

export default function PowerComparison({ configA, resultA, configB, resultB, period }: Props) {
  const isAnnual = period === "annual";
  const suffix = isAnnual ? "/ano" : "/mês";

  const netA = isAnnual ? resultA.netAnnual : resultA.netMonthly;
  const netB = isAnnual ? resultB.netAnnual : resultB.netMonthly;

  // Convert both to EUR for neutral comparison
  const netAinEUR = netA * configA.eurPerUnit;
  const netBinEUR = netB * configB.eurPerUnit;

  // Nominal: how many times more in EUR
  const nominalRatio = netBinEUR / netAinEUR;

  // PPP: adjust by purchasing power index
  // netB in EUR → convert to A's purchasing power
  const pppRatio =
    (netBinEUR * configA.purchasingPowerIndex) /
    (netAinEUR * configB.purchasingPowerIndex);

  // Express B's PPP-adjusted value in A's currency
  const netBinACurrencyPPP =
    (netBinEUR / configB.purchasingPowerIndex) *
    configA.purchasingPowerIndex /
    configA.eurPerUnit;

  const winner = pppRatio >= 1 ? "B" : "A";

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 text-lg mb-2">Poder de compra comparado</h3>
      <p className="text-sm text-gray-700 mb-5">
        Compara os salários líquidos em euros (moeda neutra) e aplica o índice PPP para medir
        o poder de compra real em cada contexto.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-700 mb-1">{configA.flag} Líquido {isAnnual ? "anual" : "mensal"}</p>
          <p className="text-xl font-bold text-green-700">{fmtLocal(netA, configA.currencySymbol)}</p>
          <p className="text-xs text-gray-600 mt-1">≈ €{netAinEUR.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-700 mb-1">{configB.flag} Líquido {isAnnual ? "anual" : "mensal"}</p>
          <p className="text-xl font-bold text-blue-700">{fmtLocal(netB, configB.currencySymbol)}</p>
          <p className="text-xs text-gray-600 mt-1">≈ €{netBinEUR.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-700 mb-1">{configB.flag} PPP equiv. em {configA.country}</p>
          <p className="text-xl font-bold text-purple-700">
            {fmtLocal(netBinACurrencyPPP, configA.currencySymbol)}
          </p>
          <p className="text-xs text-gray-600 mt-1">poder de compra real</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Vantagem nominal (em euros)</span>
            <span className="font-semibold text-gray-800">{nominalRatio.toFixed(1)}×</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-400 rounded-l-full" style={{ width: `${Math.min((1 / nominalRatio) * 100, 100)}%` }} />
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
                : `${configA.country} ${(1 / pppRatio).toFixed(1)}×`}
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {winner === "B" ? (
              <>
                <div className="h-full bg-green-400 rounded-l-full" style={{ width: `${(1 / pppRatio) * 100}%` }} />
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
            O salário equivale a{" "}
            <strong>{fmtLocal(netBinACurrencyPPP, configA.currencySymbol)}{suffix}</strong> em
            poder de compra no padrão de {configA.city} — vs{" "}
            <strong>{fmtLocal(netA, configA.currencySymbol)}</strong>.
          </>
        ) : (
          <>
            <strong>{configA.country} ({configA.modality}) vence em poder de compra.</strong>{" "}
            Com o custo de vida ajustado pelo PPP, o salário de {configA.city} tem poder de
            compra maior no contexto local.
          </>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-600">
        * Índices PPP: {configA.country} {configA.purchasingPowerIndex} · {configB.country} {configB.purchasingPowerIndex} (Banco Mundial 2024, EUA = 100).
        Representa poder de compra médio — contexto individual pode variar.
      </p>
    </div>
  );
}
