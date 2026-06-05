"use client";

interface Props {
  brazilMonthly: string;
  irelandAnnual: string;
  onBrazilChange: (v: string) => void;
  onIrelandChange: (v: string) => void;
}

function formatCurrency(value: string, prefix: string) {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return prefix + Number(num).toLocaleString("pt-BR");
}

export default function SalaryInputs({
  brazilMonthly,
  irelandAnnual,
  onBrazilChange,
  onIrelandChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🇧🇷</span>
          <div>
            <h2 className="font-bold text-lg text-green-900">Brasil</h2>
            <p className="text-sm text-green-700">São Paulo</p>
          </div>
        </div>
        <label className="block text-sm font-medium text-green-800 mb-2">
          Salário bruto mensal (R$)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={brazilMonthly ? "R$ " + Number(brazilMonthly).toLocaleString("pt-BR") : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            onBrazilChange(raw);
          }}
          placeholder="R$ 15.000"
          className="w-full rounded-xl border border-green-300 bg-white px-4 py-3 text-lg font-semibold text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <p className="mt-2 text-xs text-green-600">
          Informe o valor da sua CLT ou PJ (bruto)
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🇮🇪</span>
          <div>
            <h2 className="font-bold text-lg text-blue-900">Irlanda</h2>
            <p className="text-sm text-blue-700">Dublin</p>
          </div>
        </div>
        <label className="block text-sm font-medium text-blue-800 mb-2">
          Salário bruto anual (€)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={irelandAnnual ? "€ " + Number(irelandAnnual).toLocaleString("pt-BR") : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            onIrelandChange(raw);
          }}
          placeholder="€ 80.000"
          className="w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-lg font-semibold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="mt-2 text-xs text-blue-600">
          Salários em Dublin são cotados anualmente
        </p>
      </div>
    </div>
  );
}
