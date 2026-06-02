'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ClinicCard from './ClinicCard'
import type { Clinic } from '@/types/clinic'

interface Props {
  /** Primeras clínicas, ya renderizadas en el servidor (SEO + carga rápida). */
  initial: Clinic[]
  /** Total de resultados del filtro actual. */
  total: number
  /** Query string de los filtros (ciudad, comunidad, q…) para pedir más a la API. */
  query: string
}

/**
 * Rejilla con scroll infinito que carga por LOTES desde /api/clinicas. El
 * servidor manda solo las primeras; las demás se piden al bajar. Así una página
 * con miles de resultados no envía todos los datos de golpe (era ~3 MB).
 */
export default function ClinicGrid({ initial, total, query }: Props) {
  const [items, setItems] = useState<Clinic[]>(initial)
  const [loading, setLoading] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  // Si cambian los filtros (nuevo render del servidor), reinicia.
  useEffect(() => {
    setItems(initial)
  }, [initial])

  const loadMore = useCallback(async () => {
    if (loading || items.length >= total) return
    setLoading(true)
    try {
      const res = await fetch(`/api/clinicas?${query}&offset=${items.length}&limit=24`)
      const data = await res.json()
      if (Array.isArray(data.items) && data.items.length) {
        setItems((prev) => [...prev, ...data.items])
      }
    } catch {
      /* si falla la red, no rompemos la página */
    } finally {
      setLoading(false)
    }
  }, [loading, items.length, total, query])

  useEffect(() => {
    if (items.length >= total) return
    const el = sentinel.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '600px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [items.length, total, loadMore])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((clinic, i) => (
          <ClinicCard key={clinic.id} clinic={clinic} priority={i < 1} />
        ))}
      </div>

      {items.length < total && (
        <div ref={sentinel} className="flex justify-center py-8 text-sm text-gray-400">
          Cargando más clínicas… ({items.length} de {total})
        </div>
      )}
    </>
  )
}
