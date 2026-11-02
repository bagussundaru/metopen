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
import { AiRqVariantsRequestSchema, AiRqVariantsResponseSchema } from "@/lib/schemas/ai.schema";

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY_NOT_CONFIGURED",
        message: "Fitur AI belum dikonfigurasi di server. Silakan rumuskan pertanyaan riset secara mandiri.",
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
        message: `Batas penggunaan AI tercapai. Coba lagi dalam ${rateLimit.resetInSeconds} detik.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validatedData = AiRqVariantsRequestSchema.parse(body);

    const client = getGeminiClient();
    const model = getGeminiModel();

    const userPrompt = `
Bantu mahasiswa S2 Teknik Sipil/Rekayasa merumuskan Pertanyaan Riset Utama (Research Question/RQ).

KRITERIA RQ YANG BAIK UNTUK TESIS MAGISTER:
1. Dapat diuji secara empiris (laboratorium/lapangan) atau numerik (pemodelan elemen hingga/FEM).
2. Terhindar dari 'Jebakan Lokasi' (mis. sekadar mengulang rumus standar pada ruas jalan atau jembatan X tanpa fenomena rekayasa baru).
3. Terhindar dari 'Sindrom Software' (mis. sekadar menjalankan software komersial tanpa validasi fisik atau pemodelan konstitutif).
4. Bukan pertanyaan biner sederhana ("Apakah...") melainkan pertanyaan eksploratif terukur ("Bagaimana pengaruh...", "Sejauh mana...", "Bagaimana korelasi...").

Konteks Kanvas Mahasiswa:
- Judul Tesis: ${validatedData.title}
- Pendekatan Metode: ${validatedData.approach}
- RQ Saat Ini: ${validatedData.currentRq || "-"}
- Variabel Bebas: ${validatedData.independentVariables?.join(", ") || "-"}
- Variabel Terikat: ${validatedData.dependentVariables?.join(", ") || "-"}

TUGAS:
Hasilkan 3 variasi Research Question yang memenuhi kriteria di atas, lengkap dengan tipe riset, variabel yang disarankan, dan indikator terukurnya.

FORMAT OUTPUT HARUS JSON VALID:
{
  "variants": [
    {
      "question": "Rumusan pertanyaan riset utama",
      "type": "empirical" | "numerical" | "both",
      "suggestedIndependent": ["variabel bebas 1", "variabel bebas 2"],
      "suggestedDependent": ["variabel terikat 1", "variabel terikat 2"],
      "measurableIndicator": "Indikator kuantitatif pengujian dan kriteria keberhasilan",
      "strengths": "Keunggulan metodologis dari variasi ini"
    }
  ]
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
    const validatedOutput = AiRqVariantsResponseSchema.parse(parsedJson);

    return NextResponse.json(validatedOutput);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memproses variasi pertanyaan riset.";
    return NextResponse.json({ error: "AI_PROCESSING_ERROR", message: errorMsg }, { status: 500 });
  }
}
