import { Canvas, ValidationIssue } from "@/lib/types/canvas";
import { validateTitle } from "./title-validator";
import { validateBackground } from "./background-validator";
import { validateResearchQuestion } from "./rq-validator";
import { validateMethod } from "./method-validator";
import { calculateRubricScores, RubricCalculationResult } from "./rubric-scorer";

export interface MasterValidationResult {
  stepIssues: Record<number, ValidationIssue[]>;
  allIssues: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  tips: ValidationIssue[];
  rubric: RubricCalculationResult;
}

export function validateEntireCanvas(canvas: Canvas): MasterValidationResult {
  const step1 = validateTitle(canvas.title);
  const step2 = validateBackground(canvas.background);
  const step3 = validateResearchQuestion(canvas.researchQuestion);
  const step4 = validateMethod(canvas.method, canvas.researchQuestion.type);

  const allIssues = [...step1, ...step2, ...step3, ...step4];

  const rubric = calculateRubricScores(canvas, allIssues);

  const errors = allIssues.filter((i) => i.level === "error");
  const warnings = allIssues.filter((i) => i.level === "warning");
  const tips = allIssues.filter((i) => i.level === "tip");

  return {
    stepIssues: {
      1: step1,
      2: step2,
      3: step3,
      4: step4,
      5: [], // Step 5 reviews rubric & feasibility
    },
    allIssues,
    errors,
    warnings,
    tips,
    rubric,
  };
}

export * from "./sentence-splitter";
export * from "./title-validator";
export * from "./background-validator";
export * from "./rq-validator";
export * from "./method-validator";
export * from "./rubric-scorer";
