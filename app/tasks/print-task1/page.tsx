"use client";

import { useTaskStore } from "@/lib/store/task-store";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { OfficialKopSurat } from "@/components/tasks/OfficialKopSurat";

const emptySubscribe = () => () => {};

export default function PrintTask1Page() {
  const { task1 } = useTaskStore();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const currentDate = isMounted
    ? new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const fileNameSuggestion = `${task1.meta.nim || "NIM"}_Analisis Artikel.pdf`;

  useEffect(() => {
    // Set document title so browsers suggest this filename when saving as PDF
    document.title = `${task1.meta.nim || "NIM"}_Analisis Artikel`;
  }, [task1.meta.nim]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 text-slate-900 print:bg-white print:p-0 print:m-0">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
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
      <div className="max-w-6xl mx-auto bg-white p-8 sm:p-12 shadow-lg rounded-2xl border border-slate-200 print:shadow-none print:border-none print:p-2 print:max-w-none text-slate-900 text-xs font-serif leading-relaxed">
        {/* Official Kop Surat UNY */}
        <OfficialKopSurat />

        {/* Title Header */}
        <div className="text-center mb-5">
          <h2 className="font-bold text-sm sm:text-base tracking-tight text-slate-950 font-serif">
            Tabel Analisis Paper Bibliometrik
          </h2>
        </div>

        {/* Student Identity Block (Matches Page 3 PDF) */}
        <div className="mb-4 space-y-1 text-xs text-slate-900 font-sans">
          <div className="flex">
            <span className="w-36 inline-block font-semibold">Nama Mahasiswa</span>
            <span>: {task1.meta.studentName || "Bagus Sundaru"}</span>
          </div>
          <div className="flex">
            <span className="w-36 inline-block font-semibold">NIM</span>
            <span>: {task1.meta.nim || "24052380001"}</span>
          </div>
          <div className="flex">
            <span className="w-36 inline-block font-semibold">Peminatan</span>
            <span>: {task1.meta.specialization || "Teknik Struktur/PSDAL"}</span>
          </div>
        </div>

        {/* Official 13-Aspects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-900 font-sans text-[11px] leading-snug">
            <thead>
              <tr className="bg-[#11324d] text-white border-b border-slate-900 font-bold">
                <th className="p-2.5 w-[22%] border border-slate-900 text-center font-bold text-white">Aspek</th>
                <th className="p-2.5 w-[26%] border border-slate-900 text-center font-bold text-white">Artikel 1</th>
                <th className="p-2.5 w-[26%] border border-slate-900 text-center font-bold text-white">Artikel 2</th>
                <th className="p-2.5 w-[26%] border border-slate-900 text-center font-bold text-white">Artikel 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  1. Identitas artikel: judul lengkap, penulis, tahun, nama jurnal, DOI/URL, basis data pengindeks
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top">
                    <strong className="block mb-1">{p.title || `Artikel ${i + 1}`}</strong>
                    <span>{p.authors} ({p.year})</span><br />
                    <em>{p.journal}</em><br />
                    <span className="font-bold text-blue-700">Indeks: {p.indexingDb}</span><br />
                    <span className="font-mono text-[10px] break-all">{p.doi}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  2. Bidang / topik &amp; alasan relevansi
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">{p.topicAndRelevance}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  3. Tujuan umum dan kesenjangan riset
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">{p.generalGoalAndGap}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  4. Research questions (RQs)
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">
                    {p.isRqReconstructed && (
                      <em className="text-[10px] text-amber-800 font-bold block mb-1">[Hasil Rekonstruksi Mahasiswa]:</em>
                    )}
                    {p.researchQuestions}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  5. Basis data (Scopus/WoS/lainnya) dan tanggal pencarian
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">{p.databaseAndSearchDate}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  6. Kueri Boolean lengkap (Search String Operasional)
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top font-mono text-[10px] whitespace-pre-wrap">{p.booleanQuery}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  7. Rentang tahun publikasi
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top">{p.yearRange}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  8. Kriteria seleksi (inklusi &amp; eksklusi data)
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">{p.selectionCriteria}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  9. Tools / perangkat lunak dan teknik analisis
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">{p.toolsAndTechniques}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  10. Temuan utama / pola yang terpetakan
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">{p.mainFindings}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  11. Nilai tambah atau sentuhan akademik (Beyond Descriptive)
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">{p.academicValueAndTouch}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  12. Keterbatasan dan potensi bias
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">{p.limitationsAndBias}</td>
                ))}
              </tr>

              <tr>
                <td className="p-2.5 font-bold border border-slate-900 bg-slate-50">
                  13. Peluang riset lanjutan bagi tesis
                </td>
                {task1.papers.map((p, i) => (
                  <td key={i} className="p-2.5 border border-slate-900 align-top whitespace-pre-wrap">{p.futureResearchOpportunities}</td>
                ))}
              </tr>
            </tbody>
          </table>
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
            <p className="font-bold underline uppercase">{task1.meta.studentName || "Nama Mahasiswa"}</p>
            <p className="text-slate-600">NIM. {task1.meta.nim || "...................."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
