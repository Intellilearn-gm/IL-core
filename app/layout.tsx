import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/lib/providers'
import { ProfileProvider } from "@/lib/profile"
import { Analytics } from "@vercel/analytics/next"
import { OcidProvider } from '@/lib/ocid-provider'


export const metadata: Metadata = {
  title: 'IntelliLearn - The Future of Blockchain Learning',
  description: 'Learn Web3 by playing games! Master blockchain concepts through interactive gaming. Earn tokens, get NFTs, and build your decentralized identity with OCID.',
  keywords: 'blockchain, web3, education, gaming, nft, ocid, decentralized learning, crypto education',
  authors: [{ name: 'Pranshu Rastogi' }],
  creator: 'IntelliLearn Team',
  publisher: 'IntelliLearn',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://il-core.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'IntelliLearn - The Future of Blockchain Learning',
    description: 'Learn Web3 by playing games! Master blockchain concepts through interactive gaming.',
    url: 'https://il-core.vercel.app',
    siteName: 'IntelliLearn',
    images: [
      {
        url: '/favicon.ico',
        width: 32,
        height: 32,
        alt: 'IntelliLearn Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IntelliLearn - The Future of Blockchain Learning',
    description: 'Learn Web3 by playing games! Master blockchain concepts through interactive gaming.',
    creator: '@Intellilearn_ec',
    images: ['/favicon.ico'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon.png',
    },
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Providers>
          <OcidProvider>
            <ProfileProvider>
              <Analytics />
              {children}
            </ProfileProvider>
          </OcidProvider>
        </Providers>
      </body>
    </html>
  )
}