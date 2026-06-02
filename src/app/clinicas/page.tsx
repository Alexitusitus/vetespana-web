import { Suspense } from 'react'
import type { Metadata } from 'next'
import { searchClinics } from '@/lib/search'
import { CIUDAD_DISPLAY } from '@/types/clinic'
import ClinicGrid from '@/components/ClinicGrid'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'

export const dynamic = 'force-dynamic' // depende de los filtros de la URL (searchParams)

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

  const filtradas = await searchClinics({
    ciudad: params.ciudad,
    comunidad: params.comunidad,
    especialidad: params.especialidad,
    urgencias: params.urgencias === '1',
    q: params.q,
    orden: params.orden,
  })

  const PAGE = 24
  // Query string de los filtros (sin offset) para que ClinicGrid pida más a la API.
  const apiQs = new URLSearchParams()
  if (params.ciudad) apiQs.set('ciudad', params.ciudad)
  if (params.comunidad) apiQs.set('comunidad', params.comunidad)
  if (params.especialidad) apiQs.set('especialidad', params.especialidad)
  if (params.urgencias === '1') apiQs.set('urgencias', '1')
  if (params.q) apiQs.set('q', params.q)
  if (params.orden) apiQs.set('orden', params.orden)

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
          initial={filtradas.slice(0, PAGE)}
          total={filtradas.length}
          query={apiQs.toString()}
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
