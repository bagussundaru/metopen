import { NextResponse } from "next/server";
import {
  isAiConfigured,
  getGeminiClient,
  getGeminiModel,
  checkRateLimit,
  extractClientIp,
  STRICT_ZERO_HALLUCINATION_SYSTEM_INSTRUCTION,
  cleanAndParseJson,
} from "@/lib/ai/gemini-client";
import { AiReviewRequestSchema, AiReviewResponseSchema } from "@/lib/schemas/ai.schema";

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY_NOT_CONFIGURED",
        message: "Fitur AI belum dikonfigurasi di server. Silakan gunakan mode evaluasi rule-based.",
      },
      { status: 503 }
    );
  }

  const clientIp = extractClientIp(req);
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMIT_EXCEEDED",
        message: `Batas penggunaan AI tercapai (${process.env.AI_RATE_LIMIT_PER_HOUR || 30} req/jam). Coba lagi dalam ${rateLimit.resetInSeconds} detik.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validatedData = AiReviewRequestSchema.parse(body);

    const client = getGeminiClient();
    const model = getGeminiModel();

    const userPrompt = `
Lakukan evaluasi metodologi penelitian tesis Magister (S2) Teknik Sipil/Rekayasa untuk kanvas berikut:

--- KANVAS MAHASISWA ---
1. JUDUL:
- Subjek: ${validatedData.title.subject}
- Intervensi: ${validatedData.title.intervention}
- Hasil Ukur: ${validatedData.title.outcome}
- Konteks: ${validatedData.title.context || "-"}
- Judul Final: ${validatedData.title.composed}

2. LATAR BELAKANG & RESEARCH GAP (Maksimal 3 Kalimat):
${validatedData.background.sentences.filter(Boolean).map((s, idx) => `[Kalimat ${idx + 1}] ${s}`).join("\n")}

REFERENSI PENELITIAN YANG DILAMPIRKAN MAHASISWA (${validatedData.background.references.length} buah):
${validatedData.background.references.length > 0 
  ? validatedData.background.references.map((r, i) => `${i + 1}. ${r.authors} (${r.year}). "${r.title}". Temuan Kunci: ${r.keyFinding}. Batasan: ${r.limitation}`).join("\n")
  : "(Belum ada referensi yang dilampirkan)"
}

3. PERTANYAAN RISET (RQ):
- Pertanyaan: ${validatedData.researchQuestion.main}
- Tipe Riset: ${validatedData.researchQuestion.type}
- Variabel Bebas: ${validatedData.researchQuestion.variables.independent.join(", ") || "-"}
- Variabel Terikat: ${validatedData.researchQuestion.variables.dependent.join(", ") || "-"}
- Variabel Kontrol: ${validatedData.researchQuestion.variables.controlled.join(", ") || "-"}
- Indikator Terukur: ${validatedData.researchQuestion.measurableIndicator}
- Hipotesis: ${validatedData.researchQuestion.hypothesis || "-"}

4. METODE & DATA:
- Pendekatan: ${validatedData.method.approach}
- Deskripsi: ${validatedData.method.description}
- Alat Lab/Software: ${validatedData.method.tools.join(", ") || "-"}
- Standar Acuan: ${validatedData.method.standards.join(", ") || "-"}
- Kebutuhan Data:
${validatedData.method.dataNeeds.map((d, i) => `  ${i + 1}. [${d.kind}] ${d.name} (Sumber: ${d.source}, Ketersediaan: ${d.availability}, Ukuran: ${d.estimatedSize || "-"}, Estimasi: ${d.timeEstimateWeeks || "-"} minggu)`).join("\n")}

${validatedData.literatureMapFindings?.length ? `5. TEMUAN PETA BIBLIOMETRIK:\n${validatedData.literatureMapFindings.join("\n")}` : ""}

--- TUGAS REVIEWER ---
Evaluasi 5 kriteria rubrik kelayakan tesis (skor bilangan bulat 1 s.d 4):
1. gapClarity (Kejelasan gap dari sintesis literatur)
2. novelty (Kebaruan ilmiah terhindar dari jebakan lokasi/software)
3. engineeringRelevance (Relevansi terhadap problem rekayasa sipil)
4. methodFit (Kesesuaian metode pengujian & standar)
5. dataFeasibility (Kelayakan pengadaan data dalam batas waktu tesis)

Output JSON murni:
{
  "scores": {
    "gapClarity": 1 | 2 | 3 | 4,
    "novelty": 1 | 2 | 3 | 4,
    "engineeringRelevance": 1 | 2 | 3 | 4,
    "methodFit": 1 | 2 | 3 | 4,
    "dataFeasibility": 1 | 2 | 3 | 4
  },
  "scoreReasons": {
    "gapClarity": "penjelasan...",
    "novelty": "penjelasan...",
    "engineeringRelevance": "penjelasan...",
    "methodFit": "penjelasan...",
    "dataFeasibility": "penjelasan..."
  },
  "weaknesses": ["kelemahan konkret 1", "kelemahan konkret 2", "kelemahan konkret 3"],
  "suggestions": ["saran aksi 1", "saran aksi 2", "saran aksi 3"],
  "noveltyTrapDetected": boolean,
  "noveltyTrapEvidence": "kutipan kalimat yang mengindikasikan novelty semu atau string kosong jika aman",
  "reviewedAt": "${new Date().toISOString()}"
}
`;

    const response = await client.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: STRICT_ZERO_HALLUCINATION_SYSTEM_INSTRUCTION + "\n\n" + userPrompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const parsedJson = cleanAndParseJson<unknown>(responseText);
    const validatedOutput = AiReviewResponseSchema.parse(parsedJson);

    return NextResponse.json(validatedOutput);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan internal pada layanan AI.";
    return NextResponse.json({ error: "AI_PROCESSING_ERROR", message: errorMsg }, { status: 500 });
  }
}
