/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Building2, MapPin, BedDouble, Plus, Search } from 'lucide-react'
import {
  Dialog, DialogContent, DialogTrigger,
} from '@/components/ui/dialog'
import { PropertyForm } from '@/components/forms/property-form'
import { useRentProperties } from '@/hooks/useDashboard'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function PropertiesPage() {
  const { data: properties, isLoading } = useRentProperties()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const queryClient = useQueryClient()

  const filtered = (properties || []).filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.city.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your rental properties</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-[#f97316] text-white hover:bg-[#ea580c] h-10 w-10 p-0 shadow-sm" aria-label="Add Property">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
            <PropertyForm onSuccess={() => {
              setOpen(false)
              queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 pb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search properties…"
            className="bg-white dark:bg-gray-950 pl-10 h-11 rounded-xl border border-[#e5e7eb] dark:border-gray-800 shadow-sm text-[14px] placeholder:text-gray-400 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316]"
          />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-muted/60 h-56 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-14 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-orange-50 grid place-items-center mx-auto">
                <Building2 className="h-7 w-7 text-[#f97316]/60" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {query ? 'No results found' : 'No properties yet'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {query ? 'Try a different search term' : 'Add your first property to get started'}
                </p>
              </div>
              {!query && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="inline-flex items-center gap-1.5 text-[#f97316] font-medium text-sm hover:underline">
                      <Plus className="h-4 w-4" /> Add Property
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
                    <PropertyForm onSuccess={() => {
                      setOpen(false)
                      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
                    }} />
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((property) => (
            <Link key={property.id} href={`/dashboard/properties/${property.id}`}>
              <Card className="rounded-2xl border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow active:scale-[0.98] h-full cursor-pointer">
                {/* Image or map or fallback */}
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    className="w-full h-28 object-cover"
                  />
                ) : property.latitude && property.longitude ? (
                  <img
                    src={`https://staticmap.openstreetmap.de/staticmap.php?center=${property.latitude},${property.longitude}&zoom=14&size=400x112&markers=${property.latitude},${property.longitude},red-pushpin`}
                    alt="Location map"
                    className="w-full h-28 object-cover"
                  />
                ) : (
                  <div className="w-full h-28 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-800">
                    <div className="h-10 w-10 rounded-full bg-orange-100/50 dark:bg-orange-900/20 flex items-center justify-center mb-1">
                      <Building2 className="h-5 w-5 text-orange-500/70" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">No photo provided</span>
                  </div>
                )}

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight truncate">{property.name}</h3>
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{property.address}, {property.city}</span>
                      </div>
                    </div>
                    <Badge className="rounded-full bg-orange-50 text-[#f97316] border-orange-200 shrink-0 text-[11px]">
                      {property.totalRooms} {property.totalRooms === 1 ? 'Room' : 'Rooms'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BedDouble className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{property.totalRooms} beds total</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-[#f97316]" />
                      <span className="truncate">{property.state}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
