"use client";

import { COST_OF_LIVING, EXCHANGE_RATE_BRL_EUR } from "@/lib/data";
import { BrazilResult, IrelandResult, Period } from "@/lib/calculations";

function brl(v: number) {
  return "R$ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function eur(v: number) {
  return "€ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

interface Props {
  brazil: BrazilResult;
  ireland: IrelandResult;
  period: Period;
}

export default function CostOfLiving({ brazil, ireland, period }: Props) {
  const isAnnual = period === "annual";
  const mult = isAnnual ? 12 : 1;
  const suffix = isAnnual ? "/ano" : "/mês";

  const totalBRL = COST_OF_LIVING.reduce((s, c) => s + c.brazilBRL, 0) * mult;
  const totalEUR = COST_OF_LIVING.reduce((s, c) => s + c.irelandEUR, 0) * mult;
  const totalEURinBRL = totalEUR * EXCHANGE_RATE_BRL_EUR;

  const brazilNet = isAnnual ? brazil.netAnnual : brazil.netMonthly;
  const irelandNet = isAnnual ? ireland.netAnnual : ireland.netMonthly;

  const brazilSurplus = brazilNet - totalBRL;
  const irelandSurplus = irelandNet - totalEUR;
  const irelandSurplusInBRL = irelandSurplus * EXCHANGE_RATE_BRL_EUR;

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
              <th className="text-right py-2 text-green-700 font-medium">🇧🇷 São Paulo</th>
              <th className="text-right py-2 text-blue-700 font-medium">🇮🇪 Dublin</th>
              <th className="text-right py-2 text-gray-700 font-medium">Dublin em R$</th>
            </tr>
          </thead>
          <tbody>
            {COST_OF_LIVING.map((item) => {
              const brlVal = item.brazilBRL * mult;
              const eurVal = item.irelandEUR * mult;
              const dublinBRL = eurVal * EXCHANGE_RATE_BRL_EUR;
              const cheaper = brlVal < dublinBRL;
              return (
                <tr key={item.label} className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">{item.label}</td>
                  <td className={`py-2 text-right font-medium ${cheaper ? "text-green-700" : "text-gray-700"}`}>
                    {brl(brlVal)}
                  </td>
                  <td className={`py-2 text-right font-medium ${!cheaper ? "text-blue-700" : "text-gray-700"}`}>
                    {eur(eurVal)}
                  </td>
                  <td className="py-2 text-right text-gray-700">
                    {brl(dublinBRL)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="py-3 text-gray-900">Total estimado</td>
              <td className="py-3 text-right text-green-700">{brl(totalBRL)}</td>
              <td className="py-3 text-right text-blue-700">{eur(totalEUR)}</td>
              <td className="py-3 text-right text-gray-700">{brl(totalEURinBRL)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">
        <div className={`rounded-xl p-4 ${brazilSurplus >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <p className="text-xs text-gray-700 mb-1">🇧🇷 Sobra {suffix} (SP)</p>
          <p className={`text-xl font-bold ${brazilSurplus >= 0 ? "text-green-700" : "text-red-600"}`}>
            {brl(brazilSurplus)}
          </p>
          <p className="text-xs text-gray-700 mt-1">
            {brazilSurplus >= 0
              ? `${((brazilSurplus / brazilNet) * 100).toFixed(0)}% da renda`
              : "déficit"}
          </p>
        </div>

        <div className={`rounded-xl p-4 ${irelandSurplus >= 0 ? "bg-blue-50 border border-blue-200" : "bg-red-50 border border-red-200"}`}>
          <p className="text-xs text-gray-700 mb-1">🇮🇪 Sobra {suffix} (Dublin)</p>
          <p className={`text-xl font-bold ${irelandSurplus >= 0 ? "text-blue-700" : "text-red-600"}`}>
            {eur(irelandSurplus)}
          </p>
          <p className="text-xs text-gray-700 mt-1">
            {irelandSurplus >= 0
              ? `≈ ${brl(irelandSurplusInBRL)} · ${((irelandSurplus / irelandNet) * 100).toFixed(0)}% da renda`
              : "déficit"}
          </p>
        </div>
      </div>
    </div>
  );
}
