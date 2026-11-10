"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { CanvasCard } from "@/components/dashboard/CanvasCard";
import { ImportModal } from "@/components/dashboard/ImportExportModal";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Plus,
  Upload,
  Search,
  HardDrive,
  FileSpreadsheet,
  Lightbulb,
  GraduationCap,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { canvases, createCanvas, loadExampleCanvas, isHydrated } = useCanvasStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleCreateNew = () => {
    const newId = createCanvas();
    router.push(`/editor/${newId}`);
  };

  const handleLoadExample = () => {
    const exampleId = loadExampleCanvas();
    router.push(`/editor/${exampleId}`);
  };

  const filteredCanvases = canvases.filter((c) => {
    const query = searchQuery.toLowerCase();
    const title = (c.title.composed || c.title.subject || "").toLowerCase();
    const student = (c.meta.studentName || "").toLowerCase();
    const nim = (c.meta.nim || "").toLowerCase();
    return title.includes(query) || student.includes(query) || nim.includes(query);
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-10 shadow-xl shadow-blue-500/10 mb-8">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium mb-4 text-blue-100">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Standar Pascasarjana &bull; Scopus & Google Scholar Ready</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              Susun & Validasi Kanvas Topik Tesis Anda Secara Ilmiah
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed mb-6">
              Panduan terstruktur 5 komponen tesis rekayasa: Judul terukur, sintesis gap &le; 3 kalimat, pencegah jebakan novelty semu (lokasi & software), kepastian data, dan validasi rubrik otomatis.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-blue-700" />
                <span>Buat Kanvas Baru</span>
              </button>

              <button
                onClick={handleLoadExample}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm backdrop-blur transition-all active:scale-95"
              >
                <Lightbulb className="w-4 h-4 text-amber-300" />
                <span>Muat Contoh Tesis (Teknik Sipil)</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-medium text-xs sm:text-sm backdrop-blur transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Impor Cadangan JSON</span>
              </button>
            </div>
          </div>

          {/* Decorative background grid */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
            <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
        </div>

        {/* Local Storage & Privacy Notice Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex-shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Penyimpanan Mandiri &amp; Privasi Aman (Local-First)
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Semua draf tersimpan di browser Anda tanpa registrasi akun. Gunakan tombol &quot;Unduh JSON&quot; untuk mencadangkan atau memindahkan draf antar laptop.
              </p>
            </div>
          </div>
        </div>

        {/* Modul Penugasan Kuliah Metodologi Penelitian */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-amber-300 dark:border-amber-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wide">
                  Tugas Kuliah S2 Teknik Sipil
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Dosen Pengampu: Dr.-Ing. Ir. Satoto E. Nayono, M.Eng., M.Sc.
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Penugasan Analisis &amp; Rancangan Penelitian Berbasis Bibliometrik
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Aplikasi telah dilengkapi modul khusus untuk menyelesaikan <strong>Tugas 1 (Tabel Analisis 3 Paper Bibliometrik)</strong> dan <strong>Tugas 2 (Rancangan Penelitian Bibliometrik 7 Komponen &amp; PRISMA)</strong> lengkap dengan generator kueri Scopus dan ekspor PDF resmi siap kumpul.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/tasks"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-slate-950" />
                <span>Buka Modul Tugas (Tugas 1 &amp; 2)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Drafts Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Daftar Draf Kanvas
              </h2>
              <p className="text-xs text-slate-500">
                Kelola beberapa topik tesis untuk didiskusikan bersama dosen pembimbing
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari draf judul / nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Canvas Cards Grid */}
          {!isHydrated ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-5"
                />
              ))}
            </div>
          ) : filteredCanvases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCanvases.map((canvas) => (
                <CanvasCard key={canvas.id} canvas={canvas} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/50">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">
                {searchQuery ? "Draf Tidak Ditemukan" : "Belum Ada Draf Kanvas"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                {searchQuery
                  ? "Coba kata kunci pencarian lain atau bersihkan kotak pencarian."
                  : "Mulai susun topik tesis Anda dari nol atau muat contoh kanvas Teknik Sipil untuk melihat format standar."}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Kanvas Baru</span>
                </button>
                <button
                  onClick={handleLoadExample}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Muat Contoh Tesis</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
