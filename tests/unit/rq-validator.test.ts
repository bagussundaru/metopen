import { describe, it, expect } from "vitest";
import { validateResearchQuestion } from "@/lib/validators/rq-validator";

describe("Research Question & Novelty Trap Validator", () => {
  it("should error if research question is empty", () => {
    const issues = validateResearchQuestion({
      main: "",
      type: "empirical",
      variables: { independent: [], dependent: [], controlled: [] },
      measurableIndicator: "",
      checklist: {
        notJustLocation: false,
        notJustSoftware: false,
        measurableVariables: false,
        hasDecisionThreshold: false,
        feasibleInStudyTime: false,
      },
    });

    const emptyError = issues.find((i) => i.id === "rq-empty");
    expect(emptyError).toBeDefined();
    expect(emptyError?.level).toBe("error");
  });

  it("should error if research question does not end with question mark (?)", () => {
    const issues = validateResearchQuestion({
      main: "Seberapa besar pengaruh substitusi fly ash terhadap kuat lentur balok beton",
      type: "empirical",
      variables: { independent: ["fly ash"], dependent: ["kuat lentur"], controlled: [] },
      measurableIndicator: "Peningkatan 10%",
    });

    const qmError = issues.find((i) => i.id === "rq-no-question-mark");
    expect(qmError).toBeDefined();
    expect(qmError?.level).toBe("error");
  });

  it("should error if independent or dependent variables are missing", () => {
    const issues = validateResearchQuestion({
      main: "Seberapa besar pengaruh perlakuan terhadap hasil ukur?",
      type: "empirical",
      variables: { independent: [], dependent: [], controlled: [] },
      measurableIndicator: "Peningkatan 10%",
    });

    const varError = issues.find((i) => i.id === "rq-missing-variables");
    expect(varError).toBeDefined();
    expect(varError?.level).toBe("error");
  });

  it("should warn if RQ is phrased as a binary yes/no question", () => {
    const issues = validateResearchQuestion({
      main: "Apakah ada pengaruh penambahan fly ash terhadap kuat tekan beton?",
      type: "empirical",
      variables: { independent: ["fly ash"], dependent: ["kuat tekan"], controlled: [] },
      measurableIndicator: "Uji silinder",
    });

    const binaryWarn = issues.find((i) => i.id === "rq-binary-pattern");
    expect(binaryWarn).toBeDefined();
    expect(binaryWarn?.level).toBe("warning");
  });

  it("should trigger Location Trap detector for 'di Kota X' or 'studi kasus'", () => {
    const issues = validateResearchQuestion({
      main: "Bagaimana kapasitas daya dukung tiang pancang pada studi kasus di Kota Surabaya?",
      type: "empirical",
      variables: { independent: ["panjang tiang"], dependent: ["daya dukung"], controlled: [] },
      measurableIndicator: "Uji beban statik",
    });

    const locTrap = issues.find((i) => i.id === "rq-location-trap");
    expect(locTrap).toBeDefined();
    expect(locTrap?.level).toBe("warning");
    expect(locTrap?.suggestion).toContain("Apa yang secara ilmiah berbeda di lokasi ini");
  });

  it("should trigger Software Syndrome detector for 'menggunakan software' or 'berbasis aplikasi'", () => {
    const issues = validateResearchQuestion({
      main: "Bagaimana perilaku lendutan balok beton jika dimodelkan menggunakan software SAP2000?",
      type: "numerical",
      variables: { independent: ["variasi mesh"], dependent: ["lendutan"], controlled: [] },
      measurableIndicator: "Deviasi lendutan",
    });

    const softSyndrome = issues.find((i) => i.id === "rq-software-syndrome");
    expect(softSyndrome).toBeDefined();
    expect(softSyndrome?.level).toBe("warning");
    expect(softSyndrome?.suggestion).toContain("Jika software tersebut diganti dengan software sejenis lainnya");
  });

  it("should warn if measurable indicator is missing", () => {
    const issues = validateResearchQuestion({
      main: "Seberapa besar peningkatan kuat lentur balok beton dengan substitusi fly ash 20%?",
      type: "empirical",
      variables: { independent: ["substitusi fly ash"], dependent: ["kuat lentur"], controlled: [] },
      measurableIndicator: "",
    });

    const indicatorWarn = issues.find((i) => i.id === "rq-missing-measurable-indicator");
    expect(indicatorWarn).toBeDefined();
  });

  it("should provide tip if checklist items are incomplete", () => {
    const issues = validateResearchQuestion({
      main: "Seberapa besar peningkatan kuat lentur balok beton dengan substitusi fly ash 20%?",
      type: "empirical",
      variables: { independent: ["substitusi fly ash"], dependent: ["kuat lentur"], controlled: [] },
      measurableIndicator: "Kuat lentur > 45 MPa",
      checklist: {
        notJustLocation: false,
        notJustSoftware: true,
        measurableVariables: true,
        hasDecisionThreshold: true,
        feasibleInStudyTime: false,
      },
    });

    const checklistTip = issues.find((i) => i.id === "rq-checklist-incomplete");
    expect(checklistTip).toBeDefined();
    expect(checklistTip?.suggestion).toContain("Bukan sekadar lokasi baru");
  });

  it("should pass completely for a sound, measurable civil engineering RQ", () => {
    const issues = validateResearchQuestion({
      main: "Seberapa besar pengaruh variasi substitusi fly ash (15%, 20%, 25%) terhadap momen lentur ultimate dan daktilitas balok beton bertulang?",
      type: "empirical",
      variables: { independent: ["substitusi fly ash"], dependent: ["momen lentur ultimate", "daktilitas"], controlled: ["dimensi balok"] },
      measurableIndicator: "Momen lentur >= 40 kN.m dan daktilitas mu > 2.5",
      checklist: {
        notJustLocation: true,
        notJustSoftware: true,
        measurableVariables: true,
        hasDecisionThreshold: true,
        feasibleInStudyTime: true,
      },
    });

    const errors = issues.filter((i) => i.level === "error");
    const warnings = issues.filter((i) => i.level === "warning");
    expect(errors.length).toBe(0);
    expect(warnings.length).toBe(0);
  });
});
