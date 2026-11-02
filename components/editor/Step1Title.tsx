"use client";

import { useState } from "react";
import { Canvas } from "@/lib/types/canvas";
import {
  FileText,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Edit3,
} from "lucide-react";

interface Step1TitleProps {
  canvas: Canvas;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
}

export function Step1Title({ canvas, onChange }: Step1TitleProps) {
  const [isManualEdit, setIsManualEdit] = useState(false);

  const { subject, intervention, outcome, context, composed } = canvas.title;

  // Generate composed title automatically from components
  const autoComposed = [
    outcome ? outcome.charAt(0).toUpperCase() + outcome.slice(1) : "",
    subject,
    intervention ? `dengan ${intervention}` : "",
    context ? `pada ${context}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const updateTitleField = (field: keyof Canvas["title"], val: string) => {
    onChange((prev) => {
      const updatedTitle = { ...prev.title, [field]: val };
      // If user has not explicitly locked manual edit, update composed automatically
      if (!isManualEdit && field !== "composed") {
        const nextAuto = [
          updatedTitle.outcome ? updatedTitle.outcome.charAt(0).toUpperCase() + updatedTitle.outcome.slice(1) : "",
          updatedTitle.subject,
          updatedTitle.intervention ? `dengan ${updatedTitle.intervention}` : "",
          updatedTitle.context ? `pada ${updatedTitle.context}` : "",
        ]
          .filter(Boolean)
          .join(" ");
        updatedTitle.composed = nextAuto;
      }
      return { ...prev, title: updatedTitle };
    });
  };

  const words = (composed || autoComposed).trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Langkah 1: Perumusan Judul Sementara
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Judul tesis rekayasa harus spesifik dan terukur, memuat kombinasi 3 unsur wajib: <strong>Subjek</strong>, <strong>Intervensi</strong>, dan <strong>Hasil Ukur</strong>.
        </p>
      </div>

      {/* 3 Core Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Field 1: Subjek */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            1. Subjek / Objek Material <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => updateTitleField("subject", e.target.value)}
            placeholder="mis. balok beton bertulang mutu tinggi"
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400">
            Objek fisik atau elemen rekayasa yang diteliti.
          </p>
        </div>

        {/* Field 2: Intervensi */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            2. Intervensi / Perlakuan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={intervention}
            onChange={(e) => updateTitleField("intervention", e.target.value)}
            placeholder="mis. substitusi 15–30% fly ash tipe F"
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400">
            Variabel bebas/perlakuan yang divariasikan.
          </p>
        </div>

        {/* Field 3: Hasil Ukur */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            3. Hasil Ukur & Satuan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={outcome}
            onChange={(e) => updateTitleField("outcome", e.target.value)}
            placeholder="mis. kuat lentur (MPa) dan lendutan (mm)"
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400">
            Parameter kuantitatif terukur di laboratorium/lapangan.
          </p>
        </div>
      </div>

      {/* Optional Context Field */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          Konteks / Batasan Lingkungan (Opsional)
        </label>
        <input
          type="text"
          value={context}
          onChange={(e) => updateTitleField("context", e.target.value)}
          placeholder="mis. pada lingkungan agresif paparan sulfat"
          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-[11px] text-slate-400">
          Batasan kondisi lingkungan, beban ekstrim, atau skala pengujian.
        </p>
      </div>

      {/* Composed Title Preview & Manual Edit */}
      <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
              Pratinjau Judul Lengkap Tersusun
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                wordCount >= 8 && wordCount <= 25
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {wordCount} kata (Ideal: 8–25 kata)
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isManualEdit) {
                // Reset to auto composed
                updateTitleField("composed", autoComposed);
              }
              setIsManualEdit(!isManualEdit);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 hover:underline font-medium"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isManualEdit ? "Pakai Susunan Otomatis" : "Edit Judul Manual"}</span>
          </button>
        </div>

        {isManualEdit ? (
          <textarea
            value={composed}
            onChange={(e) => updateTitleField("composed", e.target.value)}
            rows={2}
            className="w-full text-sm font-semibold p-3 rounded-2xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900 text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
            {composed || autoComposed || (
              <span className="text-slate-400 font-normal italic">
                Isi 3 kotak di atas untuk melihat susunan judul tesis Anda secara otomatis...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Examples Box: Good vs Bad Titles in Civil Engineering */}
      <div className="p-5 rounded-3xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Komparasi Judul Tesis: Standar Dosen Penguji vs Jebakan Umum
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Contoh Judul Baik (Spesifik & Terukur)</span>
            </div>
            <p className="italic font-medium">
              &quot;Kuat Lentur dan Daktilitas Balok Beton Bertulang Mutu Tinggi dengan Substitusi 15–30% Fly Ash Tipe F pada Lingkungan Agresif Sulfat&quot;
            </p>
            <p className="text-[11px] opacity-80 pt-1">
              &bull; <strong>Subjek:</strong> Balok beton bertulang mutu tinggi<br />
              &bull; <strong>Intervensi:</strong> Substitusi 15-30% fly ash<br />
              &bull; <strong>Hasil Ukur:</strong> Kuat lentur dan daktilitas
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Contoh Judul Kurang Pas (Jebakan Umum)</span>
            </div>
            <p className="italic font-medium">
              &quot;Analisis Jembatan Kali Progo Menggunakan Software SAP2000&quot;
            </p>
            <p className="text-[11px] opacity-80 pt-1">
              &bull; Mengandung kata kabur (&quot;Analisis&quot;)<br />
              &bull; Jebakan lokasi semata (&quot;Kali Progo&quot;)<br />
              &bull; Sindrom software (&quot;SAP2000&quot;) tanpa parameter fisik terukur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
