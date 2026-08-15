import React from 'react';
import { Users, Sparkles, TrendingUp } from 'lucide-react';

export default function SocialProofCounter({ totalVotes }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-4 animate-fade-in">
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-cyan-950/70 border border-blue-500/30 backdrop-blur-xl shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Sparkles className="w-3 h-3" />
              <span>Participación Ciudadana</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white leading-tight">
              <span className="text-cyan-300 font-mono text-lg sm:text-xl mr-1.5 font-black">
                {totalVotes.toLocaleString()}
              </span>
              personas ya votaron
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Actualizado en vivo</span>
        </div>
      </div>
    </div>
  );
}
