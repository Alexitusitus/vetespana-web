// Cabecera visual de cada guía: banner con degradado de marca, patrón de huellas
// de fondo (SVG propio) y el icono grande. Sin imágenes externas → fiable y rápido.

function PawPattern({ id }: { id: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <pattern id={id} width="86" height="86" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          <g fill="#ffffff">
            <ellipse cx="40" cy="50" rx="11" ry="9" />
            <circle cx="25" cy="36" r="5" />
            <circle cx="38" cy="29" r="5.5" />
            <circle cx="53" cy="33" r="5" />
            <circle cx="62" cy="44" r="4.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity="0.12" />
    </svg>
  )
}

export default function GuiaHero({
  emoji,
  titulo,
  meta,
  patternId,
}: {
  emoji: string
  titulo: string
  meta: string
  patternId: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 px-6 py-9 md:px-10 md:py-12 mb-8">
      <PawPattern id={patternId} />
      <div className="relative flex items-center gap-5">
        <div className="shrink-0 w-20 h-20 rounded-2xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center text-4xl">
          {emoji}
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">{titulo}</h1>
          <p className="text-teal-50/90 text-sm mt-2">{meta}</p>
        </div>
      </div>
    </div>
  )
}
