'use client'

import { useState } from 'react'
import { useUserProfile, useUpdateProfile } from '@/hooks/useUserProfile'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import {
  User, Phone, Wallet, Mail, Loader2, CheckCircle2, Settings2, Shield
} from 'lucide-react'
import { toast } from 'sonner'

const inputClass = 'h-10 rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all shadow-xs outline-none'

export default function SettingsPage() {
  const { data: profile, isLoading } = useUserProfile()
  const { mutate: updateProfile, isPending, isSuccess } = useUpdateProfile()

  // Controlled fields — default to empty, override once profile loads via defaultValue
  const [name, setName] = useState<string | undefined>(undefined)
  const [phone, setPhone] = useState<string | undefined>(undefined)
  const [upiId, setUpiId] = useState<string | undefined>(undefined)

  // Resolved display values — prefer user-edited state, else profile data
  const displayName = name ?? profile?.name ?? ''
  const displayPhone = phone ?? profile?.phone ?? ''
  const displayUpiId = upiId ?? profile?.upiId ?? ''

  const handleSave = () => {
    updateProfile({ name: displayName, phone: displayPhone, upiId: displayUpiId }, {
      onSuccess: () => toast.success('Profile updated successfully!'),
      onError: (err) => toast.error(err.message || 'Failed to update profile'),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings2 className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and profile</p>
        </div>
      </div>

      <div className="space-y-4 pb-8">
        {/* Account info from Clerk */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-orange-50 grid place-items-center">
                <User className="h-4 w-4 text-[#f97316]" />
              </div>
              <h2 className="text-sm font-semibold">Clerk Account</h2>
            </div>
            <div className="flex items-center gap-4">
              <UserButton showName />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Your sign-in email and profile photo are managed via Clerk.</p>
          </CardContent>
        </Card>

        {/* Editable Profile Fields */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-50 grid place-items-center">
                <User className="h-4 w-4 text-[#f97316]" />
              </div>
              <h2 className="text-sm font-semibold">Profile Details</h2>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
                <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
                <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
              </div>
            ) : (
              <>
                {/* Read-only email */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                    <Mail className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5 text-gray-400" />
                    Email Address
                  </Label>
                  <Input
                    value={profile?.email || ''}
                    readOnly
                    className={`${inputClass} bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed`}
                  />
                  <p className="text-[11px] text-muted-foreground">Managed by Clerk — cannot be changed here.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                    <User className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
                    Full Name
                  </Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                    <Phone className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
                    Phone Number
                  </Label>
                  <Input
                    value={displayPhone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                    <Wallet className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5 text-emerald-500" />
                    UPI ID
                  </Label>
                  <Input
                    value={displayUpiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. rahul@upi"
                    className={inputClass}
                  />
                  <p className="text-[11px] text-muted-foreground">Used for rent collection links sent to your tenants.</p>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isPending}
                  className="w-full rounded-full bg-[#f97316] text-white hover:bg-[#ea580c] font-medium h-10 gap-2"
                >
                  {isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  ) : isSuccess ? (
                    <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-8 rounded-full bg-orange-50 grid place-items-center">
                <Shield className="h-4 w-4 text-[#f97316]" />
              </div>
              <h2 className="text-sm font-semibold">Notifications</h2>
            </div>
            {[
              'Email notifications for new payments',
              'Email notifications for overdue invoices',
              'Monthly summary reports',
            ].map((label) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-checked:bg-[#f97316] rounded-full transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
            <p className="text-xs text-muted-foreground">Deleting your account is permanent and cannot be undone. All properties, tenants, and invoices will be lost.</p>
            <Button variant="destructive" className="rounded-full h-9 text-sm bg-red-600 hover:bg-red-700">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
