import React, { useMemo } from 'react';
import { Crown, Radio, BarChart3, Users, Flame } from 'lucide-react';

export default function LiveResultsChart({
  candidatos,
  totalVotes,
  votedCandidateId,
  isRealtimeActive,
}) {
  // Ordenar candidatos por número de votos descendente para una lectura clara de tendencias
  const sortedCandidates = useMemo(() => {
    return [...candidatos].sort((a, b) => (b.total_votos || 0) - (a.total_votos || 0));
  }, [candidatos]);

  const maxVotes = useMemo(() => {
    return Math.max(...candidatos.map((c) => c.total_votos || 0), 1);
  }, [candidatos]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-4 animate-fade-in">
      {/* Tarjeta Contenedora Principal de Resultados */}
      <div className="glass-card p-5 sm:p-7 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
        {/* Encabezado del Gráfico */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-700/60 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-accent" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Tendencias y Resultados
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Actualización instantánea a medida que la comunidad vota
            </p>
          </div>

          {/* Badge de Estado en Vivo y Total de Votos */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>En Vivo</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{totalVotes.toLocaleString()} votos</span>
            </div>
          </div>
        </div>

        {/* Barras de Candidatos */}
        <div className="space-y-5">
          {sortedCandidates.map((candidato, index) => {
            const votes = candidato.total_votos || 0;
            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';
            const isWinner = index === 0 && votes > 0;
            const isMyVote = candidato.id === votedCandidateId;

            return (
              <div
                key={candidato.id}
                className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 border ${
                  isMyVote
                    ? 'bg-blue-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Cabecera del Candidato en la Barra */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Miniatura / Avatar */}
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                      {candidato.foto_url ? (
                        <img
                          src={candidato.foto_url}
                          alt={candidato.nombre}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
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
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base truncate">
                          {candidato.nombre}
                        </span>
                        {isMyVote && (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold flex-shrink-0">
                            Tu Voto
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">{candidato.lista_numero}</span>
                        <span>•</span>
                        <span className="truncate">{candidato.movimiento}</span>
                      </div>
                    </div>
                  </div>

                  {/* Porcentaje y Votos */}
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-base sm:text-xl font-black font-mono text-white">
                      {percentage}%
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 font-medium">
                      {votes} {votes === 1 ? 'voto' : 'votos'}
                    </div>
                  </div>
                </div>

                {/* Barra de Progreso Visual */}
                <div className="w-full h-3.5 sm:h-4 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/60 relative">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{
                      width: `${Math.max(Number(percentage), 2)}%`,
                      backgroundColor: candidato.color_hex || '#3b82f6',
                      backgroundImage: `linear-gradient(90deg, ${candidato.color_hex || '#3b82f6'}cc, ${candidato.color_hex || '#3b82f6'})`,
                    }}
                  >
                    {/* Efecto de brillo sutil en movimiento */}
                    <div className="absolute inset-0 bg-white/15 rounded-full"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie de Gráfico */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 text-center sm:text-left">
          <span>Encuesta no vinculante transmitida por canal digital Anteño TV.</span>
          <span className="text-slate-400 font-medium">1 voto verificado por dispositivo</span>
        </div>
      </div>
    </div>
  );
}
