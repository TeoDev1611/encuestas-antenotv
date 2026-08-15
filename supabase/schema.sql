-- ==============================================================================
-- SISTEMA DE ENCUESTAS DIGITALES - ANTEÑO TV (ELECCIONES 2026)
-- Esquema de Base de Datos para Supabase (PostgreSQL) - Versión Limpia y Real
-- ==============================================================================

-- 1. Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Cantones
CREATE TABLE IF NOT EXISTS cantones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    provincia TEXT NOT NULL DEFAULT 'Imbabura',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Dignidades
CREATE TABLE IF NOT EXISTS dignidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    nivel TEXT NOT NULL CHECK (nivel IN ('cantonal', 'provincial')),
    activa BOOLEAN DEFAULT true,
    fecha_cierre TIMESTAMPTZ NOT NULL,
    canton_id UUID REFERENCES cantones(id) ON DELETE SET NULL,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Candidatos (con logo del movimiento y foto del candidato)
CREATE TABLE IF NOT EXISTS candidatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dignidad_id UUID NOT NULL REFERENCES dignidades(id) ON DELETE CASCADE,
    canton_id UUID REFERENCES cantones(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    foto_url TEXT,
    logo_movimiento_url TEXT,
    movimiento TEXT NOT NULL,
    lista_numero TEXT,
    color_hex TEXT DEFAULT '#3b82f6',
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Votos (Segura y con demografía opcional)
CREATE TABLE IF NOT EXISTS votos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
    dignidad_id UUID NOT NULL REFERENCES dignidades(id) ON DELETE CASCADE,
    ip_hash TEXT NOT NULL,
    device_id TEXT NOT NULL,
    zona TEXT NULL,
    rango_edad TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_votos_dignidad ON votos(dignidad_id);
CREATE INDEX IF NOT EXISTS idx_votos_candidato ON votos(candidato_id);
CREATE INDEX IF NOT EXISTS idx_votos_ip_dignidad ON votos(ip_hash, dignidad_id, created_at);
CREATE INDEX IF NOT EXISTS idx_votos_device_dignidad ON votos(device_id, dignidad_id);
CREATE INDEX IF NOT EXISTS idx_votos_zona ON votos(dignidad_id, zona) WHERE zona IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidatos_dignidad ON candidatos(dignidad_id, orden);

-- ==============================================================================
-- TABLA DE CONTEO EN TIEMPO REAL
-- ==============================================================================
CREATE TABLE IF NOT EXISTS conteo_candidatos (
    candidato_id UUID PRIMARY KEY REFERENCES candidatos(id) ON DELETE CASCADE,
    dignidad_id UUID NOT NULL REFERENCES dignidades(id) ON DELETE CASCADE,
    total_votos INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger de Conteo Automático
CREATE OR REPLACE FUNCTION actualizar_conteo_candidato()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO conteo_candidatos (candidato_id, dignidad_id, total_votos, updated_at)
        VALUES (NEW.candidato_id, NEW.dignidad_id, 1, now())
        ON CONFLICT (candidato_id)
        DO UPDATE SET 
            total_votos = conteo_candidatos.total_votos + 1,
            updated_at = now();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_actualizar_conteo_voto ON votos;
CREATE TRIGGER trg_actualizar_conteo_voto
AFTER INSERT ON votos
FOR EACH ROW
EXECUTE FUNCTION actualizar_conteo_candidato();

-- ==============================================================================
-- VISTAS AGREGADAS PÚBLICAS
-- ==============================================================================
DROP VIEW IF EXISTS vista_resultados_candidatos CASCADE;
CREATE OR REPLACE VIEW vista_resultados_candidatos AS
SELECT 
    c.id AS candidato_id,
    c.dignidad_id,
    c.canton_id,
    c.nombre,
    c.foto_url,
    c.logo_movimiento_url,
    c.movimiento,
    c.lista_numero,
    c.color_hex,
    c.orden,
    COALESCE(con.total_votos, 0)::INT AS total_votos
FROM candidatos c
LEFT JOIN conteo_candidatos con ON con.candidato_id = c.id
ORDER BY c.orden ASC;

DROP VIEW IF EXISTS vista_conteo_zonas CASCADE;
CREATE OR REPLACE VIEW vista_conteo_zonas AS
SELECT 
    dignidad_id,
    zona,
    COUNT(*)::INT AS total_votos
FROM votos
WHERE zona IS NOT NULL AND LENGTH(TRIM(zona)) > 0
GROUP BY dignidad_id, zona
ORDER BY total_votos DESC;

-- ==============================================================================
-- FUNCIONES RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION registrar_voto(
    p_candidato_id UUID,
    p_dignidad_id UUID,
    p_ip_hash TEXT,
    p_device_id TEXT,
    p_honeypot TEXT DEFAULT '',
    p_zona TEXT DEFAULT NULL,
    p_rango_edad TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_activa BOOLEAN;
    v_fecha_cierre TIMESTAMPTZ;
    v_votos_ip_24h INT;
    v_ya_voto_device BOOLEAN;
    v_candidato_valido BOOLEAN;
    v_voto_id UUID;
BEGIN
    -- 1. Honeypot
    IF p_honeypot IS NOT NULL AND LENGTH(TRIM(p_honeypot)) > 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Solicitud no válida (honeypot detectado).');
    END IF;

    -- 2. Dignidad Activa y Cierre
    SELECT activa, fecha_cierre INTO v_activa, v_fecha_cierre
    FROM dignidades
    WHERE id = p_dignidad_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'La dignidad especificada no existe.');
    END IF;

    IF NOT v_activa THEN
        RETURN jsonb_build_object('success', false, 'message', 'Esta encuesta se encuentra inactiva.');
    END IF;

    IF now() > v_fecha_cierre THEN
        RETURN jsonb_build_object('success', false, 'message', 'Esta encuesta ha finalizado.');
    END IF;

    -- 3. Candidato Válido
    SELECT EXISTS (
        SELECT 1 FROM candidatos 
        WHERE id = p_candidato_id AND dignidad_id = p_dignidad_id
    ) INTO v_candidato_valido;

    IF NOT v_candidato_valido THEN
        RETURN jsonb_build_object('success', false, 'message', 'El candidato no es válido.');
    END IF;

    -- 4. Device ID
    SELECT EXISTS (
        SELECT 1 FROM votos
        WHERE device_id = p_device_id AND dignidad_id = p_dignidad_id
    ) INTO v_ya_voto_device;

    IF v_ya_voto_device THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ya has registrado tu voto en esta encuesta.');
    END IF;

    -- 5. Límite de 3 votos por IP en 24h
    SELECT COUNT(*) INTO v_votos_ip_24h
    FROM votos
    WHERE ip_hash = p_ip_hash 
      AND dignidad_id = p_dignidad_id
      AND created_at > (now() - INTERVAL '24 hours');

    IF v_votos_ip_24h >= 3 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Límite de votos de red alcanzado en 24h.');
    END IF;

    -- 6. Insertar Voto
    INSERT INTO votos (candidato_id, dignidad_id, ip_hash, device_id, zona, rango_edad)
    VALUES (p_candidato_id, p_dignidad_id, p_ip_hash, p_device_id, NULLIF(TRIM(p_zona), ''), NULLIF(TRIM(p_rango_edad), ''))
    RETURNING id INTO v_voto_id;

    RETURN jsonb_build_object('success', true, 'message', 'Voto registrado exitosamente.', 'voto_id', v_voto_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION guardar_demograficos(
    p_device_id TEXT,
    p_dignidad_id UUID,
    p_zona TEXT DEFAULT NULL,
    p_rango_edad TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_updated_rows INT;
BEGIN
    UPDATE votos
    SET 
        zona = COALESCE(NULLIF(TRIM(p_zona), ''), zona),
        rango_edad = COALESCE(NULLIF(TRIM(p_rango_edad), ''), rango_edad)
    WHERE device_id = p_device_id AND dignidad_id = p_dignidad_id;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    IF v_updated_rows > 0 THEN
        RETURN jsonb_build_object('success', true, 'message', 'Datos demográficos actualizados.');
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'No se encontró el voto.');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- POLÍTICAS RLS
-- ==============================================================================
ALTER TABLE cantones ENABLE ROW LEVEL SECURITY;
ALTER TABLE dignidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conteo_candidatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de cantones activos" ON cantones FOR SELECT USING (activo = true);
CREATE POLICY "Permitir lectura publica de dignidades activas" ON dignidades FOR SELECT USING (activa = true);
CREATE POLICY "Permitir lectura publica de candidatos" ON candidatos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de conteos en vivo" ON conteo_candidatos FOR SELECT USING (true);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conteo_candidatos;
