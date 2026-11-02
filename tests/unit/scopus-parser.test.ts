import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  parseScopusOrPopCsv,
  buildCooccurrenceGraph,
  convertParsedArticleToReference,
} from "@/lib/parsers/scopus-parser";

describe("Scopus & Google Scholar CSV Parser", () => {
  const csvFilePath = path.resolve(__dirname, "../fixtures/sample-scopus.csv");
  const csvContent = fs.readFileSync(csvFilePath, "utf-8");

  it("should parse articles and extract normalized keywords", () => {
    const articles = parseScopusOrPopCsv(csvContent);
    expect(articles.length).toBe(4);

    const first = articles[0];
    expect(first.authors).toContain("Widodo");
    expect(first.year).toBe(2024);
    expect(first.keywords).toContain("geopolymer concrete");
    expect(first.keywords).toContain("fly ash");
    expect(first.keywords).toContain("flexural capacity");
  });

  it("should build co-occurrence network graph with Louvain clustering", () => {
    const articles = parseScopusOrPopCsv(csvContent);
    const graphResult = buildCooccurrenceGraph(articles, {
      minOccurrences: 1,
      minLinkStrength: 1,
    });

    expect(graphResult.nodes.length).toBeGreaterThan(0);
    expect(graphResult.edges.length).toBeGreaterThan(0);

    const flyAshNode = graphResult.nodes.find((n) => n.id === "fly ash");
    expect(flyAshNode).toBeDefined();
    expect(flyAshNode?.occurrences).toBeGreaterThanOrEqual(3);
    expect(graphResult.clusters.length).toBeGreaterThanOrEqual(1);
  });

  it("should convert parsed article into a Canvas Reference", () => {
    const articles = parseScopusOrPopCsv(csvContent);
    const ref = convertParsedArticleToReference(articles[0]);

    expect(ref.title).toBe(articles[0].title);
    expect(ref.authors).toBe(articles[0].authors);
    expect(ref.indexSource).toBe("scopus");
    expect(ref.keyFinding).toContain("geopolymer concrete");
    expect(ref.limitation).toBeDefined();
  });
});
