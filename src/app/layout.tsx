import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'VetEspaña — Encuentra tu veterinario de confianza en España',
    template: '%s | VetEspaña',
  },
  description:
    'Directorio de clínicas veterinarias en España. Encuentra veterinarios por ciudad, especialidad y urgencias 24h. Fichas completas con fotos, horarios y reseñas.',
  keywords: [
    'veterinaria',
    'clínica veterinaria',
    'veterinario España',
    'urgencias veterinarias',
    'veterinario cerca',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'VetEspaña',
  },
  verification: {
    google: '6nCvZZXDFshsAsAl-yHK3T2iDNj70NB7OubJ06VMR-Q',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P4QGVKD4BN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P4QGVKD4BN');
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
