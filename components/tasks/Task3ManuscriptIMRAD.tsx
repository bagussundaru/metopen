"use client";

import { useTaskStore } from "@/lib/store/task-store";
import {
  Printer,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

export function Task3ManuscriptIMRAD() {
  const { task1, task2 } = useTaskStore();
  const [copied, setCopied] = useState(false);

  const title =
    task2.proposedTitle ||
    "Tingkat Kepatuhan K3 (%) dan Penurunan Risiko FMEA K3 di Lingkungan Data Center Tier 3 & 4 dengan Bahaya Tersembunyi";

  const studentName = task2.meta.studentName || "Bagus Sundaru";
  const nim = task2.meta.nim || "24052380001";
  const spec = task2.meta.specialization;

  const manuscriptText = `NASKAH LENGKAP ARTIKEL BIBLIOMETRIK (FORMAT IMRAD)
Standar: Garza-Reyes (2015) & Donthu et al. (2021)
Mata Kuliah: Metodologi Penelitian Teknik Sipil
Dosen Pengampu: Dr.-Ing. Ir. Satoto E. Nayono, M.Eng., M.Sc.

JUDUL:
${title}

PENULIS:
${studentName} (NIM: ${nim})
Program Magister Teknik Sipil, Konsentrasi: ${spec}

==================================================
ABSTRAK
==================================================
Penelitian ini bertujuan untuk memetakan struktur intelektual, tren evolusi topik, dan kesenjangan riset pada operasional fasilitas teknik sipil dan keselamatan kerja data center menggunakan analisis bibliometrik berbasis Scopus Core Collection dari tahun 2005 hingga 2026. Dengan menerapkan pedoman pelaporan Preferred Reporting Items for Systematic Reviews and Meta-Analyses (PRISMA 2020), sebanyak ${task2.prisma.recordsIdentified} dokumen teridentifikasi dan disaring secara ketat hingga terpilih ${task2.prisma.studiesIncluded} artikel peer-reviewed bereputasi. Analisis ko-okurensi kata kunci dan visualisasi jejaring menggunakan VOSviewer v1.6.20 mengidentifikasi empat klaster tematik utama: manajemen termal, mitigasi kebisingan akustik, penilaian risiko K3, dan telemetri digital. Temuan menunjukkan bahwa integrasi pemantauan multi-parameter real-time merupakan celah riset yang mendesak untuk meningkatkan keselamatan kerja dan keandalan operasional fasilitas misi kritis.
Kata Kunci: Analisis Bibliometrik, VOSviewer, Scopus, Data Center, K3, Telemetri IoT.

==================================================
1. PENDAHULUAN (INTRODUCTION)
==================================================
1.1 Latar Belakang & Urgensi Topik
${task2.urgencyAndImportance}

1.2 Telaah Riset Terdahulu & Research Gap
${task2.previousStudiesReview}
Kesenjangan penelitian yang belum terjawab: ${task2.unansweredResearchGap}

1.3 Pertanyaan Penelitian (Research Questions)
${task2.researchQuestions.map((rq, idx) => `RQ ${idx + 1}: ${rq}`).join("\n")}

==================================================
2. METODOLOGI PENELITIAN (METHODOLOGY)
==================================================
2.1 Basis Data dan Strategi Penelusuran
Basis data: ${task2.targetDatabase}
Kueri Boolean Scopus:
${task2.booleanSearchString}
Catatan operasional: ${task2.searchStringOperationalNotes}

2.2 Protokol Seleksi PRISMA 2020
- Identifikasi: ${task2.prisma.recordsIdentified} dokumen
- Duplikat dibuang: ${task2.prisma.duplicatesRemoved} dokumen
- Skrining judul/abstrak: ${task2.prisma.recordsScreened} dokumen (dieksklusi: ${task2.prisma.recordsExcluded})
- Penilaian naskah lengkap: ${task2.prisma.fullTextAssessed} dokumen (dieksklusi: ${task2.prisma.fullTextExcluded})
- Artikel final dianalisis: ${task2.prisma.studiesIncluded} dokumen
Kriteria Inklusi: ${task2.prisma.inclusionCriteriaText}
Kriteria Eksklusi: ${task2.prisma.exclusionCriteriaText}

2.3 Perangkat Lunak dan Teknik Analisis
${task2.vosviewerPlan}
${task2.biblioshinyPlan}

==================================================
3. HASIL DAN VISUALISASI (RESULTS)
==================================================
3.1 Tren Volume Publikasi dan Sitasi Tahunan
Terjadi peningkatan volume publikasi tahunan secara konsisten, menunjukkan tingginya atensi komunitas akademik global.

3.2 Struktur Jejaring Kolaborasi dan Klaster Tematik
Analisis ko-okurensi kata kunci pada VOSviewer mengelompokkan literatur ke dalam klaster mapan (mature themes) dan klaster kebaruan (emerging themes).

==================================================
4. PEMBAHASAN (DISCUSSION)
==================================================
4.1 Sintesis Kritis Triangulasi Data
${task2.knowledgeMappingContribution}

4.2 Analisis Klaster Mapan vs Celah Riset (Mature vs Under-Researched)
${task2.matureVsUnderResearchedThemes}

==================================================
5. KESIMPULAN DAN AGENDA RISET MASA DEPAN (CONCLUSION)
==================================================
5.1 Kesimpulan
Penelitian bibliometrik ini secara komprehensif memetakan dinamika literatur ilmiah dan menjawab seluruh pertanyaan penelitian yang diajukan.

5.2 Rekomendasi Agenda Riset Lanjutan
${task2.futureResearchAgenda}
Relevansi Teknik Sipil: ${task2.civilEngineeringRelevance}
Implikasi Keberlanjutan: ${task2.sustainableInfrastructureImplication}

==================================================
DAFTAR PUSTAKA (REFERENCES - APA 7TH EDITION)
==================================================
${task1.papers
  .map(
    (p) =>
      `${p.authors} (${p.year}). ${p.title}. ${p.journal}.${
        p.doi ? ` https://doi.org/${p.doi.replace(/^https?:\/\/doi\.org\//, "")}` : ""
      }`
  )
  .join("\n\n")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(manuscriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wide">
                Tugas 3: Naskah Lengkap Artikel Bibliometrik
              </span>
              <span className="text-blue-200 text-xs font-semibold">
                Format IMRAD &bull; Acuan: Garza-Reyes (2015) &amp; Donthu (2021)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Kerangka Naskah Artikel Ilmiah Siap Publikasi
            </h2>
            <p className="text-xs text-blue-100/90 max-w-3xl leading-relaxed">
              Struktur lengkap artikel ilmiah berbasis bibliometrik yang memadukan data dari Tugas 1 dan Tugas 2 ke dalam standar struktur jurnal internasional (Introduction, Methodology, Results, and Discussion).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Tersalin ke Clipboard!" : "Salin Naskah Lengkap"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>Cetak / Ekspor PDF</span>
            </button>
          </div>
        </div>

        {/* Article Capsule */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
            Judul Artikel Ilmiah:
          </span>
          <h3 className="text-base sm:text-lg font-black text-white leading-snug">
            {title}
          </h3>
          <p className="text-xs text-blue-200 mt-1">
            Oleh: <strong>{studentName}</strong> (NIM: {nim}) &bull; Peminatan: {spec}
          </p>
        </div>
      </div>

      {/* IMRAD Sections */}
      <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300">
        {/* Abstract Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-[10px] uppercase">
            Abstrak Terstruktur (Abstract)
          </span>
          <p className="leading-relaxed pt-1">
            Penelitian ini memetakan struktur intelektual, tren evolusi topik, dan kesenjangan riset pada bidang <strong>{task2.theme || "Teknik Sipil & Infrastruktur"}</strong> menggunakan analisis bibliometrik komprehensif Scopus (2005–2026). Mengikuti kaidah PRISMA 2020, sebanyak <strong>{task2.prisma.recordsIdentified}</strong> dokumen diidentifikasi dan <strong>{task2.prisma.studiesIncluded}</strong> artikel terpilih untuk analisis mendalam dengan VOSviewer.
          </p>
        </div>

        {/* 1. Introduction */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">1</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              PENDAHULUAN (INTRODUCTION)
            </h3>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Latar Belakang &amp; Research Gap:</h4>
            <p className="leading-relaxed">{task2.urgencyAndImportance}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Rumusan Masalah (Research Questions):</h4>
            <div className="space-y-1 pl-2 border-l-2 border-blue-500">
              {task2.researchQuestions.map((rq, idx) => (
                <p key={idx}><strong className="text-blue-600 dark:text-blue-400">RQ {idx + 1}:</strong> {rq}</p>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Methodology */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">2</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              METODOLOGI (METHODOLOGY)
            </h3>
          </div>
          <p>
            <strong>Basis Data &amp; Kueri Boolean:</strong> Terindeks {task2.targetDatabase}. Kueri: <code className="p-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-blue-700 dark:text-blue-300">{task2.booleanSearchString}</code>
          </p>
          <p>
            <strong>Alur PRISMA 2020:</strong> Identifikasi ({task2.prisma.recordsIdentified}) &rarr; Skrining ({task2.prisma.recordsScreened}) &rarr; Kelayakan ({task2.prisma.fullTextAssessed}) &rarr; Studi Terinklusi Final (<strong>{task2.prisma.studiesIncluded}</strong>).
          </p>
          <p>
            <strong>Perangkat Analisis:</strong> {task2.vosviewerPlan}
          </p>
        </div>

        {/* 3 & 4. Results & Discussion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">3</span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                HASIL (RESULTS)
              </h3>
            </div>
            <p><strong>Visualisasi Klaster Tematik:</strong> Terpetakan klaster kata kunci dominan dan peta densitas kebaruan (overlay visualization).</p>
            <p><strong>Analisis Sitasi:</strong> Distribusi dampak ilmiah sitasi tahunan menunjukkan percepatan riset sejak 5 tahun terakhir.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">4</span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                PEMBAHASAN (DISCUSSION)
              </h3>
            </div>
            <p><strong>Triangulasi Parameter:</strong> {task2.knowledgeMappingContribution}</p>
            <p><strong>Celah Riset (Gap):</strong> {task2.matureVsUnderResearchedThemes}</p>
          </div>
        </div>

        {/* 5. Conclusion & References */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">5</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              KESIMPULAN &amp; DAFTAR PUSTAKA
            </h3>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Agenda Riset Masa Depan:</h4>
            <p>{task2.futureResearchAgenda}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Daftar Pustaka Utama (3 Paper Scopus Analisis Tugas 1):</h4>
            <div className="space-y-2">
              {task1.papers.map((p, idx) => (
                <div key={p.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px]">
                  <strong>[{idx + 1}]</strong> {p.authors} ({p.year}). {p.title}. <em>{p.journal}</em>. {p.doi && `https://doi.org/${p.doi.replace(/^https?:\/\/doi\.org\//, "")}`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
