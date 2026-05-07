'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Mail, IndianRupee, Hash, MapPin, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { bulkCreateTenants } from '@/lib/actions/tenant'
import { generateLeasePDF } from '@/lib/pdf-generator'
import { saveAs } from 'file-saver'

interface Property {
  id: string
  name: string
}

interface Room {
  id: string
  roomNumber: string
}

interface SingleTenantFormProps {
  onSuccess?: () => void
  initialPropertyId?: string
  initialRoomId?: string
  initialRent?: string | number
  isGlobal?: boolean
}

export function SingleTenantForm({ onSuccess, initialPropertyId, initialRoomId, initialRent, isGlobal }: SingleTenantFormProps) {
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  
  const [propertyId, setPropertyId] = useState(initialPropertyId || '')
  const [roomId, setRoomId] = useState(initialRoomId || '')
  
  const [email, setEmail] = useState('')
  const [rent, setRent] = useState(initialRent?.toString() || '')
  const [deposit, setDeposit] = useState('')
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [leaseMonths, setLeaseMonths] = useState('12')

  useEffect(() => {
    if (isGlobal) {
      fetch('/api/properties')
        .then(res => res.json())
        .then(data => setProperties(data))
    }
  }, [isGlobal])

  useEffect(() => {
    if (isGlobal && propertyId) {
      fetch(`/api/properties/${propertyId}/rooms`)
        .then(res => res.json())
        .then(data => setRooms(data))
    }
  }, [propertyId, isGlobal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyId || !roomId || !email || !rent || !deposit) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    try {
      // ── Pre-check: is the room already at capacity? ──────────────────────
      // We need to find the property for this room first
      const roomRes = await fetch(`/api/properties/${propertyId}/rooms`)
      if (roomRes.ok) {
        const allRooms: Array<{ id: string; capacity: number }> = await roomRes.json()
        const targetRoom = allRooms.find(r => r.id === roomId)
        if (targetRoom) {
          // Count active tenants in this room
          const roomDetailRes = await fetch(`/api/properties/${propertyId}/rooms/${roomId}`)
          if (roomDetailRes.ok) {
            const detail = await roomDetailRes.json()
            const currentOccupancy: number = detail.tenants?.length ?? 0
            if (currentOccupancy >= targetRoom.capacity) {
              toast.error(
                `Room is fully occupied (${currentOccupancy}/${targetRoom.capacity} tenants)`,
                { description: 'Please choose a different room or remove an existing tenant first.' }
              )
              setLoading(false)
              return
            }
          }
        }
      }
      const tenant = { rowIndex: 1, email, roomId, rent: Number(rent), deposit: Number(deposit), isValid: true }
      const res = await bulkCreateTenants(propertyId, [tenant])
      
      if (res.success > 0) {
        toast.success('Tenant successfully added and invited!')
        
        const created = res.details.created[0]
        if (created) {
          try {
            const start = new Date(startDate)
            const end = new Date(start)
            end.setMonth(end.getMonth() + Number(leaseMonths))
            
            const pdfBlob = generateLeasePDF({
              email: created.email,
              roomNumber: created.roomNumber || '',
              rentAmount: created.rentAmount || Number(rent),
              deposit: created.deposit || Number(deposit),
              propertyName: created.propertyName || 'Property',
              startDate: start,
              endDate: end
            })
            saveAs(pdfBlob, `Lease_${created.roomNumber}.pdf`)
            toast.success('Lease agreement downloaded')
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            toast.error('Failed to generate lease PDF')
          }
        }
        onSuccess?.()
      } else {
        toast.error(res.details.errors[0]?.error || 'Failed to add tenant')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all shadow-sm outline-none'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <DialogHeader className="px-6 pb-4 pt-6">
        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
          Add New Tenant
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500">
          Enter the tenant details to generate a lease and send an invite.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 pb-6 space-y-5 overflow-y-auto max-h-[60vh] scrollbar-none">
        
        {/* Accommodation Selection */}
        {isGlobal && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Property
              </Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger className="h-10 bg-white dark:bg-gray-950 border-orange-200 dark:border-orange-800">
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" /> Room
              </Label>
              <Select value={roomId} onValueChange={setRoomId} disabled={!propertyId}>
                <SelectTrigger className="h-10 bg-white dark:bg-gray-950 border-orange-200 dark:border-orange-800">
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.roomNumber}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Tenant Info */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tenant Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="tenant@example.com" 
              className={`${inputClass} pl-10`} 
              required
            />
          </div>
        </div>

        {/* Financials */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Monthly Rent</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#f97316]" />
              <Input 
                type="number" 
                value={rent} 
                onChange={e => setRent(e.target.value)} 
                placeholder="10000" 
                className={`${inputClass} pl-10 font-bold`} 
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Security Deposit</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input 
                type="number" 
                value={deposit} 
                onChange={e => setDeposit(e.target.value)} 
                placeholder="50000" 
                className={`${inputClass} pl-10 font-bold`} 
                required
              />
            </div>
          </div>
        </div>

        {/* Lease Info */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lease Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
              <Input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className={`${inputClass} pl-10`} 
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Duration (Months)</Label>
            <Select value={leaseMonths} onValueChange={setLeaseMonths}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="11">11 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
                <SelectItem value="24">24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
        <Button 
          type="submit" 
          disabled={loading || !email || !rent || !deposit} 
          className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-11 rounded-xl"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? 'Processing...' : 'Create Tenant & Generate Lease'}
        </Button>
      </div>
    </form>
  )
}
