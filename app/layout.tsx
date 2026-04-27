import type { Metadata } from 'next'
import { QueryProvider } from '@/lib/query-provider'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from '@/lib/context/auth-context'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Property Manager - Rental Management System',
  description: 'Comprehensive rental property management system',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <ClerkProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ClerkProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
