'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Edit2, X } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  initialAmenities: string | null
  onSave: (newAmenities: string) => Promise<void>
}

/* --------------------------------------------- */
/* AMENITY CHIP */
/* --------------------------------------------- */

function AmenityChip({
  value,
  onRemove,
}: {
  value: string
  onRemove: () => void
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-xl
        border
        border-gray-200
        bg-white
        px-3
        py-2
        text-sm
        text-gray-700
      "
    >
      <span className="font-medium">{value}</span>

      <button
        type="button"
        onClick={onRemove}
        className="
          text-gray-400
          transition-colors
          hover:text-red-500
        "
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

/* --------------------------------------------- */
/* EMPTY STATE */
/* --------------------------------------------- */

function EmptyAmenitiesState() {
  return (
    <div className="flex h-[90px] items-center justify-center">
      <p className="text-sm text-gray-400">
        No amenities added
      </p>
    </div>
  )
}

/* --------------------------------------------- */
/* MAIN */
/* --------------------------------------------- */

export function EditAmenitiesDialog({
  initialAmenities,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false)
  const [amenities, setAmenities] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setAmenities(
        initialAmenities
          ? initialAmenities
              .split(',')
              .map(a => a.trim())
              .filter(Boolean)
          : []
      )

      setInput('')
    }
  }, [open, initialAmenities])

  const normalizedAmenities = useMemo(
    () => amenities.map(a => a.toLowerCase()),
    [amenities]
  )

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmed = input.trim()

    if (!trimmed) return

    const normalized = trimmed.toLowerCase()

    if (normalizedAmenities.includes(normalized)) {
      toast.error('Amenity already exists')
      return
    }

    setAmenities(prev => [...prev, trimmed])
    setInput('')
  }

  const handleRemove = (value: string) => {
    setAmenities(prev => prev.filter(a => a !== value))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      await onSave(amenities.join(', '))

      toast.success('Amenities updated')
      setOpen(false)
    } catch {
      toast.error('Failed to update amenities')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="
            h-8
            rounded-lg
            px-3
            text-gray-500
            transition-colors
            hover:bg-orange-50
            hover:text-orange-500
          "
        >
          <Edit2 className="mr-1.5 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          overflow-hidden
          rounded-3xl
          border
          border-gray-200
          bg-white
          p-0
          shadow-xl
          sm:max-w-[720px]
        "
      >
        <div className="p-6">

          {/* HEADER */}
          <DialogHeader className="space-y-1">
            <DialogTitle
              className="
                text-3xl
                font-semibold
                tracking-tight
                text-gray-900
              "
            >
              Edit Amenities
            </DialogTitle>

            <p className="text-sm text-gray-500">
              Add and manage amenities for this property.
            </p>
          </DialogHeader>

          {/* BODY */}
          <div className="mt-6 space-y-5">

            {/* INPUT SECTION */}
            <div className="space-y-2">

              <label className="text-sm font-medium text-gray-700">
                Amenities
              </label>

              <form
                onSubmit={handleAdd}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. AC, WiFi"
                  className="
                    h-11
                    rounded-xl
                    border-gray-200
                    bg-white
                    text-sm
                    shadow-none
                    focus-visible:border-orange-500
                    focus-visible:ring-2
                    focus-visible:ring-orange-100
                  "
                />

                <Button
                  type="submit"
                  className="
                    h-11
                    rounded-xl
                    bg-orange-500
                    px-5
                    text-sm
                    font-medium
                    text-white
                    hover:bg-orange-600
                  "
                >
                  Add
                </Button>
              </form>
            </div>

            {/* AMENITIES LIST */}
            <div
              className="
                min-h-[120px]
                rounded-2xl
                border
                border-gray-200
                bg-gray-50/60
                p-4
              "
            >
              {amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <AmenityChip
                      key={index}
                      value={amenity}
                      onRemove={() => handleRemove(amenity)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyAmenitiesState />
              )}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-end gap-3 pt-1">

              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="
                  h-10
                  rounded-xl
                  border-gray-200
                  px-5
                  text-sm
                  text-gray-600
                  hover:bg-gray-50
                "
              >
                Cancel
              </Button>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="
                  h-10
                  rounded-xl
                  bg-orange-500
                  px-6
                  text-sm
                  font-medium
                  text-white
                  hover:bg-orange-600
                "
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}