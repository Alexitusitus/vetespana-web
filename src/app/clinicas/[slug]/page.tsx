import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin, Phone, Globe, Mail, Clock, ShieldCheck,
  Star, Zap, ArrowLeft, MessageCircle
} from 'lucide-react'
import { getClinicBySlug, getAllClinicSlugs, getReviewsByClinic } from '@/lib/airtable'

export const dynamic = 'force-dynamic' // SSR real en cada petición — datos siempre frescos de Airtable

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllClinicSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const clinic = await getClinicBySlug(slug)
  if (!clinic) return {}

  return {
    title: `${clinic.nombre} — Clínica veterinaria en ${clinic.ciudad}`,
    description:
      clinic.descripcion ??
      `${clinic.nombre} es una clínica veterinaria en ${clinic.ciudad}. ` +
        `Especialidades: ${clinic.especialidades.join(', ')}. Teléfono: ${clinic.telefono}.`,
    openGraph: {
      title: clinic.nombre,
      description: `Clínica veterinaria en ${clinic.ciudad}`,
      images: clinic.fotoPortada ? [clinic.fotoPortada.url] : [],
    },
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  )
}

export default async function ClinicaPage({ params }: Props) {
  const { slug } = await params
  const [clinic, reviews] = await Promise.all([
    getClinicBySlug(slug),
    getClinicBySlug(slug).then((c) => (c ? getReviewsByClinic(c.id) : [])),
  ])

  if (!clinic) notFound()

  const isPremium = clinic.plan === 'Premium'
  const whatsappUrl = `https://wa.me/34${clinic.telefono.replace(/\D/g, '')}`

  // JSON-LD para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VeterinaryCare',
    name: clinic.nombre,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.direccion,
      addressLocality: clinic.ciudad,
      addressCountry: 'ES',
    },
    telephone: clinic.telefono,
    url: clinic.web ?? undefined,
    image: clinic.fotoPortada?.url ?? undefined,
    aggregateRating: clinic.valoracionMedia
      ? {
          '@type': 'AggregateRating',
          ratingValue: clinic.valoracionMedia,
          reviewCount: reviews.length || 1,
        }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/clinicas" className="hover:text-teal-600 flex items-center gap-1">
            <ArrowLeft size={14} /> Clínicas
          </Link>
          <span>/</span>
          <span className="text-gray-700">{clinic.nombre}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Foto portada */}
            {clinic.fotoPortada && (
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
                <Image
                  src={clinic.fotoPortada.url}
                  alt={`Clínica veterinaria ${clinic.nombre}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            )}

            {/* Nombre y badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {isPremium && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-amber-600" /> Premium
                  </span>
                )}
                {clinic.verificada && (
                  <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck size={10} /> Verificada
                  </span>
                )}
                {clinic.urgencias24h && (
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Zap size={10} /> Urgencias 24h
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-1">{clinic.nombre}</h1>
              <p className="text-gray-500 flex items-center gap-1.5">
                <MapPin size={15} className="text-teal-500" />
                {clinic.direccion}, {clinic.ciudad}
              </p>

              {clinic.valoracionMedia && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={clinic.valoracionMedia} />
                  <span className="font-semibold text-gray-700">{clinic.valoracionMedia.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>

            {/* Descripción */}
            {clinic.descripcion && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-3">Sobre la clínica</h2>
                <p className="text-gray-600 leading-relaxed text-sm">{clinic.descripcion}</p>
              </div>
            )}

            {/* Especialidades */}
            {clinic.especialidades.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-3">Especialidades</h2>
                <div className="flex flex-wrap gap-2">
                  {clinic.especialidades.map((esp) => (
                    <Link
                      key={esp}
                      href={`/clinicas?especialidad=${encodeURIComponent(esp)}&ciudad=${encodeURIComponent(clinic.ciudad)}`}
                      className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                    >
                      {esp}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Galería fotos (solo Premium) */}
            {isPremium && clinic.galeriaFotos.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-3">Galería de fotos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {clinic.galeriaFotos.map((foto) => (
                    <div key={foto.id} className="relative aspect-square rounded-xl overflow-hidden">
                      <Image
                        src={foto.url}
                        alt={`Foto de ${clinic.nombre}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="200px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reseñas */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">
                Reseñas {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}
              </h2>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-800">{review.nombreUsuario}</span>
                        <span className="text-xs text-gray-400">{new Date(review.fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                      <StarRating rating={review.puntuacion} />
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comentario}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Todavía no hay reseñas para esta clínica. ¡Sé el primero en opinar!</p>
              )}
            </div>
          </div>

          {/* Columna lateral — datos de contacto */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
              <h2 className="font-bold text-gray-900 mb-4">Contacto</h2>

              <div className="space-y-3 text-sm">
                {clinic.telefono && (
                  <a
                    href={`tel:${clinic.telefono}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-teal-600 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100">
                      <Phone size={14} className="text-teal-600" />
                    </div>
                    <span className="font-medium">{clinic.telefono}</span>
                  </a>
                )}

                {clinic.direccion && (
                  <div className="flex items-start gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={14} className="text-gray-400" />
                    </div>
                    <span>{clinic.direccion}, {clinic.ciudad}</span>
                  </div>
                )}

                {clinic.horario && (
                  <div className="flex items-start gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={14} className="text-gray-400" />
                    </div>
                    <span className="whitespace-pre-line">{clinic.horario}</span>
                  </div>
                )}

                {clinic.web && (
                  <a
                    href={clinic.web.startsWith('http') ? clinic.web : `https://${clinic.web}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-teal-600 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-50">
                      <Globe size={14} className="text-gray-400 group-hover:text-teal-600" />
                    </div>
                    <span className="truncate">{clinic.web.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}

                {clinic.email && (
                  <a
                    href={`mailto:${clinic.email}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-teal-600 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-50">
                      <Mail size={14} className="text-gray-400 group-hover:text-teal-600" />
                    </div>
                    <span className="truncate">{clinic.email}</span>
                  </a>
                )}
              </div>

              {/* Botones de acción */}
              <div className="mt-5 space-y-2">
                {clinic.telefono && (
                  <a
                    href={`tel:${clinic.telefono}`}
                    className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <Phone size={15} /> Llamar ahora
                  </a>
                )}

                {/* WhatsApp solo para Premium */}
                {isPremium && clinic.telefono && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Mapa enlace Google Maps */}
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(clinic.nombre + ' ' + clinic.direccion + ' ' + clinic.ciudad)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full bg-white border border-gray-200 hover:border-teal-300 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm justify-center"
            >
              <MapPin size={14} className="text-teal-500" /> Ver en Google Maps
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
