'use client'

import { useState, useEffect } from 'react'
import { usePropertySignUp } from '@/lib/hooks/use-sign-up'
import { Button } from '@/components/ui/button'
import OTPInput from './OTPInput'

export default function StepVerify({ verifyOTP, resendOTP, loading, error }: ReturnType<typeof usePropertySignUp>) {
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    if (timer <= 0) return

    const interval = setInterval(() => {
      setTimer((t) => t - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) return

    await verifyOTP(otp)
  }

  const handleResend = async () => {
    await resendOTP()
    setTimer(30)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="space-y-4 text-center">
        <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
          Enter OTP
        </label>

        <OTPInput onChange={setOtp} />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {timer > 0 ? (
          <span>Resend in {timer}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-primary font-medium hover:underline cursor-pointer"
          >
            Send again
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
      >
        {loading ? 'Verifying...' : 'Verify & Create →'}
      </Button>

    </form>
  )
}