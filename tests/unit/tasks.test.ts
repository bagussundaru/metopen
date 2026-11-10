import { describe, it, expect, beforeEach } from "vitest";
import { useTaskStore } from "@/lib/store/task-store";
import { createCivilEngineeringExampleCanvas } from "@/lib/store/default-canvas";
import {
  createEmptyTask1,
  createBenchmarkTask1CivilEngineering,
  createEmptyTask2,
  createBenchmarkTask2CivilEngineering,
} from "@/lib/store/default-tasks";

describe("Course Assignments: Task 1 and Task 2 Store & Templates", () => {
  beforeEach(() => {
    useTaskStore.setState({
      task1: createBenchmarkTask1CivilEngineering(),
      task2: createBenchmarkTask2CivilEngineering(),
      activeTaskTab: "task1",
      isHydrated: true,
    });
  });

  it("verifies Task 1 benchmark has 3 valid civil engineering bibliometric papers with 13 aspects", () => {
    const emptyT1 = createEmptyTask1();
    expect(emptyT1.papers.length).toBe(3);
    expect(emptyT1.papers[0].title).toBe("");

    const t1 = createBenchmarkTask1CivilEngineering();
    expect(t1.papers.length).toBe(3);

    t1.papers.forEach((p) => {
      expect(p.title.length).toBeGreaterThan(10);
      expect(p.authors.length).toBeGreaterThan(3);
      expect(p.journal.length).toBeGreaterThan(3);
      expect(p.indexingDb).toContain("Scopus");
      expect(p.topicAndRelevance.length).toBeGreaterThan(20);
      expect(p.generalGoalAndGap.length).toBeGreaterThan(20);
      expect(p.researchQuestions.length).toBeGreaterThan(10);
      expect(p.booleanQuery).toContain("TITLE-ABS-KEY");
      expect(p.toolsAndTechniques).toContain("VOSviewer");
      expect(p.mainFindings.length).toBeGreaterThan(20);
      expect(p.academicValueAndTouch.length).toBeGreaterThan(20);
      expect(p.limitationsAndBias.length).toBeGreaterThan(20);
      expect(p.futureResearchOpportunities.length).toBeGreaterThan(20);
    });
  });

  it("verifies Task 2 benchmark has 7 complete required components including PRISMA data", () => {
    const emptyT2 = createEmptyTask2();
    expect(emptyT2.theme).toBe("");
    expect(emptyT2.researchQuestions.length).toBeGreaterThanOrEqual(5);
    expect(emptyT2.researchQuestions.length).toBeLessThanOrEqual(7);

    const t2 = createBenchmarkTask2CivilEngineering();
    expect(t2.theme.length).toBeGreaterThan(10);
    expect(t2.proposedTitle.length).toBeGreaterThan(10);
    expect(t2.urgencyAndImportance.length).toBeGreaterThan(20);
    expect(t2.researchQuestions.length).toBeGreaterThanOrEqual(5);
    expect(t2.researchQuestions.length).toBeLessThanOrEqual(7);
    expect(t2.booleanSearchString).toContain("TITLE-ABS-KEY");
    expect(t2.prisma.recordsIdentified).toBeGreaterThan(0);
    expect(t2.prisma.studiesIncluded).toBeGreaterThan(0);
    expect(t2.vosviewerPlan.length).toBeGreaterThan(20);
    expect(t2.biblioshinyPlan.length).toBeGreaterThan(20);
    expect(t2.knowledgeMappingContribution.length).toBeGreaterThan(20);
  });

  it("updates student metadata synchronously across Task 1 and Task 2", () => {
    const store = useTaskStore.getState();
    store.updateStudentMeta({
      studentName: "Ahmad Dahlan",
      nim: "24052380099",
      specialization: "PSDAL (Sumber Daya Air & Lingkungan)",
    });

    const state = useTaskStore.getState();
    expect(state.task1.meta.studentName).toBe("Ahmad Dahlan");
    expect(state.task1.meta.nim).toBe("24052380099");
    expect(state.task1.meta.specialization).toBe("PSDAL (Sumber Daya Air & Lingkungan)");

    expect(state.task2.meta.studentName).toBe("Ahmad Dahlan");
    expect(state.task2.meta.nim).toBe("24052380099");
    expect(state.task2.meta.specialization).toBe("PSDAL (Sumber Daya Air & Lingkungan)");
  });

  it("can export and import tasks as JSON backup", () => {
    const store = useTaskStore.getState();
    store.updateStudentMeta({ studentName: "Test Student", nim: "12345" });

    const json = store.exportTasksAsJson();
    expect(json).toContain("Test Student");
    expect(json).toContain("12345");

    // Reset
    store.resetTask1();
    store.resetTask2();

    // Re-import
    const res = store.importTasksFromJson(json);
    expect(res.success).toBe(true);

    const reimported = useTaskStore.getState();
    expect(reimported.task1.meta.studentName).toBe("Test Student");
    expect(reimported.task2.meta.studentName).toBe("Test Student");
  });

  it("assigns paper from Scopus search directly into Task 1 slot", () => {
    const store = useTaskStore.getState();
    store.setPaperFromScopus(0, {
      title: "Bibliometric Review of Fly Ash Alkali-Activated Concrete",
      authors: "Ahmad, J., Naqash, M. T.",
      year: 2026,
      journal: "Buildings",
      doi: "10.3390/buildings16153051",
      citationCount: 42,
      booleanQuery: 'TITLE-ABS-KEY("fly ash" AND "geopolymer")',
      abstract: "This paper reviews mechanical properties and durability performance.",
      keywords: ["Fly Ash", "Geopolymer Concrete", "Compressive Strength"],
    });

    const state = useTaskStore.getState();
    const paper1 = state.task1.papers[0];
    expect(paper1.title).toBe("Bibliometric Review of Fly Ash Alkali-Activated Concrete");
    expect(paper1.journal).toBe("Buildings");
    expect(paper1.citationCount).toBe(42);
    expect(paper1.indexingDb).toContain("Scopus Q1");
    expect(paper1.booleanQuery).toContain("fly ash");
  });

  it("synchronizes Scopus search query and actual PRISMA count to Task 2", () => {
    const store = useTaskStore.getState();
    store.syncFromLiteratureSearch({
      query: 'TITLE-ABS-KEY("fly ash" AND "geopolymer concrete") AND DOCTYPE(ar OR re)',
      totalFound: 145,
      topic: "Fly Ash Geopolymer Concrete",
    });

    const state = useTaskStore.getState();
    expect(state.task2.booleanSearchString).toContain("fly ash");
    expect(state.task2.prisma.recordsIdentified).toBe(145);
    expect(state.task2.prisma.studiesIncluded).toBeGreaterThan(0);
    expect(state.task2.theme).toBe("Fly Ash Geopolymer Concrete");
  });

  it("synchronizes thesis canvas from Wizard into Task 2 research design", () => {
    const store = useTaskStore.getState();
    const canvas = createCivilEngineeringExampleCanvas();
    store.syncFromCanvas(canvas);

    const state = useTaskStore.getState();
    expect(state.task2.proposedTitle).toBe(canvas.title.composed);
    expect(state.task2.theme).toBe(canvas.title.subject);
    expect(state.task2.urgencyAndImportance).toContain(canvas.background.sentences[0]);
    expect(state.task2.unansweredResearchGap).toBe(canvas.background.sentences[1]);
  });
});
