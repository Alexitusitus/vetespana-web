import Airtable from 'airtable'
import type { Clinic, Review, ClinicPhoto } from '@/types/clinic'

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
  const configured = Boolean(key && key !== 'tu_token_aqui' && key.length > 10)
  console.log('[airtable] isConfigured:', configured, '| key length:', key?.length ?? 0, '| baseId:', process.env.AIRTABLE_BASE_ID)
  return configured
}

export async function getClinics(options?: {
  ciudad?: string
  especialidad?: string
  urgencias?: boolean
  onlyPremium?: boolean
  limit?: number
}): Promise<Clinic[]> {
  if (!isConfigured()) {
    console.log('[airtable] getClinics: not configured, returning []')
    return []
  }
  const filterParts: string[] = []

  if (options?.ciudad) {
    filterParts.push(`{Ciudad} = "${options.ciudad}"`)
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
        { field: 'Plan', direction: 'desc' }, // Premium primero
        { field: 'Valoración media', direction: 'desc' },
      ],
      maxRecords: options?.limit ?? 200,
    })
    .all()

  console.log('[airtable] getClinics: got', records.length, 'records')
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
      filterByFormula: `AND({Aprobada} = TRUE(), FIND("${clinicId}", ARRAYJOIN({Clínica})) > 0)`,
      sort: [{ field: 'Fecha', direction: 'desc' }],
    })
    .all()

  return records.map((r) => ({
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
