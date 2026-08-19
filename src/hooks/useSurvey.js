import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase, isSupabaseConfigured, EDGE_FUNCTION_VOTE_URL } from '../lib/supabase';
import { getStoredVote, saveStoredVote } from '../lib/storage';
import { getOrCreateDeviceId, HONEYPOT_FIELD_NAME } from '../lib/antiSpam';
import { 
  INITIAL_CANTON, 
  INITIAL_DIGNIDAD, 
  INITIAL_CANDIDATOS,
  INITIAL_ZONA_COUNTS
} from '../data/mockData';

export function useSurvey() {
  const [loading, setLoading] = useState(true);
  const [canton, setCanton] = useState(INITIAL_CANTON);
  const [dignidad, setDignidad] = useState(INITIAL_DIGNIDAD);
  const [candidatos, setCandidatos] = useState(
    INITIAL_CANDIDATOS.map(c => ({ 
      ...c, 
      id: c.id,
      candidato_id: c.id,
      total_votos: c.votos_iniciales || 0 
    }))
  );
  const [zoneCounts, setZoneCounts] = useState(INITIAL_ZONA_COUNTS);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState(null);
  const [isJustVoted, setIsJustVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState('');

  // Total de votos calculados en tiempo real
  const totalVotes = useMemo(() => {
    return candidatos.reduce((acc, c) => acc + (Number(c.total_votos) || 0), 0);
  }, [candidatos]);

  // Validar si la fecha de cierre ya venció
  const checkExpiration = useCallback((fechaCierre) => {
    if (!fechaCierre) return false;
    const isPast = new Date().getTime() >= new Date(fechaCierre).getTime();
    setIsExpired(isPast);
    return isPast;
  }, []);

  // Cargar datos completos iniciales
  const loadSurveyData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      const stored = getStoredVote(INITIAL_DIGNIDAD.id);
      if (stored) {
        setHasVoted(true);
        const match = INITIAL_CANDIDATOS.find(c => (c.id === stored.candidato_id || c.candidato_id === stored.candidato_id));
        setVotedCandidate(match || { nombre: stored.candidato_nombre || 'Candidato' });
      }
      checkExpiration(INITIAL_DIGNIDAD.fecha_cierre);
      setLoading(false);
      return;
    }

    try {
      // 1. Obtener la dignidad activa
      const { data: digData, error: digError } = await supabase
        .from('dignidades')
        .select(`
          id, nombre, nivel, activa, fecha_cierre, descripcion, canton_id,
          cantones ( id, nombre, provincia, activo )
        `)
        .eq('activa', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (digError) throw digError;

      if (!digData) {
        console.warn('No hay dignidades activas en Supabase.');
        setLoading(false);
        return;
      }

      setDignidad(digData);
      if (digData.cantones) {
        setCanton(digData.cantones);
      }
      checkExpiration(digData.fecha_cierre);

      // 2. Verificar si el usuario ya votó
      const stored = getStoredVote(digData.id);
      if (stored) {
        setHasVoted(true);
        setVotedCandidate({
          id: stored.candidato_id,
          candidato_id: stored.candidato_id,
          nombre: stored.candidato_nombre,
        });
      }

      // 3. Cargar conteos de candidatos desde la vista
      const { data: candData, error: candError } = await supabase
        .from('vista_resultados_candidatos')
        .select('*')
        .eq('dignidad_id', digData.id)
        .order('orden', { ascending: true });

      if (!candError && candData && candData.length > 0) {
        setCandidatos(candData.map(c => ({
          ...c,
          id: c.id || c.candidato_id,
          candidato_id: c.candidato_id || c.id,
          total_votos: Number(c.total_votos || 0),
        })));
      }

      // 4. Obtener conteo por zonas
      const { data: zoneData, error: zoneError } = await supabase
        .from('vista_conteo_zonas')
        .select('zona, total_votos')
        .eq('dignidad_id', digData.id);

      if (!zoneError && zoneData) {
        setZoneCounts(zoneData);
      }
    } catch (err) {
      console.error('Error al cargar datos de encuesta:', err);
      setError('No se pudieron sincronizar los datos en vivo. Mostrando datos locales.');
    } finally {
      setLoading(false);
    }
  }, [checkExpiration]);

  // Suscripción Realtime vía WebSockets solo a la tabla de conteo
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !dignidad?.id) return;

    const currentDigId = dignidad.id;

    const channel = supabase
      .channel(`realtime-survey-${currentDigId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT y UPDATE
          schema: 'public',
          table: 'conteo_candidatos',
        },
        (payload) => {
          const updated = payload.new;
          if (updated && updated.candidato_id) {
            // Actualiza el estado con el número exacto y confiable de la base de datos
            setCandidatos((prev) =>
              prev.map((c) =>
                (c.id === updated.candidato_id || c.candidato_id === updated.candidato_id)
                  ? { ...c, total_votos: Number(updated.total_votos || 0) }
                  : c
              )
            );
          }
        }
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dignidad?.id]);

  // Polling inteligente CADA 5 SEGUNDOS para las zonas y como respaldo de candidatos
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !dignidad?.id) return;
    if (!hasVoted && !isExpired) return; // Solo poll si está viendo los resultados

    const interval = setInterval(async () => {
      try {
        // Refrescar Zonas
        const { data: zoneData } = await supabase
          .from('vista_conteo_zonas')
          .select('zona, total_votos')
          .eq('dignidad_id', dignidad.id);
        if (zoneData) setZoneCounts(zoneData);
      } catch (e) {
        console.warn('Error en polling de zonas:', e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [hasVoted, isExpired, dignidad?.id]);

  useEffect(() => {
    loadSurveyData();
  }, [loadSurveyData]);

  // Enviar Voto
  const submitVote = async (candidato) => {
    if (isExpired) {
      alert('Esta encuesta ha finalizado y ya no recibe votos.');
      return;
    }

    if (hasVoted) {
      alert('Ya has registrado tu voto en esta encuesta.');
      return;
    }

    const candidatoId = candidato.id || candidato.candidato_id;
    const dignidadId = candidato.dignidad_id || dignidad.id;

    if (!candidatoId || !dignidadId) {
      alert('Error al identificar el candidato o dignidad.');
      return;
    }

    setIsVoting(true);
    setError(null);

    const deviceId = getOrCreateDeviceId();

    if (honeypotValue && honeypotValue.trim() !== '') {
      console.warn('Bot bloqueado por honeypot.');
      setIsVoting(false);
      return;
    }

    try {
      if (isSupabaseConfigured && supabase) {
        let voteSuccess = false;

        if (EDGE_FUNCTION_VOTE_URL) {
          try {
            const res = await fetch(EDGE_FUNCTION_VOTE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                candidato_id: candidatoId,
                dignidad_id: dignidadId,
                device_id: deviceId,
                honeypot_field: honeypotValue || '',
              }),
            });

            if (res.ok) {
              const data = await res.json();
              if (data.success) {
                voteSuccess = true;
              } else {
                throw new Error(data.error || 'Error al validar el voto.');
              }
            }
          } catch (edgeErr) {
            console.warn('Edge Function no disponible, usando fallback RPC en base de datos.');
          }
        }

        if (!voteSuccess) {
          const fakeIpHash = 'cl_' + (await hashLocalString(deviceId + navigator.userAgent));
          const { data: rpcData, error: rpcError } = await supabase.rpc('registrar_voto', {
            p_candidato_id: candidatoId,
            p_dignidad_id: dignidadId,
            p_ip_hash: fakeIpHash,
            p_device_id: deviceId,
            p_honeypot: honeypotValue || '',
            p_zona: null,
            p_rango_edad: null,
          });

          if (rpcError) throw rpcError;
          if (rpcData && !rpcData.success) {
            throw new Error(rpcData.message || 'No se pudo registrar el voto.');
          }
        }
      }

      // Éxito: Guardar en local y actualizar estado inmediatamente
      saveStoredVote(dignidadId, {
        candidato_id: candidatoId,
        candidato_nombre: candidato.nombre,
      });

      // Actualización optimista (< 1ms)
      setCandidatos((prev) =>
        prev.map((c) =>
          (c.id === candidatoId || c.candidato_id === candidatoId)
            ? { ...c, total_votos: (Number(c.total_votos) || 0) + 1 } 
            : c
        )
      );

      setVotedCandidate(candidato);
      setHasVoted(true);
      setIsJustVoted(true);

    } catch (err) {
      console.error('Error al emitir voto:', err);
      setError(err.message || 'Hubo un problema al procesar tu voto.');
      alert(err.message || 'No se pudo registrar el voto.');
    } finally {
      setIsVoting(false);
    }
  };

  // Guardar datos demográficos post-voto (Zona / Edad)
  const saveDemographics = async ({ zona, rangoEdad }) => {
    const deviceId = getOrCreateDeviceId();
    const dignidadId = dignidad.id;

    if (zona) {
      setZoneCounts((prev) => {
        const exists = prev.some((z) => z.zona === zona);
        if (exists) {
          return prev.map((z) =>
            z.zona === zona ? { ...z, total_votos: (Number(z.total_votos) || 0) + 1 } : z
          );
        } else {
          return [...prev, { zona, total_votos: 1 }];
        }
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (EDGE_FUNCTION_VOTE_URL) {
          const res = await fetch(EDGE_FUNCTION_VOTE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_demographics',
              device_id: deviceId,
              dignidad_id: dignidadId,
              zona: zona || null,
              rango_edad: rangoEdad || null,
            }),
          });
          if (res.ok) return;
        }

        await supabase.rpc('guardar_demograficos', {
          p_device_id: deviceId,
          p_dignidad_id: dignidadId,
          p_zona: zona || null,
          p_rango_edad: rangoEdad || null,
        });
      } catch (e) {
        console.warn('Demografía guardada localmente:', e);
      }
    }
  };

  const resetDemoVote = () => {
    localStorage.removeItem(`anteno_voto_dignidad_${dignidad.id}`);
    localStorage.removeItem(`anteno_demo_dignidad_${dignidad.id}`);
    document.cookie = `anteno_voto_dignidad_${dignidad.id}=; path=/; max-age=0`;
    
    // IMPORTANTE: Limpiar también el DEVICE ID para permitir un voto nuevo desde la base de datos!
    localStorage.removeItem('anteno_device_fingerprint_v1');
    document.cookie = `anteno_device_fingerprint_v1=; path=/; max-age=0`;
    
    setHasVoted(false);
    setVotedCandidate(null);
    setIsJustVoted(false);
    
    // Recargar todo el estado limpio desde la BD
    loadSurveyData();
  };

  return {
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
    handleExpire: () => setIsExpired(true),
    resetDemoVote,
  };
}

async function hashLocalString(str) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);
  } catch {
    return Math.random().toString(36).substring(2, 10);
  }
}
