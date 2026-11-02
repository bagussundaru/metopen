"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  Download,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  parseScopusOrPopCsv,
  buildCooccurrenceGraph,
  convertParsedArticleToReference,
  ParsedArticle,
} from "@/lib/parsers/scopus-parser";
import { exportToVosviewerFormat, VosMapResult } from "@/lib/parsers/vosviewer-parser";
import { Reference } from "@/lib/types/canvas";

interface ScopusUploaderProps {
  onGraphGenerated: (result: VosMapResult, articles: ParsedArticle[]) => void;
  onImportReferencesToCanvas?: (refs: Reference[]) => void;
}

const SAMPLE_SCOPUS_CSV = `Authors,Title,Year,Source title,DOI,Cited by,Author Keywords,Index Keywords
"Widodo, S.; Prasetyo, A.","Flexural performance of alkali-activated geopolymer concrete beams",2024,"Construction and Building Materials","10.1016/j.conbuildmat.2024.101",15,"geopolymer concrete; fly ash; flexural capacity; reinforced concrete beams","concrete beams; alkali activation"
"Zhang, Y.; Wang, L.","Sulfate resistance of fly ash based concrete in aggressive environments",2023,"Cement and Concrete Composites","10.1016/j.cemconcomp.2023.202",24,"fly ash; sulfate resistance; durability","sulfate attack; durability"
"Neville, A. M.; Brooks, J. J.","Mechanical properties and ductility of high strength concrete beams",2022,"ACI Structural Journal","10.14359/5173",42,"reinforced concrete beams; flexural capacity; ductility","high strength concrete; flexure"
"Hardjito, D.; Rangan, B. V.","Properties of low-calcium fly ash geopolymer concrete",2021,"ACI Materials Journal","10.14359/13444",110,"geopolymer concrete; fly ash; alkali activation","fly ash; compressive capacity"
"Prasetyo, A.; Widodo, S.","Alkali activated fly ash mortar subjected to sodium sulfate solution",2024,"Materials Today: Proceedings","10.1016/j.matpr.2024.01.55",8,"alkali activation; fly ash; sulfate resistance; compressive capacity","geopolymer; chemical attack"`;

export function ScopusUploader({ onGraphGenerated, onImportReferencesToCanvas }: ScopusUploaderProps) {
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [parsedArticles, setParsedArticles] = useState<ParsedArticle[]>([]);
  const [minOccurrences, setMinOccurrences] = useState<number>(2);
  const [minLinkStrength, setMinLinkStrength] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCsv = (content: string, minOcc: number, minLink: number) => {
    try {
      setError(null);
      const articles = parseScopusOrPopCsv(content);
      if (articles.length === 0) {
        setError("Berkas CSV tidak memuat data publikasi yang valid.");
        return;
      }
      setParsedArticles(articles);

      const graph = buildCooccurrenceGraph(articles, {
        minOccurrences: minOcc,
        minLinkStrength: minLink,
      });

      onGraphGenerated(graph, articles);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memproses berkas CSV.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      processCsv(text, minOccurrences, minLinkStrength);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setFileName("sample-civil-scopus.csv");
    setCsvContent(SAMPLE_SCOPUS_CSV);
    processCsv(SAMPLE_SCOPUS_CSV, minOccurrences, minLinkStrength);
  };

  const handleSliderChange = (newMinOcc: number, newMinLink: number) => {
    setMinOccurrences(newMinOcc);
    setMinLinkStrength(newMinLink);
    if (csvContent) {
      processCsv(csvContent, newMinOcc, newMinLink);
    }
  };

  const handleExportVosviewer = () => {
    if (parsedArticles.length === 0) return;
    const graph = buildCooccurrenceGraph(parsedArticles, {
      minOccurrences,
      minLinkStrength,
    });
    const { mapTxt, netTxt } = exportToVosviewerFormat(graph.nodes, graph.edges);

    // Download Map
    const mapBlob = new Blob([mapTxt], { type: "text/plain;charset=utf-8" });
    const mapUrl = URL.createObjectURL(mapBlob);
    const aMap = document.createElement("a");
    aMap.href = mapUrl;
    aMap.download = "vosviewer-export.map.txt";
    aMap.click();
    URL.revokeObjectURL(mapUrl);

    // Download Net
    const netBlob = new Blob([netTxt], { type: "text/plain;charset=utf-8" });
    const netUrl = URL.createObjectURL(netBlob);
    const aNet = document.createElement("a");
    aNet.href = netUrl;
    aNet.download = "vosviewer-export.net.txt";
    aNet.click();
    URL.revokeObjectURL(netUrl);
  };

  const handleTransferToCanvas = () => {
    if (!onImportReferencesToCanvas || parsedArticles.length === 0) return;
    const refs = parsedArticles.slice(0, 5).map(convertParsedArticleToReference);
    onImportReferencesToCanvas(refs);
    setTransferSuccess(`${refs.length} referensi Scopus berhasil dipindahkan ke Langkah 2!`);
    setTimeout(() => setTransferSuccess(null), 3000);
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Impor CSV Scopus / Publish or Perish (Google Scholar)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Membangun jejaring co-occurrence kata kunci dan klaster Louvain otomatis langsung di browser.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Muat Sampel CSV Scopus Sipil</span>
        </button>
      </div>

      {/* CSV Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30 text-center cursor-pointer transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Upload className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
        <p className="font-bold text-slate-800 dark:text-slate-200">
          {fileName ? `File CSV: ${fileName}` : "Klik untuk Memilih Berkas CSV Scopus / Google Scholar"}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Mendukung ekspor langsung Scopus atau CSV dari Publish or Perish (PoP)
        </p>
      </div>

      {/* Threshold Controls Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Min. Kemunculan Kata Kunci (Occurrences):
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{minOccurrences}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={minOccurrences}
            onChange={(e) => handleSliderChange(Number(e.target.value), minLinkStrength)}
            className="w-full accent-blue-600"
          />
          <span className="text-[10px] text-slate-400">
            Kata kunci yang muncul kurang dari nilai ini akan disaring
          </span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Min. Kekuatan Tautan (Link Strength):
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{minLinkStrength}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={minLinkStrength}
            onChange={(e) => handleSliderChange(minOccurrences, Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <span className="text-[10px] text-slate-400">
            Pasangan topik yang diteliti bersamaan minimal sekian kali
          </span>
        </div>
      </div>

      {transferSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{transferSuccess}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons for Scopus CSV */}
      {parsedArticles.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 text-[11px]">
            {parsedArticles.length} artikel ilmiah terurai
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTransferToCanvas}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Transfer 5 Artikel ke Langkah 2</span>
            </button>

            <button
              type="button"
              onClick={handleExportVosviewer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Ekspor untuk VOSviewer (.map & .net)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
