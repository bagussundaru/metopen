import { Canvas, ValidationIssue, DataNeed } from "@/lib/types/canvas";

export function validateMethod(
  method: {
    approach?: Canvas["method"]["approach"];
    description?: string;
    tools?: string[];
    standards?: string[];
    dataNeeds?: Partial<DataNeed>[];
  },
  rqType?: Canvas["researchQuestion"]["type"]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Rule 1: Data needs not empty
  const dataNeeds = method.dataNeeds || [];
  if (dataNeeds.length === 0) {
    issues.push({
      id: "method-no-data-needs",
      field: "method.dataNeeds",
      level: "error",
      message: "Tabel kebutuhan data masih kosong. Minimal harus ada 1 data yang dicantumkan.",
      suggestion: "Tuliskan data pengujian laboratorium atau data sekunder yang dibutuhkan (misal: kurva kuat tekan silinder atau data riwayat gempa).",
    });
  }

  // Rule 2, 3, 4: Data availability, permission evidence, must_generate estimates
  let totalWeeks = 0;

  dataNeeds.forEach((d, idx) => {
    const itemNumber = idx + 1;
    const name = (d.name || "").trim() || `Data ke-${itemNumber}`;

    if (d.availability === "uncertain") {
      issues.push({
        id: `method-data-uncertain-${d.id || idx}`,
        field: "method.dataNeeds",
        level: "warning",
        message: `Status ketersediaan '${name}' masih 'Belum Pasti (Uncertain)'.`,
        suggestion: "Pastikan kepastian akses ke laboratorium atau instansi penyedia sebelum seminar proposal untuk menghindari risiko pembatalan judul di tengah jalan.",
      });
    }

    if (d.availability === "requires_permission" && (!d.accessEvidence || !d.accessEvidence.trim())) {
      issues.push({
        id: `method-data-permission-no-evidence-${d.id || idx}`,
        field: "method.dataNeeds",
        level: "warning",
        message: `'${name}' membutuhkan izin instansi, namun bukti/kontak izin belum diisi.`,
        suggestion: "Sebutkan nama lab, narahubung teknisi, atau nomor surat izin penggunaan lab/data.",
      });
    }

    if (d.availability === "must_generate") {
      if (!d.estimatedSize || !d.estimatedSize.trim()) {
        issues.push({
          id: `method-data-generate-no-size-${d.id || idx}`,
          field: "method.dataNeeds",
          level: "warning",
          message: `'${name}' harus diproduksi/dibuat sendiri, tetapi estimasi jumlah sampel/benda uji belum diisi.`,
          suggestion: "Tuliskan jumlah benda uji yang direncanakan (misal: '36 silinder beton' atau '12 balok uji').",
        });
      }
    }

    if (d.timeEstimateWeeks && d.timeEstimateWeeks > 0) {
      totalWeeks += d.timeEstimateWeeks;
    }
  });

  // Rule 5: Total time estimate > 24 weeks (realistic S2 semester duration)
  if (totalWeeks > 24) {
    issues.push({
      id: "method-duration-exceeded",
      field: "method.dataNeeds",
      level: "warning",
      message: `Total estimasi waktu pengumpulan data mencapai ${totalWeeks} minggu (melebihi batas aman 24 minggu / 1 semester).`,
      suggestion: "Tinjau kembali beban benda uji atau lakukan pengujian secara paralel agar tesis selesai tepat waktu dalam masa studi S2.",
    });
  }

  // Rule 6: Experimental / Field approach without testing standards
  const isExperimental = method.approach === "experimental_lab" || method.approach === "field_study";
  const standardsCount = (method.standards || []).filter((s) => s.trim()).length;

  if (isExperimental && standardsCount === 0) {
    issues.push({
      id: "method-experimental-missing-standards",
      field: "method.standards",
      level: "warning",
      message: "Metode eksperimen laboratorium / lapangan wajib merujuk standar pengujian baku (SNI, ASTM, AASHTO, dll).",
      suggestion: "Pilih atau tambahkan standar uji acuan (misal: SNI 2847:2019, ASTM C39 untuk kuat tekan, atau ASTM C78 untuk kuat lentur).",
    });
  }

  // Rule 7: Alignment between RQ type and method approach
  if (rqType === "numerical" && method.approach !== "numerical_fem" && method.approach !== "simulation" && method.approach !== "mixed") {
    issues.push({
      id: "method-rq-approach-mismatch",
      field: "method.approach",
      level: "warning",
      message: "Tipe Pertanyaan Riset adalah 'Numerik', tetapi pendekatan metode yang dipilih bukan 'Simulasi / FEM Numerik'.",
      suggestion: "Selaraskan pendekatan metode dengan memilih 'Simulasi Komputasi / FEM' atau 'Metode Campuran (Mixed)'.",
    });
  } else if (rqType === "empirical" && (method.approach === "numerical_fem" || method.approach === "simulation")) {
    issues.push({
      id: "method-rq-empirical-mismatch",
      field: "method.approach",
      level: "warning",
      message: "Tipe Pertanyaan Riset adalah 'Empiris', tetapi pendekatan metode yang dipilih murni 'Simulasi Komputasi'.",
      suggestion: "Pilih 'Eksperimen Laboratorium' jika menguji benda uji fisik, atau gunakan 'Metode Campuran' jika simulasi divalidasi dengan uji lab.",
    });
  }

  return issues;
}
