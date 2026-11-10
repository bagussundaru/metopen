"use client";

import { useTaskStore } from "@/lib/store/task-store";
import { PrismaFlowDiagram } from "./PrismaFlowDiagram";
import { Task2ResearchDesign as ITask2ResearchDesign, SpecializationTrack } from "@/lib/types/tasks";
import {
  Printer,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export function Task2ResearchDesign() {
  const {
    task2,
    updateStudentMeta,
    updateTask2,
    loadBenchmarkTask2,
    resetTask2,
  } = useTaskStore();

  const handleUpdate = <K extends keyof ITask2ResearchDesign>(field: K, val: ITask2ResearchDesign[K]) => {
    updateTask2((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleAddRq = () => {
    if (task2.researchQuestions.length >= 8) return;
    const newRq = `Bagaimana analisis lanjutan terkait parameter ke-${task2.researchQuestions.length + 1} pada topik ini?`;
    handleUpdate("researchQuestions", [...task2.researchQuestions, newRq]);
  };

  const handleRemoveRq = (idx: number) => {
    if (task2.researchQuestions.length <= 3) return;
    const updated = task2.researchQuestions.filter((_, i) => i !== idx);
    handleUpdate("researchQuestions", updated);
  };

  const handleUpdateRq = (idx: number, text: string) => {
    const updated = [...task2.researchQuestions];
    updated[idx] = text;
    handleUpdate("researchQuestions", updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Instructions */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-900 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wide">
                Tugas 2: Rancangan Penelitian Bibliometrik
              </span>
              <span className="text-blue-200 text-xs font-semibold">
                Tenggat: Minggu, 12 November 2026 &bull; Format: PDF Bebas Rapi
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Proposal Rencana Riset Bibliometrik Mandiri (7 Komponen &amp; PRISMA)
            </h2>
            <p className="text-xs text-blue-100/90 max-w-3xl leading-relaxed">
              Berdasarkan hasil telaah 3 paper Tugas 1, susun rancangan penelitian bibliometrik mandiri bidang Teknik Sipil (Teknologi Struktur atau Pengelolaan Sumber Daya Air &amp; Lingkungan / PSDAL) yang akan menjadi dasar tugas besar mata kuliah Metodologi Penelitian.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadBenchmarkTask2}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Muat contoh lengkap rancangan penelitian bibliometrik Teknik Sipil berstandar Scopus"
            >
              <Sparkles className="w-4 h-4" />
              <span>Muat Contoh Lengkap</span>
            </button>

            <Link
              href="/tasks/print-task2"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>Cetak / Ekspor PDF Resmi</span>
            </Link>

            <button
              type="button"
              onClick={resetTask2}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Reset ke draf kosong"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Student Metadata Form Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/15 text-xs">
          <div>
            <label className="block text-blue-200 font-semibold mb-1">Nama Mahasiswa:</label>
            <input
              type="text"
              value={task2.meta.studentName}
              onChange={(e) => updateStudentMeta({ studentName: e.target.value })}
              placeholder="mis. Bagus Sundaru"
              className="w-full p-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div>
            <label className="block text-blue-200 font-semibold mb-1">NIM Mahasiswa:</label>
            <input
              type="text"
              value={task2.meta.nim}
              onChange={(e) => updateStudentMeta({ nim: e.target.value })}
              placeholder="mis. 24052380001"
              className="w-full p-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div>
            <label className="block text-blue-200 font-semibold mb-1">Peminatan Bidang Riset:</label>
            <select
              value={task2.meta.specialization}
              onChange={(e) => updateStudentMeta({ specialization: e.target.value as SpecializationTrack })}
              className="w-full p-2 rounded-xl bg-slate-800 border border-white/20 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="Teknik Struktur">Teknologi Struktur (Material, Gempa, SHM, Konstruksi)</option>
              <option value="PSDAL (Sumber Daya Air & Lingkungan)">Pengelolaan SDA &amp; Lingkungan (Banjir, Drainase, Limbah)</option>
              <option value="Interdisipliner">Interdisipliner Struktur &amp; Lingkungan</option>
            </select>
          </div>
        </div>
      </div>

      {/* 7 COMPONENTS FORM */}
      <div className="space-y-6">
        {/* KOMPONEN 1: TEMA & USULAN JUDUL */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Tema dan Usulan Judul Penelitian
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Tema Riset Spesifik:
              </label>
              <input
                type="text"
                value={task2.theme}
                onChange={(e) => handleUpdate("theme", e.target.value)}
                placeholder="mis. Analisis Bibliometrik Penerapan Beton Geopolimer Fly Ash pada Elemen Lentur Struktural"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Usulan Judul Lengkap Artikel Bibliometrik:
              </label>
              <input
                type="text"
                value={task2.proposedTitle}
                onChange={(e) => handleUpdate("proposedTitle", e.target.value)}
                placeholder="mis. Pemetaan Bibliometrik dan Tinjauan Kritis Tren Riset Kinerja Balok Beton Geopolimer Teraktivasi Alkali (2015–2026)"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-blue-700 dark:text-blue-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Kebaruan Topik &amp; Potensi Kontribusi (Hindari Topik Terlalu Luas):
              </label>
              <textarea
                rows={3}
                value={task2.titleNoveltyRationale}
                onChange={(e) => handleUpdate("titleNoveltyRationale", e.target.value)}
                placeholder="Jelaskan unsur kebaruan topik ini dibandingkan penelitian bibliometrik yang sudah ada..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* KOMPONEN 2: URGENSI & ARGUMENTASI PEMILIHAN TOPIK */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Urgensi dan Argumentasi Pemilihan Topik
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                a. Mengapa topik tersebut penting untuk dikaji?
              </label>
              <textarea
                rows={4}
                value={task2.urgencyAndImportance}
                onChange={(e) => handleUpdate("urgencyAndImportance", e.target.value)}
                placeholder="Uraikan tantangan industri konstruksi/lingkungan, urgensi keberlanjutan, atau mitigasi bencana..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                b. Apa yang telah dikaji oleh penelitian terdahulu?
              </label>
              <textarea
                rows={4}
                value={task2.previousStudiesReview}
                onChange={(e) => handleUpdate("previousStudiesReview", e.target.value)}
                placeholder="Ringkas temuan studi sebelumnya (sintesis dari apa yang telah Anda pelajari pada Tugas 1)..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                c. Apa kesenjangan riset (research gap) yang belum terjawab?
              </label>
              <textarea
                rows={4}
                value={task2.unansweredResearchGap}
                onChange={(e) => handleUpdate("unansweredResearchGap", e.target.value)}
                placeholder="Uraikan secara tajam area yang belum dieksplorasi secara memadai pada literatur global..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                d. Mengapa pendekatan bibliometrik relevan untuk topik ini?
              </label>
              <textarea
                rows={4}
                value={task2.bibliometricApproachRationale}
                onChange={(e) => handleUpdate("bibliometricApproachRationale", e.target.value)}
                placeholder="Jelaskan mengapa pemetaan kuantitatif dengan VOSviewer/Bibliometrix diperlukan untuk memetakan kesenjangan ini..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* KOMPONEN 3: RUMUSAN 5-7 RESEARCH QUESTIONS (RQs) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Rumusan Pertanyaan Penelitian (5–7 Research Questions / RQ)
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {task2.researchQuestions.length} Pertanyaan Terdaftar
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Susun 5–7 pertanyaan penelitian yang spesifik, saling berkaitan, dan dapat dijawab secara empiris menggunakan data bibliografis (mengacu pada pedoman Donthu et al., 2021 &amp; Öztürk et al., 2024).
          </p>

          <div className="space-y-2.5">
            {task2.researchQuestions.map((rq, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                  RQ{idx + 1}
                </span>
                <input
                  type="text"
                  value={rq}
                  onChange={(e) => handleUpdateRq(idx, e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                />
                {task2.researchQuestions.length > 5 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRq(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                    title="Hapus pertanyaan ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {task2.researchQuestions.length < 7 && (
            <button
              type="button"
              onClick={handleAddRq}
              className="px-3.5 py-1.5 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pertanyaan Riset (Maks. 7 RQ)</span>
            </button>
          )}
        </div>

        {/* KOMPONEN 4: STRATEGI PENELUSURAN LITERATUR (SEARCH STRATEGY) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Strategi Penelusuran Literatur (Search Strategy)
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Basis Data Ilmiah Utama:
                </label>
                <select
                  value={task2.targetDatabase}
                  onChange={(e) => handleUpdate("targetDatabase", e.target.value as "Scopus" | "Web of Science" | "Scopus & Web of Science")}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-blue-700 dark:text-blue-300"
                >
                  <option value="Scopus">Scopus (Elsevier) — Direkomendasikan Utama</option>
                  <option value="Web of Science">Web of Science (Clarivate Analytics)</option>
                  <option value="Scopus & Web of Science">Scopus &amp; Web of Science (Kombinasi Multi-Database)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Alasan Pemilihan Basis Data:
                </label>
                <input
                  type="text"
                  value={task2.databaseRationale}
                  onChange={(e) => handleUpdate("databaseRationale", e.target.value)}
                  placeholder="mis. Cakupan komprehensif pada jurnal teknik sipil bereputasi tinggi..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Boolean Search String (Operasional &amp; Siap Direplikasi):
                </label>
                <span className="text-[11px] text-blue-600 font-mono">Format Scopus TITLE-ABS-KEY</span>
              </div>
              <textarea
                rows={3}
                value={task2.booleanSearchString}
                onChange={(e) => handleUpdate("booleanSearchString", e.target.value)}
                placeholder='TITLE-ABS-KEY(("geopolymer concrete" OR "alkali-activated") AND ("fly ash") AND ("flexural")) AND DOCTYPE(ar OR re)...'
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-blue-700 dark:text-blue-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Catatan Operasional Kueri (Struktur Operator Boolean):
              </label>
              <textarea
                rows={2}
                value={task2.searchStringOperationalNotes}
                onChange={(e) => handleUpdate("searchStringOperationalNotes", e.target.value)}
                placeholder="Jelaskan logika irisan AND antar-pilar konsep, sinonim OR, dan batas filter dokumen..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* KOMPONEN 5: RANCANGAN SELEKSI ARTIKEL & PELAPORAN PRISMA */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">5</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Rancangan Seleksi Artikel &amp; Pelaporan PRISMA (Data Penelusuran Aktual)
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            Dosen mewajibkan: <em>&quot;Jumlah artikel pada setiap tahapan PRISMA harus didasarkan pada hasil pencarian dan seleksi yang benar-benar dilakukan, bukan angka perkiraan.&quot;</em>
          </p>

          {/* Interactive PRISMA Diagram Component */}
          <PrismaFlowDiagram
            data={task2.prisma}
            onChange={(updatedPrisma) => handleUpdate("prisma", updatedPrisma)}
            isEditable={true}
          />
        </div>

        {/* KOMPONEN 6: RENCANA PERANGKAT & TEKNIK ANALISIS BIBLIOMETRIK */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">6</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Rencana Perangkat dan Teknik Analisis Bibliometrik
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Perangkat 1: VOSviewer (Fungsi &amp; Teknik yang Digunakan):
              </label>
              <textarea
                rows={3}
                value={task2.vosviewerPlan}
                onChange={(e) => handleUpdate("vosviewerPlan", e.target.value)}
                placeholder="Jelaskan teknik: co-authorship (peneliti/negara), co-occurrence (kata kunci), co-citation, dan bibliographic coupling..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Perangkat 2: Bibliometrix / Biblioshiny (Fungsi &amp; Teknik yang Digunakan):
              </label>
              <textarea
                rows={3}
                value={task2.biblioshinyPlan}
                onChange={(e) => handleUpdate("biblioshinyPlan", e.target.value)}
                placeholder="Jelaskan analisis: kinerja publikasi, Bradford's law (jurnal inti), Lotka's law, Thematic Map (struktur konseptual)..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Keluaran Analisis yang Diharapkan:
              </label>
              <textarea
                rows={2}
                value={task2.expectedOutputs}
                onChange={(e) => handleUpdate("expectedOutputs", e.target.value)}
                placeholder="Peta jejaring VOSviewer (.net dan .map), kurva pertumbuhan sitasi tahunan, thematic map 4 kuadran, dan tabel sintesis gap..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        {/* KOMPONEN 7: TARGET KONTRIBUSI AKADEMIK */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">7</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Target Kontribusi Akademik
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                a. Kontribusi Pemetaan &amp; Pengembangan Pengetahuan:
              </label>
              <textarea
                rows={3}
                value={task2.knowledgeMappingContribution}
                onChange={(e) => handleUpdate("knowledgeMappingContribution", e.target.value)}
                placeholder="Menghubungkan pemahaman material/SDA secara makro dengan dinamika riset global..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                b. Identifikasi Tema Mapan vs. Kurang Diteliti (Research Gap):
              </label>
              <textarea
                rows={3}
                value={task2.matureVsUnderResearchedThemes}
                onChange={(e) => handleUpdate("matureVsUnderResearchedThemes", e.target.value)}
                placeholder="Membedakan topik yang sudah jenuh (saturated) dengan topik yang minim eksplorasi..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                c. Agenda Penelitian Masa Depan (Future Research Agenda):
              </label>
              <textarea
                rows={3}
                value={task2.futureResearchAgenda}
                onChange={(e) => handleUpdate("futureResearchAgenda", e.target.value)}
                placeholder="Merumuskan roadmap dan hipotesis kunci bagi peneliti selanjutnya..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                d. Relevansi Rekayasa Teknik Sipil (Struktur / PSDAL):
              </label>
              <textarea
                rows={3}
                value={task2.civilEngineeringRelevance}
                onChange={(e) => handleUpdate("civilEngineeringRelevance", e.target.value)}
                placeholder="Dukungan terhadap perencanaan struktur aman, standar SNI, atau pengelolaan tata air..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                e. Implikasi terhadap Infrastruktur Aman, Tangguh, Efisien &amp; Berkelanjutan:
              </label>
              <textarea
                rows={3}
                value={task2.sustainableInfrastructureImplication}
                onChange={(e) => handleUpdate("sustainableInfrastructureImplication", e.target.value)}
                placeholder="Dukungan terhadap dekarbonisasi, mitigasi bencana gempa/banjir, dan target Net Zero Emission..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
