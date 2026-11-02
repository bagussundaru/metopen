"use client";

import { useEffect, useRef, useState } from "react";
import cytoscape, { Core } from "cytoscape";
import { VosNode, VosEdge } from "@/lib/parsers/vosviewer-parser";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Camera,
  Activity,
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

// Authentic VOSviewer cluster palette
export const VOS_CLUSTER_COLORS = [
  "#e13b3b", // Cluster 1: Coral / Crimson Red (e.g. mortality / hydrogen production)
  "#2ca02c", // Cluster 2: Fresh Leaf Green (e.g. electrocatalysts / public health)
  "#1f77b4", // Cluster 3: Cobalt Blue (e.g. anxiety / depression / electrolytic cells)
  "#ff7f0e", // Cluster 4: Amber Orange (e.g. knowledge / social media)
  "#9467bd", // Cluster 5: Amethyst Purple (e.g. higher education)
  "#bcbd22", // Cluster 6: Olive Yellow
  "#17becf", // Cluster 7: Aqua Teal
  "#e377c2", // Cluster 8: Magenta Rose
  "#8c564b", // Cluster 9: Earth Brown
  "#7f7f7f", // Cluster 10: Slate Gray
];

// Helper to compute overlay color based on publication year (Viridis-style VOSviewer gradient)
function getYearColor(year: number | undefined, minYear: number, maxYear: number): string {
  if (!year) return "#94a3b8";
  const span = Math.max(1, maxYear - minYear);
  const ratio = Math.max(0, Math.min(1, (year - minYear) / span));

  // Multi-stop gradient: Deep Purple (0%) -> Ocean Teal (35%) -> Emerald (65%) -> Golden Yellow (100%)
  if (ratio < 0.35) {
    const t = ratio / 0.35;
    // Purple (68, 1, 84) -> Teal (33, 145, 140)
    const r = Math.round(68 + (33 - 68) * t);
    const g = Math.round(1 + (145 - 1) * t);
    const b = Math.round(84 + (140 - 84) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (ratio < 0.7) {
    const t = (ratio - 0.35) / 0.35;
    // Teal (33, 145, 140) -> Emerald (94, 201, 98)
    const r = Math.round(33 + (94 - 33) * t);
    const g = Math.round(145 + (201 - 145) * t);
    const b = Math.round(140 + (98 - 140) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (ratio - 0.7) / 0.3;
    // Emerald (94, 201, 98) -> Gold Yellow (253, 231, 37)
    const r = Math.round(94 + (253 - 94) * t);
    const g = Math.round(201 + (231 - 201) * t);
    const b = Math.round(98 + (37 - 98) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
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
  const [hoveredNodeData, setHoveredNodeData] = useState<VosNode | null>(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [forceLayoutMode, setForceLayoutMode] = useState<"preset" | "spring">("preset");

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    // Check if coordinates x, y exist and are non-zero (preset VOSviewer coordinates)
    const hasPresetCoords = nodes.some((n) => Math.abs(n.x) > 0.0001 || Math.abs(n.y) > 0.0001);

    // Calculate node occurrence bounds for proportional scaling
    const occurrences = nodes.map((n) => n.occurrences || 1);
    const minOcc = Math.min(...occurrences);
    const maxOcc = Math.max(...occurrences);
    const occSpan = Math.max(1, maxOcc - minOcc);

    // Build map of nodes for quick edge source color lookup
    const nodeMap = new Map<string, VosNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    // Prepare Cytoscape elements
    const elements = [
      ...nodes.map((n) => {
        const clusterColor = VOS_CLUSTER_COLORS[(n.cluster - 1) % VOS_CLUSTER_COLORS.length];
        const overlayColor = getYearColor(n.avgPubYear, minYear, maxYear);
        const nodeColor = viewMode === "network" ? clusterColor : overlayColor;

        // VOSviewer-style proportional sizing:
        // Smallest node: ~22px diameter
        // Largest prominent node: ~72px diameter
        const norm = (n.occurrences - minOcc) / occSpan;
        const size = Math.round(22 + Math.sqrt(norm) * 52);

        // Scaled typography:
        // Prominent keywords get large, bold text; minor nodes get compact text
        const fontSize = Math.round(9.5 + Math.sqrt(norm) * 11.5);
        const fontWeight = norm > 0.35 ? "800" : norm > 0.15 ? "700" : "600";
        const zIndex = Math.round(10 + norm * 80);

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
            fontSize: `${fontSize}px`,
            fontWeight,
            zIndex,
            rawNode: n,
          },
          position:
            hasPresetCoords && forceLayoutMode === "preset"
              ? { x: n.x * 720, y: n.y * 720 }
              : undefined,
        };
      }),
      ...edges.map((e) => {
        const sourceNode = nodeMap.get(e.source);
        const edgeColor = sourceNode
          ? VOS_CLUSTER_COLORS[(sourceNode.cluster - 1) % VOS_CLUSTER_COLORS.length]
          : "#94a3b8";

        return {
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            weight: e.weight,
            edgeColor,
          },
        };
      }),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      boxSelectionEnabled: false,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "data(nodeColor)",
            "background-opacity": 0.88,
            width: "data(size)",
            height: "data(size)",
            color: "#0f172a",
            "font-size": "data(fontSize)",
            "font-weight": "bold",
            "font-family":
              "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            "text-max-width": "115px",
            // VOSviewer crisp halo effect: clean white outline with no heavy box
            "text-outline-color": "#ffffff",
            "text-outline-width": 2.5,
            "text-outline-opacity": 0.96,
            "border-width": 1.5,
            "border-color": "#ffffff",
            "border-opacity": 0.9,
            "z-index": ((ele: cytoscape.NodeSingular) => ele.data("zIndex") || 10) as unknown as number,
            "transition-property":
              "opacity, background-opacity, border-width, border-color, width, height",
            "transition-duration": 0.2,
          },
        },
        {
          selector: "edge",
          style: {
            width: "mapData(weight, 1, 30, 0.9, 3.5)",
            "line-color": "data(edgeColor)",
            opacity: 0.28,
            "curve-style": "bezier",
            "transition-property": "opacity, line-color, width",
            "transition-duration": 0.2,
          },
        },
        {
          selector: ":selected",
          style: {
            "border-width": 3.5,
            "border-color": "#0284c7",
            "border-opacity": 1,
            "z-index": 9999,
          },
        },
      ],
      layout:
        hasPresetCoords && forceLayoutMode === "preset"
          ? {
              name: "preset",
              fit: true,
              padding: 50,
            }
          : {
              name: "cose",
              idealEdgeLength: 55,
              nodeOverlap: 25,
              refresh: 20,
              fit: true,
              padding: 50,
              randomize: false,
              componentSpacing: 70,
              nodeRepulsion: 380000,
              edgeElasticity: 0.45,
              gravity: 0.3,
              numIter: 800,
            },
    });

    // Interactive Ego-Network Hover Effect (VOSviewer authentic focus mode)
    cy.on("mouseover", "node", (evt) => {
      const node = evt.target;
      const raw = node.data("rawNode") as VosNode;
      setHoveredNodeData(raw);

      const neighborhood = node.closedNeighborhood();

      // Dim non-connected elements to soft ghosting
      cy.elements().not(neighborhood).style({
        opacity: 0.08,
      });

      // Highlight connected neighbor nodes
      neighborhood.nodes().style({
        opacity: 1,
      });

      // Highlight connecting edges as vibrant, thick arcs
      neighborhood.edges().style({
        opacity: 0.88,
        width: 3.2,
        "z-index": 998,
      });

      // Highlight the focused hovered node
      node.style({
        "border-width": 3.5,
        "border-color": "#0f172a",
        "border-opacity": 1,
        "z-index": 9999,
      });
    });

    cy.on("mouseout", "node", () => {
      setHoveredNodeData(null);
      // Restore default stylesheet appearance smoothly
      cy.elements().removeStyle();
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
  }, [nodes, edges, viewMode, minYear, maxYear, forceLayoutMode, onSelectNode]);

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

  const activeNode = hoveredNodeData || selectedNodeData;

  return (
    <div className="relative w-full h-[580px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden select-none">
      {/* Cytoscape Canvas Container with Authentic White Background */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-white" />

      {/* Official VOSviewer Watermark / Branding Badge */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm pointer-events-none">
        <div className="flex items-center -space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#17becf] shadow-xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2ca02c] shadow-xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff7f0e] shadow-xs" />
        </div>
        <span className="text-xs font-black tracking-tight text-slate-800">VOSviewer</span>
      </div>

      {/* Floating Toolbar Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() =>
            setForceLayoutMode((prev) => (prev === "preset" ? "spring" : "preset"))
          }
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            forceLayoutMode === "spring"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title="Alihkan Antara Tata Letak Klaster VOSviewer dan Fisika Spring (CoSE)"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {forceLayoutMode === "spring" ? "Fisika (CoSE)" : "Klaster Asli"}
          </span>
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          title="Perbesar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          title="Perkecil (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          title="Pusatkan Graf (Fit View)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />
        <button
          onClick={handleCaptureSnapshot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          title="Simpan Snapshot Gambar Peta Siap Kumpul"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{snapshotTaken ? "Tersimpan!" : "Snapshot Peta"}</span>
        </button>
      </div>

      {/* Overlay Color Bar Legend (Overlay View: Viridis-style gradient) */}
      {viewMode === "overlay" && (
        <div className="absolute bottom-4 left-32 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-1">
          <p className="font-extrabold text-[10px] text-slate-700 uppercase tracking-wider">
            Rata-rata Tahun Terbit (Overlay)
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#440154]">{minYear}</span>
            <div className="w-36 h-3 rounded-full bg-gradient-to-r from-[#440154] via-[#21918c] to-[#fde725] shadow-inner" />
            <span className="text-[11px] font-bold text-[#b58900]">{maxYear}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Ungu/Biru = Literatur Lama &bull; Kuning = Topik Mutakhir
          </p>
        </div>
      )}

      {/* Active Node Live Card Popup (Hover or Click) */}
      {activeNode && (
        <div className="absolute top-4 left-4 z-20 max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg space-y-2 text-xs animate-in fade-in">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-extrabold text-sm text-slate-900 capitalize tracking-tight">
              {activeNode.label}
            </h4>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs shrink-0"
              style={{
                backgroundColor:
                  VOS_CLUSTER_COLORS[(activeNode.cluster - 1) % VOS_CLUSTER_COLORS.length],
              }}
            >
              Klaster {activeNode.cluster}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Kemunculan</span>
              <strong className="text-slate-900 text-xs">{activeNode.occurrences}x</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Kekuatan Tautan</span>
              <strong className="text-slate-900 text-xs">{activeNode.totalLinkStrength}</strong>
            </div>
            {activeNode.avgPubYear && (
              <div className="col-span-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 text-[10px]">Rata-rata Tahun Terbit:</span>
                <strong className="text-blue-700 font-bold">{activeNode.avgPubYear}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
