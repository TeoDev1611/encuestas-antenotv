import React from 'react';
import { Info } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 sm:py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-center text-xs sm:text-xs text-amber-900 font-medium">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <p className="leading-snug">
          <strong className="text-amber-950 font-bold">Aviso Importante: </strong>
          Encuesta no oficial y no científica, con fines informativos. No representa un sondeo estadísticamente válido ni está afiliada al CNE.
        </p>
      </div>
    </div>
  );
}
