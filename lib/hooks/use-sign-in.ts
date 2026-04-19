'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
    try {
      setCustomError(null)

      await signIn.create({ identifier: email })

      const { error } = await signIn.password({
        identifier: email,
        password,
      })

      if (error) {
        console.log(error)
        setCustomError('Invalid email or password')
        toast.error('Invalid credentials')
        return false
      }

      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize()

        if (finalizeError) {
          const message =
            finalizeError.longMessage ||
            finalizeError.message ||
            'Finalize failed'
          setCustomError(message)
          toast.error(message)
          return false
        }

        toast.success('Welcome back!')
        router.push('/dashboard')
        return true
      }

      if (signIn.status === 'needs_new_password') {
        router.push('/auth/forgot-password')
        toast.error('Additional verification required')
        return false
      }

      if (signIn.status === 'needs_second_factor') {
        setCustomError('Additional verification required')
        toast.error('Additional verification required')
        return false
      }

      setCustomError('Unable to sign in')
      return false

    } catch (err) {
      console.log(err)
      setCustomError('Something went wrong')
      toast.error('Something went wrong')
      return false
    }
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