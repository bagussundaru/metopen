"use client";

import { useMemo } from "react";
import { VosNode, VosEdge } from "@/lib/parsers/vosviewer-parser";
import { Canvas, PinnedFinding } from "@/lib/types/canvas";
import {
  Pin,
  Sparkles,
  TrendingUp,
  GitBranch,
  Target,
  Trash2,
} from "lucide-react";

interface GapCandidateListProps {
  nodes: VosNode[];
  edges: VosEdge[];
  canvas: Canvas;
  onPinFinding: (finding: PinnedFinding) => void;
  onUnpinFinding: (id: string) => void;
}

export function GapCandidateList({
  nodes,
  edges,
  canvas,
  onPinFinding,
  onUnpinFinding,
}: GapCandidateListProps) {
  const currentYear = new Date().getFullYear();
  const pinnedList = canvas.literatureMap?.pinnedFindings || [];

  // 1. Emerging Topics Heuristic: Recent average publication year (>= currentYear - 2) but occurrences <= 40th percentile
  const emergingTopics = useMemo(() => {
    return nodes
      .filter((n) => n.avgPubYear && n.avgPubYear >= currentYear - 2)
      .sort((a, b) => (b.avgPubYear || 0) - (a.avgPubYear || 0))
      .slice(0, 3);
  }, [nodes, currentYear]);

  // 2. Isolated Crossings Heuristic: Pairs of nodes from different clusters with no edge or edge weight <= 2
  const isolatedCrossings = useMemo(() => {
    const edgePairs = new Set(edges.map((e) => `${e.source}___${e.target}`));
    const edgePairsRev = new Set(edges.map((e) => `${e.target}___${e.source}`));

    const candidates: { nodeA: VosNode; nodeB: VosNode; label: string }[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nA = nodes[i];
        const nB = nodes[j];

        if (nA.cluster !== nB.cluster) {
          const key1 = `${nA.id}___${nB.id}`;
          const key2 = `${nB.id}___${nA.id}`;
          const hasDirectLink = edgePairs.has(key1) || edgePairsRev.has(key1) || edgePairs.has(key2) || edgePairsRev.has(key2);

          if (!hasDirectLink && nA.occurrences >= 2 && nB.occurrences >= 2) {
            candidates.push({
              nodeA: nA,
              nodeB: nB,
              label: `Persilangan '${nA.label}' (Klaster ${nA.cluster}) × '${nB.label}' (Klaster ${nB.cluster})`,
            });
            if (candidates.length >= 2) break;
          }
        }
      }
      if (candidates.length >= 2) break;
    }

    return candidates;
  }, [nodes, edges]);

  // 3. User's keywords matching
  const userMatchedNodes = useMemo(() => {
    const terms = [
      canvas.title.subject,
      canvas.title.intervention,
      canvas.title.outcome,
    ]
      .filter(Boolean)
      .map((t) => t.toLowerCase());

    return nodes.filter((n) => {
      const label = n.label.toLowerCase();
      return terms.some((t) => t.includes(label) || label.includes(t));
    });
  }, [nodes, canvas.title]);

  const isPinned = (label: string) => {
    return pinnedList.some((p) => p.label === label);
  };

  const handlePin = (type: PinnedFinding["type"], label: string, description: string) => {
    const finding: PinnedFinding = {
      id: crypto.randomUUID(),
      type,
      label,
      description,
      pinnedAt: new Date().toISOString(),
    };
    onPinFinding(finding);
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Analisis Kandidat Research Gap (Bukti Pemetaan Literatur)</span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Heuristik rekomendasi celah riset dari peta bibliometrik. Sematkan temuan untuk disertakan pada kanvas tesis & ekspor laporan.
        </p>
      </div>

      {/* Pinned Findings List */}
      {pinnedList.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
          <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Temuan Gap yang Disematkan ke Kanvas ({pinnedList.length})</span>
          </span>
          <div className="space-y-1.5">
            {pinnedList.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 flex items-start justify-between gap-2"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white capitalize">{p.label}</p>
                  <p className="text-[11px] text-slate-500">{p.description}</p>
                </div>
                <button
                  onClick={() => onUnpinFinding(p.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600"
                  title="Hapus Sematan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Emerging Topics */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          <span>1. Topik Baru Berkembang (Rata-rata Terbit &ge; {currentYear - 2})</span>
        </h4>
        <div className="space-y-2">
          {emergingTopics.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">
              Tidak ada topik baru berkembang yang terdeteksi pada dataset ini.
            </p>
          ) : (
            emergingTopics.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white capitalize">{n.label}</p>
                  <p className="text-[11px] text-slate-500">
                    Rata-rata terbit: <strong>Tahun {n.avgPubYear}</strong> &bull; Kemunculan: {n.occurrences}x &bull; Klaster {n.cluster}
                  </p>
                </div>
                <button
                  disabled={isPinned(n.label)}
                  onClick={() =>
                    handlePin(
                      "emerging_topic",
                      n.label,
                      `Topik baru berkembang dengan rata-rata publikasi tahun ${n.avgPubYear} (Klaster ${n.cluster}).`
                    )
                  }
                  className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white transition-colors"
                >
                  {isPinned(n.label) ? "Disematkan" : "Sematkan"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Isolated Crossings */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <GitBranch className="w-4 h-4 text-purple-500" />
          <span>2. Persilangan Antar Klaster yang Belum Banyak Diteliti</span>
        </h4>
        <div className="space-y-2">
          {isolatedCrossings.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">
              Semua klaster telah terhubung secara rapat pada ambang batas saat ini.
            </p>
          ) : (
            isolatedCrossings.map((cross, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{cross.label}</p>
                  <p className="text-[11px] text-slate-500">
                    Kedua kata kunci aktif diteliti namun tautan langsung antar klaster masih nol/sangat minim.
                  </p>
                </div>
                <button
                  disabled={isPinned(cross.label)}
                  onClick={() =>
                    handlePin(
                      "isolated_cross",
                      cross.label,
                      `Persilangan topik lintas klaster (${cross.nodeA.label} & ${cross.nodeB.label}) dengan kekuatan tautan minim, berpotensi kebaruan tinggi.`
                    )
                  }
                  className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition-colors"
                >
                  {isPinned(cross.label) ? "Disematkan" : "Sematkan"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. User Matched Nodes */}
      {userMatchedNodes.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>3. Posisi Topik Kanvas Anda pada Peta Literatur</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {userMatchedNodes.map((n) => (
              <span
                key={n.id}
                className="px-2.5 py-1 rounded-xl text-[11px] bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-semibold capitalize"
              >
                {n.label} &bull; Klaster {n.cluster} ({n.occurrences}x)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
