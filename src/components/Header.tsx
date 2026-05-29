import Link from 'next/link'
import { PawPrint } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-teal-600">
          <PawPrint size={24} className="fill-teal-600" />
          <span>VetEspaña</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/clinicas" className="hover:text-teal-600 transition-colors">
            Buscar clínicas
          </Link>
          <Link
            href="/alta-clinica"
            className="bg-teal-700 text-white px-4 py-2 rounded-full hover:bg-teal-800 transition-colors"
          >
            Añade tu clínica
          </Link>
        </nav>

        {/* Mobile */}
        <Link
          href="/alta-clinica"
          className="md:hidden bg-teal-700 text-white px-3 py-1.5 rounded-full text-sm font-medium"
        >
          Añade tu clínica
        </Link>
      </div>
    </header>
  )
}
