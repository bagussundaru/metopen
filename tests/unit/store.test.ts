import { describe, it, expect, beforeEach } from "vitest";
import { CanvasSchema } from "@/lib/schemas/canvas.schema";
import { createEmptyCanvas, createCivilEngineeringExampleCanvas } from "@/lib/store/default-canvas";
import { useCanvasStore } from "@/lib/store/canvas-store";

describe("Canvas Schema & Store", () => {
  beforeEach(() => {
    useCanvasStore.setState({
      canvases: [],
      activeCanvasId: null,
      isHydrated: true,
    });
  });

  it("should validate an empty canvas with CanvasSchema", () => {
    const emptyCanvas = createEmptyCanvas();
    const result = CanvasSchema.safeParse(emptyCanvas);
    expect(result.success).toBe(true);
  });

  it("should validate the Civil Engineering example canvas with CanvasSchema", () => {
    const exampleCanvas = createCivilEngineeringExampleCanvas();
    const result = CanvasSchema.safeParse(exampleCanvas);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.meta.institution).toBe("Universitas Negeri Yogyakarta");
      expect(result.data.background.references.length).toBeGreaterThanOrEqual(5);
      expect(result.data.title.subject).toContain("balok beton");
    }
  });

  it("should create, duplicate, and delete canvases in store", () => {
    const store = useCanvasStore.getState();
    const id1 = store.createCanvas();

    expect(useCanvasStore.getState().canvases.length).toBe(1);
    expect(useCanvasStore.getState().activeCanvasId).toBe(id1);

    // Duplicate
    const id2 = store.duplicateCanvas(id1);
    expect(useCanvasStore.getState().canvases.length).toBe(2);
    expect(useCanvasStore.getState().activeCanvasId).toBe(id2);

    // Delete first canvas
    store.deleteCanvas(id1);
    expect(useCanvasStore.getState().canvases.length).toBe(1);
    expect(useCanvasStore.getState().canvases[0].id).toBe(id2);
  });

  it("should export and re-import valid JSON canvas", () => {
    const store = useCanvasStore.getState();
    const id = store.loadExampleCanvas();

    const exportedJson = store.exportCanvasAsJson(id);
    expect(exportedJson).not.toBeNull();

    // Import into fresh store
    useCanvasStore.setState({ canvases: [], activeCanvasId: null });
    const importResult = useCanvasStore.getState().importCanvasFromJson(exportedJson!);
    expect(importResult.success).toBe(true);
    expect(useCanvasStore.getState().canvases.length).toBe(1);
  });

  it("should reject corrupted or invalid JSON import", () => {
    const store = useCanvasStore.getState();
    const badJson = JSON.stringify({ invalidField: 123 });
    const importResult = store.importCanvasFromJson(badJson);

    expect(importResult.success).toBe(false);
    expect(importResult.error).toBeDefined();
  });
});
