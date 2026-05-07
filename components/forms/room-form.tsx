/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  BedDouble, Hash, IndianRupee, Layers3, LayoutGrid,
  AlignLeft, AlertCircle, ChevronRight, SkipForward,
  CheckCircle2, X
} from 'lucide-react'
import { ROOM_TYPES } from '@/lib/validations'

interface RoomFormProps {
  propertyId: string
  totalFloors?: number
  onSuccess?: () => void
  initialData?: any
  isEdit?: boolean
}

const inputClass = 'h-10 rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all shadow-xs outline-none'
const textareaClass = 'rounded-lg border border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2.5 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] w-full transition-all resize-none outline-none min-h-[72px]'

const formSchema = z.object({
  isBulk: z.boolean().default(false),
  roomNumber: z.string().optional(),
  bulkPrefix: z.string().optional(),
  bulkStartNumber: z.number().optional(),
  bulkCount: z.number().optional(),
  roomType: z.string().min(1, 'Room type is required'),
  capacity: z.number().int().positive('Capacity must be positive').default(1),
  carpetArea: z.number().positive().optional(),
  floorNumber: z.number().int().optional(),
  amenities: z.string().optional(),
  currentRent: z.number().positive('Rent must be positive'),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.isBulk) {
    if (!data.bulkCount || data.bulkCount < 1)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Count must be at least 1', path: ['bulkCount'] })
    if (data.bulkStartNumber === undefined || data.bulkStartNumber < 0)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start number required', path: ['bulkStartNumber'] })
  } else {
    if (!data.roomNumber || data.roomNumber.trim() === '')
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Room number is required', path: ['roomNumber'] })
  }
})

type FormData = z.infer<typeof formSchema>

interface ConflictResult {
  created: number
  skipped: number
  skippedRooms: string[]
}

export function RoomForm({ propertyId, totalFloors = 1, onSuccess, initialData, isEdit }: RoomFormProps) {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [conflict, setConflict] = useState<ConflictResult | null>(null)
  const [amenityInput, setAmenityInput] = useState('')

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema as any),
    defaultValues: initialData || {
      isBulk: false,
      roomNumber: '',
      bulkPrefix: '',
      bulkStartNumber: 101,
      bulkCount: 5,
      roomType: 'Single Sharing',
      capacity: 1,
      currentRent: 10000,
      description: '',
    },
  })

  const isBulk = watch('isBulk')
  const roomType = watch('roomType')
  
  const amenitiesVal = watch('amenities') || ''
  const amenitiesList = amenitiesVal ? amenitiesVal.split(',').map(a => a.trim()).filter(Boolean) : []

  const handleAddAmenity = (e: React.KeyboardEvent<HTMLInputElement> | { key: string, preventDefault: () => void }) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (amenityInput.trim()) {
        const newList = [...amenitiesList, amenityInput.trim()]
        setValue('amenities', newList.join(','))
        setAmenityInput('')
      }
    }
  }

  const handleRemoveAmenity = (index: number) => {
    const newList = amenitiesList.filter((_, i) => i !== index)
    setValue('amenities', newList.join(','))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setServerError(null)
    setConflict(null)

    try {
      let payload: any
      if (data.isBulk) {
        const prefix = data.bulkPrefix?.trim() || ''
        const start = data.bulkStartNumber || 101
        const count = data.bulkCount || 1
        payload = Array.from({ length: count }).map((_, i) => ({
          roomNumber: `${prefix}${start + i}`,
          roomType: data.roomType,
          capacity: data.capacity,
          currentRent: data.currentRent,
          carpetArea: data.carpetArea,
          floorNumber: data.floorNumber,
          amenities: data.amenities,
          description: data.description,
        }))
      } else {
        payload = {
          roomNumber: data.roomNumber,
          roomType: data.roomType,
          capacity: data.capacity,
          currentRent: data.currentRent,
          carpetArea: data.carpetArea,
          floorNumber: data.floorNumber,
          amenities: data.amenities,
          description: data.description,
        }
      }

      let res;
      if (isEdit && initialData?.id) {
        payload = {
          roomNumber: data.roomNumber,
          roomType: data.roomType,
          capacity: data.capacity,
          currentRent: data.currentRent,
          carpetArea: data.carpetArea,
          floorNumber: data.floorNumber,
          amenities: data.amenities,
          description: data.description,
        }
        res = await fetch(`/api/properties/${propertyId}/rooms/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/properties/${propertyId}/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error || 'Failed to create room(s)')

      if (data.isBulk && resData.skipped > 0) {
        // Partial success — show conflict dialog, but keep the form data
        setConflict({ created: resData.created, skipped: resData.skipped, skippedRooms: resData.skippedRooms || [] })
        // Still call onSuccess to refresh the room list in background
        onSuccess?.()
      } else {
        // Full success — close immediately
        reset()
        onSuccess?.()
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const bulkStart = watch('bulkStartNumber') || 101
  const bulkCount = watch('bulkCount') || 1
  const prefix = watch('bulkPrefix') || ''
  const bulkPreviewStart = `${prefix}${bulkStart}`
  const bulkPreviewEnd   = `${prefix}${bulkStart + bulkCount - 1}`

  // ── Conflict state ───────────────────────────────────────────────────────
  if (conflict) {
    return (
      <div className="flex flex-col">
        <div className="px-6 pt-6 pb-4">
          <div className="h-14 w-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
            <SkipForward className="h-7 w-7 text-amber-500" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 dark:text-white">Some rooms already exist</h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            <span className="text-emerald-600 font-semibold">{conflict.created} created</span>
            {' · '}
            <span className="text-amber-600 font-semibold">{conflict.skipped} skipped</span>
          </p>
        </div>

        <div className="px-6 pb-2">
          <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-3">
            The following rooms already exist and were not overwritten:
          </p>
          <div className="flex flex-wrap gap-2">
            {conflict.skippedRooms.map(r => (
              <span key={r} className="px-2.5 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full">
                {r}
              </span>
            ))}
          </div>
          <p className="text-[12px] text-muted-foreground mt-3">
            To update these rooms, use the <strong>Bulk Edit</strong> feature in the rooms section.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 mt-2">
          <Button
            className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold h-11 rounded-full"
            onClick={() => { setConflict(null); reset() }}
          >
            Done
          </Button>
        </div>
      </div>
    )
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col">

      {/* Header */}
      <DialogHeader className="px-6 pb-4 pt-5">
        {/* Mode toggle */}
        {!isEdit && (
          <div className="flex items-center gap-2 p-1 bg-[#fff7ed] dark:bg-orange-950/30 border border-[#f97316]/20 rounded-full w-fit mb-3">
            <button type="button" onClick={() => setValue('isBulk', false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${!isBulk ? 'bg-[#f97316] text-white shadow-sm' : 'text-[#f97316]/70 hover:text-[#f97316]'}`}>
              Single Room
            </button>
            <button type="button" onClick={() => setValue('isBulk', true)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${isBulk ? 'bg-[#f97316] text-white shadow-sm' : 'text-[#f97316]/70 hover:text-[#f97316]'}`}>
              <Layers3 className="h-3 w-3" />
              Bulk Create
            </button>
          </div>
        )}
        <DialogTitle className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">
          {isEdit ? 'Edit Room' : isBulk ? 'Bulk Room Creation' : 'Add New Room'}
        </DialogTitle>
        <DialogDescription className="text-[13px] text-[#6b7280] dark:text-gray-400">
          {isBulk ? 'Create multiple rooms at once — existing rooms are automatically skipped.' : 'Fill in the details for this room.'}
        </DialogDescription>
      </DialogHeader>

      {/* Body */}
      <div className="px-6 pb-4 space-y-4 max-h-[58vh] overflow-y-auto scrollbar-none">

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Room identifier */}
        {!isBulk ? (
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
              <Hash className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
              Room Number
            </Label>
            <Input {...register('roomNumber')} placeholder="e.g. 101, A1, Unit 1" className={inputClass} autoFocus />
            {errors.roomNumber && <p className="text-xs text-red-500">{errors.roomNumber.message}</p>}
          </div>
        ) : (
          <div className="space-y-3 p-4 bg-[#fff7ed] dark:bg-orange-950/20 rounded-xl border border-[#f97316]/20">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium text-gray-600 dark:text-gray-400">Prefix</Label>
                <Input {...register('bulkPrefix')} placeholder="e.g. A" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium text-gray-600 dark:text-gray-400">Start #</Label>
                <Input type="number" {...register('bulkStartNumber', { valueAsNumber: true })} placeholder="101" className={inputClass} />
                {errors.bulkStartNumber && <p className="text-[11px] text-red-500">{errors.bulkStartNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium text-gray-600 dark:text-gray-400">Count</Label>
                <Input type="number" min="1" max="200" {...register('bulkCount', { valueAsNumber: true })} className={inputClass} />
                {errors.bulkCount && <p className="text-[11px] text-red-500">{errors.bulkCount.message}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#f97316] font-medium">
              <BedDouble className="h-3.5 w-3.5" />
              Rooms: <strong>{bulkPreviewStart}</strong>
              <ChevronRight className="h-3 w-3 opacity-50" />
              <strong>{bulkPreviewEnd}</strong>
              <span className="text-muted-foreground font-normal">({bulkCount} total)</span>
            </div>
          </div>
        )}

        {/* Shared fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Room Type</Label>
            <Select value={roomType} onValueChange={(val) => {
              setValue('roomType', val)
              // Auto-set capacity based on type if possible
              if (val.includes('Single')) setValue('capacity', 1)
              if (val.includes('Double')) setValue('capacity', 2)
              if (val.includes('Triple')) setValue('capacity', 3)
              if (val.includes('Quad')) setValue('capacity', 4)
            }}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomType && <p className="text-xs text-red-500">{errors.roomType.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Capacity</Label>
            <Input type="number" min="1" max="10" placeholder="e.g. 2" {...register('capacity', { valueAsNumber: true })} className={inputClass} />
            {errors.capacity && <p className="text-xs text-red-500">{errors.capacity.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
              <IndianRupee className="h-3.5 w-3.5 inline-block mr-1 -mt-0.5" />
              Monthly Rent
            </Label>
            <Input type="number" min="0" placeholder="e.g. 10000" {...register('currentRent', { valueAsNumber: true })} className={inputClass} />
            {errors.currentRent && <p className="text-xs text-red-500">{errors.currentRent.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
              Floor Number
            </Label>
            <Select onValueChange={(v) => setValue('floorNumber', parseInt(v))}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Ground Floor (0)</SelectItem>
                {Array.from({ length: totalFloors }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>Floor {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
              Carpet Area <span className="text-muted-foreground font-normal">(sqft, optional)</span>
            </Label>
            <Input type="number" min="0" placeholder="e.g. 150" {...register('carpetArea', { valueAsNumber: true })} className={inputClass} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>
              <LayoutGrid className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
              Amenities
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={handleAddAmenity}
              placeholder="e.g. AC, WiFi (Press Enter to add)"
              className={inputClass}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddAmenity({ key: 'Enter', preventDefault: () => {} })}
              className="h-10 rounded-lg px-4"
            >
              Add
            </Button>
          </div>
          
          {amenitiesList.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Amenities Provided</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {amenitiesList.map((am, i) => (
                  <li key={i} className="flex items-start justify-between bg-white dark:bg-gray-950 p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-xs">
                    <span className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 leading-tight">
                      <CheckCircle2 className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />
                      {am}
                    </span>
                    <button type="button" onClick={() => handleRemoveAmenity(i)} className="text-gray-400 hover:text-red-500 p-1 shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
            <AlignLeft className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
            Description
          </Label>
          <Textarea {...register('description')} placeholder="Additional room details..." className={textareaClass} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white shadow-md font-semibold h-11 text-sm rounded-full transition-all"
        >
          {loading ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save Changes' : isBulk ? `Create ${bulkCount} Rooms` : 'Create Room'}
        </Button>
      </div>
    </form>
  )
}