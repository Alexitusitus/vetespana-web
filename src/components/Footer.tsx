import Link from 'next/link'
import { PawPrint } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <PawPrint size={20} className="fill-teal-400 text-teal-400" />
              VetEspaña
            </Link>
            <p className="text-sm leading-relaxed">
              El directorio de referencia de clínicas veterinarias en España. Encuentra el mejor
              veterinario para tu mascota.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Para dueños de mascotas</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/clinicas" className="hover:text-white transition-colors">Buscar clínicas veterinarias</Link></li>
              <li><Link href="/clinicas?urgencias=1" className="hover:text-white transition-colors">Veterinarios urgencias 24h</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Para clínicas</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/alta-clinica" className="hover:text-white transition-colors">Añadir mi clínica</Link></li>
              <li><Link href="/premium" className="hover:text-white transition-colors">Ficha Premium — 1,99€/mes</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-sm text-center">
          © {new Date().getFullYear()} VetEspaña · El directorio veterinario de confianza en España
        </div>
      </div>
    </footer>
  )
}
