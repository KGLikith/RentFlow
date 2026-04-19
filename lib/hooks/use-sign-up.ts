/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface SignUpCredentials {
  email: string
  password: string
  fullName: string
  role: 'OWNER' | 'TENANT'
}

export function usePropertySignUp() {
  const { signUp, fetchStatus } = useSignUp()
  const router = useRouter()

  
  const [pendingCreation, setPendingCreation] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  const [signupData, setSignupData] = useState<SignUpCredentials | null>(null)
  
  const resetSignUp = () => {
    setPendingCreation(false)
    setSignupData(null)
    setCustomError(null)
  }
  const initializeSignUp = async (data: SignUpCredentials) => {
    const { email, password, fullName } = data

    setCustomError(null)

    try {
      const [firstName, ...rest] = fullName.trim().split(' ')
      const lastName = rest.join(' ') || undefined

      const { error } = await signUp.password({
        emailAddress: email,
        password,
        firstName,
        lastName,
        legalAccepted: true,
      })

      if (error) {
        const message = error.longMessage || error.message || 'Signup failed'
        setCustomError(message)
        toast.error(message)
        return false
      }

      setSignupData(data)

      const { error: otpError } = await signUp.verifications.sendEmailCode()

      if (otpError) {
        const message =
          otpError.longMessage || otpError.message || 'Failed to send OTP'
        setCustomError(message)
        toast.error(message)
        return false
      }

      setPendingCreation(true)
      toast.success('OTP sent to your email')
      return true
    } catch (err: any) {
      const message = err?.message || 'Signup failed'
      setCustomError(message)
      toast.error(message)
      return false
    }
  }

  const resendOTP = async () => {
    console.log("Before resendoing")
    console.log("Pending creation", pendingCreation)
    if (!signUp || !pendingCreation) return
    
    try {
      await signUp.verifications.sendEmailCode()
      console.log("After resendoing")
      toast.success('OTP sent again')
    } catch {
      toast.error('Failed to resend OTP')
    }
  }

  const verifyOTP = async (otp: string) => {
    setCustomError(null)

    console.log("Sign up data", signupData)

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: otp.trim(),
      })

      if (error) {
        const message =
          error.longMessage || error.message || 'Invalid or expired OTP'
        setCustomError(message)
        toast.error(message)
        return false
      }

      if (signUp.status !== 'complete') {
        const message = 'Signup not complete'
        setCustomError(message)
        toast.error(message)
        return false
      }

      if (!signupData) {
        const message = 'Missing signup data'
        setCustomError(message)
        toast.error(message)
        return false
      }

      const { error: finalizeError } = await signUp.finalize()

      if (finalizeError) {
        const message =
          finalizeError.longMessage ||
          finalizeError.message ||
          'Finalize failed'
        setCustomError(message)
        toast.error(message)
        return false
      }

      const res = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email,
          name: signupData.fullName,
          role: signupData.role,
        }),
      })

      if (!res.ok) {
        const msg = 'Failed to create user in DB'
        setCustomError(msg)
        toast.error(msg)
        return false
      }

      toast.success('Account created successfully!')
      setPendingCreation(false)

      router.push('/dashboard')

      return true
    } catch (err: any) {
      const message = err?.message || 'Verification failed'
      setCustomError(message)
      toast.error(message)
      return false
    }
  }

  return {
    initializeSignUp,
    verifyOTP,
    resendOTP,
    pendingCreation,
    loading: fetchStatus === 'fetching',
    error: customError,
    resetSignUp
  }
}