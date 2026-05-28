import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getClinics } from '@/lib/airtable'
import ClinicCard from '@/components/ClinicCard'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'

export const dynamic = 'force-dynamic' // SSR real en cada petición — datos siempre frescos de Airtable

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

// Devuelve true si el campo contiene la palabra (sin tildes) o si hay una palabra
// en el campo con distancia de edición ≤ 1 (para palabras > 3 letras)
function fuzzyField(field: string, word: string): boolean {
  const f = norm(field)
  if (f.includes(word)) return true
  if (word.length > 3) {
    const tokens = f.split(/[\s,.\-/]+/)
    return tokens.some(t => Math.abs(t.length - word.length) <= 1 && levenshtein(t, word) <= 1)
  }
  return false
}

interface Props {
  searchParams: Promise<{
    ciudad?: string
    comunidad?: string
    especialidad?: string
    urgencias?: string
    q?: string
    orden?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const parts: string[] = []
  if (params.comunidad) parts.push(`en ${params.comunidad}`)
  else if (params.ciudad) parts.push(`en ${params.ciudad}`)
  if (params.especialidad) parts.push(params.especialidad.toLowerCase())
  if (params.urgencias === '1') parts.push('urgencias 24h')

  const title = parts.length
    ? `Clínicas veterinarias ${parts.join(' · ')}`
    : 'Todas las clínicas veterinarias en España'

  const lugar = params.comunidad ?? params.ciudad ?? 'España'
  return {
    title,
    description: `Directorio de clínicas veterinarias en ${lugar}. Filtra por especialidad, urgencias y valoración.`,
  }
}

export default async function ClinicasPage({ searchParams }: Props) {
  const params = await searchParams

  const clinicas = await getClinics({
    ciudad: params.ciudad,
    comunidad: params.comunidad,
    especialidad: params.especialidad,
    urgencias: params.urgencias === '1',
  })

  // Filtro por búsqueda libre — tolerante a tildes y a 1 typo por palabra
  const q = params.q?.trim() ?? ''
  const queryWords = norm(q).split(/\s+/).filter(Boolean)
  const filtradas = queryWords.length
    ? clinicas.filter((c) =>
        queryWords.every((word) =>
          fuzzyField(c.nombre, word) ||
          fuzzyField(c.ciudad, word) ||
          c.especialidades.some((e) => fuzzyField(e, word)) ||
          fuzzyField(c.direccion ?? '', word) ||
          fuzzyField(c.descripcion ?? '', word)
        )
      )
    : clinicas

  // Orden
  if (params.orden === 'nombre') {
    filtradas.sort((a, b) => a.nombre.localeCompare(b.nombre))
  } else if (params.orden === 'valoracion') {
    filtradas.sort((a, b) => (b.valoracionMedia ?? 0) - (a.valoracionMedia ?? 0))
  }

  const lugar = params.ciudad ?? params.comunidad ?? 'España'
  const tituloH1 = [
    'Clínicas veterinarias',
    params.especialidad ? `· ${params.especialidad}` : '',
    `en ${lugar}`,
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
