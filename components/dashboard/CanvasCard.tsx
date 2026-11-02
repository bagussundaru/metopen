"use client";

import Link from "next/link";
import { Canvas } from "@/lib/schemas/canvas.schema";
import { useCanvasStore } from "@/lib/store/canvas-store";
import {
  Calendar,
  User,
  Copy,
  Trash2,
  Download,
  ArrowRight,
  Database,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

interface CanvasCardProps {
  canvas: Canvas;
}

export function CanvasCard({ canvas }: CanvasCardProps) {
  const { duplicateCanvas, deleteCanvas, exportCanvasAsJson } = useCanvasStore();

  const handleDuplicate = () => {
    duplicateCanvas(canvas.id);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kanvas "${canvas.title.composed || "Draf ini"}"?`
    );
    if (confirmed) {
      deleteCanvas(canvas.id);
    }
  };

  const handleDownloadJson = () => {
    const jsonStr = exportCanvasAsJson(canvas.id);
    if (!jsonStr) return;

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const nimPart = canvas.meta.nim ? `_${canvas.meta.nim}` : "";
    const datePart = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `Kanvas-Tesis${nimPart}_${datePart}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formattedDate = new Date(canvas.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusBadge = () => {
    switch (canvas.feasibility.overallStatus) {
      case "ready":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Siap Diajukan
          </span>
        );
      case "major_revision":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Perlu Revisi Mayor
          </span>
        );
      case "minor_revision":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Perlu Revisi Minor
          </span>
        );
    }
  };

  const titleText =
    canvas.title.composed ||
    (canvas.title.subject
      ? `${canvas.title.subject} - ${canvas.title.intervention || "Topik Riset"}`
      : "Draf Kanvas Belum Diberi Judul");

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {getStatusBadge()}
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 mb-2 leading-snug">
          {titleText}
        </h3>

        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-4">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {canvas.meta.studentName || "Nama belum diisi"}{" "}
              {canvas.meta.nim ? `(${canvas.meta.nim})` : ""}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {canvas.meta.prodi} &bull; {canvas.meta.institution}
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 mb-4">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>{canvas.background.references.length} Referensi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-500" />
            <span>{canvas.method.dataNeeds.length} Kebutuhan Data</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handleDuplicate}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Duplikasi Draf"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadJson}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            title="Unduh Cadangan JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
            title="Hapus Kanvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <Link
          href={`/editor/${canvas.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-500/20"
        >
          <span>Buka Editor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
