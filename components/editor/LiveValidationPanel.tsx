"use client";

import { useState } from "react";
import { ValidationIssue } from "@/lib/types/canvas";
import { RubricCalculationResult } from "@/lib/validators/rubric-scorer";
import {
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LiveValidationPanelProps {
  currentStep: number;
  stepIssues: ValidationIssue[];
  allIssues: ValidationIssue[];
  rubric: RubricCalculationResult;
  onNavigateStep?: (step: number) => void;
}

export function LiveValidationPanel({
  currentStep,
  stepIssues,
  allIssues,
  rubric,
}: LiveValidationPanelProps) {
  const [filter, setFilter] = useState<"current" | "all">("current");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeIssues = filter === "current" ? stepIssues : allIssues;
  const errors = activeIssues.filter((i) => i.level === "error");
  const warnings = activeIssues.filter((i) => i.level === "warning");
  const tips = activeIssues.filter((i) => i.level === "tip");

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm sticky top-20 flex flex-col max-h-[calc(100vh-6rem)]">
      {/* Header with Readiness Summary */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Evaluasi Validasi Dosen
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                rubric.overallStatus === "ready"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : rubric.overallStatus === "major_revision"
                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {rubric.overallStatus === "ready"
                ? "Siap Diajukan"
                : rubric.overallStatus === "major_revision"
                ? "Revisi Mayor"
                : "Revisi Minor"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Rata-rata Skor Rubrik: <span className="font-bold text-blue-600 dark:text-blue-400">{rubric.averageScore} / 4.0</span>
          </p>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
        >
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Toggle View: Langkah Ini vs Semua */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl my-3 text-xs">
            <button
              onClick={() => setFilter("current")}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                filter === "current"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Langkah {currentStep} ({stepIssues.length})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Seluruh Kanvas ({allIssues.length})
            </button>
          </div>

          {/* Quick Issue Stats Badges */}
          <div className="grid grid-cols-3 gap-2 mb-3 text-[11px]">
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.length} Wajib</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{warnings.length} Peringatan</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
              <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{tips.length} Saran</span>
            </div>
          </div>

          {/* Issue List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
            {activeIssues.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-emerald-800 dark:text-emerald-200">
                  Semua Indikator Terpenuhi!
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Komponen pada tahap ini telah mematuhi pedoman akademik dan metodologi rekayasa.
                </p>
              </div>
            ) : (
              activeIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    issue.level === "error"
                      ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200"
                      : issue.level === "warning"
                      ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200"
                      : "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {issue.level === "error" && (
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    {issue.level === "warning" && (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    {issue.level === "tip" && (
                      <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-xs leading-snug">{issue.message}</p>
                      {issue.suggestion && (
                        <p className="text-[11px] opacity-90 mt-1.5 leading-relaxed bg-white/60 dark:bg-black/20 p-2 rounded-xl">
                          💡 <span className="font-medium">Saran Bimbingan:</span> {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
