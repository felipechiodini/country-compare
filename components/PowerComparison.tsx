"use client";

import { BrazilResult, IrelandResult, Period, purchasingPowerBRL, PPP_IRELAND_VS_BRAZIL } from "@/lib/calculations";
import { EXCHANGE_RATE_BRL_EUR } from "@/lib/data";

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

export default function PowerComparison({ brazil, ireland, period }: Props) {
  const isAnnual = period === "annual";

  const brazilNet = isAnnual ? brazil.netAnnual : brazil.netMonthly;
  const irelandNet = isAnnual ? ireland.netAnnual : ireland.netMonthly;
  const suffix = isAnnual ? "/ano" : "/mês";

  const irelandInBRL = irelandNet * EXCHANGE_RATE_BRL_EUR;
  const irelandPPP = purchasingPowerBRL(irelandNet);

  const nominalAdvantage = irelandInBRL / brazilNet;
  const pppAdvantage = irelandPPP / brazilNet;
  const winner = pppAdvantage >= 1 ? "ireland" : "brazil";

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 text-lg mb-2">
        Poder de compra comparado
      </h3>
      <p className="text-sm text-gray-700 mb-5">
        Converte o salário irlandês para BRL e aplica o fator PPP (paridade de
        poder de compra) — quanto esse dinheiro compra de fato no contexto local.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-700 mb-1">🇧🇷 Líquido {isAnnual ? "anual" : "mensal"}</p>
          <p className="text-2xl font-bold text-green-700">{brl(brazilNet)}</p>
          <p className="text-xs text-gray-600 mt-1">poder de compra local</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-700 mb-1">🇮🇪 Líquido {isAnnual ? "anual" : "mensal"}</p>
          <p className="text-2xl font-bold text-blue-700">{eur(irelandNet)}</p>
          <p className="text-xs text-gray-600 mt-1">= {brl(irelandInBRL)} nominal</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-700 mb-1">🇮🇪 Equivalente PPP</p>
          <p className="text-2xl font-bold text-purple-700">{brl(irelandPPP)}</p>
          <p className="text-xs text-gray-600 mt-1">em poder de compra no BR</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Vantagem nominal (câmbio puro)</span>
            <span className="font-semibold text-gray-800">{nominalAdvantage.toFixed(1)}×</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-400 rounded-l-full"
              style={{ width: `${(1 / nominalAdvantage) * 100}%` }}
            />
            <div className="h-full bg-blue-400 flex-1 rounded-r-full" />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>🇧🇷 Brasil</span>
            <span>🇮🇪 Irlanda</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              Vantagem real (PPP · fator {PPP_IRELAND_VS_BRAZIL})
            </span>
            <span className={`font-semibold ${pppAdvantage >= 1 ? "text-blue-700" : "text-green-700"}`}>
              {pppAdvantage >= 1
                ? `Irlanda ${pppAdvantage.toFixed(1)}×`
                : `Brasil ${(1 / pppAdvantage).toFixed(1)}×`}
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {pppAdvantage >= 1 ? (
              <>
                <div
                  className="h-full bg-green-400 rounded-l-full"
                  style={{ width: `${(1 / pppAdvantage) * 100}%` }}
                />
                <div className="h-full bg-blue-400 flex-1 rounded-r-full" />
              </>
            ) : (
              <>
                <div
                  className="h-full bg-green-400 rounded-l-full"
                  style={{ width: `${pppAdvantage * 100}%` }}
                />
                <div className="h-full bg-gray-200 flex-1 rounded-r-full" />
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mt-5 rounded-xl p-4 text-sm ${
          winner === "ireland"
            ? "bg-blue-100 border border-blue-200 text-blue-900"
            : "bg-green-100 border border-green-200 text-green-900"
        }`}
      >
        {winner === "ireland" ? (
          <>
            <strong>Irlanda vence em poder de compra.</strong> Apesar do custo de vida mais
            alto em Dublin, o salário irlandês representa{" "}
            <strong>{brl(irelandPPP)}{suffix}</strong> em poder de compra equivalente — vs{" "}
            <strong>{brl(brazilNet)}</strong> no Brasil.
          </>
        ) : (
          <>
            <strong>Brasil vence em poder de compra.</strong> Com o custo de vida ajustado
            pelo PPP, o salário brasileiro tem poder de compra maior. Considere o contexto
            completo antes de decidir.
          </>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-600">
        * Fator PPP baseado em dados do Banco Mundial 2024. Representa poder de compra
        médio — seu contexto individual pode variar.
      </p>
    </div>
  );
}
