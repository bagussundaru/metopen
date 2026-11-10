"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task1State, Task2ResearchDesign, StudentTaskMeta, SinglePaperAnalysis } from "../types/tasks";
import {
  createEmptyTask1,
  createBenchmarkTask1CivilEngineering,
  createEmptyTask2,
  createBenchmarkTask2CivilEngineering,
} from "./default-tasks";

interface TaskStoreState {
  task1: Task1State;
  task2: Task2ResearchDesign;
  activeTaskTab: "task1" | "task2";
  isHydrated: boolean;

  setHydrated: (val: boolean) => void;
  setActiveTaskTab: (tab: "task1" | "task2") => void;

  // Student Meta (Synchronized across both tasks)
  updateStudentMeta: (meta: Partial<StudentTaskMeta>) => void;

  // Task 1 Actions
  updateTask1: (updater: (prev: Task1State) => Task1State) => void;
  updateTask1Paper: (index: 0 | 1 | 2, updater: (prev: SinglePaperAnalysis) => SinglePaperAnalysis) => void;
  loadBenchmarkTask1: () => void;
  resetTask1: () => void;

  // Task 2 Actions
  updateTask2: (updater: (prev: Task2ResearchDesign) => Task2ResearchDesign) => void;
  loadBenchmarkTask2: () => void;
  resetTask2: () => void;

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

      setHydrated: (val: boolean) => set({ isHydrated: val }),
      setActiveTaskTab: (tab: "task1" | "task2") => set({ activeTaskTab: tab }),

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
