import Link from 'next/link'
import { Suspense } from 'react'
import { getFeaturedClinics } from '@/lib/airtable'
import ClinicCard from '@/components/ClinicCard'
import SearchBar from '@/components/SearchBar'
import { ArrowRight, ShieldCheck, Star, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic' // SSR real en cada petición — datos siempre frescos de Airtable

export default async function HomePage() {
  const clinicas = await getFeaturedClinics()

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Encuentra la mejor clínica<br />
            veterinaria cerca de ti
          </h1>
          <p className="text-teal-100 text-lg mb-8">
            Más de 30 clínicas veterinarias verificadas en toda España. Con fotos, horarios, especialidades y reseñas reales.
          </p>

          <div className="bg-white rounded-2xl p-3 shadow-2xl">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Urgencias 24h', href: '/clinicas?urgencias=1', icon: '🚨', desc: 'Atención inmediata' },
            { label: 'Especialistas en perros', href: '/clinicas?especialidad=Perros', icon: '🐕', desc: 'Clínicas especializadas' },
            { label: 'Especialistas en gatos', href: '/clinicas?especialidad=Gatos', icon: '🐈', desc: 'Felinos y más' },
            { label: 'Animales exóticos', href: '/clinicas?especialidad=Animales+ex%C3%B3ticos', icon: '🦜', desc: 'Reptiles, aves y más' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all group text-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-sm text-gray-800 group-hover:text-teal-600">{item.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Clínicas destacadas */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Clínicas destacadas</h2>
          <Link
            href="/clinicas"
            className="text-teal-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Ver todas <ArrowRight size={15} />
          </Link>
        </div>

        {clinicas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clinicas.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🐾</div>
            <p>Pronto habrá clínicas disponibles. ¡Estamos creciendo!</p>
          </div>
        )}
      </section>

      {/* Por qué confiar */}
      <section className="bg-white border-t border-gray-100 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            ¿Por qué usar VetEspaña?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="text-teal-600" size={28} />,
                title: 'Clínicas verificadas',
                desc: 'Revisamos cada clínica manualmente antes de publicarla. Solo encontrarás centros reales y de confianza.',
              },
              {
                icon: <Star className="text-amber-500" size={28} />,
                title: 'Reseñas reales',
                desc: 'Opiniones de dueños de mascotas como tú. Sin reseñas compradas, solo experiencias auténticas.',
              },
              {
                icon: <Zap className="text-red-500" size={28} />,
                title: 'Urgencias 24h',
                desc: 'Filtra clínicas con atención urgente disponible cualquier hora del día, incluidos festivos.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA clínicas */}
      <section className="bg-teal-50 border-t border-teal-100 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">¿Tienes una clínica veterinaria?</h2>
          <p className="text-gray-600 mb-6">
            Añade tu clínica gratis y llega a miles de dueños de mascotas que buscan veterinario cada mes en tu ciudad.
          </p>
          <Link
            href="/alta-clinica"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-7 py-3 rounded-full transition-colors"
          >
            Añadir mi clínica — es gratis <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
