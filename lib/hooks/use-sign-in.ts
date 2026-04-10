'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface SignInCredentials {
  email: string
  password: string
}

export function usePropertySignIn() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const [customError, setCustomError] = useState<string | null>(null)

  const handleSignIn = async ({ email, password }: SignInCredentials) => {
    setCustomError(null)

    const { error } = await signIn.password({
      identifier: email,
      password,
    })

    if (error) {
      console.error(error)
      setCustomError('Invalid email or password')
      toast.error('Invalid credentials')
      return false
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          router.push(decorateUrl('/tenant/check-state'))
        },
      })

      toast.success('Welcome back!')
      return true
    }

    return false
  }

  const error =
    customError ||
    errors?.fields?.identifier?.message ||
    errors?.fields?.password?.message ||
    null

  return {
    handleSignIn,
    loading: fetchStatus === 'fetching',
    error,
  }
}