import type { Metadata } from 'next'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Añade tu clínica veterinaria',
  description:
    'Registra tu clínica veterinaria en VetEspaña gratis. Llega a miles de dueños de mascotas que buscan veterinario en tu ciudad.',
}

const TALLY_URL = 'https://tally.so/r/XXXXXXX' // ← sustituir con la URL real de tu formulario Tally

export default function AltaClinicaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Añade tu clínica veterinaria gratis
        </h1>
        <p className="text-gray-500 text-lg">
          Llega a miles de dueños de mascotas que buscan veterinario en tu ciudad cada mes.
        </p>
      </div>

      {/* Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Gratis */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="font-bold text-gray-900 text-xl mb-1">Ficha básica</div>
          <div className="text-3xl font-bold text-gray-900 mb-4">Gratis</div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            {[
              'Nombre, dirección y teléfono',
              '1 foto',
              'Especialidades',
              'Aparece en el listado',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle size={15} className="text-teal-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href={TALLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            Añadir gratis <ArrowRight size={14} className="inline ml-1" />
          </a>
        </div>

        {/* Premium */}
        <div className="bg-teal-600 text-white rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
            Recomendado
          </div>
          <div className="font-bold text-xl mb-1">Ficha Premium</div>
          <div className="text-3xl font-bold mb-1">
            19€<span className="text-base font-normal text-teal-200">/mes</span>
          </div>
          <p className="text-teal-200 text-xs mb-4">Cancela cuando quieras</p>
          <ul className="space-y-2 text-sm mb-6">
            {[
              'Todo lo de la ficha básica',
              'Galería ilimitada de fotos',
              'Descripción larga + SEO',
              'Aparece primero en resultados',
              'Badge "Verificada"',
              'Botón de WhatsApp directo',
              'Estadísticas de visitas',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle size={15} className="text-teal-300 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href={TALLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-white text-teal-700 hover:bg-teal-50 font-semibold py-2.5 rounded-xl transition-colors"
          >
            Empezar con Premium <ArrowRight size={14} className="inline ml-1" />
          </a>
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="font-bold text-gray-900 mb-4 text-center">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { n: '1', title: 'Rellena el formulario', desc: 'Tarda menos de 5 minutos. Solo lo básico.' },
            { n: '2', title: 'Revisamos tu clínica', desc: 'Verificamos que todo esté correcto en 24-48h.' },
            { n: '3', title: '¡Ya estás online!', desc: 'Miles de dueños de mascotas podrán encontrarte.' },
          ].map((step) => (
            <div key={step.n}>
              <div className="w-9 h-9 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                {step.n}
              </div>
              <div className="font-semibold text-gray-800 text-sm mb-1">{step.title}</div>
              <div className="text-xs text-gray-500">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
