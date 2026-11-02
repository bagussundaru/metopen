import { describe, it, expect } from "vitest";
import { validateMethod } from "@/lib/validators/method-validator";
import { buildMarkdownExport } from "@/lib/export/markdown-builder";
import { createCivilEngineeringExampleCanvas } from "@/lib/store/default-canvas";
import { calculateRubricScores } from "@/lib/validators/rubric-scorer";
import { Canvas } from "@/lib/types/canvas";

describe("Bibliometric Methodology Integration", () => {
  it("should validate bibliometric_slr approach without experimental errors", () => {
    const issues = validateMethod({
      approach: "bibliometric_slr",
      description: "Analisis bibliometrik tren K3 Data Center berbasis Scopus",
      tools: ["VOSviewer 1.6.20 (Visualisasi Jejaring Bibliometrik)"],
      standards: ["PRISMA 2020 Statement (Pedoman Systematic Review & Bibliometrik)"],
      dataNeeds: [
        {
          id: "1",
          name: "Dataset Metadata Scopus",
          kind: "secondary",
          source: "Scopus API",
          availability: "available",
          timeEstimateWeeks: 2,
        },
      ],
    });

    const standardsError = issues.find((i) => i.id === "method-experimental-missing-standards");
    expect(standardsError).toBeUndefined();

    const emptyDataError = issues.find((i) => i.id === "method-no-data-needs");
    expect(emptyDataError).toBeUndefined();
  });

  it("should include bibliometric protocol in markdown export when literatureMap is populated", () => {
    const baseCanvas = createCivilEngineeringExampleCanvas();
    const testCanvas: Canvas = {
      ...baseCanvas,
      literatureMap: {
        sourceType: "scopus_csv",
        nodeCount: 42,
        edgeCount: 120,
        searchQuery: "Fly Ash Geopolymer",
        booleanQuery: '("fly ash" OR "geopolymer") AND ("mechanical properties")',
        minYear: 2018,
        maxYear: 2026,
        pinnedFindings: [
          {
            id: "f1",
            type: "emerging_topic",
            label: "Carbon Curing",
            description: "Topik berkembang pesat pada beton geopolimer",
            pinnedAt: "2026-11-02",
          },
        ],
      },
    };

    const rubric = calculateRubricScores(testCanvas, []);
    const md = buildMarkdownExport(testCanvas, rubric);

    expect(md).toContain("LAMPIRAN: PROTOKOL METODE ANALISIS BIBLIOMETRIK");
    expect(md).toContain('("fly ash" OR "geopolymer") AND ("mechanical properties")');
    expect(md).toContain("42 node kata kunci");
    expect(md).toContain("Carbon Curing");
  });
});
