"use client";

import { useState, useRef } from "react";
import { Upload, FileUp, Sparkles, AlertCircle } from "lucide-react";
import { buildVosMapResult, VosMapResult } from "@/lib/parsers/vosviewer-parser";

interface VosviewerUploaderProps {
  onMapLoaded: (result: VosMapResult) => void;
}

const SAMPLE_CIVIL_MAP = `id	label	x	y	cluster	weight<Occurrences>	weight<Total link strength>	score<Avg. pub. year>
1	geopolymer concrete	-0.3421	0.2154	1	45	120	2023.40
2	fly ash	-0.2104	0.1542	1	62	180	2022.80
3	alkali activation	-0.1845	0.3012	1	38	95	2023.10
4	reinforced concrete beams	0.4120	-0.1250	2	50	140	2021.90
5	flexural capacity	0.3541	-0.0842	2	42	115	2022.50
6	ductility	0.2980	-0.2100	2	35	90	2022.20
7	sulfate resistance	-0.0520	-0.3420	3	28	75	2024.10
8	durability	0.0120	-0.2840	3	40	105	2023.00`;

const SAMPLE_CIVIL_NET = `1	2	42
1	3	30
2	3	25
4	5	38
4	6	28
5	6	24
1	7	12
2	7	18
7	8	22
1	5	8
2	4	10`;

export function VosviewerUploader({ onMapLoaded }: VosviewerUploaderProps) {
  const [mapContent, setMapContent] = useState<string>("");
  const [netContent, setNetContent] = useState<string>("");
  const [mapFileName, setMapFileName] = useState<string>("");
  const [netFileName, setNetFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const mapFileRef = useRef<HTMLInputElement>(null);
  const netFileRef = useRef<HTMLInputElement>(null);

  const handleProcessFiles = (mapStr: string, netStr: string) => {
    try {
      setError(null);
      const result = buildVosMapResult(mapStr, netStr);
      if (result.nodes.length === 0) {
        setError("Berkas map tidak memuat node yang valid.");
        return;
      }
      onMapLoaded(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memproses berkas VOSviewer.");
    }
  };

  const handleMapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMapFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setMapContent(text);
      handleProcessFiles(text, netContent);
    };
    reader.readAsText(file);
  };

  const handleNetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNetFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setNetContent(text);
      if (mapContent) {
        handleProcessFiles(mapContent, text);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setMapContent(SAMPLE_CIVIL_MAP);
    setNetContent(SAMPLE_CIVIL_NET);
    setMapFileName("sample-civil-geopolymer.map.txt");
    setNetFileName("sample-civil-geopolymer.net.txt");
    handleProcessFiles(SAMPLE_CIVIL_MAP, SAMPLE_CIVIL_NET);
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Unggah Ekspor VOSviewer (Map & Network File)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Format file teks tab-delimited dari menu &quot;Save map&quot; dan &quot;Save network&quot; VOSviewer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Muat Sampel VOSviewer Sipil</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Map File Dropzone */}
        <div
          onClick={() => mapFileRef.current?.click()}
          className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 text-center cursor-pointer transition-colors"
        >
          <input
            ref={mapFileRef}
            type="file"
            accept=".txt,.map,.tsv,.csv"
            className="hidden"
            onChange={handleMapFileChange}
          />
          <FileUp className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {mapFileName ? `Map: ${mapFileName}` : "Pilih Berkas Map (.map.txt) *"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Berisi label kata kunci, koordinat (x,y), dan klaster
          </p>
        </div>

        {/* Network File Dropzone */}
        <div
          onClick={() => netFileRef.current?.click()}
          className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 text-center cursor-pointer transition-colors"
        >
          <input
            ref={netFileRef}
            type="file"
            accept=".txt,.net,.tsv,.csv"
            className="hidden"
            onChange={handleNetFileChange}
          />
          <FileUp className="w-6 h-6 text-indigo-500 mx-auto mb-1.5" />
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {netFileName ? `Net: ${netFileName}` : "Pilih Berkas Network (.net.txt)"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Berisi garis kekuatan tautan antar kata kunci
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
