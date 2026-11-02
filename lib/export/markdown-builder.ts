import { Canvas } from "@/lib/types/canvas";
import { RubricCalculationResult } from "@/lib/validators/rubric-scorer";

export function buildMarkdownExport(canvas: Canvas, rubric: RubricCalculationResult): string {
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const md = `# KANVAS TOPIK TESIS (SEMINAR PROPOSAL)
**Program Pascasarjana ${canvas.meta.institution}**  
*Mata Kuliah: ${canvas.meta.course}*

---

### IDENTITAS MAHASISWA
- **Nama Mahasiswa:** ${canvas.meta.studentName || "-"}
- **NIM:** ${canvas.meta.nim || "-"}
- **Program Studi:** ${canvas.meta.prodi}
- **Dosen Pembimbing/Pengampu:** ${canvas.meta.lecturer || "-"}
- **Tanggal Penyusunan:** ${dateStr}

---

## 1. JUDUL SEMENTARA PENELITIAN
**${canvas.title.composed || "Judul belum dirumuskan"}**

| Komponen Wajib | Uraian Parameter |
| :--- | :--- |
| **Subjek / Objek Material** | ${canvas.title.subject || "-"} |
| **Intervensi / Variabel Bebas** | ${canvas.title.intervention || "-"} |
| **Hasil Ukur & Satuan** | ${canvas.title.outcome || "-"} |
| **Konteks / Batasan** | ${canvas.title.context || "-"} |

---

## 2. LATAR BELAKANG & RESEARCH GAP (MAKSIMAL 3 KALIMAT)
1. **State-of-the-Art (Apa yang sudah diketahui):**  
   ${canvas.background.sentences[0] || "-"}
2. **Research Gap (Celah / Keterbatasan yang belum terjawab):**  
   ${canvas.background.sentences[1] || "-"}
3. **Urgensi Rekayasa (Mengapa penelitian penting):**  
   ${canvas.background.sentences[2] || "-"}

### Daftar Literatur Pendukung Sintesis:
${canvas.background.references.length === 0 ? "_Belum ada referensi terdaftar._" : canvas.background.references.map((r, i) => `${i + 1}. **${r.authors} (${r.year})**. *${r.title}*. ${r.source || ""}. [Indeks: ${r.indexSource.toUpperCase()}]
   - *Temuan Kunci:* ${r.keyFinding}
   - *Keterbatasan/Gap:* ${r.limitation}`).join("\n\n")}

---

## 3. PERTANYAAN RISET UTAMA (RESEARCH QUESTION)
> **"${canvas.researchQuestion.main || "Pertanyaan belum dirumuskan"}"**

- **Tipe Penelitian:** ${canvas.researchQuestion.type === "empirical" ? "Empiris (Eksperimen Lab/Lapangan)" : canvas.researchQuestion.type === "numerical" ? "Numerik (Simulasi Komputasi/FEM)" : "Campuran (Eksperimen + Numerik)"}
- **Variabel Bebas:** ${canvas.researchQuestion.variables.independent.join("; ") || "-"}
- **Variabel Terikat:** ${canvas.researchQuestion.variables.dependent.join("; ") || "-"}
- **Variabel Kontrol:** ${canvas.researchQuestion.variables.controlled.join("; ") || "-"}
- **Indikator Terukur & Kriteria Jawaban:** ${canvas.researchQuestion.measurableIndicator || "-"}
- **Hipotesis:** ${canvas.researchQuestion.hypothesis || "-"}

### Checklist Evaluasi Novelty Semu:
- [${canvas.researchQuestion.checklist?.notJustLocation ? "x" : " "}] Kontribusi riset bukan sekadar karena ganti lokasi/proyek baru
- [${canvas.researchQuestion.checklist?.notJustSoftware ? "x" : " "}] Kontribusi riset bukan sekadar karena memakai software baru
- [${canvas.researchQuestion.checklist?.measurableVariables ? "x" : " "}] Variabel terukur secara objektif dengan prosedur baku
- [${canvas.researchQuestion.checklist?.hasDecisionThreshold ? "x" : " "}] Memiliki kriteria atau ambang batas jawaban yang terukur
- [${canvas.researchQuestion.checklist?.feasibleInStudyTime ? "x" : " "}] Beban pengujian realistis tuntas dalam masa studi S2

---

## 4. METODE INTI & KEBUTUHAN DATA
- **Pendekatan:** ${canvas.method.approach.replace(/_/g, " ").toUpperCase()}
- **Deskripsi Prosedur:** ${canvas.method.description || "-"}
- **Standar Pengujian Baku:** ${canvas.method.standards.join("; ") || "-"}
- **Peralatan Lab & Software:** ${canvas.method.tools.join("; ") || "-"}

### Tabel Kepastian Kebutuhan Data:
| Nama Data | Jenis | Sumber & Bukti Izin | Jumlah Benda Uji | Ketersediaan | Waktu |
| :--- | :--- | :--- | :--- | :--- | :--- |
${canvas.method.dataNeeds.length === 0 ? "| - | - | - | - | - | - |" : canvas.method.dataNeeds.map((d) => `| ${d.name} | ${d.kind === "primary" ? "Primer" : "Sekunder"} | ${d.source} ${d.accessEvidence ? `(${d.accessEvidence})` : ""} | ${d.estimatedSize || "-"} | **${d.availability.toUpperCase()}** | ${d.timeEstimateWeeks || 1} minggu |`).join("\n")}

---

## 5. VALIDASI KELAYAKAN & STATUS AKADEMIK
- **Status Kesiapan:** **${rubric.statusText.toUpperCase()}**
- **Rata-rata Skor Rubrik:** **${rubric.averageScore} / 4.0**

| Kriteria Evaluasi Dosen | Skor Diri (1-4) | Skor Otomatis (1-4) | Penjelasan Sistem |
| :--- | :---: | :---: | :--- |
| **1. Kejelasan Gap** | ${canvas.feasibility.selfScores.gapClarity} | ${rubric.scores.gapClarity} | ${rubric.explanations.gapClarity} |
| **2. Kebaruan (Novelty)** | ${canvas.feasibility.selfScores.novelty} | ${rubric.scores.novelty} | ${rubric.explanations.novelty} |
| **3. Relevansi Rekayasa** | ${canvas.feasibility.selfScores.engineeringRelevance} | ${rubric.scores.engineeringRelevance} | ${rubric.explanations.engineeringRelevance} |
| **4. Ketepatan Metode** | ${canvas.feasibility.selfScores.methodFit} | ${rubric.scores.methodFit} | ${rubric.explanations.methodFit} |
| **5. Kelayakan Data** | ${canvas.feasibility.selfScores.dataFeasibility} | ${rubric.scores.dataFeasibility} | ${rubric.explanations.dataFeasibility} |

### Catatan Asistensi Dosen Pembimbing:
_${canvas.feasibility.notes || "Belum ada catatan khusus."}_

---
*Dihasilkan secara otomatis oleh Aplikasi Kanvas Tesis S2 Rekayasa (Acuan UNY & Scopus)*
`;

  return md;
}
