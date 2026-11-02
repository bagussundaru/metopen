import { ShieldCheck, HardDrive, GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-8 mt-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <span>
            Kanvas Topik Tesis S2 Pascasarjana UNY &bull; Standar Scopus & Google Scholar
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            Penyimpanan Lokal (Local-First)
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Privasi Aman: Tidak Menyimpan Data di Server
          </span>
        </div>
      </div>
    </footer>
  );
}
