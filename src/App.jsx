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
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-slate-200 px-4">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-brand-accent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand-accent">
            2026
          </div>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Anteño TV</h2>
        <p className="text-xs text-slate-400 mt-1">Cargando encuesta oficial...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-slate-100 selection:bg-brand-primary selection:text-white relative overflow-x-hidden">
      {/* Fondo con Mallas de Gradiente Radial */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[160px]"></div>
      </div>

      {/* 1. Header Oficial (Anteño TV + TeoDev) */}
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
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 pt-4 sm:pt-6">
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
          <div className="max-w-2xl mx-auto mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Vista Condicional: Votación vs Resultados */}
        {!showResultsView ? (
          /* ============================================================== */
          /* VISTA DE VOTACIÓN (Tarjetas de Candidatos Protagonistas)        */
          /* ============================================================== */
          <section className="animate-fade-in">
            <div className="text-center mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Selecciona una opción para votar
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

            {/* 1. Contador Total de Participación (Social Proof) */}
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

            {/* 3. Chips Opcionales de Zona y Edad (con botón Omitir) */}
            <DemographicSurvey
              dignidadId={dignidad?.id}
              onSaveDemographics={saveDemographics}
            />

            {/* 4. Ranking de Zonas más Participativas */}
            <ZoneLeaderboard
              zoneCounts={zoneCounts}
            />

            {/* 5. Botón Grande de Compartir (WhatsApp / Web Share API) */}
            <ShareButton
              candidateName={votedCandidate?.nombre}
              dignidadName={dignidad?.nombre}
            />
          </section>
        )}
      </main>

      {/* Footer Informativo con Redes y Créditos */}
      <Footer />

      {/* Botón Flotante para Pruebas / Reinicio de Voto (Modo Demo QA) */}
      {hasVoted && (
        <button
          onClick={resetDemoVote}
          className="fixed bottom-4 right-4 z-30 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 text-[11px] font-medium shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 opacity-60 hover:opacity-100"
          title="Reiniciar voto y demografía localmente para volver a probar"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Volver a Votar (Demo QA)</span>
        </button>
      )}
    </div>
  );
}
