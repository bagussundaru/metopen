import { describe, it, expect } from "vitest";
import { validateBackground } from "@/lib/validators/background-validator";
import { Reference } from "@/lib/types/canvas";

describe("Background & Gap Validator", () => {
  const sampleRefs: Partial<Reference>[] = [
    {
      id: "1",
      authors: "Widodo dkk.",
      year: 2023,
      title: "Geopolymer concrete properties",
      keyFinding: "Kuat tekan meningkat 20%",
      limitation: "Belum menguji elemen lentur",
    },
    {
      id: "2",
      authors: "Prasetyo & Raharjo",
      year: 2024,
      title: "Sulfate durability of fly ash",
      keyFinding: "Ketahanan kimia meningkat",
      limitation: "Hanya benda uji mortar",
    },
    {
      id: "3",
      authors: "Zhang et al.",
      year: 2022,
      title: "Reinforced beams under shear",
      keyFinding: "Daktilitas terpengaruh rasio tulangan",
      limitation: "Suhu ruangan saja",
    },
    {
      id: "4",
      authors: "Neville",
      year: 2021,
      title: "Concrete Technology",
      keyFinding: "Prinsip hidrasi semen",
      limitation: "Belum mencakup geopolimer lokal",
    },
    {
      id: "5",
      authors: "Hardjito",
      year: 2022,
      title: "Fly ash development",
      keyFinding: "Aktivasi alkali NaOH",
      limitation: "Uji silinder pasta",
    },
  ];

  it("should reject text exceeding 3 sentences with error", () => {
    const issues = validateBackground({
      sentences: [
        "Kalimat satu tentang beton.",
        "Kalimat dua tentang fly ash.",
        "Kalimat tiga tentang sulfat. Kalimat empat yang membuat lebih dari tiga kalimat.",
      ],
      references: sampleRefs,
    });

    const error = issues.find((i) => i.id === "bg-sentence-count-exceeded");
    expect(error).toBeDefined();
    expect(error?.level).toBe("error");
  });

  it("should error when background sentences are completely empty", () => {
    const issues = validateBackground({
      sentences: ["", "", ""],
      references: [],
    });

    const error = issues.find((i) => i.id === "bg-sentences-empty");
    expect(error).toBeDefined();
    expect(error?.level).toBe("error");
  });

  it("should warn when no gap keywords are present in the text", () => {
    const issues = validateBackground({
      sentences: [
        "Beton mutu tinggi banyak digunakan pada struktur jembatan.",
        "Fly ash adalah material pozzolan yang sangat ramah lingkungan.",
        "Penelitian ini merancang campuran beton mutu tinggi.",
      ],
      references: sampleRefs,
    });

    const gapWarning = issues.find((i) => i.id === "bg-missing-gap-marker");
    expect(gapWarning).toBeDefined();
    expect(gapWarning?.level).toBe("warning");
  });

  it("should pass gap marker check when gap words like 'namun masih terbatas' or 'belum ada' exist", () => {
    const issues = validateBackground({
      sentences: [
        "Beton mutu tinggi banyak digunakan pada jembatan bentang panjang.",
        "Meskipun demikian, perilaku daktilitas balok geopolimer fly ash belum pernah diuji di bawah paparan sulfat agresif.",
        "Oleh karena itu, evaluasi kapasitas lentur eksperimental diperlukan.",
      ],
      references: sampleRefs,
    });

    const gapWarning = issues.find((i) => i.id === "bg-missing-gap-marker");
    expect(gapWarning).toBeUndefined();
  });

  it("should warn when linked references are fewer than 2", () => {
    const issues = validateBackground({
      sentences: ["Beton mutu tinggi penting. Namun belum diteliti. Maka diuji sekarang."],
      references: [sampleRefs[0]],
    });

    const underTwo = issues.find((i) => i.id === "bg-refs-under-two");
    expect(underTwo).toBeDefined();
  });

  it("should warn when linked references are fewer than 5", () => {
    const issues = validateBackground({
      sentences: ["Beton mutu tinggi penting. Namun belum diteliti. Maka diuji sekarang."],
      references: [sampleRefs[0], sampleRefs[1]],
    });

    const underFive = issues.find((i) => i.id === "bg-refs-under-five");
    expect(underFive).toBeDefined();
  });

  it("should warn when there are NO recent references (<= 5 years)", () => {
    const oldRefs: Partial<Reference>[] = [
      { id: "1", authors: "Old Author", year: 2010, title: "Old Title", keyFinding: "A", limitation: "B" },
      { id: "2", authors: "Ancient Author", year: 2005, title: "Ancient Title", keyFinding: "C", limitation: "D" },
    ];

    const issues = validateBackground({
      sentences: ["Beton mutu tinggi penting. Namun belum diteliti. Maka diuji sekarang."],
      references: oldRefs,
    });

    const noRecent = issues.find((i) => i.id === "bg-refs-no-recent");
    expect(noRecent).toBeDefined();
  });

  it("should warn when references lack key findings or limitations", () => {
    const incompleteRefs: Partial<Reference>[] = [
      { id: "1", authors: "Author A", year: 2024, title: "Title A", keyFinding: "", limitation: "" },
    ];

    const issues = validateBackground({
      sentences: ["Beton mutu tinggi penting. Namun belum diteliti. Maka diuji sekarang."],
      references: incompleteRefs,
    });

    const incomplete = issues.find((i) => i.id === "bg-refs-incomplete-synthesis");
    expect(incomplete).toBeDefined();
  });
});
