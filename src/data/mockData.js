/**
 * Datos para la encuesta de Alcaldía de Antonio Ante 2026
 * Todos los contadores arrancan en 0 para reflejar datos 100% reales.
 */

export const INITIAL_CANTON = {
  id: "canton-antonio-ante",
  nombre: "Antonio Ante",
  provincia: "Imbabura",
  activo: true,
};

export const INITIAL_DIGNIDAD = {
  id: "alcaldia-antonio-ante-2026",
  nombre: "Alcaldía de Antonio Ante 2026",
  nivel: "cantonal",
  activa: true,
  fecha_cierre: "2026-11-29T17:00:00-05:00",
  canton_id: "canton-antonio-ante",
  descripcion: "Sondeo de opinión digital no oficial sobre las preferencias electorales para la Alcaldía de Antonio Ante.",
};

export const INITIAL_CANDIDATOS = [
  {
    id: "cand-1",
    dignidad_id: "alcaldia-antonio-ante-2026",
    nombre: "Rolando López",
    movimiento: "Movimiento Político Antonio Ante Activo",
    lista_numero: "Lista 100",
    color_hex: "#3b82f6", // Azul
    logo_movimiento_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=120",
    orden: 1,
    foto_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    votos_iniciales: 0,
  },
  {
    id: "cand-2",
    dignidad_id: "alcaldia-antonio-ante-2026",
    nombre: "César Escobar",
    movimiento: "Alianza por el Progreso Anteño",
    lista_numero: "Lista 8 - 21",
    color_hex: "#06b6d4", // Cyan
    logo_movimiento_url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=120",
    orden: 2,
    foto_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
    votos_iniciales: 0,
  },
  {
    id: "cand-3",
    dignidad_id: "alcaldia-antonio-ante-2026",
    nombre: "María Eugenia Gómez",
    movimiento: "Revolución Ciudadana",
    lista_numero: "Lista 5",
    color_hex: "#0ea5e9", // Celeste
    logo_movimiento_url: "https://images.unsplash.com/photo-1572945753463-f00ce6575ce7?auto=format&fit=crop&q=80&w=120",
    orden: 3,
    foto_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    votos_iniciales: 0,
  },
  {
    id: "cand-4",
    dignidad_id: "alcaldia-antonio-ante-2026",
    nombre: "David Andrade",
    movimiento: "Partido Social Cristiano",
    lista_numero: "Lista 6",
    color_hex: "#f59e0b", // Ámbar / Amarillo
    logo_movimiento_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=120",
    orden: 4,
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    votos_iniciales: 0,
  },
  {
    id: "cand-5",
    dignidad_id: "alcaldia-antonio-ante-2026",
    nombre: "Paulina Vaca",
    movimiento: "Unidad Plurinacional Pachakutik",
    lista_numero: "Lista 18",
    color_hex: "#10b981", // Verde
    logo_movimiento_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=120",
    orden: 5,
    foto_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    votos_iniciales: 0,
  },
];

// Opciones de Parroquias / Zonas de Antonio Ante
export const ZONAS_ANTONIO_ANTE = [
  "Atuntaqui",
  "Andrade Marín",
  "Chaltura",
  "Natabuela",
  "San Roque",
  "Imbaya",
];

// Opciones de Rangos de Edad
export const RANGOS_EDAD = [
  "18-25",
  "26-35",
  "36-50",
  "51-65",
  "66+",
];

// Inicializado en vacío para datos 100% reales
export const INITIAL_ZONA_COUNTS = [];
