import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Añade tu clínica veterinaria',
  description:
    'Registra tu clínica veterinaria en VetEspaña gratis. Llega a miles de dueños de mascotas que buscan veterinario en tu ciudad.',
}

const TALLY_URL = 'https://tally.so/r/PdGVPe'

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

      {/* Botón alta */}
      <div className="flex justify-center mb-10">
        <a
          href={TALLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-full transition-colors text-lg"
        >
          Añadir mi clínica gratis <ArrowRight size={16} className="inline" />
        </a>
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
