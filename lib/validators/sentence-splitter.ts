/**
 * Indonesian Sentence Splitter
 * Accurately splits Indonesian academic text into distinct sentences
 * while safely preserving abbreviations, academic titles, citations, and decimal numbers.
 */

// Common abbreviations in Indonesian and international academic citations
const ABBREVIATIONS = [
  // Academic citations & references
  "dkk",
  "et al",
  "vol",
  "no",
  "hal",
  "pp",
  "ed",
  "eds",
  "ibid",
  "op cit",
  "loc cit",
  // Academic titles
  "prof",
  "dr",
  "dra",
  "drs",
  "ir",
  "m.t",
  "m.eng",
  "m.sc",
  "m.si",
  "ph.d",
  "b.eng",
  "s.t",
  // Common Indonesian abbreviations
  "mis",
  "dsb",
  "dll",
  "dst",
  "yaitu",
  "a.n",
  "d/a",
  "u.p",
  "sbb",
  "ttg",
  "thn",
  "bln",
  "pt",
  "cv",
];

// Build regex pattern for safe abbreviation masking
const ABBREV_REGEX = new RegExp(
  `\\b(${ABBREVIATIONS.map((abbr) => abbr.replace(/\./g, "\\.")).join("|")})\\.`,
  "gi"
);

export function splitSentencesIndonesian(text: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  const cleanText = text.trim();

  // Step 1: Protect decimal numbers (e.g. 0.45 MPa, 3.14, SNI 03-2847-2002)
  const DECIMAL_TOKEN = "___DECIMAL_DOT___";
  const withProtectedDecimals = cleanText.replace(/(\d+)\.(\d+)/g, `$1${DECIMAL_TOKEN}$2`);

  // Step 2: Protect abbreviations with a placeholder
  const ABBREV_TOKEN = "___ABBREV_DOT___";
  const withProtectedAbbrevs = withProtectedDecimals.replace(ABBREV_REGEX, (match, prefix) => {
    return `${prefix}${ABBREV_TOKEN}`;
  });

  // Step 3: Split by sentence delimiters: period, exclamation, question mark, or newline
  // followed by whitespace or end of string
  const rawSegments = withProtectedAbbrevs.split(/(?<=[.?!])\s+|\n+/);

  // Step 4: Restore protected tokens and clean up whitespace
  const sentences: string[] = [];

  for (const seg of rawSegments) {
    const restored = seg
      .replace(new RegExp(ABBREV_TOKEN, "g"), ".")
      .replace(new RegExp(DECIMAL_TOKEN, "g"), ".")
      .trim();

    if (restored.length > 0) {
      sentences.push(restored);
    }
  }

  return sentences;
}
