/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { propertySchema, PropertyInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, MapPin, Building2, Home, ArrowLeft, ArrowRight } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { UploadButton } from '@/lib/uploadthing'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

const MapPicker = dynamic(() => import('./map-picker'), { ssr: false }) as ComponentType<{
  initialCoords: { lat: number; lng: number } | null
  onCoordChange: (coords: { lat: number; lng: number }) => void
  onAddressSelect?: (address: { address: string; city: string; state: string; postalCode: string; country: string }) => void
}>

interface PropertyFormProps {
  onSuccess?: () => void
  initialData?: PropertyInput & { id?: string }
  isEdit?: boolean
}

const inputClass = 'h-10 rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all shadow-xs outline-none'

export function PropertyForm({ onSuccess, initialData, isEdit = false }: PropertyFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialData?.latitude && initialData?.longitude
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null
  )
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof propertySchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(propertySchema as any),
    defaultValues: initialData ?? {
      name: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      totalRooms: 1,
      description: '',
      imageUrl: '',
    },
  })

  const handleAddressSelect = useCallback((addressData: { address: string; city: string; state: string; postalCode: string; country: string }) => {
    if (addressData.address) setValue('address', addressData.address, { shouldValidate: true })
    if (addressData.city) setValue('city', addressData.city, { shouldValidate: true })
    if (addressData.state) setValue('state', addressData.state, { shouldValidate: true })
    if (addressData.postalCode) setValue('postalCode', addressData.postalCode, { shouldValidate: true })
    if (addressData.country) setValue('country', addressData.country, { shouldValidate: true })
  }, [setValue])

  const watchedAddress = watch('address')
  const watchedCity = watch('city')
  const watchedState = watch('state')

  const handleGeocodeFromForm = useCallback(async () => {
    const addr = [watchedAddress, watchedCity, watchedState, 'India'].filter(Boolean).join(', ')
    if (!addr.trim()) return
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`
      const res = await fetch(url, { headers: { 'User-Agent': 'RentDashboard/1.0' } })
      const data = await res.json()
      if (data.length > 0) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
      }
    } catch {
      // silently fail — user can still manually pin
    }
  }, [watchedAddress, watchedCity, watchedState])

  const goNext = async () => {
    const valid = await trigger(['name', 'address', 'city', 'state'])
    if (valid) {
      await handleGeocodeFromForm()
      setStep(2)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setLoading(true)
    setServerError(null)
    try {
      const url = initialData?.id ? `/api/properties/${initialData.id}` : '/api/properties'
      const method = initialData?.id ? 'PUT' : 'POST'
      const payload = {
        ...data,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save property')
      }
      // Invalidate React Query cache so dashboard refreshes instantly
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      onSuccess?.()
    } catch (err) {
      console.log(err);
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col pt-3">
      {/* Step Indicator */}
      <DialogHeader className="px-6 pb-3">
        <div className="flex items-center gap-3">
          <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold transition-all ${step >= 1 ? 'bg-[#f97316] text-white' : 'bg-gray-100 text-gray-400'}`}>
            1
          </div>
          <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-[#f97316]' : 'bg-gray-100 dark:bg-gray-800'}`} />
          <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold transition-all ${step >= 2 ? 'bg-[#f97316] text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
            2
          </div>
        </div>
        <DialogTitle className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">
          {isEdit ? 'Edit Property' : step === 1 ? 'Location & Details' : 'Capacity & Media'}
        </DialogTitle>
        <DialogDescription className="text-[13px] text-[#6b7280] dark:text-gray-400">
          {step === 1 ? 'Enter the property address and pin it on the map.' : 'Add rooms, a description, and an optional photo.'}
        </DialogDescription>
      </DialogHeader>

      {/* Step 1 */}
      {step === 1 && (
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-none">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
              <Building2 className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
              Property Name
            </Label>
            <Input {...register('name')} placeholder="e.g. Sunrise PG" className={inputClass} autoFocus />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Street Address</Label>
            <Input {...register('address')} placeholder="e.g. 123 Main Street" className={inputClass} />
            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">City</Label>
              <Input {...register('city')} placeholder="e.g. Bangalore" className={inputClass} />
              {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">State</Label>
              <Input {...register('state')} placeholder="e.g. Karnataka" className={inputClass} />
              {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Postal Code</Label>
              <Input {...register('postalCode')} placeholder="e.g. 560001" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Country</Label>
              <Input {...register('country')} defaultValue="India" className={inputClass} />
            </div>
          </div>

          {/* Map Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                <MapPin className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5 text-[#f97316]" />
                Pin Location
              </Label>
              {coords && (
                <span className="text-[11px] text-emerald-600 font-medium">
                  ✓ Pinned ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                </span>
              )}
            </div>
            <div className="rounded-xl overflow-hidden border border-[#e5e7eb] dark:border-gray-800 h-64 relative">
              <MapPicker
                initialCoords={coords}
                onCoordChange={setCoords}
                onAddressSelect={handleAddressSelect}
              />
            </div>
            <p className="text-[11px] text-gray-400">Click or drag the pin to set the exact location. Auto-fills when you enter the address above.</p>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-none">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
              <Home className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
              Total Rooms
            </Label>
            <Input
              type="number"
              min="1"
              {...register('totalRooms', { valueAsNumber: true })}
              className={inputClass}
              defaultValue={1}
            />
            {errors.totalRooms && <p className="text-xs text-red-500">{errors.totalRooms.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Description</Label>
            <Textarea
              {...register('description')}
              placeholder="Additional details about the property…"
              className="rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2.5 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all resize-none outline-none"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Property Photo</Label>

            <div className="flex items-start gap-4 mt-2">
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 w-full flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
                <UploadButton
                  endpoint="propertyImage"


                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setValue('imageUrl', res[0].url, { shouldValidate: true })
                      setServerError(null)
                    }
                  }}

                  onUploadError={(error: Error) => {
                    console.error(error)
                    setServerError("Upload failed")
                  }}
                />
              </div>

              {watch('imageUrl') && (
                <div className="h-24 w-32 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shrink-0 shadow-sm">
                  <img src={watch('imageUrl')} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Upload a clear photo of the building exterior or main entrance.</p>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
        {step === 2 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            className="rounded-full h-10 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}
        {step === 1 ? (
          <Button
            type="button"
            onClick={goNext}
            className="flex-1 rounded-full bg-[#f97316] text-white hover:bg-[#ea580c] font-medium shadow-sm h-10 gap-1.5"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-full bg-[#f97316] text-white hover:bg-[#ea580c] font-medium shadow-sm h-10"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Create Property'}
          </Button>
        )}
      </div>
    </form>
  )
}