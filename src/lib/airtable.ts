import Airtable from 'airtable'
import type { Clinic, Review, ClinicPhoto } from '@/types/clinic'
import { CIUDADES_POR_COMUNIDAD } from '@/types/clinic'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!)

// Genera slug SEO-friendly desde el nombre de la clínica
export function toSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function parseAttachments(field: unknown): ClinicPhoto[] {
  if (!Array.isArray(field)) return []
  return field.map((a: Record<string, unknown>) => ({
    id: String(a.id ?? ''),
    url: String(a.url ?? ''),
    filename: String(a.filename ?? ''),
    width: typeof a.width === 'number' ? a.width : undefined,
    height: typeof a.height === 'number' ? a.height : undefined,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recordToClinic(record: any): Clinic {
  const f = record.fields
  const galeria = parseAttachments(f['Galería fotos'])
  const portadaArr = parseAttachments(f['Foto portada'])
  return {
    id: record.id,
    slug: toSlug(f['Nombre'] ?? ''),
    nombre: f['Nombre'] ?? '',
    ciudad: f['Ciudad'] ?? '',
    direccion: f['Dirección'] ?? '',
    telefono: f['Teléfono'] ?? '',
    web: f['Web'] ?? undefined,
    email: f['Email'] ?? undefined,
    whatsapp: f['WhatsApp'] ?? undefined,
    redesSociales: f['Redes sociales'] ?? undefined,
    especialidades: f['Especialidades'] ?? [],
    horario: f['Horario'] ?? undefined,
    urgencias24h: f['Urgencias 24h'] === true,
    fotoPortada: portadaArr[0] ?? galeria[0] ?? undefined,
    galeriaFotos: galeria,
    descripcion: f['Descripción'] ?? undefined,
    plan: f['Plan'] ?? 'Gratis',
    valoracionMedia: f['Valoración media'] ?? undefined,
    verificada: f['Verificada'] === true,
  }
}

// Guard: si no hay API key configurada, devuelve array vacío en vez de error 500
function isConfigured(): boolean {
  const key = process.env.AIRTABLE_API_KEY
  return Boolean(key && key !== 'tu_token_aqui' && key.length > 10)
}

export async function getClinics(options?: {
  ciudad?: string
  comunidad?: string
  especialidad?: string
  urgencias?: boolean
  onlyPremium?: boolean
  limit?: number
}): Promise<Clinic[]> {
  if (!isConfigured()) return []
  const filterParts: string[] = []

  if (options?.ciudad) {
    filterParts.push(`{Ciudad} = "${options.ciudad}"`)
  } else if (options?.comunidad) {
    const ciudades = CIUDADES_POR_COMUNIDAD[options.comunidad] ?? []
    if (ciudades.length > 0) {
      const orParts = ciudades.map((c) => `{Ciudad} = "${c}"`).join(', ')
      filterParts.push(`OR(${orParts})`)
    }
  }
  if (options?.especialidad) {
    filterParts.push(`FIND("${options.especialidad}", ARRAYJOIN({Especialidades})) > 0`)
  }
  if (options?.urgencias) {
    filterParts.push(`{Urgencias 24h} = TRUE()`)
  }
  if (options?.onlyPremium) {
    filterParts.push(`{Plan} = "Premium"`)
  }

  const filterFormula =
    filterParts.length > 1
      ? `AND(${filterParts.join(', ')})`
      : filterParts.length === 1
      ? filterParts[0]
      : undefined

  const records = await base('Clínicas')
    .select({
      ...(filterFormula ? { filterByFormula: filterFormula } : {}),
      sort: [
        { field: 'Plan', direction: 'desc' },       // Premium primero
        { field: 'Verificada', direction: 'desc' },  // Verificadas después
        { field: 'Valoración media', direction: 'desc' },
      ],
      maxRecords: options?.limit ?? 2000,
    })
    .all()

  return records.map(recordToClinic)
}

export async function getClinicBySlug(slug: string): Promise<Clinic | null> {
  if (!isConfigured()) return null
  // Traemos todas y filtramos por slug (Airtable no tiene búsqueda por slug nativa)
  const records = await base('Clínicas')
    .select({})
    .all()

  const match = records.find((r) => toSlug(r.fields['Nombre'] as string) === slug)
  return match ? recordToClinic(match) : null
}

export async function getAllClinicSlugs(): Promise<string[]> {
  if (!isConfigured()) return []
  const records = await base('Clínicas')
    .select({ fields: ['Nombre'] })
    .all()
  return records.map((r) => toSlug(r.fields['Nombre'] as string))
}

export async function getReviewsByClinic(clinicId: string): Promise<Review[]> {
  if (!isConfigured()) return []
  const records = await base('Reseñas')
    .select({
      filterByFormula: `{Aprobada} = TRUE()`,
      sort: [{ field: 'Fecha', direction: 'desc' }],
    })
    .all()

  // Filtramos en JS porque ARRAYJOIN({Clínica}) devuelve nombres, no IDs
  return records
    .filter((r) => {
      const clinica = r.fields['Clínica'] as string[] | undefined
      return Array.isArray(clinica) && clinica.includes(clinicId)
    })
    .map((r) => ({
      id: r.id,
      clinicaId: clinicId,
      nombreUsuario: (r.fields['Nombre usuario'] as string) ?? 'Anónimo',
      puntuacion: (r.fields['Puntuación'] as number) ?? 0,
      comentario: (r.fields['Comentario'] as string) ?? '',
      fecha: (r.fields['Fecha'] as string) ?? '',
      aprobada: true,
    }))
}

export async function getFeaturedClinics(): Promise<Clinic[]> {
  return getClinics({ limit: 6 })
}
