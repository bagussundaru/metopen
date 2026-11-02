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
import { AiSuggestTitleRequestSchema, AiSuggestTitleResponseSchema } from "@/lib/schemas/ai.schema";

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY_NOT_CONFIGURED",
        message: "Fitur AI belum dikonfigurasi di server. Silakan susun judul secara mandiri.",
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
    const validatedData = AiSuggestTitleRequestSchema.parse(body);

    const client = getGeminiClient();
    const model = getGeminiModel();

    const userPrompt = `
Bantu mahasiswa S2 Teknik Sipil/Rekayasa mempertajam draf judul tesisnya.
Judul tesis rekayasa harus mematuhi formula baku:
[Subjek Material/Elemen] + [Intervensi/Perlakuan] + [Hasil Ukur & Besaran Terukur] + [Konteks Lingkungan/Beban].
Panjang judul ideal: 10 - 25 kata. Hindari kata kabur seperti "Analisis", "Studi Pengaruh", "Tinjauan".

Draf saat ini:
- Subjek: ${validatedData.subject}
- Intervensi: ${validatedData.intervention}
- Hasil Ukur: ${validatedData.outcome}
- Konteks: ${validatedData.context || "(tidak ada)"}
- Judul Tersusun Saat Ini: ${validatedData.currentComposed || "-"}

TUGAS:
Hasilkan 3 variasi judul tesis yang akademis, tajam, ringkas, dan taat struktur.
Uraikan kembali komponen Subjek, Intervensi, Hasil Ukur, dan Konteks untuk tiap variasi.

FORMAT OUTPUT HARUS JSON VALID:
{
  "suggestions": [
    {
      "title": "Judul lengkap yang disarankan",
      "subject": "subjek material",
      "intervention": "perlakuan",
      "outcome": "hasil ukur",
      "context": "konteks (opsional)",
      "reason": "Alasan perbaikan kejelasan & terminologi akademis"
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
    const validatedOutput = AiSuggestTitleResponseSchema.parse(parsedJson);

    return NextResponse.json(validatedOutput);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memproses saran judul.";
    return NextResponse.json({ error: "AI_PROCESSING_ERROR", message: errorMsg }, { status: 500 });
  }
}
