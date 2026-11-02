"use client";

import { useState } from "react";
import { Canvas } from "@/lib/types/canvas";
import { AiRqModal } from "@/components/ai/AiRqModal";
import {
  Plus,
  X,
  Target,
  ShieldAlert,
} from "lucide-react";

interface Step3ResearchQuestionProps {
  canvas: Canvas;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
}

export function Step3ResearchQuestion({ canvas, onChange }: Step3ResearchQuestionProps) {
  const rq = canvas.researchQuestion;

  const [newIndep, setNewIndep] = useState("");
  const [newDep, setNewDep] = useState("");
  const [newCtrl, setNewCtrl] = useState("");

  const updateRq = <K extends keyof Canvas["researchQuestion"]>(
    key: K,
    val: Canvas["researchQuestion"][K]
  ) => {
    onChange((prev) => ({
      ...prev,
      researchQuestion: { ...prev.researchQuestion, [key]: val },
    }));
  };

  const addVariable = (type: "independent" | "dependent" | "controlled", val: string) => {
    if (!val.trim()) return;
    onChange((prev) => ({
      ...prev,
      researchQuestion: {
        ...prev.researchQuestion,
        variables: {
          ...prev.researchQuestion.variables,
          [type]: [...prev.researchQuestion.variables[type], val.trim()],
        },
      },
    }));
  };

  const removeVariable = (type: "independent" | "dependent" | "controlled", index: number) => {
    onChange((prev) => ({
      ...prev,
      researchQuestion: {
        ...prev.researchQuestion,
        variables: {
          ...prev.researchQuestion.variables,
          [type]: prev.researchQuestion.variables[type].filter((_, i) => i !== index),
        },
      },
    }));
  };

  const toggleChecklist = (key: keyof Canvas["researchQuestion"]["checklist"]) => {
    onChange((prev) => {
      const current = prev.researchQuestion.checklist || {
        notJustLocation: false,
        notJustSoftware: false,
        measurableVariables: false,
        hasDecisionThreshold: false,
        feasibleInStudyTime: false,
      };
      return {
        ...prev,
        researchQuestion: {
          ...prev.researchQuestion,
          checklist: { ...current, [key]: !current[key] },
        },
      };
    });
  };

  const checklist = rq.checklist || {
    notJustLocation: false,
    notJustSoftware: false,
    measurableVariables: false,
    hasDecisionThreshold: false,
    feasibleInStudyTime: false,
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Langkah 3: Pertanyaan Riset Utama & Pencegah Novelty Semu
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pertanyaan riset harus dapat diuji secara empiris atau numerik dengan indikator terukur, serta terhindar dari <strong>Jebakan Lokasi Baru</strong> dan <strong>Sindrom Perangkat Lunak</strong>.
          </p>
        </div>
        <AiRqModal
          canvas={canvas}
          onApplyRq={(rqData) => {
            onChange((prev) => ({
              ...prev,
              researchQuestion: {
                ...prev.researchQuestion,
                main: rqData.main,
                type: rqData.type,
                variables: {
                  ...prev.researchQuestion.variables,
                  independent: rqData.independent,
                  dependent: rqData.dependent,
                },
                measurableIndicator: rqData.measurableIndicator,
              },
            }));
          }}
        />
      </div>

      {/* Main RQ Input */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-900 dark:text-white">
          Rumusan Pertanyaan Riset Utama (Wajib diakhiri tanda tanya ?) <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={rq.main}
          onChange={(e) => updateRq("main", e.target.value)}
          placeholder="mis. Seberapa besar pengaruh variasi substitusi fly ash tipe F (15%, 20%, 25%) terhadap momen lentur ultimate dan daktilitas balok beton bertulang mutu tinggi yang direndam dalam larutan sulfat?"
          rows={3}
          className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Research Type */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Tipe Riset:</span>
            <select
              value={rq.type}
              onChange={(e) => updateRq("type", e.target.value as Canvas["researchQuestion"]["type"])}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="empirical">Empiris (Eksperimen Lab / Lapangan)</option>
              <option value="numerical">Numerik (Simulasi Komputasi / FEM)</option>
              <option value="both">Metode Campuran (Eksperimen + Simulasi)</option>
            </select>
          </div>

          <p className="text-[11px] text-slate-400">
            Hindari pertanyaan ya/tidak (&quot;Apakah berpengaruh?&quot;). Gunakan <strong>&quot;Seberapa besar...&quot;</strong>
          </p>
        </div>
      </div>

      {/* Variables Section (Independent, Dependent, Controlled) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
          Pemetaan Variabel Penelitian Rekayasa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Variabel Bebas (Independent) */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-2">
            <label className="font-bold text-blue-900 dark:text-blue-300 block">
              Variabel Bebas (Perlakuan) *
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newIndep}
                onChange={(e) => setNewIndep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVariable("independent", newIndep);
                    setNewIndep("");
                  }
                }}
                placeholder="mis. Rasio fly ash (15%, 20%)"
                className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  addVariable("independent", newIndep);
                  setNewIndep("");
                }}
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {rq.variables.independent.map((v, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200"
                >
                  {v}
                  <button type="button" onClick={() => removeVariable("independent", i)}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Variabel Terikat (Dependent) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
            <label className="font-bold text-emerald-900 dark:text-emerald-300 block">
              Variabel Terikat (Hasil Ukur) *
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newDep}
                onChange={(e) => setNewDep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVariable("dependent", newDep);
                    setNewDep("");
                  }
                }}
                placeholder="mis. Momen lentur (kN.m)"
                className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  addVariable("dependent", newDep);
                  setNewDep("");
                }}
                className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {rq.variables.dependent.map((v, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200"
                >
                  {v}
                  <button type="button" onClick={() => removeVariable("dependent", i)}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Variabel Kontrol (Controlled) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="font-bold text-slate-900 dark:text-slate-200 block">
              Variabel Kontrol (Tetap)
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newCtrl}
                onChange={(e) => setNewCtrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVariable("controlled", newCtrl);
                    setNewCtrl("");
                  }
                }}
                placeholder="mis. Dimensi balok 150x250 mm"
                className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  addVariable("controlled", newCtrl);
                  setNewCtrl("");
                }}
                className="p-2 rounded-xl bg-slate-700 text-white hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {rq.variables.controlled.map((v, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                >
                  {v}
                  <button type="button" onClick={() => removeVariable("controlled", i)}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Measurable Indicator & Hypothesis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Indikator Terukur & Kriteria Jawaban *
          </label>
          <textarea
            value={rq.measurableIndicator}
            onChange={(e) => updateRq("measurableIndicator", e.target.value)}
            placeholder="mis. Momen lentur ultimate meningkat minimal 5% pada rasio 20%, dan rasio daktilitas mu > 2.5 sesuai SNI 2847:2019."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Hipotesis Penelitian (Opsional)
          </label>
          <textarea
            value={rq.hypothesis || ""}
            onChange={(e) => updateRq("hypothesis", e.target.value)}
            placeholder="mis. Diduga substitusi fly ash optimum pada rentang 20-25% mempertahankan kapasitas lentur balok..."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* 5-Point Novelty Trap Checklist */}
      <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-xs text-amber-950 dark:text-amber-200 uppercase tracking-wider">
              Checklist Evaluasi Mandiri: Bebas Jebakan Novelty Semu
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
            {checkedCount} / 5 Terverifikasi
          </span>
        </div>

        <p className="text-xs text-amber-800 dark:text-amber-300">
          Dosen menguji apakah kebaruan tesis Anda nyata atau sekadar semu. Centang butir-butir refleksi berikut:
        </p>

        <div className="space-y-2 text-xs">
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={checklist.notJustLocation}
              onChange={() => toggleChecklist("notJustLocation")}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-slate-800 dark:text-slate-200">
              <strong>Bukan sekadar lokasi baru:</strong> Kebaruan bukan hanya karena objek/proyeknya berbeda kota/daerah, melainkan ada variabel karakteristik ilmiah yang diuji.
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={checklist.notJustSoftware}
              onChange={() => toggleChecklist("notJustSoftware")}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-slate-800 dark:text-slate-200">
              <strong>Bukan sekadar software baru:</strong> Kontribusi tesis tetap bernilai bagi ilmu rekayasa meskipun software komputasi yang dipakai diganti dengan software lain.
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={checklist.measurableVariables}
              onChange={() => toggleChecklist("measurableVariables")}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-slate-800 dark:text-slate-200">
              <strong>Variabel dapat diukur/dihitung:</strong> Seluruh variabel bebas dan terikat memiliki prosedur pengukuran dan satuan besaran yang terstandarisasi.
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={checklist.hasDecisionThreshold}
              onChange={() => toggleChecklist("hasDecisionThreshold")}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-slate-800 dark:text-slate-200">
              <strong>Memiliki kriteria keputusan:</strong> Ada ambang batas numerik yang menentukan hipotesis diterima/ditolak secara objektif.
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={checklist.feasibleInStudyTime}
              onChange={() => toggleChecklist("feasibleInStudyTime")}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-slate-800 dark:text-slate-200">
              <strong>Terjawab dalam masa studi S2:</strong> Beban pengujian realistis diselesaikan tuntas tanpa melampaui batas semester kelulusan.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
