import { GoogleGenAI } from "@google/genai";

// Rate limiting in-memory store
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function isAiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return typeof key === "string" && key.trim().length > 0;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

export function checkRateLimit(identifier: string = "default"): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const limit = parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || "30", 10);
  const windowMs = 60 * 60 * 1000; // 1 hour
  const now = Date.now();

  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetInSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export function extractClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export const STRICT_ZERO_HALLUCINATION_SYSTEM_INSTRUCTION = `
Anda adalah reviewer metodologi penelitian teknik sipil/rekayasa tingkat pascasarjana (Magister S2).
Tugas Anda adalah memandu mahasiswa menyusun kanvas topik tesis berkualitas tinggi sesuai kaidah ilmiah.

ATURAN WAJIB & STRICT ZERO-HALLUCINATION:
1. DILARANG KERAS mengarang, memalsukan, atau membuat sitasi/referensi/nama penulis/tahun/jurnal fiktif.
2. HANYA gunakan referensi dan data yang secara eksplisit diberikan oleh pengguna dalam payload.
3. Jika butuh literatur tambahan, sebutkan topiknya secara konseptual tanpa menciptakan sitasi palsu.
4. Jangan gunakan hiperbola atau pujian kosong; berikan kritik metodologis yang tajam dan konstruktif.
5. Gunakan istilah baku teknik sipil (misal: kuat tekan, kuat lentur, daktilitas, lendutan, aggregat, perlakuan alkali, dll).
6. Respon WAJIB dalam bentuk JSON murni yang sesuai skema yang diminta tanpa pembungkus markdown tambahan.
`.trim();

export function cleanAndParseJson<T>(rawText: string): T {
  let cleaned = rawText.trim();
  // Strip ```json and ``` if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "").trim();
  }
  return JSON.parse(cleaned) as T;
}
