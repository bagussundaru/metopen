import { describe, it, expect } from "vitest";
import { validateMethod } from "@/lib/validators/method-validator";
import { DataNeed } from "@/lib/types/canvas";

describe("Method & Data Feasibility Validator", () => {
  it("should error if data needs table is empty", () => {
    const issues = validateMethod({
      approach: "experimental_lab",
      description: "Uji lentur empat titik",
      tools: ["UTM 500 kN"],
      standards: ["ASTM C78"],
      dataNeeds: [],
    });

    const error = issues.find((i) => i.id === "method-no-data-needs");
    expect(error).toBeDefined();
    expect(error?.level).toBe("error");
  });

  it("should warn if any data availability is 'uncertain'", () => {
    const data: Partial<DataNeed>[] = [
      {
        id: "1",
        name: "Data pengujian seismik tanah",
        kind: "secondary",
        source: "BMKG",
        availability: "uncertain",
      },
    ];

    const issues = validateMethod({
      approach: "field_study",
      description: "Pengukuran mikrotremor",
      tools: ["Seismometer"],
      standards: ["SNI 1726"],
      dataNeeds: data,
    });

    const uncertainWarn = issues.find((i) => i.id.includes("method-data-uncertain"));
    expect(uncertainWarn).toBeDefined();
    expect(uncertainWarn?.level).toBe("warning");
  });

  it("should warn if data 'requires_permission' without access evidence", () => {
    const data: Partial<DataNeed>[] = [
      {
        id: "2",
        name: "Hasil uji beban jembatan tol",
        kind: "secondary",
        source: "Kementerian PUPR",
        availability: "requires_permission",
        accessEvidence: "",
      },
    ];

    const issues = validateMethod({
      approach: "field_study",
      description: "Inspeksi jembatan",
      tools: ["Strain gauge"],
      standards: ["SNI 2833"],
      dataNeeds: data,
    });

    const permWarn = issues.find((i) => i.id.includes("method-data-permission-no-evidence"));
    expect(permWarn).toBeDefined();
  });

  it("should warn if data 'must_generate' lacks estimated size/samples", () => {
    const data: Partial<DataNeed>[] = [
      {
        id: "3",
        name: "Benda uji balok geopolimer",
        kind: "primary",
        source: "Laboratorium FT UNY",
        availability: "must_generate",
        estimatedSize: "",
      },
    ];

    const issues = validateMethod({
      approach: "experimental_lab",
      description: "Pembuatan benda uji balok",
      tools: ["Cetakan balok"],
      standards: ["ASTM C78"],
      dataNeeds: data,
    });

    const sizeWarn = issues.find((i) => i.id.includes("method-data-generate-no-size"));
    expect(sizeWarn).toBeDefined();
  });

  it("should warn if total data collection time exceeds 24 weeks", () => {
    const data: Partial<DataNeed>[] = [
      { id: "1", name: "Pengujian fasa 1", kind: "primary", source: "Lab", availability: "available", timeEstimateWeeks: 14 },
      { id: "2", name: "Pengujian fasa 2", kind: "primary", source: "Lab", availability: "available", timeEstimateWeeks: 12 },
    ];

    const issues = validateMethod({
      approach: "experimental_lab",
      description: "Pengujian bertahap",
      tools: ["UTM"],
      standards: ["ASTM C39"],
      dataNeeds: data,
    });

    const durationWarn = issues.find((i) => i.id === "method-duration-exceeded");
    expect(durationWarn).toBeDefined();
    expect(durationWarn?.message).toContain("26 minggu");
  });

  it("should warn if experimental approach lacks test standards", () => {
    const data: Partial<DataNeed>[] = [
      { id: "1", name: "Uji tekan silinder", kind: "primary", source: "Lab FT UNY", availability: "available", timeEstimateWeeks: 4 },
    ];

    const issues = validateMethod({
      approach: "experimental_lab",
      description: "Pengujian tekan di laboratorium",
      tools: ["Compression Machine"],
      standards: [],
      dataNeeds: data,
    });

    const stdWarn = issues.find((i) => i.id === "method-experimental-missing-standards");
    expect(stdWarn).toBeDefined();
  });

  it("should warn if numerical RQ is paired with non-numerical method approach", () => {
    const data: Partial<DataNeed>[] = [
      { id: "1", name: "Data pemodelan", kind: "primary", source: "Lab", availability: "available", timeEstimateWeeks: 2 },
    ];

    const issues = validateMethod(
      {
        approach: "field_study",
        description: "Survei lapangan",
        tools: ["GPS"],
        standards: ["SNI"],
        dataNeeds: data,
      },
      "numerical"
    );

    const mismatchWarn = issues.find((i) => i.id === "method-rq-approach-mismatch");
    expect(mismatchWarn).toBeDefined();
  });
});
