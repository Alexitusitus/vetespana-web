import { CIUDADES_POR_COMUNIDAD } from '@/types/clinic'

// Slug SEO-friendly de una ciudad para las URLs limpias /veterinarios/{slug}.
// Puro (sin dependencias de servidor) → se puede importar también en componentes cliente.
export function ciudadSlug(ciudad: string): string {
  return ciudad
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita tildes/diacríticos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Mapa inverso slug → { ciudad (valor de Airtable), comunidad }.
// Se usa en la ruta /veterinarios/[ciudad] para resolver el slug de la URL.
export const CIUDAD_POR_SLUG: Record<string, { ciudad: string; comunidad: string }> = (() => {
  const map: Record<string, { ciudad: string; comunidad: string }> = {}
  for (const [comunidad, ciudades] of Object.entries(CIUDADES_POR_COMUNIDAD)) {
    for (const ciudad of ciudades) {
      map[ciudadSlug(ciudad)] = { ciudad, comunidad }
    }
  }
  return map
})()
