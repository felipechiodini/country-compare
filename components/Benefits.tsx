"use client";

import { CountryConfig } from "@/lib/types";

interface Props {
  configA: CountryConfig;
  configB: CountryConfig;
}

export default function Benefits({ configA, configB }: Props) {
  // Union of all benefit category keys
  const categories = Array.from(
    new Set([...Object.keys(configA.benefits), ...Object.keys(configB.benefits)])
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 text-lg mb-5">
        Benefícios e direitos trabalhistas
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-700 font-medium w-1/4">Benefício</th>
              <th className="text-left py-2 text-green-700 font-medium w-[38%]">
                {configA.flag} {configA.country} · {configA.modality}
              </th>
              <th className="text-left py-2 text-blue-700 font-medium w-[38%]">
                {configB.flag} {configB.country} · {configB.modality}
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const a = configA.benefits[cat];
              const b = configB.benefits[cat];
              return (
                <tr key={cat} className="border-b border-gray-100 align-top">
                  <td className="py-3 font-medium text-gray-800">{cat}</td>
                  <td className="py-3 pr-4">
                    {a ? (
                      <span className={`inline-flex items-start gap-1.5 ${a.positive ? "text-green-700" : "text-gray-600"}`}>
                        <span className="mt-0.5 shrink-0">{a.positive ? "✓" : "–"}</span>
                        {a.description}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    {b ? (
                      <span className={`inline-flex items-start gap-1.5 ${b.positive ? "text-blue-700" : "text-gray-600"}`}>
                        <span className="mt-0.5 shrink-0">{b.positive ? "✓" : "–"}</span>
                        {b.description}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        * Dados aproximados. Benefícios variam por empresa e contrato individual.
      </p>
    </div>
  );
}
