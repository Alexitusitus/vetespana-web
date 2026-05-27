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
  'Barcelona',
  'Madrid',
  'Valencia',
  'Sevilla',
  'Zaragoza',
  'Málaga',
  'Murcia',
  'Palma',
  'Bilbao',
  'Alicante',
] as const
