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

  // Nombre bonito (con tildes / nombre completo) para títulos y descripciones.
  // OJO: antes se usaba el valor crudo de Airtable → salía "Logrono" o "Las Palmas".
  const ciudadDisplay = params.ciudad ? CIUDAD_DISPLAY[params.ciudad] ?? params.ciudad : undefined
  const lugarDisplay = params.comunidad ?? ciudadDisplay ?? 'España'

  let title: string
  let description: string

  // Página de ciudad "limpia" (sin especialidad ni urgencias): la orientamos a la
  // búsqueda real "veterinarios en {ciudad}" e incluimos el nº de clínicas (mejora CTR).
  if (ciudadDisplay && !params.especialidad && !params.urgencias) {
    const n = (await searchClinics({ ciudad: params.ciudad })).length
    title = `Veterinarios en ${ciudadDisplay}${n ? `: ${n} clínicas veterinarias` : ''}`
    description = `${n || 'Las mejores'} clínicas veterinarias en ${ciudadDisplay}: veterinario cercano, urgencias 24h, especialidades, horarios, teléfono y reseñas. Encuentra tu clínica de confianza.`
  } else {
    const parts: string[] = []
    if (params.comunidad) parts.push(`en ${params.comunidad}`)
    else if (ciudadDisplay) parts.push(`en ${ciudadDisplay}`)
    if (params.especialidad) parts.push(params.especialidad.toLowerCase())
    if (params.urgencias === '1') parts.push('urgencias 24h')

    title = parts.length
      ? `Clínicas veterinarias ${parts.join(' · ')}`
      : 'Todas las clínicas veterinarias en España'

    description = `Directorio de clínicas veterinarias en ${lugarDisplay}.`
    if (params.especialidad) description += ` Especialistas en ${params.especialidad.toLowerCase()} para perros, gatos y mascotas.`
    if (params.urgencias === '1') description += ` Clínicas con urgencias 24 horas disponibles.`
    description += ` Consulta teléfono, horario y dirección.`
  }

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

  // En la página de ciudad "limpia" el H1 ataca la búsqueda real "veterinarios en {ciudad}".
  const esCiudadLimpia = !!params.ciudad && !params.especialidad
  const tituloH1 = esCiudadLimpia
    ? `Veterinarios en ${lugarDisplay}`
    : ['Clínicas veterinarias', params.especialidad ? `· ${params.especialidad}` : '', `en ${lugarDisplay}`]
        .filter(Boolean)
        .join(' ')

  // ── Datos reales para enriquecer el contenido de la página de ciudad/comunidad ──
  const count24h = filtradas.filter((c) => c.urgencias24h).length
  // Especialidades más frecuentes (excluyendo las dos base Perros/Gatos para que aporte)
  const espCount = new Map<string, number>()
  for (const c of filtradas) {
    for (const e of c.especialidades) {
      if (e === 'Perros' || e === 'Gatos') continue
      espCount.set(e, (espCount.get(e) ?? 0) + 1)
    }
  }
  const topEsp = [...espCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([e]) => e)

  // FAQ con datos reales (también se emite como JSON-LD FAQPage abajo)
  const faq =
    params.ciudad || params.comunidad
      ? [
          {
            q: `¿Cuántas clínicas veterinarias hay en ${lugarDisplay}?`,
            a: `En VetEspaña tenemos ${filtradas.length} clínicas veterinarias en ${lugarDisplay} con su teléfono, dirección, horario y especialidades.`,
          },
          {
            q: `¿Hay veterinarios de urgencias 24h en ${lugarDisplay}?`,
            a:
              count24h > 0
                ? `Sí. En ${lugarDisplay} hay ${count24h} clínica${count24h !== 1 ? 's' : ''} veterinaria${count24h !== 1 ? 's' : ''} con urgencias 24 horas. Usa el filtro "Solo con urgencias 24h" para verlas.`
                : `De momento no tenemos listada ninguna clínica con urgencias 24h en ${lugarDisplay}. Puedes consultar las clínicas cercanas o las de tu comunidad.`,
          },
          ...(topEsp.length
            ? [
                {
                  q: `¿Qué especialidades veterinarias puedo encontrar en ${lugarDisplay}?`,
                  a: `Las clínicas de ${lugarDisplay} ofrecen especialidades como ${topEsp.join(', ')}, además de atención general para perros y gatos.`,
                },
              ]
            : []),
        ]
      : []

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
        <div className="mt-14 max-w-3xl text-sm text-gray-500 space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-base font-semibold text-gray-700">
            Clínicas veterinarias en {lugarDisplay}
          </h2>
          {textoSeoLugar(lugarDisplay, filtradas.length, params.especialidad).map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          {/* Datos reales de la zona (contenido único que ayuda a posicionar) */}
          {filtradas.length > 0 && (
            <p>
              De las <strong>{filtradas.length}</strong> clínicas veterinarias en {lugarDisplay},{' '}
              {count24h > 0 ? (
                <>
                  <strong>{count24h}</strong> ofrece{count24h !== 1 ? 'n' : ''} urgencias 24 horas.
                </>
              ) : (
                <>aún no tenemos ninguna con urgencias 24h listada.</>
              )}
              {topEsp.length > 0 && <> Especialidades destacadas en la zona: {topEsp.join(', ')}.</>}
            </p>
          )}

          {/* FAQ con datos reales — útil para el usuario y para Google */}
          {faq.length > 0 && (
            <div className="pt-4 space-y-4">
              <h2 className="text-base font-semibold text-gray-700">
                Preguntas frecuentes sobre veterinarios en {lugarDisplay}
              </h2>
              {faq.map((item, i) => (
                <div key={i}>
                  <h3 className="font-medium text-gray-700">{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Datos estructurados FAQPage (los mismos textos visibles de arriba) */}
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
            }),
          }}
        />
      )}
    </div>
  )
}
