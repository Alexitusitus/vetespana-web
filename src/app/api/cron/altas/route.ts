import { NextRequest, NextResponse } from 'next/server'
import { CIUDADES_POR_COMUNIDAD } from '@/types/clinic'

// Trabajo automático (Vercel Cron, 1×/día) que arregla las altas del formulario:
//  1) Pone la CIUDAD a las altas que la tienen vacía o "Otra ciudad",
//     geolocalizando su dirección con Google Places.
//  2) Borra los DUPLICADOS sin verificar cuando ya existe el mismo (mismo
//     teléfono) verificado → "solo se quedan las verificadas".
// Protegido con CRON_SECRET (Vercel lo envía en la cabecera Authorization).

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const AKEY = process.env.AIRTABLE_API_KEY
const GKEY = process.env.GOOGLE_PLACES_KEY || 'AIzaSyBvZjtoHaGPVi0Gn94ZTE-VabNvnB8MLKM'
const BASE = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/tblFth7uJutiWAjKL`
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const norm = (s: string) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '').trim()

// Teléfono normalizado a 9 dígitos (señal fiable de duplicado)
function phoneKey(t: string): string {
  let d = (t || '').replace(/\D/g, '')
  if (d.startsWith('0034')) d = d.slice(4)
  else if (d.startsWith('34') && d.length > 9) d = d.slice(2)
  d = d.replace(/^0+/, '')
  return d.length >= 9 ? d.slice(-9) : ''
}

// Comunidad de Google (admin_area_level_1) → clave de la web
const COM_MAP: Record<string, string> = {
  comunidaddemadrid: 'Comunidad de Madrid', cataluna: 'Cataluña', catalunya: 'Cataluña',
  andalucia: 'Andalucía', comunidadvalenciana: 'C. Valenciana', comunitatvalenciana: 'C. Valenciana',
  galicia: 'Galicia', castillayleon: 'Castilla y León', castillalamancha: 'Castilla-La Mancha',
  paisvasco: 'País Vasco', euskadi: 'País Vasco', canarias: 'Canarias', regiondemurcia: 'Región de Murcia',
  aragon: 'Aragón', extremadura: 'Extremadura', principadodeasturias: 'Asturias', asturias: 'Asturias',
  cantabria: 'Cantabria', islasbaleares: 'Islas Baleares', illesbalears: 'Islas Baleares',
  larioja: 'La Rioja', comunidadforaldenavarra: 'Navarra', navarra: 'Navarra',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compsToCity(comps: any[]): { ciudad: string; comunidad: string } {
  let ciudad = '', comunidad = ''
  for (const c of comps) {
    if (c.types.includes('locality')) ciudad = c.long_name
    if (!ciudad && c.types.includes('postal_town')) ciudad = c.long_name
    if (c.types.includes('administrative_area_level_1')) comunidad = COM_MAP[norm(c.long_name)] || ''
  }
  if (!ciudad) {
    const l2 = comps.find((c) => c.types.includes('administrative_area_level_2'))
    if (l2) ciudad = l2.long_name
  }
  return { ciudad, comunidad }
}

async function geocode(direccion: string, nombre: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${nombre} ${direccion}`.trim())
    const sj = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&language=es&region=es&key=${GKEY}`,
      { signal: AbortSignal.timeout(12000) }
    ).then((r) => r.json())
    const first = sj.results && sj.results[0]
    if (!first) return null
    await sleep(120)
    const dj = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${first.place_id}&fields=address_component&language=es&key=${GKEY}`,
      { signal: AbortSignal.timeout(12000) }
    ).then((r) => r.json())
    const comps = dj.result && dj.result.address_components
    if (!comps) return null
    return compsToCity(comps).ciudad || null
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function airtableAll(): Promise<any[]> {
  const headers = { Authorization: `Bearer ${AKEY}` }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = []
  let offset: string | null = null
  do {
    let url = `${BASE}?pageSize=100&fields%5B%5D=Nombre&fields%5B%5D=Ciudad&fields%5B%5D=Direcci%C3%B3n&fields%5B%5D=Tel%C3%A9fono&fields%5B%5D=Verificada&fields%5B%5D=Foto+portada`
    if (offset) url += `&offset=${encodeURIComponent(offset)}`
    const d = await fetch(url, { headers }).then((r) => r.json())
    if (d.error) throw new Error(JSON.stringify(d.error))
    out.push(...d.records)
    offset = d.offset
    await sleep(200)
  } while (offset)
  return out
}

export async function GET(req: NextRequest) {
  // Seguridad opcional: si existe CRON_SECRET, exige la cabecera (Vercel Cron la
  // envía sola). Si no se ha configurado, funciona igualmente (sin barrera).
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!AKEY) return NextResponse.json({ error: 'Sin AIRTABLE_API_KEY' }, { status: 500 })

  const records = await airtableAll()

  // Conjunto de ciudades canónicas de la web (para saber cuáles ya son válidas)
  const canon = new Set(Object.values(CIUDADES_POR_COMUNIDAD).flat().map((c) => norm(c)))

  // ── 1) Normalizar ciudad de altas con ciudad vacía / "Otra ciudad" ──
  const sinCiudad = records.filter((r) => {
    const c = norm(r.fields['Ciudad'])
    return !c || c === 'otraciudad'
  })
  const ciudadUpdates: { id: string; fields: { Ciudad: string } }[] = []
  for (const rec of sinCiudad.slice(0, 20)) {
    const ciudad = await geocode(rec.fields['Dirección'] || '', rec.fields['Nombre'] || '')
    if (ciudad) ciudadUpdates.push({ id: rec.id, fields: { Ciudad: ciudad } })
    await sleep(120)
  }

  // ── 2) Duplicados por teléfono: si hay verificada, borrar las NO verificadas ──
  const byPhone = new Map<string, typeof records>()
  for (const rec of records) {
    const pk = phoneKey(rec.fields['Teléfono'])
    if (!pk) continue
    if (!byPhone.has(pk)) byPhone.set(pk, [])
    byPhone.get(pk)!.push(rec)
  }
  const idsBorrar: string[] = []
  for (const grupo of byPhone.values()) {
    if (grupo.length < 2) continue
    const verificadas = grupo.filter((r) => r.fields['Verificada'] === true)
    const noVerif = grupo.filter((r) => r.fields['Verificada'] !== true)
    // Solo borramos NO verificadas cuando hay AL MENOS UNA verificada en el grupo.
    if (verificadas.length >= 1 && noVerif.length >= 1) {
      idsBorrar.push(...noVerif.map((r) => r.id))
    }
  }

  // ── Aplicar cambios en Airtable ──
  const headersW = { Authorization: `Bearer ${AKEY}`, 'Content-Type': 'application/json' }
  for (let i = 0; i < ciudadUpdates.length; i += 10) {
    const chunk = ciudadUpdates.slice(i, i + 10)
    await fetch(BASE, { method: 'PATCH', headers: headersW, body: JSON.stringify({ records: chunk, typecast: true }) })
    await sleep(250)
  }
  for (let i = 0; i < idsBorrar.length; i += 10) {
    const chunk = idsBorrar.slice(i, i + 10)
    const qs = chunk.map((id) => `records[]=${id}`).join('&')
    await fetch(`${BASE}?${qs}`, { method: 'DELETE', headers: { Authorization: `Bearer ${AKEY}` } })
    await sleep(250)
  }

  return NextResponse.json({
    ok: true,
    ciudadesCorregidas: ciudadUpdates.length,
    duplicadosBorrados: idsBorrar.length,
    revisados: records.length,
  })
}
