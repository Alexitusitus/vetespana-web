'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ESPECIALIDADES, CIUDADES, CIUDAD_DISPLAY } from '@/types/clinic'
import { SlidersHorizontal, X } from 'lucide-react'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const ciudad = searchParams.get('ciudad') ?? ''
  const especialidad = searchParams.get('especialidad') ?? ''
  const urgencias = searchParams.get('urgencias') === '1'
  const orden = searchParams.get('orden') ?? 'relevancia'

  const hayFiltrosActivos = ciudad || especialidad || urgencias

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/clinicas?${params.toString()}`)
  }

  function limpiarFiltros() {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    router.push(`/clinicas?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      {/* Fila de controles */}
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
            <option key={c} value={c}>{CIUDAD_DISPLAY[c] ?? c}</option>
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

      {/* Chips de filtros activos */}
      {hayFiltrosActivos && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500">Filtrando por:</span>

          {ciudad && (
            <button
              onClick={() => update('ciudad', null)}
              className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-medium px-3 py-1 rounded-full hover:bg-teal-100 transition-colors"
            >
              📍 {CIUDAD_DISPLAY[ciudad] ?? ciudad}
              <X size={12} />
            </button>
          )}

          {especialidad && (
            <button
              onClick={() => update('especialidad', null)}
              className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-medium px-3 py-1 rounded-full hover:bg-teal-100 transition-colors"
            >
              🩺 {especialidad}
              <X size={12} />
            </button>
          )}

          {urgencias && (
            <button
              onClick={() => update('urgencias', null)}
              className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-medium px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
            >
              🚨 Urgencias 24h
              <X size={12} />
            </button>
          )}

          <button
            onClick={limpiarFiltros}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors ml-1"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  )
}
