"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task1State, Task2ResearchDesign, StudentTaskMeta, SinglePaperAnalysis, TaskTabType } from "../types/tasks";
import { Canvas } from "@/lib/types/canvas";
import {
  createEmptyTask1,
  createBenchmarkTask1CivilEngineering,
  createBenchmarkTask1DataCenterK3,
  createEmptyTask2,
  createBenchmarkTask2CivilEngineering,
  createBenchmarkTask2DataCenterK3,
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
  activeTaskTab: TaskTabType;
  isHydrated: boolean;
  lastScopusSearch: ScopusSearchSnapshot | null;

  setHydrated: (val: boolean) => void;
  setActiveTaskTab: (tab: TaskTabType) => void;

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
  loadBenchmarkDataCenterTask1: () => void;
  loadBenchmarkGeopolymerTask1: () => void;
  injectTop3ScopusArticles: (articles?: ScopusSearchArticleItem[], query?: string) => boolean;
  parseAndSetPaperFromText: (paperIndex: 0 | 1 | 2, rawText: string) => boolean;
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
  loadBenchmarkDataCenterTask2: () => void;
  loadBenchmarkGeopolymerTask2: () => void;
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
      setActiveTaskTab: (tab: TaskTabType) => set({ activeTaskTab: tab }),

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

      loadBenchmarkDataCenterTask1: () => {
        const benchmark = createBenchmarkTask1DataCenterK3();
        const currentMeta = get().task1.meta;
        set({
          task1: {
            ...benchmark,
            meta: currentMeta.studentName ? currentMeta : benchmark.meta,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      loadBenchmarkGeopolymerTask1: () => {
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

      injectTop3ScopusArticles: (articles, query) => {
        const sourceArticles =
          articles && articles.length > 0
            ? articles
            : get().lastScopusSearch?.articles || [];

        if (!sourceArticles || sourceArticles.length === 0) {
          return false;
        }

        const effectiveQuery =
          query ||
          get().lastScopusSearch?.scopusQuery ||
          get().lastScopusSearch?.query ||
          "Scopus Literature Search";

        const targetArticles = sourceArticles.slice(0, 3);
        const searchDateStr = new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        set((state) => {
          const updatedPapers = [...state.task1.papers] as [
            SinglePaperAnalysis,
            SinglePaperAnalysis,
            SinglePaperAnalysis
          ];

          targetArticles.forEach((art, idx) => {
            if (idx > 2) return;
            const prev = updatedPapers[idx];
            const isReview =
              (art.docType || "").toLowerCase().includes("review") ||
              art.title.toLowerCase().includes("review") ||
              art.title.toLowerCase().includes("bibliometric");

            updatedPapers[idx] = {
              ...prev,
              title: art.title || prev.title,
              authors: art.authors || prev.authors,
              year: art.year || prev.year || new Date().getFullYear(),
              journal: art.journal || prev.journal || "Scopus Indexed Journal",
              doi: art.doi || prev.doi || "",
              indexingDb:
                art.citedByCount > 15 ? "Scopus Q1 (Elsevier)" : "Scopus Q2 (Elsevier)",
              citationCount:
                typeof art.citedByCount === "number" ? art.citedByCount : prev.citationCount,
              topicAndRelevance:
                art.keywords && art.keywords.length > 0
                  ? `Kajian pada topik ${art.keywords.slice(0, 5).join(", ")}. Sangat relevan dengan pemetaan struktur literatur ilmiah yang sedang diteliti.`
                  : prev.topicAndRelevance ||
                    `Kajian literatur ilmiah terindeks Scopus terkait topik ${art.title}.`,
              generalGoalAndGap: art.abstract
                ? `Tujuan: Menelaah perkembangan riset pada topik "${art.title}". Kesenjangan riset yang diangkat: ${art.abstract.slice(0, 160)}...`
                : prev.generalGoalAndGap ||
                  `Tujuan: Memetakan struktur intelektual dan tren penelitian global pada ${art.title}.`,
              researchQuestions:
                prev.researchQuestions ||
                `1. Bagaimana tren publikasi dan sitasi tahunan dalam basis data Scopus?\n2. Klaster topik dan kata kunci apa yang mendominasi struktur intelektual literatur ini?\n3. Apa kesenjangan riset dan peluang investigasi masa depan yang diidentifikasi?`,
              isRqReconstructed: true,
              rqReconstructionNotes:
                "Direkonstruksi secara terstruktur dari rumusan masalah pada Pendahuluan dan batasan sintesis artikel.",
              databaseAndSearchDate: `Scopus Core Collection (Elsevier), penelusuran: ${searchDateStr}`,
              booleanQuery: effectiveQuery,
              yearRange: "2015 – 2026 (10 Tahun Terakhir)",
              selectionCriteria: isReview
                ? "Inklusi: Artikel review & bibliometrik peer-reviewed terindeks Scopus berbahasa Inggris. Eksklusi: Dokumen prosiding tanpa peer review, artikel pendek, dan editorial."
                : "Inklusi: Artikel penelitian primer peer-reviewed terindeks Scopus dengan data empiris/eksperimental terukur. Eksklusi: Dokumen non-peer-reviewed.",
              toolsAndTechniques:
                "VOSviewer v1.6.20 (co-occurrence kata kunci, co-authorship jaringan antar-negara/institusi) & Bibliometrix (R-package)",
              mainFindings: art.abstract
                ? `Temuan utama: ${art.abstract.slice(0, 200)}...`
                : prev.mainFindings ||
                  `Terpetakan klaster kata kunci dominan, dinamika kolaborasi internasional, serta kesenjangan penelitian pada literatur Scopus.`,
              academicValueAndTouch:
                "Penulis menghubungkan visualisasi jejaring bibliometrik VOSviewer dengan telaah mendalam parameter rekayasa teknik di lapangan.",
              limitationsAndBias:
                "Kajian dibatasi pada basis data Scopus berbahasa Inggris serta sensitivitas ambang batas kemunculan kata kunci.",
              futureResearchOpportunities:
                "Investigasi lanjutan skala lapangan dan integrasi multi-parameter empiris yang belum tersentuh pada literatur terdahulu.",
            };
          });

          const identified =
            sourceArticles.length > 0
              ? get().lastScopusSearch?.totalFound || sourceArticles.length
              : state.task2.prisma.recordsIdentified;
          const duplicates = Math.max(0, Math.round(identified * 0.05));
          const screened = Math.max(0, identified - duplicates);
          const excluded = Math.max(0, Math.round(screened * 0.45));
          const fullText = Math.max(0, screened - excluded);
          const ftExcluded = Math.max(0, Math.round(fullText * 0.3));
          const included = Math.max(1, fullText - ftExcluded);

          return {
            task1: {
              ...state.task1,
              papers: updatedPapers,
              lastUpdated: new Date().toISOString(),
            },
            task2: {
              ...state.task2,
              booleanSearchString: effectiveQuery,
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

        return true;
      },

      parseAndSetPaperFromText: (paperIndex, rawText) => {
        if (!rawText.trim()) return false;
        const text = rawText.trim();

        const doiMatch = text.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/);
        const doi = doiMatch ? doiMatch[0] : "";

        const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
        const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        let title = "";
        let authors = "";
        let journal = "";

        if (lines.length >= 3) {
          title = lines[0];
          authors = lines[1];
          journal = lines[2];
        } else if (lines.length === 2) {
          title = lines[0];
          authors = lines[1];
        } else {
          const apaMatch = text.match(
            /^(.+?)\s*\((19\d{2}|20\d{2})\)\.?\s*(.+?)\.?\s+([A-Z][^,.]+)/
          );
          if (apaMatch) {
            authors = apaMatch[1].trim();
            title = apaMatch[3].trim();
            journal = apaMatch[4].trim();
          } else {
            title = lines[0];
          }
        }

        get().setPaperFromScopus(paperIndex, {
          title,
          authors,
          year,
          journal: journal || "Scopus Indexed Journal",
          doi,
        });

        return true;
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

      loadBenchmarkDataCenterTask2: () => {
        const benchmark = createBenchmarkTask2DataCenterK3();
        const currentMeta = get().task2.meta;
        set({
          task2: {
            ...benchmark,
            meta: currentMeta.studentName ? currentMeta : benchmark.meta,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      loadBenchmarkGeopolymerTask2: () => {
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
