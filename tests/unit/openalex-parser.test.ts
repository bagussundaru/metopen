import { describe, it, expect } from "vitest";
import { buildNetworkFromOpenAlexWorks } from "../../lib/parsers/openalex-parser";

describe("OpenAlex Literature Parser & Direct VOSviewer Network Builder", () => {
  const mockWorks = [
    {
      id: "https://openalex.org/W1",
      title: "Fly ash based geopolymer concrete in structural beams",
      publication_year: 2023,
      cited_by_count: 45,
      doi: "https://doi.org/10.1016/j.conbuildmat.2023.01",
      primary_location: {
        source: {
          display_name: "Construction and Building Materials",
        },
      },
      authorships: [
        { author: { display_name: "Budi Santoso" } },
        { author: { display_name: "Eko Prasetyo" } },
      ],
      keywords: [
        { display_name: "fly ash", score: 0.9 },
        { display_name: "geopolymer concrete", score: 0.95 },
        { display_name: "flexural capacity", score: 0.8 },
      ],
      concepts: [
        { display_name: "Fly ash", score: 0.8, level: 2 },
        { display_name: "Ductility", score: 0.7, level: 2 },
      ],
    },
    {
      id: "https://openalex.org/W2",
      title: "Durability and sulfate resistance of alkali activated materials",
      publication_year: 2024,
      cited_by_count: 20,
      doi: "https://doi.org/10.1016/j.cemconcomp.2024.02",
      primary_location: {
        source: {
          display_name: "Cement and Concrete Composites",
        },
      },
      authorships: [
        { author: { display_name: "John Smith" } },
      ],
      keywords: [
        { display_name: "fly ash", score: 0.85 },
        { display_name: "sulfate resistance", score: 0.92 },
        { display_name: "geopolymer concrete", score: 0.88 },
      ],
      concepts: [
        { display_name: "Sulfate resistance", score: 0.9, level: 2 },
      ],
    },
  ];

  it("builds network nodes and edges from openalex works", () => {
    const result = buildNetworkFromOpenAlexWorks("geopolymer concrete", mockWorks, 1);

    expect(result.query).toBe("geopolymer concrete");
    expect(result.articles.length).toBe(2);
    expect(result.articles[0].authors).toContain("Budi Santoso");
    expect(result.articles[0].journal).toBe("Construction and Building Materials");

    expect(result.nodes.length).toBeGreaterThan(0);
    const flyAshNode = result.nodes.find((n) => n.id === "fly ash");
    expect(flyAshNode).toBeDefined();
    expect(flyAshNode?.occurrences).toBe(2);

    expect(result.edges.length).toBeGreaterThan(0);
    expect(result.minYear).toBe(2023);
    expect(result.maxYear).toBe(2024);
  });
});
