import Papa from "papaparse";

export interface VosNode {
  id: string;
  label: string;
  x: number;
  y: number;
  cluster: number;
  occurrences: number;
  links: number;
  totalLinkStrength: number;
  avgPubYear?: number;
  avgCitations?: number;
}

export interface VosEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface VosMapResult {
  nodes: VosNode[];
  edges: VosEdge[];
  clusters: number[];
  minYear: number;
  maxYear: number;
}

function detectDelimiter(content: string): string {
  const clean = content.replace(/^\uFEFF/, "");
  const firstLines = clean.split(/\r?\n/).slice(0, 5).join("\n");
  const tabCount = (firstLines.match(/\t/g) || []).length;
  const commaCount = (firstLines.match(/,/g) || []).length;
  const semiCount = (firstLines.match(/;/g) || []).length;

  if (tabCount >= commaCount && tabCount >= semiCount && tabCount > 0) return "\t";
  if (semiCount > commaCount && semiCount > 0) return ";";
  return ",";
}

export function parseVosMapFile(mapContent: string): VosNode[] {
  const clean = mapContent.replace(/^\uFEFF/, "").trim();
  if (!clean) return [];

  const delimiter = detectDelimiter(clean);

  const parsed = Papa.parse<Record<string, string>>(clean, {
    header: true,
    delimiter,
    skipEmptyLines: true,
  });

  const nodes: VosNode[] = [];

  for (const row of parsed.data) {
    // Find ID and Label
    const id = row["id"] || row["Id"] || row["ID"] || Object.values(row)[0];
    const label = row["label"] || row["Label"] || row["name"] || id;

    if (!id || !label) continue;

    const x = parseFloat(row["x"] || row["X"] || "0") || 0;
    const y = parseFloat(row["y"] || row["Y"] || "0") || 0;
    const cluster = parseInt(row["cluster"] || row["Cluster"] || "1", 10) || 1;

    // Flexible column match for weight<...>
    let occurrences = 1;
    let links = 0;
    let totalLinkStrength = 0;
    let avgPubYear: number | undefined;
    let avgCitations: number | undefined;

    for (const [key, val] of Object.entries(row)) {
      const lower = key.toLowerCase();
      const numVal = parseFloat(val);

      if (lower.includes("occurrences") || lower.includes("weight<occurrences>")) {
        occurrences = isNaN(numVal) ? 1 : numVal;
      } else if (lower.includes("total link strength") || lower.includes("weight<total link strength>")) {
        totalLinkStrength = isNaN(numVal) ? 0 : numVal;
      } else if (lower.includes("links") || lower.includes("weight<links>")) {
        links = isNaN(numVal) ? 0 : numVal;
      } else if (lower.includes("pub. year") || lower.includes("pub year") || lower.includes("avg. pub. year")) {
        if (!isNaN(numVal) && numVal > 1900 && numVal < 2100) {
          avgPubYear = numVal;
        }
      } else if (lower.includes("citations") || lower.includes("avg. citations")) {
        if (!isNaN(numVal)) {
          avgCitations = numVal;
        }
      }
    }

    nodes.push({
      id: String(id).trim(),
      label: String(label).trim(),
      x,
      y,
      cluster,
      occurrences,
      links,
      totalLinkStrength,
      avgPubYear,
      avgCitations,
    });
  }

  return nodes;
}

export function parseVosNetworkFile(netContent: string, knownNodeIds?: Set<string>): VosEdge[] {
  const clean = netContent.replace(/^\uFEFF/, "").trim();
  if (!clean) return [];

  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const edges: VosEdge[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Split by whitespace or delimiter
    const parts = line.split(/[\t,;\s]+/).filter(Boolean);

    // Skip header line if first line contains text like "id1", "source", "node1"
    if (i === 0 && (parts[0].toLowerCase().includes("id") || parts[0].toLowerCase().includes("source"))) {
      continue;
    }

    if (parts.length >= 2) {
      const source = parts[0].trim();
      const target = parts[1].trim();
      const weight = parts[2] ? parseFloat(parts[2]) || 1 : 1;

      // If knownNodeIds provided, verify node existence
      if (knownNodeIds && (!knownNodeIds.has(source) || !knownNodeIds.has(target))) {
        continue;
      }

      edges.push({
        id: `e-${source}-${target}-${i}`,
        source,
        target,
        weight,
      });
    }
  }

  return edges;
}

export function buildVosMapResult(mapContent: string, netContent?: string): VosMapResult {
  const nodes = parseVosMapFile(mapContent);
  const nodeIds = new Set(nodes.map((n) => n.id));

  const edges = netContent ? parseVosNetworkFile(netContent, nodeIds) : [];

  const clusters = Array.from(new Set(nodes.map((n) => n.cluster))).sort((a, b) => a - b);

  const years = nodes.map((n) => n.avgPubYear).filter((y): y is number => y !== undefined);
  const minYear = years.length > 0 ? Math.min(...years) : 2020;
  const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

  return {
    nodes,
    edges,
    clusters,
    minYear,
    maxYear,
  };
}

export function exportToVosviewerFormat(nodes: VosNode[], edges: VosEdge[]): { mapTxt: string; netTxt: string } {
  // Build Map text
  const mapHeaders = ["id", "label", "x", "y", "cluster", "weight<Occurrences>", "weight<Total link strength>", "score<Avg. pub. year>"];
  const mapRows = nodes.map((n) => [
    n.id,
    `"${n.label.replace(/"/g, '""')}"`,
    n.x.toFixed(4),
    n.y.toFixed(4),
    n.cluster,
    n.occurrences,
    n.totalLinkStrength,
    n.avgPubYear ? n.avgPubYear.toFixed(2) : "",
  ].join("\t"));

  const mapTxt = [mapHeaders.join("\t"), ...mapRows].join("\n");

  // Build Network text
  const netRows = edges.map((e) => [e.source, e.target, e.weight].join("\t"));
  const netTxt = netRows.join("\n");

  return { mapTxt, netTxt };
}
