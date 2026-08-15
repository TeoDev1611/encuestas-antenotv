import { useState, useEffect, useCallback, useMemo } from 'react';
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
    INITIAL_CANDIDATOS.map(c => ({ ...c, total_votos: c.votos_iniciales || 0 }))
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

  // Total de votos agregados
  const totalVotes = useMemo(() => {
    return candidatos.reduce((acc, c) => acc + (c.total_votos || 0), 0);
  }, [candidatos]);

  // Verificar si la fecha de cierre ya expiró
  const checkExpiration = useCallback((fechaCierre) => {
    if (!fechaCierre) return false;
    const isPast = new Date().getTime() >= new Date(fechaCierre).getTime();
    setIsExpired(isPast);
    return isPast;
  }, []);

  // Cargar datos de la encuesta y zonas
  const loadSurveyData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      // Modo Demo / Contingencia
      const stored = getStoredVote(INITIAL_DIGNIDAD.id);
      if (stored) {
        setHasVoted(true);
        const match = INITIAL_CANDIDATOS.find(c => c.id === stored.candidato_id);
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
        console.warn('No hay dignidades activas en Supabase. Usando contingencia.');
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
          nombre: stored.candidato_nombre,
        });
      }

      // 3. Obtener candidatos consolidados
      const { data: candData, error: candError } = await supabase
        .from('vista_resultados_candidatos')
        .select('*')
        .eq('dignidad_id', digData.id)
        .order('orden', { ascending: true });

      if (candError) {
        const { data: rawCand } = await supabase
          .from('candidatos')
          .select('*, conteo_candidatos(total_votos)')
          .eq('dignidad_id', digData.id)
          .order('orden', { ascending: true });

        setCandidatos((rawCand || []).map(c => ({
          ...c,
          total_votos: c.conteo_candidatos?.[0]?.total_votos || 0,
        })));
      } else {
        setCandidatos(candData || []);
      }

      // 4. Obtener conteo por zonas
      const { data: zoneData, error: zoneError } = await supabase
        .from('vista_conteo_zonas')
        .select('zona, total_votos')
        .eq('dignidad_id', digData.id);

      if (!zoneError && zoneData && zoneData.length > 0) {
        setZoneCounts(zoneData);
      }
    } catch (err) {
      console.error('Error al cargar datos de encuesta:', err);
      setError('No se pudieron sincronizar los datos en vivo. Mostrando datos locales.');
    } finally {
      setLoading(false);
    }
  }, [checkExpiration]);

  // Suscripción Realtime
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !dignidad?.id) return;

    const channel = supabase
      .channel(`realtime-conteo-${dignidad.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conteo_candidatos',
          filter: `dignidad_id=eq.${dignidad.id}`,
        },
        (payload) => {
          const updated = payload.new;
          if (updated && updated.candidato_id) {
            setCandidatos((prev) =>
              prev.map((c) =>
                c.id === updated.candidato_id
                  ? { ...c, total_votos: updated.total_votos }
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

    setIsVoting(true);
    setError(null);

    const deviceId = getOrCreateDeviceId();

    // Honeypot check
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
                candidato_id: candidato.id,
                dignidad_id: dignidad.id,
                device_id: deviceId,
                honeypot_field: honeypotValue,
              }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
              throw new Error(data.error || 'Error al validar el voto.');
            }
            voteSuccess = true;
          } catch (edgeErr) {
            console.warn('Fallo en Edge Function, intentando fallback RPC:', edgeErr.message);
          }
        }

        if (!voteSuccess) {
          const fakeIpHash = 'cl_' + (await hashLocalString(deviceId + navigator.userAgent));
          const { data: rpcData, error: rpcError } = await supabase.rpc('registrar_voto', {
            p_candidato_id: candidato.id,
            p_dignidad_id: dignidad.id,
            p_ip_hash: fakeIpHash,
            p_device_id: deviceId,
            p_honeypot: honeypotValue,
          });

          if (rpcError) throw rpcError;
          if (rpcData && !rpcData.success) {
            throw new Error(rpcData.message || 'No se pudo registrar el voto.');
          }
        }
      }

      // Éxito
      saveStoredVote(dignidad.id, {
        candidato_id: candidato.id,
        candidato_nombre: candidato.nombre,
      });

      setCandidatos((prev) =>
        prev.map((c) =>
          c.id === candidato.id ? { ...c, total_votos: (c.total_votos || 0) + 1 } : c
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

    // Actualizar conteo local de zonas de forma optimista
    if (zona) {
      setZoneCounts((prev) => {
        const exists = prev.some((z) => z.zona === zona);
        if (exists) {
          return prev.map((z) =>
            z.zona === zona ? { ...z, total_votos: z.total_votos + 1 } : z
          );
        } else {
          return [...prev, { zona, total_votos: 1 }];
        }
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (EDGE_FUNCTION_VOTE_URL) {
          await fetch(EDGE_FUNCTION_VOTE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_demographics',
              device_id: deviceId,
              dignidad_id: dignidad.id,
              zona: zona || null,
              rango_edad: rangoEdad || null,
            }),
          });
        } else {
          await supabase.rpc('guardar_demograficos', {
            p_device_id: deviceId,
            p_dignidad_id: dignidad.id,
            p_zona: zona || null,
            p_rango_edad: rangoEdad || null,
          });
        }
      } catch (e) {
        console.warn('No se pudo enviar demografía al servidor:', e);
      }
    }
  };

  const resetDemoVote = () => {
    localStorage.removeItem(`anteno_voto_dignidad_${dignidad.id}`);
    localStorage.removeItem(`anteno_demo_dignidad_${dignidad.id}`);
    document.cookie = `anteno_voto_dignidad_${dignidad.id}=; path=/; max-age=0`;
    setHasVoted(false);
    setVotedCandidate(null);
    setIsJustVoted(false);
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
