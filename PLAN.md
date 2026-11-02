# RENCANA KERJA & ARSITEKTUR: KANVAS TESIS

Aplikasi web *Kanvas Tesis* dirancang khusus untuk mahasiswa S2 (fokus: Teknik Sipil & rumpun rekayasa, disesuaikan dengan acuan akademik program pascasarjana berbasis **Scopus** dan **Google Scholar**) untuk menyusun, memvalidasi (rule-based & AI opsional), memvisualisasikan peta literatur (VOSviewer / Scopus / Google Scholar via Publish or Perish), serta mengekspor kanvas topik tesis siap kumpul ke format PDF, DOCX, Markdown, dan JSON.

---

## 1. ARSITEKTUR SISTEM & PEMILIHAN TEKNOLOGI

### 1.1 Diagram Arsitektur Tingkat Tinggi
```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (BROWSER)                                 |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   Zustand Store    |  |  Rule-Based Engine   |  |   Visualisasi Graf Jaringan| |
|  | (Drafts & Canvases)|  | (Pure TS Validators) |  |       (Cytoscape.js)      |  |
|  +---------+----------+  +----------+-----------+  +-------------+-------------+  |
|            |                        |                            |                |
|            v                        v                            v                |
|    localStorage         Live Feedback Panel & Rubrik     Peta Literatur & Gap Pin |
|    (Local-First)        (Kesiapan: Siap/Minor/Mayor)     (Cluster, Overlay, Table)|
|            |                                                                      |
|  +---------v-------------------------------------------------------------------+  |
|  | Modul Ekspor: A4 Print CSS (PDF) | docx (DOCX) | Markdown (.md) | JSON (.json)| |
+------------------------------------+----------------------------------------------+
                                     | (Hanya jika GEMINI_API_KEY aktif)
                                     v
+-----------------------------------------------------------------------------------+
|                           SERVER (NEXT.JS 15 APP ROUTER)                          |
|                                                                                   |
|  Route Handlers: /api/ai/* (review, suggest-title, sharpen-gap, rq-variants)      |
|  - In-Memory Rate Limiter (AI_RATE_LIMIT_PER_HOUR)                                |
|  - Gemini API via @google/genai SDK (Strict Zero-Hallucination System Prompt)      |
|  - Zod Structured Output Validation + 1x Retry Fallback                           |
+-----------------------------------------------------------------------------------+
```

### 1.2 Tech Stack
- **Framework:** Next.js 15 (App Router) + React 19 / React 18 kompatibel.
- **Bahasa:** TypeScript (Strict Mode).
- **Styling & UI:** Tailwind CSS, shadcn/ui (Radix Primitives), Lucide React (ikon).
- **State Management:** Zustand + `persist` middleware ke `localStorage` (Local-First, tanpa wajib login).
- **Validasi Skema:** Zod v3.
- **Parsing Data:** PapaParse (CSV/TSV/delimited text).
- **Visualisasi Jaringan:** **Cytoscape.js** (lihat alasan pemilihan di bawah).
- **Clustering & Analisis Graf:** Graphology + `graphology-communities-louvain` (untuk co-occurrence Scopus CSV).
- **Ekspor Dokumen:**
  - **PDF:** Halaman Print terdedikasi (`app/print/[id]`) dengan `@media print` CSS A4 terstandarisasi.
  - **DOCX:** Library `docx` (npm) untuk berkas Word terstruktur dengan tabel & format rapi.
  - **Markdown & JSON:** String builder & native file download blob.
- **AI SDK:** Official `@google/genai` (Node.js runtime server-side saja, zero client leak).
- **Testing:** Vitest + React Testing Library (unit/integration test) + Playwright (E2E browser testing).

### 1.3 Keputusan Visualisasi Jaringan: Mengapa Cytoscape.js vs react-force-graph-2d?
Kami memilih **Cytoscape.js** (dibandingkan `react-force-graph-2d`) dengan pertimbangan teknis:
1. **Dukungan Koordinat Asli VOSviewer:** Berkas map VOSviewer menyertakan koordinat `(x, y)` hasil t-SNE/VOS layout. Cytoscape.js memiliki layout bawaan `preset` yang dapat merender node secara instan dan 100% persis dengan tampilan asli desktop VOSviewer tanpa perlu kalkulasi ulang fisika graf.
2. **Ekspor Gambar Resolusi Tinggi untuk Laporan:** Cytoscape.js menyediakan API bawaan `cy.png({ full: true, scale: 2 })` yang sangat stabil dan sinkron, memudahkan pengambilan snapshot peta literatur untuk disematkan langsung ke dokumen DOCX dan halaman cetak PDF.
3. **Kestabilan SSR & Bundle di Next.js:** `react-force-graph-2d` bergantung pada Three.js / Canvas WebGL wrapper dinamis yang kerap mengalami *hydration mismatch* atau canvas context loss pada React 18/19. Cytoscape.js adalah library visualisasi berbasis canvas/DOM murni dengan siklus hidup (*lifecycle*) yang sangat terprediksi di dalam React `useEffect`.
4. **Kinerja & Fleksibilitas Layout:** Ketika pengguna mengimpor CSV Scopus mentah (tanpa koordinat), Cytoscape mendukung layout `cose` (Compound Spring Embedder) yang cepat, serta mendukung *node clustering*, *label thresholding*, dan *zoom/pan clamping* untuk dataset hingga ribuan node.

---

## 2. STRUKTUR FOLDER PROYEK

```
d:/metopen/
├── .env.example                      # Template env (GEMINI_API_KEY, GEMINI_MODEL, AI_RATE_LIMIT_PER_HOUR)
├── .env.local                        # Secret lokal (gitignored)
├── package.json
├── tsconfig.json                     # Strict TypeScript config
├── next.config.ts                    # Security headers (CSP, X-Content-Type-Options, dll)
├── tailwind.config.ts
├── vitest.config.ts                  # Konfigurasi Vitest untuk unit tests
├── playwright.config.ts              # Konfigurasi Playwright E2E
├── PLAN.md                           # Dokumen perencanaan ini
├── app/
│   ├── globals.css                   # Tailwind + print CSS (@media print)
│   ├── layout.tsx                    # Root layout + Theme Provider & Toaster
│   ├── page.tsx                      # Beranda (Hero, Daftar Draf, Impor JSON, Panduan Singkat)
│   ├── editor/
│   │   └── [id]/
│   │       └── page.tsx              # Halaman Editor Wizard (Langkah 1-5 + Tab VOSviewer)
│   ├── print/
│   │   └── [id]/
│   │       └── page.tsx              # Halaman Tampilan Cetak A4 siap Print/PDF
│   ├── guide/
│   │   └── page.tsx                  # Panduan pengisian & contoh kanvas tesis nyata
│   └── api/
│       └── ai/
│           ├── review/route.ts       # POST /api/ai/review
│           ├── suggest-title/route.ts# POST /api/ai/suggest-title
│           ├── sharpen-gap/route.ts  # POST /api/ai/sharpen-gap
│           └── rq-variants/route.ts  # POST /api/ai/rq-variants
├── components/
│   ├── ui/                           # Komponen primitif shadcn/ui (Button, Card, Dialog, Tabs, etc.)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── CanvasCard.tsx            # Kartu draf kanvas
│   │   └── ImportExportModal.tsx     # Modal backup JSON
│   ├── editor/
│   │   ├── StepWizard.tsx            # Navigasi Stepper 5 Langkah + VOSviewer Tab
│   │   ├── LiveValidationPanel.tsx   # Panel validasi aturan real-time (desktop kanan / mobile drawer)
│   │   ├── Step1Title.tsx            # Form Subjek, Intervensi, Hasil Ukur, Konteks, Judul Final
│   │   ├── Step2Background.tsx       # 3 Kalimat Gap, Reference Manager, Matriks Sintesis
│   │   ├── Step3ResearchQuestion.tsx # RQ, Variabel, Indikator, Checklist Jebakan Novelty
│   │   ├── Step4MethodData.tsx       # Pendekatan, Alat, Standar, Tabel Data & Ketersediaan
│   │   ├── Step5Feasibility.tsx      # Rubrik 5 Kriteria, Radar Chart, Skor Otomatis vs Diri, AI Review
│   │   └── LiteratureMapTab.tsx      # Tab Visualisasi VOSviewer & Scopus Co-occurrence
│   ├── network/
│   │   ├── CytoscapeGraph.tsx        # Komponen pembungkus Cytoscape.js interaktif
│   │   ├── VosviewerUploader.tsx     # Dropzone berkas Map & Network
│   │   ├── ScopusUploader.tsx        # Dropzone CSV Scopus + Pengaturan Threshold
│   │   ├── KeywordTable.tsx          # Tabel analitik kata kunci
│   │   └── GapCandidateList.tsx      # Rekomendasi kandidat gap dari graf & tombol pin
│   └── export/
│       ├── ExportDialog.tsx          # Dialog unduh PDF, DOCX, Markdown, JSON
│       └── CanvasPrintLayout.tsx     # Komponen cetak A4 rapi tanpa terpotong
├── lib/
│   ├── types/
│   │   └── canvas.ts                 # TypeScript type definitions
│   ├── schemas/
│   │   ├── canvas.schema.ts          # Zod schema kanvas lengkap
│   │   ├── literature.schema.ts      # Zod schema VOSviewer & Scopus
│   │   └── ai.schema.ts              # Zod schema request & response Gemini
│   ├── store/
│   │   ├── canvas-store.ts           # Zustand store + persist (CRUD draft, activeCanvas)
│   │   └── default-canvas.ts         # Nilai default & contoh template kanvas
│   ├── validators/
│   │   ├── index.ts                  # Master rule engine aggregator & scorer
│   │   ├── sentence-splitter.ts      # Pemecah kalimat Bahasa Indonesia tahan singkatan
│   │   ├── title-validator.ts        # Validasi 5.1 Judul
│   │   ├── background-validator.ts   # Validasi 5.2 Latar & Gap
│   │   ├── rq-validator.ts           # Validasi 5.3 RQ & Jebakan Novelty
│   │   ├── method-validator.ts       # Validasi 5.4 Metode & Kebutuhan Data
│   │   └── rubric-scorer.ts          # Penurunan skor otomatis 1-4 & status kesiapan
│   ├── parsers/
│   │   ├── vosviewer-parser.ts       # Parser map & network VOSviewer
│   │   ├── scopus-parser.ts          # Parser CSV Scopus & generator co-occurrence
│   │   └── thesaurus.ts              # Normalisasi & kamus sinonim kata kunci
│   ├── export/
│   │   ├── docx-builder.ts           # Generator dokumen .docx
│   │   ├── markdown-builder.ts       # Generator .md string
│   │   └── json-builder.ts           # Helper export/import JSON
│   └── ai/
│       ├── gemini-client.ts          # Inisialisasi SDK @google/genai di server
│       ├── rate-limiter.ts           # In-memory sliding window rate limiter
│       └── prompts.ts                # Strict system prompts & instructions
├── tests/
│   ├── fixtures/
│   │   ├── sample-vosviewer.map.txt  # Fixture map file asli
│   │   ├── sample-vosviewer.net.txt  # Fixture network file asli
│   │   ├── sample-scopus.csv         # Fixture ekspor CSV Scopus
│   │   └── sample-canvas.json        # Fixture kanvas valid
│   ├── unit/
│   │   ├── sentence-splitter.test.ts # Uji potong kalimat & singkatan "dkk.", "No.", dll
│   │   ├── title-validator.test.ts   # Uji kata kabur, besaran ukur, batas kata
│   │   ├── background-validator.test.ts # Uji batas 3 kalimat, gap keywords, usia referensi
│   │   ├── rq-validator.test.ts      # Uji detektor lokasi baru & sindrom software
│   │   ├── method-validator.test.ts  # Uji data uncertain, standar uji, durasi > 24 minggu
│   │   ├── rubric-scorer.test.ts     # Uji kalkulasi skor rubrik otomatis
│   │   ├── vosviewer-parser.test.ts  # Uji toleransi delimiter & kolom bobot bervariasi
│   │   └── scopus-parser.test.ts     # Uji parsing CSV Scopus & pembangunan graf
│   └── e2e/
│       └── canvas-workflow.spec.ts   # Playwright: Buat kanvas -> Isi -> Validasi -> Ekspor
```

---

## 3. SKEMA DATA LENGKAP (ZOD & TYPESCRIPT)

Skema data didefinisikan dengan Zod agar menjamin type safety di runtime dan kompilasi:

```typescript
// lib/schemas/canvas.schema.ts
import { z } from "zod";

export const ReferenceSchema = z.object({
  id: z.string().uuid(),
  authors: z.string().min(1, "Penulis wajib diisi"),
  year: z.number().int().min(1900).max(2100),
  title: z.string().min(1, "Judul literatur wajib diisi"),
  source: z.string().optional(), // Jurnal / Konferensi
  indexSource: z.enum(["scopus", "google_scholar", "sinta", "other"]).default("scopus"), // Acuan Pascasarjana: Scopus & Google Scholar
  citedBy: z.number().int().min(0).optional().default(0),
  doi: z.string().optional(),
  keyFinding: z.string().min(1, "Temuan kunci wajib diisi untuk sintesis"),
  limitation: z.string().min(1, "Keterbatasan/gap wajib diisi untuk sintesis"),
});

export const DataNeedSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nama data wajib diisi"),
  kind: z.enum(["primary", "secondary"]),
  source: z.string().min(1, "Sumber data wajib diisi"),
  availability: z.enum(["available", "requires_permission", "must_generate", "uncertain"]),
  accessEvidence: z.string().optional(),
  estimatedSize: z.string().optional(),
  timeEstimateWeeks: z.number().min(0).optional(),
  risk: z.string().optional(),
  mitigation: z.string().optional(),
});

export const RubricScoresSchema = z.object({
  gapClarity: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  novelty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  engineeringRelevance: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  methodFit: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  dataFeasibility: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export const PinnedFindingSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["emerging_topic", "isolated_cross", "student_keyword"]),
  label: z.string(),
  description: z.string(),
  pinnedAt: z.string(),
});

export const LiteratureMapSchema = z.object({
  sourceType: z.enum(["vosviewer", "scopus_csv"]).optional(),
  nodeCount: z.number(),
  edgeCount: z.number(),
  pinnedFindings: z.array(PinnedFindingSchema).default([]),
  snapshotImage: z.string().optional(), // Base64 data URI PNG
});

export const CanvasSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  meta: z.object({
    studentName: z.string().default(""),
    nim: z.string().default(""),
    institution: z.string().default("Program Pascasarjana Magister"),
    prodi: z.string().default("Teknik Sipil"),
    course: z.string().default("Metodologi Penelitian & Seminar Tesis"),
    lecturer: z.string().default(""),
  }),
  title: z.object({
    subject: z.string().default(""),
    intervention: z.string().default(""),
    outcome: z.string().default(""),
    context: z.string().optional().default(""),
    composed: z.string().default(""),
  }),
  background: z.object({
    // Maksimal 3 kalimat (index 0 wajib terisi jika dimulai, 1 & 2 opsional)
    sentences: z.tuple([
      z.string().default(""),
      z.string().default(""),
      z.string().default(""),
    ]),
    references: z.array(ReferenceSchema).default([]),
  }),
  researchQuestion: z.object({
    main: z.string().default(""),
    type: z.enum(["empirical", "numerical", "both"]).default("empirical"),
    variables: z.object({
      independent: z.array(z.string()).default([]),
      dependent: z.array(z.string()).default([]),
      controlled: z.array(z.string()).default([]),
    }),
    measurableIndicator: z.string().default(""),
    hypothesis: z.string().optional().default(""),
    checklist: z.object({
      notJustLocation: z.boolean().default(false),
      notJustSoftware: z.boolean().default(false),
      measurableVariables: z.boolean().default(false),
      hasDecisionThreshold: z.boolean().default(false),
      feasibleInStudyTime: z.boolean().default(false),
    }).default({}),
  }),
  method: z.object({
    approach: z.enum([
      "experimental_lab",
      "field_study",
      "numerical_fem",
      "simulation",
      "statistical_modeling",
      "ml_data_driven",
      "mixed",
      "other",
    ]).default("experimental_lab"),
    description: z.string().default(""),
    tools: z.array(z.string()).default([]),
    standards: z.array(z.string()).default([]),
    dataNeeds: z.array(DataNeedSchema).default([]),
  }),
  feasibility: z.object({
    selfScores: RubricScoresSchema.default({
      gapClarity: 3,
      novelty: 3,
      engineeringRelevance: 3,
      methodFit: 3,
      dataFeasibility: 3,
    }),
    autoScores: RubricScoresSchema.optional(),
    scoreExplanations: z.record(z.string(), z.string()).optional(),
    overallStatus: z.enum(["ready", "minor_revision", "major_revision"]).default("minor_revision"),
    aiReview: z.object({
      scores: RubricScoresSchema,
      weaknesses: z.array(z.string()),
      suggestions: z.array(z.string()),
      noveltyTrapDetected: z.boolean(),
      noveltyTrapEvidence: z.string().optional(),
      reviewedAt: z.string(),
    }).optional(),
    notes: z.string().default(""),
  }),
  literatureMap: LiteratureMapSchema.optional(),
});

export type Canvas = z.infer<typeof CanvasSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
export type DataNeed = z.infer<typeof DataNeedSchema>;
export type RubricScores = z.infer<typeof RubricScoresSchema>;
export type RubricKey = keyof RubricScores;
```

---

## 4. DETAIL MESIN VALIDASI RULE-BASED (LIB/VALIDATORS)

Setiap fungsi validator berada di modul terpisah di `lib/validators/` tanpa ketergantungan UI, mengembalikan larik objek `ValidationIssue`:
```typescript
export interface ValidationIssue {
  id: string;
  field: string;
  level: "error" | "warning" | "tip";
  message: string;
  suggestion?: string;
}
```

### 4.1 Pemecah Kalimat Bahasa Indonesia (`sentence-splitter.ts`)
- Memecah teks latar belakang menjadi kalimat terpisah dengan regex berbasis lookbehind/lookahead.
- Menjaga singkatan akademik dan teknis agar tidak keliru dianggap akhir kalimat:
  - Singkatan nama/referensi: `dkk.`, `et al.`, `No.`, `Vol.`, `Hal.`, `pp.`, `ed.`, `Prof.`, `Dr.`, `Ir.`, `Eng.`
  - Singkatan umum: `mis.`, `dsb.`, `dll.`, `dst.`, `yaitu.`, `a.n.`
  - Angka desimal (mis. `0.45 MPa`, `3.14`, `SNI 03-2847-2002`).

### 4.2 Validasi Judul (`title-validator.ts`)
1. **Error:** Salah satu dari subjek, intervensi, atau hasil ukur kosong.
2. **Warning (Besaran Terukur):** Komponen hasil ukur tidak memuat kata kunci besaran/satuan terukur.
   - *Kamus kata kunci:* `kuat`, `tegangan`, `regangan`, `lendutan`, `debit`, `kapasitas`, `settlement`, `penurunan`, `biaya`, `durasi`, `akurasi`, `kelelahan`, `fatigue`, `permeabilitas`, `daktilitas`, `momen`, `torsi`, `modulus`, `porositas`, `viskositas`, `kecepatan`, `percepatan`, `faktor keamanan`, `MPa`, `kPa`, `kN`, `mm`, `cm`, `m`, `m³/s`, `%`, `kg`, `ton`, `persen`, `detik`, `jam`.
3. **Warning (Panjang Judul):** Judul tersusun (composed) kurang dari 8 kata atau lebih dari 25 kata.
4. **Warning (Kata Kabur):** Mengandung kata ambigu seperti `"analisis"`, `"studi"`, `"tinjauan"`, `"pengaruh"` tanpa variabel terukur yang jelas mengikutinya.
5. **Tip (Prefix Lokasi/Aplikasi):** Diawali frasa lokasi atau software (mis. *"Studi Kasus Jembatan X"*, *"Aplikasi SAP2000 pada..."*).

### 4.3 Validasi Latar Belakang & Gap (`background-validator.ts`)
1. **Error:** Kalimat lebih dari 3 (dihitung via `splitSentencesIndonesian`).
2. **Warning (Penanda Gap):** Tidak ada kalimat yang memuat frasa gap:
   - *Kamus gap:* `belum`, `masih terbatas`, `belum ada`, `tidak mempertimbangkan`, `kurang`, `namun demikian`, `sayangnya`, `tetapi`, `namun`, `tantangan`, `kelemahan`, `keterbatasan`, `gap`, `unaddressed`, `however`, `lacks`, `little is known`.
3. **Warning (Dukungan Referensi):** Referensi terhubung kurang dari 2.
4. **Warning (Kedalaman & Kebaruan Literatur):** Total referensi kurang dari 5 atau tidak ada satu pun referensi dalam kurun waktu $\le 5$ tahun terakhir (dihitung dinamis: `currentYear - ref.year <= 5`).
5. **Tip (Struktur Kalimat 1):** Kalimat 1 disarankan menyatakan *state-of-the-art* / apa yang sudah diketahui secara umum.

### 4.4 Validasi Pertanyaan Riset & Detektor Novelty Semu (`rq-validator.ts`)
1. **Error:** RQ tidak diakhiri tanda tanya (`?`) atau variabel bebas/terikat belum terdefinisi.
2. **Warning (Bentuk Ya/Tidak):** RQ diawali pola ya/tidak seperti `"Apakah ... berpengaruh terhadap ...?"` tanpa menanyakan besaran/mekanisme.
   - *Saran perbaikan:* Ganti dengan *"Seberapa besar pengaruh..."*, *"Bagaimana hubungan matematis antara..."*, atau *"Pada rentang variasi berapa..."*.
3. **Detektor Jebakan Lokasi Baru (Location Trap):**
   - Mendeteksi pola regex: `/\b(di\s+[A-Z][a-z]+|pada\s+daerah|studi\s+kasus|wilayah|kota|kabupaten|ruas\s+jalan|gedung|jembatan)\b/i`.
   - Mengeluarkan peringatan reflektif: *"Apa yang secara ilmiah berbeda di lokasi ini (kondisi tanah, iklim, beban ekstrim, seismik) dan apakah karakteristik tersebut diuji sebagai variabel penelitian?"*
4. **Detektor Sindrom Perangkat Lunak (Software Syndrome):**
   - Mendeteksi pola regex: `/\b(menggunakan\s+software|berbasis\s+aplikasi|sistem\s+informasi|dengan\s+(?:SAP2000|ETABS|PLAXIS|ABAQUS|ANSYS|Python|AutoCAD|Revit))\b/i`.
   - Mengeluarkan peringatan reflektif: *"Jika software tersebut diganti dengan software sejenis, apakah temuan penelitian Anda tetap bernilai ilmiah bagi disiplin rekayasa?"*
5. **Peringatan Checklist:** Peringatan jika 5 butir checklist reflektif belum semuanya dicentang oleh mahasiswa.

### 4.5 Validasi Metode & Data (`method-validator.ts`)
1. **Error:** Tabel kebutuhan data kosong (`dataNeeds.length === 0`).
2. **Warning (Kepastian Data):** Terdapat data dengan status `uncertain`, data `requires_permission` tanpa bukti perizinan (`accessEvidence`), atau data `must_generate` tanpa estimasi jumlah/waktu.
3. **Warning (Waktu Studi S2):** Total estimasi waktu pengumpulan data $> 24$ minggu (melebihi durasi realistis 1 semester S2).
4. **Warning (Standar Pengujian):** Pendekatan `experimental_lab` atau `field_study` tanpa mencantumkan standar teknis (mis. ASTM, SNI, ISO, AASHTO).
5. **Warning (Kesesuaian RQ & Metode):** Tipe RQ bernilai `numerical` tetapi pendekatan yang dipilih bukan numerik/simulasi (atau sebaliknya).

### 4.6 Algoritma Penurunan Skor Otomatis Rubrik (1–4) & Status
- **Skor Dasar:** Tiap 5 kriteria (`gapClarity`, `novelty`, `engineeringRelevance`, `methodFit`, `dataFeasibility`) dimulai dari nilai **4**.
- **Formula Pengurangan:**
  $$\text{Skor Kriteria} = \max\left(1, \operatorname{round}\left(4 - 1.0 \times N_{\text{error}} - 0.5 \times N_{\text{warning}}\right)\right)$$
- **Penjelasan Transparan:** Setiap kriteria menyajikan rincian poin dan alasan spesifik mengapa skor berkurang (mis. *"Skor Kelayakan Data berkurang 0.5 karena terdapat 1 data berstatus uncertain"*).
- **Status Keseluruhan:**
  - **Siap diajukan:** Rata-rata skor $\ge 3.5$ dan tidak ada issue berlevel `error`.
  - **Perlu revisi minor:** Rata-rata skor $\ge 2.5$ dan tidak ada issue berlevel `error`.
  - **Perlu revisi mayor:** Rata-rata skor $< 2.5$ atau terdapat $\ge 1$ issue berlevel `error`.

---

## 5. MODUL PETA LITERATUR (VOSVIEWER, SCOPUS & GOOGLE SCHOLAR)

### 5.1 Parser File Ekspor VOSviewer
- Menerima file `map` dan `network` hasil ekspor VOSviewer (teks tab-delimited).
- **Penanganan Toleran:**
  - Auto-deteksi separator (`\t`, `,`, `;`).
  - Pembersihan UTF-8 BOM (`\uFEFF`).
  - Kolom Map fleksibel: memetakan variasi penamaan kolom VOSviewer seperti `weight<Occurrences>`, `weight<Links>`, `weight<Total link strength>`, `score<Avg. pub. year>`, `score<Avg. citations>`, `cluster`.
  - Network file: memetakan baris format `id1 id2 strength` atau `label1 label2 strength`.
- Unit test dibuat dengan fixture nyata untuk memverifikasi parsing tanpa menebak.

### 5.2 Parser CSV Scopus & Google Scholar (via Publish or Perish / Harzing PoP)
- Mahasiswa S2 umumnya mengunduh metadata literatur dari Scopus dan Google Scholar menggunakan perayap seperti **Publish or Perish (PoP)** atau ekspor langsung Scopus.
- Aplikasi mendukung impor CSV dari:
  1. **Scopus Direct CSV Export:** Kolom `Authors`, `Title`, `Year`, `Source title`, `DOI`, `Author Keywords`, `Index Keywords`, `Cited by`.
  2. **Google Scholar / Publish or Perish (PoP) CSV:** Kolom `Authors`, `Title`, `Year`, `Source`, `Cites`, `DOI`, `Keywords` / `Abstract`.
- Ekstraksi otomatis kata kunci & normalisasi dengan tesaurus (penanganan sinonim & stopwords).
- Pembangunan matriks co-occurrence pasangan kata kunci dalam publikasi yang sama.
- Ambang batas frekuensi kemunculan (*minimum occurrences*) dan bobot tautan yang dapat diatur via slider di UI.
- Deteksi cluster otomatis menggunakan modul Louvain modularity (`graphology-communities-louvain`).
- Fitur ekspor ulang ke format berkas VOSviewer (`.map.txt` dan `.net.txt`) yang siap dibuka di software desktop VOSviewer.
- Fitur seleksi dan transfer langsung referensi dari hasil pencarian Scopus / Google Scholar ke daftar referensi Kanvas (Langkah 2) dengan 1-klik.

### 5.3 Analisis Gap & Visualisasi Cytoscape.js
- **Tiga Mode Tampilan:**
  1. *Network View:* Warna berdasarkan cluster topik, ukuran node sebanding dengan occurrences.
  2. *Overlay View:* Gradien warna (mis. ungu ke kuning/merah) berdasarkan rata-rata tahun publikasi (`Avg. pub. year`).
  3. *Tabel Analitik:* Sortir berdasarkan frekuensi kemunculan, total link strength, dan tahun publikasi.
- **Deteksi Kandidat Research Gap (Heuristik):**
  - *Topik Berkembang (Emerging Topics):* Rata-rata tahun publikasi sangat baru (mis. $\ge 2022$), namun frekuensi kemunculan masih rendah.
  - *Persilangan Terisolasi (Isolated Cross):* Pasangan kata kunci dari cluster berbeda yang relevan tetapi memiliki link strength nol atau sangat lemah.
  - *Posisi Kata Kunci Pengguna:* Memetakan posisi subjek, intervensi, dan hasil ukur kanvas pengguna di dalam graf.
- **Pinning & Snapshot:**
  - Mahasiswa dapat mengeklik tombol *"Sematkan sebagai Bukti Gap"* pada kandidat gap. Temuan ini disimpan di `canvas.literatureMap.pinnedFindings` dan otomatis tercantum pada ekspor.
  - Tombol *"Ambil Snapshot Peta"* mengonversi kanvas Cytoscape menjadi PNG base64 untuk disertakan di berkas DOCX & cetakan PDF.

---

## 6. MODUL FITUR AI (GEMINI VIA @google/genai)

### 6.1 Kebijakan Keamanan & Zero-Hallucination
- Model diatur via `GEMINI_MODEL` (default: `gemini-2.5-flash` atau varian Gemini resmi).
- API Key hanya diakses dari Route Handler Next.js di sisi server (`app/api/ai/*`).
- Jika `GEMINI_API_KEY` tidak tersedia di environment, seluruh elemen UI AI disembunyikan/dinonaktifkan secara anggun dengan pesan informatif: *"Mode Rule-Based Aktif (Fitur AI Opsional)"*.
- **Larangan Halusinasi Sitasi:** System prompt melarang keras menciptakan referensi, nama jurnal, atau DOI palsu. AI hanya diperbolehkan menganalisis dan merujuk referensi yang secara eksplisit dikirim oleh pengguna dalam payload.

### 6.2 Endpoint & Structured Output (Zod)
1. **`POST /api/ai/review`:**
   - Menganalisis ke-5 komponen kanvas.
   - Mengembalikan evaluasi terstruktur: skor 1–4 per kriteria, alasan, 3 kelemahan utama, 3 saran konkret, dan deteksi jebakan novelty semu (beserta bukti kutipan kalimat).
2. **`POST /api/ai/suggest-title`:**
   - Mengembalikan 3 alternatif judul yang tetap taat struktur: [Subjek] + [Intervensi] + [Hasil Ukur] + [Konteks].
3. **`POST /api/ai/sharpen-gap`:**
   - Mengembalikan perbaikan narasi latar belakang $\le 3$ kalimat dengan formulasi logis (apa yang diketahui $\to$ apa keterbatasannya $\to$ urgensi penelitian) hanya menggunakan daftar pustaka pengguna.
4. **`POST /api/ai/rq-variants`:**
   - Menghasilkan 3 variasi pertanyaan riset yang terukur dan spesifik, dilengkapi variabel dan indikator ujinya.
5. **In-Memory Rate Limiter:**
   - Membatasi request per IP address berdasarkan `AI_RATE_LIMIT_PER_HOUR` (default: 30 req/jam).

---

## 7. MODUL EKSPOR DOKUMEN

### 7.1 Cetak PDF via CSS Print (`app/print/[id]`)
- Halaman terdedikasi dengan layout A4 standar akademik (margin 20mm, font serif/sans bersih, border tegas).
- Menggunakan CSS `@media print` murni:
  - Header data mahasiswa (Nama, NIM, Prodi, Mata Kuliah, Dosen).
  - Tabel 5 Komponen Kanvas (Judul, Latar Belakang & Matriks Sintesis, RQ & Variabel, Metode & Tabel Data, Rubrik Kelayakan).
  - Penataan *page-break-inside: avoid* pada tabel dan blok rubrik untuk mencegah pemotongan teks antar halaman.
  - Gambar snapshot peta literatur & pin bukti gap tercetak otomatis jika tersedia.
  - Tombol aksi *"Cetak / Simpan PDF"* memanggil `window.print()`.

### 7.2 Ekspor DOCX (`lib/export/docx-builder.ts`)
- Membangun dokumen Word (`.docx`) menggunakan pustaka `docx`.
- Struktur dokumen mencakup:
  - Kop dokumen resmi dan identitas mahasiswa.
  - Tabel kanvas 5 kotak dengan batas garis elegan dan bayangan header.
  - Tabel rincian kebutuhan data (primer/sekunder, sumber, ketersediaan, waktu).
  - Skor rubrik kelayakan diri vs otomatis dan catatan perbaikan.
  - Daftar referensi terformat standar APA 7.
  - Penempelan gambar grafik PNG (jika ada snapshot).

### 7.3 Ekspor Markdown & JSON
- **Markdown (.md):** File teks terformat rapi dengan tabel GFM dan checklist yang siap disalin ke repository riset / GitHub / Obsidian.
- **JSON (.json):** Seluruh data kanvas mentah yang kompatibel 100% untuk diimpor kembali ke aplikasi di perangkat lain.

---

## 8. STRATEGI PENGUJIAN & QA

### 8.1 Unit Tests (Vitest) - Minimal 40 Skenario
1. **Sentence Splitter:**
   - Teks dengan singkatan `"dkk."`, `"et al."`, `"No."`, desimal `"0.5 MPa"` tidak terpecah menjadi beberapa kalimat.
   - Deteksi tepat 1, 2, 3 kalimat; penolakan teks $\ge 4$ kalimat.
2. **Title Validator:**
   - Error jika salah satu komponen judul kosong.
   - Peringatan jika tidak ada indikator besaran terukur (mis. tanpa "kuat tekan", "lendutan", "MPa").
   - Peringatan judul $< 8$ kata atau $> 25$ kata.
   - Peringatan kata kabur (`"analisis"`, `"pengaruh"`).
   - Tip deteksi prefix lokasi/aplikasi.
3. **Background & Gap Validator:**
   - Error jika lebih dari 3 kalimat.
   - Warning jika tanpa penanda gap (`"belum ada"`, `"masih terbatas"`).
   - Warning jika referensi $< 2$.
   - Warning jika referensi $< 5$ atau tidak ada referensi $\le 5$ tahun terakhir.
4. **Research Question Validator:**
   - Error jika tidak diakhiri tanda tanya `?`.
   - Warning jika berbentuk ya/tidak tanpa rentang/ukuran.
   - Detektor lokasi baru: teks dengan frasa `"di Kota Surabaya"`, `"studi kasus Jembatan X"` memicu warning & pertanyaan reflektif.
   - Detektor sindrom software: teks dengan frasa `"berbasis aplikasi ETABS"`, `"menggunakan SAP2000"` memicu warning & pertanyaan reflektif.
   - Checklist reflektif 5 butir.
5. **Method & Data Validator:**
   - Error jika kebutuhan data kosong.
   - Warning untuk data `uncertain` atau `requires_permission` tanpa bukti akses.
   - Warning durasi $> 24$ minggu.
   - Warning metode lab tanpa standar pengujian (SNI/ASTM).
6. **Rubric Scorer:**
   - Penurunan skor otomatis sesuai jumlah error dan warning.
   - Penentuan status kesiapan: Siap / Perlu revisi minor / Perlu revisi mayor.
7. **Parsers:**
   - Parsing berkas VOSviewer map & network dengan variasi nama kolom bobot.
   - Parsing CSV Scopus, toleransi kolom hilang, ekstraksi kata kunci, pembentukan co-occurrence.

### 8.2 End-to-End Testing (Playwright)
- Skenario 1: Buat kanvas baru $\to$ Isi Langkah 1 sampai 5 $\to$ Periksa live validation update $\to$ Pastikan skor rubrik terhitung $\to$ Simulasikan ekspor JSON & buka preview cetak.
- Skenario 2: Impor draf JSON yang sudah ada $\to$ Lakukan perubahan $\to$ Refresh halaman $\to$ Pastikan state tersimpan di localStorage.

---

## 9. RENCANA IMPLEMENTASI PER FASE & CRITERIA SELESAI

### Fase 1: Fondasi & Manajemen Draf (Local-First)
- Inisialisasi proyek Next.js 15, TypeScript strict, Tailwind CSS, shadcn/ui primitives.
- Konfigurasi skema Zod (`lib/schemas/canvas.schema.ts`) dan TypeScript types.
- Zustand store dengan `persist` middleware (`kanvas_tesis_store_v1`).
- Halaman Beranda (`app/page.tsx`): Daftar draf, buat kanvas baru, hapus, duplikasi, ekspor/impor file JSON.
- **Verifikasi:** `npm run lint`, `npm run typecheck`, `npm test`, verifikasi browser (buat draft, refresh, data tetap ada).

### Fase 2: Wizard 5 Langkah & Mesin Validasi Rule-Based
- Implementasi navigasi wizard (Langkah 1 - 5) dan autosave (debounce 500ms) dengan badge "Tersimpan".
- Implementasi `sentence-splitter.ts` tahan singkatan Bahasa Indonesia.
- Implementasi seluruh modul validator di `lib/validators/` (Judul, Latar Belakang, RQ & Jebakan Novelty, Metode & Data).
- Komponen Live Validation Panel di sisi kanan layar (drawer pada mobile).
- Penulisan $\ge 40$ unit test Vitest mencakup seluruh skenario batas.
- **Verifikasi:** Seluruh $\ge 40$ unit test lulus, `npm run lint`, `npm run typecheck`, verifikasi interaktif di browser.

### Fase 3: Rubrik Kelayakan, Radar Chart & Status Kesiapan
- Komponen Rubrik 5 Kriteria di Langkah 5 dengan skor diri (1–4) dan deskriptor lengkap.
- Integrasi mesin skor otomatis yang menurunkan nilai dari temuan aturan validasi secara transparan.
- Visualisasi Radar Chart perbandingan skor diri vs skor otomatis (SVG / lightweight chart).
- Status kesiapan kanvas (*Siap diajukan* / *Perlu revisi minor* / *Perlu revisi mayor*).
- **Verifikasi:** Unit test scorer, verifikasi visual chart dan badge status di browser.

### Fase 4: Modul Ekspor Siap Kumpul (PDF, DOCX, Markdown, JSON)
- Halaman Print A4 khusus (`app/print/[id]`) dengan CSS `@media print` teruji di Google Chrome (tanpa teks terpotong).
- Generator berkas Word DOCX (`lib/export/docx-builder.ts`) dengan tabel rapi dan daftar pustaka APA 7.
- Generator Markdown & JSON export/import.
- Modal ekspor dengan pratinjau dan unduhan 1-klik.
- **Verifikasi:** Cetak PDF di Chrome, verifikasi berkas .docx di MS Word / Google Docs, `npm test`.

### Fase 5: Modul Peta Literatur (VOSviewer & CSV Scopus)
- Parser toleran untuk berkas map dan network VOSviewer (deteksi tab/koma/titik koma, BOM, variasi kolom bobot).
- Parser CSV Scopus + pembentukan matriks co-occurrence kata kunci + Louvain clustering.
- Komponen visualisasi interaktif Cytoscape.js (Network view, Overlay view, Tabel kata kunci).
- Analisis kandidat research gap heuristik (topik berkembang, persilangan kosong, posisi topik kanvas).
- Fitur pin temuan gap ke dalam kanvas dan ekspor snapshot grafik PNG.
- Tombol ekspor ulang ke berkas VOSviewer `.map` dan `.net`.
- **Verifikasi:** Unit test parser VOSviewer & Scopus dengan test fixture nyata, interaktivitas graf $\ge 500$ node di browser.

### Fase 6: Fitur AI Gemini (Opsional, Zero-Hallucination)
- Route handlers Next.js: `/api/ai/review`, `/api/ai/suggest-title`, `/api/ai/sharpen-gap`, `/api/ai/rq-variants`.
- Integrasi SDK resmi `@google/genai` dengan model dari `GEMINI_MODEL`.
- Structured output dengan skema Zod dan 1x automatic retry.
- In-memory rate limiter per IP address.
- Penanganan anggun: jika `GEMINI_API_KEY` kosong, semua tombol AI disembunyikan/dinonaktifkan rapi tanpa error.
- **Verifikasi:** Test endpoint AI dengan mock & live key (bila disediakan), verifikasi bahwa AI tidak pernah mengarang referensi di luar input pengguna.

### Fase 7: Polishing, Aksesibilitas, Panduan & E2E Testing
- Halaman Panduan (`app/guide/page.tsx`) berisi petunjuk metodologi dan contoh kanvas tesis nyata/berkualitas tinggi (ditandai jelas sebagai contoh).
- Dukungan responsif penuh (desktop, tablet, mobile), dark mode, dan aksesibilitas keyboard/ARIA.
- Security headers di `next.config.ts` (CSP, frame-guard, no-sniff).
- Dokumentasi `README.md` dan `.env.example`.
- Playwright E2E test: Pembuatan kanvas baru $\to$ pengisian wizard $\to$ validasi $\to$ ekspor.
- **Verifikasi Final:** `npm run lint`, `npm run typecheck`, `npm test`, `npx playwright test`, verifikasi manual seluruh alur aplikasi dalam waktu $< 30$ menit.

---

## 10. PERSETUJUAN UNTUK MEMULAI
Rencana di atas telah mencakup seluruh kebutuhan fungsional, non-fungsional, dan arsitektural. Sesuai aturan kerja, pengerjaan kode akan segera dimulai setelah rencana ini Anda setujui.
