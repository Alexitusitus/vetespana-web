import Script from 'next/script'

/**
 * Microsoft Clarity (gratis): grabaciones de sesión + mapas de calor.
 * Se activa solo si existe la variable NEXT_PUBLIC_CLARITY_ID (el ID del
 * proyecto que se crea en https://clarity.microsoft.com). Sin ID, no hace nada.
 */
export default function Clarity() {
  const id = process.env.NEXT_PUBLIC_CLARITY_ID
  if (!id) return null

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${id}");`}
    </Script>
  )
}
