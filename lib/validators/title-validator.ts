import { Canvas, ValidationIssue } from "@/lib/types/canvas";

export const MEASURABLE_KEYWORDS = [
  // Civil & Structural Parameters
  "kuat",
  "tegangan",
  "regangan",
  "lendutan",
  "debit",
  "kapasitas",
  "settlement",
  "penurunan",
  "kelelahan",
  "fatigue",
  "permeabilitas",
  "daktilitas",
  "momen",
  "torsi",
  "modulus",
  "porositas",
  "viskositas",
  "kecepatan",
  "percepatan",
  "faktor keamanan",
  "daya dukung",
  "geser",
  "adhesi",
  "lekatan",
  "penetrasi",
  "retak",
  "deformasi",
  "kekakuan",
  "stabilitas",
  "durabilitas",
  "biaya",
  "durasi",
  "akurasi",
  "efisiensi",
  // Technical Units
  "mpa",
  "kpa",
  "kn",
  "kn.m",
  "mm",
  "cm",
  "m",
  "m³/s",
  "m3/s",
  "%",
  "kg",
  "ton",
  "persen",
  "detik",
  "jam",
];

export const VAGUE_WORDS = ["analisis", "studi", "tinjauan", "pengaruh", "kajian", "evaluasi"];

export function validateTitle(title: Partial<Canvas["title"]>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const subject = (title.subject || "").trim();
  const intervention = (title.intervention || "").trim();
  const outcome = (title.outcome || "").trim();
  const context = (title.context || "").trim();
  const composed = (title.composed || "").trim();

  // Rule 1: Mandatory core components
  if (!subject) {
    issues.push({
      id: "title-missing-subject",
      field: "title.subject",
      level: "error",
      message: "Subjek/Objek penelitian belum diisi.",
      suggestion: "Tuliskan material atau komponen struktur yang diteliti, misal: 'balok beton bertulang mutu tinggi' atau 'tanah lempung ekspansif'.",
    });
  }

  if (!intervention) {
    issues.push({
      id: "title-missing-intervention",
      field: "title.intervention",
      level: "error",
      message: "Intervensi / Variabel Bebas belum diisi.",
      suggestion: "Tuliskan perlakuan atau substitusi yang diberikan, misal: 'substitusi 15-30% fly ash tipe F teraktivasi alkali' atau 'stabilisasi semen 6%'.",
    });
  }

  if (!outcome) {
    issues.push({
      id: "title-missing-outcome",
      field: "title.outcome",
      level: "error",
      message: "Hasil Ukur belum diisi.",
      suggestion: "Tuliskan parameter terukur beserta satuannya, misal: 'kuat lentur (MPa) dan lendutan (mm)'.",
    });
  }

  // Rule 2: Measurable keyword check in outcome
  if (outcome) {
    const outcomeLower = outcome.toLowerCase();
    const hasMeasurableKeyword = MEASURABLE_KEYWORDS.some((kw) => {
      // Word boundary match or exact unit symbol match
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, "i");
      return regex.test(outcomeLower);
    });

    if (!hasMeasurableKeyword) {
      issues.push({
        id: "title-outcome-not-measurable",
        field: "title.outcome",
        level: "warning",
        message: "Komponen Hasil Ukur belum memuat besaran fisik atau satuan terukur yang jelas.",
        suggestion: "Sertakan besaran kuantitatif seperti 'kuat lentur (MPa)', 'lendutan (mm)', 'debit (m³/s)', atau 'daya dukung (kN)'.",
      });
    }
  }

  // Rule 3: Word count on composed title
  const composedTitle = (composed || `${subject} ${intervention} ${outcome} ${context}`).trim();
  if (composedTitle) {
    const words = composedTitle.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (wordCount < 8) {
      issues.push({
        id: "title-too-short",
        field: "title.composed",
        level: "warning",
        message: `Judul terlalu singkat (${wordCount} kata, disarankan minimal 8 kata).`,
        suggestion: "Uraikan konteks objek, variasi perlakuan, dan besaran teknis yang diuji agar tidak terlalu umum.",
      });
    } else if (wordCount > 25) {
      issues.push({
        id: "title-too-long",
        field: "title.composed",
        level: "warning",
        message: `Judul terlalu panjang (${wordCount} kata, disarankan maksimal 25 kata).`,
        suggestion: "Pangkas kata-kata keterangan yang berlebihan agar judul tetap tajam dan lugas.",
      });
    }

    // Rule 4: Vague words warning if title starts or relies heavily on them without specific parameters
    const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (VAGUE_WORDS.includes(firstWord)) {
      issues.push({
        id: "title-vague-opening",
        field: "title.composed",
        level: "warning",
        message: `Judul diawali kata kabur '${words[0]}'. Dosen penguji menyukai judul yang langsung menonjolkan parameter rekayasa.`,
        suggestion: "Pertimbangkan memulai langsung dengan parameter terukur, misal: 'Kuat Lentur dan Daktilitas...' daripada 'Analisis Kuat Lentur...'.",
      });
    }

    // Rule 5: Prefix location / software trap tip
    const locationPrefixPattern = /^(?:studi kasus|analisis pada|tinjauan pada|evaluasi pada|pada proyek|di kota|di daerah)\b/i;
    const softwarePrefixPattern = /^(?:aplikasi|pemodelan dengan|menggunakan software|berbasis sap2000|berbasis etabs|berbasis abaqus)\b/i;

    if (locationPrefixPattern.test(composedTitle)) {
      issues.push({
        id: "title-location-prefix-tip",
        field: "title.composed",
        level: "tip",
        message: "Judul diawali nama lokasi/proyek spesifik. Hati-hati dengan 'Jebakan Lokasi Baru'.",
        suggestion: "Pastikan kontribusi kebaruan ada pada mekanisme material atau pemodelan, bukan semata-mata karena proyeknya baru.",
      });
    }

    if (softwarePrefixPattern.test(composedTitle)) {
      issues.push({
        id: "title-software-prefix-tip",
        field: "title.composed",
        level: "tip",
        message: "Judul diawali nama perangkat lunak. Hati-hati dengan 'Sindrom Perangkat Lunak'.",
        suggestion: "Software hanyalah alat bantu. Tonjolkan kontribusi teori atau fenomena fisik rekayasa yang Anda teliti.",
      });
    }
  }

  return issues;
}
