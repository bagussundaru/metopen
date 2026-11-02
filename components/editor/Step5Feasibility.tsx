"use client";

import { Canvas, RubricKey } from "@/lib/types/canvas";
import { RubricCalculationResult } from "@/lib/validators/rubric-scorer";
import { AiReviewSection } from "@/components/ai/AiReviewSection";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  Award,
} from "lucide-react";

interface Step5FeasibilityProps {
  canvas: Canvas;
  rubric: RubricCalculationResult;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
}

const RUBRIC_CRITERIA: {
  key: RubricKey;
  label: string;
  desc4: string;
  desc1: string;
}[] = [
  {
    key: "gapClarity",
    label: "1. Kejelasan Gap Riset",
    desc4: "Gap sangat spesifik, didasarkan pada sintesis ≥ 5 literatur mutakhir (Scopus/Google Scholar).",
    desc1: "Gap bersifat umum, tidak memiliki rujukan jurnal ilmiah yang jelas.",
  },
  {
    key: "novelty",
    label: "2. Kebaruan (Novelty)",
    desc4: "Kontribusi nyata pada mekanisme/variabel/metode, bebas jebakan lokasi & software semu.",
    desc1: "Kebaruan semu (hanya ganti nama lokasi atau sekadar menjalankan software komputasi).",
  },
  {
    key: "engineeringRelevance",
    label: "3. Relevansi Rekayasa",
    desc4: "Menjawab persoalan rekayasa nyata dengan besaran/parameter teknis terukur dan standar acuan.",
    desc1: "Manfaat rekayasa tidak jelas atau parameter hasil ukur bersifat abstrak/kualitatif.",
  },
  {
    key: "methodFit",
    label: "4. Ketepatan Metode",
    desc4: "Metode selaras dengan pertanyaan riset dan didukung standar pengujian baku (SNI/ASTM).",
    desc1: "Metode tidak mampu menjawab pertanyaan riset atau tidak ada standar baku.",
  },
  {
    key: "dataFeasibility",
    label: "5. Kelayakan Data",
    desc4: "Semua data tersedia atau terjamin aksesnya, durasi realistis dalam masa studi S2 (≤ 24 minggu).",
    desc1: "Data masih belum pasti (uncertain), risiko tinggi penelitian terhenti di tengah jalan.",
  },
];

export function Step5Feasibility({ canvas, rubric, onChange }: Step5FeasibilityProps) {
  const selfScores = canvas.feasibility.selfScores;

  const updateSelfScore = (key: RubricKey, val: 1 | 2 | 3 | 4) => {
    onChange((prev) => ({
      ...prev,
      feasibility: {
        ...prev.feasibility,
        selfScores: {
          ...prev.feasibility.selfScores,
          [key]: val,
        },
      },
    }));
  };

  const updateNotes = (notes: string) => {
    onChange((prev) => ({
      ...prev,
      feasibility: { ...prev.feasibility, notes },
    }));
  };

  // SVG Radar Chart Coordinates Generator
  const radius = 90;
  const centerX = 120;
  const centerY = 120;
  const numAxes = 5;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 4) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const selfPoints = RUBRIC_CRITERIA.map((crit, idx) => {
    const score = selfScores[crit.key] || 3;
    const { x, y } = getCoordinates(score, idx);
    return `${x},${y}`;
  }).join(" ");

  const autoPoints = RUBRIC_CRITERIA.map((crit, idx) => {
    const score = rubric.scores[crit.key] || 3;
    const { x, y } = getCoordinates(score, idx);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Langkah 5: Validasi Kelayakan & Rubrik Evaluasi Dosen
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Bandingkan evaluasi mandiri Anda dengan skor otomatis sistem untuk memastikan proposal siap diseminarkan di depan dosen pembimbing.
        </p>
      </div>

      {/* Readiness Status Banner */}
      <div
        className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
          rubric.overallStatus === "ready"
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
            : rubric.overallStatus === "major_revision"
            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
            : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${
              rubric.overallStatus === "ready"
                ? "bg-emerald-600 text-white"
                : rubric.overallStatus === "major_revision"
                ? "bg-rose-600 text-white"
                : "bg-amber-600 text-white"
            }`}
          >
            {rubric.overallStatus === "ready" ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : rubric.overallStatus === "major_revision" ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              Status Kelayakan Topik Tesis
            </span>
            <h3 className="text-lg font-bold mt-0.5">{rubric.statusText}</h3>
            <p className="text-xs opacity-90 mt-1">
              Rata-rata Skor: <strong>{rubric.averageScore} / 4.0</strong> (Ambang siap diajukan: &ge; 3.5 tanpa error).
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart & Overview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-around gap-6">
        {/* SVG Radar Chart */}
        <div className="flex flex-col items-center">
          <svg width={240} height={240} className="overflow-visible">
            {/* Concentric Grid Circles for Levels 1 to 4 */}
            {[1, 2, 3, 4].map((level) => (
              <circle
                key={level}
                cx={centerX}
                cy={centerY}
                r={(level / 4) * radius}
                fill="none"
                stroke="currentColor"
                strokeDasharray="2 2"
                className="text-slate-200 dark:text-slate-700"
              />
            ))}

            {/* Axes Lines */}
            {RUBRIC_CRITERIA.map((_, idx) => {
              const { x, y } = getCoordinates(4, idx);
              return (
                <line
                  key={idx}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                />
              );
            })}

            {/* Self Score Polygon (Blue) */}
            <polygon
              points={selfPoints}
              fill="rgba(59, 130, 246, 0.25)"
              stroke="#3b82f6"
              strokeWidth="2"
            />

            {/* Auto Score Polygon (Emerald) */}
            <polygon
              points={autoPoints}
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10b981"
              strokeWidth="2"
            />
          </svg>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold mt-3">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              Skor Diri
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Skor Otomatis Sistem
            </span>
          </div>
        </div>

        {/* Quick summary notes */}
        <div className="space-y-2 text-xs max-w-sm">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            Rubrik Penilaian Seminar Proposal
          </h4>
          <p className="text-slate-500 leading-relaxed">
            Grafik radar di samping membandingkan persepsi kesiapan mandiri Anda (garis biru) dengan hasil verifikasi aturan sistem (garis hijau).
          </p>
          <p className="text-slate-500 leading-relaxed">
            Jika terdapat ketimpangan tajam pada satu kriteria, fokuskan perbaikan pada komponen tersebut sebelum berkonsultasi dengan pembimbing.
          </p>
        </div>
      </div>

      {/* AI Review Section */}
      <AiReviewSection canvas={canvas} onChange={onChange} />

      {/* 5 Criteria Cards List */}
      <div className="space-y-4">
        {RUBRIC_CRITERIA.map((crit) => {
          const self = selfScores[crit.key] || 3;
          const auto = rubric.scores[crit.key] || 3;
          const explanation = rubric.explanations[crit.key];

          return (
            <div
              key={crit.key}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {crit.label}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5 space-y-0.5">
                    <div><strong>4 (Sangat Baik):</strong> {crit.desc4}</div>
                    <div><strong>1 (Kurang):</strong> {crit.desc1}</div>
                  </div>
                </div>

                {/* Score Controls */}
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Skor Diri
                    </span>
                    <select
                      value={self}
                      onChange={(e) => updateSelfScore(crit.key, Number(e.target.value) as 1 | 2 | 3 | 4)}
                      className="p-1 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 font-bold text-xs text-blue-700 dark:text-blue-300"
                    >
                      <option value={4}>4 - Sangat Baik</option>
                      <option value={3}>3 - Baik</option>
                      <option value={2}>2 - Cukup</option>
                      <option value={1}>1 - Kurang</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Skor Otomatis
                    </span>
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 font-bold text-xs text-emerald-700 dark:text-emerald-300">
                      {auto} / 4
                    </span>
                  </div>
                </div>
              </div>

              {/* System Explanation */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{explanation}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes / Catatan Diskusi Pembimbing */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <label className="block text-xs font-bold text-slate-900 dark:text-white">
          Catatan Mandiri untuk Asistensi Dosen Pembimbing
        </label>
        <textarea
          value={canvas.feasibility.notes}
          onChange={(e) => updateNotes(e.target.value)}
          placeholder="Tuliskan catatan khusus atau pertanyaan yang ingin Anda tanyakan kepada dosen pembimbing saat asistensi..."
          rows={3}
          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
        />
      </div>
    </div>
  );
}
