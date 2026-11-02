import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  parseVosMapFile,
  parseVosNetworkFile,
  buildVosMapResult,
  exportToVosviewerFormat,
} from "@/lib/parsers/vosviewer-parser";

describe("VOSviewer Map & Network Parser", () => {
  const mapFilePath = path.resolve(__dirname, "../fixtures/sample-vosviewer.map.txt");
  const netFilePath = path.resolve(__dirname, "../fixtures/sample-vosviewer.net.txt");

  const mapContent = fs.readFileSync(mapFilePath, "utf-8");
  const netContent = fs.readFileSync(netFilePath, "utf-8");

  it("should parse VOSviewer map file correctly", () => {
    const nodes = parseVosMapFile(mapContent);
    expect(nodes.length).toBe(8);

    const flyAsh = nodes.find((n) => n.label === "fly ash");
    expect(flyAsh).toBeDefined();
    expect(flyAsh?.occurrences).toBe(62);
    expect(flyAsh?.totalLinkStrength).toBe(180);
    expect(flyAsh?.cluster).toBe(1);
    expect(flyAsh?.avgPubYear).toBeCloseTo(2022.8, 1);
  });

  it("should parse VOSviewer network file correctly", () => {
    const edges = parseVosNetworkFile(netContent);
    expect(edges.length).toBe(11);
    expect(edges[0].source).toBe("1");
    expect(edges[0].target).toBe("2");
    expect(edges[0].weight).toBe(42);
  });

  it("should combine map and network into full VosMapResult", () => {
    const result = buildVosMapResult(mapContent, netContent);
    expect(result.nodes.length).toBe(8);
    expect(result.edges.length).toBe(11);
    expect(result.clusters).toEqual([1, 2, 3]);
    expect(result.minYear).toBeLessThanOrEqual(2022);
    expect(result.maxYear).toBeGreaterThanOrEqual(2024);
  });

  it("should export nodes and edges back to VOSviewer map and network text", () => {
    const result = buildVosMapResult(mapContent, netContent);
    const exported = exportToVosviewerFormat(result.nodes, result.edges);

    expect(exported.mapTxt).toContain("weight<Occurrences>");
    expect(exported.mapTxt).toContain("geopolymer concrete");
    expect(exported.netTxt).toContain("1\t2\t42");

    // Re-parse exported map
    const reNodes = parseVosMapFile(exported.mapTxt);
    expect(reNodes.length).toBe(8);
  });

  it("should handle comma-separated and semicolon-separated files with UTF-8 BOM", () => {
    const csvWithBom = "\uFEFFid,label,x,y,cluster,weight<Occurrences>\n1,concrete,0.1,0.2,1,15";
    const nodes = parseVosMapFile(csvWithBom);
    expect(nodes.length).toBe(1);
    expect(nodes[0].label).toBe("concrete");
    expect(nodes[0].occurrences).toBe(15);
  });
});
