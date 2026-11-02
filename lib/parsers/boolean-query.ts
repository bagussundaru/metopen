/**
 * Boolean Query Parser & Academic Query Expander
 * Implements Scopus / Google Scholar Boolean Logic (AND, OR, NOT, Quotes)
 * Automatically segments multi-concept queries (e.g. "K3 Data Center") into Boolean intersections.
 */

export interface BooleanQueryResult {
  rawQuery: string;
  booleanQuery: string;
  facets: string[];
  isExplicitBoolean: boolean;
  explanation: string;
}

// Academic Engineering Acronyms & Conceptual Facets Dictionary
const ACADEMIC_FACET_EXPANSIONS: Record<string, string> = {
  // Keselamatan & Kesehatan Kerja (K3)
  k3: '("occupational safety" OR "workplace safety" OR "occupational health and safety" OR "K3" OR "keselamatan kerja")',
  "keselamatan kerja": '("occupational safety" OR "workplace safety" OR "occupational health and safety" OR "keselamatan kerja")',
  "keselamatan dan kesehatan kerja": '("occupational safety" OR "workplace safety" OR "occupational health and safety" OR "K3")',
  "occupational safety": '("occupational safety" OR "workplace safety" OR "occupational health and safety" OR "K3")',
  "occupational health": '("occupational health" OR "occupational safety" OR "occupational health and safety")',
  apd: '("personal protective equipment" OR "PPE" OR "APD")',
  ppe: '("personal protective equipment" OR "PPE" OR "APD")',

  // Data Center / Pusat Data
  "data center": '("data center" OR "data centers" OR "data centre" OR "data centres" OR "server farm")',
  "data centers": '("data center" OR "data centers" OR "data centre" OR "data centres" OR "server farm")',
  "pusat data": '("data center" OR "data centers" OR "data centre" OR "data centres" OR "server farm")',
  "server farm": '("data center" OR "data centers" OR "server farm")',
  "server room": '("data center" OR "server room" OR "server rooms")',

  // Teknik Sipil - Struktur & Material
  "beton geopolimer": '("geopolymer concrete" OR "alkali-activated concrete" OR "geopolymer")',
  "geopolymer concrete": '("geopolymer concrete" OR "alkali-activated concrete" OR "geopolymer")',
  "fly ash": '("fly ash" OR "coal ash" OR "pulverized fuel ash")',
  "abu terbang": '("fly ash" OR "coal ash" OR "pulverized fuel ash")',
  "kuat lentur": '("flexural strength" OR "flexural capacity" OR "bending strength")',
  "flexural capacity": '("flexural strength" OR "flexural capacity" OR "bending strength")',
  "flexural strength": '("flexural strength" OR "flexural capacity" OR "bending strength")',
  "kuat tekan": '("compressive strength" OR "compressive capacity")',
  "compressive strength": '("compressive strength" OR "compressive capacity")',
  "daktilitas": '("ductility" OR "ductile behavior")',
  "balok beton": '("reinforced concrete beam" OR "rc beam" OR "concrete beams")',
  "reinforced concrete beam": '("reinforced concrete beam" OR "rc beam" OR "concrete beams")',
  "tanah lempung": '("expansive clay" OR "clay soil" OR "clayey soil")',
  "clay soil": '("expansive clay" OR "clay soil" OR "clayey soil")',
  "stabilisasi tanah": '("soil stabilization" OR "ground improvement")',
  "soil stabilization": '("soil stabilization" OR "ground improvement")',
  "aspal modifikasi": '("polymer modified asphalt" OR "modified bitumen")',
  "tahan gempa": '("seismic performance" OR "earthquake resistant" OR "seismic design")',
  "seismic performance": '("seismic performance" OR "earthquake resistant" OR "seismic design")',
  "ketahanan sulfat": '("sulfate resistance" OR "sulfate attack")',
  "sulfate resistance": '("sulfate resistance" OR "sulfate attack")',
  "mutu tinggi": '("high-strength" OR "high-performance")',
  "high strength": '("high-strength" OR "high-performance")',
  "perkerasan kaku": '("rigid pavement" OR "concrete pavement")',
  "perkerasan lentur": '("flexible pavement" OR "asphalt pavement")',
};

/**
 * Checks if query already has explicit Boolean syntax
 */
export function hasExplicitBooleanOperators(query: string): boolean {
  const upper = query.toUpperCase();
  // Check for uppercase boolean keywords or quotes or parentheses
  return (
    /\bAND\b/.test(upper) ||
    /\bOR\b/.test(upper) ||
    /\bNOT\b/.test(upper) ||
    /"[^"]+"/.test(query) ||
    /[()]/.test(query)
  );
}

/**
 * Parses user input into a validated Boolean query with facet expansions
 */
export function parseAndExpandBooleanQuery(rawQuery: string): BooleanQueryResult {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return {
      rawQuery: "",
      booleanQuery: "",
      facets: [],
      isExplicitBoolean: false,
      explanation: "Kueri kosong",
    };
  }

  // If user already wrote explicit Boolean operators (e.g. "K3" AND "Data Center")
  if (hasExplicitBooleanOperators(trimmed)) {
    // Expand known acronyms like standalone K3 inside their query if needed
    let expanded = trimmed;
    // Replace standalone K3 with expanded synonym set if not already inside quotes
    expanded = expanded.replace(/\bK3\b/gi, '("occupational safety" OR "workplace safety" OR "K3")');
    expanded = expanded.replace(/\bAPD\b/gi, '("personal protective equipment" OR "PPE" OR "APD")');

    return {
      rawQuery: trimmed,
      booleanQuery: expanded,
      facets: [trimmed],
      isExplicitBoolean: true,
      explanation: "Menggunakan sintaks Boolean eksplisit pengguna.",
    };
  }

  // Segment user input into conceptual facets
  const lower = trimmed.toLowerCase();

  // 1. Identify matched dictionary facets (longest matches first)
  const matchedFacets: Array<{ raw: string; expanded: string; startIndex: number; endIndex: number }> = [];
  const dictionaryKeys = Object.keys(ACADEMIC_FACET_EXPANSIONS).sort((a, b) => b.length - a.length);

  let searchWindow = lower;
  for (const key of dictionaryKeys) {
    const idx = searchWindow.indexOf(key);
    if (idx !== -1) {
      // Ensure word boundary
      const before = idx > 0 ? searchWindow[idx - 1] : " ";
      const after = idx + key.length < searchWindow.length ? searchWindow[idx + key.length] : " ";
      if (/[\s,./()_-]/.test(before) && /[\s,./()_-]/.test(after)) {
        matchedFacets.push({
          raw: key,
          expanded: ACADEMIC_FACET_EXPANSIONS[key],
          startIndex: idx,
          endIndex: idx + key.length,
        });
        // Blank out matched section so sub-terms aren't double-matched
        searchWindow =
          searchWindow.slice(0, idx) + " ".repeat(key.length) + searchWindow.slice(idx + key.length);
      }
    }
  }

  // 2. Collect any remaining unmatched words/phrases as additional facets
  const remainingTokens = searchWindow
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  const facetClauses: string[] = [];
  const facetLabels: string[] = [];

  matchedFacets.forEach((f) => {
    facetClauses.push(f.expanded);
    facetLabels.push(f.raw.toUpperCase());
  });

  remainingTokens.forEach((tok) => {
    facetClauses.push(`"${tok}"`);
    facetLabels.push(tok);
  });

  // If multiple facets were identified, combine them with Boolean AND!
  if (facetClauses.length > 1) {
    const booleanQuery = facetClauses.join(" AND ");
    return {
      rawQuery: trimmed,
      booleanQuery,
      facets: facetLabels,
      isExplicitBoolean: false,
      explanation: `Otomatis menggabungkan ${facetLabels.length} konsep dengan logika irisan AND (${facetLabels.join(" ∩ ")})`,
    };
  }

  // Single facet or direct term
  if (matchedFacets.length === 1 && remainingTokens.length === 0) {
    return {
      rawQuery: trimmed,
      booleanQuery: matchedFacets[0].expanded,
      facets: [matchedFacets[0].raw.toUpperCase()],
      isExplicitBoolean: false,
      explanation: `Memperluas istilah akademik "${matchedFacets[0].raw}" dengan sinonim relevan`,
    };
  }

  // Fallback for simple single phrases
  const fallbackQuery = trimmed.includes(" ") ? `"${trimmed}"` : trimmed;
  return {
    rawQuery: trimmed,
    booleanQuery: fallbackQuery,
    facets: [trimmed],
    isExplicitBoolean: false,
    explanation: "Pencarian frasa kata kunci",
  };
}
