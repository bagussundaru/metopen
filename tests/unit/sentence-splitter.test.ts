import { describe, it, expect } from "vitest";
import { splitSentencesIndonesian } from "@/lib/validators/sentence-splitter";

describe("Indonesian Sentence Splitter", () => {
  it("should return empty array for empty or whitespace text", () => {
    expect(splitSentencesIndonesian("")).toEqual([]);
    expect(splitSentencesIndonesian("   ")).toEqual([]);
  });

  it("should split standard Indonesian sentences accurately", () => {
    const text = "Beton mutu tinggi rentan terhadap kerapuhan. Penggunaan serat baja dapat meningkatkan daktilitas lentur. Penelitian ini menguji balok skala penuh.";
    const result = splitSentencesIndonesian(text);
    expect(result.length).toBe(3);
    expect(result[0]).toBe("Beton mutu tinggi rentan terhadap kerapuhan.");
    expect(result[1]).toBe("Penggunaan serat baja dapat meningkatkan daktilitas lentur.");
    expect(result[2]).toBe("Penelitian ini menguji balok skala penuh.");
  });

  it("should NOT split on academic citations with 'dkk.'", () => {
    const text = "Menurut Widodo dkk. perlakuan alkali meningkatkan reaktivitas fly ash. Namun pengujian lendutan belum dilakukan.";
    const result = splitSentencesIndonesian(text);
    expect(result.length).toBe(2);
    expect(result[0]).toContain("Widodo dkk.");
    expect(result[1]).toContain("Namun pengujian");
  });

  it("should NOT split on 'et al.' citations", () => {
    const text = "Studi oleh Zhang et al. memvalidasi kapasitas geser balok geopolimer. Akan tetapi pengaruh sulfat belum diuji.";
    const result = splitSentencesIndonesian(text);
    expect(result.length).toBe(2);
    expect(result[0]).toContain("Zhang et al.");
  });

  it("should NOT split on journal issue abbreviations like 'No.' or 'Vol.' or 'Hal.'", () => {
    const text = "Data dipublikasikan pada Jurnal Rekayasa Sipil Vol. 14 No. 2 Hal. 45. Metode yang digunakan adalah eksperimen.";
    const result = splitSentencesIndonesian(text);
    expect(result.length).toBe(2);
    expect(result[0]).toContain("Vol. 14 No. 2 Hal. 45.");
  });

  it("should NOT split on academic titles like 'Prof.', 'Dr.', 'Ir.'", () => {
    const text = "Disupervisi oleh Prof. Dr. Ir. Slamet Widodo di laboratorium. Seluruh pengujian mengacu SNI.";
    const result = splitSentencesIndonesian(text);
    expect(result.length).toBe(2);
    expect(result[0]).toContain("Prof. Dr. Ir. Slamet");
  });

  it("should NOT split on decimal numbers like '0.45 MPa' or '3.14'", () => {
    const text = "Faktor air semen yang digunakan adalah 0.45 dengan kuat tekan 50.5 MPa. Lendutan balok dicatat sebesar 12.3 mm.";
    const result = splitSentencesIndonesian(text);
    expect(result.length).toBe(2);
    expect(result[0]).toContain("0.45");
    expect(result[0]).toContain("50.5 MPa.");
  });

  it("should NOT split on general abbreviations like 'mis.', 'dsb.', 'dll.'", () => {
    const text = "Beberapa bahan tambahan digunakan, mis. abu terbang dan silica fume. Parameter yang diamati adalah kuat tekan.";
    const result = splitSentencesIndonesian(text);
    expect(result.length).toBe(2);
    expect(result[0]).toContain("mis.");
  });

  it("should handle exclamation and question marks", () => {
    const text = "Apakah fly ash dapat meningkatkan kuat lentur? Tentu saja dapat! Hasil uji membuktikan peningkatan 15%.";
    const result = splitSentencesIndonesian(text);
    expect(result.length).toBe(3);
    expect(result[0]).toBe("Apakah fly ash dapat meningkatkan kuat lentur?");
    expect(result[1]).toBe("Tentu saja dapat!");
    expect(result[2]).toBe("Hasil uji membuktikan peningkatan 15%.");
  });
});
