'use client'

import { useState } from 'react'
import { Navigation, LoaderCircle, MapPin } from 'lucide-react'
import ClinicCard from '@/components/ClinicCard'
import SearchBar from '@/components/SearchBar'
import type { Clinic } from '@/types/clinic'

type Resultado = Clinic & { distanciaKm: number }
type Estado = 'inicio' | 'cargando' | 'ok' | 'denegado' | 'error'

export default function NearbyClient() {
  const [estado, setEstado] = useState<Estado>('inicio')
  const [resultados, setResultados] = useState<Resultado[]>([])

  function buscarCerca() {
    if (!('geolocation' in navigator)) {
      setEstado('error')
      return
    }
    setEstado('cargando')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`/api/cerca?lat=${latitude}&lng=${longitude}`)
          if (!res.ok) throw new Error('error')
          const data = await res.json()
          setResultados(data.resultados ?? [])
          setEstado('ok')
        } catch {
          setEstado('error')
        }
      },
      (err) => {
        setEstado(err.code === err.PERMISSION_DENIED ? 'denegado' : 'error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div>
      {/* Botón principal */}
      {(estado === 'inicio' || estado === 'cargando') && (
        <div className="text-center py-10">
          <button
            onClick={buscarCerca}
            disabled={estado === 'cargando'}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-70 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-sm transition-colors"
          >
            {estado === 'cargando' ? (
              <>
                <LoaderCircle size={20} className="animate-spin" /> Buscando tu ubicación…
              </>
            ) : (
              <>
                <Navigation size={20} className="fill-white" /> Ver veterinarias cerca de mí
              </>
            )}
          </button>
          <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto">
            Tu navegador te pedirá permiso para usar tu ubicación. Solo se usa para calcular las
            clínicas más cercanas — no se guarda ni se comparte.
          </p>
        </div>
      )}

      {/* Permiso denegado o error → alternativa por ciudad */}
      {(estado === 'denegado' || estado === 'error') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <MapPin size={28} className="mx-auto text-amber-500 mb-2" />
          <p className="font-semibold text-gray-800 mb-1">
            {estado === 'denegado' ? 'No pudimos acceder a tu ubicación' : 'Algo salió mal'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            No pasa nada: elige tu ciudad y te mostramos las clínicas de tu zona.
          </p>
          <div className="max-w-2xl mx-auto text-left">
            <SearchBar />
          </div>
          <button onClick={buscarCerca} className="text-sm text-teal-700 underline underline-offset-2 mt-4">
            Reintentar con mi ubicación
          </button>
        </div>
      )}

      {/* Resultados */}
      {estado === 'ok' && (
        <div>
          {resultados.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  {resultados.length} veterinarias cerca de ti
                </h2>
                <button onClick={buscarCerca} className="text-sm text-teal-700 hover:text-teal-800 underline underline-offset-2">
                  Actualizar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {resultados.map((c) => (
                  <ClinicCard key={c.id} clinic={c} distanciaKm={c.distanciaKm} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">🐾</div>
              <p className="text-lg font-medium text-gray-600">No encontramos clínicas cercanas</p>
              <p className="text-sm">Prueba a buscar por tu ciudad.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
