import { NextRequest, NextResponse } from 'next/server'
import { searchClinics } from '@/lib/search'

// API de listado por lotes: el navegador pide 24, y al hacer scroll pide las
// siguientes (offset). Evita mandar las miles de clínicas de golpe.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const all = await searchClinics({
    ciudad: sp.get('ciudad') ?? undefined,
    comunidad: sp.get('comunidad') ?? undefined,
    especialidad: sp.get('especialidad') ?? undefined,
    urgencias: sp.get('urgencias') === '1',
    q: sp.get('q') ?? undefined,
    orden: sp.get('orden') ?? undefined,
  })

  const offset = Math.max(0, parseInt(sp.get('offset') ?? '0', 10) || 0)
  const limit = Math.min(48, Math.max(1, parseInt(sp.get('limit') ?? '24', 10) || 24))
  const items = all.slice(offset, offset + limit)

  return NextResponse.json(
    { items, total: all.length },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  )
}
