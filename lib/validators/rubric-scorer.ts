import { Canvas, RubricScores, RubricKey, ValidationIssue } from "@/lib/types/canvas";

export interface RubricCalculationResult {
  scores: RubricScores;
  explanations: Record<RubricKey, string>;
  averageScore: number;
  overallStatus: "ready" | "minor_revision" | "major_revision";
  statusText: string;
}

export function calculateRubricScores(canvas: Canvas, allIssues: ValidationIssue[]): RubricCalculationResult {
  // Categorize issues by affected criterion
  const gapIssues = allIssues.filter((i) => i.field.startsWith("background"));
  const noveltyIssues = allIssues.filter(
    (i) =>
      i.id.includes("location-trap") ||
      i.id.includes("software-syndrome") ||
      i.id.includes("binary") ||
      i.field === "researchQuestion.checklist"
  );
  const relevanceIssues = allIssues.filter(
    (i) =>
      i.field === "title.outcome" ||
      i.id.includes("outcome") ||
      i.field === "researchQuestion.measurableIndicator"
  );
  const methodIssues = allIssues.filter(
    (i) =>
      i.field === "method.standards" ||
      i.field === "method.approach" ||
      i.id.includes("approach-mismatch")
  );
  const dataIssues = allIssues.filter((i) => i.field === "method.dataNeeds");

  function computeScore(issues: ValidationIssue[], criterionName: string): { score: 1 | 2 | 3 | 4; explanation: string } {
    let score = 4;
    const errorCount = issues.filter((i) => i.level === "error").length;
    const warningCount = issues.filter((i) => i.level === "warning").length;

    score -= errorCount * 1.0;
    score -= warningCount * 0.5;

    const clampedScore = Math.max(1, Math.min(4, Math.round(score))) as 1 | 2 | 3 | 4;

    const reasons: string[] = [];
    if (errorCount > 0) {
      reasons.push(`${errorCount} perbaikan wajib (error)`);
    }
    if (warningCount > 0) {
      reasons.push(`${warningCount} peringatan (warning)`);
    }

    let explanation = "";
    if (reasons.length === 0) {
      explanation = `Sangat Baik (Skor ${clampedScore}/4): Seluruh indikator ${criterionName} terpenuhi dengan lengkap dan selaras standar akademik.`;
    } else {
      explanation = `Skor ${clampedScore}/4: Berkurang karena terdapat ${reasons.join(" dan ")} pada komponen terkait.`;
    }

    return { score: clampedScore, explanation };
  }

  const gap = computeScore(gapIssues, "Kejelasan Gap");
  const novelty = computeScore(noveltyIssues, "Kebaruan & Keaslian");
  const relevance = computeScore(relevanceIssues, "Relevansi Rekayasa");
  const method = computeScore(methodIssues, "Ketepatan Metode");
  const data = computeScore(dataIssues, "Kelayakan Data");

  const scores: RubricScores = {
    gapClarity: gap.score,
    novelty: novelty.score,
    engineeringRelevance: relevance.score,
    methodFit: method.score,
    dataFeasibility: data.score,
  };

  const explanations: Record<RubricKey, string> = {
    gapClarity: gap.explanation,
    novelty: novelty.explanation,
    engineeringRelevance: relevance.explanation,
    methodFit: method.explanation,
    dataFeasibility: data.explanation,
  };

  const avg = (scores.gapClarity + scores.novelty + scores.engineeringRelevance + scores.methodFit + scores.dataFeasibility) / 5;
  const roundedAvg = Math.round(avg * 10) / 10;

  const totalErrors = allIssues.filter((i) => i.level === "error").length;

  let overallStatus: "ready" | "minor_revision" | "major_revision" = "minor_revision";
  let statusText = "Perlu Revisi Minor";

  if (totalErrors > 0 || roundedAvg < 2.5) {
    overallStatus = "major_revision";
    statusText = "Perlu Revisi Mayor (Terdapat Komponen Wajib Belum Sesuai)";
  } else if (roundedAvg >= 3.5) {
    overallStatus = "ready";
    statusText = "Siap Diajukan ke Dosen Pembimbing";
  } else {
    overallStatus = "minor_revision";
    statusText = "Perlu Revisi Minor (Beberapa Parameter Perlu Ditasbihkan)";
  }

  return {
    scores,
    explanations,
    averageScore: roundedAvg,
    overallStatus,
    statusText,
  };
}
