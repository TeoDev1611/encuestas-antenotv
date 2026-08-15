import React from 'react';
import { MapPin, Tv } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-12 pt-8 pb-6 border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
          {/* Info Anteño TV */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-green-700" />
              <span className="text-lg font-black text-slate-900 tracking-tight">Anteño TV</span>
            </div>
            <p className="text-xs text-green-800 font-bold italic mt-0.5">
              Desde el Corazón de Imbabura
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>Atuntaqui • Antonio Ante • Imbabura • Ecuador</span>
            </div>
          </div>

          {/* Enlaces */}
          <div className="flex items-center gap-2">
            <a
              href="https://www.facebook.com/AntenoTVmiradiferente"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all"
            >
              Facebook
            </a>
            <a
              href="https://www.youtube.com/channel/UCzigW_U4kwYEjrL-Kh_2Bcg"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-red-500 text-slate-700 hover:text-red-600 text-xs font-bold transition-all"
            >
              YouTube
            </a>
            <a
              href="https://antenotv.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-green-50 border border-green-300 text-green-800 text-xs font-bold hover:bg-green-100 transition-all"
            >
              Sitio Web
            </a>
          </div>
        </div>

        {/* Créditos */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 text-center sm:text-left">
          <p>© 2026 Anteño TV. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1 text-slate-600 font-medium">
            <span>Desarrollado por</span>
            <a
              href="https://github.com/TeoDev1611"
              target="_blank"
              rel="noopener noreferrer"
              className="font-black text-slate-900 hover:text-green-700 transition-colors"
            >
              @TeoDev1611
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
