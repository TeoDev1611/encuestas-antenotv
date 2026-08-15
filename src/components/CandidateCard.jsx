import React, { useState } from 'react';
import { Vote, Loader2, Check } from 'lucide-react';

export default function CandidateCard({
  candidato,
  onVote,
  isVoting,
  isExpired,
  selectedCandidateId,
}) {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const isSelected = selectedCandidateId === candidato.id;
  const isThisCandidateVoting = isVoting && isSelected;

  const handleVoteClick = (e) => {
    e.preventDefault();
    if (isExpired || isVoting) return;
    onVote(candidato);
  };

  return (
    <div className={`bg-white rounded-2xl overflow-hidden flex flex-col justify-between border-2 transition-all duration-200 shadow-sm ${
      isSelected 
        ? 'border-green-600 ring-4 ring-green-100 shadow-lg scale-[1.01]' 
        : 'border-slate-300 hover:border-green-600 hover:shadow-md'
    }`}>
      
      {/* ========================================================================= */}
      {/* 1. CABECERA TIPO PAPELETA ELECTORAL (Logo del Partido + Lista + Movimiento) */}
      {/* ========================================================================= */}
      <div 
        className="p-3 sm:p-3.5 border-b-2 border-slate-200 flex items-center justify-between gap-3"
        style={{
          backgroundColor: '#f8fafc',
          borderTop: `4px solid ${candidato.color_hex || '#15803d'}`,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Logo / Símbolo del Partido (Destacado y Grande) */}
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex items-center justify-center p-1 flex-shrink-0 bg-white border-2 shadow-xs"
            style={{ borderColor: candidato.color_hex || '#cbd5e1' }}
            title={candidato.movimiento}
          >
            {!logoError && candidato.logo_movimiento_url ? (
              <img
                src={candidato.logo_movimiento_url}
                alt={candidato.movimiento}
                loading="lazy"
                onError={() => setLogoError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center font-black text-sm text-white rounded-lg"
                style={{ backgroundColor: candidato.color_hex || '#15803d' }}
              >
                {candidato.lista_numero ? candidato.lista_numero.replace(/[^0-9- ]/g, '').trim() || 'P' : 'P'}
              </div>
            )}
          </div>

          {/* Número de Lista y Nombre del Movimiento */}
          <div className="min-w-0 flex flex-col leading-tight">
            <span 
              className="text-sm sm:text-base font-black tracking-tight uppercase"
              style={{ color: candidato.color_hex || '#0f172a' }}
            >
              {candidato.lista_numero || 'LISTA'}
            </span>
            <span 
              className="text-xs font-bold text-slate-700 truncate max-w-[160px] sm:max-w-[190px] uppercase"
              title={candidato.movimiento}
            >
              {candidato.movimiento}
            </span>
          </div>
        </div>

        {/* Casillero N° */}
        <div className="flex flex-col items-center justify-center bg-white border border-slate-300 px-2 py-1 rounded-lg flex-shrink-0 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Casillero</span>
          <span className="text-sm font-black text-slate-800 leading-tight">#{candidato.orden || 1}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CUERPO DE LA TARJETA: Foto Grande del Candidato */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden mb-3.5 bg-slate-100 border-2 border-slate-200 shadow-inner">
          {!imgError && candidato.foto_url ? (
            <img
              src={candidato.foto_url}
              alt={candidato.nombre}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center bg-slate-100">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-black text-slate-700 mb-2">
                {candidato.nombre.charAt(0)}
              </div>
              <span className="text-xs text-slate-500 font-bold">{candidato.nombre}</span>
            </div>
          )}
        </div>

        {/* 3. Nombre del Candidato en Mayúsculas (Estilo Papeleta) */}
        <div className="mb-4 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-black text-slate-950 leading-tight uppercase">
            {candidato.nombre}
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Candidato a la Alcaldía
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTÓN "VOTAR" VERDE (Casillero de Rayar / Votar de 1 solo toque)       */}
        {/* ========================================================================= */}
        <button
          onClick={handleVoteClick}
          disabled={isExpired || isVoting}
          className={`w-full py-3.5 sm:py-4 px-4 rounded-xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.98] shadow-md uppercase tracking-wider ${
            isExpired
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              : isThisCandidateVoting
              ? 'bg-green-700 text-white cursor-wait'
              : 'bg-green-700 hover:bg-green-800 active:bg-green-900 text-white shadow-green-900/20 hover:-translate-y-0.5'
          }`}
        >
          {isThisCandidateVoting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Registrando Voto...</span>
            </>
          ) : isExpired ? (
            <span>Votación Cerrada</span>
          ) : (
            <>
              <div className="w-5 h-5 rounded border-2 border-white flex items-center justify-center bg-white/20">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Votar por {candidato.nombre.split(' ')[0]}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
