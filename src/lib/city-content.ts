import type { Clinic } from '@/types/clinic'

// Contenido SEO reutilizable para las páginas de ciudad/comunidad
// (lo usan tanto /clinicas?ciudad= como la ruta limpia /veterinarios/[ciudad]).

// Suma de caracteres del nombre del lugar → elige variante de intro. Así cada
// ciudad tiene un texto distinto (no duplicado), pero estable entre visitas.
function hashLugar(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % 997
  return h
}

export function textoSeoLugar(lugar: string, count: number, especialidad?: string): string[] {
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

// Datos reales de la zona a partir de las clínicas (contenido único que posiciona).
export function cityFacts(clinics: Clinic[]): { count24h: number; topEsp: string[] } {
  const count24h = clinics.filter((c) => c.urgencias24h).length
  const espCount = new Map<string, number>()
  for (const c of clinics) {
    for (const e of c.especialidades) {
      if (e === 'Perros' || e === 'Gatos') continue // las dos base no aportan
      espCount.set(e, (espCount.get(e) ?? 0) + 1)
    }
  }
  const topEsp = [...espCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([e]) => e)
  return { count24h, topEsp }
}

export type FaqItem = { q: string; a: string }

// FAQ con datos reales (se muestra y se emite como JSON-LD FAQPage).
export function buildCityFaq(
  lugarDisplay: string,
  total: number,
  count24h: number,
  topEsp: string[],
): FaqItem[] {
  const faq: FaqItem[] = [
    {
      q: `¿Cuántas clínicas veterinarias hay en ${lugarDisplay}?`,
      a: `En VetEspaña tenemos ${total} clínicas veterinarias en ${lugarDisplay} con su teléfono, dirección, horario y especialidades.`,
    },
    {
      q: `¿Hay veterinarios de urgencias 24h en ${lugarDisplay}?`,
      a:
        count24h > 0
          ? `Sí. En ${lugarDisplay} hay ${count24h} clínica${count24h !== 1 ? 's' : ''} veterinaria${count24h !== 1 ? 's' : ''} con urgencias 24 horas. Usa el filtro "Solo con urgencias 24h" para verlas.`
          : `De momento no tenemos listada ninguna clínica con urgencias 24h en ${lugarDisplay}. Puedes consultar las clínicas cercanas o las de tu comunidad.`,
    },
  ]
  if (topEsp.length) {
    faq.push({
      q: `¿Qué especialidades veterinarias puedo encontrar en ${lugarDisplay}?`,
      a: `Las clínicas de ${lugarDisplay} ofrecen especialidades como ${topEsp.join(', ')}, además de atención general para perros y gatos.`,
    })
  }
  return faq
}
