import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = "http://compara-pais.fcbsolucoesweb.com.br/";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Comparar Países — Calculadora de Salário para Devs",
    template: "%s | Comparar Países",
  },
  description:
    "Compare salários de desenvolvedor entre Brasil (CLT e PJ), Irlanda e outros países. Calcule impostos, custo de vida, poder de compra (PPP) e benefícios trabalhistas.",
  keywords: [
    "salário desenvolvedor",
    "comparar salário exterior",
    "salário dev brasil irlanda",
    "CLT vs PJ",
    "IRPF INSS simulador",
    "PAYE USC Irlanda",
    "custo de vida Dublin",
    "poder de compra PPP",
    "trabalhar fora",
    "dev internacional",
  ],
  authors: [{ name: "Comparar Países" }],
  creator: "Comparar Países",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "Comparar Países",
    title: "Comparar Países — Calculadora de Salário para Devs",
    description:
      "Compare salários de desenvolvedor entre Brasil (CLT e PJ), Irlanda e outros países. Impostos, custo de vida e poder de compra real.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Comparar Países — Calculadora de Salário",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comparar Países — Calculadora de Salário para Devs",
    description:
      "Compare CLT, PJ (Brasil) e PAYE (Irlanda). Impostos reais, custo de vida e poder de compra.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme"),d=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(t!=="light"&&d))document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
