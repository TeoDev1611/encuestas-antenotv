/**
 * Utilidades Anti-Spam en el cliente:
 * 1. Generación y persistencia de Device ID
 * 2. Campo Honeypot para detección de bots
 */

const DEVICE_ID_KEY = 'anteno_device_fingerprint_v1';

/**
 * Obtiene o crea un Device ID único para el navegador
 */
export function getOrCreateDeviceId() {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // Generar UUID seguro
      deviceId = 'dev_' + crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
      
      // Guardar también en cookie de respaldo (vigencia de 1 año)
      document.cookie = `${DEVICE_ID_KEY}=${deviceId}; path=/; max-age=31536000; SameSite=Lax`;
    }
    return deviceId;
  } catch (e) {
    console.warn('No se pudo acceder a localStorage para device_id:', e);
    return 'dev_fallback_' + Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Nombre aleatorio para el campo Honeypot invisible
 */
export const HONEYPOT_FIELD_NAME = 'empresa_verificacion_segura';
