import Script from 'next/script'

interface GoogleAdSenseScriptProps {
  clientId?: string
}

export default function GoogleAdSenseScript({ clientId }: GoogleAdSenseScriptProps) {
  const publisherId = clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // If no publisher ID is configured yet, do not load the external AdSense script
  if (!publisherId || publisherId === 'ca-pub-0000000000000000') {
    return null
  }

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
