"use client";

import { useState } from "react";
import { Canvas, DataNeed } from "@/lib/types/canvas";
import {
  Wrench,
  Plus,
  Trash2,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface Step4MethodDataProps {
  canvas: Canvas;
  onChange: (updater: (prev: Canvas) => Canvas) => void;
}

const CIVIL_TOOLS_PRESETS = [
  "VOSviewer 1.6.20 (Visualisasi Jejaring Bibliometrik)",
  "Graphology Louvain Clustering Engine",
  "Bibliometrix R Package / BiblioShiny",
  "Basis Data Scopus / OpenAlex API",
  "Universal Testing Machine (UTM) 500 kN",
  "LVDT Displacement Transducer",
  "Compression Machine 2000 kN",
  "Load Cell Digital 500 kN",
  "Data Logger Tokyo Sokki TDS-530",
  "Alat Uji Slump Cone & Cetakan Balok",
  "Alat Uji Triaxial & Konsolidasi",
  "X-Ray Fluorescence (XRF) & SEM",
  "Ultrasonic Pulse Velocity (UPV)",
  "Rebound Hammer Test (Schmidt)",
  "Core Drill Machine",
  "Total Station & Waterpass",
  "Software ABAQUS / ANSYS",
  "Software SAP2000 / ETABS",
  "Software PLAXIS 2D/3D",
  "Python (Scipy, Pandas, Matplotlib)",
];

const CIVIL_STANDARDS_PRESETS = [
  "PRISMA 2020 Statement (Pedoman Systematic Review & Bibliometrik)",
  "Pedoman Analisis Bibliometrik Donthu et al. (2021, JBR)",
  "Van Eck & Waltman (2010, Scientometrics) - Algoritma VOS",
  "SNI 2847:2019 (Persyaratan Beton Struktural)",
  "SNI 1726:2019 (Tata Cara Perencanaan Ketahanan Gempa Gedung)",
  "SNI 1727:2020 (Beban Desain Minimum untuk Gedung)",
  "SNI 03-1968 (Analisis Saringan Agregat Halus dan Kasar)",
  "ASTM C39 (Kuat Tekan Silinder Beton)",
  "ASTM C78 (Kuat Lentur Balok Menggunakan 4-Titik Beban)",
  "ASTM C618 (Spesifikasi Abu Terbang / Fly Ash)",
  "ASTM C1012 (Ketahanan Beton Terhadap Larutan Sulfat)",
  "ASTM C469 (Modulus Elastisitas Statik dan Poisson Ratio)",
  "AASHTO LRFD Bridge Design Specifications",
];

export function Step4MethodData({ canvas, onChange }: Step4MethodDataProps) {
  const method = canvas.method;
  const dataNeeds = method.dataNeeds || [];

  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [newData, setNewData] = useState<Partial<DataNeed>>({
    name: "",
    kind: "primary",
    source: "",
    availability: "available",
    accessEvidence: "",
    estimatedSize: "",
    timeEstimateWeeks: 4,
    risk: "",
    mitigation: "",
  });

  const updateMethod = <K extends keyof Canvas["method"]>(key: K, val: Canvas["method"][K]) => {
    onChange((prev) => ({
      ...prev,
      method: { ...prev.method, [key]: val },
    }));
  };

  const toggleTool = (tool: string) => {
    const current = method.tools || [];
    const exists = current.includes(tool);
    const updated = exists ? current.filter((t) => t !== tool) : [...current, tool];
    updateMethod("tools", updated);
  };

  const toggleStandard = (std: string) => {
    const current = method.standards || [];
    const exists = current.includes(std);
    const updated = exists ? current.filter((s) => s !== std) : [...current, std];
    updateMethod("standards", updated);
  };

  const handleAddDataNeed = () => {
    if (!newData.name || !newData.source) {
      alert("Mohon isi Nama Data dan Sumber Data.");
      return;
    }

    const created: DataNeed = {
      id: crypto.randomUUID(),
      name: newData.name || "",
      kind: (newData.kind as DataNeed["kind"]) || "primary",
      source: newData.source || "",
      availability: (newData.availability as DataNeed["availability"]) || "available",
      accessEvidence: newData.accessEvidence || "",
      estimatedSize: newData.estimatedSize || "",
      timeEstimateWeeks: Number(newData.timeEstimateWeeks) || 1,
      risk: newData.risk || "",
      mitigation: newData.mitigation || "",
    };

    updateMethod("dataNeeds", [created, ...dataNeeds]);

    setNewData({
      name: "",
      kind: "primary",
      source: "",
      availability: "available",
      accessEvidence: "",
      estimatedSize: "",
      timeEstimateWeeks: 4,
      risk: "",
      mitigation: "",
    });
    setShowAddDataModal(false);
  };

  const handleDeleteDataNeed = (id: string) => {
    updateMethod(
      "dataNeeds",
      dataNeeds.filter((d) => d.id !== id)
    );
  };

  const totalWeeks = dataNeeds.reduce((acc, curr) => acc + (curr.timeEstimateWeeks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-600" />
          Langkah 4: Metode Inti & Kepastian Kebutuhan Data
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Dosen menguji ketepatan metode pengujian berstandar baku (SNI/ASTM) serta kepastian ketersediaan data dan waktu pelaksanaan (&le; 24 minggu).
        </p>
      </div>

      {/* Approach & Description */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
            Pendekatan Metode Utama *
          </label>
          <select
            value={method.approach}
            onChange={(e) => updateMethod("approach", e.target.value as Canvas["method"]["approach"])}
            className="w-full sm:w-80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="experimental_lab">Eksperimen Laboratorium Terstandar</option>
            <option value="field_study">Studi Lapangan / Pengujian In-Situ</option>
            <option value="numerical_fem">Simulasi Elemen Hingga (FEM) / Komputasi</option>
            <option value="simulation">Pemodelan Sistem & Simulasi Dinamis</option>
            <option value="bibliometric_slr">Analisis Bibliometrik & Systematic Literature Review (SLR)</option>
            <option value="mixed">Metode Campuran (Eksperimen Lab + Validasi FEM)</option>
            <option value="statistical_modeling">Pemodelan Statistik & Reliabilitas</option>
            <option value="ml_data_driven">Machine Learning / Data-Driven</option>
            <option value="other">Pendekatan Lainnya</option>
          </select>
        </div>

        {canvas.literatureMap && canvas.literatureMap.nodeCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>
                <strong>Peta Bibliometrik Terdeteksi:</strong> {canvas.literatureMap.nodeCount} kata kunci teranalisis dari topik &quot;{canvas.literatureMap.searchQuery || canvas.title.subject}&quot;.
              </span>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              Terintegrasi dengan Tab Peta Literatur
            </span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
            Deskripsi Prosedur Pengujian / Alur Eksperimen *
          </label>
          <textarea
            value={method.description}
            onChange={(e) => updateMethod("description", e.target.value)}
            placeholder="mis. Pengujian pembebanan lentur empat titik (four-point bending) pada balok bertulang skala laboratorium menggunakan UTM kapasitas 500 kN, dilengkapi pembacaan LVDT di tengah bentang..."
            rows={3}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Preset Standards & Instruments for Civil Engineering */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standards Presets */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Standar Pengujian Rujukan (SNI / ASTM / AASHTO)</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">
              {method.standards?.length || 0} dipilih
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Klik untuk memilih standar uji lab yang Anda pakai:
          </p>

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
            {CIVIL_STANDARDS_PRESETS.map((std) => {
              const selected = method.standards?.includes(std);
              return (
                <button
                  type="button"
                  key={std}
                  onClick={() => toggleStandard(std)}
                  className={`text-left text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                    selected
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  {std}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instruments / Tools Presets */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-cyan-600" />
              <span>Peralatan Laboratorium & Software Pendukung</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">
              {method.tools?.length || 0} dipilih
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Klik instrumen yang digunakan untuk pengujian:
          </p>

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
            {CIVIL_TOOLS_PRESETS.map((tool) => {
              const selected = method.tools?.includes(tool);
              return (
                <button
                  type="button"
                  key={tool}
                  onClick={() => toggleTool(tool)}
                  className={`text-left text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                    selected
                      ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  {tool}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Needs Table with Colored Availability */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tabel Kebutuhan Data & Kepastian Akses
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                {dataNeeds.length} Data Terdaftar
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Total estimasi waktu: <strong className={totalWeeks > 24 ? "text-rose-500 font-bold" : "text-emerald-600 font-bold"}>{totalWeeks} minggu</strong> (Batas aman kelulusan S2: &le; 24 minggu).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddDataModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Data</span>
          </button>
        </div>

        {/* Data Cards Table */}
        <div className="space-y-3">
          {dataNeeds.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tabel kebutuhan data masih kosong
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Dosen mewajibkan minimal 1 kebutuhan data (primer/sekunder) lengkap dengan kepastian ketersediaannya.
              </p>
            </div>
          ) : (
            dataNeeds.map((d) => {
              const getAvailabilityBadge = () => {
                switch (d.availability) {
                  case "available":
                    return (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Tersedia (Ready)
                      </span>
                    );
                  case "requires_permission":
                    return (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Butuh Izin Instansi
                      </span>
                    );
                  case "must_generate":
                    return (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Harus Dibuat/Uji Lab
                      </span>
                    );
                  case "uncertain":
                  default:
                    return (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        Belum Pasti (Uncertain)
                      </span>
                    );
                }
              };

              return (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {d.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {d.kind === "primary" ? "Primer" : "Sekunder"}
                      </span>
                      {getAvailabilityBadge()}
                      <span className="text-[11px] text-slate-400 font-medium">
                        &bull; Estimasi: {d.timeEstimateWeeks || 1} minggu
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>Sumber:</strong> {d.source}{" "}
                        {d.accessEvidence ? `(${d.accessEvidence})` : ""}
                      </div>
                      <div>
                        <strong>Jumlah Benda Uji:</strong> {d.estimatedSize || "-"}
                      </div>
                      {d.risk && (
                        <div className="text-amber-700 dark:text-amber-400">
                          <strong>Risiko:</strong> {d.risk}
                        </div>
                      )}
                      {d.mitigation && (
                        <div className="text-emerald-700 dark:text-emerald-400">
                          <strong>Mitigasi:</strong> {d.mitigation}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDataNeed(d.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                    title="Hapus Data"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Data Modal */}
      {showAddDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Tambah Kebutuhan Data Tesis
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Data Pengujian *</label>
                <input
                  type="text"
                  placeholder="mis. Hasil uji kuat lentur balok 4-titik"
                  value={newData.name}
                  onChange={(e) => setNewData({ ...newData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Jenis Data</label>
                  <select
                    value={newData.kind}
                    onChange={(e) => setNewData({ ...newData, kind: e.target.value as DataNeed["kind"] })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="primary">Data Primer (Uji Lab / Lapangan Sendiri)</option>
                    <option value="secondary">Data Sekunder (BMKG, PUPR, BPS, Jurnal)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status Ketersediaan *</label>
                  <select
                    value={newData.availability}
                    onChange={(e) => setNewData({ ...newData, availability: e.target.value as DataNeed["availability"] })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="available">Tersedia (Ready)</option>
                    <option value="requires_permission">Butuh Izin Instansi</option>
                    <option value="must_generate">Harus Dibuat/Uji Sendiri</option>
                    <option value="uncertain">Belum Pasti (Risiko Tinggi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Sumber Data / Lokasi Lab *</label>
                <input
                  type="text"
                  placeholder="mis. Laboratorium Bahan & Struktur FT UNY"
                  value={newData.source}
                  onChange={(e) => setNewData({ ...newData, source: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Jumlah Sampel / Benda Uji</label>
                  <input
                    type="text"
                    placeholder="mis. 18 balok uji (150x250 mm)"
                    value={newData.estimatedSize}
                    onChange={(e) => setNewData({ ...newData, estimatedSize: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Estimasi Waktu (Minggu)</label>
                  <input
                    type="number"
                    value={newData.timeEstimateWeeks}
                    onChange={(e) => setNewData({ ...newData, timeEstimateWeeks: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Bukti Akses / Kontak Izin (Opsional)</label>
                <input
                  type="text"
                  placeholder="mis. Surat izin penggunaan lab no. 12/FT-UNY/2026"
                  value={newData.accessEvidence}
                  onChange={(e) => setNewData({ ...newData, accessEvidence: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Identifikasi Risiko</label>
                  <input
                    type="text"
                    placeholder="mis. Antrean alat UTM"
                    value={newData.risk}
                    onChange={(e) => setNewData({ ...newData, risk: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Rencana Mitigasi</label>
                  <input
                    type="text"
                    placeholder="mis. Booking lab 1 bulan lebih awal"
                    value={newData.mitigation}
                    onChange={(e) => setNewData({ ...newData, mitigation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddDataModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddDataNeed}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-sm"
              >
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
