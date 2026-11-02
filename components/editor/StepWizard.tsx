"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Canvas } from "@/lib/types/canvas";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { validateEntireCanvas } from "@/lib/validators/index";
import { Step1Title } from "@/components/editor/Step1Title";
import { Step2Background } from "@/components/editor/Step2Background";
import { Step3ResearchQuestion } from "@/components/editor/Step3ResearchQuestion";
import { Step4MethodData } from "@/components/editor/Step4MethodData";
import { Step5Feasibility } from "@/components/editor/Step5Feasibility";
import { LiveValidationPanel } from "@/components/editor/LiveValidationPanel";
import { ExportDialog } from "@/components/export/ExportDialog";
import {
  FileText,
  BookOpen,
  Target,
  Wrench,
  Award,
  Network,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Printer,
  Download,
} from "lucide-react";

interface StepWizardProps {
  canvas: Canvas;
}

export function StepWizard({ canvas }: StepWizardProps) {
  const { updateActiveCanvas } = useCanvasStore();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"wizard" | "network">("wizard");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Validate entire canvas live
  const validation = useMemo(() => {
    return validateEntireCanvas(canvas);
  }, [canvas]);

  const stepIssues = validation.stepIssues[currentStep] || [];

  const STEPS = [
    { number: 1, title: "Judul", icon: FileText },
    { number: 2, title: "Latar & Gap", icon: BookOpen },
    { number: 3, title: "Pertanyaan Riset", icon: Target },
    { number: 4, title: "Metode & Data", icon: Wrench },
    { number: 5, title: "Kelayakan", icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Bar: Navigation, Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate max-w-md sm:max-w-xl">
                {canvas.title.composed || "Draf Kanvas Topik Tesis"}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Tersimpan
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {canvas.meta.studentName || "Mahasiswa S2"} &bull; {canvas.meta.institution}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExportDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Kanvas</span>
          </button>

          <Link
            href={`/print/${canvas.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
          >
            <Printer className="w-4 h-4 text-blue-500" />
            <span>Pratinjau Cetak A4</span>
          </Link>
        </div>
      </div>

      {/* Main Tabs (Wizard 5 Langkah vs Peta Literatur VOSviewer) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("wizard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "wizard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Wizard 5 Komponen Kanvas</span>
          </button>

          <button
            onClick={() => setActiveTab("network")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "network"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Peta Literatur (VOSviewer / Scopus)</span>
          </button>
        </div>
      </div>

      {activeTab === "wizard" ? (
        <>
          {/* Stepper Header (5 Steps) */}
          <div className="grid grid-cols-5 gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.number;
              const errorsInStep = (validation.stepIssues[s.number] || []).filter(
                (i) => i.level === "error"
              ).length;

              return (
                <button
                  key={s.number}
                  onClick={() => setCurrentStep(s.number)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900"
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs truncate">{s.title}</span>
                  {errorsInStep > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {errorsInStep}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Wizard Content + Live Validation Side Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Form Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {currentStep === 1 && (
                <Step1Title canvas={canvas} onChange={updateActiveCanvas} />
              )}
              {currentStep === 2 && (
                <Step2Background canvas={canvas} onChange={updateActiveCanvas} />
              )}
              {currentStep === 3 && (
                <Step3ResearchQuestion canvas={canvas} onChange={updateActiveCanvas} />
              )}
              {currentStep === 4 && (
                <Step4MethodData canvas={canvas} onChange={updateActiveCanvas} />
              )}
              {currentStep === 5 && (
                <Step5Feasibility
                  canvas={canvas}
                  rubric={validation.rubric}
                  onChange={updateActiveCanvas}
                />
              )}

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <span>Lanjut ke Langkah {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={`/print/${canvas.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Selesai & Buka Pratinjau Cetak</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Validation Panel Column (1 Col) */}
            <div className="lg:col-span-1">
              <LiveValidationPanel
                currentStep={currentStep}
                stepIssues={stepIssues}
                allIssues={validation.allIssues}
                rubric={validation.rubric}
                onNavigateStep={(s) => setCurrentStep(s)}
              />
            </div>
          </div>
        </>
      ) : (
        /* Literature Map Placeholder (Fase 5) */
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Network className="w-12 h-12 text-blue-500 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Modul Peta Literatur VOSviewer & Scopus CSV
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Visualisasi jaringan kata kunci (Network & Overlay View) dan detektor kandidat research gap interaktif akan diaktifkan pada Fase 5.
          </p>
        </div>
      )}

      <ExportDialog
        canvas={canvas}
        rubric={validation.rubric}
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </div>
  );
}
