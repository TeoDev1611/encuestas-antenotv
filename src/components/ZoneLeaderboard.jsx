import React, { useMemo } from 'react';
import { Trophy, MapPin, Info } from 'lucide-react';

export default function ZoneLeaderboard({ zoneCounts }) {
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
    <div className="w-full max-w-3xl mx-auto px-4 my-3 animate-fade-in">
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🏆</span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Parroquias con más votos
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <MapPin className="w-3.5 h-3.5 text-green-700" />
            <span>{totalZoneVotes.toLocaleString()} {totalZoneVotes === 1 ? 'voto' : 'votos'}</span>
          </div>
        </div>

        {/* Lista de Barras de Parroquias */}
        <div className="space-y-2.5">
          {sortedZones.map((item, index) => {
            const percentage = ((item.total_votos / maxZoneVotes) * 100).toFixed(0);

            return (
              <div key={item.zona} className="group">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 text-center font-black text-xs ${
                      index === 0 ? 'text-amber-600' : index === 1 ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-slate-900 font-bold">
                      {item.zona}
                    </span>
                  </div>

                  <span className="text-slate-600 font-mono text-xs">
                    <strong className="text-slate-900 font-black">{item.total_votos.toLocaleString()}</strong> {item.total_votos === 1 ? 'voto' : 'votos'}
                  </span>
                </div>

                {/* Barra Horizontal */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-green-700' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.max(Number(percentage), 3)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Texto Aclaratorio */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <span>Basado en quienes compartieron su parroquia al votar.</span>
        </div>
      </div>
    </div>
  );
}
