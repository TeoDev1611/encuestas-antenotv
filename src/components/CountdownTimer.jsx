import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

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
      <div className="w-full max-w-md mx-auto my-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center gap-2 text-red-700 text-sm font-bold">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>Esta encuesta ha finalizado. Resultados definitivos:</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto my-3.5 text-center">
      <div className="inline-flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
        <Clock className="w-3.5 h-3.5 text-green-700" />
        <span>Tiempo restante para votar</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {/* Días */}
        <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-none">
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase mt-1">
            Días
          </div>
        </div>

        {/* Horas */}
        <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-none">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase mt-1">
            Horas
          </div>
        </div>

        {/* Minutos */}
        <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl sm:text-2xl font-black text-green-700 font-mono leading-none">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-green-700 font-bold uppercase mt-1">
            Minutos
          </div>
        </div>

        {/* Segundos */}
        <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl sm:text-2xl font-black text-red-600 font-mono leading-none">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-red-600 font-bold uppercase mt-1">
            Segundos
          </div>
        </div>
      </div>
    </div>
  );
}
