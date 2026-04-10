/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TenantDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const response = await fetch('/api/auth/sync')
      const data = await response.json()

      if (data.tenantState?.profile) {
        setProfile(data.tenantState.profile)
      }
    } catch (error) {
      console.error('[TENANT_DASHBOARD]', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Tenant Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your rental property portal</p>
        </div>

        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Property</h2>
              <div className="space-y-3 text-gray-700">
                <div>
                  <p className="text-sm text-gray-600">Property</p>
                  <p className="font-semibold">{profile.property.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room</p>
                  <p className="font-semibold">{profile.room.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-semibold">
                    {profile.property.owner.firstName} {profile.property.owner.lastName}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Quick Links</h2>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline" disabled>
                  View Invoices
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  Make Payment
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  View Lease
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  Contact Owner
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Coming Soon</h3>
          <p className="text-blue-800 text-sm">
            More features are being added. You&apos;ll soon be able to view invoices, make payments, and communicate with your property owner from this dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
