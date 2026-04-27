'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function OwnerProfile({ onDone, defaultValues }: { onDone: () => void, defaultValues?: { name?: string, phone?: string, upiId?: string } }) {
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    await fetch('/api/onboarding/profile', {
      method: 'POST',
      body: JSON.stringify({
        name: form.get('name'),
        phone: form.get('phone'),
        upiId: form.get('upiId'),
      }),
    })

    onDone()
  }

  const inputClass = 'h-10 rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all shadow-xs'

  return (
    <form onSubmit={submit} className="flex flex-col">
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">Complete your profile</DialogTitle>
        <DialogDescription className="text-[14px] text-[#6b7280] dark:text-gray-400">
          Add a few details to get started collecting rent.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 py-4 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Full name</Label>
          <Input 
            name="name" 
            placeholder="e.g. John Doe" 
            required 
            defaultValue={defaultValues?.name}
            className={inputClass} 
            disabled={loading} 
            autoFocus
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Phone</Label>
          <Input 
            name="phone" 
            placeholder="+91 98765 43210" 
            required 
            type="tel"
            defaultValue={defaultValues?.phone}
            className={inputClass} 
            disabled={loading} 
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">UPI ID</Label>
          <Input 
            name="upiId" 
            placeholder="yourname@bank" 
            required 
            defaultValue={defaultValues?.upiId}
            className={inputClass} 
            disabled={loading} 
          />
          <p className="text-[12px] text-muted-foreground mt-1">
            Used to receive rent. Example: <span className="font-mono text-gray-600 dark:text-gray-400">9876543210@upi</span>
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end">
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full rounded-full bg-[#f97316] text-white hover:bg-[#ea580c] font-medium shadow-sm transition-all h-10"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save & Continue"
          )}
        </Button>
      </div>
    </form>
  )
}