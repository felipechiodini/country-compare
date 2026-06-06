"use client";

import { useState, useEffect, useRef } from "react";
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

  const [labels, setLabels] = useState<string[]>(() =>
    Array.from(new Set([
      ...configA.costOfLiving.map((c) => c.label),
      ...configB.costOfLiving.map((c) => c.label),
    ]))
  );
  const [valuesA, setValuesA] = useState<Record<string, number>>(() =>
    Object.fromEntries(configA.costOfLiving.map((c) => [c.label, c.monthly]))
  );
  const [valuesB, setValuesB] = useState<Record<string, number>>(() =>
    Object.fromEntries(configB.costOfLiving.map((c) => [c.label, c.monthly]))
  );

  const [addingItem, setAddingItem] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newValA, setNewValA] = useState("");
  const [newValB, setNewValB] = useState("");
  const newLabelRef = useRef<HTMLInputElement>(null);

  // When config A changes: reset its values, preserve labels from B or user-added
  useEffect(() => {
    setValuesA(Object.fromEntries(configA.costOfLiving.map((c) => [c.label, c.monthly])));
    setLabels((prev) => {
      const notInNewA = prev.filter((l) => !configA.costOfLiving.some((c) => c.label === l));
      return Array.from(new Set([...configA.costOfLiving.map((c) => c.label), ...notInNewA]));
    });
  }, [configA.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // When config B changes: reset its values, preserve labels from A or user-added
  useEffect(() => {
    setValuesB(Object.fromEntries(configB.costOfLiving.map((c) => [c.label, c.monthly])));
    setLabels((prev) => {
      const notInNewB = prev.filter((l) => !configB.costOfLiving.some((c) => c.label === l));
      return Array.from(new Set([...notInNewB, ...configB.costOfLiving.map((c) => c.label)]));
    });
  }, [configB.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalA = labels.reduce((s, l) => s + (valuesA[l] ?? 0), 0) * mult;
  const totalB = labels.reduce((s, l) => s + (valuesB[l] ?? 0), 0) * mult;
  const netA = isAnnual ? resultA.netAnnual : resultA.netMonthly;
  const netB = isAnnual ? resultB.netAnnual : resultB.netMonthly;
  const surplusA = netA - totalA;
  const surplusB = netB - totalB;

  function updateVal(side: "a" | "b", label: string, raw: string) {
    const digits = raw.replace(/\D/g, "");
    const v = digits === "" ? undefined : parseInt(digits, 10);
    const setter = side === "a" ? setValuesA : setValuesB;
    setter((prev) => {
      const next = { ...prev };
      if (v == null) delete next[label];
      else next[label] = v;
      return next;
    });
  }

  function removeLabel(label: string) {
    setLabels((prev) => prev.filter((l) => l !== label));
    setValuesA((prev) => { const n = { ...prev }; delete n[label]; return n; });
    setValuesB((prev) => { const n = { ...prev }; delete n[label]; return n; });
  }

  function commitNewItem() {
    const trimmed = newLabel.trim();
    if (!trimmed || labels.includes(trimmed)) return;
    const vA = newValA ? parseInt(newValA.replace(/\D/g, ""), 10) : undefined;
    const vB = newValB ? parseInt(newValB.replace(/\D/g, ""), 10) : undefined;
    setLabels((prev) => [...prev, trimmed]);
    if (vA != null && !isNaN(vA)) setValuesA((prev) => ({ ...prev, [trimmed]: vA }));
    if (vB != null && !isNaN(vB)) setValuesB((prev) => ({ ...prev, [trimmed]: vB }));
    setNewLabel("");
    setNewValA("");
    setNewValB("");
    setAddingItem(false);
  }

  function cancelAdding() {
    setAddingItem(false);
    setNewLabel("");
    setNewValA("");
    setNewValB("");
  }

  function fmtSurplus(v: number, sym: string) {
    return `${sym} ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  }

  const editInput = (side: "a" | "b") =>
    `w-28 text-right rounded-lg border border-transparent px-2 py-1 text-sm font-medium outline-none transition-colors hover:border-gray-200 ${
      side === "a"
        ? "focus:border-green-400 focus:ring-1 focus:ring-green-200"
        : "focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
    }`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 text-lg">
          Custo de vida{isAnnual ? " (anual)" : " (mensal)"}
        </h3>
        <span className="text-xs text-gray-500">valores mensais · editável</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-700 font-medium">Categoria</th>
              <th className="text-right py-2 text-green-700 font-medium">
                {configA.flag} {configA.city}
                <span className="font-normal text-gray-500 text-xs ml-1">({configA.currencySymbol}/mês)</span>
              </th>
              <th className="text-right py-2 text-blue-700 font-medium">
                {configB.flag} {configB.city}
                <span className="font-normal text-gray-500 text-xs ml-1">({configB.currencySymbol}/mês)</span>
              </th>
              <th className="w-6" />
            </tr>
          </thead>
          <tbody>
            {labels.map((label) => {
              const vAEur = valuesA[label] != null ? valuesA[label] * configA.eurPerUnit : null;
              const vBEur = valuesB[label] != null ? valuesB[label] * configB.eurPerUnit : null;
              const aIsCheaper = vAEur != null && vBEur != null ? vAEur < vBEur : null;
              return (
                <tr key={label} className="border-b border-gray-100 group">
                  <td className="py-1.5 text-gray-700 pr-2">{label}</td>
                  <td className="py-1.5 text-right">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={valuesA[label] != null ? String(valuesA[label]) : ""}
                      onChange={(e) => updateVal("a", label, e.target.value)}
                      placeholder="—"
                      className={`${editInput("a")} ${aIsCheaper === true ? "text-green-700" : "text-gray-700"}`}
                    />
                  </td>
                  <td className="py-1.5 text-right">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={valuesB[label] != null ? String(valuesB[label]) : ""}
                      onChange={(e) => updateVal("b", label, e.target.value)}
                      placeholder="—"
                      className={`${editInput("b")} ${aIsCheaper === false ? "text-blue-700" : "text-gray-700"}`}
                    />
                  </td>
                  <td className="py-1.5 pl-1">
                    <button
                      onClick={() => removeLabel(label)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-base leading-none"
                      title="Remover"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}

            {addingItem && (
              <tr className="border-b border-dashed border-gray-200 bg-gray-50">
                <td className="py-1.5 pr-2">
                  <input
                    ref={newLabelRef}
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitNewItem();
                      if (e.key === "Escape") cancelAdding();
                    }}
                    placeholder="Nome da categoria"
                    className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  />
                </td>
                <td className="py-1.5 text-right">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newValA}
                    onChange={(e) => setNewValA(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitNewItem();
                      if (e.key === "Escape") cancelAdding();
                    }}
                    placeholder="0"
                    className="w-28 text-right rounded-lg border border-gray-300 px-2 py-1 text-sm font-medium outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200"
                  />
                </td>
                <td className="py-1.5 text-right">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newValB}
                    onChange={(e) => setNewValB(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitNewItem();
                      if (e.key === "Escape") cancelAdding();
                    }}
                    placeholder="0"
                    className="w-28 text-right rounded-lg border border-gray-300 px-2 py-1 text-sm font-medium outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  />
                </td>
                <td className="py-1.5 pl-1">
                  <button
                    onClick={commitNewItem}
                    className="text-green-600 hover:text-green-700 text-base font-bold leading-none"
                    title="Confirmar"
                  >
                    ✓
                  </button>
                </td>
              </tr>
            )}
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
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {!addingItem ? (
        <button
          onClick={() => {
            setAddingItem(true);
            setTimeout(() => newLabelRef.current?.focus(), 50);
          }}
          className="mt-3 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="text-base font-light leading-none">+</span>
          Adicionar item
        </button>
      ) : (
        <p className="mt-2 text-xs text-gray-400">↵ Enter para confirmar · Esc para cancelar</p>
      )}

      <div className="grid grid-cols-2 gap-4 mt-5">
        {[
          { config: configA, surplus: surplusA, net: netA },
          { config: configB, surplus: surplusB, net: netB },
        ].map(({ config, surplus, net }, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 ${
              surplus >= 0
                ? idx === 0
                  ? "bg-green-50 border border-green-200"
                  : "bg-blue-50 border border-blue-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p className="text-xs text-gray-700 mb-1">
              {config.flag} Sobra {suffix} ({config.city})
            </p>
            <p
              className={`text-xl font-bold ${
                surplus >= 0 ? (idx === 0 ? "text-green-700" : "text-blue-700") : "text-red-600"
              }`}
            >
              {fmtSurplus(surplus, config.currencySymbol)}
            </p>
            <p className="text-xs text-gray-700 mt-1">
              {surplus >= 0 && net > 0
                ? `${((surplus / net) * 100).toFixed(0)}% da renda`
                : "déficit"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
