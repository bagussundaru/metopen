"use client";

import { use, useEffect, Suspense } from "react";
import Link from "next/link";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

function EditorContent({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const { canvases, setActiveCanvasId, isHydrated } = useCanvasStore();

  const canvas = canvases.find((c) => c.id === resolvedParams.id);

  useEffect(() => {
    if (isHydrated && resolvedParams.id) {
      setActiveCanvasId(resolvedParams.id);
    }
  }, [isHydrated, resolvedParams.id, setActiveCanvasId]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-sm text-slate-500 animate-pulse">Memuat data kanvas...</p>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Kanvas Tidak Ditemukan
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Draf yang Anda cari mungkin telah dihapus atau belum pernah dibuat pada perangkat ini.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
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
                <h1 className="font-bold text-lg text-slate-900 dark:text-white truncate max-w-md sm:max-w-xl">
                  {canvas.title.composed || "Draf Kanvas Baru"}
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
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            Editor Kanvas Topik Tesis (Fondasi Fase 1 Selesai).
          </p>
          <p className="text-xs text-slate-400">
            Wizard 5 Langkah, panel validasi rule-based, dan detektor jebakan novelty semu akan diimplementasikan pada Fase 2.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function EditorPage(props: EditorPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <p className="text-sm text-slate-500 animate-pulse">Memuat editor...</p>
        </div>
      }
    >
      <EditorContent {...props} />
    </Suspense>
  );
}

