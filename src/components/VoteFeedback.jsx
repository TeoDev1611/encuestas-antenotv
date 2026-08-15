import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Award } from 'lucide-react';

export default function VoteFeedback({ votedCandidateName, isJustVoted }) {
  useEffect(() => {
    if (isJustVoted) {
      // Colores patrios de Antonio Ante: Verde, Rojo, Blanco
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#15803d', '#dc2626', '#ffffff', '#22c55e'],
        });
      } catch (e) {
        console.log('Confetti error:', e);
      }
    }
  }, [isJustVoted]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-green-50 border-2 border-green-500 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-scale-up">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-green-800 font-bold">
              ✓ Tu Voto Fue Registrado
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Votaste por <span className="text-green-700 underline decoration-green-500 decoration-2">{votedCandidateName || 'tu candidato'}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-green-300 text-xs font-bold text-green-800 shadow-xs">
          <Award className="w-4 h-4 text-green-700" />
          <span>Voto Contabilizado</span>
        </div>
      </div>
    </div>
  );
}
