"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Option = { value: string | number; label: string };

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value?: string | number | null;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => options.find(o => String(o.value) === String(value)) || null, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        disabled && "opacity-60 pointer-events-none"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="form-select flex items-center justify-between gap-3 text-left font-medium"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.label : (placeholder || "Sélectionner")}
        </span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.133l3.71-3.9a.75.75 0 111.08 1.04l-4.24 4.46a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-200/60">
          <div className="border-b border-slate-100 p-3">
            <input
              type="text"
              className="form-input h-10"
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                Aucun résultat
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(String(opt.value));
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "w-full rounded-xl px-4 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50",
                    String(opt.value) === String(value) && "bg-slate-100"
                  )}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


