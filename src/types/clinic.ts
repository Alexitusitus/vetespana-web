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
  whatsapp?: string
  redesSociales?: string
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
  'Andalucía':            ['Algeciras', 'Almería', 'Cádiz', 'Chiclana de la Frontera', 'Córdoba', 'Dos Hermanas', 'El Puerto de Santa María', 'Estepona', 'Fuengirola', 'Granada', 'Huelva', 'Jerez de la Frontera', 'Linares', 'Málaga', 'Marbella', 'Mijas', 'Motril', 'Roquetas de Mar', 'San Fernando', 'Sevilla', 'Utrera', 'Vélez-Málaga'],
  'Aragón':               ['Calatayud', 'Zaragoza'],
  'Asturias':             ['Avilés', 'Gijón', 'Oviedo'],
  'Canarias':             ['Arona', 'Las Palmas', 'San Cristóbal de La Laguna', 'Santa Cruz de Tenerife', 'Telde'],
  'Cantabria':            ['Santander', 'Torrelavega'],
  'Castilla y León':      ['Aranda de Duero', 'Burgos', 'Miranda de Ebro', 'Salamanca', 'Valladolid'],
  'Castilla-La Mancha':   ['Albacete', 'Talavera de la Reina', 'Toledo'],
  'Cataluña':             ['Barcelona', 'Castelldefels', 'Cornellà de Llobregat', 'El Prat de Llobregat', 'Figueres', 'Girona', 'Granollers', 'Lleida', 'Manresa', 'Reus', 'Rubí', 'Sant Boi de Llobregat', 'Sant Cugat del Vallès', 'Santa Coloma de Gramenet', 'Tarragona', 'Viladecans'],
  'Comunidad de Madrid':  ['Alcobendas', 'Aranjuez', 'Collado Villalba', 'Coslada', 'Fuenlabrada', 'Las Rozas', 'Madrid', 'Majadahonda', 'Parla', 'Pozuelo de Alarcón', 'Rivas-Vaciamadrid', 'San Sebastián de los Reyes', 'Torrejón de Ardoz', 'Valdemoro'],
  'C. Valenciana':        ['Alcoy', 'Alicante', 'Alzira', 'Benidorm', 'Castellón', 'Elche', 'Elda', 'Gandia', 'Orihuela', 'Torrevieja', 'Valencia', 'Vila-real'],
  'Extremadura':          ['Badajoz', 'Don Benito', 'Plasencia'],
  'Galicia':              ['A Coruña', 'Ferrol', 'Santiago de Compostela', 'Vigo'],
  'Islas Baleares':       ['Eivissa', 'Manacor', 'Palma'],
  'La Rioja':             ['Calahorra', 'Logrono'],
  'Región de Murcia':     ['Cartagena', 'Lorca', 'Molina de Segura', 'Murcia', 'Yecla'],
  'Navarra':              ['Pamplona', 'Tudela'],
  'País Vasco':           ['Barakaldo', 'Bilbao', 'Getxo', 'Irun', 'San Sebastián', 'Vitoria'],
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

// Lista plana de todas las ciudades, derivada del mapa por comunidad
// (se mantiene siempre sincronizada con CIUDADES_POR_COMUNIDAD)
export const CIUDADES: readonly string[] = Object.values(CIUDADES_POR_COMUNIDAD)
  .flat()
  .sort((a, b) => a.localeCompare(b, 'es'))

// Nombres de display para valores con ortografía simplificada en Airtable
export const CIUDAD_DISPLAY: Record<string, string> = {
  'A Coruña': 'A Coruña',
  'Logrono': 'Logroño',
  'Las Palmas': 'Las Palmas de Gran Canaria',
  'Vitoria': 'Vitoria-Gasteiz',
}
