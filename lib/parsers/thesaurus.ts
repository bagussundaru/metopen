/**
 * Civil Engineering Thesaurus & Stop Words
 * Handles synonym merging and filters irrelevant bibliographic noise words
 */

export const CIVIL_STOP_WORDS = new Set([
  "study",
  "analysis",
  "investigation",
  "effect",
  "effects",
  "review",
  "evaluation",
  "development",
  "approach",
  "paper",
  "case",
  "cases",
  "result",
  "results",
  "performance",
  "influence",
  "experimental",
  "numerical",
  "model",
  "models",
  "modeling",
  "modelling",
  "method",
  "methods",
  "application",
  "applications",
  "based",
  "using",
  "behavior",
  "behaviour",
  "characteristic",
  "characteristics",
  "property",
  "properties",
]);

// Mapping of common variants to canonical engineering terms
export const CIVIL_SYNONYMS: Record<string, string> = {
  "fly-ash": "fly ash",
  "flyash": "fly ash",
  "pulverized fuel ash": "fly ash",
  "geopolymer-concrete": "geopolymer concrete",
  "geopolymeric concrete": "geopolymer concrete",
  "alkali activated concrete": "geopolymer concrete",
  "alkali-activated concrete": "geopolymer concrete",
  "high strength concrete": "high-strength concrete",
  "high-performance concrete": "high-performance concrete",
  "reinforced concrete beam": "reinforced concrete beams",
  "rc beam": "reinforced concrete beams",
  "rc beams": "reinforced concrete beams",
  "flexural strength": "flexural capacity",
  "bending strength": "flexural capacity",
  "compressive strength": "compressive capacity",
  "finite element method": "fem simulation",
  "finite element analysis": "fem simulation",
  "fea": "fem simulation",
  "sulfate attack": "sulfate resistance",
  "sulphate attack": "sulfate resistance",
  "data centers": "data center",
  "data centre": "data center",
  "data centres": "data center",
  "data center network": "data center networks",
  "server farm": "server farms",
  "cooling systems": "cooling system",
  "k3": "occupational safety (K3)",
  "keselamatan kerja": "occupational safety (K3)",
  "keselamatan dan kesehatan kerja": "occupational safety (K3)",
  "occupational health and safety": "occupational safety (K3)",
  "occupational safety and health": "occupational safety (K3)",
  "workplace safety": "occupational safety (K3)",
  "occupational health": "occupational safety (K3)",
  "personal protective equipment": "personal protective equipment (APD)",
  "apd": "personal protective equipment (APD)",
  "ppe": "personal protective equipment (APD)",
};

/**
 * Smart query translator: maps Indonesian academic search queries to high-yield English terms
 */
export function translateSearchQuery(query: string): string {
  if (!query) return "";
  const lower = query.toLowerCase().trim();

  const translations: Record<string, string> = {
    "pusat data": "data center",
    "tanah lempung": "expansive clay soil",
    "stabilisasi tanah": "soil stabilization",
    "stabilisasi tanah lempung": "expansive clay soil stabilization lime",
    "beton geopolimer": "geopolymer concrete",
    "beton geopolimer fly ash": "geopolymer concrete fly ash",
    "kuat lentur": "flexural capacity",
    "kuat tekan": "compressive capacity",
    "kuat lentur balok": "reinforced concrete beam flexural capacity",
    "balok beton": "reinforced concrete beam",
    "struktur tahan gempa": "seismic performance concrete structure",
    "ketahanan sulfat": "concrete sulfate resistance durability",
    "aspal modifikasi": "polymer modified asphalt",
    "aspal modifikasi polimer": "polymer modified asphalt pavement durability",
    "perkerasan kaku": "rigid pavement concrete",
    "perkerasan lentur": "flexible asphalt pavement",
  };

  for (const [idTerm, enTerm] of Object.entries(translations)) {
    if (lower === idTerm) {
      return enTerm;
    }
  }

  return query.trim();
}

export function normalizeKeyword(raw: string): string {
  if (!raw) return "";

  let cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/[;.,/#!$%^&*{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ");

  if (CIVIL_SYNONYMS[cleaned]) {
    cleaned = CIVIL_SYNONYMS[cleaned];
  }

  return cleaned;
}
