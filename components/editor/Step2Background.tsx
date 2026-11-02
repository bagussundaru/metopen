"use client";

import { useState } from "react";
import { Canvas, Reference } from "@/lib/types/canvas";
import {
  BookOpen,
  Plus,
  Trash2,
  Table,
} from "lucide-react";

interface Step2BackgroundProps {
  canvas: Canvas;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
}

export function Step2Background({ canvas, onChange }: Step2BackgroundProps) {
  const [showMatrix, setShowMatrix] = useState(false);
  const [showAddRefModal, setShowAddRefModal] = useState(false);

  // New Reference form state
  const [newRef, setNewRef] = useState<Partial<Reference>>({
    authors: "",
    year: new Date().getFullYear(),
    title: "",
    source: "",
    indexSource: "scopus",
    citedBy: 0,
    doi: "",
    keyFinding: "",
    limitation: "",
  });

  const sentences = canvas.background.sentences;
  const references = canvas.background.references || [];

  const updateSentence = (index: 0 | 1 | 2, text: string) => {
    onChange((prev) => {
      const updatedSentences: [string, string, string] = [
        prev.background.sentences[0] || "",
        prev.background.sentences[1] || "",
        prev.background.sentences[2] || "",
      ];
      updatedSentences[index] = text;
      return {
        ...prev,
        background: { ...prev.background, sentences: updatedSentences },
      };
    });
  };

  const handleAddReference = () => {
    if (!newRef.authors || !newRef.title || !newRef.keyFinding || !newRef.limitation) {
      alert("Mohon lengkapi Penulis, Judul, Temuan Kunci, dan Keterbatasan.");
      return;
    }

    const created: Reference = {
      id: crypto.randomUUID(),
      authors: newRef.authors || "",
      year: Number(newRef.year) || new Date().getFullYear(),
      title: newRef.title || "",
      source: newRef.source || "",
      indexSource: (newRef.indexSource as Reference["indexSource"]) || "scopus",
      citedBy: Number(newRef.citedBy) || 0,
      doi: newRef.doi || "",
      keyFinding: newRef.keyFinding || "",
      limitation: newRef.limitation || "",
    };

    onChange((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        references: [created, ...(prev.background.references || [])],
      },
    }));

    // Reset form
    setNewRef({
      authors: "",
      year: new Date().getFullYear(),
      title: "",
      source: "",
      indexSource: "scopus",
      citedBy: 0,
      doi: "",
      keyFinding: "",
      limitation: "",
    });
    setShowAddRefModal(false);
  };

  const handleDeleteReference = (id: string) => {
    onChange((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        references: prev.background.references.filter((r) => r.id !== id),
      },
    }));
  };

  const currentYear = new Date().getFullYear();
  const recentRefCount = references.filter((r) => r.year && currentYear - r.year <= 5).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Langkah 2: Latar Belakang & Gap Sintesis
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Dosen mewajibkan narasi gap ditulis secara tajam <strong>maksimal 3 kalimat</strong> (bukan paragraf bebas), didukung minimal 5 referensi terindeks <strong>Scopus / Google Scholar</strong>.
        </p>
      </div>

      {/* 3 Sentences Grid (Structured Boxes) */}
      <div className="space-y-4">
        {/* Kalimat 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Kalimat 1: Apa yang sudah diketahui secara mapan (State-of-the-Art)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {sentences[0]?.split(/\s+/).filter(Boolean).length || 0} kata
            </span>
          </div>
          <textarea
            value={sentences[0]}
            onChange={(e) => updateSentence(0, e.target.value)}
            placeholder="mis. Penggunaan beton mutu tinggi pada elemen lentur jembatan rentan terhadap degradasi kegetasan dan serangan sulfat lingkungan agresif."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Kalimat 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Kalimat 2: Celah / Keterbatasan Riset yang Belum Terjawab (Research Gap)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {sentences[1]?.split(/\s+/).filter(Boolean).length || 0} kata
            </span>
          </div>
          <textarea
            value={sentences[1]}
            onChange={(e) => updateSentence(1, e.target.value)}
            placeholder="mis. Meskipun substitusi fly ash teraktivasi alkali meningkatkan ketahanan kimiawi pada pasta semen, perilaku daktilitas pasca-retak pada balok bertulang belum terukur secara komprehensif."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            💡 Gunakan penanda gap: <em>&quot;namun masih terbatas...&quot;, &quot;belum terukur...&quot;, &quot;belum ada studi yang...&quot;</em>
          </p>
        </div>

        {/* Kalimat 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <span>Kalimat 3: Mengapa Penelitian Ini Penting Diselesaikan (Urgensi Rekayasa)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {sentences[2]?.split(/\s+/).filter(Boolean).length || 0} kata
            </span>
          </div>
          <textarea
            value={sentences[2]}
            onChange={(e) => updateSentence(2, e.target.value)}
            placeholder="mis. Oleh karena itu, evaluasi kapasitas lentur dan indeks daktilitas eksperimental diperlukan guna merumuskan batas rasio substitusi optimum yang memenuhi kriteria batas layan SNI 2847:2019."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* References Section */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Daftar Literatur Pendukung Sintesis
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {references.length} Referensi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Standar: Minimal 5 referensi, &ge; 1 dalam 5 tahun terakhir ({recentRefCount} mutakhir).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Table className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showMatrix ? "Tutup Matriks" : "Matriks Sintesis"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddRefModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Referensi</span>
            </button>
          </div>
        </div>

        {/* Synthesis Matrix View */}
        {showMatrix && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 w-1/4">Penulis & Tahun</th>
                  <th className="p-3 w-3/8">Temuan Kunci (Key Finding)</th>
                  <th className="p-3 w-3/8">Keterbatasan / Celah yang Belum Dikaji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {references.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400 italic">
                      Belum ada referensi. Tambahkan referensi di bawah untuk melihat matriks sintesis.
                    </td>
                  </tr>
                ) : (
                  references.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3 align-top font-medium text-slate-900 dark:text-white">
                        {r.authors} ({r.year})
                        <div className="text-[10px] text-slate-400 uppercase mt-0.5">
                          {r.indexSource} &bull; Sitasi: {r.citedBy}
                        </div>
                      </td>
                      <td className="p-3 align-top text-slate-700 dark:text-slate-300">
                        {r.keyFinding || <span className="text-rose-400 italic">Belum diisi</span>}
                      </td>
                      <td className="p-3 align-top text-slate-700 dark:text-slate-300">
                        {r.limitation || <span className="text-rose-400 italic">Belum diisi</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* References List Cards */}
        <div className="space-y-3">
          {references.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500">
                Belum ada referensi tertaut. Klik &quot;Tambah Referensi&quot; atau impor dari tab Peta Literatur.
              </p>
            </div>
          ) : (
            references.map((ref) => (
              <div
                key={ref.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {ref.authors} ({ref.year})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {ref.indexSource}
                    </span>
                    {ref.citedBy > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {ref.citedBy} sitasi
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    &quot;{ref.title}&quot; {ref.source ? `— ${ref.source}` : ""}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                      <span className="font-semibold">Temuan:</span> {ref.keyFinding}
                    </div>
                    <div className="bg-amber-50/80 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                      <span className="font-semibold">Keterbatasan:</span> {ref.limitation}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteReference(ref.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                  title="Hapus Referensi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Reference Modal */}
      {showAddRefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Tambah Referensi Jurnal
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Penulis (Authors) *</label>
                <input
                  type="text"
                  placeholder="mis. Widodo, S., dkk."
                  value={newRef.authors}
                  onChange={(e) => setNewRef({ ...newRef, authors: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tahun Publikasi *</label>
                  <input
                    type="number"
                    value={newRef.year}
                    onChange={(e) => setNewRef({ ...newRef, year: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Pengindeks Acuan *</label>
                  <select
                    value={newRef.indexSource}
                    onChange={(e) => setNewRef({ ...newRef, indexSource: e.target.value as Reference["indexSource"] })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="scopus">Scopus</option>
                    <option value="google_scholar">Google Scholar</option>
                    <option value="sinta">SINTA (Nasional)</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  placeholder="Judul artikel ilmiah..."
                  value={newRef.title}
                  onChange={(e) => setNewRef({ ...newRef, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Jurnal / Konferensi</label>
                <input
                  type="text"
                  placeholder="mis. Construction and Building Materials"
                  value={newRef.source}
                  onChange={(e) => setNewRef({ ...newRef, source: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-emerald-700 dark:text-emerald-300">
                  Temuan Kunci (Key Finding) *
                </label>
                <textarea
                  placeholder="Apa temuan utama artikel ini? (mis. Substitusi fly ash 20% menaikkan kuat lentur 15%)..."
                  rows={2}
                  value={newRef.keyFinding}
                  onChange={(e) => setNewRef({ ...newRef, keyFinding: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-amber-700 dark:text-amber-300">
                  Keterbatasan / Gap yang Ditinggalkan *
                </label>
                <textarea
                  placeholder="Apa yang belum diuji artikel ini? (mis. Pengujian belum menguji perilaku balok bertulang di lingkungan agresif sulfat)..."
                  rows={2}
                  value={newRef.limitation}
                  onChange={(e) => setNewRef({ ...newRef, limitation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddRefModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddReference}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
              >
                Simpan Referensi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
