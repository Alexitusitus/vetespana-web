'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { CIUDADES, CIUDAD_DISPLAY } from '@/types/clinic'

interface Props {
  initialCiudad?: string
  initialQuery?: string
}

export default function SearchBar({ initialCiudad = '', initialQuery = '' }: Props) {
  const router = useRouter()
  const [ciudad, setCiudad] = useState(initialCiudad)
  const [query, setQuery] = useState(initialQuery)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (ciudad) params.set('ciudad', ciudad)
    if (query) params.set('q', query)
    router.push(`/clinicas?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
      {/* Ciudad */}
      <div className="relative flex-1 min-w-0">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
        <select
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none cursor-pointer"
        >
          <option value="">Todas las ciudades</option>
          {CIUDADES.map((c) => (
            <option key={c} value={c}>{CIUDAD_DISPLAY[c] ?? c}</option>
          ))}
        </select>
      </div>

      {/* Búsqueda libre */}
      <div className="relative flex-[2] min-w-0">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Especialidad, nombre de clínica..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      <button
        type="submit"
        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
      >
        Buscar
      </button>
    </form>
  )
}
