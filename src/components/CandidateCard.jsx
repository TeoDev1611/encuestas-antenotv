import React, { useState } from 'react';
import { Check, Vote, Loader2, Sparkles } from 'lucide-react';

export default function CandidateCard({
  candidato,
  onVote,
  isVoting,
  isExpired,
  selectedCandidateId,
}) {
  const [imgError, setImgError] = useState(false);
  const isSelected = selectedCandidateId === candidato.id;
  const isThisCandidateVoting = isVoting && isSelected;

  const handleVoteClick = (e) => {
    e.preventDefault();
    if (isExpired || isVoting) return;
    onVote(candidato);
  };

  return (
    <div className={`glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between p-4 sm:p-5 relative group border transition-all duration-300 ${
      isSelected ? 'border-brand-accent shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-[1.02]' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Badge de Lista / Movimiento en la esquina superior */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span 
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-md"
          style={{
            backgroundColor: `${candidato.color_hex || '#3b82f6'}25`,
            color: candidato.color_hex || '#3b82f6',
            border: `1px solid ${candidato.color_hex || '#3b82f6'}50`,
          }}
        >
          {candidato.lista_numero || 'Candidato'}
        </span>

        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          #0{candidato.orden || 1}
        </span>
      </div>

      {/* Foto Grande del Candidato */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-800/80 border border-slate-700/50 shadow-inner group-hover:border-blue-500/40 transition-all">
        {!imgError && candidato.foto_url ? (
          <img
            src={candidato.foto_url}
            alt={candidato.nombre}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center"
            style={{
              background: `linear-gradient(135deg, ${candidato.color_hex || '#3b82f6'}20 0%, #0f172a 100%)`
            }}
          >
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white mb-2 shadow-lg">
              {candidato.nombre.charAt(0)}
            </div>
            <span className="text-xs text-slate-400 font-medium">{candidato.nombre}</span>
          </div>
        )}

        {/* Gradiente sutil inferior sobre la foto */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 pointer-events-none"></div>
      </div>

      {/* Información del Candidato */}
      <div className="mb-4 flex-grow flex flex-col justify-start">
        <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-cyan-300 transition-colors">
          {candidato.nombre}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium line-clamp-2">
          {candidato.movimiento}
        </p>
      </div>

      {/* Botón "Votar" Grande y Claro (1 solo clic/tap) */}
      <button
        onClick={handleVoteClick}
        disabled={isExpired || isVoting}
        className={`w-full py-3.5 sm:py-4 px-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.97] shadow-xl ${
          isExpired
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            : isThisCandidateVoting
            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white cursor-wait'
            : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
        }`}
      >
        {isThisCandidateVoting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Registrando voto...</span>
          </>
        ) : isExpired ? (
          <span>Votación Cerrada</span>
        ) : (
          <>
            <Vote className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>Votar por {candidato.nombre.split(' ')[0]}</span>
          </>
        )}
      </button>
    </div>
  );
}
