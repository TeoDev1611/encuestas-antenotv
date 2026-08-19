import React, { useState } from 'react';
import Header from './components/Header';
import Disclaimer from './components/Disclaimer';
import CountdownTimer from './components/CountdownTimer';
import DignityHeader from './components/DignityHeader';
import CandidateGrid from './components/CandidateGrid';
import VoteFeedback from './components/VoteFeedback';
import SocialProofCounter from './components/SocialProofCounter';
import LiveResultsChart from './components/LiveResultsChart';
import DemographicSurvey from './components/DemographicSurvey';
import ZoneLeaderboard from './components/ZoneLeaderboard';
import ShareButton from './components/ShareButton';
import Footer from './components/Footer';
import { useSurvey } from './hooks/useSurvey';
import { HONEYPOT_FIELD_NAME } from './lib/antiSpam';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export default function App() {
  const {
    loading,
    canton,
    dignidad,
    candidatos,
    totalVotes,
    zoneCounts,
    hasVoted,
    votedCandidate,
    isJustVoted,
    isVoting,
    isExpired,
    error,
    isRealtimeActive,
    honeypotValue,
    setHoneypotValue,
    submitVote,
    saveDemographics,
    handleExpire,
    resetDemoVote,
  } = useSurvey();

  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const handleVote = (candidato) => {
    setSelectedCandidateId(candidato.id);
    submitVote(candidato);
  };

  const showResultsView = hasVoted || isExpired;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <img 
            src="/logo-anteno-negro.png" 
            alt="Cargando Anteño TV" 
            className="w-24 h-auto mb-6 opacity-80"
          />
          <h2 className="text-xl font-bold text-slate-800">Cargando Encuesta...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 relative">
      {/* 1. Header Oficial (Anteño TV + Teo + Bandera Antonio Ante) */}
      <Header />

      {/* 2. Disclaimer Legal Visible Inmediatamente */}
      <Disclaimer />

      {/* Campo Honeypot Oculto */}
      <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
        <label htmlFor={HONEYPOT_FIELD_NAME}>No llenar este campo:</label>
        <input
          id={HONEYPOT_FIELD_NAME}
          type="text"
          name={HONEYPOT_FIELD_NAME}
          value={honeypotValue}
          onChange={(e) => setHoneypotValue(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Contenido Principal en UNA Sola Pantalla */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 pt-3 sm:pt-5">
        {/* Temporizador Regresivo dinámico hasta fecha_cierre */}
        <CountdownTimer 
          fechaCierre={dignidad?.fecha_cierre} 
          onExpire={handleExpire} 
        />

        {/* Título de la Dignidad Activa */}
        <DignityHeader 
          dignidad={dignidad} 
          canton={canton} 
        />

        {/* Alerta de Error si ocurre */}
        {error && (
          <div className="max-w-2xl mx-auto mb-4 p-3 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Vista Condicional: Votación vs Resultados */}
        {!showResultsView ? (
          /* ============================================================== */
          /* VISTA DE VOTACIÓN (Tarjetas de Candidatos Protagonistas)        */
          /* ============================================================== */
          <section className="animate-fade-in">
            <div className="text-center mb-3">
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-900 text-xs font-black uppercase tracking-wider border border-green-200">
                Pulsa el botón verde para elegir a tu candidato
              </span>
            </div>

            <CandidateGrid
              candidatos={candidatos}
              onVote={handleVote}
              isVoting={isVoting}
              isExpired={isExpired}
              selectedCandidateId={selectedCandidateId}
            />
          </section>
        ) : (
          /* ============================================================== */
          /* VISTA POST-VOTO: Resultados en Vivo en Orden de Prioridad Visual*/
          /* ============================================================== */
          <section className="animate-scale-up space-y-2">
            {/* Confirmación inmediata del voto */}
            {hasVoted && (
              <VoteFeedback
                votedCandidateName={votedCandidate?.nombre}
                isJustVoted={isJustVoted}
              />
            )}

            {/* 1. Contador Total de Participación */}
            <SocialProofCounter 
              totalVotes={totalVotes} 
            />

            {/* 2. Gráfico Principal de Resultados por Candidato */}
            <LiveResultsChart
              candidatos={candidatos}
              totalVotes={totalVotes}
              votedCandidateId={votedCandidate?.id}
              isRealtimeActive={isRealtimeActive}
            />

            {/* 3. Chips Opcionales de Zona y Edad (Simplificado a 1 tap) */}
            <DemographicSurvey
              dignidadId={dignidad?.id}
              onSaveDemographics={saveDemographics}
            />

            {/* 4. Ranking de Zonas más Participativas */}
            <ZoneLeaderboard
              zoneCounts={zoneCounts}
            />

            {/* 5. Botón Grande de Compartir en WhatsApp */}
            <ShareButton
              candidateName={votedCandidate?.nombre}
              dignidadName={dignidad?.nombre}
            />
          </section>
        )}
      </main>

      {/* Footer Informativo */}
      <Footer />

      {/* Botón Flotante para Pruebas / Reinicio de Voto (Modo Demo QA) */}
      {hasVoted && import.meta.env.DEV && (
        <button
          onClick={resetDemoVote}
          className="fixed bottom-4 right-4 z-30 px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-green-700 text-[11px] font-bold shadow-lg transition-all flex items-center gap-1.5 opacity-60 hover:opacity-100"
          title="Reiniciar voto localmente para volver a probar"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Volver a Votar (Demo)</span>
        </button>
      )}
    </div>
  );
}
