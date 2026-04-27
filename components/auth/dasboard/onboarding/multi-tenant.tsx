'use client'

import { useEffect, useState } from 'react'
import { Home, User, Key } from 'lucide-react'
import type { TenantMatchData } from './tenant-confirm'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function TenantSelect({ onDone }: { onDone: () => void }) {
  const [list, setList] = useState<TenantMatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tenant/match')
      .then(res => res.json())
      .then(res => {
        if (Array.isArray(res)) setList(res)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-center text-[#6b7280] text-[14px] animate-pulse">Finding your properties...</div>
  if (list.length === 0) return <div className="p-8 text-center text-[#6b7280] text-[14px]">No pending assignments found.</div>

  const handleSelect = async (id: string) => {
    setProcessing(id)
    await fetch('/api/tenant/confirm', {
      method: 'POST',
      body: JSON.stringify({ profileId: id }),
    })
    onDone()
  }

  return (
    <div className="flex flex-col">
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">Select your tenancy</DialogTitle>
        <DialogDescription className="text-[14px] text-[#6b7280] dark:text-gray-400">
          We found multiple properties linked to your account.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
        {list.map((p) => (
          <button
            key={p.id}
            disabled={processing !== null}
            onClick={() => handleSelect(p.id)}
            className={`w-full text-left bg-white dark:bg-gray-950 border border-[#e5e7eb] dark:border-gray-800 rounded-[12px] p-4 shadow-sm transition-all hover:border-[#f97316]/50 group relative ${processing === p.id ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#f97316]/10 p-2.5 rounded-[10px] text-[#f97316] group-hover:bg-[#f97316] group-hover:text-white transition-colors"><Home size={18} /></div>
                  <div>
                    <p className="font-medium text-[15px] text-gray-900 dark:text-white">{p.property.name}</p>
                  </div>
                </div>
                
                {processing === p.id ? (
                   <div className="h-5 w-5 rounded-full border-2 border-[#f97316] border-t-transparent animate-spin mr-2" />
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 pointer-events-none transition-colors group-hover:bg-[#f97316]/10 group-hover:text-[#f97316]">Select</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <User size={14} className="opacity-70"/> <span>{p.owner.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <Key size={14} className="opacity-70"/> <span>Room {p.room.roomNumber}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}