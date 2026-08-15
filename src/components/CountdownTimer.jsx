import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CountdownTimer({ fechaCierre, onExpire }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!fechaCierre) return;

    const calculateTime = () => {
      const targetDate = new Date(fechaCierre).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        if (onExpire) {
          onExpire();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [fechaCierre, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="w-full max-w-md mx-auto my-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2.5 text-amber-400 text-sm font-medium animate-fade-in">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>Esta encuesta ha finalizado. Consulta los resultados definitivos abajo.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto my-4 text-center">
      <div className="inline-flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Clock className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
        <span>Tiempo restante para votar</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* Días */}
        <div className="glass-card p-2 sm:p-2.5 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1">
            Días
          </div>
        </div>

        {/* Horas */}
        <div className="glass-card p-2 sm:p-2.5 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1">
            Horas
          </div>
        </div>

        {/* Minutos */}
        <div className="glass-card p-2 sm:p-2.5 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="text-xl sm:text-2xl font-black text-brand-accent font-mono leading-none">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1">
            Minutos
          </div>
        </div>

        {/* Segundos */}
        <div className="glass-card p-2 sm:p-2.5 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono leading-none">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1">
            Segundos
          </div>
        </div>
      </div>
    </div>
  );
}
