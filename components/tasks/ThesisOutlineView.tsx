"use client";

import { useTaskStore } from "@/lib/store/task-store";
import {
  Printer,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { OfficialKopSurat } from "./OfficialKopSurat";

export function ThesisOutlineView() {
  const { task1, task2 } = useTaskStore();
  const [copied, setCopied] = useState(false);

  const thesisTitle =
    task2.proposedTitle ||
    "Tingkat Kepatuhan K3 (%) dan Penurunan Risiko FMEA K3 di Lingkungan Data Center Tier 3 & 4 dengan Bahaya Tersembunyi";

  const fullOutlineText = `DRAFT OUTLINE TESIS MAGISTER (S2) TEKNIK SIPIL
Judul / Topik: ${thesisTitle}
Penyusun: ${task2.meta.studentName || "Bagus Sundaru"} (NIM: ${task2.meta.nim || "24052380001"})
Peminatan: ${task2.meta.specialization} (Rekayasa Infrastruktur & Keselamatan Fasilitas Kritis)
Mata Kuliah: Desain Penelitian / Metodologi Penelitian Teknik Sipil
Dosen Pengampu: Dr.-Ing. Ir. Satoto E. Nayono, M.Eng., M.Sc.

==================================================
BAB I: PENDAHULUAN
==================================================
1.1 Latar Belakang Masalah
    - Operasional Data Center Tier 3 & 4 beroperasi 24/7/365 dengan tingkat ketersediaan tinggi (99.982% - 99.995%) dan beban pemeliharaan bersamaan tanpa henti (concurrently maintainable).
    - Fasilitas ini menyimpan bahaya tersembunyi (hidden hazards): lonjakan micro-hotspots (suhu > 24°C) di lorong panas rak berdensitas tinggi, akumulasi fluks termal (W/m²), risiko thermal runaway bank baterai UPS, ancaman busur api listrik (arc-flash) pada panel distribusi daya (PDU/ATS), serta paparan kebisingan blower pendingin CRAH/CRAC (> 85 dB).
    - Research Gap: Belum terukurnya efektivitas integrasi sistem pengawasan K3 digital berbasis sensor telemetri IoT secara in-situ real-time terhadap peningkatan tingkat kepatuhan K3 (%) dan penurunan skor Risk Priority Number (RPN) pada Failure Mode and Effects Analysis (FMEA).

1.2 Rumusan Masalah (7 Research Questions Terukur)
    ${task2.researchQuestions.map((rq, i) => `${i + 1}. ${rq}`).join("\n    ")}

1.3 Tujuan Penelitian
    - Memetakan struktur literatur bibliometrik global K3 data center Tier 3 & 4 menggunakan Scopus dan VOSviewer (2005–2026).
    - Mengidentifikasi baseline paparan bahaya fisik tersembunyi (suhu °C, kebisingan dB, fluks termal) dan tingkat kepatuhan K3 eksisting.
    - Merancang dan menguji arsitektur sistem telemetri multi-parameter berbasis IoT in-situ di lorong panas/dingin dan ruang kelistrikan kritis.
    - Menguji efektivitas pengendalian mikroklimat ruang server (T ≤ 24°C, kebisingan ≤ 85 dB, waktu respons mitigasi t ≤ 60 detik).
    - Mengevaluasi kenaikan persentase kepatuhan K3 (≥ 90%) dan penurunan indeks risiko FMEA (ΔFMEA ≥ 40%) secara signifikan secara statistik (p < 0.05).

1.4 Manfaat Penelitian
    - Manfaat Teoretis: Kontribusi keilmuan pada rekayasa keselamatan fasilitas sipil cerdas (smart critical facility safety) dan pemodelan risiko FMEA kuantitatif.
    - Manfaat Praktis: Standard Operating Procedure (SOP) dan framework pemantauan K3 telemetri preventif bagi pengelola data center Tier 3 & 4 komersial/utilitas nasional.

1.5 Batasan Masalah
    - Pengujian in-situ difokuskan pada lorong panas dan lorong dingin (hot/cold aisle containment), ruang power UPS, dan switchgear fasilitas Data Center Tier 3/4.
    - Parameter fisik terukur dibatasi pada suhu (°C), kelembapan relatif (% RH), intensitas kebisingan akustik (dB), waktu respons mitigasi (s), kepatuhan K3 (%), dan skor FMEA RPN.

==================================================
BAB II: TINJAUAN PUSTAKA
==================================================
2.1 Kajian Pustaka & Analisis Bibliometrik Scopus (Tugas 1)
    - Pemetaan struktur literatur global menggunakan VOSviewer dan basis data Scopus (Elsevier).
    - Rujukan artikel utama:
      * Paper 1: ${task1.papers[0].authors} (${task1.papers[0].year}). ${task1.papers[0].title}. ${task1.papers[0].journal}.
      * Paper 2: ${task1.papers[1].authors} (${task1.papers[1].year}). ${task1.papers[1].title}. ${task1.papers[1].journal}.
      * Paper 3: ${task1.papers[2].authors} (${task1.papers[2].year}). ${task1.papers[2].title}. ${task1.papers[2].journal}.

2.2 Arsitektur dan Standar Fasilitas Data Center Tier 3 & 4
    - Standar Uptime Institute, TIA-942, redundansi jalur distribusi 2N dan N+1, serta filosofi pemeliharaan konkurent.

2.3 Manajemen Risiko K3 dan Failure Mode and Effects Analysis (FMEA)
    - Analisis potensi bahaya tersembunyi (thermal hotspot, arc-flash, gas suppression accidental discharge).
    - Perhitungan Risk Priority Number (RPN = Severity x Occurrence x Detection) dan metrik kepatuhan K3 (OSHA 1910, NFPA 70E, ASHRAE TC 9.9).

2.4 Teknologi Sensor Telemetri & IoT In-Situ
    - Akuisisi data mikrokontroler industri, sensor termal kalibrasi, sound level transducer, transmisi MQTT/Modbus, dan visualisasi dashboard real-time.

2.5 Kerangka Berpikir dan Hipotesis Penelitian
    - Hipotesis Utama: Penerapan pemantauan telemetri IoT in-situ terpadu memberikan penurunan signifikan terhadap skor risiko FMEA RPN (ΔRPN ≥ 40%), meningkatkan kepatuhan K3 (≥ 90%), dan mempercepat respons mitigasi bahaya tersembunyi (t ≤ 60 detik) secara valid secara statistik (p < 0.05).

==================================================
BAB III: METODOLOGI PENELITIAN
==================================================
3.1 Pendekatan dan Desain Penelitian
    - Metode Campuran (Mixed-Methods): Studi pendahuluan bibliometrik VOSviewer dipadukan dengan pengujian lapangan in-situ (In-situ Experimental Testing) pada Data Center Tier 3/4.

3.2 Prosedur Penelitian
    - Tahap 1: Sintesis literatur Scopus PRISMA 2020 dan pemetaan jejaring VOSviewer.
    - Tahap 2: Audit baseline bahaya tersembunyi eksisting dan asesmen awal FMEA RPN.
    - Tahap 3: Perancangan, kalibrasi, dan penempatan node sensor telemetri multi-parameter.
    - Tahap 4: Implementasi sistem telemetri digital real-time & pencatatan logging data in-situ.
    - Tahap 5: Evaluasi akhir kepatuhan K3 (%), perhitungan ulang skor FMEA RPN, dan pengujian hipotesis statistik komparatif.

3.3 Variabel Penelitian & Definisi Operasional
    - Variabel Bebas (X): Penerapan sistem pemantauan telemetri multi-parameter K3 berbasis IoT.
    - Variabel Terikat (Y):
      * Suhu ruang server (Target: T ≤ 24°C)
      * Tingkat kebisingan akustik (Target: L ≤ 85 dB)
      * Waktu respons peringatan dini mitigasi bahaya (Target: t ≤ 60 detik)
      * Tingkat kepatuhan K3 personel operasional (Target: ≥ 90%)
      * Persentase penurunan skor FMEA Risk Priority Number (Target: ΔRPN ≥ 40%)

3.4 Instrumen & Peralatan Pengujian
    - Sensor digital termal-higrometer industri terkalibrasi, precision sound level meter B&K, IoT gateway industri, data logger telemetri, dan software statistik SPSS/R.

3.5 Teknik Analisis Data
    - Uji normalitas data (Shapiro-Wilk), uji beda komparatif berpasangan (Paired t-test atau Wilcoxon Signed-Rank Test) dengan tingkat signifikansi p < 0.05.

==================================================
BAB IV: HASIL DAN PEMBAHASAN
==================================================
4.1 Hasil Pemetaan Bibliometrik Awal
    - Visualisasi jejaring VOSviewer menunjukkan dominasi klaster efisiensi energi PUE dan minimnya integrasi kuantitatif pemantauan telemetri keselamatan kerja teknisi (novelty argumen).
4.2 Rekaman Data Pengujian In-Situ Lapangan
    - Data log empiris fluktuasi temperatur hot/cold aisle, profil spektrum kebisingan kipas, dan kecepatan waktu respons otomatis t ≤ 60 detik.
4.3 Analisis Penurunan Risiko FMEA & Peningkatan Kepatuhan K3
    - Matriks perbandingan skor Severity, Occurrence, Detection, dan RPN sebelum vs sesudah telemetri (tercapai penurunan ≥ 40%).
4.4 Uji Validasi dan Signifikansi Statistik
    - Hasil pengujian komparatif membuktikan pengaruh signifikan sistem telemetri terhadap reduksi risiko bahaya tersembunyi (p < 0.05).

==================================================
BAB V: KESIMPULAN DAN SARAN
==================================================
5.1 Kesimpulan
    - Menjawab tuntas seluruh 7 RQ dengan bukti numerik in-situ: stabilitas suhu ≤ 24°C, kontrol kebisingan ≤ 85 dB, kecepatan respons t ≤ 60 detik, kenaikan kepatuhan K3 ≥ 90%, dan reduksi FMEA RPN ≥ 40% (p < 0.05).
5.2 Saran & Rekomendasi
    - Pedoman integrasi Building Management System (BMS) dengan telemetri keselamatan K3 untuk fasilitas hyperscale Tier 3 & 4.`;

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

      {/* Official Kop Surat for Print Mode */}
      <div className="hidden print:block bg-white mb-6">
        <OfficialKopSurat />
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
