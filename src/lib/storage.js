/**
 * Control local de votos por dignidad
 */

const VOTE_STORAGE_PREFIX = 'anteno_voto_dignidad_';

export function getStoredVote(dignidadId) {
  if (!dignidadId) return null;
  try {
    const raw = localStorage.getItem(`${VOTE_STORAGE_PREFIX}${dignidadId}`);
    if (!raw) {
      // Intentar leer de cookie si existe
      const match = document.cookie.match(new RegExp(`(^| )${VOTE_STORAGE_PREFIX}${dignidadId}=([^;]+)`));
      if (match) {
        return JSON.parse(decodeURIComponent(match[2]));
      }
      return null;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error al leer voto guardado:', err);
    return null;
  }
}

export function saveStoredVote(dignidadId, voteData) {
  if (!dignidadId) return;
  try {
    const payload = JSON.stringify({
      ...voteData,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(`${VOTE_STORAGE_PREFIX}${dignidadId}`, payload);
    document.cookie = `${VOTE_STORAGE_PREFIX}${dignidadId}=${encodeURIComponent(payload)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (err) {
    console.error('Error al guardar voto en almacenamiento:', err);
  }
}

export function clearStoredVote(dignidadId) {
  if (!dignidadId) return;
  localStorage.removeItem(`${VOTE_STORAGE_PREFIX}${dignidadId}`);
  document.cookie = `${VOTE_STORAGE_PREFIX}${dignidadId}=; path=/; max-age=0`;
}
