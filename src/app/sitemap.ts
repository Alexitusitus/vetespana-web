import type { MetadataRoute } from 'next'
import { getAllClinicSlugs } from '@/lib/airtable'
import { CIUDADES_POR_COMUNIDAD } from '@/types/clinic'
import { ciudadSlug } from '@/lib/ciudad-slug'
import { GUIAS } from '@/data/guias'

// Dinámico: se genera bajo demanda (Google lo pide de vez en cuando). Así no
// depende de Airtable durante el build. Usa la caché de datos, o sea que es rápido.
export const dynamic = 'force-dynamic'

// Fecha de la última actualización significativa del contenido del directorio
// (alta de clínicas/ciudades, cambios de copy, etc.). Se usa como `lastModified`
// estable en el sitemap. IMPORTANTE: usar una fecha FIJA, no `new Date()`: si cada
// rastreo dijera "modificada ahora mismo", Google acaba ignorando la señal lastmod.
// → Al cargar clínicas nuevas o tocar contenido, sube esta fecha y haz deploy.
const CONTENIDO_ACTUALIZADO = new Date('2026-06-11')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.vetespana.es'

  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: CONTENIDO_ACTUALIZADO, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/clinicas`, lastModified: CONTENIDO_ACTUALIZADO, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cerca-de-mi`, lastModified: CONTENIDO_ACTUALIZADO, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/alta-clinica`, lastModified: CONTENIDO_ACTUALIZADO, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/guias`, lastModified: CONTENIDO_ACTUALIZADO, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/ciudades`, lastModified: CONTENIDO_ACTUALIZADO, changeFrequency: 'weekly', priority: 0.7 },
  ]

  // Guías informacionales — cada una con su fecha real de actualización (precisa)
  const guiaPages: MetadataRoute.Sitemap = GUIAS.map((g) => ({
    url: `${baseUrl}/guias/${g.slug}`,
    lastModified: new Date(g.actualizado),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Una URL por comunidad autónoma — valor semántico alto, poca duplicación
  const comunidadPages: MetadataRoute.Sitemap = Object.keys(CIUDADES_POR_COMUNIDAD).map((comunidad) => ({
    url: `${baseUrl}/clinicas?comunidad=${encodeURIComponent(comunidad)}`,
    lastModified: CONTENIDO_ACTUALIZADO,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  // Una URL por ciudad — el mayor activo de SEO local ("veterinario en {ciudad}").
  // URL limpia /veterinarios/{slug} (antes ?ciudad=). Cada una tiene H1, título,
  // descripción y canonical propios (no duplican).
  const ciudadPages: MetadataRoute.Sitemap = Object.values(CIUDADES_POR_COMUNIDAD)
    .flat()
    .map((ciudad) => ({
      url: `${baseUrl}/veterinarios/${ciudadSlug(ciudad)}`,
      lastModified: CONTENIDO_ACTUALIZADO,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  // Fichas individuales — el grueso del valor SEO (páginas únicas por clínica)
  const slugs = await getAllClinicSlugs()
  const clinicPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/clinicas/${slug}`,
    lastModified: CONTENIDO_ACTUALIZADO,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // NOTA: Las URLs ?especialidad= y las combinaciones de filtros se excluyen a propósito
  // (contenido solapado que gasta presupuesto de rastreo). Google las descubrirá por los
  // enlaces internos. Sí incluimos ?ciudad= porque son páginas locales de alto valor SEO.
  return [...staticPages, ...guiaPages, ...comunidadPages, ...ciudadPages, ...clinicPages]
}
