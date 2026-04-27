/* eslint-disable @next/next/no-img-element */
'use client'

import { useMemo, useState } from 'react'
import { useRentProperties, useRentRooms, useRentTenants, useRentInvoices } from '@/hooks/useDashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2, BedDouble, Users, IndianRupee,
  UserPlus, Wallet, FileText, Plus, ChevronDown, Bell, HelpCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PropertyForm } from '@/components/forms/property-form'
import { useQueryClient } from '@tanstack/react-query'

export default function DashboardPage() {
  const { data: properties, isLoading: loadingProps } = useRentProperties()
  const { data: rooms } = useRentRooms()
  const { data: tenants } = useRentTenants()
  const { data: invoices } = useRentInvoices()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [scope, setScope] = useState<string>('all')
  const [addOpen, setAddOpen] = useState(false)

  const monthLabel = useMemo(() => {
    return new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' })
  }, [])

  const filteredProps = useMemo(() => {
    if (!properties) return []
    if (scope === 'all') return properties
    return properties.filter((p) => p.id === scope)
  }, [properties, scope])

  const stats = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const today = now.toISOString().split('T')[0]

    const propIds = new Set(filteredProps.map((p) => p.id))
    const tenantsInScope = (tenants || []).filter((t) => propIds.has(t.property_id))
    const tenantIds = new Set(tenantsInScope.map((t) => t.id))

    const invsInScope = (invoices || []).filter((i) => tenantIds.has(i.tenant_id))
    const monthInvs = invsInScope.filter((i) => {
      const d = new Date(i.created_at)
      return d.getMonth() === month && d.getFullYear() === year
    })

    const todaysCollection = invsInScope
      .filter((i) => i.status === 'PAID' && i.updated_at?.startsWith(today))
      .reduce((s, i) => s + Number(i.amount), 0)

    const monthsCollection = monthInvs
      .filter((i) => i.status === 'PAID')
      .reduce((s, i) => s + Number(i.amount), 0)

    const monthsDues = monthInvs
      .filter((i) => i.status !== 'PAID')
      .reduce((s, i) => s + Number(i.amount), 0)

    return { todaysCollection, monthsCollection, monthsDues }
  }, [filteredProps, tenants, invoices])

  if (loadingProps) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground text-sm animate-pulse">
        Loading dashboard…
      </div>
    )
  }

  if (!properties?.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Overview of your rent collection</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><Bell className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><HelpCircle className="h-4 w-4" /></Button>
          </div>
        </div>
        <div>
          <Card className="rounded-2xl border-0 shadow-sm py-12 text-center">
            <CardContent className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-orange-50 grid place-items-center mx-auto">
                <Building2 className="h-7 w-7 text-[#f97316]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">No properties yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add your first property to get started</p>
              </div>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 text-[#f97316] font-medium text-sm hover:underline">
                    <Plus className="h-4 w-4" /> Add your first property
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
                  <PropertyForm onSuccess={() => {
                    setAddOpen(false)
                    queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
                  }} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const scopeLabel =
    scope === 'all'
      ? `All ${properties.length} ${properties.length === 1 ? 'Property' : 'Properties'}`
      : properties.find((p) => p.id === scope)?.name || ''

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="w-auto h-9">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><Bell className="h-4 w-4 text-muted-foreground" /></Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><HelpCircle className="h-4 w-4 text-muted-foreground" /></Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Month Summary */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                <span className="text-[#f97316]">{monthLabel}</span>{' '}
                <span className="text-foreground">Summary for</span>
              </h2>
              <button
                className="text-xs font-medium text-foreground/70 inline-flex items-center gap-1"
                onClick={() => {
                  const next = scope === 'all' ? properties[0]?.id ?? 'all' : 'all'
                  setScope(next)
                }}
              >
                {scopeLabel} <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <SummaryTile
                tone="emerald"
                value={`₹${stats.todaysCollection.toLocaleString('en-IN')}`}
                label="Today's Collection"
              />
              <SummaryTile
                tone="emerald"
                value={`₹${stats.monthsCollection.toLocaleString('en-IN')}`}
                label={`${monthLabel.split(' ')[0]}'s Collections`}
              />
              <SummaryTile
                tone="rose"
                value={`₹${stats.monthsDues.toLocaleString('en-IN')}`}
                label={`${monthLabel.split(' ')[0]}'s Dues`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-[#f97316] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            <QuickAction icon={<UserPlus className="h-5 w-5" />} label="Add Tenant" tone="rose" onClick={() => router.push('/dashboard/tenants')} />
            <QuickAction icon={<Wallet className="h-5 w-5" />} label="Receive Payment" tone="emerald" onClick={() => router.push('/dashboard/payments')} />
            <QuickAction icon={<Users className="h-5 w-5" />} label="Add Lead" tone="sky" onClick={() => router.push('/dashboard/tenants')} />
            {/* Expenses hidden until backend feature is built */}
            <QuickAction icon={<Building2 className="h-5 w-5" />} label="Properties" tone="amber" onClick={() => router.push('/dashboard/properties')} />
            <QuickAction icon={<FileText className="h-5 w-5" />} label="Invoices" tone="rose" onClick={() => router.push('/dashboard/invoices')} />
          </div>
        </section>

        {/* Property cards */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Properties</h2>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <button className="text-xs font-medium text-[#f97316] inline-flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Property
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
                <PropertyForm onSuccess={() => {
                  setAddOpen(false)
                  queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
                }} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProps.map((prop) => {
              const propRooms = rooms?.filter((r) => r.property_id === prop.id) || []
              const propTenants = tenants?.filter((t) => t.property_id === prop.id && t.status === 'ACTIVE') || []
              const totalBeds = propRooms.reduce((s, r) => s + (r.capacity || 1), 0)
              const filledBeds = propTenants.length
              const vacantBeds = Math.max(0, totalBeds - filledBeds)

              const propInvoices = invoices?.filter((inv) => propTenants.some((t) => t.id === inv.tenant_id)) || []
              const paidInvs = propInvoices.filter((i) => i.status === 'PAID')

              const totalCollection = paidInvs.reduce((s, i) => s + Number(i.amount), 0)

              const hasActiveTenants = propTenants.length > 0

              return (
                <Card
                  key={prop.id}
                  className="rounded-2xl border-0 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => router.push(`/dashboard/properties/${prop.id}`)}
                >
                  {/* Property image / map preview */}
                  {prop.imageUrl ? (
                    <img src={prop.imageUrl} alt={prop.name} className="w-full h-28 object-cover" />
                  ) : prop.latitude && prop.longitude ? (
                    <img
                      src={`https://staticmap.openstreetmap.de/staticmap.php?center=${prop.latitude},${prop.longitude}&zoom=14&size=400x112&markers=${prop.latitude},${prop.longitude},red-pushpin`}
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[15px] font-semibold leading-tight">{prop.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{prop.city}, {prop.state}</p>
                      </div>
                      <Badge
                        variant={hasActiveTenants ? 'default' : 'secondary'}
                        className={hasActiveTenants
                          ? 'rounded-full bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 shadow-none'
                          : 'rounded-full shadow-none'}
                      >
                        {hasActiveTenants ? '✓ Active' : 'Empty'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <StatTile value={String(filledBeds).padStart(2, '0')} label="Filled Beds" icon={<BedDouble className="h-3.5 w-3.5 text-emerald-500" />} />
                      <StatTile value={String(vacantBeds).padStart(2, '0')} label="Vacant Beds" icon={<BedDouble className="h-3.5 w-3.5 text-orange-400" />} />
                      <StatTile value={String(propTenants.length).padStart(2, '0')} label="Tenants" icon={<Users className="h-3.5 w-3.5 text-blue-500" />} />
                      <StatTile value={`₹${totalCollection.toLocaleString('en-IN')}`} label="Collection" icon={<IndianRupee className="h-3.5 w-3.5 text-emerald-500" />} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

function SummaryTile({ value, label, tone }: { value: string; label: string; tone: 'emerald' | 'rose' }) {
  const cls = tone === 'emerald'
    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
  return (
    <div className={`rounded-xl px-3 py-3 ${cls}`}>
      <p className="text-base font-bold leading-tight">{value}</p>
      <p className="text-[11px] text-foreground/60 mt-1 leading-tight">{label}</p>
    </div>
  )
}

function QuickAction({ icon, label, tone, onClick }: { icon: React.ReactNode; label: string; tone: 'rose' | 'emerald' | 'sky' | 'amber'; onClick: () => void }) {
  const map: Record<string, string> = {
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  }
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <span className={`h-12 w-12 rounded-full grid place-items-center transition-transform group-hover:-translate-y-0.5 group-active:scale-95 ${map[tone]}`}>
        {icon}
      </span>
      <span className="text-[11px] text-center leading-tight font-medium text-foreground/80">{label}</span>
    </button>
  )
}

function StatTile({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/60 px-4 py-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">{value}</span>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}