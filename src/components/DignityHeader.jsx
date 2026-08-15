import React from 'react';
import { MapPin, Vote } from 'lucide-react';

export default function DignityHeader({ dignidad, canton }) {
  return (
    <div className="text-center mt-3 mb-6 px-4">
      {/* Ubicación y Nivel */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2.5 shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-brand-accent" />
        <span>{canton?.nombre || 'Antonio Ante'}, {canton?.provincia || 'Imbabura'}</span>
        <span className="text-slate-500">•</span>
        <span className="text-brand-accent">Ecuador 2026</span>
      </div>

      {/* Título Principal de la Dignidad */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
        {dignidad?.nombre || 'Alcaldía de Antonio Ante 2026'}
      </h1>

      {/* Subtítulo / Instrucción */}
      <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal">
        {dignidad?.descripcion || 'Elige a tu candidato de preferencia con un solo toque y visualiza las tendencias en vivo.'}
      </p>
    </div>
  );
}
