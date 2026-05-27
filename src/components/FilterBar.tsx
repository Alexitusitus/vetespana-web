'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ESPECIALIDADES, CIUDADES } from '@/types/clinic'
import { SlidersHorizontal } from 'lucide-react'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const ciudad = searchParams.get('ciudad') ?? ''
  const especialidad = searchParams.get('especialidad') ?? ''
  const urgencias = searchParams.get('urgencias') === '1'
  const orden = searchParams.get('orden') ?? 'relevancia'

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/clinicas?${params.toString()}`)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
        <SlidersHorizontal size={15} />
        Filtros
      </div>

      {/* Ciudad */}
      <select
        value={ciudad}
        onChange={(e) => update('ciudad', e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white cursor-pointer"
      >
        <option value="">Todas las ciudades</option>
        {CIUDADES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Especialidad */}
      <select
        value={especialidad}
        onChange={(e) => update('especialidad', e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white cursor-pointer"
      >
        <option value="">Todas las especialidades</option>
        {ESPECIALIDADES.map((e) => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>

      {/* Urgencias 24h */}
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none">
        <input
          type="checkbox"
          checked={urgencias}
          onChange={(e) => update('urgencias', e.target.checked ? '1' : null)}
          className="rounded accent-teal-600 w-4 h-4 cursor-pointer"
        />
        Urgencias 24h
      </label>

      {/* Ordenar */}
      <select
        value={orden}
        onChange={(e) => update('orden', e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white cursor-pointer ml-auto"
      >
        <option value="relevancia">Ordenar: Relevancia</option>
        <option value="valoracion">Mejor valoradas</option>
        <option value="nombre">Por nombre</option>
      </select>
    </div>
  )
}
