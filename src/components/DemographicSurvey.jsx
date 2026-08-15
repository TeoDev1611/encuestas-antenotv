import React, { useState, useEffect } from 'react';
import { MapPin, User, Check, X, Sparkles } from 'lucide-react';
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
  const [justSavedZona, setJustSavedZona] = useState(false);
  const [justSavedEdad, setJustSavedEdad] = useState(false);

  // Cargar estado persistido
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
      }
    } catch (e) {
      console.warn('Error leyendo demografía almacenada:', e);
    }
  }, [dignidadId]);

  const persistState = (updates) => {
    try {
      const current = JSON.parse(localStorage.getItem(`${DEMO_STORAGE_KEY_PREFIX}${dignidadId}`) || '{}');
      const next = { ...current, ...updates };
      localStorage.setItem(`${DEMO_STORAGE_KEY_PREFIX}${dignidadId}`, JSON.stringify(next));
    } catch (e) {
      console.warn('Error guardando demografía local:', e);
    }
  };

  // Manejar selección de Zona con 1 solo tap
  const handleSelectZona = (zona) => {
    setSelectedZona(zona);
    setJustSavedZona(true);
    persistState({ zona });
    if (onSaveDemographics) {
      onSaveDemographics({ zona });
    }
    setTimeout(() => setJustSavedZona(false), 2500);
  };

  // Omitir pregunta de Zona
  const handleSkipZona = () => {
    setSkipZona(true);
    persistState({ skipZona: true });
  };

  // Manejar selección de Edad con 1 solo tap
  const handleSelectEdad = (rango) => {
    setSelectedEdad(rango);
    setJustSavedEdad(true);
    persistState({ rangoEdad: rango });
    if (onSaveDemographics) {
      onSaveDemographics({ rangoEdad: rango });
    }
    setTimeout(() => setJustSavedEdad(false), 2500);
  };

  // Omitir pregunta de Edad
  const handleSkipEdad = () => {
    setSkipEdad(true);
    persistState({ skipEdad: true });
  };

  const showZonaQuestion = !skipZona && !selectedZona;
  const showEdadQuestion = !skipEdad && !selectedEdad;

  // Si ambas preguntas fueron respondidas u omitidas y no hay feedback activo
  if (!showZonaQuestion && !showEdadQuestion && !justSavedZona && !justSavedEdad) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-4 animate-fade-in">
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Ayúdanos a enriquecer las estadísticas <span className="text-xs font-normal text-slate-400">(Opcional)</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">100% Anónimo</span>
        </div>

        {/* 1. Pregunta de Zona / Parroquia */}
        {showZonaQuestion ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>¿De qué zona eres?</span>
              </div>
              <button
                onClick={handleSkipZona}
                className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium"
              >
                <span>Omitir</span>
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Chips de 1 solo toque */}
            <div className="flex flex-wrap gap-2">
              {ZONAS_ANTONIO_ANTE.map((zona) => (
                <button
                  key={zona}
                  onClick={() => handleSelectZona(zona)}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/90 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-300 text-slate-200 transition-all duration-150 active:scale-95 shadow-sm"
                >
                  {zona}
                </button>
              ))}
            </div>
          </div>
        ) : justSavedZona ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Zona registrada: <strong>{selectedZona}</strong>. ¡Gracias por participar!</span>
          </div>
        ) : null}

        {/* 2. Pregunta de Rango de Edad */}
        {showEdadQuestion ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <User className="w-4 h-4 text-blue-400" />
                <span>¿Cuál es tu edad?</span>
              </div>
              <button
                onClick={handleSkipEdad}
                className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium"
              >
                <span>Omitir</span>
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Chips de Edad */}
            <div className="flex flex-wrap gap-2">
              {RANGOS_EDAD.map((rango) => (
                <button
                  key={rango}
                  onClick={() => handleSelectEdad(rango)}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/90 border border-slate-700 hover:border-blue-400 hover:bg-blue-950/40 hover:text-blue-300 text-slate-200 transition-all duration-150 active:scale-95 shadow-sm"
                >
                  {rango} años
                </button>
              ))}
            </div>
          </div>
        ) : justSavedEdad ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Rango de edad registrado: <strong>{selectedEdad} años</strong>.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
