import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import clsx from 'clsx'

import '@/styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const baseTitle = 'HSHB'
const description =
  'The Hellenic School of High Barnet. Located in Cockfosters, North London Based in East Barnet Secondary School'

export const metadata: Metadata = {
  title: {
    template: `%s | ${baseTitle}`,
    default: baseTitle,
  },
  description,
  authors: { name: 'HSHB', url: 'www.hshb.org.uk' },
  category: 'Greek School',
  classification: 'Greek School in Cockfosters, Enfield, Barnet, North London',
  keywords: ['greek school', 'greekschool', 'enfield', 'barnet', 'cockfosters'],
  openGraph: {
    type: 'website',
    title: baseTitle,
    description,
    emails: ['info@hshb.org.uk', 'head@hshb.org.uk'],
    phoneNumbers: '+44 (0) 7753 829 692',
  },
  twitter: { site: '@HSHBInfo' },
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
      <GoogleAnalytics gaId="G-E02EY5EHFE" />
    </html>
  )
}
