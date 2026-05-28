import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
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
