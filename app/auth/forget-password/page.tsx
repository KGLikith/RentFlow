/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { AuthLayout } from '@/components/auth/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSignIn } from '@clerk/nextjs'
import { Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const { signIn, fetchStatus } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'email' | 'verify'>('email')
  const [customError, setCustomError] = useState<string | null>(null)

  const loading = fetchStatus === 'fetching'

  // STEP 1: Send reset code
  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setCustomError(null)

    try {
      // Start sign-in flow
      await signIn.create({
        identifier: email,
      })

      // Send email code (MFA flow)
      await signIn.mfa.sendEmailCode()

      setStep('verify')
      toast.success('Reset code sent to your email')
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        'Failed to send reset code'
      setCustomError(message)
      toast.error(message)
    }
  }

  // STEP 2: Verify code + reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setCustomError(null)

    if (newPassword !== confirmPassword) {
      setCustomError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setCustomError('Password must be at least 8 characters')
      return
    }

    try {
      // Verify email code
      const { error } = await signIn.mfa.verifyEmailCode({
        code,
      })

      if (error) throw error

      // Set new password
      await signIn.password({
        identifier: email,
        password: newPassword,
      })

      // Finalize session
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          router.push(decorateUrl('/dashboard'))
        },
      })

      toast.success('Password reset successful!')
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        'Failed to reset password'
      setCustomError(message)
      toast.error(message)
    }
  }

  // ================= UI =================

  if (step === 'email') {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Enter your email to receive a reset code"
      >
        <form onSubmit={handleSendReset} className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          {customError && (
            <p className="text-sm text-red-500">{customError}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Code'
            )}
          </Button>

          <Link href="/sign-in" className="text-sm text-emerald-600">
            Back to Sign In
          </Link>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter code and set a new password"
    >
      <form onSubmit={handleResetPassword} className="space-y-4">
        <Input
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
        />

        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {customError && (
          <p className="text-sm text-red-500">{customError}</p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStep('email')
              setCustomError(null)
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}