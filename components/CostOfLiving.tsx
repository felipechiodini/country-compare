"use client";

import { CountryConfig, CountryResult, Period } from "@/lib/types";

interface Props {
  configA: CountryConfig;
  resultA: CountryResult;
  configB: CountryConfig;
  resultB: CountryResult;
  period: Period;
}

export default function CostOfLiving({ configA, resultA, configB, resultB, period }: Props) {
  const isAnnual = period === "annual";
  const mult = isAnnual ? 12 : 1;
  const suffix = isAnnual ? "/ano" : "/mês";

  // Collect all category labels (union of both countries)
  const labels = Array.from(
    new Set([...configA.costOfLiving.map((c) => c.label), ...configB.costOfLiving.map((c) => c.label)])
  );

  const costA = Object.fromEntries(configA.costOfLiving.map((c) => [c.label, c.monthly]));
  const costB = Object.fromEntries(configB.costOfLiving.map((c) => [c.label, c.monthly]));

  const totalA = configA.costOfLiving.reduce((s, c) => s + c.monthly, 0) * mult;
  const totalB = configB.costOfLiving.reduce((s, c) => s + c.monthly, 0) * mult;

  // Normalize both to EUR for cheaper/more expensive comparison
  const totalAinEUR = totalA * configA.eurPerUnit;
  const totalBinEUR = totalB * configB.eurPerUnit;

  const netA = isAnnual ? resultA.netAnnual : resultA.netMonthly;
  const netB = isAnnual ? resultB.netAnnual : resultB.netMonthly;

  const surplusA = netA - totalA;
  const surplusB = netB - totalB;

  function fmtA(v: number) {
    return `${configA.currencySymbol} ${(v * mult).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  }
  function fmtB(v: number) {
    return `${configB.currencySymbol} ${(v * mult).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  }
  function fmtSurplus(v: number, symbol: string) {
    return `${symbol} ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 text-lg mb-5">
        Custo de vida estimado{isAnnual ? " (anual)" : " (mensal)"}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-700 font-medium">Categoria</th>
              <th className="text-right py-2 text-green-700 font-medium">
                {configA.flag} {configA.city}
              </th>
              <th className="text-right py-2 text-blue-700 font-medium">
                {configB.flag} {configB.city}
              </th>
            </tr>
          </thead>
          <tbody>
            {labels.map((label) => {
              const valA = costA[label];
              const valB = costB[label];
              const valAinEUR = valA != null ? valA * configA.eurPerUnit : null;
              const valBinEUR = valB != null ? valB * configB.eurPerUnit : null;
              const aIsCheaper =
                valAinEUR != null && valBinEUR != null ? valAinEUR < valBinEUR : null;

              return (
                <tr key={label} className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">{label}</td>
                  <td className={`py-2 text-right font-medium ${aIsCheaper === true ? "text-green-700" : "text-gray-700"}`}>
                    {valA != null ? fmtA(valA) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className={`py-2 text-right font-medium ${aIsCheaper === false ? "text-blue-700" : "text-gray-700"}`}>
                    {valB != null ? fmtB(valB) : <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="py-3 text-gray-900">Total estimado</td>
              <td className="py-3 text-right text-green-700">
                {configA.currencySymbol} {totalA.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </td>
              <td className="py-3 text-right text-blue-700">
                {configB.currencySymbol} {totalB.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">
        {[
          { config: configA, surplus: surplusA, net: netA },
          { config: configB, surplus: surplusB, net: netB },
        ].map(({ config, surplus, net }, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 ${surplus >= 0 ? (idx === 0 ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200") : "bg-red-50 border border-red-200"}`}
          >
            <p className="text-xs text-gray-700 mb-1">
              {config.flag} Sobra {suffix} ({config.city})
            </p>
            <p className={`text-xl font-bold ${surplus >= 0 ? (idx === 0 ? "text-green-700" : "text-blue-700") : "text-red-600"}`}>
              {fmtSurplus(surplus, config.currencySymbol)}
            </p>
            <p className="text-xs text-gray-700 mt-1">
              {surplus >= 0
                ? `${((surplus / net) * 100).toFixed(0)}% da renda`
                : "déficit"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
