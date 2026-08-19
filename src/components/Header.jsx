import React from 'react';
import { Code2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Franja de la Bandera de Antonio Ante (Verde y Rojo) */}
      <div className="h-1.5 w-full flag-antonio-ante"></div>

      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Marca Principal: Anteño TV */}
        <a 
          href="https://antenotv.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 group transition-transform active:scale-95"
          title="Anteño TV - Desde el Corazón de Imbabura"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center p-0.5 rounded-full shadow-sm bg-white border border-slate-100">
            <img 
              src="/logo-anteno-tv.svg" 
              alt="Anteño TV Logo" 
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Anteño TV
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                VOTA 2026
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-green-700 font-bold">
              Antonio Ante • Imbabura
            </span>
          </div>
        </a>

        {/* Marca Secundaria: Desarrollado por Teo */}
        <a
          href="https://github.com/TeoDev1611"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 hover:border-green-600 hover:bg-green-50 text-slate-700 transition-all text-xs group"
          title="Desarrollador de la plataforma"
        >
          <Code2 className="w-3.5 h-3.5 text-green-700" />
          <div className="flex flex-col text-right sm:text-left leading-none">
            <span className="text-[9px] text-slate-500 font-normal">Desarrollado por</span>
            <span className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">
              Teo
            </span>
          </div>
        </a>
      </div>
    </header>
  );
}
