import { describe, it, expect } from "vitest";
import { calculateRubricScores } from "@/lib/validators/rubric-scorer";
import { createCivilEngineeringExampleCanvas, createEmptyCanvas } from "@/lib/store/default-canvas";
import { validateEntireCanvas } from "@/lib/validators/index";

describe("Rubric Scorer & Readiness Engine", () => {
  it("should score 4 for all criteria when canvas is completely sound without issues", () => {
    const canvas = createCivilEngineeringExampleCanvas();
    const { allIssues } = validateEntireCanvas(canvas);
    const result = calculateRubricScores(canvas, allIssues);

    expect(result.scores.gapClarity).toBe(4);
    expect(result.scores.novelty).toBe(4);
    expect(result.scores.engineeringRelevance).toBe(4);
    expect(result.scores.methodFit).toBe(4);
    expect(result.scores.dataFeasibility).toBe(4);
    expect(result.averageScore).toBe(4);
    expect(result.overallStatus).toBe("ready");
  });

  it("should reduce score transparently and classify as major_revision when errors exist", () => {
    const emptyCanvas = createEmptyCanvas();
    const { allIssues } = validateEntireCanvas(emptyCanvas);
    const result = calculateRubricScores(emptyCanvas, allIssues);

    expect(result.overallStatus).toBe("major_revision");
    expect(result.scores.gapClarity).toBeLessThanOrEqual(3);
    expect(result.scores.dataFeasibility).toBeLessThanOrEqual(3);
    expect(result.statusText).toContain("Revisi Mayor");
  });

  it("should classify as minor_revision when there are no errors but some warnings exist", () => {
    const canvas = createCivilEngineeringExampleCanvas();
    // Introduce a warning (e.g. uncertain data)
    canvas.method.dataNeeds[0].availability = "uncertain";
    const { allIssues } = validateEntireCanvas(canvas);
    const result = calculateRubricScores(canvas, allIssues);

    expect(result.scores.dataFeasibility).toBeLessThanOrEqual(4);
    expect(result.explanations.dataFeasibility).toContain("peringatan");
  });
});
