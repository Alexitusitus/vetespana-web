import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Servimos las fotos directamente desde su origen (Airtable / Google) SIN pasar
    // por el optimizador de Vercel. El plan gratuito (Hobby) tiene una cuota mensual
    // de optimización de imágenes; al superarla, /_next/image devuelve 402 y TODAS
    // las fotos se rompen en la web. Con unoptimized evitamos esa dependencia y coste.
    // (Si en el futuro se pasa a Vercel Pro, se puede quitar para recuperar WebP/resize.)
    unoptimized: true,
    remotePatterns: [
      {
        // Airtable adjuntos
        protocol: 'https',
        hostname: '*.airtableusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'v5.airtableusercontent.com',
      },
      {
        // Google Maps Place Photos
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
    ],
  },
}

export default nextConfig
