/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { roomSchema, RoomInput } from '@/lib/validations'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface RoomFormProps {
  propertyId: string
  onSuccess?: () => void
}

const inputClass = 'h-10 rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all shadow-xs outline-none'

export function RoomForm({ propertyId, onSuccess }: RoomFormProps) {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: '',
      roomType: '1BHK',
      currentRent: 10000,
      description: '',
    },
  })

  const roomType = watch('roomType')

  const onSubmit = async (data: RoomInput) => {
    setLoading(true)
    setServerError(null)

    try {
      const res = await fetch(`/api/properties/${propertyId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create room')
      }

      reset()
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setServerError(message)
      console.log('Error:', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5 max-h-[70vh] overflow-y-auto scrollbar-none">

      {serverError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Room Number</label>
        <Input
          {...register('roomNumber')}
          placeholder="e.g. 101, A1, Unit 1"
          className={inputClass}
        />
        {errors.roomNumber && (
          <p className="text-xs text-red-500">{errors.roomNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Room Type</label>
          <Select
            value={roomType}
            onValueChange={(val) => setValue('roomType', val as any)}
          >
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1BHK">1 BHK</SelectItem>
              <SelectItem value="2BHK">2 BHK</SelectItem>
              <SelectItem value="3BHK">3 BHK</SelectItem>
              <SelectItem value="Studio">Studio</SelectItem>
              <SelectItem value="Penthouse">Penthouse</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.roomType && (
            <p className="text-xs text-red-500">{errors.roomType.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Monthly Rent</label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 10000"
            {...register('currentRent', { valueAsNumber: true })}
            className={inputClass}
          />
          {errors.currentRent && (
            <p className="text-xs text-red-500">{errors.currentRent.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Carpet Area (sqft)</label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 500"
            {...register('carpetArea', { valueAsNumber: true })}
            className={inputClass}
          />
          {errors.carpetArea && <p className="text-xs text-red-500">{errors.carpetArea.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Floor Number</label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 2"
            {...register('floorNumber', { valueAsNumber: true })}
            className={inputClass}
          />
          {errors.floorNumber && <p className="text-xs text-red-500">{errors.floorNumber.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Amenities</label>
        <Textarea
          {...register('amenities')}
          placeholder="e.g. AC, WiFi, Parking, Gym"
          className="rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2.5 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all resize-none outline-none min-h-[80px]"
        />
        {errors.amenities && <p className="text-xs text-red-500">{errors.amenities.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Description</label>
        <Textarea
          {...register('description')}
          placeholder="Additional room details..."
          className="rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2.5 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all resize-none outline-none min-h-[80px]"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white shadow-md font-semibold h-11 text-sm mt-4 rounded-xl"
      >
        {loading ? 'Creating...' : 'Create Room'}
      </Button>
    </form>
  )
}