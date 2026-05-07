'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BulkTenantCreation } from '@/components/bulk/bulk-tenant-creation'
import { Plus, User, MapPin, Hash, Mail, Phone, ChevronRight } from 'lucide-react'
import { SingleTenantForm } from '@/components/forms/single-tenant-form'

interface Tenant {
  id: string
  user: {
    name: string | null
    email: string | null
    phone: string | null
  }
  property: { name: string }
  room: { roomNumber: string }
}

interface Property {
  id: string
  name: string
}

// interface Room {
//   id: string
//   roomNumber: string
// }

function GlobalAddTenantDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('single')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md font-semibold h-11 px-6">
          <Plus className="mr-2 h-5 w-5" />
          Add Tenant
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-0 bg-white dark:bg-gray-950 shadow-2xl">
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

function BulkTenantCreationWrapper({ onSuccess }: { onSuccess: () => void }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyId, setPropertyId] = useState('')

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => setProperties(data))
  }, [])

  if (!propertyId) {
    return (
      <div className="space-y-4 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
        <Label className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
          <MapPin className="h-4 w-4" /> Select Property First
        </Label>
        <Select value={propertyId} onValueChange={setPropertyId}>
          <SelectTrigger className="h-11 bg-white dark:bg-gray-950 border-emerald-200 dark:border-emerald-800">
            <SelectValue placeholder="Choose a property..." />
          </SelectTrigger>
          <SelectContent>
            {properties.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">Property selected</p>
        <Button variant="ghost" size="sm" onClick={() => setPropertyId('')} className="h-8 text-xs text-emerald-600">Change</Button>
      </div>
      <BulkTenantCreation propertyId={propertyId} onSuccess={onSuccess} />
    </div>
  )
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-xl" />
        <div className="h-20 w-full bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-muted rounded-3xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 pb-10 px-4 md:px-8 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Tenants
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Manage and onboard all your tenants across properties.</p>
        </div>
        <GlobalAddTenantDialog onSuccess={fetchTenants} />
      </div>

      {tenants.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl shadow-sm">
          <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tenants yet</p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">Click &quot;Add Tenant&quot; to start managing your occupants and tracking rent payments.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <div 
              key={tenant.id} 
              onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
              className="bg-white dark:bg-gray-950/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg border border-orange-200/50 dark:border-orange-800/50">
                    {tenant.user.name ? tenant.user.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate max-w-[150px]">
                      {tenant.user.name || 'Pending Invite'}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200/50">
                      Active
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-700 group-hover:text-orange-500 transition-colors" />
              </div>

              <div className="space-y-2.5 mb-5 flex-1">
                <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{tenant.user.email || 'No email'}</span>
                </div>
                {tenant.user.phone && (
                  <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{tenant.user.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-full">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span className="truncate max-w-[100px]">{tenant.property.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-full">
                  <Hash className="h-3.5 w-3.5 text-orange-500" />
                  <span>Room {tenant.room.roomNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
