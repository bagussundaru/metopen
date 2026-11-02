import { ValidationIssue, Reference } from "@/lib/types/canvas";
import { splitSentencesIndonesian } from "@/lib/validators/sentence-splitter";

export const GAP_KEYWORDS = [
  "belum",
  "masih terbatas",
  "belum ada",
  "tidak mempertimbangkan",
  "kurang",
  "namun demikian",
  "sayangnya",
  "tetapi",
  "namun",
  "tantangan",
  "kelemahan",
  "keterbatasan",
  "gap",
  "unaddressed",
  "however",
  "lacks",
  "little is known",
  "belum terukur",
  "belum diuji",
  "belum komprehensif",
  "mengabaikan",
  "terabaikan",
];

export function validateBackground(background: {
  sentences?: string[] | [string, string?, string?];
  references?: Partial<Reference>[];
}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const currentYear = new Date().getFullYear();

  // Combine sentences or check the individual inputs
  const rawSentences = (background.sentences || []).filter((s) => s && s.trim());
  const combinedText = rawSentences.join(" ");

  // Count total sentences accurately using the Indonesian sentence splitter
  const splitResults = splitSentencesIndonesian(combinedText);
  const sentenceCount = splitResults.length;

  // Rule 1: Max 3 sentences (Strict thesis canvas rule)
  if (sentenceCount > 3) {
    issues.push({
      id: "bg-sentence-count-exceeded",
      field: "background.sentences",
      level: "error",
      message: `Latar belakang melebihi batas maksimal 3 kalimat (terdeteksi ${sentenceCount} kalimat).`,
      suggestion: "Pangkas teks menjadi tepat 3 kalimat tajam: (1) Apa yang sudah diketahui, (2) Apa celah/keterbatasan yang belum terjawab, dan (3) Mengapa penelitian Anda penting.",
    });
  } else if (sentenceCount === 0) {
    issues.push({
      id: "bg-sentences-empty",
      field: "background.sentences",
      level: "error",
      message: "Latar Belakang & Gap belum diisi sama sekali.",
      suggestion: "Tuliskan minimal 1 hingga maksimal 3 kalimat sintesis berbasis literatur.",
    });
  }

  // Rule 2: Gap keywords detection
  if (combinedText) {
    const textLower = combinedText.toLowerCase();
    const hasGapMarker = GAP_KEYWORDS.some((kw) => textLower.includes(kw));

    if (!hasGapMarker) {
      issues.push({
        id: "bg-missing-gap-marker",
        field: "background.sentences",
        level: "warning",
        message: "Latar belakang belum memuat penanda celah riset (gap) yang eksplisit.",
        suggestion: "Gunakan kata kunci penegas seperti 'namun masih terbatas...', 'belum terukur secara komprehensif...', atau 'belum mempertimbangkan faktor...'.",
      });
    }

    // Rule 5: Sentence 1 tip check (what is already known)
    if (splitResults.length > 0) {
      const s1 = splitResults[0].toLowerCase();
      // If sentence 1 immediately starts with a gap or conclusion, suggest establishing the context first
      if (s1.startsWith("namun") || s1.startsWith("tetapi") || s1.startsWith("oleh karena itu")) {
        issues.push({
          id: "bg-sentence1-structure-tip",
          field: "background.sentences",
          level: "tip",
          message: "Kalimat pertama sebaiknya mendudukkan apa yang sudah mapan/diketahui di bidang riset Anda.",
          suggestion: "Awali dengan fakta ilmiah atau perkembangan teknologi terkini sebelum mengemukakan keterbatasannya.",
        });
      }
    }
  }

  // Rule 3 & 4: Reference counts and recency (Postgraduate & Scopus standards)
  const refs = background.references || [];

  if (refs.length < 2) {
    issues.push({
      id: "bg-refs-under-two",
      field: "background.references",
      level: "warning",
      message: `Jumlah referensi pendukung sintesis baru ${refs.length} (minimal disarankan 2 referensi).`,
      suggestion: "Tambahkan rujukan artikel jurnal dari Scopus atau Google Scholar untuk memperkuat justifikasi gap.",
    });
  }

  if (refs.length > 0 && refs.length < 5) {
    issues.push({
      id: "bg-refs-under-five",
      field: "background.references",
      level: "warning",
      message: `Jumlah referensi tertaut (${refs.length}) masih di bawah standar 5 referensi jurnal.`,
      suggestion: "Dosen penguji menyukai sintesis dari minimal 5 referensi terkini untuk memastikan keterbaruan topik.",
    });
  }

  if (refs.length > 0) {
    const recentRefs = refs.filter((r) => r.year && currentYear - r.year <= 5);
    if (recentRefs.length === 0) {
      issues.push({
        id: "bg-refs-no-recent",
        field: "background.references",
        level: "warning",
        message: "Tidak ada satu pun referensi dalam kurun waktu 5 tahun terakhir (2021–sekarang).",
        suggestion: "Sertakan artikel jurnal mutakhir (≤ 5 tahun terakhir) agar topik riset relevan dengan perkembangan keilmuan saat ini.",
      });
    }

    // Check key findings and limitations filled
    const incompleteRefs = refs.filter((r) => !(r.keyFinding || "").trim() || !(r.limitation || "").trim());
    if (incompleteRefs.length > 0) {
      issues.push({
        id: "bg-refs-incomplete-synthesis",
        field: "background.references",
        level: "warning",
        message: `Terdapat ${incompleteRefs.length} referensi yang belum dilengkapi 'Temuan Kunci' atau 'Keterbatasan'.`,
        suggestion: "Isi temuan dan keterbatasan setiap literatur agar matriks sintesis dapat terbentuk secara logis.",
      });
    }
  }

  return issues;
}
