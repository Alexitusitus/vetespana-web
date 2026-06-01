import Airtable from 'airtable'
import { unstable_cache } from 'next/cache'
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

// ──────────────────────────────────────────────────────────────────────────
// Capa de datos cacheada
//
// IMPORTANTE: las páginas siguen con `export const dynamic = 'force-dynamic'`
// (no tocar — ver CLAUDE.md). Lo que cacheamos aquí son los DATOS de Airtable,
// no las páginas. Así una sola lectura a Airtable cada hora sirve a toda la web
// (home, listado, fichas, sitemap) en lugar de pedir las 1.299 clínicas en cada
// visita. Esto evita el límite de 5 req/seg de Airtable (que dejaba fichas en
// blanco) y hace las páginas mucho más rápidas.
//
// Los datos nuevos en Airtable aparecen como máximo en 1 h, y al instante en
// cada deploy (el deploy invalida la caché). Como el pipeline de añadir clínicas
// termina con un deploy, las clínicas nuevas se ven enseguida.
// ──────────────────────────────────────────────────────────────────────────

// Lectura cruda: trae TODAS las clínicas, ordenadas por Plan / Verificada / Valoración
async function fetchAllClinicsRaw(): Promise<Clinic[]> {
  if (!isConfigured()) return []
  const records = await base('Clínicas')
    .select({
      sort: [
        { field: 'Plan', direction: 'desc' },        // Premium primero
        { field: 'Verificada', direction: 'desc' },   // Verificadas después
        { field: 'Valoración media', direction: 'desc' },
      ],
    })
    .all()
  return records.map(recordToClinic)
}

// Versión cacheada (1 h). Toda la web lee de aquí.
const getAllClinicsCached = unstable_cache(fetchAllClinicsRaw, ['all-clinics'], {
  revalidate: 3600,
  tags: ['clinics'],
})

export async function getClinics(options?: {
  ciudad?: string
  comunidad?: string
  especialidad?: string
  urgencias?: boolean
  onlyPremium?: boolean
  limit?: number
}): Promise<Clinic[]> {
  let result = await getAllClinicsCached()

  if (options?.ciudad) {
    result = result.filter((c) => c.ciudad === options.ciudad)
  } else if (options?.comunidad) {
    const ciudades = new Set(CIUDADES_POR_COMUNIDAD[options.comunidad] ?? [])
    result = result.filter((c) => ciudades.has(c.ciudad))
  }
  if (options?.especialidad) {
    result = result.filter((c) => c.especialidades.includes(options.especialidad!))
  }
  if (options?.urgencias) {
    result = result.filter((c) => c.urgencias24h)
  }
  if (options?.onlyPremium) {
    result = result.filter((c) => c.plan === 'Premium')
  }

  // Ya viene ordenado por Plan / Verificada / Valoración desde la lectura cruda.
  return options?.limit ? result.slice(0, options.limit) : result
}

export async function getClinicBySlug(slug: string): Promise<Clinic | null> {
  const all = await getAllClinicsCached()
  return all.find((c) => c.slug === slug) ?? null
}

export async function getAllClinicSlugs(): Promise<string[]> {
  const all = await getAllClinicsCached()
  return all.map((c) => c.slug)
}

export async function getFeaturedClinics(): Promise<Clinic[]> {
  return getClinics({ limit: 6 })
}

// ── Reseñas ─────────────────────────────────────────────────────────────────

type RawReview = {
  id: string
  clinicaIds: string[]
  nombreUsuario: string
  puntuacion: number
  comentario: string
  fecha: string
}

// Trae todas las reseñas aprobadas (filtramos por clínica en JS porque
// ARRAYJOIN({Clínica}) devuelve nombres, no IDs).
async function fetchAllReviewsRaw(): Promise<RawReview[]> {
  if (!isConfigured()) return []
  const records = await base('Reseñas')
    .select({
      filterByFormula: `{Aprobada} = TRUE()`,
      sort: [{ field: 'Fecha', direction: 'desc' }],
    })
    .all()

  return records.map((r) => ({
    id: r.id,
    clinicaIds: Array.isArray(r.fields['Clínica']) ? (r.fields['Clínica'] as string[]) : [],
    nombreUsuario: (r.fields['Nombre usuario'] as string) ?? 'Anónimo',
    puntuacion: (r.fields['Puntuación'] as number) ?? 0,
    comentario: (r.fields['Comentario'] as string) ?? '',
    fecha: (r.fields['Fecha'] as string) ?? '',
  }))
}

// Reseñas cacheadas (10 min — para que una nueva aprobada aparezca pronto).
const getAllReviewsCached = unstable_cache(fetchAllReviewsRaw, ['all-reviews'], {
  revalidate: 600,
  tags: ['reviews'],
})

export async function getReviewsByClinic(clinicId: string): Promise<Review[]> {
  const all = await getAllReviewsCached()
  return all
    .filter((r) => r.clinicaIds.includes(clinicId))
    .map((r) => ({
      id: r.id,
      clinicaId: clinicId,
      nombreUsuario: r.nombreUsuario,
      puntuacion: r.puntuacion,
      comentario: r.comentario,
      fecha: r.fecha,
      aprobada: true,
    }))
}
