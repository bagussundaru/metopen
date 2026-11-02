"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  FileCheck,
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Panduan Metodologi Kanvas Tesis S2
              </h1>
              <p className="text-xs text-slate-500">
                Pedoman penyusunan topik tesis rekayasa berstandar Scopus & Google Scholar
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Card 1: 5 Komponen Utama */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              5 Komponen Kanvas Topik Tesis
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white">1. Judul Sementara:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Harus memuat unsur spesifik: <strong>Subjek</strong> (objek material/elemen struktur), <strong>Intervensi</strong> (variabel bebas/perlakuan), dan <strong>Hasil Ukur</strong> (besaran teknis beserta satuan terukur).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white">2. Latar Belakang & Gap:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Maksimal 3 kalimat terstruktur: <em>Apa yang telah diketahui secara mapan</em> &rarr; <em>Apa keterbatasan / celah yang belum terjawab</em> &rarr; <em>Mengapa intervensi ini penting diselesaikan</em>. Wajib didukung minimal 5 referensi mutakhir (Scopus & Google Scholar).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white">3. Pertanyaan Riset Utama:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Dapat diuji empiris atau numerik. Hindari pertanyaan biner ya/tidak (&quot;apakah berpengaruh?&quot;) dan gunakan kata tanya yang menuntut ukuran parameter (&quot;seberapa besar hubungan...&quot;).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white">4. Metode Inti & Kebutuhan Data:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Pencantuman standar teknis (SNI, ASTM, AASHTO) dan inventarisasi ketersediaan data (primer/sekunder) guna memastikan penelitian realistis diselesaikan dalam masa studi S2 (&le; 24 minggu pengumpulan data).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white">5. Validasi Kelayakan:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Rubrik 5 kriteria (Kejelasan Gap, Kebaruan, Relevansi Rekayasa, Ketepatan Metode, dan Kelayakan Data) dengan evaluasi diri dan skor otomatis dari sistem.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Jebakan Novelty Semu */}
          <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <h2 className="font-bold text-base text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Menghindari Jebakan Novelty Semu (Peringatan Dosen)
            </h2>
            <div className="space-y-3 text-xs text-amber-800 dark:text-amber-300">
              <div>
                <strong>1. Jebakan Lokasi Baru (Location Trap):</strong> Mengklaim kebaruan hanya karena lokasi penelitian baru (mis. &quot;di Kabupaten X&quot;, &quot;pada Proyek Gedung Y&quot;) tanpa ada variabel kondisi tanah, beban seismik, atau material lokal yang diuji secara saintifik.
              </div>
              <div>
                <strong>2. Sindrom Perangkat Lunak (Software Syndrome):</strong> Mengklaim kebaruan hanya karena memodelkan dengan software/aplikasi baru (mis. &quot;dengan ABAQUS&quot;, &quot;berbasis SAP2000&quot;) tanpa ada kontribusi pada pemahaman fenomena rekayasa baru.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
