'use client'

import { useEffect, useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Home, User, Key, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export interface TenantMatchData {
  id: string
  name: string
  property: { name: string }
  owner: { name: string }
  room: { roomNumber: string }
}

export default function TenantConfirm({ onDone }: { onDone: () => void }) {
  const [data, setData] = useState<TenantMatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetch('/api/tenant/match')
      .then(res => res.json())
      .then(res => {
        if (Array.isArray(res) && res.length > 0) setData(res[0])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-center text-[#6b7280] text-[14px] animate-pulse">Loading property details...</div>
  if (!data) return <div className="p-8 text-center text-[#6b7280] text-[14px]">No pending assignments found.</div>

  const handleConfirm = async () => {
    setProcessing(true)
    await fetch('/api/tenant/confirm', { method: 'POST', body: JSON.stringify({ profileId: data.id }) })
    onDone()
  }

  const handleReject = async () => {
    setProcessing(true)
    await fetch('/api/tenant/reject', { method: 'POST', body: JSON.stringify({ profileId: data.id }) })
    onDone()
  }

  return (
    <div className="flex flex-col">
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">Confirm your tenancy</DialogTitle>
        <DialogDescription className="text-[14px] text-[#6b7280] dark:text-gray-400">
          Only public details are shown until you confirm.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 py-4">
        <div className="rounded-xl border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-4 shadow-sm">
          <Row icon={<Home className="h-4 w-4" />} label="Property" value={data.property.name} />
          <Row icon={<User className="h-4 w-4" />} label="Owner" value={data.owner.name} />
          <Row icon={<Key className="h-4 w-4" />} label="Room" value={data.room.roomNumber} />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
        <Button 
          onClick={handleReject}
          disabled={processing}
          variant="outline" 
          className="flex-1 rounded-full text-[#6b7280] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-[#e5e7eb] dark:border-gray-800 font-medium h-10 shadow-sm transition-all"
        >
          <XCircle className="h-4 w-4 mr-1.5" /> Not me
        </Button>
        
        <Button 
          onClick={handleConfirm} 
          disabled={processing}
          className="flex-1 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-medium h-10 shadow-sm transition-all"
        >
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm</>)}
        </Button>
      </div>
    </div>
  )
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-[#f97316]/10 text-[#f97316] p-2 rounded-lg shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[12px] text-[#9ca3af] font-semibold uppercase tracking-wider">{label}</p>
        <p className="font-medium text-[14px] text-gray-900 dark:text-white">{value || "—"}</p>
      </div>
    </div>
  )
}