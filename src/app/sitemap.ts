import type { MetadataRoute } from 'next'
import { getAllClinicSlugs } from '@/lib/airtable'
import { CIUDADES_POR_COMUNIDAD } from '@/types/clinic'

// Dinámico: se genera bajo demanda (Google lo pide de vez en cuando). Así no
// depende de Airtable durante el build. Usa la caché de datos, o sea que es rápido.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.vetespana.es'

  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/clinicas`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cerca-de-mi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/alta-clinica`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Una URL por comunidad autónoma — valor semántico alto, poca duplicación
  const comunidadPages: MetadataRoute.Sitemap = Object.keys(CIUDADES_POR_COMUNIDAD).map((comunidad) => ({
    url: `${baseUrl}/clinicas?comunidad=${encodeURIComponent(comunidad)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  // Una URL por ciudad — el mayor activo de SEO local ("veterinario en {ciudad}").
  // Cada una tiene H1, título, descripción y canonical propios (no duplican).
  const ciudadPages: MetadataRoute.Sitemap = Object.values(CIUDADES_POR_COMUNIDAD)
    .flat()
    .map((ciudad) => ({
      url: `${baseUrl}/clinicas?ciudad=${encodeURIComponent(ciudad)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  // Fichas individuales — el grueso del valor SEO (páginas únicas por clínica)
  const slugs = await getAllClinicSlugs()
  const clinicPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/clinicas/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // NOTA: Las URLs ?especialidad= y las combinaciones de filtros se excluyen a propósito
  // (contenido solapado que gasta presupuesto de rastreo). Google las descubrirá por los
  // enlaces internos. Sí incluimos ?ciudad= porque son páginas locales de alto valor SEO.
  return [...staticPages, ...comunidadPages, ...ciudadPages, ...clinicPages]
}
