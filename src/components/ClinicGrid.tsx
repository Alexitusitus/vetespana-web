'use client'

import { useEffect, useRef, useState } from 'react'
import ClinicCard from './ClinicCard'
import type { Clinic } from '@/types/clinic'

// Cuántas clínicas se muestran de inicio y cuántas se añaden en cada carga.
const PAGE = 24

/**
 * Rejilla de clínicas con "scroll infinito": pinta solo las primeras 24 y va
 * añadiendo más a medida que el usuario baja. Así una página con miles de
 * resultados no intenta dibujarlas todas de golpe (lo que la hacía muy lenta).
 */
export default function ClinicGrid({ clinics }: { clinics: Clinic[] }) {
  const [visible, setVisible] = useState(PAGE)
  const sentinel = useRef<HTMLDivElement>(null)

  // Si cambia la lista (nuevo filtro/búsqueda), vuelve a empezar por las 24 primeras.
  useEffect(() => {
    setVisible(PAGE)
  }, [clinics])

  // Observa un "centinela" al final: cuando se acerca a la vista, carga más.
  useEffect(() => {
    if (visible >= clinics.length) return
    const el = sentinel.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + PAGE, clinics.length))
        }
      },
      { rootMargin: '600px' } // empieza a cargar antes de llegar al final
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [visible, clinics.length])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {clinics.slice(0, visible).map((clinic) => (
          <ClinicCard key={clinic.id} clinic={clinic} />
        ))}
      </div>

      {visible < clinics.length && (
        <div ref={sentinel} className="flex justify-center py-8 text-sm text-gray-400">
          Cargando más clínicas… ({visible} de {clinics.length})
        </div>
      )}
    </>
  )
}
