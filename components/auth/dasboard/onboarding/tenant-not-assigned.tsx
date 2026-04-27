import { AlertTriangle, Loader2 } from 'lucide-react'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function NoProperty() {
  const [fetching, setFetching] = useState(false)

  const handleRefresh = () => {
    setFetching(true)
    location.reload()
  }

  return (
    <div className="flex flex-col">
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle className="flex items-center gap-2 text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          Not assigned yet
        </DialogTitle>
        <DialogDescription className="text-[14px] text-[#6b7280] dark:text-gray-400">
          We couldn&apos;t find a tenancy linked to your account. Ask your landlord to add you using this email or phone number.
        </DialogDescription>
      </DialogHeader>
      
      <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col gap-2">
        <Button onClick={handleRefresh} disabled={fetching} className="w-full rounded-full bg-[#f97316] text-white hover:bg-[#ea580c] font-medium shadow-sm transition-all h-10">
          {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check again"}
        </Button>
      </div>
    </div>
  )
}