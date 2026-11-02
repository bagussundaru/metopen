import { describe, it, expect } from "vitest";
import { validateTitle } from "@/lib/validators/title-validator";

describe("Title Validator", () => {
  it("should trigger error when subject, intervention, or outcome is empty", () => {
    const issues = validateTitle({
      subject: "",
      intervention: "",
      outcome: "",
      composed: "",
    });

    const errorIds = issues.filter((i) => i.level === "error").map((i) => i.id);
    expect(errorIds).toContain("title-missing-subject");
    expect(errorIds).toContain("title-missing-intervention");
    expect(errorIds).toContain("title-missing-outcome");
  });

  it("should warn when outcome does not contain measurable keywords or units", () => {
    const issues = validateTitle({
      subject: "balok beton bertulang",
      intervention: "penambahan serat bambu",
      outcome: "kinerja struktur dan keindahan tampak",
      composed: "Kinerja Struktur Balok Beton Bertulang dengan Penambahan Serat Bambu",
    });

    const warning = issues.find((i) => i.id === "title-outcome-not-measurable");
    expect(warning).toBeDefined();
    expect(warning?.level).toBe("warning");
  });

  it("should pass measurable check when outcome contains physical engineering parameter or unit", () => {
    const issues = validateTitle({
      subject: "balok beton bertulang",
      intervention: "substitusi 20% fly ash",
      outcome: "kuat lentur (MPa) dan lendutan (mm)",
      composed: "Kuat Lentur dan Lendutan Balok Beton Bertulang dengan Substitusi 20% Fly Ash",
    });

    const measurableWarning = issues.find((i) => i.id === "title-outcome-not-measurable");
    expect(measurableWarning).toBeUndefined();
  });

  it("should warn when composed title has fewer than 8 words", () => {
    const issues = validateTitle({
      subject: "balok beton",
      intervention: "fly ash",
      outcome: "kuat lentur MPa",
      composed: "Kuat Lentur Balok Beton Fly Ash",
    });

    const shortWarning = issues.find((i) => i.id === "title-too-short");
    expect(shortWarning).toBeDefined();
  });

  it("should warn when composed title has more than 25 words", () => {
    const longTitle = "Analisis Pengujian Kapasitas Lentur Balok Beton Bertulang Mutu Tinggi Berpenampang Persegi Dengan Variasi Penambahan Serat Polipropilena Terhadap Beban Siklik Monotonik Berulang Pada Kondisi Basah Di Bawah Standar Pengujian Laboratorium Teknik Sipil";
    const issues = validateTitle({
      subject: "balok beton bertulang mutu tinggi",
      intervention: "penambahan serat polipropilena",
      outcome: "kapasitas lentur kN.m",
      composed: longTitle,
    });

    const longWarning = issues.find((i) => i.id === "title-too-long");
    expect(longWarning).toBeDefined();
  });

  it("should warn when title opens with vague word like 'analisis' or 'studi'", () => {
    const issues = validateTitle({
      subject: "balok beton bertulang",
      intervention: "serat baja",
      outcome: "kuat geser kN",
      composed: "Analisis Kuat Geser Balok Beton Bertulang dengan Serat Baja",
    });

    const vagueWarning = issues.find((i) => i.id === "title-vague-opening");
    expect(vagueWarning).toBeDefined();
  });

  it("should provide tip when title has a location prefix", () => {
    const issues = validateTitle({
      subject: "fondasi tiang pancang",
      intervention: "beban lateral",
      outcome: "defleksi lateral mm",
      composed: "Studi Kasus Defleksi Lateral Fondasi Tiang Pancang di Kota Semarang",
    });

    const locationTip = issues.find((i) => i.id === "title-location-prefix-tip");
    expect(locationTip).toBeDefined();
    expect(locationTip?.level).toBe("tip");
  });

  it("should provide tip when title has a software prefix", () => {
    const issues = validateTitle({
      subject: "jembatan busur baja",
      intervention: "beban gempa dinamis",
      outcome: "tegangan von mises MPa",
      composed: "Aplikasi SAP2000 pada Respon Dinamis Jembatan Busur Baja Akibat Beban Gempa",
    });

    const softwareTip = issues.find((i) => i.id === "title-software-prefix-tip");
    expect(softwareTip).toBeDefined();
    expect(softwareTip?.level).toBe("tip");
  });
});
