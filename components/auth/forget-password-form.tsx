'use client'

import { useState, useEffect } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import OTPInput from './sign-up/OTPInput'

export function ForgotPasswordForm() {
  const { signIn, fetchStatus } = useSignIn()

  const [phase, setPhase] = useState<'email' | 'otp' | 'reset'>('email')

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [timer, setTimer] = useState(0)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const loading = fetchStatus === 'fetching'

  const inputClass =
    'h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 pr-10 text-[13.5px] font-medium leading-tight placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary w-full'

  const labelClass =
    'text-[13px] font-medium text-gray-700 dark:text-gray-300'

  useEffect(() => {
    if (timer <= 0) return
    const t = setInterval(() => setTimer((p) => p - 1), 1000)
    return () => clearInterval(t)
  }, [timer])

  const handleSendOTP = async () => {
    setError(null)

    try {
      await signIn.create({ identifier: email })
      await signIn.resetPasswordEmailCode.sendCode()
    } catch {
    }

    setPhase('otp')
    setTimer(30)
  }

  const handleVerify = async () => {
    setError(null)

    if (code.length !== 6) {
      setError('Enter valid 6-digit code')
      return
    }

    const { error } =
      await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      })

    if (error) {
      setError('Invalid or expired code')
      return
    }

    setPhase('reset')
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const { error } =
      await signIn.resetPasswordEmailCode.submitPassword({
        password,
      })

    if (error) {
      setError(error.message)
      return
    }

    await signIn.finalize()
    window.location.href = '/dashboard'
  }

  const handleResend = async () => {
    await signIn.resetPasswordEmailCode.sendCode()
    setTimer(30)
  }

  return (
    <div className="space-y-6">

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {phase === 'email' && 'Reset your password'}
          {phase === 'otp' && 'Verify your email'}
          {phase === 'reset' && 'Set a new password'}
        </h1>

        <p className="text-sm text-muted-foreground">
          {phase === 'email' && 'If an account exists, we’ll send a reset code'}
          {phase === 'otp' && 'Enter the 6-digit code sent to your email'}
          {phase === 'reset' && 'Choose a strong password'}
        </p>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Email</label>

        <div className="flex items-center gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={phase !== 'email' || loading}
            placeholder="you@example.com"
            className={`${inputClass} ${
              loading ? 'cursor-not-allowed opacity-70' : ''
            }`}
          />

          {phase !== 'email' && (
            <button
              type="button"
              onClick={() => {
                setPhase('email')
                setCode('')
              }}
              className="text-sm text-primary font-medium cursor-pointer"
            >
              Change
            </button>
          )}
        </div>
      </div>

      {phase === 'email' && (
        <Button
          onClick={handleSendOTP}
          disabled={!email || loading}
          className={`w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ${
            loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            'Send OTP'
          )}
        </Button>
      )}

      {phase === 'otp' && (
        <div className="space-y-5">

          <div className="space-y-2 text-center">
            <label className={labelClass}>Enter OTP</label>
            <OTPInput onChange={setCode} disabled={loading} />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className={`w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ${
              loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {timer > 0 ? (
              `Resend in ${timer}s`
            ) : (
              <button
                onClick={handleResend}
                disabled={loading}
                className={`text-primary font-medium ${
                  loading
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:underline'
                }`}
              >
                Send again
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4">

          <div className="space-y-2">
            <label className={labelClass}>New Password</label>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                className={`${inputClass} ${
                  loading ? 'cursor-not-allowed opacity-70' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Confirm Password</label>

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                className={`${inputClass} ${
                  loading ? 'cursor-not-allowed opacity-70' : ''
                }`}
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                disabled={loading}
                className="absolute right-3 top-2.5 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className='cursor-pointer' size={16} />
                ) : (
                  <Eye className='cursor-pointer' size={16} />
                )}
              </button>
            </div>
          </div>

          <Button
            disabled={loading}
            className={`w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ${
              loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <p className="text-sm text-center text-muted-foreground">
        Back to{' '}
        <Link href="/auth/sign-in" className="text-primary font-medium cursor-pointer">
          Sign in
        </Link>
      </p>
    </div>
  )
}