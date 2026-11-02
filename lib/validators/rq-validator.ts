import { Canvas, ValidationIssue } from "@/lib/types/canvas";

export function validateResearchQuestion(rq: Partial<Canvas["researchQuestion"]>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const mainRq = (rq.main || "").trim();

  // Rule 1: Empty check
  if (!mainRq) {
    issues.push({
      id: "rq-empty",
      field: "researchQuestion.main",
      level: "error",
      message: "Pertanyaan Riset Utama belum diisi.",
      suggestion: "Rumuskan 1 pertanyaan spesifik yang ingin dijawab melalui eksperimen atau simulasi.",
    });
    return issues;
  }

  // Rule 2: Ends with question mark
  if (!mainRq.endsWith("?")) {
    issues.push({
      id: "rq-no-question-mark",
      field: "researchQuestion.main",
      level: "error",
      message: "Pertanyaan riset harus diakhiri tanda tanya (?).",
      suggestion: "Tambahkan tanda tanya di akhir kalimat.",
    });
  }

  // Rule 3: Defined variables check
  const indepCount = (rq.variables?.independent || []).filter((v) => v.trim()).length;
  const depCount = (rq.variables?.dependent || []).filter((v) => v.trim()).length;

  if (indepCount === 0 || depCount === 0) {
    issues.push({
      id: "rq-missing-variables",
      field: "researchQuestion.variables",
      level: "error",
      message: "Variabel bebas (perlakuan) dan variabel terikat (hasil ukur) wajib didefinisikan.",
      suggestion: "Tuliskan minimal 1 variabel bebas (mis. persentase substitusi) dan 1 variabel terikat (mis. kuat lentur).",
    });
  }

  // Rule 4: Binary Yes/No question warning
  const binaryPatterns = [
    /^apakah\b/i,
    /^apakah ada pengaruh\b/i,
    /^adakah pengaruh\b/i,
    /^mungkinkah\b/i,
  ];

  if (binaryPatterns.some((pattern) => pattern.test(mainRq))) {
    issues.push({
      id: "rq-binary-pattern",
      field: "researchQuestion.main",
      level: "warning",
      message: "Pertanyaan riset berbentuk ya/tidak ('apakah berpengaruh?').",
      suggestion: "Gunakan kata tanya yang menuntut besaran kuantitatif: 'Seberapa besar pengaruh...', 'Bagaimana hubungan korelasi...', atau 'Pada rentang variasi berapa...'.",
    });
  }

  // Rule 5: Location Trap Detector ("Jebakan Lokasi Baru")
  const locationRegex = /\b(di\s+[A-Z][a-z]+|pada\s+daerah|studi\s+kasus|wilayah|kota|kabupaten|ruas\s+jalan|gedung|jembatan|bendungan)\b/i;
  if (locationRegex.test(mainRq)) {
    issues.push({
      id: "rq-location-trap",
      field: "researchQuestion.main",
      level: "warning",
      message: "Terdeteksi indikasi 'Jebakan Lokasi Baru' pada rumusan masalah.",
      suggestion: "Pertanyaan Reflektif Dosen: 'Apa yang secara ilmiah berbeda di lokasi ini (kondisi tanah lunak/ekspansif, beban gempa, material lokal)? Jadikan perbedaan karakteristik tersebut sebagai variabel bebas yang diuji, bukan sekadar menyebutkan nama tempatnya.'",
    });
  }

  // Rule 6: Software Syndrome Detector ("Sindrom Perangkat Lunak")
  const softwareRegex = /(?:menggunakan|dengan|memakai|berbasis)\s+(?:software|program|aplikasi|perangkat\s+lunak)|\b(?:sap2000|etabs|plaxis|abaqus|ansys|midas|revit)\b/i;
  if (softwareRegex.test(mainRq)) {
    issues.push({
      id: "rq-software-syndrome",
      field: "researchQuestion.main",
      level: "warning",
      message: "Terdeteksi indikasi 'Sindrom Perangkat Lunak' pada rumusan masalah.",
      suggestion: "Pertanyaan Reflektif Dosen: 'Jika software tersebut diganti dengan software sejenis lainnya, apakah temuan Anda tetap memberikan sumbangan ilmiah bagi bidang rekayasa sipil? Fokuskan pertanyaan pada fenomena fisik rekayasa yang disimulasikan.'",
    });
  }

  // Rule 7: Measurable indicator check
  if (!(rq.measurableIndicator || "").trim()) {
    issues.push({
      id: "rq-missing-measurable-indicator",
      field: "researchQuestion.measurableIndicator",
      level: "warning",
      message: "Indikator Terukur & Kriteria Jawaban belum ditentukan.",
      suggestion: "Jelaskan dengan apa pertanyaan ini dianggap tuntas terjawab (mis. deviasi hasil simulasi < 10% terhadap uji lab, atau peningkatan kuat lentur minimal 15%).",
    });
  }

  // Rule 8: 5-Point Checklist check
  const checklist = rq.checklist || {
    notJustLocation: false,
    notJustSoftware: false,
    measurableVariables: false,
    hasDecisionThreshold: false,
    feasibleInStudyTime: false,
  };

  const uncheckedItems: string[] = [];
  if (!checklist.notJustLocation) uncheckedItems.push("Bukan sekadar lokasi baru");
  if (!checklist.notJustSoftware) uncheckedItems.push("Bukan sekadar software baru");
  if (!checklist.measurableVariables) uncheckedItems.push("Variabel terukur secara objektif");
  if (!checklist.hasDecisionThreshold) uncheckedItems.push("Memiliki ambang/kriteria keputusan");
  if (!checklist.feasibleInStudyTime) uncheckedItems.push("Dapat tuntas dalam durasi studi S2");

  if (uncheckedItems.length > 0) {
    issues.push({
      id: "rq-checklist-incomplete",
      field: "researchQuestion.checklist",
      level: "tip",
      message: `Masih ada ${uncheckedItems.length} butir checklist reflektif yang belum Anda centang.`,
      suggestion: `Tinjau dan centang butir: ${uncheckedItems.join(", ")}.`,
    });
  }

  return issues;
}
