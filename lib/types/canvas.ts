export * from "@/lib/schemas/canvas.schema";

export type ValidationLevel = "error" | "warning" | "tip";

export interface ValidationIssue {
  id: string;
  field: string;
  level: ValidationLevel;
  message: string;
  suggestion?: string;
}

export interface StepValidationResult {
  step: number;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
  tipCount: number;
}
