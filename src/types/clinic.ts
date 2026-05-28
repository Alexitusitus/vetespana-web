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
