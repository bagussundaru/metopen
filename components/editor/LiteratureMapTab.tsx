"use client";

import { useState } from "react";
import { Canvas, PinnedFinding, Reference } from "@/lib/types/canvas";
import { VosMapResult } from "@/lib/parsers/vosviewer-parser";
import { CytoscapeGraph } from "@/components/network/CytoscapeGraph";
import { VosviewerUploader } from "@/components/network/VosviewerUploader";
import { ScopusUploader } from "@/components/network/ScopusUploader";
import { KeywordTable } from "@/components/network/KeywordTable";
import { GapCandidateList } from "@/components/network/GapCandidateList";
import {
  Network,
  Layers,
  Table,
  Upload,
  FileSpreadsheet,
} from "lucide-react";

interface LiteratureMapTabProps {
  canvas: Canvas;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
}

export function LiteratureMapTab({ canvas, onChange }: LiteratureMapTabProps) {
  const [sourceMode, setSourceMode] = useState<"vosviewer" | "scopus">("vosviewer");
  const [viewMode, setViewMode] = useState<"network" | "overlay" | "table">("network");
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          Peta Literatur Bibliometrik (VOSviewer & Scopus CSV)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Visualisasikan jejaring kata kunci penelitian dari Scopus/Google Scholar untuk memperkuat <strong>kebaruan (novelty)</strong> dan <strong>sintesis research gap</strong> Anda secara objektif.
        </p>
      </div>

      {/* Source Mode Switcher: VOSviewer vs Scopus */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setSourceMode("vosviewer")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
            sourceMode === "vosviewer"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Unggah Berkas VOSviewer (.map & .net)</span>
        </button>

        <button
          onClick={() => setSourceMode("scopus")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
            sourceMode === "scopus"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-300 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Impor CSV Scopus / Google Scholar</span>
        </button>
      </div>

      {/* Uploaders */}
      {sourceMode === "vosviewer" ? (
        <VosviewerUploader onMapLoaded={handleMapLoaded} />
      ) : (
        <ScopusUploader
          onGraphGenerated={handleGraphGenerated}
          onImportReferencesToCanvas={handleImportReferences}
        />
      )}

      {/* Visualization Canvas & Controls */}
      {mapResult ? (
        <div className="space-y-4">
          {/* View Mode Switcher (Network vs Overlay vs Table) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-500 text-[11px] mr-1">Tampilan Peta:</span>
              <button
                onClick={() => setViewMode("network")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === "network"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Klaster Topik (Network View)</span>
              </button>

              <button
                onClick={() => setViewMode("overlay")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === "overlay"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tahun Terbit (Overlay View)</span>
              </button>

              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tabel Kata Kunci</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              {mapResult.nodes.length} kata kunci &bull; {mapResult.edges.length} relasi tautan
            </div>
          </div>

          {/* Render Graph or Table */}
          {viewMode === "table" ? (
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

          {/* Gap Candidates & Pin Section */}
          <GapCandidateList
            nodes={mapResult.nodes}
            edges={mapResult.edges}
            canvas={canvas}
            onPinFinding={handlePinFinding}
            onUnpinFinding={handleUnpinFinding}
          />
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50 space-y-2">
          <Network className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Peta Literatur Belum Dimuat
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Unggah berkas VOSviewer di atas, impor CSV Scopus, atau klik tombol <em>&quot;Muat Sampel&quot;</em> untuk langsung menjelajahi peta literatur.
          </p>
        </div>
      )}
    </div>
  );
}
