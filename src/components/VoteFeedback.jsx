import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Award, Sparkles } from 'lucide-react';

export default function VoteFeedback({ votedCandidateName, isJustVoted }) {
  useEffect(() => {
    if (isJustVoted) {
      // Lanzar ráfaga de confeti con colores de Anteño TV (Azul, Cyan, Dorado)
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#06b6d4', '#eab308', '#ffffff'],
        });
      } catch (e) {
        console.log('Confetti error:', e);
      }
    }
  }, [isJustVoted]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-6">
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-900/40 via-slate-900/80 to-cyan-900/40 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-scale-up">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0 text-cyan-400 shadow-inner">
            <CheckCircle2 className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs uppercase tracking-wider text-cyan-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voto Registrado</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
              Ya votaste por <span className="text-cyan-300 underline decoration-cyan-500/50 decoration-2">{votedCandidateName || 'tu candidato'}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Opinión Contabilizada</span>
        </div>
      </div>
    </div>
  );
}
