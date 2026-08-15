// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// Supabase Edge Function (Deno runtime) con soporte de Demografía Opcional

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const IP_SALT = Deno.env.get("IP_HASH_SALT") || "AntenoTV_Imbabura_Ecuador_2026_Salt_Secure";

/**
 * Función para generar Hash SHA-256 de la IP con Salt
 */
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}::${IP_SALT}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Método no permitido. Use POST." }),
      { status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    // =========================================================================
    // CASO A: Actualización de datos demográficos post-voto (Zona / Edad)
    // =========================================================================
    if (body.action === "update_demographics") {
      const { device_id, dignidad_id, zona, rango_edad } = body;

      if (!device_id || !dignidad_id) {
        return new Response(
          JSON.stringify({ success: false, error: "device_id y dignidad_id son requeridos." }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const updatePayload: Record<string, any> = {};
      if (zona !== undefined) updatePayload.zona = zona ? String(zona).trim() : null;
      if (rango_edad !== undefined) updatePayload.rango_edad = rango_edad ? String(rango_edad).trim() : null;

      const { error: updateError } = await supabaseAdmin
        .from("votos")
        .update(updatePayload)
        .eq("device_id", device_id)
        .eq("dignidad_id", dignidad_id);

      if (updateError) {
        console.error("Error al actualizar demografía:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "No se pudo registrar la información demográfica." }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Datos demográficos actualizados correctamente." }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // =========================================================================
    // CASO B: Registro de Voto Nuevo
    // =========================================================================
    const {
      candidato_id,
      dignidad_id,
      device_id,
      honeypot_field,
      captcha_token,
      zona,
      rango_edad,
    } = body;

    // 1. ANTI-SPAM: Honeypot
    if (honeypot_field && String(honeypot_field).trim() !== "") {
      console.warn("Honeypot activado por bot:", { honeypot_field });
      return new Response(
        JSON.stringify({ success: false, error: "Solicitud inválida." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 2. Parámetros obligatorios de voto
    if (!candidato_id || !dignidad_id || !device_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Faltan parámetros obligatorios (candidato_id, dignidad_id, device_id)." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 3. Hash de IP (SHA-256 + Salt)
    const clientIP =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const ipHash = await hashIP(clientIP);

    // 4. (Opcional Futuro) Integración hCaptcha
    const hcaptchaSecret = Deno.env.get("HCAPTCHA_SECRET_KEY");
    if (hcaptchaSecret && captcha_token) {
      const verifyRes = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `response=${encodeURIComponent(captcha_token)}&secret=${encodeURIComponent(hcaptchaSecret)}`,
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return new Response(
          JSON.stringify({ success: false, error: "Verificación de seguridad (Captcha) fallida." }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }

    // 5. Validar Dignidad Activa y Cierre
    const { data: dignidad, error: dignidadError } = await supabaseAdmin
      .from("dignidades")
      .select("id, nombre, activa, fecha_cierre")
      .eq("id", dignidad_id)
      .single();

    if (dignidadError || !dignidad) {
      return new Response(
        JSON.stringify({ success: false, error: "La dignidad seleccionada no existe." }),
        { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!dignidad.activa) {
      return new Response(
        JSON.stringify({ success: false, error: "Esta encuesta se encuentra actualmente inactiva." }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (new Date() > new Date(dignidad.fecha_cierre)) {
      return new Response(
        JSON.stringify({ success: false, error: "Esta encuesta ha finalizado y ya no recibe más votos." }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 6. Validar Candidato
    const { data: candidato, error: candError } = await supabaseAdmin
      .from("candidatos")
      .select("id, nombre, dignidad_id")
      .eq("id", candidato_id)
      .eq("dignidad_id", dignidad_id)
      .single();

    if (candError || !candidato) {
      return new Response(
        JSON.stringify({ success: false, error: "El candidato seleccionado no es válido para esta dignidad." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 7. 1 voto por device_id en esta dignidad
    const { data: existingDeviceVote } = await supabaseAdmin
      .from("votos")
      .select("id")
      .eq("device_id", device_id)
      .eq("dignidad_id", dignidad_id)
      .limit(1)
      .maybeSingle();

    if (existingDeviceVote) {
      return new Response(
        JSON.stringify({ success: false, error: "Ya registraste tu voto en esta encuesta desde este dispositivo." }),
        { status: 409, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 8. Límite de 3 votos por IP en 24h
    const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: ipVoteCount } = await supabaseAdmin
      .from("votos")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("dignidad_id", dignidad_id)
      .gte("created_at", hace24Horas);

    if (ipVoteCount && ipVoteCount >= 3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Se ha alcanzado el límite máximo de votos permitidos para esta red en 24 horas.",
        }),
        { status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 9. Insertar el voto legítimo con campos opcionales de zona y rango_edad
    const { error: insertError } = await supabaseAdmin
      .from("votos")
      .insert({
        candidato_id,
        dignidad_id,
        ip_hash: ipHash,
        device_id,
        zona: zona ? String(zona).trim() : null,
        rango_edad: rango_edad ? String(rango_edad).trim() : null,
      });

    if (insertError) {
      console.error("Error al insertar voto:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Error interno al registrar el voto. Intenta de nuevo." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "¡Voto registrado con éxito!",
        candidato: candidato.nombre,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error no controlado en Edge Function vote:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Error del servidor." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
