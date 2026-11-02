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
import { AiSharpenGapRequestSchema, AiSharpenGapResponseSchema } from "@/lib/schemas/ai.schema";

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY_NOT_CONFIGURED",
        message: "Fitur AI belum dikonfigurasi di server. Silakan susun latar belakang secara mandiri.",
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
    const validatedData = AiSharpenGapRequestSchema.parse(body);

    const client = getGeminiClient();
    const model = getGeminiModel();

    const refList = validatedData.references.length > 0
      ? validatedData.references.map((r, i) => `${i + 1}. ${r.authors} (${r.year}): "${r.title}". Temuan Kunci: ${r.keyFinding}. Keterbatasan: ${r.limitation}`).join("\n")
      : "(Tidak ada referensi terlampir dari mahasiswa)";

    const userPrompt = `
Bantu mahasiswa S2 Teknik Sipil/Rekayasa menyintesis Latar Belakang & Research Gap menjadi TEPAT 3 KALIMAT tajam.

ATURAN STRUKTUR 3 KALIMAT:
- Kalimat 1: Status Terkini / Konsensus Literatur (Apa yang sudah berhasil dibuktikan/diketahui dari referensi).
- Kalimat 2: Research Gap & Keterbatasan (Apa celah kritis, kontradiksi, atau parameter yang BELUM diinvestigasi. Wajib memuat kata penanda gap seperti "namun", "belum", "masih terbatas", "kurang dipahami").
- Kalimat 3: Urgensi Rekayasa & Solusi yang Ditawarkan (Mengapa masalah ini krusial diatasi dan kontribusi penelitian ini).

PERINGATAN STRICT ZERO-HALLUCINATION:
HANYA gunakan nama penulis/tahun dari daftar referensi di bawah ini. DILARANG membuat atau menyebutkan nama penulis atau jurnal fiktif lain!

Topik Tesis: ${validatedData.topic}
Draf Kalimat Saat Ini:
${validatedData.currentSentences.filter(Boolean).map((s, i) => `[Kalimat ${i + 1}] ${s}`).join("\n")}

Daftar Literatur dari Mahasiswa:
${refList}

${validatedData.pinnedFindings?.length ? `Temuan dari Peta Bibliometrik:\n${validatedData.pinnedFindings.join("\n")}` : ""}

FORMAT OUTPUT HARUS JSON VALID:
{
  "sentences": [
    "Kalimat 1 (status literatur)",
    "Kalimat 2 (research gap tajam dengan penanda gap)",
    "Kalimat 3 (urgensi rekayasa)"
  ],
  "gapKeywordsUsed": ["kata penanda gap yang dipakai"],
  "synthesisRationale": "Penjelasan mengapa sintesis ini kuat dan logis secara akademis"
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
    const validatedOutput = AiSharpenGapResponseSchema.parse(parsedJson);

    return NextResponse.json(validatedOutput);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menyintesis latar belakang.";
    return NextResponse.json({ error: "AI_PROCESSING_ERROR", message: errorMsg }, { status: 500 });
  }
}
