"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { ArrowLeft, Printer } from "lucide-react";
import { validateEntireCanvas } from "@/lib/validators/index";

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

function PrintContent({ params }: PrintPageProps) {
  const resolvedParams = use(params);
  const { canvases, isHydrated } = useCanvasStore();

  const canvas = canvases.find((c) => c.id === resolvedParams.id);

  if (!isHydrated) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Memuat dokumen cetak...
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Kanvas tidak ditemukan.
      </div>
    );
  }

  const validation = validateEntireCanvas(canvas);
  const rubric = validation.rubric;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8">
      {/* Action Toolbar (Hidden during print) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <Link
          href={`/editor/${canvas.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Editor</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Sheet */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Academic Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                PASCA SARJANA {canvas.meta.institution.toUpperCase()}
              </span>
              <h1 className="text-xl font-extrabold tracking-tight mt-0.5">
                KANVAS TOPIK TESIS (SEMINAR PROPOSAL)
              </h1>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Program Studi: {canvas.meta.prodi} &bull; Mata Kuliah: {canvas.meta.course}
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">{canvas.meta.studentName || "Nama Mahasiswa"}</p>
              <p className="text-slate-500">NIM: {canvas.meta.nim || "-"}</p>
              <p className="text-slate-500 text-[11px] mt-1">Dosen: {canvas.meta.lecturer || "-"}</p>
            </div>
          </div>
        </div>

        {/* 1. Judul Sementara */}
        <div className="mb-6 avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 mb-2">
            1. Judul Sementara Penelitian
          </h2>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-sm leading-snug">
              {canvas.title.composed || "Judul belum dirumuskan"}
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
              <div><strong>Subjek:</strong> {canvas.title.subject || "-"}</div>
              <div><strong>Intervensi:</strong> {canvas.title.intervention || "-"}</div>
              <div><strong>Hasil Ukur:</strong> {canvas.title.outcome || "-"}</div>
            </div>
          </div>
        </div>

        {/* 2. Latar Belakang & Gap */}
        <div className="mb-6 avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 mb-2">
            2. Latar Belakang & Research Gap (&le; 3 Kalimat Sintesis)
          </h2>
          <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p>1. {canvas.background.sentences[0] || <span className="italic text-slate-400">Kalimat 1 belum diisi</span>}</p>
            <p>2. {canvas.background.sentences[1] || <span className="italic text-slate-400">Kalimat 2 belum diisi</span>}</p>
            <p>3. {canvas.background.sentences[2] || <span className="italic text-slate-400">Kalimat 3 belum diisi</span>}</p>
          </div>
        </div>

        {/* 3. Pertanyaan Riset Utama */}
        <div className="mb-6 avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 mb-2">
            3. Pertanyaan Riset Utama & Variabel
          </h2>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <p className="font-bold text-slate-900">
              {canvas.researchQuestion.main || "Pertanyaan riset belum diisi"}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
              <div>
                <strong>Variabel Bebas:</strong> {canvas.researchQuestion.variables.independent.join(", ") || "-"}
              </div>
              <div>
                <strong>Variabel Terikat:</strong> {canvas.researchQuestion.variables.dependent.join(", ") || "-"}
              </div>
              <div className="col-span-2">
                <strong>Indikator Terukur:</strong> {canvas.researchQuestion.measurableIndicator || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Metode & Kebutuhan Data */}
        <div className="mb-6 avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 mb-2">
            4. Metode Inti & Kepastian Kebutuhan Data
          </h2>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <p><strong>Pendekatan:</strong> {canvas.method.approach.replace(/_/g, " ").toUpperCase()}</p>
            <p className="text-slate-700">{canvas.method.description || "-"}</p>
            <p className="text-[11px] text-slate-600">
              <strong>Standar Baku:</strong> {canvas.method.standards.join("; ") || "-"}
            </p>

            {/* Data Table */}
            <table className="w-full text-left text-[11px] mt-2 border-collapse border border-slate-300">
              <thead className="bg-slate-200 font-bold">
                <tr>
                  <th className="p-1.5 border border-slate-300">Data</th>
                  <th className="p-1.5 border border-slate-300">Sumber</th>
                  <th className="p-1.5 border border-slate-300">Status</th>
                  <th className="p-1.5 border border-slate-300">Durasi</th>
                </tr>
              </thead>
              <tbody>
                {canvas.method.dataNeeds.map((d, i) => (
                  <tr key={i}>
                    <td className="p-1.5 border border-slate-300 font-medium">{d.name}</td>
                    <td className="p-1.5 border border-slate-300">{d.source}</td>
                    <td className="p-1.5 border border-slate-300 uppercase text-[10px]">{d.availability}</td>
                    <td className="p-1.5 border border-slate-300">{d.timeEstimateWeeks || 1} minggu</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Validasi Kelayakan */}
        <div className="avoid-break mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 mb-2">
            5. Evaluasi Kelayakan & Rubrik Akademik
          </h2>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
            <div>
              <p className="font-bold">Status: {rubric.statusText}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Rata-rata Skor: {rubric.averageScore} / 4.0
              </p>
            </div>
            <div className="text-right text-[11px] space-y-0.5">
              <p>Gap: {rubric.scores.gapClarity}/4 &bull; Novelty: {rubric.scores.novelty}/4</p>
              <p>Relevansi: {rubric.scores.engineeringRelevance}/4 &bull; Metode: {rubric.scores.methodFit}/4</p>
              <p>Data: {rubric.scores.dataFeasibility}/4</p>
            </div>
          </div>
        </div>

        {/* 6. Lampiran: Protokol Bibliometrik (jika ada) */}
        {canvas.literatureMap && canvas.literatureMap.nodeCount > 0 && (
          <div className="avoid-break">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 mb-2">
              Lampiran: Protokol Metode Analisis Bibliometrik (VOSviewer & Scopus)
            </h2>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <strong>Kueri Boolean:</strong> <code className="font-mono text-[10px]">{canvas.literatureMap.booleanQuery || canvas.literatureMap.searchQuery || canvas.title.subject}</code>
                </div>
                <div>
                  <strong>Basis Data:</strong> Scopus, OpenAlex, CrossRef, Europe PMC, Google Scholar
                </div>
                <div>
                  <strong>Statistik Ekstraksi:</strong> {canvas.literatureMap.nodeCount} kata kunci &bull; {canvas.literatureMap.edgeCount} relasi tautan
                </div>
                <div>
                  <strong>Metode Normalisasi:</strong> Association Strength (Van Eck &amp; Waltman, 2010) &amp; Louvain
                </div>
              </div>

              {canvas.literatureMap.pinnedFindings && canvas.literatureMap.pinnedFindings.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="font-bold text-[11px] text-slate-700 mb-1">Temuan Kunci Celah Riset (Research Gap Pinned):</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                    {canvas.literatureMap.pinnedFindings.map((f) => (
                      <li key={f.id}>
                        <strong>[{f.type.toUpperCase()}] {f.label}:</strong> {f.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PrintPage(props: PrintPageProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Memuat...</div>}>
      <PrintContent {...props} />
    </Suspense>
  );
}
