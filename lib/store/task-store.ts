"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task1State, Task2ResearchDesign, StudentTaskMeta, SinglePaperAnalysis } from "../types/tasks";
import { Canvas } from "@/lib/types/canvas";
import {
  createEmptyTask1,
  createBenchmarkTask1CivilEngineering,
  createEmptyTask2,
  createBenchmarkTask2CivilEngineering,
} from "./default-tasks";

export interface ScopusSearchArticleItem {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi?: string;
  citedByCount: number;
  abstract?: string;
  keywords?: string[];
  isOpenAccess?: boolean;
  docType?: string;
}

export interface ScopusSearchSnapshot {
  query: string;
  scopusQuery?: string;
  totalFound: number;
  topic?: string;
  articles: ScopusSearchArticleItem[];
  searchedAt: string;
}

interface TaskStoreState {
  task1: Task1State;
  task2: Task2ResearchDesign;
  activeTaskTab: "task1" | "task2";
  isHydrated: boolean;
  lastScopusSearch: ScopusSearchSnapshot | null;

  setHydrated: (val: boolean) => void;
  setActiveTaskTab: (tab: "task1" | "task2") => void;

  // Student Meta (Synchronized across both tasks)
  updateStudentMeta: (meta: Partial<StudentTaskMeta>) => void;

  // Task 1 Actions
  updateTask1: (updater: (prev: Task1State) => Task1State) => void;
  updateTask1Paper: (index: 0 | 1 | 2, updater: (prev: SinglePaperAnalysis) => SinglePaperAnalysis) => void;
  setPaperFromScopus: (
    paperIndex: 0 | 1 | 2,
    paper: {
      title: string;
      authors: string;
      year: number;
      journal: string;
      doi?: string;
      citationCount?: number;
      indexingDb?: string;
      booleanQuery?: string;
      abstract?: string;
      keywords?: string[];
      databaseAndSearchDate?: string;
    }
  ) => void;
  loadBenchmarkTask1: () => void;
  resetTask1: () => void;

  // Task 2 Actions
  updateTask2: (updater: (prev: Task2ResearchDesign) => Task2ResearchDesign) => void;
  syncFromLiteratureSearch: (params: {
    query: string;
    totalFound: number;
    topic?: string;
  }) => void;
  syncFromCanvas: (canvas: Canvas) => void;
  loadBenchmarkTask2: () => void;
  resetTask2: () => void;

  // Scopus Search Snapshot
  saveScopusSearchSnapshot: (snapshot: ScopusSearchSnapshot) => void;

  // Import / Export JSON
  exportTasksAsJson: () => string;
  importTasksFromJson: (jsonStr: string) => { success: boolean; error?: string };
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set, get) => ({
      task1: createBenchmarkTask1CivilEngineering(), // Pre-fill with rich benchmark so user sees high standard immediately
      task2: createBenchmarkTask2CivilEngineering(), // Pre-fill with complete research design
      activeTaskTab: "task1",
      isHydrated: false,
      lastScopusSearch: null,

      setHydrated: (val: boolean) => set({ isHydrated: val }),
      setActiveTaskTab: (tab: "task1" | "task2") => set({ activeTaskTab: tab }),

      saveScopusSearchSnapshot: (snapshot) => {
        set({ lastScopusSearch: snapshot });
      },

      setPaperFromScopus: (paperIndex, paper) => {
        set((state) => {
          const newPapers = [...state.task1.papers] as [SinglePaperAnalysis, SinglePaperAnalysis, SinglePaperAnalysis];
          const prev = newPapers[paperIndex];
          newPapers[paperIndex] = {
            ...prev,
            title: paper.title || prev.title,
            authors: paper.authors || prev.authors,
            year: paper.year || prev.year,
            journal: paper.journal || prev.journal,
            doi: paper.doi || prev.doi,
            citationCount: typeof paper.citationCount === "number" ? paper.citationCount : prev.citationCount,
            indexingDb:
              paper.indexingDb ||
              (paper.citationCount && paper.citationCount > 15 ? "Scopus Q1 (Elsevier)" : "Scopus Q2 (Elsevier)"),
            topicAndRelevance:
              paper.keywords && paper.keywords.length > 0
                ? `Kajian pada topik ${paper.keywords.slice(0, 5).join(", ")}. Sangat relevan dengan topik penelitian teknik sipil yang sedang dikembangkan.`
                : prev.topicAndRelevance,
            generalGoalAndGap: paper.abstract
              ? `Tujuan: Menelaah perkembangan riset pada ${paper.title}. Kesenjangan riset yang diangkat: ${paper.abstract.slice(0, 160)}...`
              : prev.generalGoalAndGap,
            researchQuestions:
              prev.researchQuestions ||
              "1. Bagaimana tren publikasi dan sitasi tahunan?\n2. Klaster topik dan kata kunci apa yang dominan?\n3. Apa kesenjangan dan peluang riset masa depan yang direkomendasikan?",
            databaseAndSearchDate:
              paper.databaseAndSearchDate ||
              `Scopus (Elsevier), penelusuran: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
            booleanQuery: paper.booleanQuery || prev.booleanQuery,
            selectionCriteria:
              prev.selectionCriteria ||
              "Inklusi: Artikel peer-reviewed terindeks Scopus berbahasa Inggris. Eksklusi: Dokumen prosiding non-relevan dan editorial opini.",
            toolsAndTechniques:
              prev.toolsAndTechniques ||
              "VOSviewer (ko-okurensi kata kunci, jaringan kolaborasi) & Bibliometrix R-package",
            mainFindings: paper.abstract
              ? `Temuan utama: ${paper.abstract.slice(0, 180)}...`
              : prev.mainFindings,
            academicValueAndTouch:
              prev.academicValueAndTouch ||
              "Sintesis state-of-the-art yang menghubungkan visualisasi jejaring dengan parameter mekanis rekayasa sipil.",
            limitationsAndBias:
              prev.limitationsAndBias ||
              "Kajian dibatasi pada basis data Scopus dengan kata kunci bahasa Inggris.",
            futureResearchOpportunities:
              prev.futureResearchOpportunities ||
              "Validasi eksperimental lanjutan pada skala lapangan dan pengujian durabilitas jangka panjang.",
          };

          return {
            task1: {
              ...state.task1,
              papers: newPapers,
              lastUpdated: new Date().toISOString(),
            },
          };
        });
      },

      syncFromLiteratureSearch: (params) => {
        set((state) => {
          const identified = params.totalFound > 0 ? params.totalFound : state.task2.prisma.recordsIdentified;
          const duplicates = Math.max(0, Math.round(identified * 0.05));
          const screened = Math.max(0, identified - duplicates);
          const excluded = Math.max(0, Math.round(screened * 0.45));
          const fullText = Math.max(0, screened - excluded);
          const ftExcluded = Math.max(0, Math.round(fullText * 0.3));
          const included = Math.max(1, fullText - ftExcluded);

          return {
            task2: {
              ...state.task2,
              theme: params.topic || state.task2.theme,
              targetDatabase: "Scopus",
              databaseRationale:
                "Scopus dipilih karena memiliki indeksasi komprehensif terhadap jurnal-jurnal bereputasi tinggi Q1 dan Q2 di bidang teknik sipil dan rekayasa material.",
              booleanSearchString: params.query || state.task2.booleanSearchString,
              prisma: {
                ...state.task2.prisma,
                recordsIdentified: identified,
                duplicatesRemoved: duplicates,
                recordsScreened: screened,
                recordsExcluded: excluded,
                fullTextAssessed: fullText,
                fullTextExcluded: ftExcluded,
                studiesIncluded: included,
              },
              lastUpdated: new Date().toISOString(),
            },
          };
        });
      },

      syncFromCanvas: (canvas) => {
        set((state) => {
          const studentName = canvas.meta.studentName || state.task2.meta.studentName;
          const nim = canvas.meta.nim || state.task2.meta.nim;

          const proposedTitle =
            canvas.title.composed ||
            (canvas.title.subject && canvas.title.intervention
              ? `Analisis Pengaruh ${canvas.title.intervention} Terhadap ${canvas.title.outcome || "Kinerja Struktur"} pada ${canvas.title.subject}`
              : state.task2.proposedTitle);

          const theme = canvas.title.subject || canvas.title.intervention || state.task2.theme;
          const urgency =
            canvas.background.sentences.filter(Boolean).join(" ") || state.task2.urgencyAndImportance;
          const gap = canvas.background.sentences[1] || state.task2.unansweredResearchGap;

          const rQuestions = [...state.task2.researchQuestions];
          if (canvas.researchQuestion.main && !rQuestions[0].includes(canvas.researchQuestion.main)) {
            rQuestions[0] = `Bagaimana pemetaan bibliometrik literatur Scopus terkait ${canvas.researchQuestion.main}?`;
          }

          return {
            task1: {
              ...state.task1,
              meta: {
                ...state.task1.meta,
                studentName: studentName || state.task1.meta.studentName,
                nim: nim || state.task1.meta.nim,
              },
              lastUpdated: new Date().toISOString(),
            },
            task2: {
              ...state.task2,
              meta: {
                ...state.task2.meta,
                studentName: studentName || state.task2.meta.studentName,
                nim: nim || state.task2.meta.nim,
              },
              theme,
              proposedTitle,
              urgencyAndImportance: urgency,
              unansweredResearchGap: gap,
              researchQuestions: rQuestions,
              lastUpdated: new Date().toISOString(),
            },
          };
        });
      },

      updateStudentMeta: (meta) => {
        set((state) => ({
          task1: {
            ...state.task1,
            meta: { ...state.task1.meta, ...meta },
            lastUpdated: new Date().toISOString(),
          },
          task2: {
            ...state.task2,
            meta: { ...state.task2.meta, ...meta },
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      updateTask1: (updater) => {
        set((state) => ({
          task1: {
            ...updater(state.task1),
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      updateTask1Paper: (index, updater) => {
        set((state) => {
          const newPapers = [...state.task1.papers] as [SinglePaperAnalysis, SinglePaperAnalysis, SinglePaperAnalysis];
          newPapers[index] = updater(newPapers[index]);
          return {
            task1: {
              ...state.task1,
              papers: newPapers,
              lastUpdated: new Date().toISOString(),
            },
          };
        });
      },

      loadBenchmarkTask1: () => {
        const benchmark = createBenchmarkTask1CivilEngineering();
        const currentMeta = get().task1.meta;
        set({
          task1: {
            ...benchmark,
            meta: currentMeta.studentName ? currentMeta : benchmark.meta,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      resetTask1: () => {
        const empty = createEmptyTask1();
        const currentMeta = get().task1.meta;
        set({
          task1: {
            ...empty,
            meta: currentMeta,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      updateTask2: (updater) => {
        set((state) => ({
          task2: {
            ...updater(state.task2),
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      loadBenchmarkTask2: () => {
        const benchmark = createBenchmarkTask2CivilEngineering();
        const currentMeta = get().task2.meta;
        set({
          task2: {
            ...benchmark,
            meta: currentMeta.studentName ? currentMeta : benchmark.meta,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      resetTask2: () => {
        const empty = createEmptyTask2();
        const currentMeta = get().task2.meta;
        set({
          task2: {
            ...empty,
            meta: currentMeta,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      exportTasksAsJson: () => {
        const { task1, task2 } = get();
        return JSON.stringify({ task1, task2, exportedAt: new Date().toISOString() }, null, 2);
      },

      importTasksFromJson: (jsonStr: string) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (!parsed.task1 && !parsed.task2) {
            return { success: false, error: "Format berkas JSON tidak memuat data tugas valid." };
          }
          set((state) => ({
            task1: parsed.task1 || state.task1,
            task2: parsed.task2 || state.task2,
          }));
          return { success: true };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Gagal membaca berkas JSON.";
          return { success: false, error: msg };
        }
      },
    }),
    {
      name: "metopen_tasks_storage_v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
