"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Canvas, CanvasSchema } from "@/lib/schemas/canvas.schema";
import { createEmptyCanvas, createCivilEngineeringExampleCanvas } from "@/lib/store/default-canvas";

interface CanvasStoreState {
  canvases: Canvas[];
  activeCanvasId: string | null;
  isHydrated: boolean;
  setHydrated: (val: boolean) => void;

  // Canvas CRUD
  createCanvas: () => string;
  loadExampleCanvas: () => string;
  setActiveCanvasId: (id: string | null) => void;
  getActiveCanvas: () => Canvas | undefined;
  updateActiveCanvas: (updater: (prev: Canvas) => Canvas) => void;
  updateCanvas: (id: string, updater: (prev: Canvas) => Canvas) => void;
  deleteCanvas: (id: string) => void;
  duplicateCanvas: (id: string) => string;

  // Import / Export JSON
  importCanvasFromJson: (jsonString: string) => { success: boolean; id?: string; error?: string };
  exportCanvasAsJson: (id: string) => string | null;
}

export const useCanvasStore = create<CanvasStoreState>()(
  persist(
    (set, get) => ({
      canvases: [],
      activeCanvasId: null,
      isHydrated: false,

      setHydrated: (val: boolean) => set({ isHydrated: val }),

      createCanvas: () => {
        const newCanvas = createEmptyCanvas();
        set((state) => ({
          canvases: [newCanvas, ...state.canvases],
          activeCanvasId: newCanvas.id,
        }));
        return newCanvas.id;
      },

      loadExampleCanvas: () => {
        const example = createCivilEngineeringExampleCanvas();
        // Give it a fresh unique id
        const freshExample: Canvas = {
          ...example,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          canvases: [freshExample, ...state.canvases],
          activeCanvasId: freshExample.id,
        }));
        return freshExample.id;
      },

      setActiveCanvasId: (id: string | null) => {
        set({ activeCanvasId: id });
      },

      getActiveCanvas: () => {
        const { canvases, activeCanvasId } = get();
        return canvases.find((c) => c.id === activeCanvasId);
      },

      updateActiveCanvas: (updater) => {
        const { activeCanvasId } = get();
        if (!activeCanvasId) return;

        set((state) => ({
          canvases: state.canvases.map((canvas) => {
            if (canvas.id === activeCanvasId) {
              const updated = updater(canvas);
              return {
                ...updated,
                updatedAt: new Date().toISOString(),
              };
            }
            return canvas;
          }),
        }));
      },

      updateCanvas: (id: string, updater) => {
        set((state) => ({
          canvases: state.canvases.map((canvas) => {
            if (canvas.id === id) {
              const updated = updater(canvas);
              return {
                ...updated,
                updatedAt: new Date().toISOString(),
              };
            }
            return canvas;
          }),
        }));
      },

      deleteCanvas: (id: string) => {
        set((state) => {
          const filtered = state.canvases.filter((c) => c.id !== id);
          return {
            canvases: filtered,
            activeCanvasId: state.activeCanvasId === id ? (filtered[0]?.id || null) : state.activeCanvasId,
          };
        });
      },

      duplicateCanvas: (id: string) => {
        const target = get().canvases.find((c) => c.id === id);
        if (!target) return "";

        const duplicated: Canvas = {
          ...JSON.parse(JSON.stringify(target)),
          id: crypto.randomUUID(),
          title: {
            ...target.title,
            composed: target.title.composed ? `${target.title.composed} (Salinan)` : "",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          canvases: [duplicated, ...state.canvases],
          activeCanvasId: duplicated.id,
        }));

        return duplicated.id;
      },

      importCanvasFromJson: (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString);
          const validated = CanvasSchema.parse(parsed);

          // Ensure it has a unique id if duplicate
          const existing = get().canvases.find((c) => c.id === validated.id);
          const finalCanvas: Canvas = {
            ...validated,
            id: existing ? crypto.randomUUID() : validated.id,
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            canvases: [finalCanvas, ...state.canvases.filter((c) => c.id !== finalCanvas.id)],
            activeCanvasId: finalCanvas.id,
          }));

          return { success: true, id: finalCanvas.id };
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Format JSON kanvas tidak valid.";
          return { success: false, error: errorMessage };
        }
      },

      exportCanvasAsJson: (id: string) => {
        const canvas = get().canvases.find((c) => c.id === id);
        if (!canvas) return null;
        return JSON.stringify(canvas, null, 2);
      },
    }),
    {
      name: "kanvas_tesis_store_v1",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage;
        }
        // Fallback for SSR and testing environments
        const memoryStorage = new Map<string, string>();
        return {
          getItem: (key: string) => memoryStorage.get(key) ?? null,
          setItem: (key: string, value: string) => memoryStorage.set(key, value),
          removeItem: (key: string) => memoryStorage.delete(key),
        };
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
