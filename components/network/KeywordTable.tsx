"use client";

import { useState } from "react";
import { VosNode } from "@/lib/parsers/vosviewer-parser";
import { Search, ArrowUpDown } from "lucide-react";

interface KeywordTableProps {
  nodes: VosNode[];
  onSelectKeyword?: (node: VosNode) => void;
}

type SortField = "label" | "cluster" | "occurrences" | "totalLinkStrength" | "avgPubYear";

export function KeywordTable({ nodes, onSelectKeyword }: KeywordTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("occurrences");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = nodes.filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === undefined) valA = 0;
    if (valB === undefined) valB = 0;

    if (typeof valA === "string" && typeof valB === "string") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Tabel Analitik Kata Kunci ({nodes.length} Entitas)
        </h3>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kata kunci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-80">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10">
            <tr>
              <th
                onClick={() => handleSort("label")}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-1">
                  <span>Kata Kunci (Keyword)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cluster")}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Klaster</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("occurrences")}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Kemunculan</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("totalLinkStrength")}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Kekuatan Link</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("avgPubYear")}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Rata-rata Tahun</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                  Tidak ada kata kunci yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              sorted.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => onSelectKeyword && onSelectKeyword(n)}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-semibold text-slate-900 dark:text-white capitalize">
                    {n.label}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Klaster {n.cluster}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium text-slate-800 dark:text-slate-200">
                    {n.occurrences}
                  </td>
                  <td className="p-3 text-right font-medium text-slate-800 dark:text-slate-200">
                    {n.totalLinkStrength}
                  </td>
                  <td className="p-3 text-right font-medium text-slate-800 dark:text-slate-200">
                    {n.avgPubYear ? n.avgPubYear.toFixed(1) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
