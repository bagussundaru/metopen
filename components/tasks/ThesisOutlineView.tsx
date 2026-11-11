"use client";

import { useTaskStore } from "@/lib/store/task-store";
import {
  Printer,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

export function ThesisOutlineView() {
  const { task1, task2 } = useTaskStore();
  const [copied, setCopied] = useState(false);

  const thesisTitle =
    task2.proposedTitle ||
    "Integrasi Sistem Pemantauan Telemetri Lingkungan dan Mitigasi Risiko K3 Berbasis Sensor Real-Time pada Operasional Fasilitas Data Center";

  const fullOutlineText = `DRAFT OUTLINE TESIS MAGISTER (S2) TEKNIK SIPIL
Judul / Topik: ${thesisTitle}
Penyusun: ${task2.meta.studentName || "[Nama Mahasiswa]"} (NIM: ${task2.meta.nim || "[NIM]"})
Peminatan: ${task2.meta.specialization}
Mata Kuliah: Desain Penelitian / Metodologi Penelitian Teknik Sipil
Dosen Pengampu: Dr.-Ing. Ir. Satoto E. Nayono, M.Eng., M.Sc.

==================================================
BAB I: PENDAHULUAN
==================================================
1.1 Latar Belakang Masalah
    - Operasional fasilitas data center 24/7 misi kritis menuntut keandalan tinggi dan lingkungan kerja yang aman bagi teknisi.
    - Urgensi pemantauan parameter fisik secara simultan: deviasi suhu ruang server (°C), akumulasi fluks termal (W/m²), dan intensitas kebisingan akustik kipas pendingin (dB).
    - Research Gap: Belum terukurnya integrasi pengawasan K3 digital berbasis sensor telemetri IoT secara real-time di lapangan terhadap penurunan indeks risiko kecelakaan kerja.

1.2 Rumusan Masalah (Research Questions)
    ${task2.researchQuestions.map((rq, i) => `${i + 1}. ${rq}`).join("\n    ")}

1.3 Tujuan Penelitian
    - Menganalisis struktur tren riset bibliometrik global K3 data center (2005–2026).
    - Merancang arsitektur integrasi sensor telemetri multi-parameter IoT real-time di fasilitas data center.
    - Menguji efektivitas sistem dalam menekan paparan suhu (≤ 24°C), kebisingan (≤ 85 dB), dan mempercepat respons mitigasi (t ≤ 60 detik).
    - Mengevaluasi persentase reduksi indeks risiko FMEA (≥ 40%) dengan uji signifikansi statistik (p < 0.05).

1.4 Manfaat Penelitian
    - Manfaat Teoretis: Kontribusi metodologis rekayasa fasilitas sipil cerdas dan keselamatan kerja infrastruktur kritis.
    - Manfaat Praktis: Pedoman implementasi telemetri preventif bagi pengelola data center komersial / industri utilitas kritis.

1.5 Batasan Masalah
    - Pengujian in-situ difokuskan pada lorong panas dan lorong dingin (hot/cold aisle) ruang server.
    - Parameter fisik terukur dibatasi pada suhu (°C), kelembapan relatif (%), kebisingan (dB), dan waktu respons (s).

==================================================
BAB II: TINJAUAN PUSTAKA
==================================================
2.1 Kajian Pustaka & Analisis Bibliometrik Scopus
    - Pemetaan struktur literatur global menggunakan VOSviewer dan basis data Scopus (Elsevier).
    - Rujukan artikel utama:
      * Paper 1: ${task1.papers[0].authors} (${task1.papers[0].year}). ${task1.papers[0].title}. ${task1.papers[0].journal}.
      * Paper 2: ${task1.papers[1].authors} (${task1.papers[1].year}). ${task1.papers[1].title}. ${task1.papers[1].journal}.
      * Paper 3: ${task1.papers[2].authors} (${task1.papers[2].year}). ${task1.papers[2].title}. ${task1.papers[2].journal}.

2.2 Konsep Dasar K3 dan Manajemen Risiko di Fasilitas Data Center
    - Standar keselamatan kerja kelistrikan (NFPA 70E, OSHA) dan bahaya busur api (arc-flash).
    - Manajemen risiko proaktif menggunakan Failure Mode and Effects Analysis (FMEA).

2.3 Teknologi Sensor Telemetri & IoT untuk Pemantauan Lingkungan
    - Jaringan sensor nirkabel (WSN), protokol MQTT/HTTP, dan logging data lingkungan kontinu.

2.4 Kerangka Berpikir dan Hipotesis Penelitian
    - Hipotesis: Penerapan pemantauan telemetri real-time memberikan penurunan signifikan pada indeks risiko FMEA (≥ 40%) dan mempercepat mitigasi bahaya secara terukur (p < 0.05).

==================================================
BAB III: METODOLOGI PENELITIAN
==================================================
3.1 Pendekatan dan Desain Penelitian
    - Mixed-methods: Studi pendahuluan bibliometrik VOSviewer dipadukan dengan pengujian lapangan in-situ (In-situ Experimental Testing).

3.2 Prosedur Penelitian
    - Tahap 1: Analisis bibliometrik literatur Scopus PRISMA 2020.
    - Tahap 2: Instalasi dan kalibrasi node sensor telemetri multi-parameter.
    - Tahap 3: Pengumpulan data baseline (kondisi eksisting konvensional).
    - Tahap 4: Penerapan sistem telemetri digital real-time & pencatatan waktu respons mitigasi.
    - Tahap 5: Evaluasi skor risiko FMEA dan uji signifikansi statistik.

3.3 Variabel Penelitian & Definisi Operasional
    - Variabel Bebas (X): Penerapan sistem pemantauan telemetri multi-parameter K3 berbasis IoT.
    - Variabel Terikat (Y):
      * Suhu ruang server (T ≤ 24°C)
      * Tingkat kebisingan akustik (L ≤ 85 dB)
      * Waktu respons peringatan dini mitigasi (t ≤ 60 detik)
      * Persentase penurunan skor risiko kecelakaan kerja FMEA (ΔRisk ≥ 40%)

3.4 Instrumen & Peralatan Pengujian
    - Sensor digital termal-higrometer, sound level meter terkalibrasi, gateway IoT, server telemetri, dan software statistik.

3.5 Teknik Analisis Data
    - Uji normalitas, uji komparatif parametrik/non-parametrik (t-test / Wilcoxon), dengan tingkat signifikansi p < 0.05.

==================================================
BAB IV: HASIL DAN PEMBAHASAN
==================================================
4.1 Hasil Pemetaan Bibliometrik Awal
    - Visualisasi jejaring topik VOSviewer menunjukkan bahwa integrasi telemetri real-time pada K3 fasilitas misi kritis adalah area kebaruan tinggi.
4.2 Data Hasil Pengujian In-Situ Lapangan
    - Profil fluktuasi suhu, kebisingan, dan waktu respons deteksi sebelum dan sesudah telemetri.
4.3 Analisis dan Pembahasan Komprehensif
    - Komparasi empiris terhadap standar rujukan dan pembahasan pemenuhan hipotesis penelitian.

==================================================
BAB V: KESIMPULAN DAN SARAN
==================================================
5.1 Kesimpulan
    - Menjawab secara tuntas seluruh rumusan masalah berdasarkan bukti numerik dan analisis statistik objektif.
5.2 Saran
    - Rekomendasi operasional bagi praktisi fasilitas industri serta arah riset lanjutan berbasis AI prediktif.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullOutlineText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wide">
                Tugas Akhir / Proposal Tesis
              </span>
              <span className="text-blue-200 text-xs font-semibold">
                Kurikulum Magister (S2) Teknik Sipil
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Draft Outline Tesis Lengkap (Bab I s/d Bab V)
            </h2>
            <p className="text-xs text-blue-100/90 max-w-3xl leading-relaxed">
              Sintesis utuh dari seluruh tahapan perkuliahan: mulai dari Peta Literatur Scopus, Matriks Analisis 3 Paper (Tugas 1), 7 RQs &amp; PRISMA (Tugas 2), hingga metodologi pengujian in-situ dengan variabel fisik terukur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Tersalin ke Clipboard!" : "Salin Teks Outline"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>Cetak Outline Tesis</span>
            </button>
          </div>
        </div>

        {/* Thesis Topic Capsule */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
            Judul / Topik Rancangan Tesis:
          </span>
          <h3 className="text-base sm:text-lg font-black text-white leading-snug">
            {thesisTitle}
          </h3>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-blue-200">
            <span>Mahasiswa: <strong>{task2.meta.studentName || "Bagus Sundaru"}</strong></span>
            <span>NIM: <strong>{task2.meta.nim || "24052380001"}</strong></span>
            <span>Peminatan: <strong>{task2.meta.specialization}</strong></span>
          </div>
        </div>
      </div>

      {/* Chapters Breakdown */}
      <div className="space-y-6">
        {/* BAB I */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-xs">BAB I</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              PENDAHULUAN
            </h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                1.1 Latar Belakang Masalah
              </h4>
              <p>
                Operasional fasilitas data center 24/7 misi kritis memerlukan tingkat keselamatan kerja (K3) dan proteksi aset yang tinggi. Bahaya fisik seperti deviasi suhu ruang server (°C), akumulasi fluks termal (W/m²), dan intensitas kebisingan kipas pendingin (dB) berdampak langsung pada risiko human-error dan kegagalan infrastruktur. Belum terukurnya efektivitas integrasi sistem telemetri digital real-time di lapangan menjadi kesenjangan riset (research gap) utama yang dipecahkan.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                1.2 Rumusan Masalah (5–7 Research Questions Terukur)
              </h4>
              <div className="space-y-1.5 pl-2 border-l-2 border-blue-500">
                {task2.researchQuestions.map((rq, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-medium">
                    <strong className="text-blue-600 dark:text-blue-400 mr-1">RQ {idx + 1}:</strong>
                    <span>{rq}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="block font-bold text-slate-900 dark:text-white mb-1">1.3 Tujuan Penelitian</strong>
                <p>Menguji dan mengevaluasi penerapan sistem telemetri IoT terhadap penurunan paparan bahaya fisik di ruang server secara empiris.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="block font-bold text-slate-900 dark:text-white mb-1">1.4 Manfaat Penelitian</strong>
                <p>Kontribusi praktis bagi industri data center kritikal dan kontribusi teoretis bagi keandalan rekayasa fasilitas sipil.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="block font-bold text-slate-900 dark:text-white mb-1">1.5 Batasan Masalah</strong>
                <p>Fokus pengujian pada parameter lingkungan (suhu °C, kebisingan dB, waktu respons s) dan batasan ruang server lorong panas/dingin.</p>
              </div>
            </div>
          </div>
        </div>

        {/* BAB II */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-extrabold text-xs">BAB II</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              TINJAUAN PUSTAKA &amp; KAJIAN BIBLIOMETRIK
            </h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                2.1 Kajian Pustaka &amp; Analisis Bibliometrik Scopus (Hasil Tugas 1)
              </h4>
              <p className="mb-2">
                Struktur jejaring keilmuan dipetakan dari basis data Scopus menggunakan VOSviewer, dengan merujuk pada telaah 3 paper otoritatif:
              </p>
              <div className="space-y-2">
                {task1.papers.map((p, i) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60">
                    <span className="font-extrabold text-blue-700 dark:text-blue-300">Paper {i + 1}: {p.title}</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      {p.authors} ({p.year}) &bull; <em>{p.journal}</em> &bull; {p.indexingDb}
                    </p>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1">
                      <strong>Temuan &amp; Relevansi:</strong> {p.mainFindings.slice(0, 160)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="block font-bold text-slate-900 dark:text-white mb-1">2.2 Konsep K3 &amp; Manajemen Risiko Data Center</strong>
                <p>Kajian standar OSHA, NFPA 70E, analisis bahaya arc-flash, dan model Failure Mode and Effects Analysis (FMEA).</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="block font-bold text-slate-900 dark:text-white mb-1">2.3 Teknologi Sensor Telemetri &amp; IoT</strong>
                <p>Arsitektur akuisisi data sensor suhu (°C), kelembapan (%), intensitas suara (dB), dan transmisi telemetri.</p>
              </div>
            </div>
          </div>
        </div>

        {/* BAB III */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs">BAB III</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              METODOLOGI PENELITIAN
            </h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="block font-bold text-slate-900 dark:text-white mb-1">3.1 Desain Penelitian (Mixed-Methods)</strong>
                <p>Kombinasi telaah bibliometrik Scopus PRISMA 2020 dengan pengujian eksperimental in-situ di fasilitas operasional data center.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="block font-bold text-slate-900 dark:text-white mb-1">3.2 Variabel Penelitian Terukur</strong>
                <p>
                  <strong>Variabel Bebas:</strong> Implementasi sistem telemetri digital K3 IoT.<br />
                  <strong>Variabel Terikat:</strong> Suhu ruang server (≤ 24°C), kebisingan (≤ 85 dB), waktu respons mitigasi (t ≤ 60 detik), dan penurunan indeks risiko FMEA (≥ 40%).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="block font-bold text-slate-900 dark:text-white mb-1">3.3 Instrumen Pengujian</strong>
                <p>Sensor telemetri digital calibrated, B&amp;K sound level meter, thermocouple logger, dan VOSviewer v1.6.20.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="block font-bold text-slate-900 dark:text-white mb-1">3.4 Teknik Analisis Data</strong>
                <p>Uji komparatif parametrik/non-parametrik sebelum dan sesudah telemetri dengan tingkat signifikansi statistik p &lt; 0.05.</p>
              </div>
            </div>
          </div>
        </div>

        {/* BAB IV & V */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white font-extrabold text-xs">BAB IV</span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                HASIL &amp; PEMBAHASAN
              </h3>
            </div>
            <p><strong>4.1 Pemetaan Bibliometrik Awal:</strong> Visualisasi jejaring VOSviewer memperkuat novelty tesis.</p>
            <p><strong>4.2 Data Hasil Pengujian In-Situ:</strong> Rekaman telemetri suhu, kebisingan, dan waktu respons kejadian insiden.</p>
            <p><strong>4.3 Pembahasan Komprehensif:</strong> Validasi empiris terhadap penurunan skor FMEA ≥ 40% dan standar K3 internasional.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="px-2.5 py-1 rounded-xl bg-amber-600 text-white font-extrabold text-xs">BAB V</span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                KESIMPULAN &amp; SARAN
              </h3>
            </div>
            <p><strong>5.1 Kesimpulan:</strong> Jawaban tuntas atas 7 RQ berdasarkan pengujian numerik dan signifikansi statistik p &lt; 0.05.</p>
            <p><strong>5.2 Saran &amp; Roadmap:</strong> Rekomendasi implementasi praktis fasilitas data center dan arah riset AI telemetri prediktif.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
