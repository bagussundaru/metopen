import Papa from "papaparse";
import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import { normalizeKeyword, CIVIL_STOP_WORDS } from "./thesaurus";
import { VosNode, VosEdge, VosMapResult } from "./vosviewer-parser";
import { Reference } from "@/lib/types/canvas";

export interface ParsedArticle {
  id: string;
  authors: string;
  year: number;
  title: string;
  source: string;
  doi?: string;
  citedBy: number;
  keywords: string[];
}

export function parseScopusOrPopCsv(csvContent: string): ParsedArticle[] {
  const clean = csvContent.replace(/^\uFEFF/, "").trim();
  if (!clean) return [];

  const parsed = Papa.parse<Record<string, string>>(clean, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const articles: ParsedArticle[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];

    // Find Authors
    const authors = row["Authors"] || row["authors"] || row["Author"] || "Anonim";
    const title = row["Title"] || row["title"] || `Publikasi ${i + 1}`;
    const year = parseInt(row["Year"] || row["year"] || row["Publication Year"] || "2023", 10) || 2023;
    const source = row["Source title"] || row["Source"] || row["source"] || row["Journal"] || "";
    const doi = row["DOI"] || row["doi"] || "";
    const citedBy = parseInt(row["Cited by"] || row["Cites"] || row["cited_by"] || "0", 10) || 0;

    // Combine author keywords, index keywords
    const rawKeywords = [
      row["Author Keywords"] || "",
      row["Index Keywords"] || "",
      row["Keywords"] || "",
    ]
      .filter(Boolean)
      .join(";");

    const keywordList = rawKeywords
      .split(/[;,|]/)
      .map((k) => normalizeKeyword(k))
      .filter((k) => k.length > 2 && !CIVIL_STOP_WORDS.has(k));

    // Deduplicate per article
    const uniqueKeywords = Array.from(new Set(keywordList));

    articles.push({
      id: `art-${i + 1}`,
      authors,
      year,
      title,
      source,
      doi,
      citedBy,
      keywords: uniqueKeywords,
    });
  }

  return articles;
}

export interface BuildGraphOptions {
  minOccurrences?: number;
  minLinkStrength?: number;
}

export function buildCooccurrenceGraph(
  articles: ParsedArticle[],
  options: BuildGraphOptions = {}
): VosMapResult {
  const minOccurrences = options.minOccurrences || 2;
  const minLinkStrength = options.minLinkStrength || 1;

  // 1. Calculate occurrence frequency and average pub year per keyword
  const keywordStats = new Map<string, { count: number; totalYears: number }>();

  for (const art of articles) {
    for (const kw of art.keywords) {
      const existing = keywordStats.get(kw) || { count: 0, totalYears: 0 };
      existing.count += 1;
      existing.totalYears += art.year;
      keywordStats.set(kw, existing);
    }
  }

  // Filter keywords by minimum occurrences
  const validKeywords = new Set<string>();
  for (const [kw, stats] of keywordStats.entries()) {
    if (stats.count >= minOccurrences) {
      validKeywords.add(kw);
    }
  }

  // 2. Build co-occurrence link pairs
  const pairWeights = new Map<string, number>();

  for (const art of articles) {
    const presentValidKws = art.keywords.filter((kw) => validKeywords.has(kw));
    for (let i = 0; i < presentValidKws.length; i++) {
      for (let j = i + 1; j < presentValidKws.length; j++) {
        const kwA = presentValidKws[i];
        const kwB = presentValidKws[j];
        const key = kwA < kwB ? `${kwA}___${kwB}` : `${kwB}___${kwA}`;
        pairWeights.set(key, (pairWeights.get(key) || 0) + 1);
      }
    }
  }

  // 3. Build Graphology graph for Louvain clustering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graph: any = new (Graph as any)();

  for (const kw of validKeywords) {
    graph.addNode(kw);
  }

  const validEdges: VosEdge[] = [];
  const linkStrengthMap = new Map<string, number>();

  let edgeCounter = 1;
  for (const [pairKey, weight] of pairWeights.entries()) {
    if (weight >= minLinkStrength) {
      const [source, target] = pairKey.split("___");
      if (graph.hasNode(source) && graph.hasNode(target)) {
        graph.addEdge(source, target, { weight });
        validEdges.push({
          id: `e-${edgeCounter++}`,
          source,
          target,
          weight,
        });

        linkStrengthMap.set(source, (linkStrengthMap.get(source) || 0) + weight);
        linkStrengthMap.set(target, (linkStrengthMap.get(target) || 0) + weight);
      }
    }
  }

  // Run Louvain Modularity Clustering
  let communities: Record<string, number> = {};
  try {
    if (graph.order > 0 && graph.size > 0) {
      communities = louvain(graph);
    }
  } catch (err) {
    console.warn("Louvain clustering fallback to single cluster:", err);
  }

  // 4. Construct VOS Nodes with pseudo-circle or random positions for initial render
  const nodes: VosNode[] = [];
  const keywordArray = Array.from(validKeywords);
  const total = keywordArray.length;

  keywordArray.forEach((kw, index) => {
    const stats = keywordStats.get(kw)!;
    const cluster = (communities[kw] !== undefined ? communities[kw] + 1 : 1);
    const avgPubYear = Math.round((stats.totalYears / stats.count) * 10) / 10;
    const totalLinkStrength = linkStrengthMap.get(kw) || 0;

    // Distribute around cluster angle
    const angle = (2 * Math.PI * index) / (total || 1);
    const radius = 250 + (cluster * 80);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    nodes.push({
      id: kw,
      label: kw,
      x,
      y,
      cluster,
      occurrences: stats.count,
      links: validEdges.filter((e) => e.source === kw || e.target === kw).length,
      totalLinkStrength,
      avgPubYear,
    });
  });

  const clusters = Array.from(new Set(nodes.map((n) => n.cluster))).sort((a, b) => a - b);
  const years = nodes.map((n) => n.avgPubYear).filter((y): y is number => y !== undefined);
  const minYear = years.length > 0 ? Math.min(...years) : 2020;
  const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

  return {
    nodes,
    edges: validEdges,
    clusters,
    minYear,
    maxYear,
  };
}

export function convertParsedArticleToReference(art: ParsedArticle): Reference {
  return {
    id: crypto.randomUUID(),
    authors: art.authors,
    year: art.year,
    title: art.title,
    source: art.source,
    indexSource: "scopus",
    citedBy: art.citedBy,
    doi: art.doi || "",
    keyFinding: `Sintesis publikasi terkait kata kunci: ${art.keywords.slice(0, 3).join(", ")}.`,
    limitation: "Perlu ditinjau kesesuaian parameternya dengan konteks pengujian lokal.",
  };
}
