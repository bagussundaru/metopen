import { describe, it, expect } from "vitest";
import { parseAndExpandBooleanQuery, hasExplicitBooleanOperators } from "@/lib/parsers/boolean-query";

describe("Boolean Query Parser & Expander for Academic Search", () => {
  it("detects explicit boolean operators", () => {
    expect(hasExplicitBooleanOperators('"K3" AND "Data Center"')).toBe(true);
    expect(hasExplicitBooleanOperators("fly ash OR slag")).toBe(true);
    expect(hasExplicitBooleanOperators("concrete NOT asphalt")).toBe(true);
    expect(hasExplicitBooleanOperators("(safety AND construction)")).toBe(true);
    expect(hasExplicitBooleanOperators("K3 Data Center")).toBe(false);
  });

  it("automatically constructs an AND intersection for multi-concept query 'K3 Data Center'", () => {
    const res = parseAndExpandBooleanQuery("K3 Data Center");
    expect(res.booleanQuery).toContain("AND");
    expect(res.booleanQuery).toContain("occupational safety");
    expect(res.booleanQuery).toContain("data center");
    expect(res.facets).toContain("K3");
    expect(res.facets).toContain("DATA CENTER");
  });

  it("handles explicit boolean query without breaking user logic", () => {
    const res = parseAndExpandBooleanQuery('"workplace safety" AND "cloud infrastructure"');
    expect(res.isExplicitBoolean).toBe(true);
    expect(res.booleanQuery).toBe('"workplace safety" AND "cloud infrastructure"');
  });

  it("expands K3 inside an explicit boolean query", () => {
    const res = parseAndExpandBooleanQuery('K3 AND "data center"');
    expect(res.booleanQuery).toContain("occupational safety");
    expect(res.booleanQuery).toContain('"data center"');
  });

  it("handles civil engineering queries like 'beton geopolimer fly ash'", () => {
    const res = parseAndExpandBooleanQuery("beton geopolimer fly ash");
    expect(res.booleanQuery).toContain("geopolymer");
    expect(res.booleanQuery).toContain("fly ash");
  });
});
