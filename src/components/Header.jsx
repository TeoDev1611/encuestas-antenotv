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
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-slate-900 rounded-full p-1.5 shadow-md">
            <svg 
              className="w-full h-full object-contain" 
              viewBox="0 0 64 64" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M32 53H48V55C48 56.1 47.1 57 46 57H34C32.9 57 32 56.1 32 55V53Z" fill="#57B7EB"/>
              <path d="M36 57H44V61H36V57Z" fill="#57B7EB"/>
              <path d="M32 53V55C32 56.1 32.9 57 34 57H35C36.1 57 37 56.1 37 55H48V53H32Z" fill="#4891D3"/>
              <rect x="9" y="3" width="8" height="19" rx="4" fill="#F9E109"/>
              <rect x="19" y="25" width="42" height="28" rx="4" fill="#C4F236"/>
              <path d="M31 7H55C56.1 7 57 7.9 57 9V25H29V9C29 7.9 29.9 7H31Z" fill="#AAE1F9"/>
              <circle cx="40" cy="39" r="8" fill="#57B7EB"/>
              <circle cx="40" cy="39" r="4" fill="#4891D3"/>
              <circle cx="43" cy="15" r="4" fill="#F9E109"/>
            </svg>
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

        {/* Marca Secundaria: Desarrollado por TeoDev */}
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
              TeoDev
            </span>
          </div>
        </a>
      </div>
    </header>
  );
}
