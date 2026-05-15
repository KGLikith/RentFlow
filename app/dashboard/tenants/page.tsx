'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { BulkTenantCreation } from '@/components/bulk/bulk-tenant-creation'
import {
  Plus,
  User,
  Mail,
  Phone,
  Search,
  ArrowUpDown,
} from 'lucide-react'
import { SingleTenantForm } from '@/components/forms/single-tenant-form'

interface Tenant {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: 'ACTIVE' | 'LEFT'
  isVerified: boolean
  user?: {
    name: string | null
    email: string | null
    phone: string | null
  } | null
  property: { name: string }
  room: { roomNumber: string }
  leases: Array<{
    startDate: string
    endDate: string
    rentAmount: number
  }>
  invoices: Array<{
    id: string
    amount: number
    status: 'PENDING' | 'OVERDUE' | 'PAID'
    dueDate: string
    payments: Array<{
      id: string
      status: string
      proofUrl: string | null
    }>
  }>
}

type TenantStatus =
  | 'ACTIVE'
  | 'DUE'
  | 'OVERDUE'
  | 'REVIEW'
  | 'UNVERIFIED'
  | 'LEFT'

const STATUS_CONFIG: Record<
  TenantStatus,
  {
    label: string
    color: string
    bg: string
    dot: string
  }
> = {
  ACTIVE: {
    label: 'Active',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    dot: 'bg-emerald-500',
  },
  DUE: {
    label: 'Payment Due',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    dot: 'bg-amber-500',
  },
  OVERDUE: {
    label: 'Overdue',
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    dot: 'bg-red-500',
  },
  REVIEW: {
    label: 'Under Review',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    dot: 'bg-blue-500',
  },
  UNVERIFIED: {
    label: 'Unverified',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    dot: 'bg-purple-500',
  },
  LEFT: {
    label: 'Checked Out',
    color: 'text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-800',
    dot: 'bg-gray-400',
  },
}

interface Property {
  id: string
  name: string
}

function GlobalAddTenantDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('single')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full lg:w-auto bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-md font-semibold h-11 px-6">
          <Plus className="mr-2 h-5 w-5" />
          Add Tenant
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="w-[100vw] max-w-[100vw] sm:max-w-[550px] h-[100dvh] sm:h-auto p-0 overflow-hidden rounded-none sm:rounded-2xl border-0 bg-white dark:bg-gray-950 shadow-2xl">
        <DialogTitle className="sr-only">Add Tenant</DialogTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
          <div className="px-6 pt-6 pb-2">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
              <TabsTrigger value="single" className="rounded-lg text-xs font-semibold">Single Addition</TabsTrigger>
              <TabsTrigger value="bulk" className="rounded-lg text-xs font-semibold">Bulk Upload (CSV)</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto scrollbar-none">
            <TabsContent value="single" className="m-0 border-none outline-none">
              <SingleTenantForm 
                isGlobal 
                onSuccess={() => {
                  setOpen(false)
                  onSuccess()
                }} 
              />
            </TabsContent>
            
            <TabsContent value="bulk" className="m-0 p-6 border-none outline-none">
              <div className="space-y-4">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Tenant Creation</h2>
                  <p className="text-sm text-gray-500">Upload a CSV file to add multiple tenants at once.</p>
                </div>
                {/* Note: BulkTenantCreation needs a propertyId, but globally we might need to select it first. Let's wrap it. */}
                <BulkTenantCreationWrapper onSuccess={() => { setOpen(false); onSuccess(); }} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function BulkTenantCreationWrapper({
  onSuccess,
}: {
  onSuccess: () => void
}) {
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyId, setPropertyId] = useState('')

  useEffect(() => {
    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => setProperties(data))
  }, [])

  if (!propertyId) {
    return (
      <div className="space-y-4 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 sm:p-5">
        <Label className="text-sm font-semibold text-emerald-800 dark:text-emerald-100">
          Select Property
        </Label>

        <Select value={propertyId} onValueChange={setPropertyId}>
          <SelectTrigger className="h-11 rounded-2xl bg-white dark:bg-gray-950">
            <SelectValue placeholder="Choose property..." />
          </SelectTrigger>

          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <BulkTenantCreation
      propertyId={propertyId}
      onSuccess={onSuccess}
    />
  )
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  const [filter, setFilter] = useState<'ALL' | TenantStatus>(
    'ALL'
  )

  const [sortBy, setSortBy] = useState<
    'name' | 'room' | 'status'
  >('name')

  const [sortOrder, setSortOrder] = useState<
    'asc' | 'desc'
  >('asc')

  const [searchQuery, setSearchQuery] = useState('')

  const [propertyFilter, setPropertyFilter] =
    useState('ALL')

  const router = useRouter()

  const fetchTenants = useCallback(async () => {
    try {
      const response = await fetch('/api/tenants')

      if (!response.ok) {
        setTenants([])
        return
      }

      const data = await response.json()

      setTenants(data)
    } catch {
      setTenants([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const getTenantStatus = (
    tenant: Tenant
  ): TenantStatus => {
    if (tenant.status === 'LEFT') return 'LEFT'

    if (!tenant.isVerified) return 'UNVERIFIED'

    const overdue = tenant.invoices.filter(
      (inv) => inv.status === 'OVERDUE'
    )

    if (overdue.length > 0) return 'OVERDUE'

    const underReview = tenant.invoices.filter(
      (inv) =>
        inv.payments && inv.payments.length > 0
    )

    if (underReview.length > 0) return 'REVIEW'

    if (tenant.invoices.length > 0) return 'DUE'

    return 'ACTIVE'
  }

  const uniqueProperties = Array.from(
    new Set(tenants.map((t) => t.property.name))
  )

  const filteredTenants = tenants.filter((t) => {
    if (
      filter !== 'ALL' &&
      getTenantStatus(t) !== filter
    )
      return false

    if (
      propertyFilter !== 'ALL' &&
      t.property.name !== propertyFilter
    )
      return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()

      return (
        t.name?.toLowerCase().includes(q) ||
        t.room.roomNumber
          .toLowerCase()
          .includes(q) ||
        t.property.name.toLowerCase().includes(q)
      )
    }

    return true
  })

  filteredTenants.sort((a, b) => {
    let comparison = 0

    if (sortBy === 'name') {
      comparison = (a.name || '').localeCompare(
        b.name || ''
      )
    } else if (sortBy === 'room') {
      comparison = a.room.roomNumber.localeCompare(
        b.room.roomNumber,
        undefined,
        {
          numeric: true,
        }
      )
    } else if (sortBy === 'status') {
      comparison = getTenantStatus(a).localeCompare(
        getTenantStatus(b)
      )
    }

    return sortOrder === 'asc'
      ? comparison
      : -comparison
  })

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 space-y-4 animate-pulse">
        <div className="h-8 w-36 rounded-2xl bg-gray-200 dark:bg-gray-800" />

        <div className="h-28 rounded-3xl bg-gray-200 dark:bg-gray-800" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-52 rounded-3xl bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="
        w-full
        max-w-7xl
        mx-auto
        px-3
        sm:px-4
        md:px-6
        lg:px-8
        py-3
        sm:py-4
        space-y-4
        sm:space-y-5
        overflow-x-hidden
      "
    >
      {/* PAGE HEADER */}

      <div className="space-y-4">
        {/* TOP HEADER */}

        <div className="min-w-0">
          <h1
            className="
              text-[1.75rem]
              sm:text-[2rem]
              font-extrabold
              tracking-tight
              text-gray-900
              dark:text-white
            "
          >
            Tenants
          </h1>

          <p className="mt-0.5 text-[12px] sm:text-[13px] font-medium text-gray-500">
            Track tenants and payment activity.
          </p>
        </div>

        {/* SEARCH + ADD */}

        <div
          className="
            flex
            flex-col
            lg:flex-row
            gap-3
            lg:items-end
          "
        >
          {/* SEARCH */}

          <div className="flex-1 min-w-0">
            <Label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Search
            </Label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <Input
                placeholder="Search by name, room, or property..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="
                  h-10
                  sm:h-11
                  rounded-2xl
                  border-gray-200
                  bg-white
                  pl-10
                  text-[13px]
                  sm:text-sm
                  font-medium
                  placeholder:text-gray-400
                  placeholder:font-normal
                  dark:bg-gray-950
                  dark:border-gray-800
                "
              />
            </div>
          </div>

          {/* ADD BUTTON */}

          <div className="shrink-0 w-full lg:w-auto">
            <Label className="mb-2 hidden lg:block opacity-0 text-[10px]">
              hidden
            </Label>

            <GlobalAddTenantDialog
              onSuccess={fetchTenants}
            />
          </div>
        </div>
      </div>

      {/* FILTERS */}

      <div
        className="
          grid
          grid-cols-2
          gap-3
          xl:grid-cols-3
        "
      >
        {/* PROPERTY FILTER */}

        <div>
          <Label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Property Filter
          </Label>

          <Select
            value={propertyFilter}
            onValueChange={setPropertyFilter}
          >
            <SelectTrigger className="h-10 sm:h-11 rounded-2xl border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 text-[13px] sm:text-sm font-medium">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL" className="text-[13px] sm:text-sm">
                All Properties
              </SelectItem>

              {uniqueProperties.map((p) => (
                <SelectItem key={p} value={p} className="text-[13px] sm:text-sm">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SORT */}

        <div>
          <Label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Sort By
          </Label>

          <Select
            value={sortBy}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onValueChange={(val: any) =>
              setSortBy(val)
            }
          >
            <SelectTrigger className="h-10 sm:h-11 rounded-2xl border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 text-[13px] sm:text-sm font-medium">
              <SelectValue placeholder="Sort tenants" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="name" className="text-[13px] sm:text-sm">
                Tenant Name
              </SelectItem>

              <SelectItem value="room" className="text-[13px] sm:text-sm">
                Room Number
              </SelectItem>

              <SelectItem value="status" className="text-[13px] sm:text-sm">
                Status
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SORT ORDER */}

        <div className="col-span-2 xl:col-span-1">
          <Label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Sort Order
          </Label>

          <Button
            variant="outline"
            onClick={() =>
              setSortOrder((prev) =>
                prev === 'asc' ? 'desc' : 'asc'
              )
            }
            className="
              h-10
              sm:h-11
              w-full
              rounded-2xl
              justify-center
              gap-2
              border-gray-200
              bg-white
              dark:bg-gray-950
              dark:border-gray-800
            "
          >
            <ArrowUpDown className="h-4 w-4" />

            <span className="text-[13px] sm:text-sm font-medium">
              {sortOrder === 'asc'
                ? 'Ascending'
                : 'Descending'}
            </span>
          </Button>
        </div>
      </div>

      {/* FILTER PILLS */}

      <div className="flex flex-wrap gap-2">
        {(
          [
            'ALL',
            'OVERDUE',
            'DUE',
            'REVIEW',
            'ACTIVE',
            'UNVERIFIED',
            'LEFT',
          ] as const
        ).map((key) => {
          const isSelected = filter === key

          const config =
            key !== 'ALL'
              ? STATUS_CONFIG[key]
              : null

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                flex
                items-center
                gap-1.5
                rounded-full
                border
                px-3
                py-1.5
                text-[11px]
                font-semibold
                transition-all
                whitespace-nowrap

                ${isSelected
                  ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black'
                  : 'bg-white text-gray-600 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800'
                }
              `}
            >
              {config && (
                <div
                  className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                />
              )}

              <span>
                {key === 'ALL'
                  ? 'All Tenants'
                  : config?.label}
              </span>

              <span className="opacity-70">
                {key === 'ALL'
                  ? tenants.length
                  : tenants.filter(
                    (t) =>
                      getTenantStatus(t) === key
                  ).length}
              </span>
            </button>
          )
        })}
      </div>

      {/* EMPTY STATE */}

      {filteredTenants.length === 0 ? (
        <Card className="rounded-3xl border-dashed p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <User className="h-5 w-5 text-gray-400" />
          </div>

          <h2 className="text-base font-bold">
            No matching tenants
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your filters or search.
          </p>
        </Card>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-3
            2xl:grid-cols-4
            gap-4
          "
        >
          {filteredTenants.map((tenant) => {
            const status = getTenantStatus(tenant)

            const config = STATUS_CONFIG[status]

            const nextInvoice =
              tenant.invoices[0]

            return (
              <div
                key={tenant.id}
                onClick={() =>
                  router.push(
                    `/dashboard/tenants/${tenant.id}`
                  )
                }
                className="
                  group
                  flex
                  min-w-0
                  flex-col
                  gap-3
                  rounded-3xl
                  border
                  border-gray-200
                  bg-white
                  p-3.5
                  sm:p-4
                  shadow-sm
                  transition-all
                  hover:shadow-md
                  dark:border-gray-800
                  dark:bg-gray-950
                  cursor-pointer
                "
              >
                {/* HEADER */}

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-orange-100
                        bg-orange-50
                        font-bold
                        text-orange-600
                      "
                    >
                      {tenant.name?.charAt(0).toUpperCase() || (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[14px] sm:text-[15px] font-semibold text-gray-900 dark:text-white">
                        {tenant.name ||
                          'Pending Invite'}
                      </h3>

                      <div className="mt-1 flex flex-col">
                        <span className="text-[12px] font-medium text-gray-500">
                          Room{' '}
                          {tenant.room.roomNumber}
                        </span>

                        <span className="truncate text-[11px] text-gray-400">
                          {tenant.property.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`
                      flex
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-full
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      ${config.bg}
                      ${config.color}
                    `}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                    />

                    {config.label}
                  </div>
                </div>

                {/* CONTACT */}

                {(tenant.email ||
                  tenant.phone) && (
                    <div
                      className="
                      flex
                      flex-col
                      gap-2
                      rounded-2xl
                      border
                      border-gray-100
                      bg-gray-50/70
                      p-2.5
                      sm:p-3
                      dark:border-gray-800
                      dark:bg-gray-900/40
                    "
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Contact Details
                      </p>

                      {tenant.phone && (
                        <a
                          href={`tel:${tenant.phone}`}
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                          className="
                          flex
                          min-w-0
                          items-center
                          gap-2
                          text-[12px]
                          text-gray-700
                          dark:text-gray-300
                        "
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />

                          <span className="truncate">
                            {tenant.phone}
                          </span>
                        </a>
                      )}

                      {tenant.email && (
                        <a
                          href={`mailto:${tenant.email}`}
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                          className="
                          flex
                          min-w-0
                          items-center
                          gap-2
                          text-[12px]
                          text-gray-700
                          dark:text-gray-300
                        "
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0" />

                          <span className="truncate">
                            {tenant.email}
                          </span>
                        </a>
                      )}
                    </div>
                  )}

                {/* PAYMENT */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-2xl
                    border
                    border-gray-100
                    bg-gray-50/70
                    p-2.5
                    sm:p-3
                    dark:border-gray-800
                    dark:bg-gray-900/40
                  "
                >
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Payment Info
                    </p>

                    {nextInvoice ? (
                      <div className="flex flex-col">
                        <span
                          className={`
                            text-[14px]
                            sm:text-[15px]
                            font-bold

                            ${status ===
                              'OVERDUE'
                              ? 'text-red-600'
                              : 'text-gray-900 dark:text-white'
                            }
                          `}
                        >
                          ₹
                          {nextInvoice.amount.toLocaleString()}
                        </span>

                        <span className="text-[11px] text-gray-500">
                          Due •{' '}
                          {new Date(
                            nextInvoice.dueDate
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[13px] font-semibold text-emerald-600">
                        No Pending Payments
                      </span>
                    )}
                  </div>

                  {nextInvoice && (
                    <div
                      className={`
                        shrink-0
                        rounded-xl
                        px-3
                        py-2
                        text-[10px]
                        font-semibold

                        ${status ===
                          'OVERDUE'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-orange-50 text-orange-600'
                        }
                      `}
                    >
                      {status === 'OVERDUE'
                        ? 'OVERDUE'
                        : 'DUE'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}