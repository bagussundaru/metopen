"use client";

import { useAiStatus } from "./useAiStatus";
import { Sparkles, ShieldCheck, Info } from "lucide-react";

export function AiStatusBadge() {
  const { enabled, model, loading } = useAiStatus();

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-500 animate-pulse">
        Memeriksa status AI...
      </span>
    );
  }

  if (enabled) {
    return (
      <span
        title={`Model: ${model || "Gemini"} via SDK resmi Google GenAI`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        AI Gemini Aktif ({model})
      </span>
    );
  }

  return (
    <span
      title="Aplikasi berjalan penuh tanpa login dan tanpa backend menggunakan validasi rule-based akademik."
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
      Mode Rule-Based Aktif (Fitur AI Opsional)
      <span className="cursor-help" title="Untuk mengaktifkan fitur AI, tambahkan GEMINI_API_KEY di .env.local">
        <Info className="w-3 h-3 text-slate-400" />
      </span>
    </span>
  );
}
