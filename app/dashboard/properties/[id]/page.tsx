/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { RoomForm } from '@/components/forms/room-form'
import { PropertyForm } from '@/components/forms/property-form'
import { FloorRoomView } from '@/components/property/floor-room-view'
import type { RoomItem } from '@/components/property/floor-room-view'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPin, BedDouble, ArrowLeft, Plus, Navigation, Edit2, Building2,
  Hash, Globe, FileText, ChevronLeft, ChevronRight, Layers, User, Mail, Phone, CreditCard, LayoutGrid
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useQueryClient } from '@tanstack/react-query'
import { AmenitiesList } from '@/components/property/amenities-list'
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
  totalFloors?: number
  description?: string
  amenities?: string | null
  latitude?: number
  longitude?: number
  imageUrls?: string[]
  owner?: {
    name: string | null
    email: string
    phone: string | null
    upiId: string | null
  }
  userRole?: 'OWNER' | 'TENANT' | 'VIEWER'
  tenantRoomId?: string | null
}

type Room = RoomItem;

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

  const handleBulkUpdate = useCallback(async (roomIds: string[], updates: Record<string, string | number | null>) => {
    const res = await fetch(`/api/properties/${propertyId}/rooms`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomIds, updates }),
    })
    if (res.ok) fetchData()
  }, [propertyId]) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth)
    setCurrentImageIndex(index)
  }

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: 'smooth'
    })
  }

  // Auto-scroll
  useEffect(() => {
    if (!property?.imageUrls || property.imageUrls.length <= 1) return
    const timer = setInterval(() => {
      if (!scrollRef.current || !property?.imageUrls) return
      const nextIndex = (currentImageIndex + 1) % property.imageUrls.length
      scrollToIndex(nextIndex)
    }, 5000)
    return () => clearInterval(timer)
  }, [property?.imageUrls, currentImageIndex])

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
      <div className="max-w-6xl mx-auto p-4 space-y-6 md:space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-xl" />
        <div className="h-[40vh] w-full bg-muted rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-32 bg-muted rounded-2xl" />
            <div className="h-48 bg-muted rounded-2xl" />
          </div>
          <div className="space-y-8">
            <div className="h-32 bg-muted rounded-2xl" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Building2 className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-lg font-medium text-muted-foreground">Property not found</p>
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
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10 px-4 md:px-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/properties')}
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            {property.name}
          </h1>
          <div className="flex items-center text-gray-500 mt-2 gap-1.5 font-medium text-[14px]">
            <MapPin className="h-4 w-4 text-[#f97316]" />
            {property.address}, {property.city}
          </div>
        </div>
        
        {property.userRole === 'OWNER' && (
          <Button 
            variant="outline" 
            onClick={() => setOpenEdit(true)}
            className="rounded-full shadow-xs border-gray-200 dark:border-gray-800"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Property
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8">
        
        {/* Left Column (Media & Details) */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Media Carousel */}
          <div className="relative w-full aspect-video md:aspect-video rounded-3xl overflow-hidden bg-muted/30 border border-gray-100 dark:border-gray-800/60 shadow-sm group">
            {property.imageUrls && property.imageUrls.length > 0 ? (
              <>
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
                >
                  {property.imageUrls.map((url, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 snap-center">
                      <img src={url} alt={`${property.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                
                {/* Navigation Arrows */}
                {property.imageUrls.length > 1 && (
                  <>
                    <button 
                      onClick={() => scrollToIndex((currentImageIndex - 1 + property.imageUrls!.length) % property.imageUrls!.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => scrollToIndex((currentImageIndex + 1) % property.imageUrls!.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                      {property.imageUrls.map((_, idx) => (
                        <button
                          key={idx}
                          className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                          onClick={() => scrollToIndex(idx)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
                  <Building2 className="h-8 w-8 text-[#f97316]/70" />
                </div>
                <span className="text-sm font-semibold text-[#f97316]/60 uppercase tracking-widest">No photos uploaded</span>
              </div>
            )}
          </div>

          {/* Amenities & Description Section */}
          {(property.amenities || property.description) && (
            <section className="bg-white dark:bg-gray-950/50 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800/60 shadow-sm space-y-6">
              {property.amenities && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-[#f97316]" />
                    Property Amenities
                  </h2>
                  <AmenitiesList amenitiesStr={property.amenities} />
                </div>
              )}
              
              {property.description && (
                <div className={property.amenities ? 'pt-6 border-t border-gray-100 dark:border-gray-800' : ''}>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#f97316]" />
                    About this property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Map Location Section */}
          <section className="bg-white dark:bg-gray-950/50 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#f97316]" />
                Location
              </h2>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f97316] hover:text-[#ea580c] transition-colors"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </a>
            </div>
            
            {property.latitude && property.longitude ? (
              <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-muted/20 cursor-pointer border border-gray-100 dark:border-gray-800" onClick={() => setOpenMap(true)}>
                <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none mix-blend-multiply" />
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.005},${property.latitude - 0.005},${property.longitude + 0.005},${property.latitude + 0.005}&layer=mapnik&marker=${property.latitude},${property.longitude}`}
                  className="w-full h-full object-cover grayscale contrast-125 opacity-80 pointer-events-none transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 grid place-items-center z-20 pointer-events-none">
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-700">
                    Tap to expand map
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-muted-foreground">
                <MapPin className="h-6 w-6 mb-2 opacity-50" />
                <p className="text-sm">Location not pinned on map</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {property.address}, {property.city}, {property.state} {property.postalCode}
              </span>
            </div>
          </section>

        </div>

        {/* Right Column (Stats & Rooms) */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <DetailTile icon={<BedDouble className="h-4 w-4 text-emerald-500" />} label="Total Rooms" value={String(rooms.length)} />
            <DetailTile icon={<Hash className="h-4 w-4 text-blue-500" />} label="Postal Code" value={property.postalCode || 'N/A'} />
            <DetailTile icon={<Globe className="h-4 w-4 text-sky-500" />} label="State" value={property.state} />
            <DetailTile icon={<Layers className="h-4 w-4 text-purple-500" />} label="Total Floors" value={String(new Set(rooms.map(r => r.floorNumber ?? 0)).size)} />
          </div>

          {/* Owner Info */}
          {property.owner && (
            <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-[#f97316]/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#f97316]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Owner Information</h3>
                  <p className="text-[13px] text-gray-500">{property.owner.name || 'Property Manager'}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800/60">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="text-[14px] font-medium text-gray-700 dark:text-gray-300">{property.owner.email}</span>
                </div>
                {property.owner.phone && (
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Phone className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <span className="text-[14px] font-medium text-gray-700 dark:text-gray-300">{property.owner.phone}</span>
                  </div>
                )}
                {property.owner.upiId && (
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <CreditCard className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <span className="text-[14px] font-medium text-gray-700 dark:text-gray-300">UPI: {property.owner.upiId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rooms List */}
          <Card className="rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm bg-white dark:bg-gray-950/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-[#f97316]" />
                  {property.userRole === 'OWNER' ? 'Rooms' : 'Your Room'}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {property.userRole === 'OWNER' 
                    ? `${rooms.length} room${rooms.length !== 1 ? 's' : ''} across ${new Set(rooms.filter(r => r.floorNumber != null).map(r => r.floorNumber)).size || '—'} floors`
                    : 'Details about the room you are renting'
                  }
                </p>
              </div>
              {property.userRole === 'OWNER' && (
                <Dialog open={openRoomDialog} onOpenChange={setOpenRoomDialog}>
                  <DialogTrigger asChild>
                    <Button size="icon" className="h-10 w-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-[#f97316] hover:bg-[#f97316] hover:text-white transition-colors shadow-none">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
                    <RoomForm
                      propertyId={propertyId}
                      totalFloors={property.totalFloors || 1}
                      onSuccess={() => {
                        setOpenRoomDialog(false)
                        fetchData()
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <FloorRoomView
                rooms={rooms}
                propertyId={propertyId}
                totalFloors={property.totalFloors || 1}
                onBulkUpdate={handleBulkUpdate}
                readonly={property.userRole !== 'OWNER'}
              />
            </CardContent>
          </Card>
          
        </div>
      </div>

      {/* Interactive map modal */}
      {property.latitude && property.longitude && (
        <Dialog open={openMap} onOpenChange={setOpenMap}>
          <DialogContent className="sm:max-w-3xl p-0 rounded-3xl overflow-hidden border-0 shadow-2xl">
            <DialogHeader className="p-5 pb-0 absolute top-0 left-0 right-0 z-10 pointer-events-none">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-2xl inline-block shadow-sm border border-gray-200 dark:border-gray-800 pointer-events-auto">
                <DialogTitle className="text-base m-0">{property.name}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="h-[60vh] w-full">
              <LeafletModal latitude={property.latitude} longitude={property.longitude} />
            </div>
            <div className="absolute bottom-5 right-5 pointer-events-auto">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f97316] text-white rounded-full text-sm font-semibold hover:bg-[#ea580c] shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <Navigation className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Property modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <PropertyForm
            initialData={{
              ...property,
              country: property.country ?? 'India',
              latitude: property.latitude ?? undefined,
              longitude: property.longitude ?? undefined,
              amenities: property.amenities ?? '',
              totalFloors: property.totalFloors ?? 1,
              imageUrls: property.imageUrls ?? [],
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
    <div className="rounded-3xl bg-white dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/60 p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">{value}</p>
      </div>
    </div>
  )
}
