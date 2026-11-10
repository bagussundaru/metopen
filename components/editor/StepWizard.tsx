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
import { LiteratureMapTab } from "@/components/editor/LiteratureMapTab";
import { ExportDialog } from "@/components/export/ExportDialog";
import { AiStatusBadge } from "@/components/ai/AiStatusBadge";
import { useTaskStore } from "@/lib/store/task-store";
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
  GraduationCap,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface StepWizardProps {
  canvas: Canvas;
}

export type MainEditorTab = "network" | "wizard" | "tasks";

export function StepWizard({ canvas }: StepWizardProps) {
  const { updateActiveCanvas } = useCanvasStore();
  const { task1, task2, syncFromCanvas } = useTaskStore();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<MainEditorTab>("network"); // Start from Literature Map & Scopus Search!
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [taskSyncSuccess, setTaskSyncSuccess] = useState<string | null>(null);

  const handleSyncCanvasToTask2 = () => {
    syncFromCanvas(canvas);
    setTaskSyncSuccess("Data rancangan dari Kanvas berhasil diselaraskan ke Tugas 2!");
    setTimeout(() => setTaskSyncSuccess(null), 4000);
  };

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

      {/* 3-Step Guided Workflow Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("network")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "network"
                ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Network className="w-4 h-4 text-blue-600" />
            <span>1. Peta Literatur Scopus (Cari Judul)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wizard")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "wizard"
                ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>2. Wizard Kanvas Tesis (5 Komponen)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "tasks"
                ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span>3. Selaraskan Tugas 1 &amp; Tugas 2</span>
          </button>
        </div>

        <AiStatusBadge />
      </div>

      {taskSyncSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{taskSyncSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer"
          >
            Lihat di Tab Tugas ➔
          </button>
        </div>
      )}

      {/* TAB 1: PETA LITERATUR & PENCARIAN SCOPUS */}
      {activeTab === "network" && (
        <LiteratureMapTab
          canvas={canvas}
          onChange={updateActiveCanvas}
          onNavigateToWizard={() => setActiveTab("wizard")}
          onNavigateToTasks={() => setActiveTab("tasks")}
        />
      )}

      {/* TAB 2: WIZARD 5 KOMPONEN KANVAS */}
      {activeTab === "wizard" && (
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
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
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

          {/* Quick Sync to Task 2 Action Bar */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Rumusan judul &amp; latar belakang di wizard ini dapat dialirkan ke <strong>Tugas 2 (Rancangan Penelitian)</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSyncCanvasToTask2}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Selaraskan ke Tugas 2</span>
            </button>
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
              <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Lanjut ke Langkah {currentStep + 1}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <Link
                        href={`/print/${canvas.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Printer className="w-4 h-4 text-blue-500" />
                        <span>Cetak Kanvas A4</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          handleSyncCanvasToTask2();
                          setActiveTab("tasks");
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                      >
                        <span>Lanjut ke Langkah 3: Selaraskan Tugas</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
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
      )}

      {/* TAB 3: PENYELARASAN TUGAS 1 & TUGAS 2 */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  Langkah 3: Penyelarasan Tugas Kuliah
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Selaraskan Kanvas &amp; Literatur ke Tugas 1 &amp; Tugas 2
                </h2>
                <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl mt-1">
                  Mata Kuliah Metodologi Penelitian &bull; Dosen: Dr.-Ing. Ir. Satoto E. Nayono, M.Eng., M.Sc.
                  Data dari penelusuran Scopus dan perumusan Wizard Kanvas langsung terintegrasi ke format PDF resmi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncCanvasToTask2}
                  className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-blue-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Sinkronkan Ulang dari Kanvas</span>
                </button>

                <Link
                  href="/tasks"
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Buka Modul Tugas Penuh</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Cards for Task 1 and Task 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TUGAS 1 CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Tugas 1: Analisis Paper
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    3 Paper Bibliometrik (Tabel 13 Aspek)
                  </h3>
                </div>
                <Link
                  href="/tasks/print-task1"
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF</span>
                </Link>
              </div>

              <p className="text-xs text-slate-500">
                3 artikel terindeks Scopus Q1/Q2 yang dianalisis:
              </p>

              <div className="space-y-2.5">
                {task1.papers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <strong className="text-slate-900 dark:text-white truncate max-w-xs block font-bold">
                          {p.title || `Paper ${idx + 1} (Belum diisi)`}
                        </strong>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7">
                        {p.journal || "Jurnal Scopus"} &bull; Tahun {p.year || "-"} &bull; {p.citationCount || 0} sitasi
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        p.title
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {p.title ? "Siap Diuji" : "Kosong"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-[11px]">Format: [NIM]_Analisis Artikel.pdf</span>
                <Link
                  href="/tasks"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Edit Lengkap 13 Aspek &rarr;</span>
                </Link>
              </div>
            </div>

            {/* TUGAS 2 CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Tugas 2: Rancangan Mandiri
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    7 Komponen &amp; Diagram PRISMA 2020
                  </h3>
                </div>
                <Link
                  href="/tasks/print-task2"
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF</span>
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Usulan Judul Penelitian:
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {task2.proposedTitle || canvas.title.composed || "Belum dirumuskan"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Penelusuran Scopus &amp; Diagram PRISMA (Aktual):
                  </span>
                  <p className="font-mono text-[11px] text-blue-700 dark:text-blue-300 truncate">
                    {task2.booleanSearchString || "TITLE-ABS-KEY(...)"}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                    Identifikasi: n = {task2.prisma.recordsIdentified} artikel &bull; Inklusi Final: n ={" "}
                    {task2.prisma.studiesIncluded} artikel
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">
                    Pertanyaan Riset (RQs): <strong>{task2.researchQuestions.length} RQs</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                    Standar 5–7 Terpenuhi
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-[11px]">Format: [NIM]_Rancangan Bibliometrik.pdf</span>
                <Link
                  href="/tasks"
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Edit Lengkap 7 Komponen &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
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
