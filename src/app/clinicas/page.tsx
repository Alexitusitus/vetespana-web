import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getClinics } from '@/lib/airtable'
import { CIUDAD_DISPLAY } from '@/types/clinic'
import ClinicGrid from '@/components/ClinicGrid'
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

// Suma simple de los caracteres del nombre del lugar → elige variante de texto.
// Así cada ciudad tiene una intro distinta (evita texto duplicado de cara a Google),
// pero siempre la misma para una ciudad dada (estable entre visitas).
function hashLugar(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % 997
  return h
}

// Texto SEO único para una página de ciudad / comunidad.
function textoSeoLugar(lugar: string, count: number, especialidad?: string): string[] {
  const n = count > 0 ? `${count}` : 'las mejores'
  const intros = [
    `¿Buscas un veterinario en ${lugar}? En VetEspaña reunimos ${n} clínicas veterinarias de ${lugar} para que compares y elijas con confianza.`,
    `En ${lugar} encontrarás ${n} clínicas veterinarias listadas en VetEspaña, con toda la información que necesitas para cuidar de tu mascota.`,
    `Hemos reunido ${n} clínicas veterinarias en ${lugar} para ayudarte a encontrar el centro que mejor se adapta a ti y a tu mascota.`,
    `Descubre ${n} clínicas veterinarias en ${lugar}: compara horarios, especialidades y opiniones antes de decidir.`,
  ]
  const intro = intros[hashLugar(lugar) % intros.length]

  const segundo = especialidad
    ? `Aquí ves los centros de ${lugar} con servicios de ${especialidad.toLowerCase()}. En cada ficha encontrarás el teléfono, la dirección, el horario y las opiniones de otros dueños de mascotas.`
    : `En cada ficha puedes ver fotos, horarios reales, teléfono, especialidades y reseñas. Filtra por urgencias 24h o por especialidad para encontrar exactamente lo que necesitas, y llama o escribe a la clínica directamente.`

  return [intro, segundo]
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

  // Descripción única por filtro activo
  let description = `Directorio de clínicas veterinarias en ${lugar}.`
  if (params.especialidad) description += ` Especialistas en ${params.especialidad.toLowerCase()} para perros, gatos y mascotas.`
  if (params.urgencias === '1') description += ` Clínicas con urgencias 24 horas disponibles.`
  description += ` Consulta teléfono, horario y dirección.`

  // Canónica: si hay filtros combinados, apunta a la URL más simple para evitar duplicados
  const baseUrl = 'https://www.vetespana.es'
  let canonical = `${baseUrl}/clinicas`
  if (params.comunidad && !params.ciudad && !params.especialidad && !params.urgencias) {
    canonical = `${baseUrl}/clinicas?comunidad=${encodeURIComponent(params.comunidad)}`
  } else if (params.ciudad && !params.especialidad && !params.urgencias) {
    canonical = `${baseUrl}/clinicas?ciudad=${encodeURIComponent(params.ciudad)}`
  }

  return {
    title,
    description,
    alternates: { canonical },
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
  // Nombre bonito para mostrar (p.ej. "Logroño" en vez del valor de Airtable "Logrono")
  const lugarDisplay = params.ciudad ? CIUDAD_DISPLAY[params.ciudad] ?? params.ciudad : lugar
  const tituloH1 = [
    'Clínicas veterinarias',
    params.especialidad ? `· ${params.especialidad}` : '',
    `en ${lugarDisplay}`,
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

      {/* Grid con scroll infinito (pinta 24 y carga más al bajar).
          Aligeramos los datos enviados al navegador: la tarjeta no usa la
          descripción larga ni la galería, así que no las mandamos. */}
      {filtradas.length > 0 ? (
        <ClinicGrid
          clinics={filtradas.map((c) => ({ ...c, descripcion: undefined, galeriaFotos: [] }))}
        />
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium text-gray-600 mb-2">Sin resultados</p>
          <p className="text-sm">Prueba a cambiar los filtros o ampliar la búsqueda</p>
        </div>
      )}

      {/* Texto SEO único por ciudad / comunidad (contenido propio para Google) */}
      {(params.ciudad || params.comunidad) && (
        <div className="mt-14 max-w-3xl text-sm text-gray-500 space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-base font-semibold text-gray-700">
            Clínicas veterinarias en {lugarDisplay}
          </h2>
          {textoSeoLugar(lugarDisplay, filtradas.length, params.especialidad).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  )
}
