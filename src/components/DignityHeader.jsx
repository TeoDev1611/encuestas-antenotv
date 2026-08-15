import React from 'react';
import { MapPin } from 'lucide-react';

export default function DignityHeader({ dignidad, canton }) {
  return (
    <div className="text-center mt-2 mb-5 px-4">
      {/* Badge Antonio Ante / Imbabura con colores locales */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-900 text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
        <span className="w-2.5 h-2.5 rounded-full flag-antonio-ante"></span>
        <MapPin className="w-3.5 h-3.5 text-green-700" />
        <span>{canton?.nombre || 'Antonio Ante'} • {canton?.provincia || 'Imbabura'}</span>
        <span className="text-slate-400">•</span>
        <span className="text-red-700 font-extrabold">Ecuador 2026</span>
      </div>

      {/* Título Principal */}
      <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
        {dignidad?.nombre || 'Alcaldía de Antonio Ante 2026'}
      </h1>

      {/* Subtítulo claro y legible */}
      <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
        {dignidad?.descripcion || 'Selecciona a tu candidato de preferencia y pulsa el botón verde para votar.'}
      </p>
    </div>
  );
}
