"use client";

import { BENEFITS } from "@/lib/data";

export default function Benefits() {
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
              <th className="text-left py-2 text-green-700 font-medium w-[38%]">🇧🇷 Brasil</th>
              <th className="text-left py-2 text-blue-700 font-medium w-[38%]">🇮🇪 Irlanda</th>
            </tr>
          </thead>
          <tbody>
            {BENEFITS.map((b) => (
              <tr key={b.label} className="border-b border-gray-100 align-top">
                <td className="py-3 font-medium text-gray-800">{b.label}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-start gap-1.5 ${
                      b.brazilPositive ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    <span className="mt-0.5">{b.brazilPositive ? "✓" : "–"}</span>
                    {b.brazil}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-start gap-1.5 ${
                      b.irelandPositive ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    <span className="mt-0.5">{b.irelandPositive ? "✓" : "–"}</span>
                    {b.ireland}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        * Dados aproximados. Benefícios variam por empresa e contrato individual.
      </p>
    </div>
  );
}
