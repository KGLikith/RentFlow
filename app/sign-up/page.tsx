'use client'

import { AuthLayout } from '@/components/auth/auth-layout'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { RoleSelector } from '@/components/auth/role-selector'
import { useAuthContext } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft } from 'lucide-react'

export default function SignUpPage() {
  const { onboarding, setUserRole, setCurrentStep, updateOwnerData } = useAuthContext()

  if (!onboarding.userRole) {
    return (
      <AuthLayout
        title="Create Account"
        subtitle="Join Property Manager to get started"
      >
        <RoleSelector
          selected={onboarding.userRole || null}
          onSelect={(role) => {
            setUserRole(role)
            setCurrentStep(1)
          }}
        />
      </AuthLayout>
    )
  }

  // Step 1: Collect Owner Details (if Owner)
  if (onboarding.userRole === 'OWNER' && onboarding.currentStep === 1) {
    return (
      <AuthLayout
        title="Your Details"
        subtitle="Tell us about yourself"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setCurrentStep(2)
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={onboarding.ownerName || ''}
              onChange={(e) => updateOwnerData({ ownerName: e.target.value })}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+91 98765 43210"
              value={onboarding.ownerPhone || ''}
              onChange={(e) => updateOwnerData({ ownerPhone: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Business Name
            </label>
            <Input
              type="text"
              placeholder="Your Company (optional)"
              value={onboarding.businessName || ''}
              onChange={(e) => updateOwnerData({ businessName: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUserRole(null)
                setCurrentStep(0)
              }}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Continue
            </Button>
          </div>
        </form>
      </AuthLayout>
    )
  }

  // Step 2: Email & Password
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle={`Register with ${onboarding.userRole === 'OWNER' ? 'your email' : 'your email'}`}
    >
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setCurrentStep(1)}
          className="mb-4 -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>
      <SignUpForm />
    </AuthLayout>
  )
}
