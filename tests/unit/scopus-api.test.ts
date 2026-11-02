import { describe, it, expect } from "vitest";
import { buildOfficialScopusQuery, formatScopusCitation } from "@/lib/parsers/scopus-api";
import { DiscoveredArticle } from "@/lib/parsers/openalex-parser";

describe("Scopus Official Query & Citation Formatter", () => {
  it("builds official Scopus query with TITLE-ABS-KEY and DOCTYPE(ar OR re)", () => {
    const res = buildOfficialScopusQuery("fly ash geopolymer concrete", { minYear: 2020 });
    expect(res.scopusQuery).toContain("TITLE-ABS-KEY(");
    expect(res.scopusQuery).toContain("DOCTYPE(ar OR re)");
    expect(res.scopusQuery).toContain("PUBYEAR > 2019");
    expect(res.webUrl).toContain("https://www.scopus.com/results/results.uri");
  });

  it("handles boolean queries like K3 Data Center in Scopus format", () => {
    const res = buildOfficialScopusQuery("K3 Data Center");
    expect(res.scopusQuery).toContain("TITLE-ABS-KEY(");
    expect(res.scopusQuery).toContain("occupational safety");
    expect(res.scopusQuery).toContain("data center");
    expect(res.scopusQuery).toContain("DOCTYPE(ar OR re)");
  });

  it("formats academic citation matching Scopus APA 7th style", () => {
    const art: DiscoveredArticle = {
      id: "scopus-test-1",
      title: "Bibliometric Analysis and Durability Performance of Fly Ash Based Geopolymer Concrete",
      authors: "Ahmad J., Naqash M.T., Qureshi H.J.",
      year: 2026,
      journal: "Buildings",
      volume: "16",
      issue: "15",
      pages: "3051",
      doi: "10.3390/buildings16153051",
      citedByCount: 12,
      keywords: ["fly ash", "geopolymer"],
    };

    const citation = formatScopusCitation(art);
    expect(citation).toContain("Ahmad J., Naqash M.T., Qureshi H.J. (2026).");
    expect(citation).toContain("Buildings, 16(15), 3051.");
    expect(citation).toContain("https://doi.org/10.3390/buildings16153051");
  });
});
