"use client";

import { useState } from "react";
import { Canvas, Reference, PinnedFinding } from "@/lib/types/canvas";
import { VosNode, VosEdge } from "@/lib/parsers/vosviewer-parser";
import { DiscoveredArticle } from "@/lib/parsers/openalex-parser";
import { CytoscapeGraph } from "./CytoscapeGraph";
import { KeywordTable } from "./KeywordTable";
import { GapCandidateList } from "./GapCandidateList";
import { BibliometricMethodologyPanel } from "./BibliometricMethodologyPanel";
import { exportToVosviewerFormat } from "@/lib/parsers/vosviewer-parser";
import {
  Search,
  Loader2,
  Sparkles,
  BookOpen,
  Download,
  Check,
  Plus,
  Compass,
  HelpCircle,
  Code2,
} from "lucide-react";

interface LiteratureSearchDirectProps {
  canvas: Canvas;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
  onPinFinding: (finding: PinnedFinding) => void;
  onUnpinFinding: (id: string) => void;
  onTakeSnapshot: (dataUrl: string) => void;
}

const CIVIL_PRESETS = [
  { label: "K3 ∩ Data Center", query: "K3 Data Center" },
  { label: "Beton Geopolimer ∩ Fly Ash", query: "Beton Geopolimer Fly Ash" },
  { label: "Bibliometric ∩ Fly Ash Geopolymer", query: "Bibliometric Fly Ash Geopolymer" },
  { label: "K3 ∩ Proyek Konstruksi", query: "K3 Proyek Konstruksi" },
  { label: "Kuat Lentur ∩ Balok Beton", query: "Kuat Lentur Balok Beton" },
  { label: "Stabilisasi Tanah ∩ Lempung", query: "Stabilisasi Tanah Lempung" },
  { label: "Aspal Modifikasi ∩ Polimer", query: "Aspal Modifikasi Polimer" },
  { label: "Struktur Tahan Gempa", query: "Struktur Tahan Gempa" },
];

export function LiteratureSearchDirect({
  canvas,
  onChange,
  onPinFinding,
  onUnpinFinding,
  onTakeSnapshot,
}: LiteratureSearchDirectProps) {
  const [query, setQuery] = useState(
    canvas.title.subject || canvas.title.intervention || "K3 Data Center"
  );
  const [minOccurrences, setMinOccurrences] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSearchedTopic, setActiveSearchedTopic] = useState<string>("");
  const [currentBooleanQuery, setCurrentBooleanQuery] = useState<string>("");
  const [currentFacets, setCurrentFacets] = useState<string[]>([]);
  const [showBooleanHelp, setShowBooleanHelp] = useState<boolean>(false);

  // Network State
  const [nodes, setNodes] = useState<VosNode[]>([]);
  const [edges, setEdges] = useState<VosEdge[]>([]);
  const [articles, setArticles] = useState<DiscoveredArticle[]>([]);
  const [minYear, setMinYear] = useState(2018);
  const [maxYear, setMaxYear] = useState(2025);
  const [viewMode, setViewMode] = useState<"network" | "overlay" | "table" | "articles" | "methodology">("network");
  const [selectedNode, setSelectedNode] = useState<VosNode | null>(null);
  const [transferredIds, setTransferredIds] = useState<Set<string>>(new Set());
  const [articleFilter, setArticleFilter] = useState<"all" | "review" | "primary">("all");
  const [selectedKeywordFilter, setSelectedKeywordFilter] = useState<string | null>(null);

  const handleInsertOperator = (op: string) => {
    setQuery((prev) => `${prev.trim()}${op}`);
  };

  const handleWrapQuotes = () => {
    setQuery((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return '""';
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed;
      return `"${trimmed}"`;
    });
  };

  const handleWrapParentheses = () => {
    setQuery((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return "()";
      return `(${trimmed})`;
    });
  };

  const handleSearch = async (searchQuery: string = query) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/literature/search?q=${encodeURIComponent(trimmed)}&minOccurrences=${minOccurrences}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mencari data literatur.");
      }

      if (!data.nodes || data.nodes.length === 0) {
        setError(`Tidak ditemukan kata kunci yang cukup untuk topik "${trimmed}". Coba gunakan variasi kata kunci lain atau dalam bahasa Inggris.`);
      }

      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setArticles(data.articles || []);
      setMinYear(data.minYear || 2018);
      setMaxYear(data.maxYear || 2025);
      setActiveSearchedTopic(trimmed);
      setCurrentBooleanQuery(data.booleanQuery || trimmed);
      setCurrentFacets(data.facets || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mencari literatur.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferArticle = (article: DiscoveredArticle) => {
    const newRef: Reference = {
      id: crypto.randomUUID(),
      authors: article.authors,
      year: article.year,
      title: article.title,
      source: article.journal,
      doi: article.doi || "",
      citedBy: article.citedByCount,
      indexSource: "scopus",
      keyFinding: `Meneliti topik ${article.keywords.slice(0, 3).join(", ")} dengan hasil terpublikasi pada ${article.journal}.`,
      limitation: "Perlu diinvestigasi lebih lanjut pada variasi parameter dan kondisi lokal yang spesifik.",
    };

    onChange((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        references: [...(prev.background.references || []), newRef],
      },
    }));

    setTransferredIds((prev) => new Set(prev).add(article.id));
  };

  const handleTransferTopArticles = () => {
    const topArticles = articles.slice(0, 5);
    const newRefs: Reference[] = topArticles.map((a) => ({
      id: crypto.randomUUID(),
      authors: a.authors,
      year: a.year,
      title: a.title,
      source: a.journal,
      doi: a.doi || "",
      citedBy: a.citedByCount,
      indexSource: "scopus",
      keyFinding: `Meneliti topik ${a.keywords.slice(0, 3).join(", ")} dengan kontribusi saintifik terukur.`,
      limitation: "Belum menguji secara spesifik intervensi kombinasi bahan dan batasan lingkungan yang diusulkan pada kanvas ini.",
    }));

    onChange((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        references: [...(prev.background.references || []), ...newRefs],
      },
    }));

    const newIds = new Set(transferredIds);
    topArticles.forEach((a) => newIds.add(a.id));
    setTransferredIds(newIds);
  };

  const handleDownloadVosFiles = () => {
    const { mapTxt, netTxt } = exportToVosviewerFormat(nodes, edges);

    const blobMap = new Blob([mapTxt], { type: "text/plain;charset=utf-8" });
    const urlMap = URL.createObjectURL(blobMap);
    const aMap = document.createElement("a");
    aMap.href = urlMap;
    aMap.download = `VOSviewer-${query.replace(/\s+/g, "_")}.map.txt`;
    aMap.click();
    URL.revokeObjectURL(urlMap);

    const blobNet = new Blob([netTxt], { type: "text/plain;charset=utf-8" });
    const urlNet = URL.createObjectURL(blobNet);
    const aNet = document.createElement("a");
    aNet.href = urlNet;
    aNet.download = `VOSviewer-${query.replace(/\s+/g, "_")}.net.txt`;
    aNet.click();
    URL.revokeObjectURL(urlNet);
  };

  const hasGraph = nodes.length > 0;

  return (
    <div className="space-y-6">
      {/* Search Hero Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl space-y-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold text-blue-100 mb-2">
            <Compass className="w-4 h-4 text-amber-300" />
            Pencarian Literatur Akademis & Peta VOSviewer Instan
          </span>
          <h3 className="text-xl font-extrabold tracking-tight">
            Ketik Tema Penelitian Anda &rarr; Peta VOSviewer Terbentuk Otomatis
          </h3>
          <p className="text-xs text-blue-100/90 leading-relaxed mt-1">
            Tidak perlu memasang software desktop VOSviewer atau mengunduh CSV manual. Cukup masukkan kata kunci topik tesis Anda, sistem akan langsung menambang artikel Scopus & Google Scholar dan merender jejaring bibliometrik secara instan.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder='Ketik tema tesis, mis. "K3" AND "Data Center", atau "beton geopolimer" AND "fly ash"...'
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs sm:text-sm focus:outline-none focus:ring-3 focus:ring-blue-300 shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => handleSearch(query)}
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Menambang Literatur & Peta...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Cari & Tampilkan Peta VOSviewer</span>
              </>
            )}
          </button>
        </div>

        {/* Boolean Operator Helper Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-blue-200 font-semibold mr-1 flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-amber-300" />
            Sisipkan Operator Boolean:
          </span>
          <button
            type="button"
            onClick={() => handleInsertOperator(" AND ")}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-amber-300 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Irisan Wajib: Kedua istilah harus ada dalam literatur (contoh: K3 AND Data Center)"
          >
            + AND
          </button>
          <button
            type="button"
            onClick={() => handleInsertOperator(" OR ")}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-blue-200 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Pilihan / Sinonim: Salah satu istilah cukup (contoh: 'data center' OR 'server farm')"
          >
            + OR
          </button>
          <button
            type="button"
            onClick={() => handleInsertOperator(" NOT ")}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-rose-300 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Pengecualian: Buang literatur yang memuat istilah ini"
          >
            + NOT
          </button>
          <button
            type="button"
            onClick={handleWrapQuotes}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-emerald-300 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Frasa Tepat: Bungkus kata kunci dengan tanda kutip ganda"
          >
            &quot;Frasa Tepat&quot;
          </button>
          <button
            type="button"
            onClick={handleWrapParentheses}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-purple-300 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Kelompok: Bungkus dengan tanda kurung ( ... )"
          >
            ( Kelompok )
          </button>

          <button
            type="button"
            onClick={() => setShowBooleanHelp(!showBooleanHelp)}
            className="ml-auto text-blue-200 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showBooleanHelp ? "Tutup Panduan" : "Panduan Boolean Scopus"}</span>
          </button>
        </div>

        {/* Collapsible Boolean Help Card */}
        {showBooleanHelp && (
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-2 backdrop-blur-md animate-in fade-in">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-4 h-4" />
              Panduan Pencarian Boolean (Standar Scopus / Google Scholar / UNY)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-blue-100">
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                <strong className="text-amber-300">1. Operator AND (Irisan Wajib):</strong>
                <p className="mt-0.5">Memastikan kedua konsep wajib ada di dokumen. Misal: <code className="text-amber-200 font-mono">K3 AND &quot;Data Center&quot;</code> hanya mengambil artikel keselamatan kerja khusus pada fasilitas data center.</p>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                <strong className="text-blue-200">2. Operator OR (Sinonim):</strong>
                <p className="mt-0.5">Memperluas padanan kata ilmiah. Misal: <code className="text-blue-200 font-mono">(&quot;data center&quot; OR &quot;server farm&quot;)</code>.</p>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                <strong className="text-emerald-300">3. Tanda Kutip &quot;...&quot; (Frasa Tepat):</strong>
                <p className="mt-0.5">Mencegah kata terpecah secara terpisah. Misal: <code className="text-emerald-200 font-mono">&quot;keselamatan kerja&quot;</code> bukan sekadar kata &quot;kerja&quot; acak.</p>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                <strong className="text-purple-300">4. Otomatisasi Cerdas:</strong>
                <p className="mt-0.5">Jika Anda hanya mengetik <code className="text-purple-200 font-mono">K3 Data Center</code>, sistem otomatis mengubahnya menjadi irisan Boolean <code className="text-purple-200 font-mono">K3 AND &quot;Data Center&quot;</code> dan menerjemahkan ke istilah internasional!</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold text-blue-200">
            Topik Populer Bidang Teknik Sipil (Klik untuk langsung memetakan):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CIVIL_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setQuery(preset.query);
                  handleSearch(preset.query);
                }}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/15 backdrop-blur transition-all active:scale-95 cursor-pointer"
              >
                {preset.label}
              </button>
            ))}

            {canvas.title.composed && (
              <button
                type="button"
                onClick={() => {
                  const titleTopic = [canvas.title.subject, canvas.title.intervention].filter(Boolean).join(" ");
                  setQuery(titleTopic || canvas.title.composed);
                  handleSearch(titleTopic || canvas.title.composed);
                }}
                className="px-3 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-[11px] font-bold border border-amber-300/30 backdrop-blur transition-all active:scale-95 cursor-pointer"
                title="Petakan berdasarkan judul kanvas Anda saat ini"
              >
                🎯 Topik Kanvas Anda: {canvas.title.subject || "Judul Sementara"}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* When Network is Loaded */}
      {hasGraph ? (
        <div className="space-y-6">
          {/* Active Searched Topic & Boolean Logic Banner */}
          {activeSearchedTopic && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-slate-800 dark:text-slate-200">
                    Hasil Pemetaan untuk: <strong className="text-blue-700 dark:text-blue-300 font-extrabold text-sm">&quot;{activeSearchedTopic}&quot;</strong>
                  </span>
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                  {articles.length} Artikel Ilmiah Terverifikasi &bull; {nodes.length} Kata Kunci &bull; {edges.length} Tautan Relasi
                </span>
              </div>

              {currentBooleanQuery && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] tracking-wide">
                      LOGIKA BOOLEAN
                    </span>
                    {currentFacets.length > 1 && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-[10px]">Irisan Konsep:</span>
                        {currentFacets.map((facet, idx) => (
                          <span
                            key={facet}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-[10px] text-blue-700 dark:text-blue-300"
                          >
                            {facet} {idx < currentFacets.length - 1 ? "∩" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500 font-mono truncate max-w-full" title={currentBooleanQuery}>
                      Query: <code className="text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">{currentBooleanQuery}</code>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewMode("methodology")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lihat Metode Bibliometrik &amp; Draf Bab 3</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Controls Bar & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Tampilan:</span>
              <button
                type="button"
                onClick={() => setViewMode("network")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "network"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Klaster Topik (Network View)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("overlay")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "overlay"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tahun Publikasi (Overlay View)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tabel Kata Kunci ({nodes.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("articles")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "articles"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Artikel Ilmiah ({articles.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("methodology")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "methodology"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>📘 Metode Bibliometrik (Bab 3)</span>
              </button>

              {selectedNode && (
                <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200">
                  {selectedNode.label} ({selectedNode.occurrences}x &bull; Klaster {selectedNode.cluster})
                </span>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mr-1">
                <span>Filter:</span>
                <select
                  value={minOccurrences}
                  onChange={(e) => setMinOccurrences(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold"
                >
                  <option value={1}>Min. 1x</option>
                  <option value={2}>Min. 2x</option>
                  <option value={3}>Min. 3x</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleTransferTopArticles}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                title="Transfer 5 artikel teratas ke daftar referensi kanvas Anda"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Transfer 5 Artikel ke Langkah 2</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadVosFiles}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-all shadow-xs"
                title="Unduh berkas .map.txt dan .net.txt untuk dibuka di VOSviewer desktop"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File VOSviewer</span>
              </button>
            </div>
          </div>

          {/* Cytoscape Canvas */}
          {(viewMode === "network" || viewMode === "overlay") && (
            <CytoscapeGraph
              nodes={nodes}
              edges={edges}
              viewMode={viewMode}
              minYear={minYear}
              maxYear={maxYear}
              onSelectNode={setSelectedNode}
              onTakeSnapshot={onTakeSnapshot}
            />
          )}

          {/* Keyword Table View */}
          {viewMode === "table" && (
            <KeywordTable nodes={nodes} onSelectKeyword={(node) => setSelectedNode(node)} />
          )}

          {/* Articles View */}
          {viewMode === "articles" && (() => {
            const isReviewArticle = (art: DiscoveredArticle) =>
              /review|bibliometric|scientometric|systematic|meta-analysis/i.test(art.title);

            const reviewArticles = articles.filter(isReviewArticle);
            const primaryArticles = articles.filter((a) => !isReviewArticle(a));

            const filteredArticles = articles.filter((art) => {
              if (articleFilter === "review" && !isReviewArticle(art)) return false;
              if (articleFilter === "primary" && isReviewArticle(art)) return false;
              if (selectedKeywordFilter) {
                const match = art.keywords.some((k) => k.toLowerCase() === selectedKeywordFilter.toLowerCase());
                if (!match) return false;
              }
              return true;
            });

            const topFacets = nodes.slice(0, 8);

            return (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{filteredArticles.length} dari {articles.length} Artikel Ilmiah</span>
                      {selectedKeywordFilter && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                          Filter: {selectedKeywordFilter}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Terindeks di Scopus, CrossRef, Europe PMC &amp; Google Scholar
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedKeywordFilter && (
                      <button
                        type="button"
                        onClick={() => setSelectedKeywordFilter(null)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleTransferTopArticles}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Transfer 5 Teratas ke Kanvas</span>
                    </button>
                  </div>
                </div>

                {/* Scopus-style Filter Tabs: All vs Bibliometric Reviews vs Primary Research */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-1">Tipe Dokumen (Scopus):</span>
                  <button
                    type="button"
                    onClick={() => setArticleFilter("all")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      articleFilter === "all"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    Semua Dokumen ({articles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleFilter("review")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      articleFilter === "review"
                        ? "bg-amber-600 text-white"
                        : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    <span>🔍 Tinjauan Bibliometrik / Review ({reviewArticles.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleFilter("primary")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      articleFilter === "primary"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    Artikel Penelitian Primer ({primaryArticles.length})
                  </button>
                </div>

                {/* Scopus-style Keyword Facets Pill Row */}
                {topFacets.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Facet Kata Kunci Scopus (Klik untuk memfilter artikel):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {topFacets.map((f) => {
                        const isSelected = selectedKeywordFilter?.toLowerCase() === f.label.toLowerCase();
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() =>
                              setSelectedKeywordFilter(isSelected ? null : f.label)
                            }
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                            }`}
                          >
                            {f.label} <strong className="ml-1 opacity-75">({f.occurrences})</strong>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {filteredArticles.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Tidak ada artikel yang cocok dengan filter yang dipilih.
                    </div>
                  ) : (
                    filteredArticles.map((art) => {
                      const isTransferred = transferredIds.has(art.id);
                      const isReview = isReviewArticle(art);
                      return (
                        <div
                          key={art.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-blue-400 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5">
                              {/* Scopus metadata tags: Review, Open Access */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {isReview && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                                    Review / Bibliometric
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                  Open Access
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Tahun: {art.year}
                                </span>
                              </div>

                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                                {art.title}
                              </h5>
                              <p className="text-xs text-slate-500">
                                {art.authors} &bull; <span className="italic">{art.journal}</span> &bull; <strong>{art.citedByCount}</strong> sitasi
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleTransferArticle(art)}
                              disabled={isTransferred}
                              className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isTransferred
                                  ? "bg-slate-100 text-slate-400 cursor-default"
                                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                              }`}
                            >
                              {isTransferred ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Ditambahkan</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Tambah ke Kanvas</span>
                                </>
                              )}
                            </button>
                          </div>

                          {art.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {art.keywords.map((kw, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setSelectedKeywordFilter(kw)}
                                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-blue-400 cursor-pointer"
                                >
                                  {kw}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

          {/* Bibliometric Methodology View */}
          {viewMode === "methodology" && (
            <BibliometricMethodologyPanel
              canvas={canvas}
              query={activeSearchedTopic || query}
              booleanQuery={currentBooleanQuery}
              nodes={nodes}
              edges={edges}
              articles={articles}
              minYear={minYear}
              maxYear={maxYear}
              onChange={onChange}
            />
          )}

          {/* Research Gap Candidates Analysis */}
          <GapCandidateList
            nodes={nodes}
            edges={edges}
            canvas={canvas}
            onPinFinding={onPinFinding}
            onUnpinFinding={onUnpinFinding}
          />
        </div>
      ) : (
        <div className="py-12 px-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Peta Literatur Belum Dimuat
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Ketik tema di atas atau klik salah satu tombol topik populer untuk langsung menambang dan melihat visualisasi graf VOSviewer.
          </p>
        </div>
      )}
    </div>
  );
}
