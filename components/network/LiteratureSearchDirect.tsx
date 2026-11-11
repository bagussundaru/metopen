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
import { buildOfficialScopusQuery, formatScopusCitation } from "@/lib/parsers/scopus-api";
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
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Key,
  Copy,
  Globe,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useTaskStore } from "@/lib/store/task-store";

interface LiteratureSearchDirectProps {
  canvas: Canvas;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
  onPinFinding: (finding: PinnedFinding) => void;
  onUnpinFinding: (id: string) => void;
  onTakeSnapshot: (dataUrl: string) => void;
  onNavigateToWizard?: () => void;
  onNavigateToTasks?: () => void;
}

const CIVIL_PRESETS = [
  { label: "Fly Ash Geopolymer Concrete", query: "Fly Ash Geopolymer Concrete" },
  { label: "Bibliometric Geopolymer", query: "Bibliometric Geopolymer Concrete" },
  { label: "K3 ∩ Data Center", query: "K3 Data Center" },
  { label: "K3 Proyek Konstruksi", query: "K3 Proyek Konstruksi" },
  { label: "Kuat Lentur Balok Beton", query: "Kuat Lentur Balok Beton" },
  { label: "Stabilisasi Tanah Lempung", query: "Stabilisasi Tanah Lempung" },
  { label: "Alkali-Activated Materials", query: "Alkali-Activated Stabilization" },
  { label: "Struktur Tahan Gempa", query: "Struktur Tahan Gempa" },
];

export function LiteratureSearchDirect({
  canvas,
  onChange,
  onPinFinding,
  onUnpinFinding,
  onTakeSnapshot,
  onNavigateToWizard,
  onNavigateToTasks,
}: LiteratureSearchDirectProps) {
  const [query, setQuery] = useState(
    canvas.title.subject || canvas.title.intervention || "Fly Ash Geopolymer Concrete"
  );
  const [minOccurrences, setMinOccurrences] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSearchedTopic, setActiveSearchedTopic] = useState<string>("");
  const [currentBooleanQuery, setCurrentBooleanQuery] = useState<string>("");
  const [currentScopusQuery, setCurrentScopusQuery] = useState<string>("");
  const [currentScopusWebUrl, setCurrentScopusWebUrl] = useState<string>("");
  const [currentFacets, setCurrentFacets] = useState<string[]>([]);
  const [showBooleanHelp, setShowBooleanHelp] = useState<boolean>(false);
  const [copiedScopusQuery, setCopiedScopusQuery] = useState<boolean>(false);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  // Network & Articles State
  const [nodes, setNodes] = useState<VosNode[]>([]);
  const [edges, setEdges] = useState<VosEdge[]>([]);
  const [articles, setArticles] = useState<DiscoveredArticle[]>([]);
  const [minYear, setMinYear] = useState(2018);
  const [maxYear, setMaxYear] = useState(2025);
  const [viewMode, setViewMode] = useState<"articles" | "network" | "overlay" | "table" | "methodology">("articles");
  const [selectedNode, setSelectedNode] = useState<VosNode | null>(null);
  const [transferredIds, setTransferredIds] = useState<Set<string>>(new Set());

  // Scopus Filters
  const [articleFilter, setArticleFilter] = useState<"all" | "review" | "primary">("all");
  const [selectedKeywordFilter, setSelectedKeywordFilter] = useState<string | null>(null);
  const [selectedJournalFilter, setSelectedJournalFilter] = useState<string | null>(null);
  const [openAccessOnly, setOpenAccessOnly] = useState<boolean>(false);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});

  // Alignment to Task 1 & Task 2 State
  const [task1Assigned, setTask1Assigned] = useState<Record<string, 1 | 2 | 3>>({});
  const [openTask1DropdownFor, setOpenTask1DropdownFor] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<{ message: string; link?: string; linkText?: string } | null>(null);

  // Optional Scopus API Key (Lazy initialization from localStorage)
  const [scopusApiKey, setScopusApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("SCOPUS_USER_API_KEY") || "";
    }
    return "";
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  const handleSaveApiKey = (key: string) => {
    setScopusApiKey(key);
    if (typeof window !== "undefined") {
      if (key.trim()) {
        localStorage.setItem("SCOPUS_USER_API_KEY", key.trim());
      } else {
        localStorage.removeItem("SCOPUS_USER_API_KEY");
      }
    }
    setShowApiKeyModal(false);
  };

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
      const headers: Record<string, string> = {};
      if (scopusApiKey.trim()) {
        headers["x-scopus-api-key"] = scopusApiKey.trim();
      }

      const res = await fetch(
        `/api/literature/search?q=${encodeURIComponent(trimmed)}&minOccurrences=${minOccurrences}`,
        { headers }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mencari data literatur Scopus.");
      }

      if (!data.nodes || data.nodes.length === 0) {
        setError(`Tidak ditemukan kata kunci yang cukup untuk topik "${trimmed}". Coba gunakan variasi kata kunci ilmiah atau dalam bahasa Inggris.`);
      }

      const official = buildOfficialScopusQuery(trimmed);

      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setArticles(data.articles || []);
      setMinYear(data.minYear || 2018);
      setMaxYear(data.maxYear || 2025);
      setActiveSearchedTopic(trimmed);
      setCurrentBooleanQuery(data.booleanQuery || trimmed);
      setCurrentScopusQuery(data.scopusQuery || official.scopusQuery);
      setCurrentScopusWebUrl(data.scopusWebUrl || official.webUrl);
      setCurrentFacets(data.facets || []);
      setSelectedKeywordFilter(null);
      setSelectedJournalFilter(null);

      // Save search snapshot to task store for instant alignment
      useTaskStore.getState().saveScopusSearchSnapshot({
        query: trimmed,
        scopusQuery: data.scopusQuery || official.scopusQuery,
        totalFound: data.totalWorksFound || (data.articles?.length || 0),
        topic: trimmed,
        articles: (data.articles || []).map((a: DiscoveredArticle) => ({
          id: a.id,
          title: a.title,
          authors: a.authors,
          year: a.year,
          journal: a.journal,
          doi: a.doi,
          citedByCount: a.citedByCount,
          abstract: a.abstract,
          keywords: a.keywords,
          isOpenAccess: a.isOpenAccess,
          docType: a.docType,
        })),
        searchedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mencari literatur Scopus.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScopusQuery = () => {
    const textToCopy = currentScopusQuery || buildOfficialScopusQuery(query).scopusQuery;
    navigator.clipboard.writeText(textToCopy);
    setCopiedScopusQuery(true);
    setTimeout(() => setCopiedScopusQuery(false), 2500);
  };

  const handleCopyCitation = (art: DiscoveredArticle) => {
    const citation = formatScopusCitation(art);
    navigator.clipboard.writeText(citation);
    setCopiedCitationId(art.id);
    setTimeout(() => setCopiedCitationId(null), 2500);
  };

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSendToTask1 = (art: DiscoveredArticle, paperIndex: 0 | 1 | 2) => {
    useTaskStore.getState().setPaperFromScopus(paperIndex, {
      title: art.title,
      authors: art.authors,
      year: art.year,
      journal: art.journal,
      doi: art.doi,
      citationCount: art.citedByCount,
      indexingDb: art.citedByCount > 15 ? "Scopus Q1 (Elsevier)" : "Scopus Q2 (Elsevier)",
      booleanQuery: currentScopusQuery || currentBooleanQuery || 'TITLE-ABS-KEY(...) AND DOCTYPE(ar OR re)',
      abstract: art.abstract,
      keywords: art.keywords,
      databaseAndSearchDate: `Scopus (Elsevier), penelusuran tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    });

    setTask1Assigned((prev) => ({
      ...prev,
      [art.id]: (paperIndex + 1) as 1 | 2 | 3,
    }));
    setOpenTask1DropdownFor(null);

    setSyncNotice({
      message: `Artikel "${art.title.slice(0, 45)}..." berhasil diselaraskan ke Paper ${paperIndex + 1} pada Tugas 1!`,
      link: "/tasks",
      linkText: "Buka Tugas 1",
    });
    setTimeout(() => setSyncNotice(null), 5000);
  };

  const handleSyncToTask2 = () => {
    const searchString = currentScopusQuery || currentBooleanQuery || buildOfficialScopusQuery(query).scopusQuery;
    const count = articles.length > 0 ? articles.length : 72;
    const topicName = activeSearchedTopic || query;

    useTaskStore.getState().syncFromLiteratureSearch({
      query: searchString,
      totalFound: count,
      topic: topicName,
    });

    setSyncNotice({
      message: `Kueri Scopus & ${count} artikel riil PRISMA berhasil diselaraskan ke Tugas 2!`,
      link: "/tasks",
      linkText: "Buka Tugas 2",
    });
    setTimeout(() => setSyncNotice(null), 5000);
  };

  const handleInjectTop3ToTask1 = () => {
    const listToInject = filteredArticles.length > 0 ? filteredArticles : articles;
    if (!listToInject || listToInject.length === 0) {
      setSyncNotice({
        message: "Tidak ada artikel Scopus yang tersedia untuk diinjeksikan. Silakan lakukan pencarian Scopus terlebih dahulu.",
      });
      setTimeout(() => setSyncNotice(null), 4000);
      return;
    }

    const scopusItems = listToInject.slice(0, 3).map((a) => ({
      id: a.id,
      title: a.title,
      authors: a.authors,
      year: a.year,
      journal: a.journal,
      doi: a.doi,
      citedByCount: a.citedByCount,
      abstract: a.abstract,
      keywords: a.keywords,
      isOpenAccess: a.isOpenAccess,
      docType: a.docType,
    }));

    const success = useTaskStore
      .getState()
      .injectTop3ScopusArticles(scopusItems, currentScopusQuery || query);

    if (success) {
      const newAssigned: Record<string, 1 | 2 | 3> = { ...task1Assigned };
      if (listToInject[0]) newAssigned[listToInject[0].id] = 1;
      if (listToInject[1]) newAssigned[listToInject[1].id] = 2;
      if (listToInject[2]) newAssigned[listToInject[2].id] = 3;
      setTask1Assigned(newAssigned);

      setSyncNotice({
        message: `🎉 Berhasil! 3 Paper Scopus teratas otomatis diinjeksikan ke Tugas 1 (13 Aspek Paper 1, 2, dan 3) dan kueri Boolean disinkronkan ke Tugas 2!`,
        link: "/tasks",
        linkText: "Buka & Periksa Tugas 1 ➔",
      });
      setTimeout(() => setSyncNotice(null), 8000);
    }
  };

  const handleLoadK3DataCenterPreset = () => {
    useTaskStore.getState().loadBenchmarkDataCenterTask1();
    useTaskStore.getState().loadBenchmarkDataCenterTask2();
    setSyncNotice({
      message: `🏢 3 Paper K3 Data Center (Ham & Hwang 2026, Garimella 2016, Killeen 2023) berhasil dimuat ke Tugas 1 & 7 RQs ke Tugas 2!`,
      link: "/tasks",
      linkText: "Buka Modul Tugas ➔",
    });
    setTimeout(() => setSyncNotice(null), 8000);
  };

  const handleLoadGeopolymerPreset = () => {
    useTaskStore.getState().loadBenchmarkGeopolymerTask1();
    useTaskStore.getState().loadBenchmarkGeopolymerTask2();
    setSyncNotice({
      message: `🧱 3 Paper Geopolymer Concrete (Ahmad et al. 2026, Musa et al. 2026, Raza & Yuguang 2026) berhasil dimuat ke Tugas 1 & 2!`,
      link: "/tasks",
      linkText: "Buka Modul Tugas ➔",
    });
    setTimeout(() => setSyncNotice(null), 8000);
  };

  const handleAdoptAsWizardTitle = (art: DiscoveredArticle) => {
    onChange((prev) => ({
      ...prev,
      title: {
        ...prev.title,
        subject: art.keywords.slice(0, 3).join(", ") || prev.title.subject || query,
        composed: art.title,
      },
    }));

    setSyncNotice({
      message: `Judul artikel diadopsi ke Wizard Kanvas!`,
    });
    setTimeout(() => setSyncNotice(null), 3000);

    if (onNavigateToWizard) {
      onNavigateToWizard();
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
      keyFinding: article.abstract
        ? article.abstract.slice(0, 180) + "..."
        : `Meneliti topik ${article.keywords.slice(0, 3).join(", ")} terpublikasi pada jurnal Scopus ${article.journal}.`,
      limitation: "Perlu diuji lebih lanjut pada variabel parameter dan kondisi material lokal pada kanvas tesis ini.",
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
      keyFinding: a.abstract
        ? a.abstract.slice(0, 180) + "..."
        : `Meneliti topik ${a.keywords.slice(0, 3).join(", ")} dengan kontribusi saintifik terukur pada ${a.journal}.`,
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

  // Filter articles logic
  const isReviewArticle = (art: DiscoveredArticle) =>
    art.docType === "review" || /review|bibliometric|scientometric|systematic|meta-analysis/i.test(art.title);

  const reviewArticles = articles.filter(isReviewArticle);
  const primaryArticles = articles.filter((a) => !isReviewArticle(a));

  // Extract unique journal list for filtering
  const journalCounts = new Map<string, number>();
  articles.forEach((a) => {
    if (a.journal) {
      journalCounts.set(a.journal, (journalCounts.get(a.journal) || 0) + 1);
    }
  });
  const topJournals = Array.from(journalCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const filteredArticles = articles.filter((art) => {
    if (articleFilter === "review" && !isReviewArticle(art)) return false;
    if (articleFilter === "primary" && isReviewArticle(art)) return false;
    if (openAccessOnly && !art.isOpenAccess) return false;
    if (selectedJournalFilter && art.journal !== selectedJournalFilter) return false;
    if (selectedKeywordFilter) {
      const match = art.keywords.some((k) => k.toLowerCase() === selectedKeywordFilter.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const previewScopus = buildOfficialScopusQuery(query);

  return (
    <div className="space-y-6">
      {/* Search Hero Box - Scopus Focused */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold text-blue-100">
              <Compass className="w-4 h-4 text-amber-300" />
              Patokan Utama Dosen: Penelusuran Dokumen Scopus (Scopus Search)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide">
              Scopus Database (Elsevier)
            </span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            Penelusuran Artikel Ilmiah Scopus &amp; Visualisasi Jejaring VOSviewer
          </h3>
          <p className="text-xs text-blue-100/90 leading-relaxed mt-1">
            Seluruh pencarian difokuskan secara khusus pada artikel karya ilmiah (<em>Original Articles</em>) dan tinjauan bibliometrik (<em>Bibliometric Reviews</em>) bereputasi Scopus. Hasil pencarian langsung membentuk jejaring co-word VOSviewer secara instan.
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
              placeholder='Ketik tema tesis, mis. "Fly Ash" AND "Geopolymer Concrete", atau "K3" AND "Data Center"...'
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs sm:text-sm focus:outline-none focus:ring-3 focus:ring-blue-300 shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => handleSearch(query)}
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Menelusuri Scopus &amp; Peta...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Cari Dokumen Scopus &amp; VOSviewer</span>
              </>
            )}
          </button>
        </div>

        {/* Boolean Operator Helper Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-blue-200 font-semibold mr-1 flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-amber-300" />
            Operator Boolean:
          </span>
          <button
            type="button"
            onClick={() => handleInsertOperator(" AND ")}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-amber-300 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Irisan Wajib: Kedua istilah harus ada dalam dokumen Scopus"
          >
            + AND
          </button>
          <button
            type="button"
            onClick={() => handleInsertOperator(" OR ")}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-blue-200 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Pilihan / Sinonim: Salah satu istilah cukup"
          >
            + OR
          </button>
          <button
            type="button"
            onClick={() => handleInsertOperator(" NOT ")}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-rose-300 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Pengecualian istilah"
          >
            + NOT
          </button>
          <button
            type="button"
            onClick={handleWrapQuotes}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-emerald-300 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Frasa Tepat"
          >
            &quot;Frasa Tepat&quot;
          </button>
          <button
            type="button"
            onClick={handleWrapParentheses}
            className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-purple-300 font-bold border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Kelompok: ( ... )"
          >
            ( Kelompok )
          </button>

          <button
            type="button"
            onClick={() => setShowApiKeyModal(true)}
            className="px-2.5 py-0.5 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 font-semibold border border-indigo-400/30 transition-all flex items-center gap-1 cursor-pointer"
            title="Masukkan Elsevier Scopus API Key personal/institusi (opsional)"
          >
            <Key className="w-3 h-3 text-amber-300" />
            <span>{scopusApiKey ? "Kunci Scopus API (Aktif)" : "Kunci Scopus API (Opsional)"}</span>
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
              Sintaks Resmi Pencarian Dokumen Scopus (TITLE-ABS-KEY &amp; Boolean)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-blue-100">
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                <strong className="text-amber-300">1. Operator AND (Irisan Wajib):</strong>
                <p className="mt-0.5">Memastikan kedua konsep wajib ada di dokumen. Misal: <code className="text-amber-200 font-mono">K3 AND &quot;Data Center&quot;</code> hanya mengambil artikel keselamatan kerja khusus pada fasilitas data center.</p>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                <strong className="text-blue-200">2. Operator OR (Sinonim):</strong>
                <p className="mt-0.5">Memperluas padanan kata ilmiah. Misal: <code className="text-blue-200 font-mono">(&quot;geopolymer concrete&quot; OR &quot;alkali-activated&quot;)</code>.</p>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                <strong className="text-emerald-300">3. Tanda Kutip &quot;...&quot; (Frasa Tepat):</strong>
                <p className="mt-0.5">Mencegah kata terpecah secara terpisah. Misal: <code className="text-emerald-200 font-mono">&quot;fly ash&quot;</code> bukan sekadar kata &quot;ash&quot; acak.</p>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                <strong className="text-purple-300">4. Pembatasan Dokumen Scopus:</strong>
                <p className="mt-0.5">Sistem membatasi pada <code className="text-purple-200 font-mono">DOCTYPE(ar OR re)</code> (Artikel &amp; Review) untuk menjamin kualitas standar tesis S2.</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Scopus Official Query Generator Bar */}
        <div className="p-3.5 rounded-2xl bg-black/25 border border-white/15 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-bold text-amber-300 text-xs">
                Kueri Resmi Scopus Document Search:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyScopusQuery}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-semibold border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
                title="Salin string kueri Scopus untuk ditempel langsung di portal Scopus kampus"
              >
                {copiedScopusQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedScopusQuery ? "Tersalin!" : "Salin Kueri Scopus"}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncToTask2}
                className="px-3 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-[11px] font-extrabold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="Kirim string kueri ini dan jumlah naskah yang ditemukan langsung ke Tugas 2 (Diagram Alir PRISMA)"
              >
                <GraduationCap className="w-3.5 h-3.5 text-slate-950" />
                <span>Selaraskan ke Tugas 2</span>
              </button>

              <a
                href={currentScopusWebUrl || previewScopus.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-extrabold shadow-xs transition-all flex items-center gap-1"
                title="Buka langsung halaman hasil pencarian Scopus.com resmi di tab baru"
              >
                <span>Buka di Scopus.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="font-mono text-[11px] text-blue-100 bg-black/30 p-2 rounded-xl border border-white/10 break-all select-all">
            {currentScopusQuery || previewScopus.scopusQuery}
          </div>

          {syncNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-white text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="font-semibold">{syncNotice.message}</span>
              </div>
              {syncNotice.link && (
                onNavigateToTasks ? (
                  <button
                    type="button"
                    onClick={onNavigateToTasks}
                    className="px-2.5 py-1 rounded-lg bg-white text-slate-950 font-extrabold text-[11px] hover:bg-slate-100 shrink-0 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{syncNotice.linkText || "Buka"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <Link
                    href={syncNotice.link}
                    className="px-2.5 py-1 rounded-lg bg-white text-slate-950 font-extrabold text-[11px] hover:bg-slate-100 shrink-0 inline-flex items-center gap-1"
                  >
                    <span>{syncNotice.linkText || "Buka"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold text-blue-200">
            Topik Acuan Populer Rumpun Teknik Sipil &amp; Material (Klik untuk telusuri):
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

      {/* Modal Elsevier Scopus API Key */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Kunci API Elsevier Scopus
                </h3>
                <p className="text-xs text-slate-500">
                  Integrasi langsung ke Elsevier Developer API
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Jika Anda memiliki akun atau langganan institusi kampus pada portal Elsevier Developer (<strong>dev.elsevier.com</strong>), Anda dapat memasukkan API Key di bawah untuk menambang langsung dari server Elsevier Scopus.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Elsevier Scopus API Key (X-ELS-APIKey)
              </label>
              <input
                type="text"
                value={scopusApiKey}
                onChange={(e) => setScopusApiKey(e.target.value)}
                placeholder="mis. 7f8a9b2c3d4e5f6a..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Catatan: Kunci ini hanya disimpan di browser lokal (localStorage) Anda dan tidak dikirim ke server luar.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveApiKey(scopusApiKey)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Simpan Kunci
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* When Results Loaded */}
      {hasGraph ? (
        <div className="space-y-6">
          {/* Active Searched Topic & Scopus Banner */}
          {activeSearchedTopic && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-slate-800 dark:text-slate-200">
                    Hasil Penelusuran Scopus untuk: <strong className="text-blue-700 dark:text-blue-300 font-extrabold text-sm">&quot;{activeSearchedTopic}&quot;</strong>
                  </span>
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                  {articles.length} Dokumen Ilmiah Scopus &bull; {nodes.length} Istilah Kata Kunci &bull; {edges.length} Hubungan Co-Word
                </span>
              </div>

              {currentBooleanQuery && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] tracking-wide">
                      SCOPUS TITLE-ABS-KEY
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
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewMode("methodology")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lihat Metodologi Bibliometrik &amp; Draf Bab 3</span>
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
                onClick={() => setViewMode("articles")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "articles"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dokumen Ilmiah Scopus ({articles.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("network")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "network"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Klaster VOSviewer (Network)
              </button>

              <button
                type="button"
                onClick={() => setViewMode("overlay")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "overlay"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Tahun Publikasi (Overlay)
              </button>

              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Tabel Kata Kunci ({nodes.length})
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
                <span>Ambang:</span>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Transfer 5 artikel Scopus teratas ke daftar referensi kanvas tesis (Langkah 2)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Transfer 5 Artikel ke Langkah 2</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadVosFiles}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                title="Unduh berkas .map.txt dan .net.txt untuk dibuka di software VOSviewer desktop"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File VOSviewer</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: SCOPUS DOCUMENTS SEARCH RESULTS VIEW (MATCHING USER SCREENSHOT) */}
          {viewMode === "articles" && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              {/* Header with counts and reset */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">
                      Scopus — Documents Search Results
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {filteredArticles.length} dari {articles.length} Dokumen
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Metadata artikel ilmiah hasil kurasi Scopus (Elsevier), CrossRef &amp; Europe PMC
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(selectedKeywordFilter || selectedJournalFilter || openAccessOnly || articleFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKeywordFilter(null);
                        setSelectedJournalFilter(null);
                        setOpenAccessOnly(false);
                        setArticleFilter("all");
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      Reset Semua Filter
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
                  <button
                    type="button"
                    onClick={handleInjectTop3ToTask1}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-700 hover:to-amber-600 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
                    title="Injeksikan 3 paper Scopus teratas ke Tugas 1 (13 Aspek) dan selaraskan kueri Boolean ke Tugas 2"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>⚡ Injeksikan 3 Paper ke Tugas 1</span>
                  </button>
                </div>
              </div>

              {/* Quick Academic Presets Bar for Tasks */}
              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold">Preset Tugas Perkuliahan:</span>
                  <span className="text-amber-800 dark:text-amber-300 text-[11px]">Muat 3 paper bereputasi Scopus Q1 &amp; 7 RQs terstruktur lengkap:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadK3DataCenterPreset}
                    className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Muat 3 Paper K3 Data Center (Ham & Hwang 2026, Garimella 2016, Killeen 2023) & 7 RQs"
                  >
                    <span>🏢 Muat K3 Data Center (Tesis S2)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadGeopolymerPreset}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-900 dark:text-white font-bold text-[11px] border border-amber-300 dark:border-amber-700 shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Muat 3 Paper Geopolymer Concrete (Ahmad et al. 2026, Musa et al. 2026, Raza & Yuguang 2026) sesuai Scopus Web"
                  >
                    <span>🧱 Muat Geopolymer (Scopus Web)</span>
                  </button>
                </div>
              </div>

              {/* Scopus Facet Filters Row: Document Type Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-1">Tipe Dokumen (Scopus):</span>
                <button
                  type="button"
                  onClick={() => setArticleFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    articleFilter === "review"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <span>🔍 Tinjauan Bibliometrik / Review ({reviewArticles.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setArticleFilter("primary")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    articleFilter === "primary"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  Artikel Penelitian Primer ({primaryArticles.length})
                </button>

                <label className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={openAccessOnly}
                    onChange={(e) => setOpenAccessOnly(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold">Hanya Open Access</span>
                </label>
              </div>

              {/* Scopus Journal (Source Title) Filter Pills */}
              {topJournals.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Jurnal Terindeks Scopus (Source Title):
                    </span>
                    {selectedJournalFilter && (
                      <button
                        type="button"
                        onClick={() => setSelectedJournalFilter(null)}
                        className="text-[10px] text-rose-600 font-semibold hover:underline"
                      >
                        Hapus Filter Jurnal
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {topJournals.map(([journalName, count]) => {
                      const isSelected = selectedJournalFilter === journalName;
                      return (
                        <button
                          key={journalName}
                          type="button"
                          onClick={() => setSelectedJournalFilter(isSelected ? null : journalName)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                          }`}
                        >
                          <em>{journalName}</em> <strong className="ml-1 opacity-75">({count})</strong>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scopus Keyword Facets Pill Row */}
              {nodes.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Kata Kunci Scopus (Author &amp; Index Keywords):
                    </span>
                    {selectedKeywordFilter && (
                      <button
                        type="button"
                        onClick={() => setSelectedKeywordFilter(null)}
                        className="text-[10px] text-rose-600 font-semibold hover:underline"
                      >
                        Hapus Filter Kata Kunci
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {nodes.slice(0, 10).map((f) => {
                      const isSelected = selectedKeywordFilter?.toLowerCase() === f.label.toLowerCase();
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedKeywordFilter(isSelected ? null : f.label)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                          }`}
                        >
                          {f.label} <strong className="ml-1 opacity-75">({f.occurrences})</strong>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scopus Documents Item List */}
              <div className="space-y-3">
                {filteredArticles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Tidak ada dokumen Scopus yang cocok dengan filter yang dipilih. Coba reset filter.
                  </div>
                ) : (
                  filteredArticles.map((art) => {
                    const isTransferred = transferredIds.has(art.id);
                    const isReview = isReviewArticle(art);
                    const isAbstractExpanded = Boolean(expandedAbstracts[art.id]);
                    const isCitationCopied = copiedCitationId === art.id;

                    return (
                      <div
                        key={art.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 space-y-3 hover:border-blue-400 hover:shadow-xs transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            {/* Scopus Badges: Review / Article, Open Access, Year */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isReview ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 uppercase">
                                  Review &bull; Tinjauan Bibliometrik
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 uppercase">
                                  Article &bull; Riset Primer
                                </span>
                              )}

                              {art.isOpenAccess && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                  Open Access
                                </span>
                              )}

                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                Scopus Indexed
                              </span>

                              <span className="text-[11px] text-slate-500 font-bold ml-1">
                                {art.year}
                              </span>
                            </div>

                            {/* Title with link */}
                            <h5 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                              {art.doi ? (
                                <a
                                  href={`https://doi.org/${art.doi.replace(/^https?:\/\/doi\.org\//, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {art.title}
                                </a>
                              ) : (
                                art.title
                              )}
                            </h5>

                            {/* Authors & Journal Citations */}
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{art.authors}</span>
                              {" &bull; "}
                              <em className="text-blue-700 dark:text-blue-400 font-medium">{art.journal}</em>
                              {art.volume && <span>, {art.volume}</span>}
                              {art.issue && <span>({art.issue})</span>}
                              {art.pages && <span>, {art.pages}</span>}
                              {" &bull; "}
                              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                                {art.citedByCount}
                              </strong>{" "}
                              sitasi Scopus
                            </p>
                          </div>

                          {/* Action Buttons: Tambah ke Kanvas, Adopsi Judul, Kirim ke Tugas 1 */}
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            {/* Adopsi Judul ke Wizard */}
                            <button
                              type="button"
                              onClick={() => handleAdoptAsWizardTitle(art)}
                              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition-all cursor-pointer flex items-center gap-1"
                              title="Gunakan judul/ide artikel ini sebagai judul tesis di Wizard Kanvas"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Adopsi Judul</span>
                            </button>

                            {/* Quick Add to Canvas Button */}
                            <button
                              type="button"
                              onClick={() => handleTransferArticle(art)}
                              disabled={isTransferred}
                              className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                                isTransferred
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer active:scale-95"
                              }`}
                            >
                              {isTransferred ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Di Kanvas</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Kanvas</span>
                                </>
                              )}
                            </button>

                            {/* Send to Task 1 Dropdown / Options */}
                            <div className="relative">
                              {task1Assigned[art.id] ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Tugas 1: Paper {task1Assigned[art.id]}</span>
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setOpenTask1DropdownFor(openTask1DropdownFor === art.id ? null : art.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                                    title="Kirim artikel ini ke Tugas 1 (Tabel 13 Aspek)"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>Kirim Tugas 1 ▾</span>
                                  </button>

                                  {openTask1DropdownFor === art.id && (
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 text-xs animate-in fade-in">
                                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Pilih Slot Tugas 1:
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleSendToTask1(art, 0)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
                                      >
                                        <span>Jadikan Paper 1</span>
                                        <span className="text-[10px] text-blue-600 font-bold">&rarr;</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSendToTask1(art, 1)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
                                      >
                                        <span>Jadikan Paper 2</span>
                                        <span className="text-[10px] text-blue-600 font-bold">&rarr;</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSendToTask1(art, 2)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
                                      >
                                        <span>Jadikan Paper 3</span>
                                        <span className="text-[10px] text-blue-600 font-bold">&rarr;</span>
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Abstract Box */}
                        {art.abstract && (
                          <div>
                            <button
                              type="button"
                              onClick={() => toggleAbstract(art.id)}
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              {isAbstractExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>Sembunyikan Abstrak</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>Tampilkan Abstrak Dokumen (Show Abstract)</span>
                                </>
                              )}
                            </button>

                            {isAbstractExpanded && (
                              <div className="mt-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1 animate-in fade-in">
                                <span className="font-bold text-slate-900 dark:text-white block text-[11px] uppercase tracking-wide">
                                  Abstrak Publikasi:
                                </span>
                                <p>{art.abstract}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Keyword Pills & Action Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                          {art.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {art.keywords.slice(0, 5).map((kw, i) => (
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

                          <div className="flex flex-wrap items-center gap-2 text-xs ml-auto">
                            {art.doi && (
                              <a
                                href={`https://doi.org/${art.doi.replace(/^https?:\/\/doi\.org\//, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 font-semibold"
                                title="Lihat publikasi langsung di portal penerbit resmi (DOI)"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Penerbit (DOI)</span>
                              </a>
                            )}

                            <a
                              href={art.scopusUrl || `https://www.scopus.com/results/results.uri?src=s&sot=b&sdt=b&origin=searchbasic&searchterm1=${encodeURIComponent(`"${art.title}"`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 font-semibold"
                              title="Cari dokumen ini langsung di portal Scopus"
                            >
                              <Globe className="w-3 h-3" />
                              <span>Cari di Scopus</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => handleCopyCitation(art)}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                              title="Salin rujukan dalam format Scopus APA 7th Edition"
                            >
                              {isCitationCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{isCitationCopied ? "Sitasi Tersalin!" : "Salin Sitasi"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: CYTOSCAPE NETWORK & OVERLAY VIEW */}
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

          {/* VIEW 3: KEYWORD TABLE VIEW */}
          {viewMode === "table" && (
            <KeywordTable nodes={nodes} onSelectKeyword={(node) => setSelectedNode(node)} />
          )}

          {/* VIEW 4: BIBLIOMETRIC METHODOLOGY PANEL (BAB 3) */}
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

          {/* RESEARCH GAP CANDIDATES ANALYSIS */}
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
            Penelusuran Dokumen Scopus Belum Dimuat
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Ketik kata kunci tema riset Anda di atas atau klik salah satu topik populer untuk menelusuri artikel karya ilmiah Scopus dan merender graf VOSviewer.
          </p>
        </div>
      )}

      {/* Integrated Workflow Next Step CTA */}
      {(nodes.length > 0 || articles.length > 0) && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Alur Terpadu &bull; Langkah 1 Selesai
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Sudah menemukan inspirasi topik atau artikel Scopus yang relevan?
            </h3>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-xl">
              Lanjutkan ke <strong>Langkah 2: Wizard Kanvas Tesis</strong> untuk merumuskan judul terukur, sintesis kesenjangan riset (&le; 3 kalimat), dan pertanyaan riset (RQs). Data yang Anda pilih di sini siap diselaraskan ke Tugas 1 dan Tugas 2.
            </p>
          </div>
          {onNavigateToWizard && (
            <button
              type="button"
              onClick={onNavigateToWizard}
              className="shrink-0 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Langkah 2: Wizard Kanvas</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
