'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePropertySignIn } from '@/lib/hooks/use-sign-in'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function SignInForm() {
  const { handleSignIn, loading, error } = usePropertySignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSignIn({ email, password })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Email Address
        </label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="h-11"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            Forgot?
          </Link>
        </div>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="h-11"
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="space-y-2 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/sign-up"
            className="text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </form>
  )
}
