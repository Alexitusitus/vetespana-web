import { Suspense } from 'react'
import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { searchClinics } from '@/lib/search'
import { CIUDAD_DISPLAY } from '@/types/clinic'
import { ciudadSlug } from '@/lib/ciudad-slug'
import { cityFacts } from '@/lib/city-content'
import ClinicGrid from '@/components/ClinicGrid'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'
import CitySeoContent from '@/components/CitySeoContent'

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

// ¿Es una página de SOLO ciudad (sin ningún otro filtro)? Esas tienen ahora una
// URL limpia propia en /veterinarios/{slug} → se redirige allí (301/308).
function esSoloCiudad(p: Awaited<Props['searchParams']>): boolean {
  return !!p.ciudad && !p.comunidad && !p.especialidad && p.urgencias !== '1' && !p.q && !p.orden
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams

  // Nombre bonito (con tildes / nombre completo) para títulos y descripciones.
  // OJO: antes se usaba el valor crudo de Airtable → salía "Logrono" o "Las Palmas".
  const ciudadDisplay = params.ciudad ? CIUDAD_DISPLAY[params.ciudad] ?? params.ciudad : undefined
  const lugarDisplay = params.comunidad ?? ciudadDisplay ?? 'España'

  const parts: string[] = []
  if (params.comunidad) parts.push(`en ${params.comunidad}`)
  else if (ciudadDisplay) parts.push(`en ${ciudadDisplay}`)
  if (params.especialidad) parts.push(params.especialidad.toLowerCase())
  if (params.urgencias === '1') parts.push('urgencias 24h')

  const title = parts.length
    ? `Clínicas veterinarias ${parts.join(' · ')}`
    : 'Todas las clínicas veterinarias en España'

  let description = `Directorio de clínicas veterinarias en ${lugarDisplay}.`
  if (params.especialidad) description += ` Especialistas en ${params.especialidad.toLowerCase()} para perros, gatos y mascotas.`
  if (params.urgencias === '1') description += ` Clínicas con urgencias 24 horas disponibles.`
  description += ` Consulta teléfono, horario y dirección.`

  // Canónica: si hay filtros combinados, apunta a la URL más simple para evitar duplicados
  const baseUrl = 'https://www.vetespana.es'
  let canonical = `${baseUrl}/clinicas`
  if (params.comunidad && !params.ciudad && !params.especialidad && !params.urgencias) {
    canonical = `${baseUrl}/clinicas?comunidad=${encodeURIComponent(params.comunidad)}`
  }

  return {
    title,
    description,
    alternates: { canonical },
  }
}

export default async function ClinicasPage({ searchParams }: Props) {
  const params = await searchParams

  // Página de SOLO ciudad → redirige a la URL limpia /veterinarios/{slug}
  if (esSoloCiudad(params)) {
    permanentRedirect(`/veterinarios/${ciudadSlug(params.ciudad!)}`)
  }

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

  // En la página de ciudad "limpia" el H1 ataca la búsqueda real "veterinarios en {ciudad}".
  const esCiudadLimpia = !!params.ciudad && !params.especialidad
  const tituloH1 = esCiudadLimpia
    ? `Veterinarios en ${lugarDisplay}`
    : ['Clínicas veterinarias', params.especialidad ? `· ${params.especialidad}` : '', `en ${lugarDisplay}`]
        .filter(Boolean)
        .join(' ')

  const { count24h, topEsp } = cityFacts(filtradas)

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
        <h1 className="text-2xl font-bold text-gray-900">{tituloH1}</h1>
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
        <CitySeoContent
          lugarDisplay={lugarDisplay}
          total={filtradas.length}
          count24h={count24h}
          topEsp={topEsp}
          especialidad={params.especialidad}
        />
      )}
    </div>
  )
}
