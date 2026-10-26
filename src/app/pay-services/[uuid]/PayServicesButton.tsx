"use client";

import { useState } from "react";

export default function PayServicesButton({ uuid }: { uuid: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    if (pending) return;
    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/pay-services/${encodeURIComponent(uuid)}`, {
        method: "POST",
      });
      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        throw new Error(body.error || "No pudimos iniciar el pago.");
      }
      window.location.assign(body.url);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos iniciar el pago. Inténtalo nuevamente.",
      );
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={pending}
        className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#009ee3] px-6 py-4 text-base font-bold text-white shadow-lg shadow-sky-600/20 transition-all hover:-translate-y-0.5 hover:bg-[#008dcc] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {pending ? (
          <>
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
            Preparando pago…
          </>
        ) : (
          <>
            Pagar con Mercado Pago
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
      <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm font-medium text-red-600">
        {error}
      </p>
    </div>
  );
}
