"use client";

import { useState } from "react";
import { useAiStatus } from "./useAiStatus";
import { Canvas } from "@/lib/types/canvas";
import { Sparkles, Loader2, Check, ArrowRight, X } from "lucide-react";

interface AiTitleModalProps {
  canvas: Canvas;
  onApplyTitle: (titleObj: {
    subject: string;
    intervention: string;
    outcome: string;
    context?: string;
    composed: string;
  }) => void;
}

interface TitleSuggestion {
  title: string;
  subject: string;
  intervention: string;
  outcome: string;
  context?: string;
  reason: string;
}

export function AiTitleModal({ canvas, onApplyTitle }: AiTitleModalProps) {
  const { enabled } = useAiStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);

  const handleFetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/suggest-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: canvas.title.subject,
          intervention: canvas.title.intervention,
          outcome: canvas.title.outcome,
          context: canvas.title.context,
          currentComposed: canvas.title.composed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mendapatkan saran AI.");
      }
      setSuggestions(data.suggestions || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (suggestions.length === 0) {
      handleFetchSuggestions();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={!enabled}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
          enabled
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer"
            : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
        }`}
        title={
          enabled
            ? "Minta Gemini AI merumuskan 3 alternatif judul yang tajam & akademis"
            : "Fitur AI dinonaktifkan (Mode Rule-Based Aktif)"
        }
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Pertajam Judul (AI)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Saran Alternatif Judul Tesis (Gemini AI)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saran judul taat kaidah rekayasa: Subjek + Intervensi + Hasil Ukur + Konteks
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs text-slate-500">
                  Menganalisis formula judul dan merumuskan alternatif akademis...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="space-y-3">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 space-y-2 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        &quot;{item.title}&quot;
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onApplyTitle({
                            subject: item.subject,
                            intervention: item.intervention,
                            outcome: item.outcome,
                            context: item.context,
                            composed: item.title,
                          });
                          setIsOpen(false);
                        }}
                        className="inline-flex shrink-0 items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Terapkan</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="font-semibold text-slate-400">Subjek:</span> {item.subject}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Intervensi:</span> {item.intervention}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Hasil Ukur:</span> {item.outcome}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Konteks:</span> {item.context || "-"}
                      </div>
                    </div>

                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium italic pt-1">
                      <ArrowRight className="w-3 h-3 inline mr-1" />
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleFetchSuggestions}
                disabled={loading}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Muat Ulang Variasi Lain
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
