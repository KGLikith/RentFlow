'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  property: { name: string }
  room: { roomNumber: string }
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenants = async () => {
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
    }

    fetchTenants()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-2">Manage all your tenants</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          Add Tenant
        </Button>
      </div>

      {tenants.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">No tenants yet</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Property</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Room</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {tenant.firstName} {tenant.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.phoneNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.property.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Room {tenant.room.roomNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
