import { getClinics } from './airtable'
import type { Clinic } from '@/types/clinic'

// Búsqueda + filtros + orden del listado, compartida entre la página /clinicas
// (render inicial en servidor) y la API /api/clinicas (carga de más al hacer scroll).

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

// true si el campo contiene la palabra (sin tildes) o hay una palabra con
// distancia de edición ≤ 1 (tolerante a 1 typo en palabras de > 3 letras).
function fuzzyField(field: string, word: string): boolean {
  const f = norm(field)
  if (f.includes(word)) return true
  if (word.length > 3) {
    const tokens = f.split(/[\s,.\-/]+/)
    return tokens.some((t) => Math.abs(t.length - word.length) <= 1 && levenshtein(t, word) <= 1)
  }
  return false
}

export interface SearchParams {
  ciudad?: string
  comunidad?: string
  especialidad?: string
  urgencias?: boolean
  q?: string
  orden?: string
}

export async function searchClinics(params: SearchParams): Promise<Clinic[]> {
  const clinicas = await getClinics({
    ciudad: params.ciudad,
    comunidad: params.comunidad,
    especialidad: params.especialidad,
    urgencias: params.urgencias,
  })

  // Búsqueda libre tolerante a tildes y a 1 typo por palabra
  const q = params.q?.trim() ?? ''
  const queryWords = norm(q).split(/\s+/).filter(Boolean)
  let filtradas = queryWords.length
    ? clinicas.filter((c) =>
        queryWords.every((word) =>
          fuzzyField(c.nombre, word) ||
          fuzzyField(c.ciudad, word) ||
          c.especialidades.some((e) => fuzzyField(e, word)) ||
          fuzzyField(c.direccion ?? '', word)
        )
      )
    : clinicas

  // Criterio base: Premium > Verificada > (criterio elegido)
  // Las verificadas salen SIEMPRE por delante, sea cual sea el orden seleccionado.
  const basePriority = (a: Clinic, b: Clinic): number => {
    if (a.plan !== b.plan) return a.plan === 'Premium' ? -1 : 1
    if (a.verificada !== b.verificada) return a.verificada ? -1 : 1
    return 0
  }

  if (params.orden === 'nombre') {
    filtradas = [...filtradas].sort((a, b) => basePriority(a, b) || a.nombre.localeCompare(b.nombre))
  } else if (params.orden === 'valoracion') {
    filtradas = [...filtradas].sort((a, b) => basePriority(a, b) || (b.valoracionMedia ?? 0) - (a.valoracionMedia ?? 0))
  } else {
    // Orden por defecto (relevancia): viene de Airtable ya ordenado por Plan > Verificada > Valoración,
    // pero re-aplicamos aquí por si el caché llegó en otro orden.
    filtradas = [...filtradas].sort((a, b) => basePriority(a, b) || (b.valoracionMedia ?? 0) - (a.valoracionMedia ?? 0))
  }

  return filtradas
}
