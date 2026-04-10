'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Property Manager</h1>
          <p className="text-xl text-gray-600">Manage your rental properties with ease</p>
          <p className="text-gray-500">Complete rental management system with tenant tracking, invoicing, and payment management</p>
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
            onClick={() => router.push('/sign-in')}
          >
            Sign In
          </Button>
          <Button 
            variant="outline"
            className="w-full py-6 text-lg border-gray-300"
            onClick={() => router.push('/sign-up')}
          >
            Create Account
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          Built for property managers to streamline rental operations
        </p>
      </div>
    </div>
  )
}
