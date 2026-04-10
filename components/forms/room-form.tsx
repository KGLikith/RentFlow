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
      console.error('Error:', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Room Number</label>
        <Input
          {...register('roomNumber')}
          placeholder="e.g., 101, A1, Unit 1"
        />
        {errors.roomNumber && (
          <p className="text-sm text-red-500">
            {errors.roomNumber.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Room Type</label>
        <Select
          value={roomType}
          onValueChange={(val) => setValue('roomType', val as any)}
        >
          <SelectTrigger>
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
          <p className="text-sm text-red-500">
            {errors.roomType.message}
          </p>
        )}
      </div>

      {/* RENT */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Monthly Rent</label>
        <Input
          type="number"
          min="0"
          placeholder="e.g., 10000"
          {...register('currentRent', { valueAsNumber: true })}
        />
        {errors.currentRent && (
          <p className="text-sm text-red-500">
            {errors.currentRent.message}
          </p>
        )}
      </div>

      {/* AREA + FLOOR */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Carpet Area (sqft)
          </label>
          <Input
            type="number"
            min="0"
            placeholder="e.g., 500"
            {...register('carpetArea', { valueAsNumber: true })}
          />
          {errors.carpetArea && (
            <p className="text-sm text-red-500">
              {errors.carpetArea.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Floor Number
          </label>
          <Input
            type="number"
            min="0"
            placeholder="e.g., 2"
            {...register('floorNumber', { valueAsNumber: true })}
          />
          {errors.floorNumber && (
            <p className="text-sm text-red-500">
              {errors.floorNumber.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Amenities</label>
        <Textarea
          {...register('amenities')}
          placeholder="e.g., AC, WiFi, Parking, Gym"
        />
        {errors.amenities && (
          <p className="text-sm text-red-500">
            {errors.amenities.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          {...register('description')}
          placeholder="Additional room details..."
        />
        {errors.description && (
          <p className="text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {loading ? 'Creating...' : 'Create Room'}
      </Button>
    </form>
  )
}