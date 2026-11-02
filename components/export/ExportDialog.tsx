"use client";

import { useState } from "react";
import Link from "next/link";
import { Canvas } from "@/lib/types/canvas";
import { RubricCalculationResult } from "@/lib/validators/rubric-scorer";
import { generateDocxBlob } from "@/lib/export/docx-builder";
import { buildMarkdownExport } from "@/lib/export/markdown-builder";
import {
  Download,
  FileText,
  FileCode,
  FileSpreadsheet,
  Printer,
  X,
  CheckCircle2,
} from "lucide-react";

interface ExportDialogProps {
  canvas: Canvas;
  rubric: RubricCalculationResult;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ canvas, rubric, isOpen, onClose }: ExportDialogProps) {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const nimStr = canvas.meta.nim ? `_${canvas.meta.nim}` : "";
  const dateStr = new Date().toISOString().split("T")[0];
  const baseFilename = `Kanvas-Tesis${nimStr}_${dateStr}`;

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const blob = await generateDocxBlob(canvas, rubric);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseFilename}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadSuccess("DOCX berhasil diunduh.");
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to generate DOCX:", err);
      alert("Gagal membuat berkas DOCX.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = buildMarkdownExport(canvas, rubric);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseFilename}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess("Markdown (.md) berhasil diunduh.");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(canvas, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseFilename}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess("JSON cadangan berhasil diunduh.");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Ekspor Kanvas Topik Tesis
              </h3>
              <p className="text-xs text-slate-500">
                Pilih format dokumen siap kumpul untuk asistensi dosen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {downloadSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* PDF via Print */}
          <Link
            href={`/print/${canvas.id}`}
            onClick={onClose}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all text-left flex flex-col justify-between group"
          >
            <div>
              <Printer className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-105 transition-transform" />
              <h4 className="font-bold text-slate-900 dark:text-white">
                Cetak ke PDF (A4)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Layout resmi standar akademik 1–2 halaman siap cetak/asistensi.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-3 inline-block">
              Buka Halaman Cetak &rarr;
            </span>
          </Link>

          {/* Microsoft Word DOCX */}
          <button
            type="button"
            disabled={downloadingDocx}
            onClick={handleDownloadDocx}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left flex flex-col justify-between group"
          >
            <div>
              <FileText className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-105 transition-transform" />
              <h4 className="font-bold text-slate-900 dark:text-white">
                Microsoft Word (.docx)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Dokumen Word terformat rapi dengan tabel kanvas & rubrik.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-3 inline-block">
              {downloadingDocx ? "Membuat Berkas..." : "Unduh DOCX &rarr;"}
            </span>
          </button>

          {/* Markdown (.md) */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left flex flex-col justify-between group"
          >
            <div>
              <FileCode className="w-6 h-6 text-slate-700 dark:text-slate-300 mb-2 group-hover:scale-105 transition-transform" />
              <h4 className="font-bold text-slate-900 dark:text-white">
                Markdown (.md)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Teks terstruktur dengan tabel GFM untuk GitHub / Obsidian.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-3 inline-block">
              Unduh .md &rarr;
            </span>
          </button>

          {/* JSON Backup (.json) */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all text-left flex flex-col justify-between group"
          >
            <div>
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-105 transition-transform" />
              <h4 className="font-bold text-slate-900 dark:text-white">
                Cadangan Data (.json)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Simpan data mentah agar bisa dipulihkan/dibagikan ke rekan.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-3 inline-block">
              Unduh JSON &rarr;
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
