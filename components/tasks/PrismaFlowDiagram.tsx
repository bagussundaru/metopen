"use client";

import { PrismaFlowData } from "@/lib/types/tasks";
import { ArrowDown, CheckCircle2, Search, Trash2 } from "lucide-react";

interface PrismaFlowDiagramProps {
  data: PrismaFlowData;
  onChange?: (updated: PrismaFlowData) => void;
  isEditable?: boolean;
}

export function PrismaFlowDiagram({ data, onChange, isEditable = true }: PrismaFlowDiagramProps) {
  const updateField = <K extends keyof PrismaFlowData>(field: K, value: PrismaFlowData[K]) => {
    if (!onChange) return;
    onChange({
      ...data,
      [field]: value,
    });
  };

  const totalIdentified = (data.recordsIdentified || 0) + (data.additionalRecords || 0);
  const screenedCount = Math.max(0, totalIdentified - (data.duplicatesRemoved || 0));
  const fullTextCount = Math.max(0, screenedCount - (data.recordsExcluded || 0));
  const includedCount = Math.max(0, fullTextCount - (data.fullTextExcluded || 0));

  return (
    <div className="space-y-6">
      {/* PRISMA 2020 Diagram Container */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Standar Metodologi Pelaporan
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Diagram Alir PRISMA 2020 (Penelusuran Aktual)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Acuan: Page dkk. (2021) PRISMA Statement
          </span>
        </div>

        {/* Phase 1: IDENTIFIKASI */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-[10px] uppercase tracking-wider">
              Tahap 1: Identifikasi (Identification)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-blue-200 dark:border-blue-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Hasil Penelusuran Basis Data Utama (Scopus):</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Artikel ditemukan dari kueri Boolean operasional pada Scopus
              </p>
              {isEditable ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">n =</span>
                  <input
                    type="number"
                    value={data.recordsIdentified}
                    onChange={(e) => updateField("recordsIdentified", parseInt(e.target.value, 10) || 0)}
                    className="w-28 p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-sm text-blue-700 dark:text-blue-300"
                  />
                  <span className="text-xs text-slate-400">dokumen</span>
                </div>
              ) : (
                <div className="text-lg font-black text-blue-700 dark:text-blue-300">
                  n = {data.recordsIdentified} dokumen
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Search className="w-4 h-4 text-indigo-500" />
                <span>Sumber Tambahan / Basis Data Lain:</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Identifikasi dari Web of Science, CrossRef, atau daftar sitasi manual
              </p>
              {isEditable ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">n =</span>
                  <input
                    type="number"
                    value={data.additionalRecords}
                    onChange={(e) => updateField("additionalRecords", parseInt(e.target.value, 10) || 0)}
                    className="w-28 p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-sm"
                  />
                  <span className="text-xs text-slate-400">dokumen</span>
                </div>
              ) : (
                <div className="text-lg font-black text-slate-800 dark:text-slate-200">
                  n = {data.additionalRecords} dokumen
                </div>
              )}
            </div>
          </div>

          {/* Duplicates Removal Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Trash2 className="w-4 h-4 text-amber-600" />
              <span>Dokumen duplikat yang dihapus sebelum penapisan (Duplicates Removed):</span>
            </div>
            {isEditable ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 dark:text-amber-200">n =</span>
                <input
                  type="number"
                  value={data.duplicatesRemoved}
                  onChange={(e) => updateField("duplicatesRemoved", parseInt(e.target.value, 10) || 0)}
                  className="w-24 p-1 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 font-bold text-xs text-amber-900 dark:text-amber-200"
                />
              </div>
            ) : (
              <span className="font-extrabold text-amber-900 dark:text-amber-200">
                n = {data.duplicatesRemoved}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-slate-400" />
        </div>

        {/* Phase 2: PENAPISAN (Screening) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[10px] uppercase tracking-wider">
              Tahap 2: Penapisan Judul &amp; Abstrak (Screening)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-indigo-200 dark:border-indigo-900 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Jumlah Dokumen yang Ditapis (Records Screened):
              </span>
              <p className="text-[11px] text-slate-500">
                Total identifikasi dikurangi artikel duplikat
              </p>
              <div className="text-xl font-extrabold text-indigo-700 dark:text-indigo-300">
                n = {screenedCount} dokumen
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1.5">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                Dokumen yang Dieliminasi pada Judul/Abstrak:
              </span>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                Tidak memenuhi ruang lingkup teknik sipil atau kriteria inklusi
              </p>
              {isEditable ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">n =</span>
                  <input
                    type="number"
                    value={data.recordsExcluded}
                    onChange={(e) => updateField("recordsExcluded", parseInt(e.target.value, 10) || 0)}
                    className="w-28 p-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 font-bold text-sm text-rose-700 dark:text-rose-300"
                  />
                </div>
              ) : (
                <div className="text-lg font-black text-rose-700 dark:text-rose-300">
                  n = {data.recordsExcluded} dokumen
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-slate-400" />
        </div>

        {/* Phase 3: KELAYAKAN (Eligibility) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-[10px] uppercase tracking-wider">
              Tahap 3: Penilaian Kelayakan Naskah Lengkap (Eligibility)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-purple-200 dark:border-purple-900 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Naskah Lengkap Ditelaah Kelayakannya:
              </span>
              <p className="text-[11px] text-slate-500">
                Artikel yang lolos penapisan abstrak dan dicari naskah lengkapnya
              </p>
              <div className="text-xl font-extrabold text-purple-700 dark:text-purple-300">
                n = {fullTextCount} naskah
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1.5">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                Naskah Lengkap Dikeluarkan (Excluded with reasons):
              </span>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                Tidak ada data parameter terukur / bukan elemen struktural atau PSDAL
              </p>
              {isEditable ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">n =</span>
                  <input
                    type="number"
                    value={data.fullTextExcluded}
                    onChange={(e) => updateField("fullTextExcluded", parseInt(e.target.value, 10) || 0)}
                    className="w-28 p-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 font-bold text-sm text-rose-700 dark:text-rose-300"
                  />
                </div>
              ) : (
                <div className="text-lg font-black text-rose-700 dark:text-rose-300">
                  n = {data.fullTextExcluded} naskah
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-emerald-500 font-bold" />
        </div>

        {/* Phase 4: INKLUSI FINAL */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-2 border-emerald-500/40 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Tahap 4: Artikel Final yang Diinklusi dalam Analisis Bibliometrik (Included Studies)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Jumlah artikel ilmiah final yang diolah ke dalam VOSviewer dan Biblioshiny untuk pemetaan ko-okurensi kata kunci, jaringan kolaborasi, analisis kinerja, dan identifikasi kesenjangan riset:
          </p>
          <div className="flex items-center gap-3 pt-1">
            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
              n = {includedCount} artikel
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-bold">
              Data Aktual Scopus
            </span>
          </div>
        </div>

        {/* Inklusi & Eksklusi Narrative Box */}
        {isEditable && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Kriteria Inklusi (Inclusion Criteria):
              </label>
              <textarea
                rows={3}
                value={data.inclusionCriteriaText}
                onChange={(e) => updateField("inclusionCriteriaText", e.target.value)}
                placeholder="mis. Artikel jurnal peer-reviewed, terindeks Scopus, fokus pada aplikasi elemen struktur..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Kriteria Eksklusi (Exclusion Criteria):
              </label>
              <textarea
                rows={3}
                value={data.exclusionCriteriaText}
                onChange={(e) => updateField("exclusionCriteriaText", e.target.value)}
                placeholder="mis. Dokumen bukan bahasa Inggris, opini editorial, artikel tanpa naskah lengkap..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
