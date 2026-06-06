"use client";

import { useEffect, useRef, useState } from "react";
import { CountryConfig } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";

interface Props {
  value: CountryConfig;
  onChange: (c: CountryConfig) => void;
  exclude?: string; // id to gray-out (the other side)
}

export default function CountrySelect({ value, onChange, exclude }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // group by country
  const groups: { flag: string; country: string; configs: CountryConfig[] }[] = [];
  for (const c of COUNTRIES) {
    const g = groups.find((g) => g.country === c.country);
    if (g) g.configs.push(c);
    else groups.push({ flag: c.flag, country: c.country, configs: [c] });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        <span className="text-2xl leading-none">{value.flag}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{value.country}</p>
          <p className="text-xs text-gray-500 truncate">{value.modality} · {value.city}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {groups.map((group) => (
            <div key={group.country}>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-lg leading-none">{group.flag}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {group.country}
                </span>
              </div>
              {group.configs.map((c) => {
                const isSelected = c.id === value.id;
                const isExcluded = c.id === exclude;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={isExcluded}
                    onClick={() => { onChange(c); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                      ${isSelected ? "bg-blue-50" : isExcluded ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}
                    `}
                  >
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                        {c.modality}
                      </p>
                      {c.modalityNote && (
                        <p className="text-xs text-gray-500">{c.modalityNote}</p>
                      )}
                    </div>
                    {isSelected && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
