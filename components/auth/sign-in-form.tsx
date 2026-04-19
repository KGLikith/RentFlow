'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePropertySignIn } from '@/lib/hooks/use-sign-in'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function SignInForm() {
  const { handleSignIn, loading, error } = usePropertySignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSignIn({ email, password })
  }

  const inputClass =
    'h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 pr-10 text-[13.5px] font-medium leading-tight placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary w-full'


  return (
    <form onSubmit={onSubmit} className="space-y-4">

      <div className="space-y-2">
        <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={inputClass}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <Link
            href="/auth/forget-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot?
          </Link>
        </div>

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={inputClass}
          minLength={8}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[32px] text-gray-400 hover:text-gray-600 flex items-center justify-center"
        >
          {showPassword ? <EyeOff className='cursor-pointer' size={16} /> : <Eye className='cursor-pointer' size={16} />}
        </button>
        <p
          className={`text-[11px] ${password && password.length < 8
              ? 'text-red-500'
              : 'text-muted-foreground'
            }`}
        >
          Password must be at least 8 characters
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !email || password.length < 8}
        className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in →
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/sign-up"
          className="text-primary font-medium hover:underline"
        >
          Sign up
        </Link>
      </div>

    </form>
  )
}