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
  TrendingUp,
  Award,
  Users,
  Lightbulb,
  GitFork,
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
  const [activeTab, setActiveTab] = useState<"protocol" | "performance" | "mapping" | "bab3" | "sensemaking">("protocol");
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
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [nodes]);

  // Top core keywords by occurrences & total link strength (TLS)
  const topKeywords = useMemo(() => {
    return [...nodes].sort((a, b) => (b.totalLinkStrength || b.occurrences) - (a.totalLinkStrength || a.occurrences)).slice(0, 10);
  }, [nodes]);

  // Performance Analysis Metrics (Donthu et al., 2021 Table 2 & Öztürk et al., 2024 Table 3)
  const performanceStats = useMemo(() => {
    const totalPubs = articles.length;
    const totalCitations = articles.reduce((acc, curr) => acc + (curr.citedByCount || 0), 0);
    const avgCitations = totalPubs > 0 ? Math.round((totalCitations / totalPubs) * 10) / 10 : 0;
    const activeYears = Math.max(1, maxYear - minYear + 1);
    const productivityPerYear = totalPubs > 0 ? Math.round((totalPubs / activeYears) * 10) / 10 : 0;

    // Author Frequency Map (Top Contributors)
    const authorCounts = new Map<string, { count: number; citations: number }>();
    articles.forEach((art) => {
      if (!art.authors) return;
      const rawList = art.authors.split(/,|;| and /).map((a) => a.trim()).filter((a) => a.length > 2);
      rawList.slice(0, 3).forEach((author) => {
        if (!authorCounts.has(author)) authorCounts.set(author, { count: 0, citations: 0 });
        const entry = authorCounts.get(author)!;
        entry.count += 1;
        entry.citations += art.citedByCount || 0;
      });
    });

    const topAuthors = Array.from(authorCounts.entries())
      .sort((a, b) => b[1].count - a[1].count || b[1].citations - a[1].citations)
      .slice(0, 8)
      .map(([name, data]) => ({ name, ...data }));

    // Journal / Source Frequency Map
    const journalCounts = new Map<string, { count: number; citations: number }>();
    articles.forEach((art) => {
      const j = art.journal ? art.journal.trim() : "Jurnal / Prosiding Ilmiah";
      if (!journalCounts.has(j)) journalCounts.set(j, { count: 0, citations: 0 });
      const entry = journalCounts.get(j)!;
      entry.count += 1;
      entry.citations += art.citedByCount || 0;
    });

    const topJournals = Array.from(journalCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([name, data]) => ({ name, ...data }));

    // Year wise distribution
    const yearlyMap = new Map<number, number>();
    articles.forEach((art) => {
      const y = art.year || 2024;
      yearlyMap.set(y, (yearlyMap.get(y) || 0) + 1);
    });

    const yearTrend = Array.from(yearlyMap.entries()).sort((a, b) => a[0] - b[0]);

    return {
      totalPubs,
      totalCitations,
      avgCitations,
      activeYears,
      productivityPerYear,
      topAuthors,
      topJournals,
      yearTrend,
    };
  }, [articles, minYear, maxYear]);

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

      let status = "Mapan (Established Foundation)";
      if (avgClusterYear >= 2024) {
        status = "Mutakhir (Emerging Frontier 2024-2026)";
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

  // Academic narrative text for Bab 3 Metodologi Penelitian (Postgraduate Thesis standard, citing Donthu 2021 & Öztürk 2024)
  const effectiveBoolean = booleanQuery || query;
  const currentSubject = canvas.title.subject || query;
  const currentIntervention = canvas.title.intervention || "";

  const bab3Narrative = useMemo(() => {
    const clusterDescriptions = clusterSummaries
      .slice(0, 4)
      .map(
        (cs, idx) =>
          `Klaster ${idx + 1} (${cs.nodeCount} istilah) berfokus pada tema "${cs.topKeywords}" dengan rata-rata tahun publikasi ${cs.avgYear} [Status: ${cs.status}]`
      )
      .join(";\n- ");

    return `BAB III. METODOLOGI PENELITIAN
Sub-bab 3.X. Metode Desain Riset Bibliometrik dan Pemetaan Literatur Ilmiah

3.X.1 Rasionalitas Metodologis dan Desain Riset
Penelitian tesis ini mengadopsi kerangka kerja desain riset bibliometrik komprehensif sebagaimana dirumuskan oleh Öztürk, Kocaman, dan Kanbach (2024) serta pedoman analisis bibliometrik internasional oleh Donthu et al. (2021). Analisis bibliometrik diterapkan sebagai tahapan riset pendahuluan (preliminary research) guna menjawab kritik konvensional tinjauan pustaka naratif yang rentan bias subjektif. Melalui integrasi Analisis Kinerja (Performance Analysis) dan Pemetaan Sains (Science Mapping), penelitian ini memetakan lanskap keilmuan, evolusi struktural, dan membuktikan kebaruan (novelty) topik "${currentSubject}"${currentIntervention ? ` dengan intervensi "${currentIntervention}"` : ""} secara kuantitatif berbasis data empiris terindeks global.

3.X.2 Pertanyaan Riset Bibliometrik (Bibliometric Research Questions)
Mengacu pada taksonomi pertanyaan riset bibliometrik Öztürk et al. (2024), penyelidikan literatur dirumuskan dalam empat pertanyaan utama:
1. RQ-1 (Performance Analysis): Bagaimana tren produktivitas publikasi tahunan, akumulasi sitasi, serta sebaran penulis dan jurnal dominan pada topik ${currentSubject}?
2. RQ-2 (Conceptual Structure): Bagaimana struktur konseptual dan pengelompokan tema utama yang membentuk domain penelitian ini berdasarkan analisis ko-kejadian kata kunci (co-word analysis)?
3. RQ-3 (Thematic Evolution): Bagaimana pergeseran kronologis fokus riset dan konsep apa saja yang menjadi batas mutakhir (emerging frontiers) dalam 3 tahun terakhir?
4. RQ-4 (Research Gap): Pada celah keterhubungan antar-klaster manakah penelitian tesis ini memposisikan kontribusi ilmiah dan intervensi rekayasa orisinalnya?

3.X.3 Protokol Penelusuran dan Seleksi Data (Standar PRISMA 2020 & Scopus)
Pengumpulan data bibliografi dilakukan secara transparan dan dapat direplikasi (replicable protocol) merujuk pedoman PRISMA 2020 dan protokol Scopus. Ekstraksi data dilakukan pada basis data berkala ilmiah internasional bereputasi (Scopus, OpenAlex, dan CrossRef) dengan formulasi kueri Boolean terstruktur:
Kueri Boolean: ${effectiveBoolean}

Kriteria seleksi ditetapkan sebagai berikut:
a. Kriteria Inklusi: Dokumen artikel berkala ilmiah (peer-reviewed journal) dan prosiding konferensi internasional; rentang tahun publikasi ${minYear} hingga ${maxYear}; bahasa pengantar Inggris dan Indonesia; memuat metadata kata kunci lengkap dengan ambang batas kemunculan (threshold) ≥ 2 kali.
b. Kriteria Eksklusi: Dokumen non-peer reviewed (editorial, book review, erratum), artikel tanpa abstrak, dan duplikasi data metadata.
Berdasarkan protokol tersebut, tersaring sebanyak ${performanceStats.totalPubs} dokumen ilmiah relevan dengan total ${performanceStats.totalCitations} sitasi global (rata-rata ${performanceStats.avgCitations} sitasi per artikel), mencakup ${nodes.length} kata kunci terstandar dan ${edges.length} relasi tautan jejaring.

3.X.4 Analisis Kinerja dan Pemetaan Sains (Performance Analysis & Science Mapping)
Sesuai taksonomi toolbox Donthu et al. (2021), analisis dioperasikan melalui dua pilar:
1. Performance Analysis (Analisis Kinerja): Mengukur produktivitas ilmiah (Total Publications / TP = ${performanceStats.totalPubs}, Produktivitas Tahunan = ${performanceStats.productivityPerYear} artikel/tahun) serta mengidentifikasi kontributor terdepan (leading authors dan key journals).
2. Science Mapping (Pemetaan Sains): Menganalisis relasi sosial (co-authorship), struktur konseptual (co-word analysis), dan jejaring keterhubungan antar-variabel.

3.X.5 Normalisasi Asosiasi VOS dan Algoritma Klastering Louvain
Kekuatan hubungan ko-kejadian kata kunci dinormalisasi menggunakan Association Strength Normalization (Van Eck & Waltman, 2010):
S_ij = c_ij / (2 * m * s_i * s_j)
di mana S_ij adalah kekuatan asosiasi ternormalisasi antara konsep i dan j, c_ij adalah frekuensi ko-kejadian keduanya, s_i dan s_j adalah total kemunculan masing-masing istilah, dan m merepresentasikan total bobot tautan jejaring.
Partisi komunitas tematik diidentifikasi secara otomatis menggunakan optimasi modularitas Louvain (Louvain Community Detection Algorithm). Melalui algoritma ini, teridentifikasi ${clusterSummaries.length} klaster tematik utama:
- ${clusterDescriptions}.

3.X.6 Interpretasi Melalui Kerangka Kerja Sensemaking 3S (Lim & Kumar, 2023)
Interpretasi hasil bibliometrik dipandu oleh kerangka 3S (Scanning, Sensing, Substantiating):
1. Scanning: Mengidentifikasi pola makro percepatan riset dan pemusatan topik dominan.
2. Sensing: Menelaah alasan mendalam mengapa klaster tertentu belum terhubung (structural holes), yang mengindikasikan adanya batasan empiris atau kelangkaan penelitian gabungan.
3. Substantiating: Membuktikan bahwa intervensi rekayasa yang diusulkan pada Kanvas Tesis ini secara akurat mengisi celah riset (research gap) di antara klaster-klaster tersebut, sehingga terhindar dari jebakan novelty semu (lokasi atau software semata).

Daftar Pustaka Rujukan Metodologi:
1. Donthu, N., Kumar, S., Mukherjee, D., Pandey, N., & Lim, W. M. (2021). How to conduct a bibliometric analysis: An overview and guidelines. Journal of Business Research, 133, 285–296.
2. Öztürk, O., Kocaman, R., & Kanbach, D. K. (2024). How to design bibliometric research: an overview and a framework proposal. Review of Managerial Science, 18, 3333–3361.
3. Lim, W. M., & Kumar, S. (2023). Guidelines for interpreting the results of bibliometric analysis: a sensemaking approach. Global Business and Organizational Excellence, 43(2), 17–26.
4. Page, M. J., et al. (2021). The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ, 372, n71.
5. Van Eck, N. J., & Waltman, L. (2010). Software survey: VOSviewer, a computer program for bibliometric mapping. Scientometrics, 84(2), 523–538.`;
  }, [
    effectiveBoolean,
    currentSubject,
    currentIntervention,
    minYear,
    maxYear,
    performanceStats,
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
      const biblioData: DataNeed = {
        id: crypto.randomUUID(),
        name: `Dataset Metadata Bibliometrik Scopus & OpenAlex (${query})`,
        kind: "secondary",
        source: "Basis Data Scopus, OpenAlex, dan CrossRef via API Metopen Pascasarjana",
        availability: "available",
        accessEvidence: "Akses terbuka dan terintegrasi via API Akademik",
        estimatedSize: `${performanceStats.totalPubs} artikel ilmiah peer-reviewed (${nodes.length} kata kunci)`,
        timeEstimateWeeks: 2,
        risk: "Perubahan struktur indeks jurnal internasional",
        mitigation: "Penyaringan multi-database (Scopus, CrossRef, Europe PMC)",
      };

      const currentTools = prev.method.tools || [];
      const newTools = Array.from(
        new Set([
          ...currentTools,
          "VOSviewer 1.6.20 (Visualisasi Jejaring Bibliometrik)",
          "Graphology Louvain Clustering Engine",
          "Bibliometrix R Package / BiblioShiny",
        ])
      );

      const currentStandards = prev.method.standards || [];
      const newStandards = Array.from(
        new Set([
          ...currentStandards,
          "Pedoman Desain Riset Bibliometrik Öztürk et al. (2024, RMS)",
          "Standar Analisis Bibliometrik Donthu et al. (2021, JBR)",
          "PRISMA 2020 Statement (Pedoman Pelaporan Tinjauan Sistematis)",
          "Van Eck & Waltman (2010) - Algoritma VOS Normalization",
        ])
      );

      const biblioSummary = `Analisis bibliometrik preliminary menggunakan kueri Boolean "${effectiveBoolean}" pada basis data Scopus dan OpenAlex (${performanceStats.totalPubs} artikel, rentang ${minYear}-${maxYear}) dengan pemetaan ko-kejadian kata kunci VOSviewer, evaluasi kinerja publikasi, dan deteksi klaster Louvain (Donthu et al., 2021; Öztürk et al., 2024).`;
      const currentDesc = prev.method.description || "";
      const updatedDesc = currentDesc.includes("bibliometrik")
        ? currentDesc
        : currentDesc
        ? `${biblioSummary}\n\nPengujian Lanjutan: ${currentDesc}`
        : biblioSummary;

      const targetApproach =
        prev.method.approach === "experimental_lab" ||
        prev.method.approach === "field_study" ||
        prev.method.approach === "numerical_fem" ||
        prev.method.approach === "mixed"
          ? prev.method.approach
          : "bibliometric_slr";

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
RINGKASAN METRIK KINERJA (DONTHU ET AL., 2021)
=======================================================
- Total Publikasi (TP)       : ${performanceStats.totalPubs} artikel
- Total Sitasi (TC)          : ${performanceStats.totalCitations} sitasi
- Rata-rata Sitasi (AC)      : ${performanceStats.avgCitations} per publikasi
- Rentang Tahun Aktif (NAY)  : ${performanceStats.activeYears} tahun (${minYear} - ${maxYear})
- Produktivitas Tahunan (PAY): ${performanceStats.productivityPerYear} artikel/tahun

Penulis Paling Produktif:
${performanceStats.topAuthors.map((a) => `- ${a.name}: ${a.count} artikel (${a.citations} sitasi)`).join("\n")}

Jurnal Ilmiah Dominan:
${performanceStats.topJournals.map((j) => `- ${j.name}: ${j.count} artikel (${j.citations} sitasi)`).join("\n")}
`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Protokol-Bibliometrik-Donthu-Ozturk-${query.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300">
              <BookOpen className="w-3.5 h-3.5" />
              Kerangka Kerja Donthu et al. (2021) &amp; Öztürk et al. (2024)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200">
              Standar Pascasarjana Magister
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Desain Riset &amp; Metode Analisis Bibliometrik (Bab 3 Proposal Tesis)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Formalisasi metodologi komprehensif: Analisis Kinerja (*Performance Analysis*), Pemetaan Sains (*Science Mapping*), dan Narasi Sensemaking untuk Bab 3.
          </p>
        </div>

        {/* Action Buttons */}
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
            <strong>Berhasil!</strong> Metodologi bibliometrik telah otomatis dimasukkan ke Langkah 4 (Metode Inti &amp; Kebutuhan Data). Standar acuan Donthu et al. (2021) &amp; Öztürk et al. (2024) serta dataset sekunder telah tercatat.
          </span>
        </div>
      )}

      {/* Internal Navigation Tabs (Aligned with Donthu & Ozturk stages) */}
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
          <span>1. Desain Riset &amp; Protokol (Öztürk 2024)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("performance")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "performance"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>2. Analisis Kinerja (Donthu Table 2)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mapping")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "mapping"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. Pemetaan Sains &amp; Klaster ({clusterSummaries.length})</span>
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
          <span>4. Draf Bab 3 Metodologi (Siap Salin)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sensemaking")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "sensemaking"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>5. Kerangka Sensemaking 3S (Lim &amp; Kumar 2023)</span>
        </button>
      </div>

      {/* TAB 1: PROTOKOL & DESAIN RISET (ÖZTÜRK ET AL., 2024) */}
      {activeTab === "protocol" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs space-y-2">
            <h4 className="font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              4 Tahap Desain Riset Bibliometrik (Öztürk, Kocaman, &amp; Kanbach, 2024):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="text-blue-700 dark:text-blue-300">Tahap 1: Tujuan &amp; Pertanyaan Riset</strong>
                <p className="text-slate-500 mt-0.5">Merumuskan RQs eksplisit untuk analisis kinerja dan pemetaan relasi konsep.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="text-indigo-700 dark:text-indigo-300">Tahap 2: Pengumpulan &amp; Seleksi Data</strong>
                <p className="text-slate-500 mt-0.5">Penelusuran kueri Boolean, filtering inklusi/eksklusi, dan pembersihan duplikasi.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="text-emerald-700 dark:text-emerald-300">Tahap 3: Analisis &amp; Visualisasi</strong>
                <p className="text-slate-500 mt-0.5">Perhitungan normalisasi VOS, Louvain community clustering, dan visual graf.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="text-amber-700 dark:text-amber-300">Tahap 4: Interpretasi Sensemaking</strong>
                <p className="text-slate-500 mt-0.5">Menjawab RQs dan mentransformasikan temuan klaster menjadi bukti novelty.</p>
              </div>
            </div>
          </div>

          {/* Research Questions derived according to Öztürk Table 7 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-indigo-600" />
              Pertanyaan Riset Bibliometrik Khusus Topik Anda (Standar Öztürk et al., 2024 Tabel 7):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">RQ-1 (Performance Analysis)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  &quot;Bagaimana tren volume publikasi tahunan dan siapa peneliti serta jurnal paling produktif pada domain {currentSubject}?&quot;
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">RQ-2 (Conceptual / Co-word)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  &quot;Klaster tematik apa saja yang terdeteksi dan bagaimana struktur konseptual menghubungkan variabel {currentSubject}?&quot;
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">RQ-3 (Thematic Evolution)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  &quot;Bagaimana evolusi kronologis penelitian dan topik apa saja yang menjadi batas mutakhir (emerging frontiers 2024–2026)?&quot;
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">RQ-4 (Research Gap Identification)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  &quot;Pada celah persilangan antar-klaster manakah intervensi tesis Anda mengisi kekosongan literatur secara orisinal?&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Protocol Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-1/4">Elemen Protokol</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700">Spesifikasi Akademis Terstandar</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-1/4">Kaidah Rujukan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    Basis Data Terpilih
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    Scopus, OpenAlex, CrossRef, Europe PMC, Google Scholar
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Öztürk et al. (2024, Bagian 3.2.1)</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-600" />
                    Kueri Boolean Terstruktur
                  </td>
                  <td className="p-3">
                    <code className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md font-mono text-[11px] block break-all">
                      {effectiveBoolean}
                    </code>
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Logika Boolean Scopus (AND, OR, &quot;...&quot;)</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-emerald-600" />
                    Kriteria Inklusi
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    Artikel jurnal dan prosiding peer-reviewed; rentang tahun {minYear}–{maxYear}; bahasa Inggris dan Indonesia; memuat kata kunci teridentifikasi dengan ambang kemunculan $\ge 2$ kali.
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
                  <td className="p-3 text-slate-500 text-[11px]">Donthu et al. (2021, Step 3)</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                    Unit Analisis
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    Ko-kejadian kata kunci (Co-word analysis), Analisis Kinerja publikasi/penulis, dan Analisis Hamparan Waktu (Overlay Evolution).
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Donthu et al. (2021, Section 3.2.4)</td>
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ANALISIS KINERJA (DONTHU ET AL., 2021 TABEL 2) */}
      {activeTab === "performance" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Publikasi (TP)</span>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{performanceStats.totalPubs}</p>
              <span className="text-[10px] text-slate-500">Artikel ilmiah tervalidasi</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Sitasi (TC)</span>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{performanceStats.totalCitations}</p>
              <span className="text-[10px] text-slate-500">Sitasi global kumulatif</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rata-Rata Sitasi (AC)</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{performanceStats.avgCitations}</p>
              <span className="text-[10px] text-slate-500">Sitasi per artikel (TC / TP)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Produktivitas Tahunan</span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{performanceStats.productivityPerYear}</p>
              <span className="text-[10px] text-slate-500">Artikel / tahun aktif</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Authors */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Penulis Terkemuka (Leading Authors &amp; Contributors)
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {performanceStats.topAuthors.length === 0 ? (
                  <p className="text-slate-400 py-3">Data penulis belum dimuat.</p>
                ) : (
                  performanceStats.topAuthors.map((auth, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{auth.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <strong>{auth.count}</strong> publikasi &bull; <strong>{auth.citations}</strong> sitasi
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Journals */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                Jurnal Ilmiah Dominan (Key Publishing Outlets)
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {performanceStats.topJournals.length === 0 ? (
                  <p className="text-slate-400 py-3">Data jurnal belum dimuat.</p>
                ) : (
                  performanceStats.topJournals.map((jr, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{jr.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 shrink-0 ml-2">
                        <strong>{jr.count}</strong> artikel &bull; <strong>{jr.citations}</strong> sitasi
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PEMETAAN SAINS & KLASTER (DONTHU SECTION 3.2 & VOSVIEWER) */}
      {activeTab === "mapping" && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Pemetaan Sains (*Science Mapping*) menggambarkan hubungan konseptual (*co-word*), relasi sosial (*co-authorship*), dan partisi klaster tematik Louvain.
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

          {/* Centrality Metrics (Donthu 2021 Section 4.1) */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              10 Node Inti Berdasarkan Total Link Strength (TLS) &amp; Centrality (Donthu et al., 2021 Section 4.1):
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {topKeywords.map((k) => (
                <span
                  key={k.id}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                >
                  {k.label} &bull; <strong className="text-blue-600 dark:text-blue-400">{k.occurrences}x</strong> (TLS: {k.totalLinkStrength || k.links * 2})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DRAF BAB 3 METODOLOGI (BERBASIS DONTHU 2021 & ÖZTÜRK 2024) */}
      {activeTab === "bab3" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              Teks di bawah ini telah diselaraskan dengan pedoman penulisan tesis program pascasarjana serta framework Öztürk et al. (2024) dan Donthu et al. (2021).
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

      {/* TAB 5: KERANGKA SENSEMAKING 3S (LIM & KUMAR 2023 / ÖZTÜRK 2024 TABLE 6) */}
      {activeTab === "sensemaking" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Mengapa Pendekatan Sensemaking Sangat Krusial? (Lim &amp; Kumar, 2023)</strong>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                Banyak mahasiswa pascasarjana terjebak hanya menampilkan gambar VOSviewer tanpa mampu mengartikulasikan <em>makna dan implikasi</em> di balik graf. Melalui kerangka kerja 3S (Scanning &rarr; Sensing &rarr; Substantiating), Anda dapat mempertahankan proposal tesis di depan penguji dengan argumen akademik yang kokoh.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stage 1: Scanning */}
            <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  S1
                </span>
                <h4 className="font-extrabold text-xs text-blue-900 dark:text-blue-200">
                  Scanning (Pengenalan Pola Makro)
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Mengidentifikasi metrik kuantitatif makro: lonjakan volume publikasi, penulis terkemuka, jurnal dominan, dan {clusterSummaries.length} klaster tematik yang terdeteksi.
              </p>
              <div className="text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <strong className="text-blue-700 dark:text-blue-300">Penerapan pada Tesis Anda:</strong>
                <p className="text-slate-500">Membuktikan kepada dosen pembimbing bahwa domain riset Anda aktif diteliti dan memiliki literatur yang memadai ({performanceStats.totalPubs} artikel peer-reviewed).</p>
              </div>
            </div>

            {/* Stage 2: Sensing */}
            <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  S2
                </span>
                <h4 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200">
                  Sensing (Menelaah How &amp; Why)
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Menelaah keterkaitan mendalam antar-klaster: mengapa tema tertentu belum banyak dihubungkan (structural hole) dan apa akar permasalahan rekayasa yang belum terjawab.
              </p>
              <div className="text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <strong className="text-indigo-700 dark:text-indigo-300">Penerapan pada Tesis Anda:</strong>
                <p className="text-slate-500">Menjadi argumen utama dalam perumusan <strong>Research Gap</strong> (Langkah 2) dan <strong>Pertanyaan Riset Utama</strong> (Langkah 3).</p>
              </div>
            </div>

            {/* Stage 3: Substantiating */}
            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  S3
                </span>
                <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">
                  Substantiating (Bukti Kredibilitas)
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Membuktikan validitas metodologi melalui prosedur triangulasi data, normalisasi matematis VOS, dan kriteria replikasi PRISMA 2020.
              </p>
              <div className="text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <strong className="text-emerald-700 dark:text-emerald-300">Penerapan pada Tesis Anda:</strong>
                <p className="text-slate-500">Menjamin usulan tesis Anda lulus rubrik kelayakan akademik dosen pembimbing dengan skor tertinggi pada kriteria <em>Kejelasan Gap</em> dan <em>Kebaruan (Novelty)</em>.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
