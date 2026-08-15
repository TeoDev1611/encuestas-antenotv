import React, { useMemo } from 'react';
import { Crown, BarChart3, Users } from 'lucide-react';

export default function LiveResultsChart({
  candidatos,
  totalVotes,
  votedCandidateId,
  isRealtimeActive,
}) {
  const sortedCandidates = useMemo(() => {
    return [...candidatos].sort((a, b) => {
      const diff = (b.total_votos || 0) - (a.total_votos || 0);
      if (diff !== 0) return diff;
      return (a.orden || 0) - (b.orden || 0);
    });
  }, [candidatos]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-3 animate-fade-in">
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm relative">
        {/* Encabezado del Gráfico */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-700" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Resultados y Tendencias
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Actualización instantánea a medida que la gente vota
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 border border-green-200 text-green-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>
              <span>En Vivo</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>{totalVotes.toLocaleString()} {totalVotes === 1 ? 'voto' : 'votos'}</span>
            </div>
          </div>
        </div>

        {/* Lista de Barras de Candidatos */}
        <div className="space-y-3.5">
          {sortedCandidates.map((candidato, index) => {
            const votes = candidato.total_votos || 0;
            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';
            const isWinner = index === 0 && votes > 0;
            const isMyVote = candidato.id === votedCandidateId;

            return (
              <div
                key={candidato.id}
                className={`p-3 sm:p-3.5 rounded-2xl transition-all duration-200 border-2 ${
                  isMyVote
                    ? 'bg-green-50/70 border-green-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Cabecera del Candidato */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Miniatura / Avatar */}
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300">
                      {candidato.foto_url ? (
                        <img
                          src={candidato.foto_url}
                          alt={candidato.nombre}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-700 text-xs">
                          {candidato.nombre.charAt(0)}
                        </div>
                      )}
                      {isWinner && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 shadow">
                          <Crown className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Nombre y Lista */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-xs sm:text-sm truncate">
                          {candidato.nombre}
                        </span>
                        {isMyVote && (
                          <span className="px-1.5 py-0.2 rounded bg-green-600 text-white text-[9px] font-black uppercase">
                            Tu Voto
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                        <span className="font-bold text-slate-800">
                          {candidato.lista_numero}
                        </span>
                        <span>•</span>
                        <span className="truncate">{candidato.movimiento}</span>
                      </div>
                    </div>
                  </div>

                  {/* Porcentaje y Votos */}
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-sm sm:text-lg font-black font-mono text-slate-900">
                      {percentage}%
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-600 font-bold">
                      {votes} {votes === 1 ? 'voto' : 'votos'}
                    </div>
                  </div>
                </div>

                {/* Barra de Progreso Visual */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 relative">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${totalVotes > 0 ? Math.max(Number(percentage), 2) : 0}%`,
                      backgroundColor: candidato.color_hex || '#15803d',
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie de Gráfico */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500 text-center sm:text-left">
          <span>Sondeo informativo no oficial de Anteño TV.</span>
          <span className="text-slate-600 font-bold">1 voto por dispositivo</span>
        </div>
      </div>
    </div>
  );
}
