"use client";

import { useTaskStore } from "@/lib/store/task-store";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Task1PaperAnalysis } from "@/components/tasks/Task1PaperAnalysis";
import { Task2ResearchDesign } from "@/components/tasks/Task2ResearchDesign";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Download,
  Upload,
  Network,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TasksPage() {
  const {
    activeTaskTab,
    setActiveTaskTab,
    exportTasksAsJson,
    importTasksFromJson,
    syncFromCanvas,
  } = useTaskStore();
  const { canvases, activeCanvasId } = useCanvasStore();
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const activeCanvas = canvases.find((c) => c.id === activeCanvasId) || canvases[0];

  const handleDownloadBackup = () => {
    const jsonStr = exportTasksAsJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cadangan-Tugas-Metopen-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importTasksFromJson(content);
      if (res.success) {
        setImportStatus("Cadangan tugas berhasil dimuat!");
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(`Gagal memuat: ${res.error}`);
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-blue-600">Beranda</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold">Tugas Analisis &amp; Rancangan Bibliometrik</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span>Modul Tugas Penelitian Bibliometrik S2</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Mata Kuliah Metodologi Penelitian &bull; Dosen: Dr.-Ing. Ir. Satoto E. Nayono, M.Eng., M.Sc.
            </p>
          </div>

          {/* Backup / Restore Controls */}
          <div className="flex items-center gap-2 text-xs">
            {importStatus && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {importStatus}
              </span>
            )}
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Unduh file JSON cadangan seluruh pengerjaan Tugas 1 & Tugas 2"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cadangkan JSON</span>
            </button>

            <label className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pulihkan JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 3-Step Guided Workflow Banner */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Urutan Alur Kerja Terpadu Riset Pascasarjana:
            </span>
            {activeCanvas && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate max-w-sm">
                Kanvas Terhubung: {activeCanvas.title.composed || activeCanvas.title.subject || "Draf Tesis"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            {/* Step 1 */}
            <Link
              href={activeCanvas ? `/editor/${activeCanvas.id}` : "/"}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                <Network className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 flex items-center gap-1">
                  <span>1. Peta Literatur Scopus</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-slate-500 truncate">Cari judul &amp; kirim 3 paper Scopus</p>
              </div>
            </Link>

            {/* Step 2 */}
            <Link
              href={activeCanvas ? `/editor/${activeCanvas.id}` : "/"}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 flex items-center gap-1">
                  <span>2. Wizard Kanvas Tesis</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-slate-500 truncate">Rumuskan Judul, Gap &amp; 5–7 RQs</p>
              </div>
            </Link>

            {/* Step 3 (Current) */}
            <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-slate-950 dark:text-amber-200 flex items-center gap-1.5">
                  <span>3. Selaraskan Tugas 1 &amp; 2</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 truncate">
                  Ekspor PDF Tugas 1 &amp; Tugas 2
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sync from Canvas Banner */}
        {activeCanvas && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Tersedia rumusan dari Kanvas aktif: <strong>{activeCanvas.title.composed || activeCanvas.title.subject}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                syncFromCanvas(activeCanvas);
                setImportStatus("Data berhasil ditarik dari Kanvas aktif ke Tugas 2!");
                setTimeout(() => setImportStatus(null), 3000);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tarik Data Kanvas ke Tugas 2</span>
            </button>
          </div>
        )}

        {/* Big Tab Switcher for Tugas 1 vs Tugas 2 */}
        <div className="p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTaskTab("task1")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTaskTab === "task1"
                ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>TUGAS 1: Analisis 3 Paper Bibliometrik (Tabel 13 Aspek)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTaskTab("task2")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTaskTab === "task2"
                ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>TUGAS 2: Rancangan Penelitian Bibliometrik (7 Komponen &amp; PRISMA)</span>
          </button>
        </div>

        {/* Tab 1 Content */}
        {activeTaskTab === "task1" && <Task1PaperAnalysis />}

        {/* Tab 2 Content */}
        {activeTaskTab === "task2" && <Task2ResearchDesign />}
      </main>

      <Footer />
    </div>
  );
}
