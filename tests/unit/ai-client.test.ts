import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isAiConfigured,
  getGeminiModel,
  checkRateLimit,
  cleanAndParseJson,
} from "../../lib/ai/gemini-client";

describe("Gemini Client & Rate Limiter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("identifies when AI is configured or missing", () => {
    delete process.env.GEMINI_API_KEY;
    expect(isAiConfigured()).toBe(false);

    process.env.GEMINI_API_KEY = "test-key-123";
    expect(isAiConfigured()).toBe(true);
  });

  it("defaults model to gemini-2.5-flash if not provided", () => {
    delete process.env.GEMINI_MODEL;
    expect(getGeminiModel()).toBe("gemini-2.5-flash");

    process.env.GEMINI_MODEL = "gemini-1.5-pro";
    expect(getGeminiModel()).toBe("gemini-1.5-pro");
  });

  it("enforces in-memory rate limiting per identifier", () => {
    process.env.AI_RATE_LIMIT_PER_HOUR = "2";
    const testId = `user-${Date.now()}`;

    const res1 = checkRateLimit(testId);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = checkRateLimit(testId);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);

    const res3 = checkRateLimit(testId);
    expect(res3.allowed).toBe(false);
    expect(res3.remaining).toBe(0);
    expect(res3.resetInSeconds).toBeGreaterThan(0);
  });

  it("cleans and parses json correctly from plain and markdown formatted responses", () => {
    const rawPlain = '{"name": "test", "value": 42}';
    expect(cleanAndParseJson(rawPlain)).toEqual({ name: "test", value: 42 });

    const rawMarkdown = '```json\n{"name": "test2", "value": 99}\n```';
    expect(cleanAndParseJson(rawMarkdown)).toEqual({ name: "test2", value: 99 });
  });
});
