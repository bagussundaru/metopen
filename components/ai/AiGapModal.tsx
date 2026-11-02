"use client";

import { useState } from "react";
import { useAiStatus } from "./useAiStatus";
import { Canvas } from "@/lib/types/canvas";
import { Sparkles, Loader2, Check, BookOpen, X, ShieldAlert } from "lucide-react";

interface AiGapModalProps {
  canvas: Canvas;
  onApplySentences: (sentences: [string, string, string]) => void;
}

interface GapSynthesisResult {
  sentences: [string, string, string];
  gapKeywordsUsed: string[];
  synthesisRationale: string;
}

export function AiGapModal({ canvas, onApplySentences }: AiGapModalProps) {
  const { enabled } = useAiStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GapSynthesisResult | null>(null);

  const referencesCount = canvas.background.references.length;

  const handleFetchSynthesis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/sharpen-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: canvas.title.composed || "Penelitian Rekayasa Sipil",
          currentSentences: canvas.background.sentences.filter(Boolean),
          references: canvas.background.references,
          pinnedFindings: canvas.literatureMap?.pinnedFindings.map(
            (p) => `${p.label}: ${p.description}`
          ),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyintesis latar belakang.");
      }
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!result) {
      handleFetchSynthesis();
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
            ? "Sintesiskan 3 kalimat latar belakang & research gap dari daftar pustaka terlampir"
            : "Fitur AI dinonaktifkan (Mode Rule-Based Aktif)"
        }
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Sintesiskan 3 Kalimat (AI)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Sintesis Latar Belakang & Research Gap (Gemini AI)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Formulasi ketat 3 kalimat: Status Literatur &rarr; Research Gap &rarr; Urgensi Rekayasa
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

            {/* Strict Zero-Hallucination Disclaimer */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Prinsip Anti-Halusinasi Sitasi:</strong> AI hanya mengolah {referencesCount} referensi yang Anda lampirkan di Langkah 2. AI tidak diperbolehkan mengarang atau memalsukan nama penulis/jurnal lain.
              </div>
            </div>

            {loading && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs text-slate-500">
                  Menganalisis temuan kunci dan menyintesis research gap 3 kalimat...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Kalimat 1: Status Literatur Terkini (State of the Art)
                    </span>
                    <p className="text-xs text-slate-900 dark:text-white leading-relaxed font-medium">
                      {result.sentences[0]}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      Kalimat 2: Research Gap & Keterbatasan
                    </span>
                    <p className="text-xs text-slate-900 dark:text-white leading-relaxed font-medium">
                      {result.sentences[1]}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-1">
                    <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                      Kalimat 3: Urgensi Rekayasa & Solusi yang Ditawarkan
                    </span>
                    <p className="text-xs text-slate-900 dark:text-white leading-relaxed font-medium">
                      {result.sentences[2]}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Penanda Gap:</span>{" "}
                    {result.gapKeywordsUsed.join(", ") || "-"}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Rasional Sintesis:</span>{" "}
                    {result.synthesisRationale}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleFetchSynthesis}
                disabled={loading}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Sintesiskan Ulang
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Batal
                </button>
                {result && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplySentences(result.sentences);
                      setIsOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Terapkan ke 3 Kalimat Kanvas</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
