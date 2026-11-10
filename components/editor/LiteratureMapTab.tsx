"use client";

import { useState } from "react";
import { Canvas, PinnedFinding, Reference } from "@/lib/types/canvas";
import { VosMapResult } from "@/lib/parsers/vosviewer-parser";
import { CytoscapeGraph } from "@/components/network/CytoscapeGraph";
import { VosviewerUploader } from "@/components/network/VosviewerUploader";
import { ScopusUploader } from "@/components/network/ScopusUploader";
import { KeywordTable } from "@/components/network/KeywordTable";
import { GapCandidateList } from "@/components/network/GapCandidateList";
import { LiteratureSearchDirect } from "@/components/network/LiteratureSearchDirect";
import { BibliometricMethodologyPanel } from "@/components/network/BibliometricMethodologyPanel";
import {
  Network,
  Layers,
  Table,
  Upload,
  FileSpreadsheet,
  Compass,
  BookOpen,
} from "lucide-react";

interface LiteratureMapTabProps {
  canvas: Canvas;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
  onNavigateToWizard?: () => void;
  onNavigateToTasks?: () => void;
}

export function LiteratureMapTab({
  canvas,
  onChange,
  onNavigateToWizard,
  onNavigateToTasks,
}: LiteratureMapTabProps) {
  // Default to "search" so user directly searches and generates VOSviewer map without uploading!
  const [sourceMode, setSourceMode] = useState<"search" | "vosviewer" | "scopus">("search");
  const [viewMode, setViewMode] = useState<"network" | "overlay" | "table" | "methodology">("network");
  const [mapResult, setMapResult] = useState<VosMapResult | null>(null);

  const handleMapLoaded = (result: VosMapResult) => {
    setMapResult(result);
    onChange((prev) => ({
      ...prev,
      literatureMap: {
        ...prev.literatureMap,
        sourceType: "vosviewer",
        nodeCount: result.nodes.length,
        edgeCount: result.edges.length,
        pinnedFindings: prev.literatureMap?.pinnedFindings || [],
      },
    }));
  };

  const handleGraphGenerated = (result: VosMapResult) => {
    setMapResult(result);
    onChange((prev) => ({
      ...prev,
      literatureMap: {
        ...prev.literatureMap,
        sourceType: "scopus_csv",
        nodeCount: result.nodes.length,
        edgeCount: result.edges.length,
        pinnedFindings: prev.literatureMap?.pinnedFindings || [],
      },
    }));
  };

  const handleImportReferences = (newRefs: Reference[]) => {
    onChange((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        references: [...newRefs, ...(prev.background.references || [])],
      },
    }));
  };

  const handlePinFinding = (finding: PinnedFinding) => {
    onChange((prev) => {
      const current = prev.literatureMap?.pinnedFindings || [];
      return {
        ...prev,
        literatureMap: {
          ...prev.literatureMap,
          nodeCount: prev.literatureMap?.nodeCount || 0,
          edgeCount: prev.literatureMap?.edgeCount || 0,
          pinnedFindings: [finding, ...current],
        },
      };
    });
  };

  const handleUnpinFinding = (id: string) => {
    onChange((prev) => {
      const current = prev.literatureMap?.pinnedFindings || [];
      return {
        ...prev,
        literatureMap: {
          ...prev.literatureMap,
          nodeCount: prev.literatureMap?.nodeCount || 0,
          edgeCount: prev.literatureMap?.edgeCount || 0,
          pinnedFindings: current.filter((p) => p.id !== id),
        },
      };
    });
  };

  const handleTakeSnapshot = (dataUrl: string) => {
    onChange((prev) => ({
      ...prev,
      literatureMap: {
        ...prev.literatureMap,
        nodeCount: prev.literatureMap?.nodeCount || 0,
        edgeCount: prev.literatureMap?.edgeCount || 0,
        pinnedFindings: prev.literatureMap?.pinnedFindings || [],
        snapshotImage: dataUrl,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] tracking-wider uppercase border border-blue-200">
            Acuan Utama Dosen: Scopus Database
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          Pusat Literatur Scopus &amp; Peta Bibliometrik VOSviewer
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Fokus utama pada penelusuran artikel ilmiah dan tinjauan bibliometrik terindeks Scopus. Bangun visualisasi jejaring VOSviewer secara langsung atau impor berkas ekspor Scopus CSV.
        </p>
      </div>

      {/* 3 Source Modes Switcher: Direct Search vs Upload VOSviewer vs Upload Scopus */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSourceMode("search")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            sourceMode === "search"
              ? "bg-blue-600 text-white shadow-sm font-bold"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
          }`}
        >
          <Compass className="w-4 h-4 text-amber-300" />
          <span>🔍 Scopus Search (Fokus Utama)</span>
        </button>

        <button
          type="button"
          onClick={() => setSourceMode("scopus")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            sourceMode === "scopus"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-300 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Impor CSV Ekspor Scopus</span>
        </button>

        <button
          type="button"
          onClick={() => setSourceMode("vosviewer")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            sourceMode === "vosviewer"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Unggah Berkas VOSviewer (.map &amp; .net)</span>
        </button>
      </div>

      {/* Mode 1: DIRECT SEARCH (NO UPLOAD NEEDED) */}
      {sourceMode === "search" && (
        <LiteratureSearchDirect
          canvas={canvas}
          onChange={onChange}
          onPinFinding={handlePinFinding}
          onUnpinFinding={handleUnpinFinding}
          onTakeSnapshot={handleTakeSnapshot}
          onNavigateToWizard={onNavigateToWizard}
          onNavigateToTasks={onNavigateToTasks}
        />
      )}

      {/* Mode 2: UPLOAD VOSVIEWER */}
      {sourceMode === "vosviewer" && (
        <>
          <VosviewerUploader onMapLoaded={handleMapLoaded} />
          {mapResult && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-slate-500 text-[11px] mr-1">Tampilan Peta:</span>
                  <button
                    onClick={() => setViewMode("network")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      viewMode === "network"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Klaster Topik</span>
                  </button>
                  <button
                    onClick={() => setViewMode("overlay")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      viewMode === "overlay"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tahun Terbit</span>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      viewMode === "table"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Tabel Kata Kunci</span>
                  </button>
                  <button
                    onClick={() => setViewMode("methodology")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      viewMode === "methodology"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Metode Bibliometrik (Bab 3)</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  {mapResult.nodes.length} kata kunci &bull; {mapResult.edges.length} relasi tautan
                </div>
              </div>

              {viewMode === "methodology" ? (
                <BibliometricMethodologyPanel
                  canvas={canvas}
                  query={canvas.title.subject || "Analisis Bibliometrik VOSviewer"}
                  booleanQuery=""
                  nodes={mapResult.nodes}
                  edges={mapResult.edges}
                  articles={[]}
                  minYear={mapResult.minYear}
                  maxYear={mapResult.maxYear}
                  onChange={onChange}
                />
              ) : viewMode === "table" ? (
                <KeywordTable nodes={mapResult.nodes} />
              ) : (
                <CytoscapeGraph
                  nodes={mapResult.nodes}
                  edges={mapResult.edges}
                  viewMode={viewMode}
                  minYear={mapResult.minYear}
                  maxYear={mapResult.maxYear}
                  onTakeSnapshot={handleTakeSnapshot}
                />
              )}

              <GapCandidateList
                nodes={mapResult.nodes}
                edges={mapResult.edges}
                canvas={canvas}
                onPinFinding={handlePinFinding}
                onUnpinFinding={handleUnpinFinding}
              />
            </div>
          )}
        </>
      )}

      {/* Mode 3: UPLOAD SCOPUS CSV */}
      {sourceMode === "scopus" && (
        <>
          <ScopusUploader
            onGraphGenerated={handleGraphGenerated}
            onImportReferencesToCanvas={handleImportReferences}
          />
          {mapResult && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-slate-500 text-[11px] mr-1">Tampilan Peta:</span>
                  <button
                    onClick={() => setViewMode("network")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      viewMode === "network"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Klaster Topik</span>
                  </button>
                  <button
                    onClick={() => setViewMode("overlay")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      viewMode === "overlay"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tahun Terbit</span>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      viewMode === "table"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Tabel Kata Kunci</span>
                  </button>
                  <button
                    onClick={() => setViewMode("methodology")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      viewMode === "methodology"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Metode Bibliometrik (Bab 3)</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  {mapResult.nodes.length} kata kunci &bull; {mapResult.edges.length} relasi tautan
                </div>
              </div>

              {viewMode === "methodology" ? (
                <BibliometricMethodologyPanel
                  canvas={canvas}
                  query={canvas.title.subject || "Analisis Bibliometrik VOSviewer"}
                  booleanQuery=""
                  nodes={mapResult.nodes}
                  edges={mapResult.edges}
                  articles={[]}
                  minYear={mapResult.minYear}
                  maxYear={mapResult.maxYear}
                  onChange={onChange}
                />
              ) : viewMode === "table" ? (
                <KeywordTable nodes={mapResult.nodes} />
              ) : (
                <CytoscapeGraph
                  nodes={mapResult.nodes}
                  edges={mapResult.edges}
                  viewMode={viewMode}
                  minYear={mapResult.minYear}
                  maxYear={mapResult.maxYear}
                  onTakeSnapshot={handleTakeSnapshot}
                />
              )}

              <GapCandidateList
                nodes={mapResult.nodes}
                edges={mapResult.edges}
                canvas={canvas}
                onPinFinding={handlePinFinding}
                onUnpinFinding={handleUnpinFinding}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
