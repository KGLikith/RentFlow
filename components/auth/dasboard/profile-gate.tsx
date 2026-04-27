'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import OwnerProfile from './onboarding/owner-profile'
import CreateProperty from './onboarding/create-property'
import NoProperty from './onboarding/tenant-not-assigned'
import TenantConfirm from './onboarding/tenant-confirm'
import TenantSelect from './onboarding/multi-tenant'
import { Loader2 } from 'lucide-react'

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<string | null>(null)
  const [userData, setUserData] = useState<{name: string, phone: string, upiId: string}>({name: '', phone: '', upiId: ''})

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/user/state')
        const data = await res.json()
        setState(data.state)
        if (data.user) {
          setUserData(data.user)
        }
      } catch (err) {
        console.error('State check failed', err)
        setState('ERROR')
      }
    }

    check()
  }, [])

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  const blocked = state !== 'ACTIVE'

  return (
    <>
      {!blocked && children}

      <Dialog open={blocked}>
        <DialogContent 
          className="sm:max-w-md p-0 overflow-hidden [&>button]:hidden outline-none bg-[#fcfcfc] dark:bg-gray-900 border border-[#e5e7eb] dark:border-gray-800 rounded-[16px] shadow-xl" 
          onInteractOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {state === 'INCOMPLETE_PROFILE' && <OwnerProfile defaultValues={userData} onDone={() => location.reload()} />}
          {state === 'NO_PROPERTY' && <CreateProperty onDone={() => location.reload()} />}
          {state === 'UNASSIGNED' && <NoProperty />}
          {state === 'PENDING_VERIFICATION' && <TenantConfirm onDone={() => location.reload()} />}
          {state === 'MULTIPLE_SELECTION' && <TenantSelect onDone={() => location.reload()} />}
        </DialogContent>
      </Dialog>
    </>
  )
}