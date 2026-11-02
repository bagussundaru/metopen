"use client";

import { use, useEffect, Suspense } from "react";
import Link from "next/link";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { Navbar } from "@/components/layout/Navbar";
import { StepWizard } from "@/components/editor/StepWizard";
import { ArrowLeft } from "lucide-react";

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
        <StepWizard canvas={canvas} />
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

