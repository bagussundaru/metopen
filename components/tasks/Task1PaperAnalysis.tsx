"use client";

import { useState } from "react";
import { useTaskStore } from "@/lib/store/task-store";
import { SinglePaperAnalysis, SpecializationTrack } from "@/lib/types/tasks";
import {
  Printer,
  Sparkles,
  RotateCcw,
  Table,
  Layers,
  Zap,
  Globe,
  Clipboard,
  CheckCircle2,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";

export function Task1PaperAnalysis() {
  const {
    task1,
    updateStudentMeta,
    updateTask1Paper,
    loadBenchmarkDataCenterTask1,
    loadBenchmarkGeopolymerTask1,
    injectTop3ScopusArticles,
    parseAndSetPaperFromText,
    resetTask1,
    lastScopusSearch,
  } = useTaskStore();

  const [activePaperIdx, setActivePaperIdx] = useState<0 | 1 | 2>(0);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteRawText, setPasteRawText] = useState("");
  const [pasteTargetIdx, setPasteTargetIdx] = useState<0 | 1 | 2>(0);
  const [injectToastMessage, setInjectToastMessage] = useState<string | null>(null);

  const currentPaper = task1.papers[activePaperIdx];

  const handleUpdateCurrentPaper = <K extends keyof SinglePaperAnalysis>(field: K, val: SinglePaperAnalysis[K]) => {
    updateTask1Paper(activePaperIdx, (prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleApplyPastedScopus = () => {
    if (!pasteRawText.trim()) return;
    const success = parseAndSetPaperFromText(pasteTargetIdx, pasteRawText);
    if (success) {
      setInjectToastMessage(`🎉 Berhasil memasukkan data Scopus ke Paper ${pasteTargetIdx + 1}!`);
      setIsPasteModalOpen(false);
      setPasteRawText("");
      setActivePaperIdx(pasteTargetIdx);
      setTimeout(() => setInjectToastMessage(null), 5000);
    }
  };

  // Calculate completeness
  const checkPaperCompleteness = (p: SinglePaperAnalysis) => {
    let filled = 0;
    if (p.title) filled++;
    if (p.authors) filled++;
    if (p.journal) filled++;
    if (p.topicAndRelevance) filled++;
    if (p.generalGoalAndGap) filled++;
    if (p.researchQuestions) filled++;
    if (p.databaseAndSearchDate) filled++;
    if (p.booleanQuery) filled++;
    if (p.selectionCriteria) filled++;
    if (p.toolsAndTechniques) filled++;
    if (p.mainFindings) filled++;
    if (p.academicValueAndTouch) filled++;
    if (p.limitationsAndBias) filled++;
    if (p.futureResearchOpportunities) filled++;
    return filled;
  };

  const currentCompleteness = checkPaperCompleteness(currentPaper);

  return (
    <div className="space-y-6">
      {/* Top Banner & Instructions */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wide">
                Tugas 1: Analisis 3 Paper Bibliometrik
              </span>
              <span className="text-blue-200 text-xs font-semibold">
                Tenggat: Senin, 16 November 2026 &bull; Format: PDF (Tabel Saja)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Telaah Kritis 3 Artikel Ilmiah Bereputasi Berbasis Bibliometrik
            </h2>
            <p className="text-xs text-blue-100/90 max-w-3xl leading-relaxed">
              Pilih 3 artikel bibliometrik bidang Teknik Sipil (minimal Scopus Q2) yang relevan dengan tema tesis Anda. Analisis 13 aspek kunci mulai dari rumusan RQ, transparansi kueri Boolean, perangkat analisis (VOSviewer/Biblioshiny), hingga evaluasi kritis potensi bias.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadBenchmarkDataCenterTask1}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Muat 3 paper K3 Data Center (Ham & Hwang 2026, Garimella 2016, Killeen 2023) sesuai kuliah"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>🏢 Muat K3 Data Center (Tesis S2)</span>
            </button>

            <button
              type="button"
              onClick={loadBenchmarkGeopolymerTask1}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Muat 3 paper Geopolymer Concrete (Ahmad et al. 2026, Musa et al. 2026, Raza 2026) sesuai Scopus Web"
            >
              <span>🧱 Muat Geopolymer (Scopus Web)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPasteModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 text-white font-bold text-xs border border-indigo-400/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Tempel teks atau sitasi langsung dari browser Scopus Anda"
            >
              <Clipboard className="w-4 h-4 text-amber-300" />
              <span>📋 Tempel dari Scopus</span>
            </button>

            <Link
              href="/tasks/print-task1"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>Cetak / Ekspor PDF Resmi</span>
            </Link>

            <button
              type="button"
              onClick={resetTask1}
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
              value={task1.meta.studentName}
              onChange={(e) => updateStudentMeta({ studentName: e.target.value })}
              placeholder="mis. Bagus Sundaru"
              className="w-full p-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div>
            <label className="block text-blue-200 font-semibold mb-1">NIM Mahasiswa:</label>
            <input
              type="text"
              value={task1.meta.nim}
              onChange={(e) => updateStudentMeta({ nim: e.target.value })}
              placeholder="mis. 24052380001"
              className="w-full p-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div>
            <label className="block text-blue-200 font-semibold mb-1">Peminatan S2:</label>
            <select
              value={task1.meta.specialization}
              onChange={(e) => updateStudentMeta({ specialization: e.target.value as SpecializationTrack })}
              className="w-full p-2 rounded-xl bg-slate-800 border border-white/20 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="Teknik Struktur">Teknik Struktur</option>
              <option value="PSDAL (Sumber Daya Air & Lingkungan)">PSDAL (Sumber Daya Air &amp; Lingkungan)</option>
              <option value="Interdisipliner">Interdisipliner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Scopus Detection Banner */}
      {lastScopusSearch && lastScopusSearch.articles && lastScopusSearch.articles.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-2 border-amber-400 text-white shadow-lg space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase">
                    Pencarian Scopus Terdeteksi
                  </span>
                  <span className="text-blue-200 text-xs font-semibold">
                    {lastScopusSearch.articles.length} Dokumen Ilmiah Ditemukan
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Topik: &quot;{lastScopusSearch.query}&quot;
                </h4>
                <p className="text-xs text-blue-200/90">
                  Kueri Boolean: <code className="text-amber-200 font-mono text-[11px]">{lastScopusSearch.scopusQuery || lastScopusSearch.query}</code>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  injectTop3ScopusArticles();
                  setInjectToastMessage("🎉 Sukses! 3 paper teratas dari pencarian Scopus berhasil diinjeksikan ke Paper 1, 2, dan 3 Tugas 1!");
                  setTimeout(() => setInjectToastMessage(null), 6000);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>⚡ Tarik &amp; Injeksikan 3 Paper Scopus</span>
              </button>

              <Link
                href="/"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
              >
                <span>Peta Literatur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {injectToastMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/25 border border-emerald-400 text-white font-bold text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{injectToastMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Paste from Scopus Web Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase">
                  Impor Cepat Scopus
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Tempel Teks / Sitasi dari Halaman Scopus Web
                </h3>
                <p className="text-xs text-slate-500">
                  Salin teks dari browser Scopus Anda (seperti tampilan tabel pencarian), lalu tempel di sini untuk otomatis mengisi identitas artikel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Penyimpanan Paper di Tugas 1:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPasteTargetIdx(idx as 0 | 1 | 2)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                        pasteTargetIdx === idx
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      Paper {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tempelkan Teks Hasil Scopus di Bawah Ini:
                </label>
                <textarea
                  rows={6}
                  value={pasteRawText}
                  onChange={(e) => setPasteRawText(e.target.value)}
                  placeholder={`Contoh format baris tabel Scopus:\nBibliometric Analysis, Mechanical Properties, and Durability Performance of Fly Ash Based Geopolymer Concrete\nAhmad J., Naqash M.T., Qureshi H.J., Alattyih W.\nBuildings, 16(15), 3051  2026\n10.3390/buildings16153051`}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyPastedScopus}
                disabled={!pasteRawText.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Terapkan ke Paper {pasteTargetIdx + 1}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switcher: Paper Tabs & View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5">
          {task1.papers.map((paper, idx) => {
            const isSelected = activePaperIdx === idx;
            const filledCount = checkPaperCompleteness(paper);
            return (
              <button
                key={paper.id}
                type="button"
                onClick={() => setActivePaperIdx(idx as 0 | 1 | 2)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>Artikel {idx + 1}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                }`}>
                  {filledCount}/14 Aspek
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "card" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Formulir Detail</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "table" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel 3 Kolom Dosen</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: DETAIL FORM CARD */}
      {viewMode === "card" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pembedahan Kritis Artikel {activePaperIdx + 1}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {currentPaper.title || `Artikel Ilmiah ${activePaperIdx + 1}`}
              </h3>
              <p className="text-xs text-slate-500">
                {currentPaper.authors ? `${currentPaper.authors} (${currentPaper.year}) • ${currentPaper.journal}` : "Isi identitas dan analisis artikel di bawah ini."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Kelengkapan: {currentCompleteness}/14 Bagian
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. Identitas Artikel */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                Identitas Lengkap Artikel
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Judul Lengkap Artikel *</label>
                  <input
                    type="text"
                    value={currentPaper.title}
                    onChange={(e) => handleUpdateCurrentPaper("title", e.target.value)}
                    placeholder="mis. Bibliometric Analysis, Mechanical Properties, and Durability..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Nama Penulis *</label>
                  <input
                    type="text"
                    value={currentPaper.authors}
                    onChange={(e) => handleUpdateCurrentPaper("authors", e.target.value)}
                    placeholder="mis. Ahmad, J., Naqash, M. T., Qureshi, H. J."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tahun Terbit *</label>
                    <input
                      type="number"
                      value={currentPaper.year}
                      onChange={(e) => handleUpdateCurrentPaper("year", parseInt(e.target.value, 10) || 2024)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Indeks / Kuartil *</label>
                    <input
                      type="text"
                      value={currentPaper.indexingDb}
                      onChange={(e) => handleUpdateCurrentPaper("indexingDb", e.target.value)}
                      placeholder="mis. Scopus Q1 / Q2"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-blue-700 dark:text-blue-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Nama Jurnal Ilmiah *</label>
                  <input
                    type="text"
                    value={currentPaper.journal}
                    onChange={(e) => handleUpdateCurrentPaper("journal", e.target.value)}
                    placeholder="mis. Buildings (MDPI) / Journal of Building Engineering"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">DOI / URL Naskah *</label>
                  <input
                    type="text"
                    value={currentPaper.doi}
                    onChange={(e) => handleUpdateCurrentPaper("doi", e.target.value)}
                    placeholder="mis. 10.3390/buildings16153051"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Bidang / Topik & Alasan Relevansi */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                Bidang / Topik &amp; Alasan Relevansi dengan Tesis Anda *
              </label>
              <textarea
                rows={3}
                value={currentPaper.topicAndRelevance}
                onChange={(e) => handleUpdateCurrentPaper("topicAndRelevance", e.target.value)}
                placeholder="Jelaskan bidang spesifik artikel dan uraikan mengapa artikel ini relevan dengan topik tesis magister yang sedang Anda rencanakan..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* 3. Tujuan Umum & Kesenjangan Riset */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                Tujuan Umum Penelitian &amp; Kesenjangan Riset (Research Gap) *
              </label>
              <textarea
                rows={3}
                value={currentPaper.generalGoalAndGap}
                onChange={(e) => handleUpdateCurrentPaper("generalGoalAndGap", e.target.value)}
                placeholder="Jelaskan masalah atau gap pengetahuan yang melatarbelakangi artikel, tujuan utama, dan bedakan antara pemetaan statistik dengan klaim kontribusi saintifik yang ingin dicapai..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* 4. Research Questions (RQs) */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-800/40 border border-blue-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
                  Research Questions (RQs) yang Diangkat *
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPaper.isRqReconstructed}
                    onChange={(e) => handleUpdateCurrentPaper("isRqReconstructed", e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-[11px]">Hasil Rekonstruksi Mahasiswa (Tidak tertulis eksplisit oleh penulis)</span>
                </label>
              </div>

              <textarea
                rows={4}
                value={currentPaper.researchQuestions}
                onChange={(e) => handleUpdateCurrentPaper("researchQuestions", e.target.value)}
                placeholder="1. Bagaimana tren publikasi dan sitasi...\n2. Klaster tema apa saja yang terbentuk...\n3. Apa kesenjangan riset..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
              />

              {currentPaper.isRqReconstructed && (
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Catatan Dasar Penafsiran Rekonstruksi RQ:
                  </label>
                  <input
                    type="text"
                    value={currentPaper.rqReconstructionNotes || ""}
                    onChange={(e) => handleUpdateCurrentPaper("rqReconstructionNotes", e.target.value)}
                    placeholder="mis. Penulis tidak menuliskan RQ bernomor, dirumuskan dari Subbab 1.2 Rumusan Masalah..."
                    className="w-full p-2 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
                  />
                </div>
              )}
            </div>

            {/* 5, 6, 7. Basis Data, Kueri Boolean, Rentang Tahun */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">5</span>
                  Basis Data &amp; Tanggal Akses
                </label>
                <input
                  type="text"
                  value={currentPaper.databaseAndSearchDate}
                  onChange={(e) => handleUpdateCurrentPaper("databaseAndSearchDate", e.target.value)}
                  placeholder="mis. Scopus, diakses 14 Januari 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">6</span>
                  Rentang Tahun Publikasi
                </label>
                <input
                  type="text"
                  value={currentPaper.yearRange}
                  onChange={(e) => handleUpdateCurrentPaper("yearRange", e.target.value)}
                  placeholder="mis. 2015 – 2026 (11 Tahun)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">7</span>
                  Jumlah Sitasi Tercatat
                </label>
                <input
                  type="number"
                  value={currentPaper.citationCount || 0}
                  onChange={(e) => handleUpdateCurrentPaper("citationCount", parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-blue-700"
                />
              </div>
            </div>

            {/* 8. Kueri Boolean Lengkap */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">8</span>
                Kueri Boolean Lengkap (Search String Operasional) *
              </label>
              <textarea
                rows={2}
                value={currentPaper.booleanQuery}
                onChange={(e) => handleUpdateCurrentPaper("booleanQuery", e.target.value)}
                placeholder='TITLE-ABS-KEY("fly ash" AND "geopolymer") AND DOCTYPE(ar OR re)...'
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs text-blue-700 dark:text-blue-300"
              />
            </div>

            {/* 9. Kriteria Seleksi (Inklusi & Eksklusi) */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">9</span>
                Kriteria Seleksi (Inklusi &amp; Eksklusi Data) *
              </label>
              <textarea
                rows={3}
                value={currentPaper.selectionCriteria}
                onChange={(e) => handleUpdateCurrentPaper("selectionCriteria", e.target.value)}
                placeholder="Inklusi: artikel jurnal peer-reviewed, fokus eksperimental...\nEksklusi: prosiding tanpa peer review, artikel non-bahasa Inggris..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* 10. Perangkat Lunak & Teknik Analisis */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">10</span>
                Perangkat Lunak (Tools) &amp; Teknik Analisis yang Digunakan *
              </label>
              <textarea
                rows={3}
                value={currentPaper.toolsAndTechniques}
                onChange={(e) => handleUpdateCurrentPaper("toolsAndTechniques", e.target.value)}
                placeholder="mis. VOSviewer v1.6.20 (co-occurrence kata kunci, co-authorship jaringan negara) dan Biblioshiny (Lotka's law, Bradford's law)..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* 11. Temuan Utama / Pola yang Terpetakan */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">11</span>
                Temuan Utama / Pola yang Terpetakan *
              </label>
              <textarea
                rows={3}
                value={currentPaper.mainFindings}
                onChange={(e) => handleUpdateCurrentPaper("mainFindings", e.target.value)}
                placeholder="Uraikan klaster-klaster tematik yang terpetakan, topik yang dominan, serta kesenjangan penelitian yang teridentifikasi..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* 12. Nilai Tambah / Sentuhan Penulis */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">12</span>
                Nilai Tambah &amp; Sentuhan Akademik Penulis (Beyond Descriptive) *
              </label>
              <textarea
                rows={3}
                value={currentPaper.academicValueAndTouch}
                onChange={(e) => handleUpdateCurrentPaper("academicValueAndTouch", e.target.value)}
                placeholder="Bagaimana penulis membuat artikel lebih dari sekadar visualisasi graf deskriptif? (triangulasi data eksperimen, sintesis teori, telaah regulasi/praktik)..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* 13. Keterbatasan & Potensi Bias */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">13</span>
                Keterbatasan &amp; Potensi Bias Penelitian *
              </label>
              <textarea
                rows={3}
                value={currentPaper.limitationsAndBias}
                onChange={(e) => handleUpdateCurrentPaper("limitationsAndBias", e.target.value)}
                placeholder="Tinjau bias basis data tunggal, bias bahasa, ambang batas minimum kata kunci, batas waktu sitasi (time-lag), atau risiko over-interpretation..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* 14. Peluang Riset Lanjutan */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">14</span>
                Peluang Riset Lanjutan bagi Tesis Anda *
              </label>
              <textarea
                rows={3}
                value={currentPaper.futureResearchOpportunities}
                onChange={(e) => handleUpdateCurrentPaper("futureResearchOpportunities", e.target.value)}
                placeholder="Uraikan peluang penelitian lanjutan yang dapat Anda adopsi sebagai kebaruan (novelty) topik tesis S2 Anda..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: TABEL KOMPARATIF 3 KOLOM RESMI DOSEN */}
      {viewMode === "table" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Tabel Analisis Paper Bibliometrik (Format Resmi Dosen)
              </h3>
              <p className="text-xs text-slate-500">
                Tampilan komparasi 13 aspek perbandingan untuk 3 paper bibliometrik
              </p>
            </div>
            <Link
              href="/tasks/print-task1"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Buka Tampilan Siap Cetak PDF</span>
            </Link>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 w-1/4 border-r border-slate-200 dark:border-slate-700">Aspek Analisis</th>
                  <th className="p-3 w-1/4 border-r border-slate-200 dark:border-slate-700">Artikel 1</th>
                  <th className="p-3 w-1/4 border-r border-slate-200 dark:border-slate-700">Artikel 2</th>
                  <th className="p-3 w-1/4">Artikel 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">1. Identitas Artikel (Judul, Penulis, Tahun, Jurnal, DOI, Pengindeks)</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800">
                      <strong>{p.title || `Artikel ${i + 1}`}</strong><br />
                      <span className="text-slate-600 dark:text-slate-400">{p.authors} ({p.year})</span><br />
                      <em>{p.journal}</em> &bull; <span className="text-blue-600">{p.indexingDb}</span><br />
                      <span className="font-mono text-[10px] text-slate-500">{p.doi}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">2. Bidang / Topik &amp; Alasan Relevansi</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{p.topicAndRelevance}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">3. Tujuan Umum dan Kesenjangan Riset</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{p.generalGoalAndGap}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">4. Research Questions (RQs)</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                      {p.isRqReconstructed && (
                        <span className="text-[10px] font-extrabold text-amber-600 block mb-1">[Hasil Rekonstruksi Mahasiswa]</span>
                      )}
                      {p.researchQuestions}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">5. Basis Data dan Tanggal Pencarian</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{p.databaseAndSearchDate}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">6. Kueri Boolean Lengkap</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 font-mono text-[11px] text-blue-700 dark:text-blue-300 whitespace-pre-wrap">{p.booleanQuery}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">7. Rentang Tahun</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800">{p.yearRange}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">8. Kriteria Seleksi (Inklusi &amp; Eksklusi)</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{p.selectionCriteria}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">9. Tools / Perangkat Lunak dan Teknik</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{p.toolsAndTechniques}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">10. Temuan Utama / Pola yang Terpetakan</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{p.mainFindings}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">11. Nilai Tambah atau Sentuhan Akademik</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{p.academicValueAndTouch}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">12. Keterbatasan dan Potensi Bias</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{p.limitationsAndBias}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/40">13. Peluang Riset Lanjutan</td>
                  {task1.papers.map((p, i) => (
                    <td key={i} className="p-3 align-top border-l border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{p.futureResearchOpportunities}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
