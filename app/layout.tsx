import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/lib/providers'
import { ProfileProvider } from "@/lib/profile"


export const metadata: Metadata = {
  title: 'IntelliLearn',
  description: 'New way to learn and earn',
  generator: 'Pranshu Rastogi',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </Providers>
      </body>
    </html>
  )
}
