"use client";

import { useEffect, useRef, useState } from "react";
import cytoscape, { Core } from "cytoscape";
import { VosNode, VosEdge } from "@/lib/parsers/vosviewer-parser";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Camera,
} from "lucide-react";

interface CytoscapeGraphProps {
  nodes: VosNode[];
  edges: VosEdge[];
  viewMode: "network" | "overlay";
  minYear: number;
  maxYear: number;
  onSelectNode?: (node: VosNode | null) => void;
  onTakeSnapshot?: (dataUrl: string) => void;
}

const CLUSTER_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#f97316", // Orange
  "#64748b", // Slate
];

// Helper to compute overlay color based on year
function getYearColor(year: number | undefined, minYear: number, maxYear: number): string {
  if (!year) return "#94a3b8";
  const span = Math.max(1, maxYear - minYear);
  const ratio = Math.max(0, Math.min(1, (year - minYear) / span));

  // Color gradient: Purple (270) -> Blue (220) -> Green (140) -> Yellow (60)
  // Low ratio (older) = Hue 260 (purple/blue)
  // High ratio (newer) = Hue 50 (bright yellow/amber)
  const hue = 260 - ratio * 210;
  return `hsl(${hue}, 85%, 50%)`;
}

export function CytoscapeGraph({
  nodes,
  edges,
  viewMode,
  minYear,
  maxYear,
  onSelectNode,
  onTakeSnapshot,
}: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<VosNode | null>(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if coordinates x, y exist and are non-zero (VOSviewer preset coordinates)
    const hasPresetCoords = nodes.some((n) => Math.abs(n.x) > 0.0001 || Math.abs(n.y) > 0.0001);

    // Prepare Cytoscape elements
    const elements = [
      ...nodes.map((n) => {
        const clusterColor = CLUSTER_COLORS[(n.cluster - 1) % CLUSTER_COLORS.length];
        const overlayColor = getYearColor(n.avgPubYear, minYear, maxYear);
        const nodeColor = viewMode === "network" ? clusterColor : overlayColor;
        const size = Math.max(24, Math.min(65, 20 + Math.sqrt(n.occurrences) * 6));

        return {
          data: {
            id: n.id,
            label: n.label,
            occurrences: n.occurrences,
            cluster: n.cluster,
            totalLinkStrength: n.totalLinkStrength,
            avgPubYear: n.avgPubYear,
            nodeColor,
            size,
            rawNode: n,
          },
          position: hasPresetCoords ? { x: n.x * 600, y: n.y * 600 } : undefined,
        };
      }),
      ...edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          weight: e.weight,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "data(nodeColor)",
            width: "data(size)",
            height: "data(size)",
            color: "#0f172a",
            "font-size": "10px",
            "font-weight": "bold",
            "text-valign": "bottom",
            "text-margin-y": 4,
            "text-background-color": "rgba(255, 255, 255, 0.85)",
            "text-background-opacity": 0.85,
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
            "border-width": 2,
            "border-color": "#ffffff",
          },
        },
        {
          selector: "edge",
          style: {
            width: "mapData(weight, 1, 30, 1, 4)",
            "line-color": "#cbd5e1",
            opacity: 0.5,
            "curve-style": "bezier",
          },
        },
        {
          selector: ":selected",
          style: {
            "border-width": 4,
            "border-color": "#0284c7",
            "line-color": "#0284c7",
            opacity: 1,
          },
        },
      ],
      layout: hasPresetCoords
        ? { name: "preset" }
        : {
            name: "cose",
            idealEdgeLength: 80,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 40,
            randomize: false,
            componentSpacing: 100,
          },
    });

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      const raw = node.data("rawNode") as VosNode;
      setSelectedNodeData(raw);
      if (onSelectNode) onSelectNode(raw);
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedNodeData(null);
        if (onSelectNode) onSelectNode(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, viewMode, minYear, maxYear, onSelectNode]);

  const handleZoomIn = () => {
    cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    cyRef.current?.fit();
  };

  const handleCaptureSnapshot = () => {
    if (!cyRef.current) return;
    const png = cyRef.current.png({ full: true, scale: 2, bg: "#ffffff" });
    if (onTakeSnapshot) onTakeSnapshot(png);
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2500);
  };

  return (
    <div className="relative w-full h-[540px] bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
      {/* Cytoscape Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Toolbar Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Perbesar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Perkecil (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Pusatkan Graf (Fit View)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <button
          onClick={handleCaptureSnapshot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          title="Simpan Snapshot Gambar Peta"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{snapshotTaken ? "Tersimpan!" : "Snapshot Peta"}</span>
        </button>
      </div>

      {/* Overlay Color Bar Legend (when in overlay view) */}
      {viewMode === "overlay" && (
        <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-1">
          <p className="font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Rata-rata Tahun Terbit (Overlay)
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">{minYear}</span>
            <div className="w-32 h-3 rounded-full bg-gradient-to-r from-purple-600 via-emerald-500 to-amber-400" />
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">{maxYear}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Ungu/Biru = Literatur Lama &bull; Kuning/Emas = Topik Mutakhir
          </p>
        </div>
      )}

      {/* Selected Node Info Card Popup */}
      {selectedNodeData && (
        <div className="absolute top-4 left-4 max-w-xs bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-2 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
              {selectedNodeData.label}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              Klaster {selectedNodeData.cluster}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
            <div>
              <strong>Kemunculan:</strong> {selectedNodeData.occurrences}x
            </div>
            <div>
              <strong>Kekuatan Link:</strong> {selectedNodeData.totalLinkStrength}
            </div>
            {selectedNodeData.avgPubYear && (
              <div className="col-span-2">
                <strong>Rata-rata Terbit:</strong> Tahun {selectedNodeData.avgPubYear}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
