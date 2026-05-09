import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import clsx from 'clsx'

import '../styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const siteUrl = 'https://www.hshb.org.uk'
const baseTitle = 'Hellenic School of High Barnet'
const description =
  'The Hellenic School of High Barnet (HSHB) is a Greek language school in Cockfosters, North London, serving families across Barnet, Enfield, and Hertfordshire.'

export const metadata: Metadata = {
  title: {
    template: `%s | ${baseTitle}`,
    default: baseTitle,
  },
  description,
  metadataBase: new URL(siteUrl),
  authors: { name: 'HSHB', url: siteUrl },
  category: 'Education',
  classification: 'Greek Language School in North London',
  keywords: [
    'greek school london',
    'greek language school',
    'hellenic school',
    'greek school north london',
    'greek school barnet',
    'greek school enfield',
    'greek school cockfosters',
    'HSHB',
  ],
  openGraph: {
    type: 'website',
    title: baseTitle,
    description,
    url: siteUrl,
    siteName: baseTitle,
    emails: ['info@hshb.org.uk', 'head@hshb.org.uk'],
    phoneNumbers: '+44 (0) 7753 829 692',
  },
  twitter: { site: '@HSHBInfo', card: 'summary_large_image' },
  formatDetection: {
    address: true,
    date: true,
    email: true,
    telephone: true,
    url: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx(
        'h-full scroll-smooth bg-white antialiased',
        inter.variable,
      )}
    >
      <head>
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
      {process.env.NODE_ENV === 'production' && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      )}
    </html>
  )
}
