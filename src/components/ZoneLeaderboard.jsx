import React, { useMemo } from 'react';
import { Trophy, MapPin, Info } from 'lucide-react';

export default function ZoneLeaderboard({ zoneCounts }) {
  // Ordenar zonas por total de votos descendente
  const sortedZones = useMemo(() => {
    return [...(zoneCounts || [])]
      .filter((z) => z.zona && z.total_votos > 0)
      .sort((a, b) => b.total_votos - a.total_votos);
  }, [zoneCounts]);

  const maxZoneVotes = useMemo(() => {
    return Math.max(...sortedZones.map((z) => z.total_votos), 1);
  }, [sortedZones]);

  const totalZoneVotes = useMemo(() => {
    return sortedZones.reduce((sum, z) => sum + z.total_votos, 0);
  }, [sortedZones]);

  if (sortedZones.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-4 animate-fade-in">
      <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-800/80 shadow-xl bg-slate-900/60">
        {/* Cabecera Secundaria */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Zonas más participativas
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{totalZoneVotes.toLocaleString()} votos localizados</span>
          </div>
        </div>

        {/* Lista de Barras de Zonas */}
        <div className="space-y-3">
          {sortedZones.map((item, index) => {
            const percentage = ((item.total_votos / maxZoneVotes) * 100).toFixed(0);
            const isTopZone = index === 0;

            return (
              <div key={item.zona} className="group">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 text-center font-bold ${
                      index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-slate-200 font-semibold group-hover:text-cyan-300 transition-colors">
                      {item.zona}
                    </span>
                  </div>

                  <span className="text-slate-400 font-mono text-xs">
                    <strong className="text-white font-bold">{item.total_votos.toLocaleString()}</strong> votos
                  </span>
                </div>

                {/* Mini Barra Horizontal */}
                <div className="w-full h-2 sm:h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isTopZone
                        ? 'bg-gradient-to-r from-amber-500 to-cyan-400'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-500'
                    }`}
                    style={{ width: `${Math.max(Number(percentage), 3)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Texto Aclaratorio */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <span>Basado en quienes compartieron su zona al votar.</span>
        </div>
      </div>
    </div>
  );
}
