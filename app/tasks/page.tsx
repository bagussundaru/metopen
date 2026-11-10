"use client";

import { useTaskStore } from "@/lib/store/task-store";
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
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TasksPage() {
  const { activeTaskTab, setActiveTaskTab, exportTasksAsJson, importTasksFromJson } = useTaskStore();
  const [importStatus, setImportStatus] = useState<string | null>(null);

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
