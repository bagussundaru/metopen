"use client";

import { useState } from "react";
import { useAiStatus } from "./useAiStatus";
import { Canvas } from "@/lib/types/canvas";
import { Sparkles, Loader2, Check, Target, X, ArrowRight } from "lucide-react";

interface AiRqModalProps {
  canvas: Canvas;
  onApplyRq: (rqData: {
    main: string;
    type: "empirical" | "numerical" | "both";
    independent: string[];
    dependent: string[];
    measurableIndicator: string;
  }) => void;
}

interface RqVariant {
  question: string;
  type: "empirical" | "numerical" | "both";
  suggestedIndependent: string[];
  suggestedDependent: string[];
  measurableIndicator: string;
  strengths: string;
}

export function AiRqModal({ canvas, onApplyRq }: AiRqModalProps) {
  const { enabled } = useAiStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<RqVariant[]>([]);

  const handleFetchVariants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/rq-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: canvas.title.composed || "Penelitian Rekayasa Sipil",
          approach: canvas.method.approach,
          currentRq: canvas.researchQuestion.main,
          independentVariables: canvas.researchQuestion.variables.independent,
          dependentVariables: canvas.researchQuestion.variables.dependent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mendapatkan variasi RQ.");
      }
      setVariants(data.variants || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (variants.length === 0) {
      handleFetchVariants();
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
            ? "Minta saran variasi Research Question terukur terhindar dari jebakan lokasi/software"
            : "Fitur AI dinonaktifkan (Mode Rule-Based Aktif)"
        }
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Saran Variasi RQ (AI)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Saran Variasi Pertanyaan Riset (Gemini AI)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bebas dari jebakan lokasi &amp; sindrom software, dengan variabel dan indikator terukur
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
                  Merumuskan variasi pertanyaan riset yang teruji dan berbobot...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {!loading && variants.length > 0 && (
              <div className="space-y-4">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 space-y-3 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-1">
                          {v.type === "empirical" ? "Pengujian Empiris (Lab)" : v.type === "numerical" ? "Simulasi Numerik / FEM" : "Empiris & Numerik (Kombinasi)"}
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          &quot;{v.question}&quot;
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onApplyRq({
                            main: v.question,
                            type: v.type,
                            independent: v.suggestedIndependent,
                            dependent: v.suggestedDependent,
                            measurableIndicator: v.measurableIndicator,
                          });
                          setIsOpen(false);
                        }}
                        className="inline-flex shrink-0 items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Terapkan</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                      <div>
                        <span className="font-semibold text-slate-500">Variabel Bebas:</span>{" "}
                        {v.suggestedIndependent.join(", ")}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">Variabel Terikat:</span>{" "}
                        {v.suggestedDependent.join(", ")}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-500">Indikator Terukur:</span>{" "}
                      {v.measurableIndicator}
                    </div>

                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium italic pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <ArrowRight className="w-3 h-3 inline mr-1" />
                      {v.strengths}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleFetchVariants}
                disabled={loading}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Muat Variasi Lain
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
