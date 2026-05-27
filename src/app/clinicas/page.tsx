import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getClinics } from '@/lib/airtable'
import ClinicCard from '@/components/ClinicCard'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'

export const dynamic = 'force-dynamic' // SSR real en cada petición — datos siempre frescos de Airtable

interface Props {
  searchParams: Promise<{
    ciudad?: string
    especialidad?: string
    urgencias?: string
    q?: string
    orden?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const parts: string[] = []
  if (params.ciudad) parts.push(`en ${params.ciudad}`)
  if (params.especialidad) parts.push(params.especialidad.toLowerCase())
  if (params.urgencias === '1') parts.push('urgencias 24h')

  const title = parts.length
    ? `Clínicas veterinarias ${parts.join(' · ')}`
    : 'Todas las clínicas veterinarias en España'

  return {
    title,
    description: `Directorio de clínicas veterinarias${params.ciudad ? ` en ${params.ciudad}` : ' en España'}. Filtra por especialidad, urgencias y valoración.`,
  }
}

export default async function ClinicasPage({ searchParams }: Props) {
  const params = await searchParams

  const clinicas = await getClinics({
    ciudad: params.ciudad,
    especialidad: params.especialidad,
    urgencias: params.urgencias === '1',
  })

  // Filtro por búsqueda libre (nombre)
  const q = params.q?.toLowerCase() ?? ''
  const filtradas = q
    ? clinicas.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          c.especialidades.some((e) => e.toLowerCase().includes(q))
      )
    : clinicas

  // Orden
  if (params.orden === 'nombre') {
    filtradas.sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  const tituloH1 = [
    'Clínicas veterinarias',
    params.especialidad ? `· ${params.especialidad}` : '',
    params.ciudad ? `en ${params.ciudad}` : 'en España',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Búsqueda */}
      <div className="mb-6">
        <Suspense>
          <SearchBar initialCiudad={params.ciudad ?? ''} initialQuery={params.q ?? ''} />
        </Suspense>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <Suspense>
          <FilterBar />
        </Suspense>
      </div>

      {/* Título SEO */}
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">{tituloH1}</h1>
        <span className="text-sm text-gray-500">{filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Grid */}
      {filtradas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtradas.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium text-gray-600 mb-2">Sin resultados</p>
          <p className="text-sm">Prueba a cambiar los filtros o ampliar la búsqueda</p>
        </div>
      )}
    </div>
  )
}
