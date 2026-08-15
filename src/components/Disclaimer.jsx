import React from 'react';
import { Info } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 sm:py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-center text-xs sm:text-xs text-slate-400">
        <Info className="w-4 h-4 text-brand-accent flex-shrink-0" />
        <p className="leading-snug">
          <strong className="text-slate-300 font-semibold">Aviso Legal: </strong>
          Encuesta no oficial y no científica, con fines informativos. No representa un sondeo estadísticamente válido ni está afiliada al CNE.
        </p>
      </div>
    </div>
  );
}
