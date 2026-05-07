'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, MapPin, Hash, IndianRupee, FileText, Calendar, CheckCircle2, Phone, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TenantDetails {
  id: string
  joinDate: string
  status: string
  user: {
    name: string | null
    email: string | null
    phone: string | null
  }
  property: {
    id: string
    name: string
  }
  room: {
    id: string
    roomNumber: string
    roomType: string
  }
  lease: {
    id: string
    startDate: string
    endDate: string | null
    rentDueDay: number
    rentAmount: string | number
    deposit: string | number
  } | null
}

export default function TenantDetailPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const router = useRouter()
  const { tenantId } = use(params)
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenant = useCallback(async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`)
      if (!response.ok) {
        if (response.status === 403) throw new Error('You do not have permission to view this tenant')
        throw new Error('Failed to fetch tenant details')
      }
      const data = await response.json()
      setTenant(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchTenant()
  }, [fetchTenant])

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-xl mb-8" />
        <div className="h-48 w-full bg-muted rounded-3xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-3xl" />
          <div className="h-64 bg-muted rounded-3xl" />
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl max-w-lg mx-auto border border-red-100">
          <h2 className="text-xl font-bold mb-2">Error loading tenant</h2>
          <p>{error || 'Tenant not found'}</p>
          <Button onClick={() => router.push('/dashboard/tenants')} className="mt-6 bg-red-600 hover:bg-red-700 text-white rounded-full">
            Back to Tenants
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10 px-4 md:px-8">
      
      {/* Header & Navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/tenants')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tenants
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white dark:bg-gray-950/50 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 dark:bg-orange-950/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="h-24 w-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-4xl border-4 border-white dark:border-gray-950 shadow-md">
              {tenant.user.name ? tenant.user.name.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {tenant.user.name || 'Pending Invite'}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  tenant.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {tenant.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {tenant.user.email || 'No email provided'}
                </span>
                {tenant.user.phone && (
                  <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {tenant.user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Accommodation Details */}
          <div className="bg-white dark:bg-gray-950/50 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800/60 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#f97316]" />
              Accommodation
            </h2>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Property</p>
                    <p className="font-bold text-gray-900 dark:text-white">{tenant.property.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/properties/${tenant.property.id}`)} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                  View
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Room</p>
                    <p className="font-bold text-gray-900 dark:text-white">{tenant.room.roomNumber} <span className="text-sm font-normal text-gray-500 ml-1">({tenant.room.roomType})</span></p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/properties/${tenant.property.id}/rooms/${tenant.room.id}`)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View
                </Button>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white dark:bg-gray-950/50 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800/60 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-[#f97316]" />
              Financial Details
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-xs font-bold text-emerald-600/80 dark:text-emerald-500/80 uppercase tracking-wider mb-1">Monthly Rent</p>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">₹{Number(tenant.lease?.rentAmount || 0).toLocaleString()}</p>
              </div>
              <div className="p-5 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs font-bold text-blue-600/80 dark:text-blue-500/80 uppercase tracking-wider mb-1">Security Deposit</p>
                <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">₹{Number(tenant.lease?.deposit || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Lease Agreement */}
          <div className="bg-white dark:bg-gray-950/50 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800/60 shadow-sm h-full">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#f97316]" />
              Lease Information
            </h2>

            {tenant.lease ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lease Period</p>
                    <p className="font-bold text-gray-900 dark:text-white text-base">
                      {new Date(tenant.lease.startDate).toLocaleDateString()} — {tenant.lease.endDate ? new Date(tenant.lease.endDate).toLocaleDateString() : 'Ongoing'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rent Due Date</p>
                    <p className="font-bold text-gray-900 dark:text-white text-base">
                      Day {tenant.lease.rentDueDay} of every month
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Lease agreement is active and signed
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white mb-1">No Lease Found</p>
                <p className="text-sm text-gray-500">This tenant does not have a formal lease agreement generated yet.</p>
                <Button className="mt-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800">
                  Generate Lease
                </Button>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Join Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(tenant.joinDate || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
