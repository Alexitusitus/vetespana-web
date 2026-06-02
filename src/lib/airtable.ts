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

// Registro completo de Airtable → Clinic con TODOS los campos (para la ficha).
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

// Formato COMPACTO de tarjeta (claves cortas, sin slug ni objetos anidados) para
// que el array cacheado quepa bajo el límite de 2MB de la Data Cache de Vercel.
type Card = {
  id: string
  n: string   // nombre
  c: string   // ciudad
  d: string   // dirección
  t: string   // teléfono
  h?: string  // horario
  e: string[] // especialidades
  u: boolean  // urgencias 24h
  p: string   // plan
  v: boolean  // verificada
  vm?: number // valoración media
  img?: string // url foto portada
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recordToCard(record: any): Card {
  const f = record.fields
  const fp = parseAttachments(f['Foto portada'])[0]
  return {
    id: record.id,
    n: f['Nombre'] ?? '',
    c: f['Ciudad'] ?? '',
    d: f['Dirección'] ?? '',
    t: f['Teléfono'] ?? '',
    h: f['Horario'] ?? undefined,
    e: f['Especialidades'] ?? [],
    u: f['Urgencias 24h'] === true,
    p: f['Plan'] ?? 'Gratis',
    v: f['Verificada'] === true,
    vm: f['Valoración media'] ?? undefined,
    img: fp ? fp.url : undefined,
  }
}

// Card compacta → Clinic (lo que esperan los componentes). Barato, en memoria.
function cardToClinic(card: Card): Clinic {
  return {
    id: card.id,
    slug: toSlug(card.n),
    nombre: card.n,
    ciudad: card.c,
    direccion: card.d,
    telefono: card.t,
    web: undefined,
    email: undefined,
    whatsapp: undefined,
    redesSociales: undefined,
    especialidades: card.e,
    horario: card.h,
    urgencias24h: card.u,
    fotoPortada: card.img ? { id: '', url: card.img, filename: '' } : undefined,
    galeriaFotos: [],
    descripcion: undefined,
    plan: (card.p as Clinic['plan']) ?? 'Gratis',
    valoracionMedia: card.vm,
    verificada: card.v,
  }
}

// Guard: si no hay API key configurada, devuelve array vacío en vez de error 500
function isConfigured(): boolean {
  const key = process.env.AIRTABLE_API_KEY
  return Boolean(key && key !== 'tu_token_aqui' && key.length > 10)
}

// Reintenta una llamada a Airtable ante cortes de red transitorios (ECONNRESET,
// timeouts…) para que un blip no rompa el build ni una página.
async function withRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, 600 * (i + 1)))
    }
  }
  throw lastErr
}

// ──────────────────────────────────────────────────────────────────────────
// Capa de datos cacheada
//
// IMPORTANTE: la Data Cache de Vercel/Next NO admite entradas de más de 2 MB.
// La lista COMPLETA de clínicas pesa ~5 MB → no se podía cachear y la web
// re-pedía las 2.441 clínicas a Airtable en CADA visita (≈3 s por página).
// Solución: para los LISTADOS cacheamos solo los campos de la tarjeta (~1,5 MB,
// sí cabe). Para la FICHA, que necesita todos los datos, traemos esa clínica
// concreta sola (1 petición) y la cacheamos por su id.
// ──────────────────────────────────────────────────────────────────────────

const CARD_FIELDS = [
  'Nombre', 'Ciudad', 'Dirección', 'Teléfono', 'Horario', 'Especialidades',
  'Urgencias 24h', 'Foto portada', 'Plan', 'Valoración media', 'Verificada',
]

// Lectura ligera (tarjetas) de TODAS las clínicas, ordenadas.
async function fetchCardsRaw(): Promise<Card[]> {
  if (!isConfigured()) return []
  const records = await withRetry(() =>
    base('Clínicas')
      .select({
        fields: CARD_FIELDS,
        sort: [
          { field: 'Plan', direction: 'desc' },
          { field: 'Verificada', direction: 'desc' },
          { field: 'Valoración media', direction: 'desc' },
        ],
      })
      .all()
  )
  return records.map(recordToCard)
}

// Versión cacheada (1 h). La leen home, listado y sitemap.
const getCardsCached = unstable_cache(fetchCardsRaw, ['clinic-cards'], {
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
  let cards = await getCardsCached()

  if (options?.ciudad) {
    cards = cards.filter((c) => c.c === options.ciudad)
  } else if (options?.comunidad) {
    const ciudades = new Set(CIUDADES_POR_COMUNIDAD[options.comunidad] ?? [])
    cards = cards.filter((c) => ciudades.has(c.c))
  }
  if (options?.especialidad) {
    cards = cards.filter((c) => c.e.includes(options.especialidad!))
  }
  if (options?.urgencias) {
    cards = cards.filter((c) => c.u)
  }
  if (options?.onlyPremium) {
    cards = cards.filter((c) => c.p === 'Premium')
  }

  const limited = options?.limit ? cards.slice(0, options.limit) : cards
  return limited.map(cardToClinic)
}

// Trae UNA clínica completa por su id de Airtable (cacheada por id).
function getFullClinicById(id: string): Promise<Clinic | null> {
  return unstable_cache(
    async () => {
      if (!isConfigured()) return null
      try {
        const rec = await withRetry(() => base('Clínicas').find(id))
        return recordToClinic(rec)
      } catch {
        return null
      }
    },
    ['clinic-full', id],
    { revalidate: 3600, tags: ['clinics'] }
  )()
}

export async function getClinicBySlug(slug: string): Promise<Clinic | null> {
  const cards = await getCardsCached()
  const card = cards.find((c) => toSlug(c.n) === slug)
  if (!card) return null
  // Trae los datos completos (descripción, web, email, galería…) solo de esta.
  return getFullClinicById(card.id)
}

export async function getAllClinicSlugs(): Promise<string[]> {
  const cards = await getCardsCached()
  return cards.map((c) => toSlug(c.n))
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

async function fetchAllReviewsRaw(): Promise<RawReview[]> {
  if (!isConfigured()) return []
  const records = await withRetry(() =>
    base('Reseñas')
      .select({
        filterByFormula: `{Aprobada} = TRUE()`,
        sort: [{ field: 'Fecha', direction: 'desc' }],
      })
      .all()
  )

  return records.map((r) => ({
    id: r.id,
    clinicaIds: Array.isArray(r.fields['Clínica']) ? (r.fields['Clínica'] as string[]) : [],
    nombreUsuario: (r.fields['Nombre usuario'] as string) ?? 'Anónimo',
    puntuacion: (r.fields['Puntuación'] as number) ?? 0,
    comentario: (r.fields['Comentario'] as string) ?? '',
    fecha: (r.fields['Fecha'] as string) ?? '',
  }))
}

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
