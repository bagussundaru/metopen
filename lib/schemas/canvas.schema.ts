import { z } from "zod";

export const ReferenceSchema = z.object({
  id: z.string(),
  authors: z.string().default(""),
  year: z.number().int().default(() => new Date().getFullYear()),
  title: z.string().default(""),
  source: z.string().optional().default(""),
  indexSource: z.enum(["scopus", "google_scholar", "sinta", "other"]).default("scopus"),
  citedBy: z.number().int().min(0).optional().default(0),
  doi: z.string().optional().default(""),
  keyFinding: z.string().default(""),
  limitation: z.string().default(""),
});

export const DataNeedSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  kind: z.enum(["primary", "secondary"]).default("primary"),
  source: z.string().default(""),
  availability: z.enum(["available", "requires_permission", "must_generate", "uncertain"]).default("available"),
  accessEvidence: z.string().optional().default(""),
  estimatedSize: z.string().optional().default(""),
  timeEstimateWeeks: z.number().min(0).optional().default(1),
  risk: z.string().optional().default(""),
  mitigation: z.string().optional().default(""),
});

export const RubricScoresSchema = z.object({
  gapClarity: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  novelty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  engineeringRelevance: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  methodFit: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  dataFeasibility: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export const PinnedFindingSchema = z.object({
  id: z.string(),
  type: z.enum(["emerging_topic", "isolated_cross", "student_keyword", "custom"]),
  label: z.string(),
  description: z.string(),
  pinnedAt: z.string(),
});

export const LiteratureMapSchema = z.object({
  sourceType: z.enum(["vosviewer", "scopus_csv", "google_scholar_csv"]).optional(),
  nodeCount: z.number().default(0),
  edgeCount: z.number().default(0),
  pinnedFindings: z.array(PinnedFindingSchema).default([]),
  snapshotImage: z.string().optional(),
});

export const AiReviewSchema = z.object({
  scores: RubricScoresSchema,
  scoreReasons: z.record(z.string(), z.string()).optional(),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  noveltyTrapDetected: z.boolean(),
  noveltyTrapEvidence: z.string().optional(),
  reviewedAt: z.string(),
});

export const CanvasSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  meta: z.object({
    studentName: z.string().default(""),
    nim: z.string().default(""),
    institution: z.string().default("Universitas Negeri Yogyakarta"),
    prodi: z.string().default("S2 Teknik Sipil"),
    course: z.string().default("Metodologi Penelitian & Seminar Proposal"),
    lecturer: z.string().default(""),
  }),
  title: z.object({
    subject: z.string().default(""),
    intervention: z.string().default(""),
    outcome: z.string().default(""),
    context: z.string().optional().default(""),
    composed: z.string().default(""),
  }),
  background: z.object({
    sentences: z.tuple([
      z.string().default(""),
      z.string().default(""),
      z.string().default(""),
    ]),
    references: z.array(ReferenceSchema).default([]),
  }),
  researchQuestion: z.object({
    main: z.string().default(""),
    type: z.enum(["empirical", "numerical", "both"]).default("empirical"),
    variables: z.object({
      independent: z.array(z.string()).default([]),
      dependent: z.array(z.string()).default([]),
      controlled: z.array(z.string()).default([]),
    }),
    measurableIndicator: z.string().default(""),
    hypothesis: z.string().optional().default(""),
    checklist: z.object({
      notJustLocation: z.boolean().default(false),
      notJustSoftware: z.boolean().default(false),
      measurableVariables: z.boolean().default(false),
      hasDecisionThreshold: z.boolean().default(false),
      feasibleInStudyTime: z.boolean().default(false),
    }).default({
      notJustLocation: false,
      notJustSoftware: false,
      measurableVariables: false,
      hasDecisionThreshold: false,
      feasibleInStudyTime: false,
    }),
  }),
  method: z.object({
    approach: z.enum([
      "experimental_lab",
      "field_study",
      "numerical_fem",
      "simulation",
      "statistical_modeling",
      "ml_data_driven",
      "mixed",
      "other",
    ]).default("experimental_lab"),
    description: z.string().default(""),
    tools: z.array(z.string()).default([]),
    standards: z.array(z.string()).default([]),
    dataNeeds: z.array(DataNeedSchema).default([]),
  }),
  feasibility: z.object({
    selfScores: RubricScoresSchema.default({
      gapClarity: 3,
      novelty: 3,
      engineeringRelevance: 3,
      methodFit: 3,
      dataFeasibility: 3,
    }),
    autoScores: RubricScoresSchema.optional(),
    scoreExplanations: z.record(z.string(), z.string()).optional(),
    overallStatus: z.enum(["ready", "minor_revision", "major_revision"]).default("minor_revision"),
    aiReview: AiReviewSchema.optional(),
    notes: z.string().default(""),
  }),
  literatureMap: LiteratureMapSchema.optional(),
});

export type Canvas = z.infer<typeof CanvasSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
export type DataNeed = z.infer<typeof DataNeedSchema>;
export type RubricScores = z.infer<typeof RubricScoresSchema>;
export type RubricKey = keyof RubricScores;
export type PinnedFinding = z.infer<typeof PinnedFindingSchema>;
export type LiteratureMap = z.infer<typeof LiteratureMapSchema>;
export type AiReview = z.infer<typeof AiReviewSchema>;
