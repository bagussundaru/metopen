/**
 * Type definitions for Course Assignments:
 * Tugas 1: Analisis 3 Paper Bibliometrik (13 Aspek Komparasi)
 * Tugas 2: Rancangan Penelitian Bibliometrik (7 Komponen & PRISMA)
 * Acuan: Matakuliah Metodologi Penelitian S2 Teknik Sipil
 * Dosen Pengampu: Dr.-Ing. Ir. Satoto E. Nayono, M.Eng., M.Sc.
 */

export type CivilEngineeringSpecialization = "Teknik Struktur" | "PSDAL (Sumber Daya Air & Lingkungan)" | "Interdisipliner";
export type SpecializationTrack = CivilEngineeringSpecialization;

/**
 * Metadata mahasiswa pengumpul tugas
 */
export interface StudentTaskMeta {
  studentName: string;
  nim: string;
  specialization: CivilEngineeringSpecialization;
  academicYear: string;
  submissionDate?: string;
}

/**
 * 13 Aspek Wajib Analisis Paper Bibliometrik (Tugas 1)
 */
export interface SinglePaperAnalysis {
  id: string;
  // 1. Identitas artikel
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  indexingDb: string; // mis. Scopus Q1, Scopus Q2, Web of Science
  citationCount?: number;
  
  // 2. Bidang / topik & alasan relevansi
  topicAndRelevance: string;
  
  // 3. Tujuan umum dan kesenjangan riset
  generalGoalAndGap: string;
  
  // 4. Research questions (RQs) - eksplisit atau rekonstruksi
  researchQuestions: string;
  isRqReconstructed: boolean;
  rqReconstructionNotes?: string;
  
  // 5. Basis data dan tanggal pencarian
  databaseAndSearchDate: string;
  
  // 6. Kueri Boolean lengkap (TITLE-ABS-KEY, AND, OR, NOT, wildcard)
  booleanQuery: string;
  
  // 7. Rentang tahun publikasi
  yearRange: string;
  
  // 8. Kriteria seleksi (inklusi dan eksklusi data, penyaringan)
  selectionCriteria: string;
  
  // 9. Tools / perangkat lunak dan teknik analisis
  toolsAndTechniques: string; // mis. VOSviewer (co-occurrence, co-authorship), Bibliometrix
  
  // 10. Temuan utama / pola yang terpetakan
  mainFindings: string;
  
  // 11. Nilai tambah atau sentuhan akademik penulis
  academicValueAndTouch: string;
  
  // 12. Keterbatasan dan potensi bias
  limitationsAndBias: string;
  
  // 13. Peluang riset lanjutan
  futureResearchOpportunities: string;
}

export interface Task1State {
  meta: StudentTaskMeta;
  papers: [SinglePaperAnalysis, SinglePaperAnalysis, SinglePaperAnalysis];
  lastUpdated: string;
}

/**
 * Data Alur PRISMA 2020 untuk Tugas 2 (Angka Riil Penelusuran)
 */
export interface PrismaFlowData {
  recordsIdentified: number; // Identifikasi: Hasil kueri Scopus
  additionalRecords: number; // Sumber lain / manual
  duplicatesRemoved: number; // Duplikat yang dibuang
  recordsScreened: number; // Skrining judul/abstrak
  recordsExcluded: number; // Dieliminasi karena tidak relevan
  fullTextAssessed: number; // Naskah lengkap ditelaah kelayakannya
  fullTextExcluded: number; // Dikeluarkan dengan alasan spesifik
  studiesIncluded: number; // Jumlah final artikel yang dianalisis
  inclusionCriteriaText: string;
  exclusionCriteriaText: string;
  languageFilter: string;
  docTypeFilter: string;
  yearRange: string;
}

/**
 * 7 Komponen Wajib Rancangan Penelitian Bibliometrik (Tugas 2)
 */
export interface Task2ResearchDesign {
  meta: StudentTaskMeta;
  
  // 1. Tema dan usulan judul penelitian
  theme: string;
  proposedTitle: string;
  titleNoveltyRationale: string;
  
  // 2. Urgensi dan argumentasi pemilihan topik
  urgencyAndImportance: string; // Mengapa penting
  previousStudiesReview: string; // Apa yang telah dikaji terdahulu
  unansweredResearchGap: string; // Gap yang belum terjawab
  bibliometricApproachRationale: string; // Mengapa bibliometrik relevan
  
  // 3. Rumusan pertanyaan penelitian (5-7 Research Questions)
  researchQuestions: string[];
  
  // 4. Strategi penelusuran literatur (Search Strategy)
  targetDatabase: "Scopus" | "Web of Science" | "Scopus & Web of Science";
  databaseRationale: string;
  booleanSearchString: string;
  searchStringOperationalNotes: string;
  
  // 5. Rancangan seleksi artikel dan pelaporan PRISMA
  prisma: PrismaFlowData;
  
  // 6. Rencana perangkat dan teknik analisis bibliometrik
  vosviewerPlan: string;
  biblioshinyPlan: string;
  expectedOutputs: string;
  
  // 7. Target kontribusi akademik
  knowledgeMappingContribution: string;
  matureVsUnderResearchedThemes: string;
  futureResearchAgenda: string;
  civilEngineeringRelevance: string;
  sustainableInfrastructureImplication: string;
  
  lastUpdated: string;
}
