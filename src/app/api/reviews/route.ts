import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST(req: NextRequest) {
  try {
    const { clinicId, nombreUsuario, puntuacion, comentario, website } = await req.json()

    // Honeypot: si el campo trampa viene relleno es un bot. Respondemos "ok"
    // sin guardar nada para no darle pistas.
    if (website) {
      return NextResponse.json({ ok: true })
    }

    if (!clinicId || !nombreUsuario || !puntuacion || !comentario) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return NextResponse.json({ error: 'La puntuación debe ser entre 1 y 5' }, { status: 400 })
    }

    if (comentario.trim().length < 10) {
      return NextResponse.json({ error: 'El comentario es demasiado corto' }, { status: 400 })
    }

    // Filtro anti-spam: las reseñas con varios enlaces casi siempre son spam.
    const numEnlaces = (comentario.match(/https?:\/\/|www\.|\.(com|net|ru|xyz|info)\b/gi) ?? []).length
    if (numEnlaces >= 2) {
      return NextResponse.json({ ok: true })
    }

    await base('Reseñas').create([
      {
        fields: {
          'Clínica': [clinicId],
          'Nombre usuario': nombreUsuario.trim(),
          'Puntuación': puntuacion,
          'Comentario': comentario.trim(),
          'Fecha': new Date().toISOString().split('T')[0],
          'Aprobada': false,
        },
      },
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error creando reseña:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
