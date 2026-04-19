'use client'

import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/lib/context/auth-context'
import { cn } from '@/lib/utils'
import { Building2, Users } from 'lucide-react'

export default function StepRole() {
  const { onboarding, setUserRole, setCurrentStep } = useAuthContext()

  const selected = onboarding.userRole

  const handleSelect = (role: 'OWNER' | 'TENANT') => {
    setUserRole(role)
  }

  const handleContinue = () => {
    if (!selected) return
    setCurrentStep(2)
  }

  return (
    <div className="space-y-4">

      <button
        onClick={() => handleSelect('OWNER')}
        className={cn(
          'w-full flex items-center gap-4 p-4 rounded-lg border transition cursor-pointer',
          selected === 'OWNER'
            ? 'border-primary bg-primary/5'
            : 'border-border hover:bg-muted/40'
        )}
      >
        <Building2 className="w-5 h-5 text-primary" />

        <div className="text-left">
          <p className="font-medium">I am a property owner</p>
          <p className="text-xs text-muted-foreground">
            Manage properties, tenants, and rent
          </p>
        </div>

        {selected === 'OWNER' && (
          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
        )}
      </button>

      <button
        onClick={() => handleSelect('TENANT')}
        className={cn(
          'w-full flex items-center gap-4 p-4 rounded-lg border transition cursor-pointer',
          selected === 'TENANT'
            ? 'border-primary bg-primary/5'
            : 'border-border hover:bg-muted/40'
        )}
      >
        <Users className="w-5 h-5 text-primary" />

        <div className="text-left">
          <p className="font-medium">I am a tenant</p>
          <p className="text-xs text-muted-foreground">
            Track rent and payments
          </p>
        </div>

        {selected === 'TENANT' && (
          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
        )}
      </button>

      <Button
        className="w-full h-11 mt-2"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue
      </Button>

    </div>
  )
}