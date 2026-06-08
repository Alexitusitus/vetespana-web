// Contenido de las Guías (sección SEO informacional). Cada guía responde a
// búsquedas reales de dueños de mascotas y enlaza al directorio. Texto original.
//
// Los párrafos admiten enlaces en formato markdown: [texto](/ruta) — se
// renderizan como <Link> internos (ver app/guias/[slug]/page.tsx).

export interface Seccion {
  h: string
  parrafos: string[]
  lista?: string[]
}

export interface Guia {
  slug: string
  titulo: string // H1
  metaTitulo: string // <title>
  descripcion: string // meta description
  emoji: string
  resumen: string // intro + tarjeta del índice
  actualizado: string // ISO
  actualizadoTexto: string
  lectura: string // tiempo de lectura
  secciones: Seccion[]
  faq: { q: string; a: string }[]
}

export const GUIAS: Guia[] = [
  {
    slug: 'como-elegir-clinica-veterinaria',
    titulo: 'Cómo elegir una buena clínica veterinaria',
    metaTitulo: 'Cómo elegir una buena clínica veterinaria (guía 2026)',
    descripcion:
      'Aprende a elegir la mejor clínica veterinaria para tu mascota: qué mirar, preguntas clave, señales de calidad y errores a evitar. Guía práctica y actualizada.',
    emoji: '🩺',
    resumen:
      'Elegir veterinario no es solo cuestión de cercanía. Te contamos en qué fijarte para encontrar una clínica de confianza para tu perro, gato o mascota.',
    actualizado: '2026-06-08',
    actualizadoTexto: 'junio de 2026',
    lectura: '5 min',
    secciones: [
      {
        h: 'No elijas solo por cercanía',
        parrafos: [
          'La clínica más cercana no siempre es la mejor para tu mascota, pero la distancia sí importa: en una urgencia, cada minuto cuenta. Lo ideal es tener identificada una clínica de confianza cerca de casa y, además, saber dónde está el hospital veterinario con urgencias 24h más próximo.',
          'Una buena estrategia es combinar ambas cosas: busca [clínicas cerca de ti](/cerca-de-mi) para el día a día (vacunas, revisiones, consultas) y ten localizado un centro de [urgencias 24h](/clinicas?urgencias=1) por si surge un imprevisto fuera de horario.',
        ],
      },
      {
        h: 'Señales de una clínica de calidad',
        parrafos: ['Hay detalles que distinguen a una clínica seria. Fíjate en estos puntos cuando visites o investigues un centro:'],
        lista: [
          'Instalaciones limpias y ordenadas, con sala de espera separada (idealmente perros y gatos por separado).',
          'Personal que dedica tiempo a explicarte el diagnóstico y las opciones de tratamiento sin prisas.',
          'Presupuestos claros y por escrito antes de cualquier intervención.',
          'Equipamiento propio: laboratorio, radiografía o ecografía agilizan mucho los diagnósticos.',
          'Reseñas reales positivas y respuestas a las críticas de otros clientes.',
          'Especialidades declaradas (cirugía, dermatología, traumatología…) si tu mascota tiene necesidades concretas.',
        ],
      },
      {
        h: 'Preguntas que conviene hacer',
        parrafos: ['Antes de quedarte con una clínica, no tengas reparo en preguntar. Una clínica transparente responderá sin problema:'],
        lista: [
          '¿Tienen servicio de urgencias propio o derivan a otro centro fuera de horario?',
          '¿Cómo funcionan los presupuestos y las formas de pago?',
          '¿Disponen de hospitalización si mi mascota necesita quedarse ingresada?',
          '¿Tienen veterinarios con formación en alguna especialidad concreta?',
          '¿Trabajan con animales exóticos, si es tu caso (reptiles, aves, roedores)?',
        ],
      },
      {
        h: 'Usa las reseñas con cabeza',
        parrafos: [
          'Las opiniones de otros dueños son muy útiles, pero léelas con criterio. Una clínica con muchas reseñas y una valoración alta y sostenida en el tiempo es más fiable que una con cuatro opiniones perfectas. Fíjate en cómo responde el centro a las críticas: una respuesta educada y resolutiva dice mucho de su trato.',
          'En cada ficha de [nuestro directorio](/clinicas) puedes ver la información de contacto, horarios, especialidades y fotos reales de la clínica para hacerte una idea antes de ir.',
        ],
      },
      {
        h: 'Errores frecuentes al elegir',
        parrafos: ['Evita estos fallos habituales:'],
        lista: [
          'Quedarte con la primera clínica sin comparar al menos dos o tres opciones.',
          'No tener localizado un centro de urgencias antes de necesitarlo.',
          'Elegir solo por precio: lo barato puede salir caro si falta equipamiento o seguimiento.',
          'Ignorar las especialidades cuando tu mascota tiene una patología concreta.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Cada cuánto debo llevar a mi mascota al veterinario?',
        a: 'Para un animal adulto y sano, se recomienda al menos una revisión anual. En cachorros, animales mayores o con enfermedades crónicas, las visitas son más frecuentes según indique el veterinario.',
      },
      {
        q: '¿Puedo cambiar de clínica veterinaria si no estoy contento?',
        a: 'Sí, puedes cambiar cuando quieras. Es recomendable pedir el historial clínico de tu mascota para dárselo al nuevo veterinario y mantener la continuidad del seguimiento.',
      },
      {
        q: '¿Cómo encuentro un veterinario cerca de mí?',
        a: 'Puedes usar la búsqueda por ciudad o la herramienta "cerca de mí" de VetEspaña, que te muestra las clínicas más próximas a tu ubicación ordenadas por distancia.',
      },
    ],
  },
  {
    slug: 'urgencias-veterinarias-24h',
    titulo: 'Urgencias veterinarias 24h: qué hacer y cuándo acudir',
    metaTitulo: 'Urgencias veterinarias 24h: qué hacer y cuándo acudir',
    descripcion:
      'Guía de urgencias veterinarias: señales de alarma en perros y gatos, qué hacer antes de llegar a la clínica y cómo encontrar un veterinario de urgencias 24h cerca de ti.',
    emoji: '🚑',
    resumen:
      'Saber reconocer una urgencia y actuar rápido puede salvarle la vida a tu mascota. Te explicamos las señales de alarma y cómo encontrar atención 24h.',
    actualizado: '2026-06-08',
    actualizadoTexto: 'junio de 2026',
    lectura: '6 min',
    secciones: [
      {
        h: 'Señales de alarma: cuándo es una urgencia',
        parrafos: [
          'Algunos síntomas requieren atención veterinaria inmediata, sin esperar al día siguiente. Si tu perro o gato presenta alguno de estos signos, busca atención urgente cuanto antes:',
        ],
        lista: [
          'Dificultad para respirar, respiración muy agitada o encías azuladas/pálidas.',
          'Vómitos o diarrea persistentes, sobre todo con sangre.',
          'Intento de vomitar sin éxito y abdomen hinchado (posible torsión gástrica, muy grave en perros grandes).',
          'Convulsiones, desmayos o pérdida de consciencia.',
          'Traumatismos: atropellos, caídas de altura o peleas con heridas profundas.',
          'Ingestión de tóxicos o de objetos (chocolate, antigelidante, medicamentos humanos, etc.).',
          'Imposibilidad de orinar, especialmente en gatos macho (urgencia vital).',
          'Sangrado que no se detiene o golpe de calor (jadeo extremo tras exposición al sol).',
        ],
      },
      {
        h: 'Qué hacer antes de llegar a la clínica',
        parrafos: [
          'Mantén la calma: tu mascota percibe tu nerviosismo. Llama por teléfono a la clínica de urgencias antes de salir para avisar de que vas en camino y que preparen lo necesario. Así ganan tiempo para atenderte nada más llegar.',
          'No le des comida, agua ni medicación humana sin que te lo indiquen: muchos fármacos para personas son tóxicos para perros y gatos. Si ha ingerido un producto, lleva el envase contigo para que el veterinario sepa exactamente qué ha tomado.',
        ],
      },
      {
        h: 'Cómo encontrar urgencias 24h cerca de ti',
        parrafos: [
          'No esperes a la emergencia para buscar. Ten localizado de antemano el centro de urgencias más cercano y guarda su teléfono en el móvil.',
          'En VetEspaña puedes filtrar directamente las [clínicas con urgencias 24h](/clinicas?urgencias=1) y también ver las [clínicas más cercanas a tu ubicación](/cerca-de-mi) ordenadas por distancia. Te recomendamos hacerlo hoy mismo, con calma, y apuntar el contacto donde lo tengas a mano.',
        ],
      },
      {
        h: 'Prepara un pequeño plan de emergencia',
        parrafos: ['Tener esto listo te ahorrará minutos críticos llegado el momento:'],
        lista: [
          'El teléfono y la dirección de la clínica de urgencias 24h más cercana.',
          'Una alternativa por si la primera está saturada o cerrada.',
          'El transportín preparado y accesible (sobre todo para gatos).',
          'La cartilla o historial de tu mascota y la lista de su medicación, si toma alguna.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Todas las clínicas atienden urgencias por la noche?',
        a: 'No. Muchas clínicas tienen horario diurno y derivan las urgencias nocturnas a hospitales veterinarios con servicio 24h. Por eso conviene localizar de antemano un centro con urgencias propias.',
      },
      {
        q: '¿Cuánto cuesta una urgencia veterinaria?',
        a: 'Suele tener un coste superior a la consulta normal por el horario y la atención inmediata, más las pruebas o tratamientos que se necesiten. Pide siempre un presupuesto en cuanto la situación esté estabilizada.',
      },
      {
        q: '¿Qué hago si ingiere algo tóxico?',
        a: 'Llama de inmediato a un veterinario, no le provoques el vómito por tu cuenta (en algunos tóxicos empeora la situación) y lleva el envase del producto para que sepan qué ha ingerido.',
      },
    ],
  },
  {
    slug: 'calendario-vacunas-perros-gatos',
    titulo: 'Calendario de vacunas para perros y gatos',
    metaTitulo: 'Calendario de vacunas para perros y gatos en España',
    descripcion:
      'Calendario orientativo de vacunas para perros y gatos en España: vacunas esenciales, edades, recordatorios y por qué son importantes. Consulta siempre con tu veterinario.',
    emoji: '💉',
    resumen:
      'Las vacunas protegen a tu mascota de enfermedades graves. Repasamos las principales para perros y gatos y a qué edad se ponen (siempre bajo criterio veterinario).',
    actualizado: '2026-06-08',
    actualizadoTexto: 'junio de 2026',
    lectura: '6 min',
    secciones: [
      {
        h: 'Por qué son importantes las vacunas',
        parrafos: [
          'Las vacunas preparan el sistema inmunitario de tu mascota para defenderse de enfermedades infecciosas que pueden ser graves o mortales. Además de proteger a tu animal, ayudan a frenar la transmisión de enfermedades como la rabia, que también afecta a las personas.',
          'Este calendario es orientativo. El plan exacto depende de la edad, el estado de salud, el estilo de vida y la zona donde vivís. Tu veterinario es quien debe establecer y ajustar la pauta concreta de tu mascota.',
        ],
      },
      {
        h: 'Vacunas habituales en perros',
        parrafos: ['Las vacunas caninas suelen empezar hacia las 6-8 semanas de vida, con recordatorios cada pocas semanas hasta completar la pauta de cachorro:'],
        lista: [
          'Parvovirosis y moquillo: de las más importantes, se inician en las primeras semanas.',
          'Hepatitis y leptospirosis: habituales dentro de las vacunas polivalentes.',
          'Rabia: obligatoria en buena parte de España; consulta la normativa de tu comunidad autónoma.',
          'Tos de las perreras: recomendable si tu perro acude a guarderías, residencias o tiene mucho contacto con otros perros.',
          'Recordatorios anuales: la mayoría de pautas incluyen una revacunación periódica para mantener la inmunidad.',
        ],
      },
      {
        h: 'Vacunas habituales en gatos',
        parrafos: ['En gatos, la vacunación también arranca en las primeras semanas de vida:'],
        lista: [
          'Trivalente felina (panleucopenia, rinotraqueítis y calicivirus): la base de la protección.',
          'Leucemia felina: especialmente recomendada en gatos con acceso al exterior.',
          'Rabia: según la normativa de tu zona y si el gato sale al exterior o viaja.',
          'Recordatorios periódicos: tu veterinario indicará cada cuánto revacunar.',
        ],
      },
      {
        h: 'Más allá de las vacunas: desparasitación',
        parrafos: [
          'La vacunación va de la mano de un buen plan de desparasitación, tanto interna (lombrices y otros parásitos intestinales) como externa (pulgas, garrapatas y mosquitos transmisores de la leishmaniosis). La frecuencia depende del animal y de la época del año.',
          'En tu revisión anual, aprovecha para repasar con el veterinario tanto las vacunas pendientes como la desparasitación. ¿No tienes clínica de confianza? Busca [clínicas veterinarias cerca de ti](/clinicas) y pide cita para un chequeo.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Es obligatorio vacunar a mi mascota?',
        a: 'La vacuna de la rabia es obligatoria en gran parte de España, aunque varía según la comunidad autónoma. El resto son muy recomendables para proteger la salud de tu mascota. Consulta la normativa local con tu veterinario.',
      },
      {
        q: '¿A qué edad se pone la primera vacuna?',
        a: 'Normalmente las primeras vacunas se inician hacia las 6-8 semanas de vida, con recordatorios cada pocas semanas hasta completar la pauta de cachorro o gatito.',
      },
      {
        q: '¿Qué pasa si se me olvida un recordatorio?',
        a: 'Si se retrasa una dosis, contacta con tu veterinario lo antes posible. En algunos casos habrá que reiniciar parte de la pauta para asegurar una protección correcta.',
      },
    ],
  },
  {
    slug: 'cuanto-cuesta-veterinario',
    titulo: 'Cuánto cuesta el veterinario en España',
    metaTitulo: 'Cuánto cuesta el veterinario en España (precios orientativos)',
    descripcion:
      'Precios orientativos del veterinario en España: consulta, vacunas, análisis, cirugías y urgencias. Por qué varían y cómo ahorrar sin renunciar a la calidad.',
    emoji: '💶',
    resumen:
      '¿Cuánto cuesta llevar a tu mascota al veterinario? Repasamos precios orientativos por servicio y los factores que hacen que varíen tanto de una clínica a otra.',
    actualizado: '2026-06-08',
    actualizadoTexto: 'junio de 2026',
    lectura: '5 min',
    secciones: [
      {
        h: 'Por qué varían tanto los precios',
        parrafos: [
          'En España no existe un precio fijo para los servicios veterinarios: cada clínica establece sus tarifas. Por eso el coste puede variar bastante según la ciudad, el tipo de centro (clínica de barrio u hospital con especialistas), el equipamiento disponible y la complejidad de cada caso.',
          'Esto no significa que lo más caro sea siempre mejor ni lo más barato peor. La clave es entender qué incluye cada presupuesto y compararlo con criterio. Pedir el precio por adelantado y por escrito es totalmente normal y recomendable.',
        ],
      },
      {
        h: 'Precios orientativos por servicio',
        parrafos: [
          'Estas cifras son aproximadas y solo sirven como referencia general: pueden cambiar mucho según la clínica y tu zona. Pide siempre presupuesto en tu centro:',
        ],
        lista: [
          'Consulta general: suele ser el servicio más económico y la puerta de entrada a cualquier tratamiento.',
          'Vacunación: el precio varía según el tipo de vacuna y si incluye la revisión.',
          'Análisis de sangre y pruebas: dependen del número de parámetros y de si la clínica tiene laboratorio propio.',
          'Radiografía o ecografía: varían según la zona explorada y el equipo.',
          'Cirugías (esterilización, extracciones dentales, etc.): es donde más difieren los presupuestos; influye el tipo de anestesia y el postoperatorio.',
          'Urgencias: tienen un recargo respecto a la consulta normal por la atención inmediata y el horario.',
        ],
      },
      {
        h: 'Cómo ahorrar sin renunciar a la calidad',
        parrafos: ['Cuidar la salud de tu mascota no tiene por qué arruinarte. Algunas ideas para gestionar mejor el gasto:'],
        lista: [
          'La prevención sale a cuenta: vacunas, desparasitación y revisiones anuales evitan tratamientos caros más adelante.',
          'Pide y compara presupuestos para intervenciones programadas (no para una urgencia).',
          'Pregunta por planes de salud o cuotas mensuales que algunas clínicas ofrecen.',
          'Valora un seguro veterinario si tu mascota es propensa a problemas de salud.',
          'Detecta los problemas pronto: una consulta a tiempo siempre es más barata que una urgencia.',
        ],
      },
      {
        h: 'Compara antes de decidir',
        parrafos: [
          'Para tratamientos no urgentes, merece la pena comparar un par de clínicas. En VetEspaña puedes ver la información de contacto y especialidades de [clínicas veterinarias de toda España](/clinicas) y llamar para pedir presupuesto. Y para imprevistos, ten siempre localizadas las [urgencias 24h cercanas](/clinicas?urgencias=1).',
        ],
      },
    ],
    faq: [
      {
        q: '¿Cuánto cuesta una consulta veterinaria?',
        a: 'La consulta general suele ser el servicio más económico, pero el precio varía según la clínica y la ciudad. Lo mejor es preguntar directamente en el centro, ya que cada clínica fija sus propias tarifas.',
      },
      {
        q: '¿Es más caro el veterinario de urgencias?',
        a: 'Sí, las urgencias suelen tener un recargo respecto a la consulta normal por la atención inmediata y el horario, además de las pruebas o tratamientos que se necesiten.',
      },
      {
        q: '¿Merece la pena un seguro veterinario?',
        a: 'Depende de tu mascota y de tu situación. Puede compensar en animales propensos a problemas de salud o ante el riesgo de cirugías caras. Compara coberturas y condiciones antes de contratarlo.',
      },
    ],
  },
]

export function getGuia(slug: string): Guia | undefined {
  return GUIAS.find((g) => g.slug === slug)
}
