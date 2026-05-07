'use client'

import { useState, useEffect } from 'react'
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
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Loader2,
  Mail,
  IndianRupee,
  Hash,
  MapPin,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import { bulkCreateTenants } from '@/lib/actions/tenant'
import { generateLeasePDF } from '@/lib/pdf-generator'
import { saveAs } from 'file-saver'

interface Property {
  id: string
  name: string
}

interface Room {
  id: string
  roomNumber: string
  currentRent?: string | number
  capacity?: number
}

interface SingleTenantFormProps {
  onSuccess?: () => void
  initialPropertyId?: string
  initialRoomId?: string
  initialRent?: string | number
  isGlobal?: boolean
}

export function SingleTenantForm({
  onSuccess,
  initialPropertyId,
  initialRoomId,
  initialRent,
  isGlobal,
}: SingleTenantFormProps) {
  const [loading, setLoading] = useState(false)

  const [properties, setProperties] = useState<Property[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  const [propertyId, setPropertyId] = useState(
    initialPropertyId || ''
  )

  const [roomId, setRoomId] = useState(
    initialRoomId || ''
  )

  const [email, setEmail] = useState('')

  const [rent, setRent] = useState(
    initialRent?.toString() || ''
  )

  const [deposit, setDeposit] = useState(
    initialRent
      ? (Number(initialRent) * 2).toString()
      : ''
  )

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [leaseMonths, setLeaseMonths] =
    useState('12')

  const [rentDueDay, setRentDueDay] =
    useState('1')

  useEffect(() => {
    if (isGlobal) {
      fetch('/api/properties')
        .then((res) => res.json())
        .then((data) => setProperties(data))
    }
  }, [isGlobal])

  useEffect(() => {
    if (isGlobal && propertyId) {
      fetch(`/api/properties/${propertyId}/rooms`)
        .then((res) => res.json())
        .then((data) => setRooms(data))
    }
  }, [propertyId, isGlobal])

  useEffect(() => {
    if (isGlobal && roomId && rooms.length > 0) {
      const selectedRoom = rooms.find(
        (r) => r.id === roomId
      )

      if (selectedRoom?.currentRent) {
        setRent(selectedRoom.currentRent.toString())

        setDeposit(
          (
            Number(selectedRoom.currentRent) * 2
          ).toString()
        )
      }
    }
  }, [roomId, rooms, isGlobal])

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (
      !propertyId ||
      !roomId ||
      !email ||
      !rent ||
      !deposit
    ) {
      toast.error(
        'Please fill in all required fields'
      )

      return
    }

    setLoading(true)

    try {
      const roomRes = await fetch(
        `/api/properties/${propertyId}/rooms`
      )

      if (roomRes.ok) {
        const allRooms: Array<{
          id: string
          capacity: number
        }> = await roomRes.json()

        const targetRoom = allRooms.find(
          (r) => r.id === roomId
        )

        if (targetRoom) {
          const roomDetailRes = await fetch(
            `/api/properties/${propertyId}/rooms/${roomId}`
          )

          if (roomDetailRes.ok) {
            const detail =
              await roomDetailRes.json()

            const currentOccupancy: number =
              detail.tenants?.length ?? 0

            if (
              currentOccupancy >=
              targetRoom.capacity
            ) {
              toast.error(
                `Room is fully occupied (${currentOccupancy}/${targetRoom.capacity} tenants)`,
                {
                  description:
                    'Please choose another room.',
                }
              )

              setLoading(false)
              return
            }
          }
        }
      }

      const tenantPayload = {
        rowIndex: 1,
        email,
        roomId,
        rent: Number(rent),
        deposit: Number(deposit),
        startDate,
        leaseMonths: Number(leaseMonths),
        rentDueDay: Number(rentDueDay),
        isValid: true,
      }

      const res = await bulkCreateTenants(
        propertyId,
        [tenantPayload]
      )

      if (res.success > 0) {
        toast.success(
          'Tenant successfully added and invited!'
        )

        const created = res.details.created[0]

        if (created) {
          try {
            const start = new Date(startDate)

            const end = new Date(start)

            end.setMonth(
              end.getMonth() +
                Number(leaseMonths)
            )

            const pdfBlob = generateLeasePDF({
              email: created.email,
              roomNumber:
                created.roomNumber || '',
              rentAmount:
                created.rentAmount ||
                Number(rent),
              deposit:
                created.deposit ||
                Number(deposit),
              propertyName:
                created.propertyName ||
                'Property',
              startDate: start,
              endDate: end,
            })

            saveAs(
              pdfBlob,
              `Lease_${created.roomNumber}.pdf`
            )

            toast.success(
              'Lease agreement downloaded'
            )
          } catch {
            toast.error(
              'Failed to generate lease PDF'
            )
          }
        }

        onSuccess?.()
      } else {
        toast.error(
          res.details.errors[0]?.error ||
            'Failed to add tenant'
        )
      }
    } catch (error) {
      console.error(error)

      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `
    h-11

    rounded-xl

    border
    border-gray-200
    dark:border-gray-800

    bg-white
    dark:bg-gray-950

    px-4

    text-sm
    font-medium

    focus-visible:ring-2
    focus-visible:ring-[#f97316]/20
    focus-visible:border-[#f97316]

    w-full

    transition-all

    shadow-sm
    outline-none
  `

  return (
    <form
      onSubmit={handleSubmit}
      className="
        flex
        h-full
        flex-col
      "
    >
      {/* HEADER */}

      <DialogHeader className="px-5 sm:px-6 pt-5 pb-3">
        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Add New Tenant
        </DialogTitle>

        <DialogDescription className="text-sm text-gray-500 leading-relaxed">
          Enter the tenant details to generate
          a lease and send an invite.
        </DialogDescription>
      </DialogHeader>

      {/* FORM BODY */}

      <div className="px-6 sm:px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 content-start">
        {/* PROPERTY + ROOM */}

        {isGlobal && (
          <div
            className="
              lg:col-span-2

              grid
              grid-cols-1
              md:grid-cols-2

              gap-4

              p-4

              rounded-2xl

              border
              border-orange-100
              dark:border-orange-900/30

              bg-orange-50
              dark:bg-orange-950/20
            "
          >
            {/* PROPERTY */}

            <div className="space-y-1.5">
              <Label
                className="
                  text-xs
                  font-semibold

                  text-emerald-900
                  dark:text-emerald-100

                  flex
                  items-center
                  gap-1.5
                "
              >
                <MapPin className="h-3.5 w-3.5" />
                Property
              </Label>

              <Select
                value={propertyId}
                onValueChange={setPropertyId}
              >
                <SelectTrigger className="h-11 rounded-xl border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-950">
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>

                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ROOM */}

            <div className="space-y-1.5">
              <Label
                className="
                  text-xs
                  font-semibold

                  text-orange-900
                  dark:text-orange-100

                  flex
                  items-center
                  gap-1.5
                "
              >
                <Hash className="h-3.5 w-3.5" />
                Room
              </Label>

              <Select
                value={roomId}
                onValueChange={setRoomId}
                disabled={!propertyId}
              >
                <SelectTrigger className="h-11 rounded-xl border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-950">
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>

                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem
                      key={r.id}
                      value={r.id}
                    >
                      {r.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* TENANT EMAIL */}

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Tenant Email
          </Label>

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <Input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="tenant@example.com"
              className={`${inputClass} pl-10`}
              required
            />
          </div>
        </div>

        {/* RENT DUE DAY */}

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Rent Due Day (1-28)
          </Label>

          <Input
            type="number"
            min="1"
            max="28"
            value={rentDueDay}
            onChange={(e) =>
              setRentDueDay(e.target.value)
            }
            className={inputClass}
            required
          />
        </div>

        {/* MONTHLY RENT */}

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Monthly Rent
          </Label>

          <div className="relative">
            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#f97316]" />

            <Input
              type="number"
              value={rent}
              onChange={(e) =>
                setRent(e.target.value)
              }
              placeholder="10000"
              className={`${inputClass} pl-10 font-bold`}
              required
            />
          </div>
        </div>

        {/* DEPOSIT */}

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Security Deposit
          </Label>

          <div className="relative">
            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />

            <Input
              type="number"
              value={deposit}
              onChange={(e) =>
                setDeposit(e.target.value)
              }
              placeholder="50000"
              className={`${inputClass} pl-10 font-bold`}
              required
            />
          </div>
        </div>

        {/* START DATE */}

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Lease Start Date
          </Label>

          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />

            <Input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              className={`${inputClass} pl-10`}
              required
            />
          </div>
        </div>

        {/* DURATION */}

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Duration (Months)
          </Label>

          <Select
            value={leaseMonths}
            onValueChange={setLeaseMonths}
          >
            <SelectTrigger
              className={inputClass}
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="6">
                6 Months
              </SelectItem>

              <SelectItem value="11">
                11 Months
              </SelectItem>

              <SelectItem value="12">
                12 Months
              </SelectItem>

              <SelectItem value="24">
                24 Months
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* FOOTER */}

      <div
        className="
          sticky
          bottom-0

          px-5
          sm:px-6

          py-4

          bg-white/95
          dark:bg-gray-950/95

          backdrop-blur

          border-t
          border-gray-100
          dark:border-gray-800
        "
      >
        <Button
          type="submit"
          disabled={
            loading ||
            !email ||
            !rent ||
            !deposit
          }
          className="
            w-full
            sm:w-auto
            sm:min-w-[320px]

            bg-[#f97316]
            hover:bg-[#ea580c]

            text-white
            font-bold

            h-11

            rounded-xl

            mx-auto
            flex
          "
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}

          {loading
            ? 'Processing...'
            : 'Create Tenant & Generate Lease'}
        </Button>
      </div>
    </form>
  )
}