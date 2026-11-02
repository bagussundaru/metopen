import { z } from "zod";
import { RubricScoresSchema } from "./canvas.schema";

export const AiReviewRequestSchema = z.object({
  canvasId: z.string(),
  title: z.object({
    subject: z.string(),
    intervention: z.string(),
    outcome: z.string(),
    context: z.string().optional(),
    composed: z.string(),
  }),
  background: z.object({
    sentences: z.tuple([z.string(), z.string().optional(), z.string().optional()]),
    references: z.array(
      z.object({
        authors: z.string(),
        year: z.number(),
        title: z.string(),
        keyFinding: z.string(),
        limitation: z.string(),
      })
    ),
  }),
  researchQuestion: z.object({
    main: z.string(),
    type: z.enum(["empirical", "numerical", "both"]),
    variables: z.object({
      independent: z.array(z.string()),
      dependent: z.array(z.string()),
      controlled: z.array(z.string()),
    }),
    measurableIndicator: z.string(),
    hypothesis: z.string().optional(),
  }),
  method: z.object({
    approach: z.string(),
    description: z.string(),
    tools: z.array(z.string()),
    standards: z.array(z.string()),
    dataNeeds: z.array(
      z.object({
        name: z.string(),
        kind: z.enum(["primary", "secondary"]),
        source: z.string(),
        availability: z.string(),
        estimatedSize: z.string().optional(),
        timeEstimateWeeks: z.number().optional(),
      })
    ),
  }),
  literatureMapFindings: z.array(z.string()).optional(),
});

export const AiReviewResponseSchema = z.object({
  scores: RubricScoresSchema,
  scoreReasons: z.record(z.string(), z.string()),
  weaknesses: z.array(z.string()).min(1).max(5),
  suggestions: z.array(z.string()).min(1).max(5),
  noveltyTrapDetected: z.boolean(),
  noveltyTrapEvidence: z.string().optional(),
  reviewedAt: z.string(),
});

export const AiSuggestTitleRequestSchema = z.object({
  subject: z.string(),
  intervention: z.string(),
  outcome: z.string(),
  context: z.string().optional(),
  currentComposed: z.string().optional(),
});

export const AiSuggestTitleResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string(),
      subject: z.string(),
      intervention: z.string(),
      outcome: z.string(),
      context: z.string().optional(),
      reason: z.string(),
    })
  ).min(1).max(5),
});

export const AiSharpenGapRequestSchema = z.object({
  topic: z.string(),
  currentSentences: z.array(z.string()),
  references: z.array(
    z.object({
      authors: z.string(),
      year: z.number(),
      title: z.string(),
      keyFinding: z.string(),
      limitation: z.string(),
    })
  ),
  pinnedFindings: z.array(z.string()).optional(),
});

export const AiSharpenGapResponseSchema = z.object({
  sentences: z.tuple([z.string(), z.string(), z.string()]),
  gapKeywordsUsed: z.array(z.string()),
  synthesisRationale: z.string(),
});

export const AiRqVariantsRequestSchema = z.object({
  title: z.string(),
  approach: z.string(),
  currentRq: z.string().optional(),
  independentVariables: z.array(z.string()).optional(),
  dependentVariables: z.array(z.string()).optional(),
});

export const AiRqVariantsResponseSchema = z.object({
  variants: z.array(
    z.object({
      question: z.string(),
      type: z.enum(["empirical", "numerical", "both"]),
      suggestedIndependent: z.array(z.string()),
      suggestedDependent: z.array(z.string()),
      measurableIndicator: z.string(),
      strengths: z.string(),
    })
  ).min(1).max(5),
});
