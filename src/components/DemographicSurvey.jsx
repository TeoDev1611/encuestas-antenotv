import React, { useState, useEffect } from 'react';
import { MapPin, User, Check, X } from 'lucide-react';
import { ZONAS_ANTONIO_ANTE, RANGOS_EDAD } from '../data/mockData';

const DEMO_STORAGE_KEY_PREFIX = 'anteno_demo_dignidad_';

export default function DemographicSurvey({
  dignidadId,
  onSaveDemographics,
}) {
  const [selectedZona, setSelectedZona] = useState(null);
  const [selectedEdad, setSelectedEdad] = useState(null);
  const [skipZona, setSkipZona] = useState(false);
  const [skipEdad, setSkipEdad] = useState(false);
  const [step, setStep] = useState(1);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (!dignidadId) return;
    try {
      const stored = localStorage.getItem(`${DEMO_STORAGE_KEY_PREFIX}${dignidadId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.zona) setSelectedZona(parsed.zona);
        if (parsed.skipZona) setSkipZona(true);
        if (parsed.rangoEdad) setSelectedEdad(parsed.rangoEdad);
        if (parsed.skipEdad) setSkipEdad(true);

        const doneZona = parsed.zona || parsed.skipZona;
        const doneEdad = parsed.rangoEdad || parsed.skipEdad;

        if (doneZona && !doneEdad) setStep(2);
        else if (doneZona && doneEdad) setStep(3);
      }
    } catch (e) {
      console.warn('Error leyendo demografía:', e);
    }
  }, [dignidadId]);

  const persist = (updates) => {
    try {
      const current = JSON.parse(localStorage.getItem(`${DEMO_STORAGE_KEY_PREFIX}${dignidadId}`) || '{}');
      const next = { ...current, ...updates };
      localStorage.setItem(`${DEMO_STORAGE_KEY_PREFIX}${dignidadId}`, JSON.stringify(next));
    } catch (e) {
      console.warn('Error guardando demografía:', e);
    }
  };

  const handleSelectZona = (zona) => {
    setSelectedZona(zona);
    persist({ zona });
    if (onSaveDemographics) onSaveDemographics({ zona });
    
    setFeedbackMsg(`📍 Parroquia ${zona} guardada`);
    setTimeout(() => {
      setFeedbackMsg('');
      if (!selectedEdad && !skipEdad) setStep(2);
      else setStep(3);
    }, 700);
  };

  const handleSkipZona = () => {
    setSkipZona(true);
    persist({ skipZona: true });
    if (!selectedEdad && !skipEdad) setStep(2);
    else setStep(3);
  };

  const handleSelectEdad = (rango) => {
    setSelectedEdad(rango);
    persist({ rangoEdad: rango });
    if (onSaveDemographics) onSaveDemographics({ rangoEdad: rango });

    setFeedbackMsg(`✓ Datos guardados`);
    setTimeout(() => {
      setFeedbackMsg('');
      setStep(3);
    }, 700);
  };

  const handleSkipEdad = () => {
    setSkipEdad(true);
    persist({ skipEdad: true });
    setStep(3);
  };

  if (step === 3) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-2.5 animate-fade-in">
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {feedbackMsg ? (
          <div className="py-1.5 flex items-center justify-center gap-2 text-sm font-bold text-green-700 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
        ) : step === 1 ? (
          /* PASO 1: PARROQUIA / ZONA */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <MapPin className="w-4 h-4 text-green-700 flex-shrink-0" />
                <span>¿De qué parroquia eres? <span className="text-[11px] font-normal text-slate-500">(Opcional)</span></span>
              </div>
              <button
                onClick={handleSkipZona}
                className="text-xs text-slate-500 hover:text-slate-900 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors font-bold flex items-center gap-1"
              >
                <span>Omitir</span>
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {ZONAS_ANTONIO_ANTE.map((zona) => (
                <button
                  key={zona}
                  onClick={() => handleSelectZona(zona)}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 border border-slate-200 hover:border-green-600 hover:bg-green-50 hover:text-green-800 text-slate-800 transition-all active:scale-95"
                >
                  {zona}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* PASO 2: EDAD */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <User className="w-4 h-4 text-green-700 flex-shrink-0" />
                <span>¿Cuál es tu edad? <span className="text-[11px] font-normal text-slate-500">(Opcional)</span></span>
              </div>
              <button
                onClick={handleSkipEdad}
                className="text-xs text-slate-500 hover:text-slate-900 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors font-bold flex items-center gap-1"
              >
                <span>Omitir</span>
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {RANGOS_EDAD.map((rango) => (
                <button
                  key={rango}
                  onClick={() => handleSelectEdad(rango)}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 border border-slate-200 hover:border-green-600 hover:bg-green-50 hover:text-green-800 text-slate-800 transition-all active:scale-95"
                >
                  {rango} años
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
