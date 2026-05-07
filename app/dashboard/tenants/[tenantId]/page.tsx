'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, User, MapPin, Hash, IndianRupee, FileText, Calendar,
  CheckCircle2, Phone, Mail, Clock, Receipt, AlertCircle, TrendingUp,
  BadgeCheck, ExternalLink, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Payment {
  id: string
  amount: string | number
  method: string
  status: string
  transactionRef: string | null
  paidAt: string | null
  createdAt: string
}

interface Invoice {
  id: string
  month: number
  year: number
  amount: string | number
  dueDate: string
  status: string
  payments: Payment[]
}

interface TenantDetails {
  id: string
  name: string
  email: string | null
  phone: string | null
  joinDate: string
  status: string
  user: { name: string | null; email: string | null; phone: string | null } | null
  property: { id: string; name: string }
  room: { id: string; roomNumber: string; roomType: string }
  lease: {
    id: string
    startDate: string
    endDate: string | null
    rentDueDay: number
    rentAmount: string | number
    deposit: string | number
    isActive: boolean
  } | null
  leases: {
    id: string
    startDate: string
    endDate: string | null
    rentDueDay: number
    rentAmount: string | number
    deposit: string | number
    isActive: boolean
  }[]
  invoices: Invoice[]
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function statusChip(status: string) {
  const map: Record<string, string> = {
    PAID:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50  text-amber-700  border-amber-200',
    OVERDUE: 'bg-red-50    text-red-700    border-red-200',
    PARTIAL: 'bg-blue-50   text-blue-700   border-blue-200',
  }
  return `inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`
}

export default function TenantDetailPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const router = useRouter()
  const { tenantId } = use(params)
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenant = useCallback(async () => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}`)
      if (!res.ok) {
        if (res.status === 403) throw new Error('You do not have permission to view this tenant')
        throw new Error('Failed to fetch tenant details')
      }
      setTenant(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => { fetchTenant() }, [fetchTenant])

  if (loading) return (
    <div className="w-full px-6 md:px-8 pb-10 pt-4 space-y-4 animate-pulse max-w-none">
      <div className="h-8 w-40 bg-muted rounded-lg" />
      <div className="h-32 w-full bg-muted rounded-2xl" />
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-[65fr_35fr] gap-4">
        <div className="h-64 bg-muted rounded-2xl" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
      <div className="h-48 bg-muted rounded-2xl" />
    </div>
  )

  if (error || !tenant) return (
    <div className="flex items-center justify-center min-h-64 px-6">
      <div className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-md w-full border border-red-100 text-center">
        <h2 className="text-lg font-bold mb-2">Unable to load tenant</h2>
        <p className="text-sm">{error || 'Tenant not found'}</p>
        <Button onClick={() => router.push('/dashboard/tenants')} className="mt-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm">
          Back to Tenants
        </Button>
      </div>
    </div>
  )

  const displayName  = tenant.name || tenant.user?.name || 'Pending Invite'
  const displayEmail = tenant.email || tenant.user?.email
  const displayPhone = tenant.phone || tenant.user?.phone

  const invoices      = tenant.invoices ?? []
  const totalPaid     = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.amount), 0)
  const pendingAmount = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((s, i) => s + Number(i.amount), 0)
  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.amount), 0)
  const currentMonth  = new Date().getMonth() + 1
  const currentYear   = new Date().getFullYear()
  const thisMonthInv  = invoices.find(i => i.month === currentMonth && i.year === currentYear)

  let nextDueDateStr = 'No active lease'
  if (tenant.lease) {
    const today = new Date()
    let nextDate = new Date(today.getFullYear(), today.getMonth(), tenant.lease.rentDueDay)
    if (nextDate <= today) {
      nextDate = new Date(today.getFullYear(), today.getMonth() + 1, tenant.lease.rentDueDay)
    }
    nextDueDateStr = nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const kpis = [
    {
      label: 'Current Term',
      icon: <BadgeCheck className="h-4 w-4 text-[#f97316]" />,
      value: thisMonthInv
        ? <span className={statusChip(thisMonthInv.status)}>{thisMonthInv.status}</span>
        : <span className="text-gray-400 italic text-sm">No invoice</span>,
    },
    {
      label: 'Total Paid',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      value: <span className="text-lg font-bold text-emerald-700">₹{totalPaid.toLocaleString()}</span>,
    },
    {
      label: 'Pending Dues',
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      value: <span className={`text-lg font-bold ${pendingAmount > 0 ? 'text-amber-700' : 'text-gray-500'}`}>₹{pendingAmount.toLocaleString()}</span>,
    },
    {
      label: 'Total Invoiced',
      icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
      value: <span className="text-lg font-bold text-blue-700">₹{totalInvoiced.toLocaleString()}</span>,
    },
  ]

  return (
    <div className="w-full max-w-none px-4 md:px-8 pb-10 pt-4 space-y-4">

      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/tenants')} className="-ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />Back to Tenants
      </Button>

      {/* ─── HERO ─── */}
      <div className="w-full bg-white dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="h-16 w-16 shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/30 border-2 border-white dark:border-gray-900 shadow flex items-center justify-center text-orange-600 font-bold text-2xl">
            {displayName !== 'Pending Invite' ? displayName.charAt(0).toUpperCase() : <User className="h-7 w-7" />}
          </div>
          {/* Identity */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{displayName}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                tenant.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}>{tenant.status}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {displayEmail && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />{displayEmail}
                </span>
              )}
              {displayPhone && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />{displayPhone}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {tenant.property.name}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Hash className="h-3.5 w-3.5 text-gray-400" />
                Room {tenant.room.roomNumber} <span className="text-gray-400">({tenant.room.roomType})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" className="rounded-xl text-sm border-gray-200 h-9"
            onClick={() => router.push(`/dashboard/properties/${tenant.property.id}/rooms/${tenant.room.id}`)}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />View Room
          </Button>
          <Button size="sm" variant="outline" className="rounded-xl text-sm border-gray-200 h-9"
            onClick={() => router.push(`/dashboard/properties/${tenant.property.id}`)}>
            <MapPin className="h-3.5 w-3.5 mr-1.5" />View Property
          </Button>
          {tenant.status === 'ACTIVE' && (
            <Button size="sm" variant="outline" className="rounded-xl text-sm border-amber-200 text-amber-700 hover:bg-amber-50 h-9">
              <LogOut className="h-3.5 w-3.5 mr-1.5" />Check Out
            </Button>
          )}
        </div>
      </div>

      {/* ─── KPI ROW ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {k.icon}{k.label}
            </div>
            <div>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ─── MAIN CONTENT: 65/35 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-4 items-start">

        {/* LEFT */}
        <div className="space-y-4">

          {/* Lease Overview */}
          <div className="bg-white dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-[#f97316]" />Lease Overview
            </h2>
            {tenant.lease ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Start Date',  value: new Date(tenant.lease.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { label: 'End Date',    value: tenant.lease.endDate ? new Date(tenant.lease.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Ongoing' },
                  { label: 'Rent Due',   value: `Day ${tenant.lease.rentDueDay} of month` },
                  { label: 'Status',     value: tenant.lease.isActive ? 'Active' : 'Closed', highlight: tenant.lease.isActive ? 'text-emerald-600' : 'text-gray-400' },
                  { label: 'Monthly Rent', value: `₹${Number(tenant.lease.rentAmount).toLocaleString()}` },
                  { label: 'Deposit',    value: `₹${Number(tenant.lease.deposit).toLocaleString()}` },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                    <p className={`text-sm font-bold text-gray-900 dark:text-white ${item.highlight ?? ''}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic py-6 text-center">No lease on record.</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4 lg:sticky lg:top-6">

          {/* Current Invoice */}
          <div className="bg-white dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Receipt className="h-4 w-4 text-[#f97316]" />Current Invoice
            </h2>
            {thisMonthInv ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                      {MONTHS[thisMonthInv.month - 1]} {thisMonthInv.year}
                    </p>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">₹{Number(thisMonthInv.amount).toLocaleString()}</p>
                  </div>
                  <span className={statusChip(thisMonthInv.status)}>{thisMonthInv.status}</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  Due: {new Date(thisMonthInv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
                {thisMonthInv.payments[0] && (
                  <div className="text-xs text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Paid on {new Date(thisMonthInv.payments[0].paidAt || thisMonthInv.payments[0].createdAt).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-400 italic">
                No invoice for {MONTHS[currentMonth - 1]} {currentYear}
              </div>
            )}
          </div>

          {/* Upcoming Due */}
          <div className="bg-white dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#f97316]" />Upcoming Rent Due
            </h2>
            {tenant.lease ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Due {nextDueDateStr}</p>
                <span className="text-sm font-bold text-gray-900 dark:text-white">₹{Number(tenant.lease.rentAmount).toLocaleString()}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No active lease</p>
            )}
          </div>

          {/* Rent due day indicator */}
          {tenant.lease && (
            <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${
              pendingAmount > 0 ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'
            }`}>
              {pendingAmount > 0 ? (
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-semibold ${pendingAmount > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {pendingAmount > 0 ? `₹${pendingAmount.toLocaleString()} pending` : 'All paid up'}
                </p>
                <p className={`text-xs ${pendingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {pendingAmount > 0 ? 'Tenant has outstanding dues' : 'No outstanding dues'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── PAYMENT HISTORY (FULL WIDTH) ─── */}
      <div className="bg-white dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#f97316]" />Payment History
          </h2>
          <span className="text-xs text-gray-400">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
            <Receipt className="h-8 w-8 text-gray-200" />
            <span>No invoices yet. Invoices will appear here once generated.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Month</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Due Date</th>
                  <th className="text-left px-4 py-3">Paid On</th>
                  <th className="text-left px-4 py-3">Method</th>
                  <th className="text-left px-4 py-3">Ref</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {invoices.map((inv) => {
                  const payment = inv.payments[0]
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-900/20 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {MONTHS[inv.month - 1]} {inv.year}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                        ₹{Number(inv.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {payment?.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">
                        {payment?.method || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        {payment?.transactionRef
                          ? <span className="font-mono text-[11px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg truncate max-w-[120px] block">{payment.transactionRef}</span>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={statusChip(inv.status)}>{inv.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
