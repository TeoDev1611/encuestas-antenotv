export const INITIAL_CANTON = {
  id: '8a1e6dd1-2da4-4485-a246-f13231545f14',
  nombre: 'Antonio Ante',
  provincia: 'Imbabura',
};

export const INITIAL_DIGNIDAD = {
  id: '4817e3e4-3061-41bf-90a7-c7d747515e7b',
  nombre: 'Alcaldía de Antonio Ante 2026',
  nivel: 'cantonal',
  fecha_cierre: '2026-08-25T17:00:00.000Z',
  descripcion: 'Encuesta no oficial de Anteño TV. Tu voto es secreto y está protegido por sistema anti-fraude.',
};

export const INITIAL_CANDIDATOS = [
  {
    id: 'a1eb162d-c062-49c0-a704-b5354528db3f',
    dignidad_id: INITIAL_DIGNIDAD.id,
    canton_id: INITIAL_CANTON.id,
    nombre: 'Luis Cevallos',
    movimiento: 'Centro Democrático',
    lista_numero: 'Lista 1',
    foto_url: '/politicos/luis-cevallos.jpeg',
    color_hex: '#ea580c', // Naranja Centro Democrático
    orden: 1,
    votos_iniciales: 0,
  },
  {
    id: 'bb5fa101-0c89-4b9a-a9d3-56a0ffed7594',
    dignidad_id: INITIAL_DIGNIDAD.id,
    canton_id: INITIAL_CANTON.id,
    nombre: 'César Escobar',
    movimiento: 'Partido Avanza',
    lista_numero: 'Lista 8',
    foto_url: '/politicos/cesar-escobar.jpeg',
    color_hex: '#2563eb', // Azul eléctrico Avanza
    orden: 2,
    votos_iniciales: 0,
  },
  {
    id: '1fc78216-9b9b-4f46-aa0d-3548e810d82a',
    dignidad_id: INITIAL_DIGNIDAD.id,
    canton_id: INITIAL_CANTON.id,
    nombre: 'Juan Carlos Ortiz',
    movimiento: 'Izquierda Democrática (Alianza Futuro)',
    lista_numero: 'Lista 12',
    foto_url: '/politicos/juan-carlos-ortiz.jpeg',
    color_hex: '#f97316', // Naranja ID
    orden: 3,
    votos_iniciales: 0,
  },
  {
    id: '67e3b9b9-10e5-4fbb-bcde-172863aed53f',
    dignidad_id: INITIAL_DIGNIDAD.id,
    canton_id: INITIAL_CANTON.id,
    nombre: 'Juan Andrade',
    movimiento: 'Acción Democrática Nacional (ADN)',
    lista_numero: 'Lista 7',
    foto_url: '/politicos/juan-andrade.jpeg',
    color_hex: '#7e22ce', // Morado ADN
    orden: 4,
    votos_iniciales: 0,
  },
  {
    id: '66ae4f75-46ba-4ac3-9685-ebe377939dc7',
    dignidad_id: INITIAL_DIGNIDAD.id,
    canton_id: INITIAL_CANTON.id,
    nombre: 'Carlos Espinosa',
    movimiento: 'Alianza Somos Libres / Unidad Popular',
    lista_numero: 'Listas 62 - 2',
    foto_url: '/politicos/carlos-espinosa.jpg',
    color_hex: '#be123c', // Rojo Unidad Popular
    orden: 5,
    votos_iniciales: 0,
  }
];

export const ZONAS_ANTONIO_ANTE = [
  'Atuntaqui',
  'Andrade Marín',
  'San Roque',
  'Natabuela',
  'Chaltura',
  'Imbaya',
];

export const RANGOS_EDAD = [
  '18-25',
  '26-35',
  '36-50',
  '51-65',
  '66+',
];

export const INITIAL_ZONA_COUNTS = [];
