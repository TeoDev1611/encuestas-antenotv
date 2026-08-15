-- ==============================================================================
-- SISTEMA DE ENCUESTAS DIGITALES - ANTEÑO TV (ELECCIONES 2026)
-- Esquema de Base de Datos para Supabase (PostgreSQL) - Versión con Demografía
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Cantones (Imbabura y Ecuador)
CREATE TABLE IF NOT EXISTS cantones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    provincia TEXT NOT NULL DEFAULT 'Imbabura',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Dignidades (Alcaldía, Concejales, Prefectura, etc.)
CREATE TABLE IF NOT EXISTS dignidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL, -- ej: "Alcaldía de Antonio Ante 2026"
    nivel TEXT NOT NULL CHECK (nivel IN ('cantonal', 'provincial')),
    activa BOOLEAN DEFAULT true,
    fecha_cierre TIMESTAMPTZ NOT NULL, -- Fecha y hora límite para votar
    canton_id UUID REFERENCES cantones(id) ON DELETE SET NULL,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Candidatos
CREATE TABLE IF NOT EXISTS candidatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dignidad_id UUID NOT NULL REFERENCES dignidades(id) ON DELETE CASCADE,
    canton_id UUID REFERENCES cantones(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    foto_url TEXT,
    movimiento TEXT NOT NULL, -- Movimiento o Partido Político
    lista_numero TEXT,        -- ej: "Lista 5", "Lista 6 - 8"
    color_hex TEXT DEFAULT '#3b82f6', -- Color representativo
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Votos (Segura, Privada y con Demografía Opcional)
CREATE TABLE IF NOT EXISTS votos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
    dignidad_id UUID NOT NULL REFERENCES dignidades(id) ON DELETE CASCADE,
    ip_hash TEXT NOT NULL,    -- SHA-256 de la IP + Salt secreto
    device_id TEXT NOT NULL,  -- Identificador único de navegador/dispositivo
    zona TEXT NULL,           -- Parroquia/Zona opcional (ej: Atuntaqui, Andrade Marín)
    rango_edad TEXT NULL,     -- Rango de edad opcional (ej: 18-25, 26-35)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla ya existe sin estas columnas, agregarlas de forma segura
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='votos' AND column_name='zona') THEN
        ALTER TABLE votos ADD COLUMN zona TEXT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='votos' AND column_name='rango_edad') THEN
        ALTER TABLE votos ADD COLUMN rango_edad TEXT NULL;
    END IF;
END $$;

-- Índices para optimizar consultas y agregaciones
CREATE INDEX IF NOT EXISTS idx_votos_dignidad ON votos(dignidad_id);
CREATE INDEX IF NOT EXISTS idx_votos_candidato ON votos(candidato_id);
CREATE INDEX IF NOT EXISTS idx_votos_ip_dignidad ON votos(ip_hash, dignidad_id, created_at);
CREATE INDEX IF NOT EXISTS idx_votos_device_dignidad ON votos(device_id, dignidad_id);
CREATE INDEX IF NOT EXISTS idx_votos_zona ON votos(dignidad_id, zona) WHERE zona IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidatos_dignidad ON candidatos(dignidad_id, orden);

-- ==============================================================================
-- VISTA DE RESULTADOS PÚBLICOS DE CANDIDATOS (Agregación en Tiempo Real)
-- ==============================================================================
CREATE OR REPLACE VIEW vista_resultados_candidatos AS
SELECT 
    c.id AS candidato_id,
    c.dignidad_id,
    c.canton_id,
    c.nombre,
    c.foto_url,
    c.movimiento,
    c.lista_numero,
    c.color_hex,
    c.orden,
    COUNT(v.id)::INT AS total_votos
FROM candidatos c
LEFT JOIN votos v ON v.candidato_id = c.id
GROUP BY c.id;

-- ==============================================================================
-- VISTA DE RANKING DE PARTICIPACIÓN POR ZONA
-- ==============================================================================
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
-- TABLA DE CONTEO EN TIEMPO REAL (Para Supabase Realtime)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS conteo_candidatos (
    candidato_id UUID PRIMARY KEY REFERENCES candidatos(id) ON DELETE CASCADE,
    dignidad_id UUID NOT NULL REFERENCES dignidades(id) ON DELETE CASCADE,
    total_votos INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para mantener conteo_candidatos sincronizado automáticamente
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
-- FUNCIÓN RPC: REGISTRAR VOTO SEGURO
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
    -- 1. Validar Honeypot
    IF p_honeypot IS NOT NULL AND LENGTH(TRIM(p_honeypot)) > 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Solicitud no válida (honeypot detectado).');
    END IF;

    -- 2. Validar Dignidad Activa y Fecha de Cierre
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
        RETURN jsonb_build_object('success', false, 'message', 'Esta encuesta ha finalizado y ya no acepta votos.');
    END IF;

    -- 3. Validar Candidato
    SELECT EXISTS (
        SELECT 1 FROM candidatos 
        WHERE id = p_candidato_id AND dignidad_id = p_dignidad_id
    ) INTO v_candidato_valido;

    IF NOT v_candidato_valido THEN
        RETURN jsonb_build_object('success', false, 'message', 'El candidato seleccionado no es válido para esta encuesta.');
    END IF;

    -- 4. Validar si el device_id ya votó
    SELECT EXISTS (
        SELECT 1 FROM votos
        WHERE device_id = p_device_id AND dignidad_id = p_dignidad_id
    ) INTO v_ya_voto_device;

    IF v_ya_voto_device THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ya has registrado tu voto en esta encuesta.');
    END IF;

    -- 5. Validar límite de IP (máximo 3 votos por IP en 24h)
    SELECT COUNT(*) INTO v_votos_ip_24h
    FROM votos
    WHERE ip_hash = p_ip_hash 
      AND dignidad_id = p_dignidad_id
      AND created_at > (now() - INTERVAL '24 hours');

    IF v_votos_ip_24h >= 3 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Se ha alcanzado el límite de votos permitido para esta red en 24 horas.');
    END IF;

    -- 6. Insertar Voto con datos demográficos opcionales
    INSERT INTO votos (candidato_id, dignidad_id, ip_hash, device_id, zona, rango_edad)
    VALUES (p_candidato_id, p_dignidad_id, p_ip_hash, p_device_id, NULLIF(TRIM(p_zona), ''), NULLIF(TRIM(p_rango_edad), ''))
    RETURNING id INTO v_voto_id;

    RETURN jsonb_build_object('success', true, 'message', 'Voto registrado exitosamente.', 'voto_id', v_voto_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- FUNCIÓN RPC: GUARDAR DEMOGRÁFICOS POST-VOTO
-- Permite actualizar zona y rango_edad del voto existente por device_id
-- ==============================================================================
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
        RETURN jsonb_build_object('success', false, 'message', 'No se encontró el voto para actualizar.');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE cantones ENABLE ROW LEVEL SECURITY;
ALTER TABLE dignidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conteo_candidatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de cantones activos" 
ON cantones FOR SELECT USING (activo = true);

CREATE POLICY "Permitir lectura publica de dignidades activas" 
ON dignidades FOR SELECT USING (activa = true);

CREATE POLICY "Permitir lectura publica de candidatos" 
ON candidatos FOR SELECT USING (true);

CREATE POLICY "Permitir lectura publica de conteos en vivo" 
ON conteo_candidatos FOR SELECT USING (true);

-- ==============================================================================
-- HABILITAR REALTIME
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE conteo_candidatos;

-- ==============================================================================
-- DATOS SEMILLA PARA ANTONIO ANTE 2026
-- ==============================================================================
DO $$
DECLARE
    v_canton_id UUID;
    v_dignidad_id UUID;
    v_cand_1 UUID;
    v_cand_2 UUID;
    v_cand_3 UUID;
    v_cand_4 UUID;
    v_cand_5 UUID;
BEGIN
    -- Cantón
    INSERT INTO cantones (nombre, provincia, activo)
    VALUES ('Antonio Ante', 'Imbabura', true)
    ON CONFLICT (nombre) DO UPDATE SET activo = true
    RETURNING id INTO v_canton_id;

    -- Dignidad
    INSERT INTO dignidades (nombre, nivel, activa, fecha_cierre, canton_id, descripcion)
    VALUES (
        'Alcaldía de Antonio Ante 2026',
        'cantonal',
        true,
        '2026-11-29 17:00:00-05',
        v_canton_id,
        'Elección de Alcalde o Alcaldesa del Cantón Antonio Ante para el periodo 2026-2030.'
    )
    RETURNING id INTO v_dignidad_id;

    -- Candidatos
    INSERT INTO candidatos (dignidad_id, canton_id, nombre, movimiento, lista_numero, color_hex, orden, foto_url)
    VALUES 
    (
        v_dignidad_id, v_canton_id, 'Rolando López', 'Movimiento Político Antonio Ante Activo', 'Lista 100', '#3b82f6', 1, 
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
    ) RETURNING id INTO v_cand_1;

    INSERT INTO candidatos (dignidad_id, canton_id, nombre, movimiento, lista_numero, color_hex, orden, foto_url)
    VALUES 
    (
        v_dignidad_id, v_canton_id, 'César Escobar', 'Alianza por el Progreso Anteño', 'Lista 8 - 21', '#06b6d4', 2, 
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'
    ) RETURNING id INTO v_cand_2;

    INSERT INTO candidatos (dignidad_id, canton_id, nombre, movimiento, lista_numero, color_hex, orden, foto_url)
    VALUES 
    (
        v_dignidad_id, v_canton_id, 'María Eugenia Gómez', 'Revolución Ciudadana', 'Lista 5', '#0ea5e9', 3, 
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
    ) RETURNING id INTO v_cand_3;

    INSERT INTO candidatos (dignidad_id, canton_id, nombre, movimiento, lista_numero, color_hex, orden, foto_url)
    VALUES 
    (
        v_dignidad_id, v_canton_id, 'David Andrade', 'Partido Social Cristiano', 'Lista 6', '#f59e0b', 4, 
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
    ) RETURNING id INTO v_cand_4;

    INSERT INTO candidatos (dignidad_id, canton_id, nombre, movimiento, lista_numero, color_hex, orden, foto_url)
    VALUES 
    (
        v_dignidad_id, v_canton_id, 'Paulina Vaca', 'Movimiento de Unidad Plurinacional Pachakutik', 'Lista 18', '#10b981', 5, 
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400'
    ) RETURNING id INTO v_cand_5;

    -- Conteo inicial
    INSERT INTO conteo_candidatos (candidato_id, dignidad_id, total_votos)
    VALUES 
        (v_cand_1, v_dignidad_id, 0),
        (v_cand_2, v_dignidad_id, 0),
        (v_cand_3, v_dignidad_id, 0),
        (v_cand_4, v_dignidad_id, 0),
        (v_cand_5, v_dignidad_id, 0);

END $$;
