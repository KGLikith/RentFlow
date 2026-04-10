'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Building2, Users } from 'lucide-react'

interface RoleSelectorProps {
  onSelect: (role: 'OWNER' | 'TENANT') => void
  selected?: 'OWNER' | 'TENANT' | null
}

export function RoleSelector({ onSelect, selected }: RoleSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          How do you use Property Manager?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your role to get started
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Owner Card */}
        <button
          onClick={() => onSelect('OWNER')}
          className={cn(
            'p-4 rounded-lg border-2 transition-all duration-200 text-left',
            selected === 'OWNER'
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-emerald-400'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                selected === 'OWNER'
                  ? 'bg-emerald-600'
                  : 'bg-emerald-100 dark:bg-emerald-900'
              )}
            >
              <Building2
                className={cn(
                  'w-5 h-5',
                  selected === 'OWNER'
                    ? 'text-white'
                    : 'text-emerald-600 dark:text-emerald-400'
                )}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                I&apos;m a Property Owner
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage properties, tenants & payments
              </p>
            </div>
          </div>
        </button>

        {/* Tenant Card */}
        <button
          onClick={() => onSelect('TENANT')}
          className={cn(
            'p-4 rounded-lg border-2 transition-all duration-200 text-left',
            selected === 'TENANT'
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-emerald-400'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                selected === 'TENANT'
                  ? 'bg-emerald-600'
                  : 'bg-emerald-100 dark:bg-emerald-900'
              )}
            >
              <Users
                className={cn(
                  'w-5 h-5',
                  selected === 'TENANT'
                    ? 'text-white'
                    : 'text-emerald-600 dark:text-emerald-400'
                )}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                I&apos;m a Tenant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View rent, invoices & payments
              </p>
            </div>
          </div>
        </button>
      </div>

      {selected && (
        <Button
          onClick={() => {}} // Will be handled by parent
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-lg"
        >
          Continue
        </Button>
      )}
    </div>
  )
}
