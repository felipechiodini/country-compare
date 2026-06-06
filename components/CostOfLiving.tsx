"use client";

import { useState, useEffect, useRef } from "react";
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

interface Item {
  id: string;
  label: string;
}

const ITEM_LABELS: Record<string, string> = {
  moradia: "Moradia",
  comida: "Comida",
  saude: "Saúde",
  transporte: "Transporte",
};

function getLabel(id: string): string {
  return ITEM_LABELS[id] ?? (id.charAt(0).toUpperCase() + id.slice(1));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function toBase(monthly: number, config: CountryConfig) {
  return monthly * config.baseRate;
}

export default function CostOfLiving({ configA, resultA, configB, resultB, period, compCurrency }: Props) {
  const isAnnual = period === "annual";
  const mult = isAnnual ? 12 : 1;
  const suffix = isAnnual ? "/ano" : "/mês";
  const sym = compCurrency.symbol;

  // items: ordered list of { id, label }; base maps keyed by id
  const [items, setItems] = useState<Item[]>(() => {
    const map = new Map<string, Item>();
    for (const c of configA.costOfLiving) map.set(c.id, { id: c.id, label: getLabel(c.id) });
    for (const c of configB.costOfLiving) map.set(c.id, { id: c.id, label: getLabel(c.id) });
    return Array.from(map.values());
  });
  const [baseA, setBaseA] = useState<Record<string, number>>(() =>
    Object.fromEntries(configA.costOfLiving.map((c) => [c.id, toBase(c.monthly, configA)]))
  );
  const [baseB, setBaseB] = useState<Record<string, number>>(() =>
    Object.fromEntries(configB.costOfLiving.map((c) => [c.id, toBase(c.monthly, configB)]))
  );

  const [addingItem, setAddingItem] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newValA, setNewValA] = useState("");
  const [newValB, setNewValB] = useState("");
  const newLabelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBaseA(Object.fromEntries(configA.costOfLiving.map((c) => [c.id, toBase(c.monthly, configA)])));
    setItems((prev) => {
      const newIds = configA.costOfLiving.map((c) => c.id);
      const kept = prev.filter((i) => !newIds.includes(i.id));
      return [
        ...configA.costOfLiving.map((c) => ({ id: c.id, label: getLabel(c.id) })),
        ...kept,
      ];
    });
  }, [configA.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setBaseB(Object.fromEntries(configB.costOfLiving.map((c) => [c.id, toBase(c.monthly, configB)])));
    setItems((prev) => {
      const newIds = configB.costOfLiving.map((c) => c.id);
      const kept = prev.filter((i) => !newIds.includes(i.id));
      return [
        ...kept,
        ...configB.costOfLiving.map((c) => ({ id: c.id, label: getLabel(c.id) })),
      ];
    });
  }, [configB.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const baseToComp = (base: number) => base * compCurrency.rateFromBase;
  const compToBase = (comp: number) => comp / compCurrency.rateFromBase;

  function displayVal(base: number | undefined): string {
    if (base == null) return "";
    return String(Math.round(baseToComp(base)));
  }

  function updateVal(side: "a" | "b", id: string, raw: string) {
    const digits = raw.replace(/\D/g, "");
    const setter = side === "a" ? setBaseA : setBaseB;
    setter((prev) => {
      const next = { ...prev };
      if (digits === "") delete next[id];
      else next[id] = compToBase(parseInt(digits, 10));
      return next;
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setBaseA((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setBaseB((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function commitNewItem() {
    const trimmedLabel = newLabel.trim();
    if (!trimmedLabel) return;
    const id = slugify(trimmedLabel) || `item-${Date.now()}`;
    if (items.some((i) => i.id === id)) return;
    const vA = newValA ? parseInt(newValA.replace(/\D/g, ""), 10) : undefined;
    const vB = newValB ? parseInt(newValB.replace(/\D/g, ""), 10) : undefined;
    setItems((prev) => [...prev, { id, label: trimmedLabel }]);
    if (vA != null && !isNaN(vA)) setBaseA((prev) => ({ ...prev, [id]: compToBase(vA) }));
    if (vB != null && !isNaN(vB)) setBaseB((prev) => ({ ...prev, [id]: compToBase(vB) }));
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

  const totalA = items.reduce((s, i) => s + baseToComp(baseA[i.id] ?? 0), 0) * mult;
  const totalB = items.reduce((s, i) => s + baseToComp(baseB[i.id] ?? 0), 0) * mult;

  const netA = (isAnnual ? resultA.netAnnual : resultA.netMonthly) * configA.baseRate * compCurrency.rateFromBase;
  const netB = (isAnnual ? resultB.netAnnual : resultB.netMonthly) * configB.baseRate * compCurrency.rateFromBase;

  const surplusA = netA - totalA;
  const surplusB = netB - totalB;

  function fmtComp(v: number) {
    return `${sym} ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  }

  const editInput = (_side: "a" | "b") =>
    `w-28 text-right rounded-lg border border-transparent px-2 py-1 text-sm font-medium outline-none transition-colors bg-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700`;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
          Custo de vida{isAnnual ? " (anual)" : " (mensal)"}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">valores mensais · editável</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 text-gray-700 dark:text-gray-300 font-medium">Categoria</th>
              <th className="text-right py-2 text-gray-700 dark:text-gray-300 font-medium">
                {configA.flag} {configA.country} · {configA.modality}
                <span className="font-normal text-gray-500 dark:text-gray-400 text-xs ml-1">({sym}/mês)</span>
              </th>
              <th className="text-right py-2 text-gray-700 dark:text-gray-300 font-medium">
                {configB.flag} {configB.country} · {configB.modality}
                <span className="font-normal text-gray-500 dark:text-gray-400 text-xs ml-1">({sym}/mês)</span>
              </th>
              <th className="w-6" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const aIsCheaper =
                baseA[item.id] != null && baseB[item.id] != null
                  ? baseA[item.id] < baseB[item.id]
                  : null;
              return (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 group">
                  <td className="py-1.5 text-gray-700 dark:text-gray-300 pr-2">{item.label}</td>
                  <td className="py-1.5 text-right">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={displayVal(baseA[item.id])}
                      onChange={(e) => updateVal("a", item.id, e.target.value)}
                      placeholder="—"
                      className={`${editInput("a")} text-gray-700 dark:text-gray-300`}
                    />
                  </td>
                  <td className="py-1.5 text-right">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={displayVal(baseB[item.id])}
                      onChange={(e) => updateVal("b", item.id, e.target.value)}
                      placeholder="—"
                      className={`${editInput("b")} text-gray-700 dark:text-gray-300`}
                    />
                  </td>
                  <td className="py-1.5 pl-1">
                    <button
                      onClick={() => removeItem(item.id)}
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
              <tr className="border-b border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-600"
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
                    className="w-28 text-right rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 text-sm font-medium outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200 dark:focus:ring-green-800"
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
                    className="w-28 text-right rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 text-sm font-medium outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-800"
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
            <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-bold">
              <td className="py-3 text-gray-900 dark:text-white">Total estimado</td>
              <td className="py-3 text-right text-gray-900 dark:text-white">{fmtComp(totalA)}</td>
              <td className="py-3 text-right text-gray-900 dark:text-white">{fmtComp(totalB)}</td>
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
          className="mt-3 flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <span className="text-base font-light leading-none">+</span>
          Adicionar item
        </button>
      ) : (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">↵ Enter para confirmar · Esc para cancelar</p>
      )}

      <div className="grid grid-cols-2 gap-4 mt-5">
        {[
          { country: configA.country, modality: configA.modality, flag: configA.flag, surplus: surplusA, net: netA },
          { country: configB.country, modality: configB.modality, flag: configB.flag, surplus: surplusB, net: netB },
        ].map(({ country, modality, flag, surplus, net }, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 ${
              surplus >= 0
                ? "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
            }`}
          >
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">
              {flag} {country} · {modality} — sobra {suffix}
            </p>
            <p className={`text-xl font-bold ${surplus >= 0 ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400"}`}>
              {fmtComp(surplus)}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
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
