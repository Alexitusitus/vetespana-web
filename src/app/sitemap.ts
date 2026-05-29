import type { MetadataRoute } from 'next'
import { getAllClinicSlugs } from '@/lib/airtable'
import { CIUDADES, CIUDADES_POR_COMUNIDAD, ESPECIALIDADES } from '@/types/clinic'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.vetespana.es'

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/clinicas`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cerca-de-mi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/alta-clinica`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Página por cada ciudad
  const ciudadPages: MetadataRoute.Sitemap = CIUDADES.map((ciudad) => ({
    url: `${baseUrl}/clinicas?ciudad=${encodeURIComponent(ciudad)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Página por cada comunidad autónoma
  const comunidadPages: MetadataRoute.Sitemap = Object.keys(CIUDADES_POR_COMUNIDAD).map((comunidad) => ({
    url: `${baseUrl}/clinicas?comunidad=${encodeURIComponent(comunidad)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Página por cada especialidad (todas)
  const especialidadPages: MetadataRoute.Sitemap = ESPECIALIDADES.map((esp) => ({
    url: `${baseUrl}/clinicas?especialidad=${encodeURIComponent(esp)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  // Fichas individuales de clínicas
  const slugs = await getAllClinicSlugs()
  const clinicPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/clinicas/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...ciudadPages, ...comunidadPages, ...especialidadPages, ...clinicPages]
}
