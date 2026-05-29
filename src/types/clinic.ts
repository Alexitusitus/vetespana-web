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

// Emoji para cada especialidad (se usa en los filtros y chips)
export const ESPECIALIDAD_EMOJI: Record<string, string> = {
  'Perros':            '🐶',
  'Gatos':             '🐱',
  'Animales exóticos': '🦎',
  'Reptiles':          '🐢',
  'Aves':              '🦜',
  'Urgencias':         '🚨',
  'Cirugía':           '🔪',
  'Dermatología':      '🧴',
  'Odontología':       '🦷',
  'Traumatología':     '🦴',
  'Oncología':         '🎗️',
  'Cardiología':       '❤️',
  'Hospitalización':   '🏥',
}

export const CIUDADES_POR_COMUNIDAD: Record<string, string[]> = {
  'Andalucía':            ['Adra', 'Alcalá de Guadaíra', 'Algeciras', 'Almería', 'Almuñécar', 'Ayamonte', 'Baza', 'Cádiz', 'Chiclana de la Frontera', 'Córdoba', 'Dos Hermanas', 'Écija', 'El Ejido', 'El Puerto de Santa María', 'Estepona', 'Fuengirola', 'Granada', 'Guadix', 'Huelva', 'Isla Cristina', 'Jerez de la Frontera', 'La Línea de la Concepción', 'Lebrija', 'Lepe', 'Linares', 'Loja', 'Lucena', 'Mairena del Aljarafe', 'Málaga', 'Marbella', 'Mijas', 'Montilla', 'Morón de la Frontera', 'Motril', 'Priego de Córdoba', 'Puente Genil', 'Roquetas de Mar', 'Ronda', 'San Fernando', 'Sanlúcar de Barrameda', 'Sevilla', 'Úbeda', 'Utrera', 'Vélez-Málaga'],
  'Aragón':               ['Alcañiz', 'Barbastro', 'Calatayud', 'Fraga', 'Huesca', 'Monzón', 'Teruel', 'Zaragoza'],
  'Asturias':             ['Avilés', 'Gijón', 'Langreo', 'Mieres', 'Oviedo', 'Siero'],
  'Canarias':             ['Adeje', 'Arona', 'Arrecife', 'Gáldar', 'Ingenio', 'La Orotava', 'Las Palmas', 'Los Realejos', 'Puerto del Rosario', 'San Cristóbal de La Laguna', 'Santa Cruz de Tenerife', 'Telde'],
  'Cantabria':            ['Camargo', 'Castro-Urdiales', 'Piélagos', 'Santander', 'Torrelavega'],
  'Castilla y León':      ['Aranda de Duero', 'Ávila', 'Burgos', 'Medina del Campo', 'Miranda de Ebro', 'Palencia', 'Ponferrada', 'Salamanca', 'Segovia', 'Soria', 'Valladolid', 'Zamora'],
  'Castilla-La Mancha':   ['Albacete', 'Alcázar de San Juan', 'Almansa', 'Azuqueca de Henares', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Hellín', 'Manzanares', 'Talavera de la Reina', 'Toledo', 'Tomelloso', 'Valdepeñas', 'Villarrobledo'],
  'Cataluña':             ['Amposta', 'Barcelona', 'Blanes', 'Cambrils', 'Castelldefels', 'Cerdanyola del Vallès', 'Cornellà de Llobregat', 'El Masnou', 'El Prat de Llobregat', 'El Vendrell', 'Esplugues de Llobregat', 'Figueres', 'Gavà', 'Girona', 'Granollers', 'Igualada', 'Lleida', 'Lloret de Mar', 'Manresa', 'Martorell', 'Mollet del Vallès', 'Olot', 'Premià de Mar', 'Reus', 'Ripollet', 'Rubí', 'Salou', 'Salt', 'Sant Boi de Llobregat', 'Sant Cugat del Vallès', 'Sant Feliu de Llobregat', 'Santa Coloma de Gramenet', 'Tarragona', 'Tortosa', 'Vic', 'Viladecans', 'Vilafranca del Penedès', 'Vilanova i la Geltrú'],
  'Comunidad de Madrid':  ['Alcalá de Henares', 'Alcobendas', 'Alcorcón', 'Algete', 'Aranjuez', 'Arganda del Rey', 'Boadilla del Monte', 'Ciempozuelos', 'Collado Villalba', 'Coslada', 'Fuenlabrada', 'Getafe', 'Las Rozas', 'Leganés', 'Madrid', 'Majadahonda', 'Mejorada del Campo', 'Móstoles', 'Navalcarnero', 'Parla', 'Pinto', 'Pozuelo de Alarcón', 'Rivas-Vaciamadrid', 'San Sebastián de los Reyes', 'Torrejón de Ardoz', 'Tres Cantos', 'Valdemoro', 'Villaviciosa de Odón'],
  'C. Valenciana':        ['Alcoy', 'Aldaia', 'Alicante', 'Almassora', 'Alzira', 'Benidorm', 'Borriana', 'Burjassot', 'Calp', 'Castellón', 'Catarroja', 'Crevillent', 'Cullera', 'Dénia', 'El Campello', 'Elche', 'Elda', 'Gandia', 'La Vall d\'Uixó', 'Manises', 'Mislata', 'Novelda', 'Ontinyent', 'Orihuela', 'Paiporta', 'Paterna', 'Petrer', 'San Vicente del Raspeig', 'Santa Pola', 'Torrent', 'Torrevieja', 'Valencia', 'Vila-real', 'Villena', 'Vinaròs', 'Xàbia', 'Xàtiva', 'Xirivella'],
  'Extremadura':          ['Almendralejo', 'Badajoz', 'Don Benito', 'Mérida', 'Navalmoral de la Mata', 'Plasencia', 'Villanueva de la Serena', 'Zafra'],
  'Galicia':              ['A Coruña', 'Carballo', 'Ferrol', 'Lalín', 'Lugo', 'Monforte de Lemos', 'Narón', 'Oleiros', 'Ourense', 'Pontevedra', 'Redondela', 'Ribeira', 'Santiago de Compostela', 'Vigo', 'Vilagarcía de Arousa'],
  'Islas Baleares':       ['Calvià', 'Eivissa', 'Inca', 'Llucmajor', 'Manacor', 'Maó', 'Marratxí', 'Palma'],
  'La Rioja':             ['Arnedo', 'Calahorra', 'Haro', 'Lardero', 'Logrono'],
  'Región de Murcia':     ['Alcantarilla', 'Archena', 'Caravaca de la Cruz', 'Cartagena', 'Cieza', 'Jumilla', 'Las Torres de Cotillas', 'Lorca', 'Mazarrón', 'Molina de Segura', 'Murcia', 'San Javier', 'Torre-Pacheco', 'Totana', 'Yecla'],
  'Navarra':              ['Barañáin', 'Burlada', 'Estella', 'Pamplona', 'Tafalla', 'Tudela'],
  'País Vasco':           ['Barakaldo', 'Basauri', 'Bilbao', 'Durango', 'Errenteria', 'Getxo', 'Hernani', 'Irun', 'Llodio', 'Mondragón', 'San Sebastián', 'Santurtzi', 'Sestao', 'Tolosa', 'Vitoria', 'Zarautz'],
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
