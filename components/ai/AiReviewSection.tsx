"use client";

import { useState } from "react";
import { useAiStatus } from "./useAiStatus";
import { Canvas } from "@/lib/types/canvas";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface AiReviewSectionProps {
  canvas: Canvas;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
}

export function AiReviewSection({ canvas, onChange }: AiReviewSectionProps) {
  const { enabled, model } = useAiStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiReview = canvas.feasibility.aiReview;

  const handleRequestReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        canvasId: canvas.id,
        title: canvas.title,
        background: {
          sentences: canvas.background.sentences,
          references: canvas.background.references.map((r) => ({
            authors: r.authors,
            year: r.year,
            title: r.title,
            keyFinding: r.keyFinding,
            limitation: r.limitation,
          })),
        },
        researchQuestion: {
          main: canvas.researchQuestion.main,
          type: canvas.researchQuestion.type,
          variables: canvas.researchQuestion.variables,
          measurableIndicator: canvas.researchQuestion.measurableIndicator,
          hypothesis: canvas.researchQuestion.hypothesis,
        },
        method: {
          approach: canvas.method.approach,
          description: canvas.method.description,
          tools: canvas.method.tools,
          standards: canvas.method.standards,
          dataNeeds: canvas.method.dataNeeds.map((d) => ({
            name: d.name,
            kind: d.kind,
            source: d.source,
            availability: d.availability,
            estimatedSize: d.estimatedSize,
            timeEstimateWeeks: d.timeEstimateWeeks,
          })),
        },
        literatureMapFindings: canvas.literatureMap?.pinnedFindings.map(
          (p) => `${p.label}: ${p.description}`
        ),
      };

      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mendapatkan review AI.");
      }

      onChange((prev) => ({
        ...prev,
        feasibility: {
          ...prev.feasibility,
          aiReview: data,
        },
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              Evaluasi Metodologi Kritis (Gemini AI Reviewer)
            </h3>
            <p className="text-xs text-slate-500">
              Uji ketat 5 pilar kanvas tesis Anda terhadap standar seminar proposal pascasarjana
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRequestReview}
          disabled={!enabled || loading}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            enabled
              ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menganalisis Kanvas...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{aiReview ? "Minta Ulang Review AI" : "Minta Review AI Komprehensif"}</span>
            </>
          )}
        </button>
      </div>

      {!enabled && (
        <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-200">
              Mode Rule-Based Aktif (Fitur AI Gemini Opsional)
            </div>
            <p>
              Aplikasi telah memvalidasi kanvas Anda secara otomatis menggunakan rule engine akademik deterministik. Untuk mengaktifkan reviewer AI Gemini ({model || "gemini-2.5-flash"}), pasang <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">GEMINI_API_KEY</code> pada berkas <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">.env.local</code>.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {aiReview && (
        <div className="space-y-5 pt-2">
          {/* Novelty Trap Alert Banner */}
          {aiReview.noveltyTrapDetected ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Terdeteksi Indikasi Jebakan Novelty Semu!</span>
              </div>
              <p>
                Reviewer AI mendeteksi kecenderungan judul/rumusan masalah yang sekadar menggeser lokasi atau menggunakan software tanpa pembaharuan fenomena rekayasa fisik.
              </p>
              {aiReview.noveltyTrapEvidence && (
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 font-mono text-[11px] text-rose-700 dark:text-rose-300">
                  Kutipan Kalimat: &quot;{aiReview.noveltyTrapEvidence}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Bebas Novelty Semu:</strong> Topik penelitian ini terhindar dari jebakan lokasi semata dan sindrom software komersial.
              </span>
            </div>
          )}

          {/* AI Rubric Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { key: "gapClarity", label: "Kejelasan Gap" },
              { key: "novelty", label: "Kebaruan" },
              { key: "engineeringRelevance", label: "Relevansi" },
              { key: "methodFit", label: "Metode" },
              { key: "dataFeasibility", label: "Data" },
            ].map((crit) => {
              const score = aiReview.scores[crit.key as keyof typeof aiReview.scores];
              return (
                <div
                  key={crit.key}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 text-center space-y-1"
                >
                  <div className="text-[11px] font-semibold text-slate-500">{crit.label}</div>
                  <div className="text-xl font-black text-indigo-600">{score} / 4</div>
                  {aiReview.scoreReasons?.[crit.key] && (
                    <p className="text-[10px] text-slate-400 line-clamp-2">
                      {aiReview.scoreReasons[crit.key]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3 Kelemahan & 3 Saran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weaknesses */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Catatan Kelemahan Metodologis
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {aiReview.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">&bull;</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Saran Konkret Perbaikan
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {aiReview.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>
              Direview pada: {new Date(aiReview.reviewedAt).toLocaleString("id-ID")}
            </span>
            <span className="italic">
              Reviewer: Gemini AI via SDK resmi @google/genai
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
