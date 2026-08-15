import React from 'react';
import { Users, TrendingUp } from 'lucide-react';

export default function SocialProofCounter({ totalVotes }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-3 animate-fade-in">
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center flex-shrink-0 text-green-700 font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-green-800">
              Participación Ciudadana
            </div>
            <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
              {totalVotes === 0 ? (
                <span>¡Sé el primero en participar en este sondeo!</span>
              ) : (
                <>
                  <span className="text-green-700 font-mono text-base sm:text-lg mr-1 font-black">
                    {totalVotes.toLocaleString()}
                  </span>
                  {totalVotes === 1 ? 'persona ya votó' : 'personas ya votaron'}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <TrendingUp className="w-3.5 h-3.5 text-green-700" />
          <span>En vivo</span>
        </div>
      </div>
    </div>
  );
}
