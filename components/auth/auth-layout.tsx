import { AuthProvider } from '@/lib/context/auth-context'
import { Building2 } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex flex-col">
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-600">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">
                Property Manager
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Rental Management
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-md mx-auto px-4 py-8 sm:py-12">
          {title && (
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          )}

          {children}
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-md mx-auto px-4 py-4 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              © 2024 Property Manager. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
