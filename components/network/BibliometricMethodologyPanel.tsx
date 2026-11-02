"use client";

import { useState, useMemo } from "react";
import { Canvas, DataNeed } from "@/lib/types/canvas";
import { VosNode, VosEdge } from "@/lib/parsers/vosviewer-parser";
import { DiscoveredArticle } from "@/lib/parsers/openalex-parser";
import { VOS_CLUSTER_COLORS } from "./CytoscapeGraph";
import {
  BookOpen,
  Copy,
  Check,
  FileText,
  Layers,
  ArrowRight,
  Database,
  Search,
  Filter,
  Cpu,
  BarChart3,
  Compass,
  Download,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface BibliometricMethodologyPanelProps {
  canvas: Canvas;
  query: string;
  booleanQuery?: string;
  nodes: VosNode[];
  edges: VosEdge[];
  articles: DiscoveredArticle[];
  minYear: number;
  maxYear: number;
  onChange?: (updater: (prev: Canvas) => Canvas) => void;
}

export function BibliometricMethodologyPanel({
  canvas,
  query,
  booleanQuery,
  nodes,
  edges,
  articles,
  minYear,
  maxYear,
  onChange,
}: BibliometricMethodologyPanelProps) {
  const [activeTab, setActiveTab] = useState<"protocol" | "bab3" | "clusters" | "units">("protocol");
  const [copiedBab3, setCopiedBab3] = useState(false);
  const [appliedToStep4, setAppliedToStep4] = useState(false);

  // Group nodes by cluster
  const clusterMap = useMemo(() => {
    const map = new Map<number, VosNode[]>();
    nodes.forEach((n) => {
      const c = n.cluster || 1;
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(n);
    });
    // Sort clusters by number of keywords descending
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [nodes]);

  // Top core keywords by occurrences
  const topKeywords = useMemo(() => {
    return [...nodes].sort((a, b) => b.occurrences - a.occurrences).slice(0, 10);
  }, [nodes]);

  // Calculate cluster summary stats
  const clusterSummaries = useMemo(() => {
    return clusterMap.map(([clusterId, clusterNodes]) => {
      const sortedByOcc = [...clusterNodes].sort((a, b) => b.occurrences - a.occurrences);
      const top3 = sortedByOcc.slice(0, 3).map((n) => n.label).join(", ");
      const totalOcc = clusterNodes.reduce((acc, curr) => acc + curr.occurrences, 0);
      const yearsWithData = clusterNodes.filter((n) => n.avgPubYear && n.avgPubYear > 0);
      const avgClusterYear = yearsWithData.length > 0
        ? Math.round((yearsWithData.reduce((acc, curr) => acc + (curr.avgPubYear || 0), 0) / yearsWithData.length) * 10) / 10
        : (minYear + maxYear) / 2;

      let status = "Mapan (Established)";
      if (avgClusterYear >= 2023) {
        status = "Mutakhir (Emerging Frontier)";
      } else if (avgClusterYear >= 2021) {
        status = "Berkembang (Developing Core)";
      }

      return {
        clusterId,
        nodeCount: clusterNodes.length,
        topKeywords: top3,
        totalOcc,
        avgYear: avgClusterYear,
        status,
        color: VOS_CLUSTER_COLORS[(clusterId - 1) % VOS_CLUSTER_COLORS.length],
      };
    });
  }, [clusterMap, minYear, maxYear]);

  // Academic narrative text for Bab 3 Metodologi Penelitian (UNY Thesis standard)
  const effectiveBoolean = booleanQuery || query;
  const currentSubject = canvas.title.subject || query;
  const currentIntervention = canvas.title.intervention || "";

  const bab3Narrative = useMemo(() => {
    const clusterDescriptions = clusterSummaries
      .slice(0, 4)
      .map(
        (cs, idx) =>
          `Klaster ${idx + 1} didominasi oleh tema "${cs.topKeywords}" dengan rata-rata tahun publikasi ${cs.avgYear} (status: ${cs.status})`
      )
      .join("; ");

    return `BAB III. METODOLOGI PENELITIAN
Sub-bab 3.X. Metode Analisis Bibliometrik dan Pemetaan Literatur Ilmiah

3.X.1 Rasionalitas dan Pendekatan Metodologis
Untuk memperkuat landasan teoretis, menjamin ketajaman identifikasi state-of-the-art, serta membuktikan kebaruan (novelty) penelitian secara objektif dan kuantitatif, penelitian ini menerapkan metode analisis bibliometrik (Donthu et al., 2021). Analisis bibliometrik digunakan sebagai tahapan preliminary research untuk memetakan struktur intelektual dan lanskap keilmuan pada domain ${currentSubject}${currentIntervention ? ` dengan intervensi ${currentIntervention}` : ""}, sekaligus mendeteksi celah riset (research gap) yang belum terselesaikan pada literatur global bereputasi.

3.X.2 Protokol Penelusuran dan Seleksi Data (PRISMA Statement)
Pengumpulan data bibliografi mengacu pada pedoman standar Preferred Reporting Items for Systematic Reviews and Meta-Analyses (PRISMA 2020) dan protokol penelusuran Scopus/Google Scholar. Data artikel ilmiah diekstraksi dari basis data global peer-reviewed (Scopus, OpenAlex, dan CrossRef) menggunakan formulasi kueri Boolean terstruktur sebagai berikut:
Kueri Boolean: ${effectiveBoolean}

Kriteria inklusi mencakup: (a) artikel berkala ilmiah terindeks global dan prosiding konferensi internasional peer-reviewed; (b) dokumen terbitan rentang tahun ${minYear} hingga ${maxYear}; dan (c) dokumen yang memuat kata kunci terstandar dengan frekuensi kemunculan minimum (threshold) ≥ 2 kali. Kriteria eksklusi meliputi dokumen editorial, tinjauan buku non-peer reviewed, serta duplikasi metadata. Melalui protokol seleksi ini, diperoleh sebanyak ${articles.length} artikel ilmiah relevan dengan total ${nodes.length} kata kunci terstandar dan ${edges.length} relasi tautan ko-kejadian.

3.X.3 Unit Analisis dan Normalisasi Asosiasi
Unit analisis yang digunakan adalah ko-kejadian kata kunci (co-word analysis / keyword co-occurrence) yang mengukur kekuatan asosiasi antar konsep ilmiah berdasarkan frekuensi kemunculan bersama dalam satu publikasi. Normalisasi kekuatan hubungan antar kata kunci dihitung menggunakan metode Association Strength Normalization (Van Eck & Waltman, 2010) dengan formula:
S_ij = c_ij / (2 * m * s_i * s_j)
di mana S_ij melambangkan kekuatan asosiasi antara kata kunci i dan j, c_ij adalah frekuensi ko-kejadian keduanya, s_i dan s_j adalah total kemunculan masing-masing kata kunci, serta m merepresentasikan total seluruh relasi jejaring.

3.X.4 Deteksi Komunitas Tematik dan Sintesis Celah Riset
Pengelompokan kata kunci ke dalam klaster tematik dilakukan secara otomatis menggunakan algoritma optimasi modularitas Louvain (Louvain Community Detection Algorithm). Melalui algoritma ini, teridentifikasi ${clusterSummaries.length} klaster tematik utama pada topik penelitian: ${clusterDescriptions}.

Visualisasi jejaring bibliometrik dianalisis melalui dua tampilan utama perangkat VOSviewer:
1. Network Visualization (Visualisasi Jaringan): Menggambarkan klaster tematik berdasarkan partisi komunitas Louvain, di mana ukuran node mencerminkan bobot kemunculan (occurrences) dan ketebalan garis mencerminkan kekuatan tautan (link strength).
2. Overlay Visualization (Visualisasi Hamparan Waktu): Menggambarkan evolusi kronologis penelitian berdasarkan rata-rata tahun terbit (average publication year), membedakan topik fondasi klasik (≤ 2020) dari topik mutakhir/frontier (2024–${maxYear}).

Berdasarkan pemetaan ini, posisi kebaruan (novelty) penelitian ini difokuskan pada pengisian celah keterhubungan antar-klaster yang masih minim relasi empiris, guna menghasilkan kontribusi rekayasa yang teruji dan orisinal.

Referensi Metodologi:
1. Donthu, N., Kumar, S., Mukherjee, D., Pandey, N., & Lim, W. M. (2021). How to conduct a bibliometric analysis: An overview and guidelines. Journal of Business Research, 133, 285-296.
2. Page, M. J., et al. (2021). The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ, 372, n71.
3. Van Eck, N. J., & Waltman, L. (2010). Software survey: VOSviewer, a computer program for bibliometric mapping. Scientometrics, 84(2), 523-538.`;
  }, [
    effectiveBoolean,
    currentSubject,
    currentIntervention,
    minYear,
    maxYear,
    articles.length,
    nodes.length,
    edges.length,
    clusterSummaries,
  ]);

  const handleCopyBab3 = async () => {
    try {
      await navigator.clipboard.writeText(bab3Narrative);
      setCopiedBab3(true);
      setTimeout(() => setCopiedBab3(false), 3000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = bab3Narrative;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedBab3(true);
      setTimeout(() => setCopiedBab3(false), 3000);
    }
  };

  const handleApplyToStep4 = () => {
    if (!onChange) return;

    onChange((prev) => {
      // Create new secondary data item for bibliometric data
      const biblioData: DataNeed = {
        id: crypto.randomUUID(),
        name: `Dataset Metadata Bibliometrik Scopus & OpenAlex (${query})`,
        kind: "secondary",
        source: "Basis Data Scopus, OpenAlex, dan CrossRef via API Metopen UNY",
        availability: "available",
        accessEvidence: "Akses terbuka dan terintegrasi via API Akademik",
        estimatedSize: `${articles.length} artikel ilmiah peer-reviewed (${nodes.length} kata kunci)`,
        timeEstimateWeeks: 2,
        risk: "Perubahan struktur indeks jurnal internasional",
        mitigation: "Penyaringan multi-database (Scopus, CrossRef, Europe PMC)",
      };

      // Add standard tools & software
      const currentTools = prev.method.tools || [];
      const newTools = Array.from(
        new Set([
          ...currentTools,
          "VOSviewer 1.6.20 (Visualisasi Jejaring Bibliometrik)",
          "Graphology Louvain Clustering Engine",
        ])
      );

      // Add standard bibliometric guidelines
      const currentStandards = prev.method.standards || [];
      const newStandards = Array.from(
        new Set([
          ...currentStandards,
          "PRISMA 2020 Statement (Pedoman Pelaporan Tinjauan Sistematis)",
          "Standar Analisis Bibliometrik Donthu et al. (2021)",
          "Van Eck & Waltman (2010) - Algoritma VOS Normalization",
        ])
      );

      // Description
      const biblioSummary = `Analisis bibliometrik preliminary menggunakan kueri Boolean "${effectiveBoolean}" pada basis data Scopus dan OpenAlex (${articles.length} artikel, rentang ${minYear}-${maxYear}) dengan pemetaan ko-kejadian kata kunci VOSviewer dan deteksi klaster Louvain.`;
      const currentDesc = prev.method.description || "";
      const updatedDesc = currentDesc.includes("bibliometrik")
        ? currentDesc
        : currentDesc
        ? `${biblioSummary}\n\nPengujian Lanjutan: ${currentDesc}`
        : biblioSummary;

      // Retain or set approach
      const targetApproach =
        prev.method.approach === "experimental_lab" ||
        prev.method.approach === "field_study" ||
        prev.method.approach === "numerical_fem" ||
        prev.method.approach === "mixed"
          ? prev.method.approach
          : "bibliometric_slr";

      // Also register into literatureMap metadata
      const existingDataNeeds = prev.method.dataNeeds || [];
      const hasAlready = existingDataNeeds.some((d) => d.name.toLowerCase().includes("bibliometrik"));
      const updatedDataNeeds = hasAlready ? existingDataNeeds : [biblioData, ...existingDataNeeds];

      return {
        ...prev,
        method: {
          ...prev.method,
          approach: targetApproach,
          description: updatedDesc,
          tools: newTools,
          standards: newStandards,
          dataNeeds: updatedDataNeeds,
        },
        literatureMap: {
          ...prev.literatureMap,
          sourceType: prev.literatureMap?.sourceType || "scopus_csv",
          nodeCount: nodes.length,
          edgeCount: edges.length,
          searchQuery: query,
          booleanQuery: effectiveBoolean,
          minYear,
          maxYear,
          pinnedFindings: prev.literatureMap?.pinnedFindings || [],
        },
      };
    });

    setAppliedToStep4(true);
    setTimeout(() => setAppliedToStep4(false), 3500);
  };

  const handleDownloadProtocol = () => {
    const textContent = `${bab3Narrative}

=======================================================
TABEL PROTOKOL PENELUSURAN BIBLIOMETRIK (PRISMA 2020)
=======================================================
1. Topik Penelitian : ${query}
2. Kueri Boolean    : ${effectiveBoolean}
3. Basis Data       : Scopus, OpenAlex, CrossRef, Europe PMC, Google Scholar
4. Kriteria Inklusi : Artikel berkala ilmiah & prosiding peer-reviewed, tahun ${minYear}-${maxYear}
5. Kriteria Eksklusi: Non-peer review, dokumen editorial, duplikat
6. Threshold        : Frekuensi kemunculan kata kunci >= 2 kali
7. Unit Analisis    : Co-occurrence of Author Keywords & Concepts
8. Normalisasi      : Association Strength Normalization (Van Eck & Waltman, 2010)
9. Algoritma Klaster: Louvain Community Detection (Modularity Optimization)
10. Engine Layout   : VOSviewer Visual Standard Layout

Statistik Ekstraksi:
- Total Artikel Ilmiah  : ${articles.length} dokumen
- Total Kata Kunci Unik : ${nodes.length} term
- Total Relasi / Edges  : ${edges.length} link
- Rentang Tahun         : ${minYear} - ${maxYear}
- Klaster Teridentifikasi: ${clusterSummaries.length} klaster

Klaster Tematik:
${clusterSummaries.map((cs) => `- Klaster ${cs.clusterId}: ${cs.nodeCount} kata kunci | Tema: ${cs.topKeywords} | Rata-rata Tahun: ${cs.avgYear} (${cs.status})`).join("\n")}
`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Protokol-Metode-Bibliometrik-${query.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Metodologi Penelitian Akademis (Standar UNY & Scopus)
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Metode Analisis Bibliometrik (Bab 3 Proposal Tesis)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi protokol penelitian, formalisasi kueri Boolean, dan draf narasi Bab 3 yang siap disalin ke proposal tesis Anda.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyBab3}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Salin draf Bab 3 lengkap ke clipboard"
          >
            {copiedBab3 ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Draf Bab 3</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleApplyToStep4}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Sematkan metodologi bibliometrik dan kebutuhan data ke Langkah 4 Kanvas Tesis"
          >
            {appliedToStep4 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Tersimpan di Langkah 4!</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Sematkan ke Langkah 4 Kanvas</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadProtocol}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            title="Unduh berkas protokol bibliometrik (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Protokol (.txt)</span>
          </button>
        </div>
      </div>

      {appliedToStep4 && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Berhasil!</strong> Metodologi bibliometrik telah otomatis dimasukkan ke Langkah 4 (Metode Inti &amp; Kebutuhan Data). Anda dapat melihat rincian alat uji VOSviewer dan kebutuhan data sekunder di tab Langkah 4.
          </span>
        </div>
      )}

      {/* Internal Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("protocol")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "protocol"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>1. Tabel Protokol Riset (PRISMA)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bab3")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "bab3"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>2. Draf Narasi Bab 3 (Siap Salin)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("clusters")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "clusters"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. Klaster Tematik &amp; Metrik ({clusterSummaries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("units")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "units"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>4. Panduan 3 Metode Bibliometrik</span>
        </button>
      </div>

      {/* TAB 1: PROTOKOL STANDAR PRISMA & SCOPUS */}
      {activeTab === "protocol" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Artikel Ilmiah</span>
              <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{articles.length}</p>
              <span className="text-[10px] text-slate-500">Peer-reviewed terindeks</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kata Kunci Unik</span>
              <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{nodes.length}</p>
              <span className="text-[10px] text-slate-500">Ambang batas kemunculan ≥ 2x</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tautan Relasi (Edges)</span>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{edges.length}</p>
              <span className="text-[10px] text-slate-500">Kekuatan ko-kejadian terukur</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Klaster Tematik</span>
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{clusterSummaries.length}</p>
              <span className="text-[10px] text-slate-500">Partisi komunitas Louvain</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-1/4">Elemen Protokol</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700">Spesifikasi Akademis</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-1/4">Kaidah Rujukan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    Basis Data Sumber
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    Scopus, OpenAlex, CrossRef, Europe PMC, Google Scholar
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Indeksasi Internasional Bereputasi</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-600" />
                    Kueri Boolean Aktif
                  </td>
                  <td className="p-3">
                    <code className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md font-mono text-[11px] block break-all">
                      {effectiveBoolean}
                    </code>
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Logika Boolean Standar Scopus (AND, OR, &quot;...&quot;)</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-emerald-600" />
                    Kriteria Inklusi
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    Artikel jurnal berkala ilmiah dan konferensi internasional peer-reviewed; rentang tahun {minYear}–{maxYear}; bahasa Inggris dan Indonesia; memuat kata kunci teridentifikasi.
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">PRISMA 2020 Statement</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-rose-600" />
                    Kriteria Eksklusi
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    Dokumen editorial, tinjauan buku non-peer review, dokumen tanpa abstrak, artikel dengan duplikasi metadata.
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Prosedur Pembersihan Data (Donthu et al., 2021)</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                    Unit Analisis
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    Ko-kejadian kata kunci (Keyword Co-occurrence / Co-word Analysis) dan analisis hamparan evolusi waktu (Temporal Overlay).
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Struktur Konseptual dan Celah Riset</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                    Metode Normalisasi
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    Association Strength Normalization: <code className="font-mono text-[11px]">S_ij = c_ij / (2 * m * s_i * s_j)</code>
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Van Eck &amp; Waltman (2010, CWTS Leiden)</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Algoritma Klastering
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    Optimasi Modularitas Louvain (Louvain Community Detection Algorithm) dengan resolusi partisi modularitas standar.
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Blondel et al. (2008)</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-teal-600" />
                    Mesin Visualisasi
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    VOSviewer Visual Standard Layout Engine &amp; Cytoscape.js Network Renderer
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Standar Pemetaan VOSviewer Internasional</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DRAF NARASI BAB 3 METODOLOGI (SIAP SALIN KE MS WORD) */}
      {activeTab === "bab3" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              Teks di bawah ini telah disesuaikan dengan pedoman penulisan tesis Pascasarjana UNY (struktur sub-bab, istilah baku, dan sitasi standar).
            </span>
            <button
              type="button"
              onClick={handleCopyBab3}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              {copiedBab3 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBab3 ? "Tersalin!" : "Salin Teks"}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="p-5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto border border-slate-800 selection:bg-blue-500 selection:text-white">
              {bab3Narrative}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: KLASTER TEMATIK & METRIK JARINGAN */}
      {activeTab === "clusters" && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Berikut adalah rincian klaster tematik yang terdeteksi secara otomatis melalui partisi modularitas Louvain. Warna klaster identik dengan pewarnaan pada peta VOSviewer.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clusterSummaries.map((cs) => (
              <div
                key={cs.clusterId}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-slate-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: cs.color }}
                    />
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Klaster {cs.clusterId} ({cs.nodeCount} Kata Kunci)
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      cs.status.includes("Mutakhir")
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : cs.status.includes("Berkembang")
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {cs.status}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    <strong>Kata Kunci Dominan:</strong> {cs.topKeywords}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Total Kemunculan: <strong>{cs.totalOcc}x</strong></span>
                    <span>Rata-rata Tahun Terbit: <strong>{cs.avgYear}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Keywords Table */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              10 Kata Kunci Inti (Core Nodes) dengan Bobot Kemunculan Tertinggi:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {topKeywords.map((k) => (
                <span
                  key={k.id}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                >
                  {k.label} &bull; <strong className="text-blue-600 dark:text-blue-400">{k.occurrences}x</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PANDUAN 3 METODE BIBLIOMETRIK */}
      {activeTab === "units" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Kapan Menggunakan Analisis Bibliometrik pada Tesis Pascasarjana?</strong>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                Pada program magister (S2) seperti di UNY, dosen pembimbing mewajibkan pembuktian bahwa topik tesis Anda memiliki <em>novelty</em> yang kuat dan bukan sekadar replikasi lokasi. Analisis bibliometrik menjadi instrumen ilmiah paling kredibel untuk menyajikan peta topik dan membuktikan celah penelitian (*research gap*) secara kuantitatif.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h4 className="font-extrabold text-xs text-blue-900 dark:text-blue-200">
                  Ko-kejadian Kata Kunci (Co-occurrence)
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Mengukur kemunculan kata kunci yang bersamaan di dalam satu publikasi ilmiah. Semakin sering muncul bersama, semakin kuat kedekatan konseptualnya.
              </p>
              <div className="text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-blue-700 dark:text-blue-300">Tujuan di Tesis:</strong>
                <p className="text-slate-500 mt-0.5">Mendeteksi sub-topik yang sudah jenuh diteliti vs topik yang jarang dihubungkan (menjadi <strong>Research Gap</strong>).</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">
                  Evolusi Temporal (Thematic Overlay)
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Mengaitkan setiap kata kunci dengan rata-rata tahun terbitnya menggunakan gradien warna VOSviewer (biru tua &rarr; hijau &rarr; kuning keemasan).
              </p>
              <div className="text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-emerald-700 dark:text-emerald-300">Tujuan di Tesis:</strong>
                <p className="text-slate-500 mt-0.5">Memastikan riset Anda menargetkan isu terkini (2024–{maxYear}) dan menghindari topik usang yang sudah ditinggalkan.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h4 className="font-extrabold text-xs text-purple-900 dark:text-purple-200">
                  Kolaborasi Penulis (Co-authorship)
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Menganalisis kolaborasi antar-peneliti utama, universitas, dan negara asal dalam menghasilkan karya ilmiah pada tema penelitian tersebut.
              </p>
              <div className="text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-purple-700 dark:text-purple-300">Tujuan di Tesis:</strong>
                <p className="text-slate-500 mt-0.5">Mengidentifikasi siapa pakar terdepan dan institusi rujukan utama yang wajib dikutip di Bab 2 Tinjauan Pustaka.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
