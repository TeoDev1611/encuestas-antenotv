import React, { useState } from 'react';
import { Share2, MessageCircle, Copy, Check, Sparkles } from 'lucide-react';

export default function ShareButton({ candidateName, dignidadName }) {
  const [copied, setCopied] = useState(false);

  const surveyUrl = window.location.href;
  const candText = candidateName ? ` por ${candidateName}` : '';
  const shareTitle = `Encuesta: ${dignidadName || 'Elecciones 2026'} | Anteño TV`;
  const shareText = `¡Voté${candText} en la encuesta de Anteño TV 🗳️ ¿Y vos quién crees que ganará? Participa aquí: ${surveyUrl}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: surveyUrl,
        });
        return;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.log('Error compartiendo vía Web Share:', error);
        }
      }
    }
    handleCopyLink();
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Error al copiar link:', err);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 my-6 animate-fade-in">
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-700/80 shadow-2xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Haz escuchar tu voz</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
          ¡Comparte la encuesta con tu comunidad!
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5">
          Invita a tus amigos, vecinos y familiares en Antonio Ante para que las tendencias representen a todo el cantón.
        </p>

        {/* Botones de Compartir */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Botón Principal: Compartir (Nativo / WhatsApp) */}
          <button
            onClick={handleNativeShare}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <Share2 className="w-5 h-5" />
            <span>Compartir Encuesta</span>
          </button>

          {/* Botón Específico de WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            title="Compartir en WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp</span>
          </button>

          {/* Botón de Copiar Enlace */}
          <button
            onClick={handleCopyLink}
            className={`w-full sm:w-auto py-3.5 px-4 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
              copied
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white'
            }`}
            title="Copiar mensaje con enlace"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {copied && (
          <div className="mt-3 text-xs text-emerald-400 font-medium animate-fade-in flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Mensaje y enlace copiados al portapapeles. ¡Pégalo en tus grupos!</span>
          </div>
        )}
      </div>
    </div>
  );
}
