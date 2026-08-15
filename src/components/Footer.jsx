import React from 'react';
import { MapPin, Heart, Tv } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-16 pt-12 pb-8 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md text-slate-400">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/60">
          {/* Info Anteño TV */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-brand-primary" />
              <span className="text-lg font-bold text-white tracking-tight">Anteño TV</span>
            </div>
            <p className="text-xs text-brand-accent italic mt-0.5">
              Desde el Corazón de Imbabura
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Antonio Ante • Imbabura • Ecuador</span>
            </div>
          </div>

          {/* Enlaces Sociales */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/AntenoTVmiradiferente"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:text-blue-400 text-slate-300 text-xs font-semibold transition-all"
            >
              Facebook
            </a>
            <a
              href="https://www.youtube.com/channel/UCzigW_U4kwYEjrL-Kh_2Bcg"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:text-red-400 text-slate-300 text-xs font-semibold transition-all"
            >
              YouTube
            </a>
            <a
              href="https://antenotv.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-cyan-300 text-xs font-semibold hover:border-cyan-400 transition-all"
            >
              Sitio Oficial
            </a>
          </div>
        </div>

        {/* Créditos y Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <p>© 2026 Anteño TV. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1 text-slate-400">
            <span>Diseñado y construido por</span>
            <a
              href="https://github.com/TeoDev1611"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-300 hover:text-brand-accent transition-colors"
            >
              @TeoDev1611
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
