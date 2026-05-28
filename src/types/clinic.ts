export type Plan = 'Gratis' | 'Premium'

export interface ClinicPhoto {
  id: string
  url: string
  filename: string
  width?: number
  height?: number
}

export interface Clinic {
  id: string
  slug: string
  nombre: string
  ciudad: string
  direccion: string
  telefono: string
  web?: string
  email?: string
  especialidades: string[]
  horario?: string
  urgencias24h: boolean
  fotoPortada?: ClinicPhoto
  galeriaFotos: ClinicPhoto[]
  descripcion?: string
  plan: Plan
  valoracionMedia?: number
  verificada: boolean
}

export interface Review {
  id: string
  clinicaId: string
  nombreUsuario: string
  puntuacion: number
  comentario: string
  fecha: string
  aprobada: boolean
}

export const ESPECIALIDADES = [
  'Perros',
  'Gatos',
  'Animales exóticos',
  'Reptiles',
  'Aves',
  'Urgencias',
  'Cirugía',
  'Dermatología',
  'Odontología',
  'Traumatología',
  'Oncología',
  'Cardiología',
  'Hospitalización',
] as const

export const CIUDADES_POR_COMUNIDAD: Record<string, string[]> = {
  'Andalucía':            ['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jerez de la Frontera', 'Málaga', 'Marbella', 'Sevilla'],
  'Aragón':               ['Zaragoza'],
  'Asturias':             ['Oviedo'],
  'Canarias':             ['Las Palmas', 'Santa Cruz de Tenerife'],
  'Cantabria':            ['Santander'],
  'Castilla y León':      ['Burgos', 'Salamanca', 'Valladolid'],
  'Castilla-La Mancha':   ['Albacete', 'Toledo'],
  'Cataluña':             ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
  'Comunidad de Madrid':  ['Madrid'],
  'C. Valenciana':        ['Alicante', 'Castellón', 'Elche', 'Valencia'],
  'Extremadura':          ['Badajoz'],
  'Galicia':              ['A Coruña', 'Vigo'],
  'Islas Baleares':       ['Palma'],
  'La Rioja':             ['Logrono'],
  'Región de Murcia':     ['Cartagena', 'Murcia'],
  'Navarra':              ['Pamplona'],
  'País Vasco':           ['Bilbao', 'San Sebastián', 'Vitoria'],
}

export const COMUNIDADES = Object.keys(CIUDADES_POR_COMUNIDAD)

export const COMUNIDAD_EMOJI: Record<string, string> = {
  'Andalucía':            '🌞',
  'Aragón':               '🏔️',
  'Asturias':             '🌿',
  'Canarias':             '🌴',
  'Cantabria':            '🌊',
  'Castilla y León':      '🏰',
  'Castilla-La Mancha':   '🌾',
  'Cataluña':             '🔴',
  'Comunidad de Madrid':  '🏙️',
  'C. Valenciana':        '🍊',
  'Extremadura':          '🦅',
  'Galicia':              '🌧️',
  'Islas Baleares':       '⛵',
  'La Rioja':             '🍷',
  'Región de Murcia':     '☀️',
  'Navarra':              '🏃',
  'País Vasco':           '🐟',
}

export const CIUDADES = [
  'A Coruña',
  'Albacete',
  'Alicante',
  'Almería',
  'Badajoz',
  'Barcelona',
  'Bilbao',
  'Burgos',
  'Cádiz',
  'Cartagena',
  'Castellón',
  'Córdoba',
  'Elche',
  'Girona',
  'Granada',
  'Huelva',
  'Jerez de la Frontera',
  'Las Palmas',
  'Lleida',
  'Logrono',
  'Madrid',
  'Málaga',
  'Marbella',
  'Murcia',
  'Oviedo',
  'Palma',
  'Pamplona',
  'Salamanca',
  'San Sebastián',
  'Santa Cruz de Tenerife',
  'Santander',
  'Sevilla',
  'Tarragona',
  'Toledo',
  'Valencia',
  'Valladolid',
  'Vigo',
  'Vitoria',
  'Zaragoza',
] as const

// Nombres de display para valores con ortografía simplificada en Airtable
export const CIUDAD_DISPLAY: Record<string, string> = {
  'A Coruña': 'A Coruña',
  'Logrono': 'Logroño',
  'Las Palmas': 'Las Palmas de Gran Canaria',
  'Vitoria': 'Vitoria-Gasteiz',
}
