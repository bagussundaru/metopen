"use client";

import { useTaskStore } from "@/lib/store/task-store";
import { PrismaFlowDiagram } from "@/components/tasks/PrismaFlowDiagram";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { OfficialKopSurat } from "@/components/tasks/OfficialKopSurat";

const emptySubscribe = () => () => {};

export default function PrintTask2Page() {
  const { task2 } = useTaskStore();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const currentDate = isMounted
    ? new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const fileNameSuggestion = `${task2.meta.nim || "NIM"}_Rancangan Bibliometrik.pdf`;

  useEffect(() => {
    document.title = `${task2.meta.nim || "NIM"}_Rancangan Bibliometrik`;
  }, [task2.meta.nim]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 text-slate-900 print:bg-white print:p-0 print:m-0">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Editor Tugas</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Nama File Rekomendasi Dosen:
            </span>
            <code className="text-blue-600 dark:text-blue-400 font-mono font-bold">
              {fileNameSuggestion}
            </code>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan ke PDF Sekarang</span>
          </button>
        </div>
      </div>

      {/* Official A4 Document Container */}
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-14 shadow-lg rounded-2xl border border-slate-200 print:shadow-none print:border-none print:p-2 print:max-w-none text-slate-900 text-xs font-serif leading-relaxed space-y-6">
        {/* Official Kop Surat UNY */}
        <OfficialKopSurat />

        {/* Title Header */}
        <div className="text-center mb-6 space-y-1">
          <h2 className="font-bold text-sm sm:text-base tracking-tight text-slate-950 uppercase font-serif">
            TUGAS 2: RANCANGAN PENELITIAN BIBLIOMETRIK
          </h2>
          <p className="text-[11px] font-sans text-slate-600">
            Mata Kuliah: Metodologi Penelitian &bull; Dosen Pengampu: Dr.-Ing. Ir. Satoto E. Nayono, M.Eng., M.Sc.
          </p>
        </div>

        {/* Student Identity Block (Matches PDF) */}
        <div className="mb-4 space-y-1 text-xs text-slate-900 font-sans">
          <div className="flex">
            <span className="w-36 inline-block font-semibold">Nama Mahasiswa</span>
            <span>: {task2.meta.studentName || "Bagus Sundaru"}</span>
          </div>
          <div className="flex">
            <span className="w-36 inline-block font-semibold">NIM</span>
            <span>: {task2.meta.nim || "24052380001"}</span>
          </div>
          <div className="flex">
            <span className="w-36 inline-block font-semibold">Peminatan Bidang</span>
            <span>: {task2.meta.specialization || "Teknik Struktur / Interdisipliner"}</span>
          </div>
          <div className="flex">
            <span className="w-36 inline-block font-semibold">Tahun Akademik</span>
            <span>: {task2.meta.academicYear || "Gasal 2026/2027"}</span>
          </div>
        </div>

        {/* 7 KOMPONEN TUGAS 2 */}
        <div className="space-y-6 font-sans">
          {/* Komponen 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              1. Tema dan Usulan Judul Penelitian
            </h4>
            <div className="pl-4 space-y-1.5 text-xs text-slate-800">
              <p><strong>Tema Penelitian:</strong> {task2.theme || "Belum diisi"}</p>
              <p><strong>Usulan Judul Lengkap:</strong> &ldquo;{task2.proposedTitle || "Belum diisi"}&rdquo;</p>
              <p className="text-slate-700 leading-relaxed text-justify">
                <strong>Kebaruan dan Ruang Lingkup:</strong> {task2.titleNoveltyRationale || "Belum diisi"}
              </p>
            </div>
          </div>

          {/* Komponen 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              2. Urgensi dan Argumentasi Pemilihan Topik
            </h4>
            <div className="pl-4 space-y-2 text-xs text-slate-800 text-justify">
              <p><strong>a. Urgensi Topik:</strong> {task2.urgencyAndImportance}</p>
              <p><strong>b. Kajian Penelitian Terdahulu:</strong> {task2.previousStudiesReview}</p>
              <p><strong>c. Kesenjangan Riset (Research Gap):</strong> {task2.unansweredResearchGap}</p>
              <p><strong>d. Relevansi Pendekatan Bibliometrik:</strong> {task2.bibliometricApproachRationale}</p>
            </div>
          </div>

          {/* Komponen 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              3. Rumusan Pertanyaan Penelitian (Research Questions / RQ)
            </h4>
            <div className="pl-4 space-y-1 text-xs text-slate-800">
              <p className="mb-2 italic text-slate-600">
                Pertanyaan penelitian dirumuskan secara terukur untuk dijawab menggunakan data bibliografis:
              </p>
              <ol className="list-decimal list-inside space-y-1">
                {task2.researchQuestions.map((rq, i) => (
                  <li key={i} className="leading-snug">{rq}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Komponen 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              4. Strategi Penelusuran Literatur (Search Strategy)
            </h4>
            <div className="pl-4 space-y-2 text-xs text-slate-800 text-justify">
              <p>
                <strong>Basis Data Ilmiah:</strong> {task2.targetDatabase} &bull; <em>Alasan:</em> {task2.databaseRationale}
              </p>
              <div>
                <strong>Boolean Search String (Operasional):</strong>
                <div className="p-2.5 mt-1 bg-slate-100 rounded border border-slate-300 font-mono text-[10px] break-all">
                  {task2.booleanSearchString}
                </div>
              </div>
              <p><strong>Catatan Operasional:</strong> {task2.searchStringOperationalNotes}</p>
            </div>
          </div>

          {/* Komponen 5 */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              5. Rancangan Seleksi Artikel dan Pelaporan PRISMA (Data Aktual)
            </h4>
            <div className="pl-4 space-y-3 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-4 text-justify">
                <p><strong>Kriteria Inklusi:</strong> {task2.prisma.inclusionCriteriaText}</p>
                <p><strong>Kriteria Eksklusi:</strong> {task2.prisma.exclusionCriteriaText}</p>
              </div>

              {/* Printable PRISMA Flowchart */}
              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/40">
                <PrismaFlowDiagram data={task2.prisma} isEditable={false} />
              </div>
            </div>
          </div>

          {/* Komponen 6 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              6. Rencana Perangkat dan Teknik Analisis Bibliometrik
            </h4>
            <div className="pl-4 space-y-2 text-xs text-slate-800 text-justify">
              <p><strong>a. VOSviewer:</strong> {task2.vosviewerPlan}</p>
              <p><strong>b. Bibliometrix / Biblioshiny:</strong> {task2.biblioshinyPlan}</p>
              <p><strong>c. Keluaran Analisis yang Diharapkan:</strong> {task2.expectedOutputs}</p>
            </div>
          </div>

          {/* Komponen 7 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              7. Target Kontribusi Akademik
            </h4>
            <div className="pl-4 space-y-2 text-xs text-slate-800 text-justify">
              <p><strong>a. Pemetaan &amp; Pengembangan Pengetahuan:</strong> {task2.knowledgeMappingContribution}</p>
              <p><strong>b. Identifikasi Tema Mapan vs. Kurang Diteliti:</strong> {task2.matureVsUnderResearchedThemes}</p>
              <p><strong>c. Agenda Penelitian Masa Depan (Future Research Agenda):</strong> {task2.futureResearchAgenda}</p>
              <p><strong>d. Relevansi Terhadap Rekayasa Teknik Sipil:</strong> {task2.civilEngineeringRelevance}</p>
              <p><strong>e. Implikasi Terhadap Infrastruktur Berkelanjutan:</strong> {task2.sustainableInfrastructureImplication}</p>
            </div>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="mt-8 pt-4 flex justify-between items-end font-sans text-xs">
          <div>
            <p className="text-[10px] text-slate-500">
              * Dokumen dihasilkan melalui Platform Kanvas Tesis &bull; Tanggal: {currentDate || "..."}
            </p>
          </div>
          <div className="text-center w-56">
            <p className="mb-14">Yogyakarta, {currentDate || "..."}</p>
            <p className="font-bold underline uppercase">{task2.meta.studentName || "Nama Mahasiswa"}</p>
            <p className="text-slate-600">NIM. {task2.meta.nim || "...................."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
