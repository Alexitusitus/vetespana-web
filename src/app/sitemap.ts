import type { MetadataRoute } from 'next'
import { getAllClinicSlugs } from '@/lib/airtable'
import { CIUDADES_POR_COMUNIDAD } from '@/types/clinic'

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

  // Fichas individuales — el grueso del valor SEO (páginas únicas por clínica)
  const slugs = await getAllClinicSlugs()
  const clinicPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/clinicas/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // NOTA: Las URLs ?ciudad= y ?especialidad= se excluyen del sitemap a propósito.
  // Son páginas de filtro (contenido dinámico solapado) que gastan presupuesto de rastreo
  // sin aportar valor SEO adicional — Google las descubrirá por los enlaces internos.
  return [...staticPages, ...comunidadPages, ...clinicPages]
}
