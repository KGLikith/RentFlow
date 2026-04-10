/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema, PropertyInput } from '@/lib/validations'

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

interface PropertyFormProps {
  onSuccess?: () => void
}

export function PropertyForm({ onSuccess }: PropertyFormProps) {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      propertyType: 'apartment',
      totalRooms: 1,
      description: '',
    },
  })

  const propertyType = watch('propertyType')

  const onSubmit = async (data: PropertyInput) => {
    setLoading(true)
    setServerError(null)

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create property')
      }

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
      
      {/* SERVER ERROR */}
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}

      {/* NAME */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Property Name</label>
        <Input {...register('name')} placeholder="e.g., Sunny Apartments" />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Property Type</label>
        <Select
          value={propertyType}
          onValueChange={(val) => setValue('propertyType', val as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.propertyType && (
          <p className="text-sm text-red-500">
            {errors.propertyType.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Address</label>
        <Input {...register('address')} placeholder="Street address" />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">City</label>
          <Input {...register('city')} placeholder="e.g., Mumbai" />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">State</label>
          <Input {...register('state')} placeholder="e.g., Karnataka" />
          {errors.state && (
            <p className="text-sm text-red-500">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Postal Code</label>
          <Input {...register('postalCode')} placeholder="e.g., 560001" />
          {errors.postalCode && (
            <p className="text-sm text-red-500">
              {errors.postalCode.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Input {...register('country')} />
          {errors.country && (
            <p className="text-sm text-red-500">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Total Rooms</label>
        <Input
          type="number"
          min="1"
          {...register('totalRooms', { valueAsNumber: true })}
        />
        {errors.totalRooms && (
          <p className="text-sm text-red-500">
            {errors.totalRooms.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          {...register('description')}
          placeholder="Additional property details..."
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
        {loading ? 'Creating...' : 'Create Property'}
      </Button>
    </form>
  )
}