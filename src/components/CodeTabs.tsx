"use client";

import { useId, useState } from "react";

export type CodeTab = {
  label: string;
  files: { name?: string; code: string }[];
};

// Pestañas de ejemplos de código. Todas las pestañas se renderizan en el
// HTML (hidden) para que el contenido sea indexable.
export default function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(0);
  const id = useId();

  return (
    <div className="my-6">
      <div
        role="tablist"
        aria-label="Lenguaje del ejemplo"
        className="flex gap-1 border-b border-border"
      >
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next =
                (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
                tabs.length;
              setActive(next);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              active === i
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-muted hover:text-brand-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={active !== i}
          className="space-y-4 pt-4"
        >
          {t.files.map((f, j) => (
            <figure key={j}>
              {f.name && (
                <figcaption className="mb-1.5 font-mono text-xs text-muted">
                  {f.name}
                </figcaption>
              )}
              <pre>
                <code>{f.code}</code>
              </pre>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}
