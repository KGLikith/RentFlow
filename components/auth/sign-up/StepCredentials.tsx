'use client'

import { usePropertySignUp } from '@/lib/hooks/use-sign-up'
import { useAuthContext } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function StepCredentials({ initializeSignUp, loading, error }: ReturnType<typeof usePropertySignUp>) {
  const { onboarding, setCurrentStep, updateOnboarding } = useAuthContext()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (onboarding.password !== onboarding.confirmPassword) {
      setLocalError("Passwords don't match")
      return
    }

    if (!onboarding.userRole) {
      setLocalError("Please select a role")
      return
    }

    const success = await initializeSignUp({
      email: onboarding.email,
      password: onboarding.password,
      fullName: onboarding.fullName || 'User',
      role: onboarding.userRole,
    })

    if (success) setCurrentStep(3)
  }

  const inputClass =
    'h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 pr-10 text-[13.5px] font-medium leading-tight placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary w-full'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      <div className="space-y-1">
        <label className="text-[13px] font-medium">Full name</label>
        <Input
          value={onboarding.fullName}
          onChange={(e) => updateOnboarding({ fullName: e.target.value })}
          className={inputClass}
          required
          placeholder='John Doe'
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[13px] font-medium">Email</label>
        <Input
          type="email"
          value={onboarding.email}
          onChange={(e) => updateOnboarding({ email: e.target.value })}
          className={inputClass}
          required
          placeholder='xyz@example.com'
          disabled={loading}
        />
      </div>

      <div className="space-y-1 relative">
        <label className="text-[13px] font-medium">Password</label>
        <Input
          type={showPassword ? 'text' : 'password'}
          value={onboarding.password}
          onChange={(e) => updateOnboarding({ password: e.target.value })}
          className={inputClass}
          required
          placeholder='********'
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[32px]"
          disabled={loading}
        >
          {showPassword ? <EyeOff className='cursor-pointer' size={16} /> : <Eye className='cursor-pointer' size={16} />}
        </button>
        <p
          className={`text-[11px] ${onboarding.password && onboarding.password.length < 8
            ? 'text-red-500'
            : 'text-muted-foreground'
            }`}
        >
          Password must be at least 8 characters
        </p>
      </div>

      <div className="space-y-1 relative">
        <label className="text-[13px] font-medium">Confirm Password</label>
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          value={onboarding.confirmPassword}
          onChange={(e) => updateOnboarding({ confirmPassword: e.target.value })}
          className={inputClass}
          required
          placeholder='*********'
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-[32px]"
          disabled={loading}
        >
          {showConfirmPassword ? <EyeOff className='cursor-pointer' size={16} /> : <Eye className='cursor-pointer' size={16} />}
        </button>
      </div>

      {(localError || error) && (
        <p className="text-sm text-red-500">
          {localError || error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12"
      >
        {loading ? 'Creating...' : 'Create account →'}
      </Button>

      <div id="clerk-captcha" />
    </form>
  )
}