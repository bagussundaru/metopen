import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
} from "docx";
import { Canvas } from "@/lib/types/canvas";
import { RubricCalculationResult } from "@/lib/validators/rubric-scorer";

export async function generateDocxBlob(canvas: Canvas, rubric: RubricCalculationResult): Promise<Blob> {
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };

  const borderThin = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: [
          // Kop Dokumen Resmi
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `PROGRAM PASCASARJANA ${canvas.meta.institution.toUpperCase()}`,
                bold: true,
                size: 20,
                color: "1E3A8A",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "KANVAS TOPIK TESIS (SEMINAR PROPOSAL REKAYASA)",
                bold: true,
                size: 26,
                color: "0F172A",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Program Studi: ${canvas.meta.prodi}  |  Mata Kuliah: ${canvas.meta.course}`,
                italics: true,
                size: 18,
                color: "475569",
              }),
            ],
            spacing: { after: 200 },
          }),

          // Metadata Mahasiswa Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderNone,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Nama: ", bold: true }),
                          new TextRun(canvas.meta.studentName || "-"),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: "NIM: ", bold: true }),
                          new TextRun(canvas.meta.nim || "-"),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: "Dosen: ", bold: true }),
                          new TextRun(canvas.meta.lecturer || "-"),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: "Tanggal: ", bold: true }),
                          new TextRun(dateStr),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 1. JUDUL SEMENTARA
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "1. JUDUL SEMENTARA PENELITIAN",
                bold: true,
                size: 22,
                color: "1E3A8A",
              }),
            ],
            spacing: { before: 150, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: canvas.title.composed || "Belum dirumuskan",
                bold: true,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Subjek: ", bold: true }),
              new TextRun(canvas.title.subject || "-"),
              new TextRun({ text: "  |  • Intervensi: ", bold: true }),
              new TextRun(canvas.title.intervention || "-"),
              new TextRun({ text: "  |  • Hasil Ukur: ", bold: true }),
              new TextRun(canvas.title.outcome || "-"),
            ],
            spacing: { after: 200 },
          }),

          // 2. LATAR BELAKANG & GAP
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "2. LATAR BELAKANG & GAP (MAKSIMAL 3 KALIMAT SINTESIS)",
                bold: true,
                size: 22,
                color: "1E3A8A",
              }),
            ],
            spacing: { before: 150, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. (State-of-the-Art) ", bold: true }),
              new TextRun(canvas.background.sentences[0] || "-"),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "2. (Research Gap) ", bold: true }),
              new TextRun(canvas.background.sentences[1] || "-"),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "3. (Urgensi Rekayasa) ", bold: true }),
              new TextRun(canvas.background.sentences[2] || "-"),
            ],
            spacing: { after: 150 },
          }),

          // 3. PERTANYAAN RISET UTAMA
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "3. PERTANYAAN RISET UTAMA & VARIABEL",
                bold: true,
                size: 22,
                color: "1E3A8A",
              }),
            ],
            spacing: { before: 150, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `"${canvas.researchQuestion.main || "Pertanyaan riset belum diisi"}"`,
                bold: true,
                italics: true,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Variabel Bebas: ", bold: true }),
              new TextRun(canvas.researchQuestion.variables.independent.join("; ") || "-"),
              new TextRun({ text: "\n• Variabel Terikat: ", bold: true }),
              new TextRun(canvas.researchQuestion.variables.dependent.join("; ") || "-"),
              new TextRun({ text: "\n• Indikator Terukur: ", bold: true }),
              new TextRun(canvas.researchQuestion.measurableIndicator || "-"),
            ],
            spacing: { after: 200 },
          }),

          // 4. METODE & DATA
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "4. METODE INTI & KEPASTIAN KEBUTUHAN DATA",
                bold: true,
                size: 22,
                color: "1E3A8A",
              }),
            ],
            spacing: { before: 150, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Pendekatan: ", bold: true }),
              new TextRun(canvas.method.approach.replace(/_/g, " ").toUpperCase()),
              new TextRun({ text: "  |  • Standar Pengujian: ", bold: true }),
              new TextRun(canvas.method.standards.join("; ") || "-"),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Deskripsi: ", bold: true }),
              new TextRun(canvas.method.description || "-"),
            ],
            spacing: { after: 150 },
          }),

          // Data Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderThin,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nama Data", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Sumber Data", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Estimasi Waktu", bold: true })] })] }),
                ],
              }),
              ...canvas.method.dataNeeds.map((d) => (
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(d.name)] }),
                    new TableCell({ children: [new Paragraph(d.source)] }),
                    new TableCell({ children: [new Paragraph(d.availability.toUpperCase())] }),
                    new TableCell({ children: [new Paragraph(`${d.timeEstimateWeeks || 1} minggu`)] }),
                  ],
                })
              )),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 5. VALIDASI KELAYAKAN
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "5. EVALUASI KELAYAKAN & STATUS AKADEMIK",
                bold: true,
                size: 22,
                color: "1E3A8A",
              }),
            ],
            spacing: { before: 150, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Status Kesiapan: ", bold: true }),
              new TextRun({ text: rubric.statusText, bold: true, color: "047857" }),
              new TextRun({ text: ` (Rata-rata Skor: ${rubric.averageScore} / 4.0)` }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Gap: ${rubric.scores.gapClarity}/4  |  • Novelty: ${rubric.scores.novelty}/4  |  • Relevansi: ${rubric.scores.engineeringRelevance}/4  |  • Metode: ${rubric.scores.methodFit}/4  |  • Data: ${rubric.scores.dataFeasibility}/4`,
              }),
            ],
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
