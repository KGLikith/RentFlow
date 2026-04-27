'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LeasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leases</h1>
          <p className="text-gray-600 mt-2">Manage rental agreements</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          Create Lease
        </Button>
      </div>

      <Card className="p-12 text-center">
        <p className="text-gray-500 text-lg">No leases yet</p>
        <p className="text-gray-400 text-sm mt-2">Create a new lease agreement to get started</p>
      </Card>
    </div>
  )
}
