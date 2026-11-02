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
};

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
