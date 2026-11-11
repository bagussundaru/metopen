"use client";

interface OfficialKopSuratProps {
  className?: string;
  compact?: boolean;
}

export function OfficialKopSurat({ className = "", compact = false }: OfficialKopSuratProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-4 sm:gap-6 pb-2">
        {/* Official UNY Logo */}
        <div className="shrink-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-uny.png"
            alt="Logo Universitas Negeri Yogyakarta"
            className={compact ? "w-14 h-14 object-contain" : "w-18 h-18 sm:w-20 sm:h-20 object-contain"}
          />
        </div>

        {/* Official Institutional Typography */}
        <div className="text-center flex-1 font-serif text-slate-950">
          <h4 className="text-[11px] sm:text-xs font-normal tracking-wide uppercase leading-tight">
            Kementerian Pendidikan Tinggi, Sains, dan Teknologi
          </h4>
          <h3 className="text-sm sm:text-base font-bold tracking-wide uppercase leading-tight mt-0.5">
            Universitas Negeri Yogyakarta
          </h3>
          <p className="text-xs sm:text-[13px] font-normal leading-tight mt-0.5">
            Departemen Pendidikan Teknik Sipil dan Perencanaan
          </p>
          <p className="text-xs sm:text-[13px] font-normal leading-tight mt-0.5">
            Program Studi Teknik Sipil Program Magister
          </p>
          <p className="text-[10px] sm:text-[11px] font-normal text-slate-700 leading-tight mt-0.5">
            Alamat: Kampus UNY Karangmalang, Yogyakarta 55281
          </p>
        </div>
      </div>

      {/* Official Divider: Thick black line */}
      <div className="border-b-2 border-black w-full mb-4"></div>
    </div>
  );
}
