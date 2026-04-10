'use client'

import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function usePropertySignUp() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const router = useRouter()

  const [pendingCreation, setPendingCreation] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)

  const initializeSignUp = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    setCustomError(null)

    const [firstName, ...rest] = fullName.trim().split(' ')
    const lastName = rest.join(' ') || undefined

    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName,
    })

    if (error) {
      console.error(error)
      setCustomError('Signup failed')
      toast.error('Signup failed')
      return false
    }

    await signUp.verifications.sendEmailCode()

    setPendingCreation(true)
    toast.success('OTP sent to email')
    return true
  }

  const verifyOTP = async (
    otp: string,
    fullName: string,
    upiId?: string
  ) => {
    setCustomError(null)

    await signUp.verifications.verifyEmailCode({
      code: otp,
    })

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          router.push(decorateUrl('/dashboard'))
        },
      })

      // Optional: store extra data
      if (upiId) {
        sessionStorage.setItem('ownerUPI', upiId)
        sessionStorage.setItem('ownerFullName', fullName)
      }

      setPendingCreation(false)
      toast.success('Account created successfully!')
      return true
    }

    setCustomError('Verification failed')
    toast.error('Invalid OTP')
    return false
  }

  const error =
    customError ||
    errors?.fields?.emailAddress?.message ||
    errors?.fields?.password?.message ||
    errors?.fields?.code?.message ||
    null

  return {
    initializeSignUp,
    verifyOTP,
    pendingCreation,
    loading: fetchStatus === 'fetching',
    error,
  }
}