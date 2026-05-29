import { NextResponse } from 'next/server'
import { getClinics } from '@/lib/airtable'
import coords from '@/data/clinic-coords.json'

export const dynamic = 'force-dynamic'

const COORDS = coords as unknown as Record<string, [number, number]>

// Distancia en km entre dos puntos (fórmula de Haversine)
function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Coordenadas no válidas' }, { status: 400 })
  }

  const clinicas = await getClinics()
  const conDistancia = clinicas
    .map((c) => {
      const co = COORDS[c.id]
      if (!co) return null
      return { clinic: c, distanciaKm: distanciaKm(lat, lng, co[0], co[1]) }
    })
    .filter((x): x is { clinic: (typeof clinicas)[number]; distanciaKm: number } => x !== null)
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .slice(0, 30)
    .map((x) => ({ ...x.clinic, distanciaKm: Math.round(x.distanciaKm * 10) / 10 }))

  return NextResponse.json({ resultados: conDistancia, total: conDistancia.length })
}
