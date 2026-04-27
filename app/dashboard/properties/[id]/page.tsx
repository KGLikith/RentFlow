/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { RoomForm } from '@/components/forms/room-form'
import { PropertyForm } from '@/components/forms/property-form'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPin, BedDouble, ArrowLeft, Plus, Navigation, Edit2, Building2,
  Hash, Globe, FileText,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useQueryClient } from '@tanstack/react-query'
import type { ComponentType } from 'react'

const LeafletModal = dynamic(() => import('@/components/ui/leaflet-modal'), { ssr: false }) as ComponentType<{
  latitude: number
  longitude: number
}>

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  postalCode?: string
  country?: string
  totalRooms: number
  description?: string
  latitude?: number
  longitude?: number
  imageUrl?: string
}

interface Room {
  id: string
  roomNumber: string
  capacity: number
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  const queryClient = useQueryClient()

  const [property, setProperty] = useState<Property | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [openMap, setOpenMap] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openRoomDialog, setOpenRoomDialog] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [propRes, roomsRes] = await Promise.all([
        fetch(`/api/properties/${propertyId}`),
        fetch(`/api/properties/${propertyId}/rooms`),
      ])
      if (propRes.ok) setProperty(await propRes.json())
      if (roomsRes.ok) setRooms(await roomsRes.json())
    } catch {
      /* silently fail */
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-0 -mx-4 md:-mx-6 -mt-4 md:-mt-6">
        <div className="h-64 bg-muted/60 animate-pulse rounded-b-3xl" />
        <div className="px-4 md:px-6 mt-4 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted/60 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Building2 className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Property not found</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/properties')} className="rounded-full">
          ← Back to Properties
        </Button>
      </div>
    )
  }

  const directionsUrl = property.latitude && property.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([property.address, property.city, property.state].join(', '))}`

  return (
    <div className="space-y-0 -mx-4 md:-mx-6 -mt-4 md:-mt-6">
      {/* Hero: image or map or gradient */}
      <div className="relative">
        {property.imageUrl ? (
          <img src={property.imageUrl} alt={property.name} className="w-full h-56 md:h-72 object-cover" />
        ) : property.latitude && property.longitude ? (
          <img
            src={`https://staticmap.openstreetmap.de/staticmap.php?center=${property.latitude},${property.longitude}&zoom=15&size=800x280&markers=${property.latitude},${property.longitude},red-pushpin`}
            alt="Property location"
            className="w-full h-56 md:h-72 object-cover cursor-pointer"
            onClick={() => setOpenMap(true)}
          />
        ) : (
          <div className="w-full h-48 bg-linear-to-br from-[#f97316] to-[hsl(14,98%,52%)] flex items-center justify-center">
            <Building2 className="h-16 w-16 text-white/30" />
          </div>
        )}

        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard/properties')}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 grid place-items-center hover:bg-white/30 transition"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>

        {/* Edit button */}
        <button
          onClick={() => setOpenEdit(true)}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 grid place-items-center hover:bg-white/30 transition"
        >
          <Edit2 className="h-4 w-4 text-white" />
        </button>

        {/* Property name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white leading-tight">{property.name}</h1>
          <div className="flex items-center gap-1.5 mt-1 text-white/80 text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 space-y-4 py-5">
        {/* Key stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <DetailTile icon={<BedDouble className="h-4 w-4 text-emerald-500" />} label="Total Rooms" value={String(property.totalRooms)} />
          <DetailTile icon={<Hash className="h-4 w-4 text-blue-500" />} label="Postal Code" value={property.postalCode || 'N/A'} />
          <DetailTile icon={<Globe className="h-4 w-4 text-sky-500" />} label="State" value={property.state} />
          <DetailTile icon={<Globe className="h-4 w-4 text-purple-500" />} label="Country" value={property.country || 'India'} />
        </div>

        {/* Description */}
        {property.description && (
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-[#f97316]" />
                <span className="text-sm font-semibold">Description</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Map & Directions */}
        {(property.latitude && property.longitude) && (
          <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
            <img
              src={`https://staticmap.openstreetmap.de/staticmap.php?center=${property.latitude},${property.longitude}&zoom=15&size=800x180&markers=${property.latitude},${property.longitude},red-pushpin`}
              alt="Map preview"
              className="w-full h-40 object-cover cursor-pointer"
              onClick={() => setOpenMap(true)}
            />
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-[#f97316]" />
                <span>{property.latitude?.toFixed(4)}, {property.longitude?.toFixed(4)}</span>
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#f97316] hover:underline"
              >
                <Navigation className="h-3.5 w-3.5" />
                Get Directions
              </a>
            </CardContent>
          </Card>
        )}

        {!property.latitude && !property.longitude && (
          <Card className="rounded-2xl border-0 shadow-sm border-dashed">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location not pinned</span>
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#f97316] hover:underline"
              >
                <Navigation className="h-3.5 w-3.5" />
                Get Directions
              </a>
            </CardContent>
          </Card>
        )}

        {/* Rooms section */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-sm font-semibold">Rooms</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{rooms.length} room{rooms.length !== 1 ? 's' : ''} added</p>
          </div>
          <Dialog open={openRoomDialog} onOpenChange={setOpenRoomDialog}>
            <DialogTrigger asChild>
              <button className="h-9 w-9 rounded-full bg-[#f97316] text-white grid place-items-center hover:bg-[#ea580c] transition active:scale-95">
                <Plus className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
              </DialogHeader>
              <RoomForm
                propertyId={propertyId}
                onSuccess={() => {
                  setOpenRoomDialog(false)
                  fetchData()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {rooms.length === 0 ? (
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 grid place-items-center mx-auto">
                <BedDouble className="h-6 w-6 text-[#f97316]/60" />
              </div>
              <div>
                <p className="font-semibold text-sm">No rooms yet</p>
                <p className="text-xs text-muted-foreground mt-1">Tap the + button to add your first room</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rooms.map((room) => (
              <Link key={room.id} href={`/dashboard/properties/${propertyId}/rooms/${room.id}`}>
                <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] cursor-pointer">
                  <CardContent className="p-4 space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center">
                      <BedDouble className="h-5 w-5 text-[#f97316]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Room {room.roomNumber}</p>
                      <p className="text-xs text-muted-foreground">{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</p>
                    </div>
                    <Badge className="rounded-full text-[11px] bg-orange-50 text-[#f97316] border-orange-200">
                      View →
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Interactive map modal */}
      {property.latitude && property.longitude && (
        <Dialog open={openMap} onOpenChange={setOpenMap}>
          <DialogContent className="sm:max-w-2xl p-0 rounded-2xl overflow-hidden">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle className="text-base">{property.name}</DialogTitle>
            </DialogHeader>
            <LeafletModal latitude={property.latitude} longitude={property.longitude} />
            <div className="p-4 flex justify-end">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white rounded-full text-sm font-medium hover:bg-[#ea580c] transition"
              >
                <Navigation className="h-4 w-4" />
                Get Directions on Google Maps
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Property modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
          <PropertyForm
            initialData={{
              ...property,
              country: property.country ?? 'India',
              latitude: property.latitude ?? undefined,
              longitude: property.longitude ?? undefined,
            }}
            isEdit
            onSuccess={() => {
              setOpenEdit(false)
              queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
              fetchData()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-4 space-y-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-semibold leading-tight">{value}</p>
    </div>
  )
}
