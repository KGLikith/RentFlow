'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, BedDouble, User, Phone, Mail, IndianRupee, MapPin, LayoutGrid, 
  Layers, Expand, CheckCircle2, ShieldCheck, ShieldAlert, LogOut, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AmenitiesList } from '@/components/property/amenities-list'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { RoomForm } from '@/components/forms/room-form'
import { Edit2 } from 'lucide-react'
import { SingleTenantForm } from '@/components/forms/single-tenant-form'
import { toast } from 'sonner'


interface Tenant {
  id: string
  name: string
  email: string | null
  phone: string | null
  leases: { rentAmount: string | number; deposit: string | number }[]
  status: string
  isVerified: boolean
  userId: string | null
}

interface Room {
  id: string
  propertyId: string
  roomNumber: string
  capacity: number
  roomType: string
  carpetArea: number | null
  floorNumber: number | null
  amenities: string | null
  currentRent: string | number
  description: string | null
  property: {
    name: string
    address: string
    city: string
  }
  tenants: Tenant[]
  userRole?: string
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  const roomId = params.roomId as string

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [openEdit, setOpenEdit] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/properties/${propertyId}/rooms/${roomId}`)
      if (res.ok) {
        setRoom(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [propertyId, roomId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="w-full max-w-none mx-auto p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-xl" />
        <div className="h-40 w-full bg-muted rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-3xl" />
          <div className="h-64 bg-muted rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <BedDouble className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-lg font-medium text-muted-foreground">Room not found</p>
        <Button variant="outline" onClick={() => router.push(`/dashboard/properties/${propertyId}`)} className="rounded-full">
          ← Back to Property
        </Button>
      </div>
    )
  }

  const floorLabel = room.floorNumber === null || room.floorNumber === undefined
    ? 'Unassigned'
    : room.floorNumber === 0
    ? 'Ground Floor'
    : `Floor ${room.floorNumber}`

  return (
    <div className="w-full max-w-none mx-auto space-y-6 md:space-y-8 pb-10 px-4 md:px-8">
      
      {/* Header & Navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/properties/${propertyId}`)}
          className="mb-3 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Property
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full border border-orange-200 dark:border-orange-800/50">
                {room.roomType}
              </span>
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {room.property.name}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Room {room.roomNumber}
            </h1>
          </div>
          {room.userRole === 'OWNER' && (
            <Button 
              variant="outline" 
              onClick={() => setOpenEdit(true)}
              className="rounded-full shadow-xs border-gray-200 dark:border-gray-800"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Room
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<IndianRupee className="h-4 w-4 text-emerald-500" />} label="Rent" value={`₹${Number(room.currentRent).toLocaleString()}`} />
            <StatCard icon={<Layers className="h-4 w-4 text-blue-500" />} label="Floor" value={floorLabel} />
            <StatCard icon={<Expand className="h-4 w-4 text-purple-500" />} label="Area" value={room.carpetArea ? `${room.carpetArea} sqft` : 'N/A'} />
            <StatCard icon={<User className="h-4 w-4 text-orange-500" />} label="Capacity" value={`${room.capacity} Person${room.capacity > 1 ? 's' : ''}`} />
          </div>

          {/* About & Amenities */}
          <div className="bg-white dark:bg-gray-950/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800/60 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <LayoutGrid className="h-5 w-5 text-[#f97316]" />
                Amenities
              </h2>
              {room.amenities ? (
                <AmenitiesList amenitiesStr={room.amenities} />
              ) : (
                <p className="text-sm text-gray-500 italic">No amenities specified for this room.</p>
              )}
            </div>

            {room.description && (
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {room.description}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Tenants */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-[#f97316]" />
                Current Tenant{room.tenants.length > 1 ? 's' : ''}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                {room.tenants.length} / {room.capacity}
              </span>
            </div>

            <div className="space-y-3">
              {Array.from({ length: room.capacity }).map((_, index) => {
                const tenant = room.tenants[index]
                if (tenant) {
                return (
                    <div key={tenant.id} className="p-4 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{tenant.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {/* Active status */}
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              tenant.status === 'ACTIVE'
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                                : 'text-gray-500 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                            }`}>
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              {tenant.status === 'ACTIVE' ? 'Active' : tenant.status}
                            </span>
                            {/* Verification status */}
                            {tenant.isVerified ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                                <ShieldCheck className="h-2.5 w-2.5" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                                <ShieldAlert className="h-2.5 w-2.5" /> Unverified
                              </span>
                            )}
                            {/* Account linked status */}
                            {!tenant.userId && (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800">
                                <AlertCircle className="h-2.5 w-2.5" /> Not signed in yet
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Checkout button */}
                        {room.userRole === 'OWNER' && tenant.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 h-8 text-xs rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 dark:border-red-800 dark:text-red-400"
                            onClick={async () => {
                              if (!confirm(`Check out ${tenant.name}? This will end their lease.`)) return
                              try {
                                const res = await fetch(`/api/tenants/${tenant.id}/checkout`, { method: 'POST' })
                                const data = await res.json()
                                if (!res.ok) {
                                  toast.error(data.error || 'Checkout failed')
                                } else {
                                  toast.success(`${tenant.name} checked out successfully`)
                                  fetchData()
                                }
                              } catch {
                                toast.error('Something went wrong')
                              }
                            }}
                          >
                            <LogOut className="h-3 w-3 mr-1" /> Check Out
                          </Button>
                        )}
                      </div>

                      {/* Contact info */}
                      <div className="space-y-1.5 mb-3">
                        {tenant.email && (
                          <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                            <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{tenant.email}</span>
                          </div>
                        )}
                        {tenant.phone && (
                          <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                            <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span>{tenant.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Financials */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rent</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{Number(tenant.leases?.[0]?.rentAmount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Deposit</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{Number(tenant.leases?.[0]?.deposit || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div key={`vacant-${index}`} className="py-6 text-center bg-white dark:bg-gray-950/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">Vacant Slot</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-3 rounded-full border-gray-300 text-xs h-8">
                            Add Tenant
                          </Button>
                        </DialogTrigger>
                        <DialogContent aria-describedby={undefined} className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
                          <SingleTenantForm 
                            initialPropertyId={propertyId} 
                            initialRoomId={roomId} 
                            initialRent={room.currentRent} 
                            onSuccess={() => {
                              fetchData()
                            }} 
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )
                }
              })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
          <RoomForm
            propertyId={propertyId}
            totalFloors={(room.property as { totalFloors?: number })?.totalFloors || 1}
            initialData={room}
            isEdit
            onSuccess={() => {
              setOpenEdit(false)
              fetchData()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white dark:bg-gray-950/50 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-2">
        {icon}
      </div>
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}
