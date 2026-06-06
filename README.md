# 🌍 Comparar Países

Calculadora de salário para comparar quanto você ganha de fato em diferentes países — impostos reais, custo de vida, poder de compra (PPP) e benefícios trabalhistas.

🔗 **[compara-pais.fcbsolucoesweb.com.br](http://compara-pais.fcbsolucoesweb.com.br/)**

---

## O que calcula

| Seção | O que mostra |
|---|---|
| **Impostos e deduções** | Breakdown completo de cada desconto (INSS, IRPF, PAYE, USC, PRSI…) com alíquota efetiva |
| **Poder de compra** | Conversão via câmbio + ajuste PPP (Banco Mundial) para comparar poder real |
| **Custo de vida** | Estimativas mensais/anuais por categoria (aluguel, alimentação, transporte…) e quanto sobra |
| **Benefícios** | 13º, férias, plano de saúde, pensão, licença parental e mais |

Todas as seções alternam entre **visão mensal e anual** com um toggle no corpo da página.

---

## Países e modalidades disponíveis

| País | Modalidade | Cálculo |
|---|---|---|
| 🇧🇷 Brasil | **CLT** | INSS progressivo 2024 + IRPF + 13º salário + abono de férias |
| 🇧🇷 Brasil | **PJ** | Simples Nacional Anexo V (alíquota efetiva por faixa de RBT12) |
| 🇮🇪 Irlanda | **PAYE** | PAYE + Tax Credits + USC + PRSI (tabelas 2025) |

---

## Como adicionar um novo país

1. Crie `lib/countries/<seu-pais>.ts` seguindo o contrato `CountryConfig`:

```ts
import { CountryConfig } from "../types";

export const meuPais: CountryConfig = {
  id: "meu-pais-modalidade",
  flag: "🏳️",
  country: "Meu País",
  modality: "Empregado",
  modalityNote: "Descrição curta da modalidade",
  currency: "USD",
  currencySymbol: "$",
  city: "Minha Cidade",
  inputLabel: "Salário bruto anual",
  inputPlaceholder: "60.000",
  inputPeriod: "annual",          // "monthly" ou "annual"
  eurPerUnit: 0.92,               // 1 USD ≈ 0.92 EUR
  purchasingPowerIndex: 100,      // Banco Mundial, EUA = 100
  costOfLiving: [
    { label: "Aluguel 1-quarto (centro)", monthly: 1800 },
    // ...
  ],
  benefits: {
    "Férias": { description: "15 dias úteis", positive: true },
    // ...
  },
  calculate(grossInput) {
    // sua lógica de cálculo
    // deve retornar CountryResult com monthlyLines e annualLines
  },
};
```

2. Exporte em `lib/countries/index.ts`:

```ts
import { meuPais } from "./meu-pais";

export const COUNTRIES: CountryConfig[] = [
  brazilCLT,
  brazilPJ,
  irelandPAYE,
  meuPais, // ← adicione aqui
];
```

O país aparece automaticamente no select de todos os usuários — sem alterar nenhum outro arquivo.

---

## Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Rodando localmente

```bash
git clone https://github.com/felipechiodini/country-compare.git
cd country-compare
npm install
npm run dev
```

Acesse `http://localhost:3000`.

---

## Contribuindo

Contribuições são bem-vindas, especialmente novos países e modalidades.

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/portugal-nhr`
3. Adicione o país seguindo o guia acima
4. Abra um Pull Request

---

## Disclaimer

Os valores são estimativas para fins de comparação. Câmbio e índices PPP são aproximados (2025). Consulte um contador para decisões financeiras reais.
