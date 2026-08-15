import React, { useState } from 'react';
import { Share2, MessageCircle, Copy, Check } from 'lucide-react';

export default function ShareButton({ candidateName, dignidadName }) {
  const [copied, setCopied] = useState(false);

  const surveyUrl = window.location.href;
  const candText = candidateName ? ` por ${candidateName}` : '';
  const shareTitle = `Encuesta: ${dignidadName || 'Elecciones 2026'} | Anteño TV`;
  const shareText = `¡Voté${candText} en la encuesta de Anteño TV 🗳️ ¿Y vos por quién vas a votar? Participa aquí: ${surveyUrl}`;

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
    <div className="w-full max-w-xl mx-auto px-4 my-5 animate-fade-in">
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-md text-center">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-1.5">
          ¡Comparte la encuesta con tu familia y amigos!
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-4">
          Ayuda a que más anteños participen y conozcamos la opinión de todo el cantón.
        </p>

        {/* Botones de Compartir */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {/* Botón Principal de WhatsApp (Verde, grande y muy llamativo) */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-md transition-all uppercase tracking-wide"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Compartir en WhatsApp</span>
          </button>

          {/* Botón Compartir Nativo */}
          <button
            onClick={handleNativeShare}
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            title="Compartir en otras aplicaciones"
          >
            <Share2 className="w-4 h-4" />
            <span>Más Opciones</span>
          </button>

          {/* Botón de Copiar Enlace */}
          <button
            onClick={handleCopyLink}
            className={`w-full sm:w-auto py-3.5 px-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              copied
                ? 'bg-green-100 border-green-400 text-green-800'
                : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
            title="Copiar mensaje con enlace"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-700" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>
        </div>

        {copied && (
          <div className="mt-2.5 text-xs text-green-800 font-bold animate-fade-in flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>¡Enlace copiado! Ya puedes pegarlo en tus chats de WhatsApp.</span>
          </div>
        )}
      </div>
    </div>
  );
}
