# Kanvas Tesis — Platform Penyusunan & Validasi Topik Tesis S2 Rekayasa

Aplikasi web interaktif untuk mahasiswa Magister (S2) Teknik Sipil dan program studi rekayasa lainnya untuk merumuskan, memvalidasi, memetakan literatur, dan mengekspor **Kanvas Topik Tesis** sesuai format tugas Metodologi Penelitian & Seminar Proposal (Acuan Pascasarjana UNY, Scopus, dan Google Scholar via Publish or Perish).

Aplikasi ini mengusung pendekatan **local-first** (berjalan penuh secara luring via `localStorage`, tanpa perlu registrasi/login backend) dan dilengkapi **Rule-Based Engine deterministik** yang mengevaluasi kelayakan proposal secara objektif, serta **opsional AI Gemini** dengan kebijakan ketat *Strict Zero-Hallucination*.

---

## 1. 5 Komponen Kanvas Topik Tesis (Standar Dosen)

| No | Komponen Kanvas | Ketentuan Akademis & Evaluasi Dosen |
|---|---|---|
| **1** | **Judul Sementara** | Spesifik dan terukur; wajib memuat 3 unsur inti: **Subjek Material/Elemen**, **Intervensi/Perlakuan**, dan **Hasil Ukur Besaran Terukur (satuan)** + batasan konteks lingkungan. Panjang ideal 8–25 kata. |
| **2** | **Latar Belakang & Gap** | Tajam, **maksimal 3 kalimat** (bukan paragraf bebas). Struktur: *State-of-the-Art* &rarr; *Research Gap (wajib penanda gap)* &rarr; *Urgensi Rekayasa*. Didukung minimal 5 referensi mutakhir (Scopus / Google Scholar). |
| **3** | **Pertanyaan Riset Utama** | Dapat diuji secara empiris (lab/lapangan) atau numerik (FEM). Dilengkapi variabel bebas/terikat/kontrol dan indikator keberhasilan terukur. **Wajib terhindar dari Jebakan Lokasi Baru dan Sindrom Perangkat Lunak**. |
| **4** | **Metode Inti & Data** | Pendekatan riset, alat pengujian laboratorium, standar baku (**SNI/ASTM/AASHTO**), dan inventarisasi ketersediaan data (primer/sekunder) dengan estimasi waktu $\le 24$ minggu. |
| **5** | **Validasi Kelayakan** | Rubrik evaluasi 5 kriteria (Kejelasan Gap, Kebaruan, Relevansi Rekayasa, Ketepatan Metode, Kelayakan Data) dengan perbandingan skor mandiri vs skor otomatis sistem melalui Radar Chart. |

---

## 2. Fitur-Fitur Unggulan

### 2.1 Editor Wizard 5 Langkah & Panel Validasi Live
- **Stepper Navigasi Interaktif:** Panduan pengisian langkah demi langkah yang ramah bagi pengguna non-IT.
- **Live Validation Panel (Desktop kanan / Mobile drawer):** Umpan balik langsung secara *real-time* (Error, Warning, Tip) dalam Bahasa Indonesia tanpa menunggu submit form.
- **Autosave Debounced (500 ms):** Data otomatis tersimpan ke `localStorage` (`kanvas_tesis_store_v1`).

### 2.2 Pencegah Jebakan Novelty Semu (Peringatan Khusus Dosen)
- **Deteksi Jebakan Lokasi Baru (*Location Trap*):** Sistem otomatis mendeteksi bila rumusan masalah sekadar memindahkan lokasi penelitian tanpa ada parameter fisika/material baru yang diuji.
- **Deteksi Sindrom Perangkat Lunak (*Software Syndrome*):** Sistem otomatis memberi peringatan keras bila topik sekadar mengklaim "menggunakan software komersial (SAP2000, ETABS, ABAQUS, PLAXIS)" tanpa kontribusi pada mekanisme rekayasa baru.

### 2.3 Modul Peta Literatur Bibliometrik (VOSviewer & Scopus CSV)
- **Integrasi VOSviewer:** Mendukung unggah berkas `.map.txt` dan `.net.txt` hasil ekspor VOSviewer, ditampilkan dengan koordinat asli (1:1 visual match) menggunakan pustaka kanvas **Cytoscape.js**.
- **Impor CSV Scopus & Publish or Perish (Google Scholar):** Membangun matriks ko-okurensi kata kunci dan pengelompokan komunitas **Louvain** secara instan langsung di peramban.
- **Tiga Sudut Pandang Graf:**
  1. *Network View:* Pewarnaan berdasarkan klaster topik riset.
  2. *Overlay View:* Gradien warna berdasarkan rata-rata tahun publikasi (*Avg. pub. year*).
  3. *Tabel Analitik:* Sortir frekuensi kata kunci, total tautan, dan tahun.
- **Deteksi Kandidat Research Gap Heuristik:**
  - *Topik Baru Berkembang:* Publikasi mutakhir $\ge 2024$ dengan frekuensi kemunculan masih rendah.
  - *Persilangan Antar Klaster Terisolasi:* Pasangan topik aktif dari klaster berbeda yang belum pernah dihubungkan.
- **Sematkan Temuan (Pin Gap):** Mahasiswa dapat menyematkan temuan bibliometrik sebagai bukti gap objektif pada kanvas.
- **Ekspor Format VOSviewer:** Ekspor dataset Scopus yang diunggah ke berkas `.map.txt` dan `.net.txt` untuk dibuka di software VOSviewer desktop.

### 2.4 Asisten AI Gemini (Opsional, Strict Zero-Hallucination)
- **Mode Rule-Based Default:** Jika `GEMINI_API_KEY` tidak diisi, fitur AI disembunyikan/dinonaktifkan secara anggun dengan badge *"Mode Rule-Based Aktif"*. Aplikasi tetap berfungsi 100% penuh.
- **Strict Anti-Halusinasi:** System instruction melarang keras mengarang nama penulis, tahun, jurnal, atau DOI fiktif. AI hanya menganalisis referensi yang secara eksplisit dilampirkan oleh mahasiswa.
- **4 Fitur Bantuan AI:**
  1. *Pertajam Judul:* 3 alternatif judul terstruktur [Subjek] + [Intervensi] + [Hasil Ukur] + [Konteks].
  2. *Sintesis Latar Belakang:* Merumuskan draf 3 kalimat tajam berbasis temuan kunci dan keterbatasan referensi pengguna.
  3. *Saran Variasi Pertanyaan Riset:* Menghasilkan 3 variasi RQ terukur bebas jebakan lokasi/software.
  4. *Evaluasi Metodologi Kritis:* Review 5 kriteria rubrik kelayakan tesis dengan catatan kelemahan dan saran aksi.

### 2.5 Ekspor Siap Kumpul & Berbagi
- **Cetak ke PDF (A4 Academic Layout):** Tampilan cetak A4 rapi (`/print/[id]`) via CSS `@media print` murni dengan tabel 5 komponen, daftar pustaka APA, dan gambar snapshot graf literatur tanpa terpotong (*page-break-inside: avoid*).
- **Ekspor DOCX (.docx):** Dokumen Microsoft Word dengan styling tabel formal dan kop akademik.
- **Ekspor Markdown (.md):** File teks berformat GitHub Flavored Markdown (GFM) untuk dokumentasi riset / repositori.
- **Cadangan JSON (.json):** Seluruh data kanvas dapat diunduh dan diimpor kembali di perangkat lain.

---

## 3. Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript (Strict)
- **Styling:** Tailwind CSS v4 + Lucide React Icons
- **State Management:** Zustand dengan `persist` middleware ke `localStorage`
- **Skema & Validasi:** Zod v4
- **Visualisasi Graf:** Cytoscape.js (stabil, visualisasi koordinat preset VOSviewer 1:1, snapshot PNG `cy.png()`) + Graphology & Louvain Community Detection
- **File Parsing:** PapaParse (CSV/TSV parsing Scopus & Publish or Perish)
- **Ekspor Dokumen:** `docx` (npm) untuk Word, `@media print` CSS untuk PDF A4
- **AI Integration:** SDK Resmi `@google/genai` (server-side Route Handlers di `app/api/ai/*`)
- **Testing:** Vitest (Unit Tests untuk validator & parser) + Playwright (End-to-End E2E Browser Testing)

---

## 4. Struktur Proyek

```
metopen/
├── app/
│   ├── page.tsx                    # Beranda (Daftar Draf, Template UNY, Impor/Ekspor Backup)
│   ├── layout.tsx                  # Root Layout & Metadata
│   ├── guide/page.tsx              # Panduan Metodologi & Pencegah Jebakan Novelty
│   ├── print/[id]/page.tsx         # Tampilan Cetak A4 siap Print-to-PDF
│   ├── editor/[id]/page.tsx        # Halaman Editor Kanvas
│   └── api/ai/
│       ├── status/route.ts         # GET: Status ketersediaan Gemini AI & Model
│       ├── review/route.ts         # POST: Review Komprehensif 5 Kriteria Kanvas
│       ├── suggest-title/route.ts  # POST: Pertajam Judul 3 Komponen
│       ├── sharpen-gap/route.ts    # POST: Sintesis Latar Belakang 3 Kalimat
│       └── rq-variants/route.ts    # POST: Variasi Pertanyaan Riset Terukur
├── components/
│   ├── ai/                         # Komponen AI (Badge Status, Modal Saran Judul/Gap/RQ/Review)
│   ├── dashboard/                  # Kartu Kanvas & Modal Impor/Ekspor JSON
│   ├── editor/                     # Wizard 5 Langkah & Live Validation Panel
│   ├── network/                    # CytoscapeGraph, VOSviewer & Scopus Uploader, Keyword Table
│   └── export/                     # Dialog Ekspor (DOCX, PDF, Markdown, JSON)
├── lib/
│   ├── ai/                         # Gemini Client & In-Memory Rate Limiter
│   ├── export/                     # DOCX Builder & Markdown Builder
│   ├── parsers/                    # VOSviewer Parser, Scopus Parser, Thesaurus
│   ├── schemas/                    # Zod Schemas (Canvas, Literature, AI)
│   ├── store/                      # Zustand Store (Draf, Template Bawaan UNY)
│   └── validators/                 # Rule-Based Validation Engine & Deterministic Rubric Scorer
└── tests/
    ├── e2e/                        # Playwright E2E Tests (Skenario Alur Lengkap & Jebakan Dosen)
    └── unit/                       # Vitest Unit Tests (Validators, Parsers, Store, AI Client)
```

---

## 5. Panduan Instalasi & Menjalankan Lokal

### 5.1 Prasyarat
- Node.js versi 18, 20, atau 21+
- npm atau pnpm/yarn

### 5.2 Langkah Instalasi
1. Klon repositori:
   ```bash
   git clone https://github.com/bagussundaru/metopen.git
   cd metopen
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment (Opsional):
   Salin `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *Catatan: Jika `GEMINI_API_KEY` dikosongkan, aplikasi akan langsung berjalan dalam **Mode Rule-Based Penuh** tanpa galat.*

4. Jalankan Server Pengembangan:
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses di `http://localhost:3000`.

---

## 6. Pengujian Kualitas Kode & QA

Aplikasi ini diverifikasi dengan standar pengujian ganda:

### 6.1 Unit Tests (Vitest)
Menjalankan pengujian logika validator rule-based, pemecah kalimat Bahasa Indonesia, parser VOSviewer, matriks ko-okurensi Scopus, Zustand store, dan rate limiter:
```bash
npm test
```
*Hasil: 61/61 unit tests passing di 10 file pengujian.*

### 6.2 End-to-End Tests (Playwright)
Menjalankan simulasi browser Chromium nyata untuk menguji alur pembuatan kanvas, formulasi 5 komponen, pencegah jebakan novelty, dan visualisasi literatur VOSviewer:
```bash
npm run test:e2e
```
*Hasil: 2/2 skenario E2E passing.*

### 6.3 Pengecekan Tipe & Linting
```bash
npm run typecheck
npm run lint
```
*Hasil: 0 errors, 0 warnings.*

---

## 7. Panduan Deployment (Vercel & Modal.com)

### 7.1 Deploy ke Vercel (Rekomendasi Utama)
Aplikasi Next.js 16 App Router ini dioptimalkan 100% untuk Vercel:
1. Hubungkan repositori GitHub `https://github.com/bagussundaru/metopen.git` ke Vercel Dashboard.
2. Vercel akan secara otomatis mendeteksi konfigurasi Next.js (`npm run build`).
3. Pada tab **Environment Variables**, tambahkan:
   - `GEMINI_API_KEY`: *(Kunci API Google AI Studio Anda)*
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `AI_RATE_LIMIT_PER_HOUR`: `30`
4. Klik **Deploy**. Aplikasi akan aktif dengan URL HTTPS resmi dalam waktu $< 2$ menit.

### 7.2 Deploy ke Modal.com
Modal.com dirancang untuk containerised Python/GPU backend. Jika ingin men-deploy web frontend Next.js ini di Modal, gunakan container Web Endpoint (`modal.web_server` atau Docker image Node.js):
```python
import modal

app = modal.App("kanvas-tesis")
image = modal.Image.debian_slim().run_commands(
    "apt-get update && apt-get install -y curl",
    "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
    "apt-get install -y nodejs",
    "git clone https://github.com/bagussundaru/metopen.git /app",
    "cd /app && npm install && npm run build"
)

@app.function(image=image, secrets=[modal.Secret.from_name("gemini-secret")])
@modal.web_server(port=3000)
def serve():
    import subprocess
    subprocess.Popen("npm run start", cwd="/app", shell=True)
```
*Rekomendasi praktis:* Deploy aplikasi web Next.js ke **Vercel** (gratis, zero-config, CDN global), dan gunakan Modal hanya bila memerlukan pemrosesan numerik komputasi berat (FEM/Python) di masa depan.

---

## 8. Laporan UAT (User Acceptance Testing) Berdasarkan Tugas Dosen

| Komponen Pengujian | Skenario UAT | Hasil Nyata Sistem | Status |
|---|---|---|:---:|
| **Langkah 1: Judul** | Input Subjek ("balok beton bertulang"), Intervensi ("substitusi 15-30% fly ash"), Hasil Ukur ("kuat lentur MPa & daktilitas") | Tersusun 22 kata otomatis. Rule engine memverifikasi keberadaan 3 unsur wajib & besaran terukur. | ✅ LULUS |
| **Pencegah Judul Kabur** | Input judul "Analisis Jembatan Kali Progo Menggunakan Software SAP2000" | Sistem memunculkan 3 peringatan: kata kabur 'analisis', tidak ada satuan terukur, dan indikasi jebakan software/lokasi. | ✅ LULUS |
| **Langkah 2: Latar & Gap** | Input narasi $\le 3$ kalimat dengan kata penanda gap ("namun", "belum terukur") + 5 referensi terlampir | Latar belakang terverifikasi presisi 3 kalimat, 5 referensi terindeks Scopus/Google Scholar (4 mutakhir $\le 5$ tahun). Matriks sintesis otomatis terbuat. | ✅ LULUS |
| **Langkah 3: Pertanyaan Riset** | Input pertanyaan yang dapat diuji empiris dengan variabel & indikator terukur | Checklist novelty 5 butir terpenuhi, sistem meloloskan status RQ menjadi valid. | ✅ LULUS |
| **Deteksi Jebakan Novelty** | Input RQ "Bagaimana analisis deformasi di Kali Progo dengan software SAP2000?" | Sistem mengaktifkan peringatan: *Terdeteksi indikasi 'Jebakan Lokasi Baru'* dan *Terdeteksi indikasi 'Sindrom Perangkat Lunak'*. | ✅ LULUS |
| **Langkah 4: Metode & Data** | Input metode laboratorium (UTM, LVDT), standar baku SNI 2847:2019, dan kebutuhan data primer (16 minggu) | Durasi total $16 \le 24$ minggu masa studi S2. Ketersediaan data berstatus *available*. Tidak ada data berstatus uncertain tanpa bukti. | ✅ LULUS |
| **Langkah 5: Rubrik Kelayakan** | Perhitungan skor otomatis 5 pilar (Kejelasan Gap: 4, Kebaruan: 4, Relevansi: 4, Metode: 4, Data: 4) | Rata-rata skor 4.0 / 4.0. Status kanvas dinyatakan: **"Siap Diajukan ke Dosen Pembimbing"**. Radar chart memvisualisasikan skor mandiri vs sistem. | ✅ LULUS |
| **Tab Peta Literatur** | Muat berkas sample VOSviewer & Scopus CSV | Graf Cytoscape.js memetakan 8 kata kunci, 11 relasi, klaster Louvain, gradien tahun Overlay View, serta mendeteksi kandidat gap *Sulfate Resistance* (2024.1) dan persilangan *geopolymer concrete $\times$ reinforced concrete beams*. | ✅ LULUS |
| **Ekspor Dokumen** | Ekspor ke DOCX, cetak A4 via `@media print`, Markdown, dan JSON | Dokumen `.docx` terunduh dengan tabel rapi, layout cetak PDF A4 presisi tanpa overflow, dan file `.json` berhasil diimpor kembali. | ✅ LULUS |
| **Fitur AI Gemini** | Uji mode tanpa API Key & uji endpoint AI | UI otomatis menampilkan badge *Mode Rule-Based Aktif (Fitur AI Opsional)*, seluruh fungsi kanvas tetap berjalan tanpa eror. | ✅ LULUS |

---

## 9. Lisensi
Didistribusikan untuk keperluan akademis dan riset mahasiswa pascasarjana.
Dikembangkan dengan dedikasi untuk mendukung penelitian berintegritas tinggi di bidang Teknik Sipil dan Rekayasa.
