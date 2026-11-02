import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import { VosNode, VosEdge, VosMapResult } from "./vosviewer-parser";
import { normalizeKeyword, CIVIL_STOP_WORDS } from "./thesaurus";

export interface DiscoveredArticle {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi?: string;
  citedByCount: number;
  keywords: string[];
}

export interface DirectMapResult extends VosMapResult {
  query: string;
  totalWorksFound: number;
  articles: DiscoveredArticle[];
}

// Broad academic domains to exclude from specific keyword network
const BROAD_DOMAIN_EXCLUDES = new Set([
  "physics",
  "chemistry",
  "materials science",
  "geology",
  "engineering",
  "composite material",
  "mechanics",
  "biology",
  "medicine",
  "mathematics",
  "computer science",
  "environmental science",
  "chemical engineering",
  "metallurgy",
  "mineralogy",
  "geotechnical engineering",
  "structural engineering",
  "civil engineering",
  "science",
  "humanities",
  "social sciences",
  "social science",
  "philosophy",
  "political science",
  "art",
  "history",
  "linguistics",
  "business",
  "psychology",
  "economics",
  "management",
  "sociology",
  "education",
]);

interface OpenAlexRawWork {
  id: string;
  title?: string;
  publication_year?: number;
  cited_by_count?: number;
  doi?: string;
  primary_location?: {
    source?: {
      display_name?: string;
    };
  };
  authorships?: Array<{
    author?: {
      display_name?: string;
    };
  }>;
  concepts?: Array<{
    display_name?: string;
    score?: number;
    level?: number;
  }>;
  keywords?: Array<{
    display_name?: string;
    score?: number;
  }>;
}

/**
 * Fetch works from OpenAlex API
 */
export async function fetchOpenAlexWorks(
  query: string,
  limit: number = 50
): Promise<OpenAlexRawWork[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const url = `https://api.openalex.org/works?search=${encodeURIComponent(cleanQuery)}&per_page=${Math.min(limit, 50)}&sort=cited_by_count:desc`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Metopen-KanvasTesis/1.0 (mailto:metopen@uny.ac.id)",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`OpenAlex API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.results || [];
}

/**
 * Process OpenAlex works into a full VOSviewer-compatible network and article list
 */
export function buildNetworkFromOpenAlexWorks(
  query: string,
  rawWorks: OpenAlexRawWork[],
  minOccurrences: number = 2
): DirectMapResult {
  const articles: DiscoveredArticle[] = [];
  const keywordStats = new Map<string, { count: number; yearSum: number; citations: number }>();
  const coOccurrenceMap = new Map<string, number>();

  rawWorks.forEach((work) => {
    const title = work.title || "Untitled Paper";
    const year = work.publication_year || new Date().getFullYear();
    const citedByCount = work.cited_by_count || 0;
    const doi = work.doi ? work.doi.replace("https://doi.org/", "") : undefined;
    const journal = work.primary_location?.source?.display_name || "Peer-Reviewed Journal";

    const authorsList = (work.authorships || [])
      .map((a) => a.author?.display_name)
      .filter(Boolean) as string[];

    const authorString =
      authorsList.length > 3
        ? `${authorsList[0]}, dkk.`
        : authorsList.length > 0
        ? authorsList.join(", ")
        : "Peneliti Rekayasa";

    // Extract raw keywords from concepts and keywords
    const rawTerms: string[] = [];

    (work.keywords || []).forEach((k) => {
      if (k.display_name) rawTerms.push(k.display_name);
    });

    (work.concepts || []).forEach((c) => {
      // Pick technical concepts level >= 1
      if (c.display_name && (c.score || 0) >= 0.35 && (c.level || 0) >= 1) {
        rawTerms.push(c.display_name);
      }
    });

    // Normalize and filter
    const uniqueKwsInPaper = Array.from(
      new Set(
        rawTerms
          .map((t) => normalizeKeyword(t))
          .filter((t) => {
            if (!t || t.length < 3) return false;
            if (CIVIL_STOP_WORDS.has(t)) return false;
            if (BROAD_DOMAIN_EXCLUDES.has(t)) return false;
            return true;
          })
      )
    );

    articles.push({
      id: work.id,
      title,
      authors: authorString,
      year,
      journal,
      doi,
      citedByCount,
      keywords: uniqueKwsInPaper,
    });

    // Update keyword frequency
    uniqueKwsInPaper.forEach((kw) => {
      if (!keywordStats.has(kw)) {
        keywordStats.set(kw, { count: 0, yearSum: 0, citations: 0 });
      }
      const stat = keywordStats.get(kw)!;
      stat.count += 1;
      stat.yearSum += year;
      stat.citations += citedByCount;
    });

    // Update co-occurrence matrix
    for (let i = 0; i < uniqueKwsInPaper.length; i++) {
      for (let j = i + 1; j < uniqueKwsInPaper.length; j++) {
        const pair = [uniqueKwsInPaper[i], uniqueKwsInPaper[j]].sort().join("___");
        coOccurrenceMap.set(pair, (coOccurrenceMap.get(pair) || 0) + 1);
      }
    }
  });

  // Filter keywords by minimum occurrences (or top 25 if few meet the threshold)
  let eligibleKeywords = Array.from(keywordStats.entries())
    .filter(([kw, stat]) => Boolean(kw) && stat.count >= minOccurrences)
    .sort((a, b) => b[1].count - a[1].count);

  if (eligibleKeywords.length < 5) {
    eligibleKeywords = Array.from(keywordStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 30);
  } else if (eligibleKeywords.length > 60) {
    eligibleKeywords = eligibleKeywords.slice(0, 60);
  }

  const eligibleSet = new Set(eligibleKeywords.map(([kw]) => kw));

  // Build Graphology graph for Louvain clustering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graph = new (Graph as any)({ type: "undirected" });

  eligibleKeywords.forEach(([kw]) => {
    graph.addNode(kw);
  });

  const edgeWeights = new Map<string, number>();

  coOccurrenceMap.forEach((weight, pair) => {
    const [u, v] = pair.split("___");
    if (eligibleSet.has(u) && eligibleSet.has(v) && weight >= 1) {
      edgeWeights.set(pair, weight);
      if (graph.hasNode(u) && graph.hasNode(v) && !graph.hasEdge(u, v)) {
        graph.addEdge(u, v, { weight });
      }
    }
  });

  let clusters: Record<string, number> = {};
  try {
    clusters = louvain(graph);
  } catch {
    let fallbackCluster = 1;
    eligibleKeywords.forEach(([kw]) => {
      clusters[kw] = fallbackCluster;
      fallbackCluster = (fallbackCluster % 4) + 1;
    });
  }

  // Pre-calculate cluster centers and angular distribution for authentic VOSviewer islands
  const uniqueClusterIds = Array.from(new Set(Object.values(clusters))).sort((a, b) => a - b);
  const numClusters = Math.max(1, uniqueClusterIds.length);
  const clusterAngleMap = new Map<number, number>();
  uniqueClusterIds.forEach((cId, idx) => {
    clusterAngleMap.set(cId, (idx * 2 * Math.PI) / numClusters);
  });

  const clusterNodeCounts = new Map<number, number>();

  const nodes: VosNode[] = eligibleKeywords.map(([kw, stat]) => {
    const rawCluster = clusters[kw] !== undefined ? clusters[kw] : 0;
    const cluster = rawCluster + 1;
    const avgPubYear = Number((stat.yearSum / stat.count).toFixed(1));

    const cCount = clusterNodeCounts.get(cluster) || 0;
    clusterNodeCounts.set(cluster, cCount + 1);

    // Island center in 2D space
    const baseAngle = clusterAngleMap.get(rawCluster) ?? 0;
    const islandRadius = 0.42; // distance from central origin

    // Organic spiral packing inside each cluster island (phyllotaxis)
    const goldenAngle = cCount * 2.39996;
    const rJitter = 0.05 + Math.sqrt(cCount + 1) * 0.045;
    const rawX = Math.cos(baseAngle) * islandRadius + Math.cos(goldenAngle) * rJitter;
    const rawY = Math.sin(baseAngle) * islandRadius + Math.sin(goldenAngle) * rJitter;

    const x = Number(rawX.toFixed(4));
    const y = Number(rawY.toFixed(4));

    // Calculate links & totalLinkStrength
    let links = 0;
    let totalLinkStrength = 0;

    edgeWeights.forEach((weight, pair) => {
      const [u, v] = pair.split("___");
      if (u === kw || v === kw) {
        links += 1;
        totalLinkStrength += weight;
      }
    });

    return {
      id: kw,
      label: kw.charAt(0).toUpperCase() + kw.slice(1),
      x,
      y,
      cluster,
      occurrences: stat.count,
      links,
      totalLinkStrength,
      avgPubYear,
      avgCitations: Number((stat.citations / stat.count).toFixed(1)),
    };
  });

  const edges: VosEdge[] = [];
  edgeWeights.forEach((weight, pair) => {
    const [u, v] = pair.split("___");
    edges.push({
      id: `edge_${u}_${v}`,
      source: u,
      target: v,
      weight,
    });
  });

  const years = nodes.map((n) => n.avgPubYear || 2022);
  const minYear = years.length > 0 ? Math.min(...years) : 2020;
  const maxYear = years.length > 0 ? Math.max(...years) : 2024;
  const clusterNumbers = Array.from(new Set(nodes.map((n) => n.cluster))).sort((a, b) => a - b);

  return {
    query,
    totalWorksFound: rawWorks.length,
    articles,
    nodes,
    edges,
    clusters: clusterNumbers,
    minYear,
    maxYear,
  };
}
