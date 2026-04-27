/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type TenantState =
  | { state: 'LOADING' }
  | { state: 'NOT_ASSIGNED' }
  | { state: 'PENDING_VERIFICATION'; profile: any }
  | { state: 'VERIFIED'; profile: any }
  | { state: 'MULTIPLE_TENANCIES'; profiles: any[] }
  | { state: 'MULTIPLE_VERIFIED'; profiles: any[] }
  | { state: 'ERROR'; error: string }

export default function TenantOnboarding() {
  const router = useRouter()
  const [tenantState, setTenantState] = useState<TenantState>({ state: 'LOADING' })
  const [linking, setLinking] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')

  useEffect(() => {
    fetchTenantState()
  }, [])

  async function fetchTenantState() {
    try {
      const response = await fetch('/api/auth/sync')
      const data = await response.json()

      if (!response.ok) {
        setTenantState({ state: 'ERROR', error: data.error })
        return
      }

      setTenantState(data.tenantState)
    } catch (error) {
      console.log('[ONBOARDING]', error)
      setTenantState({ state: 'ERROR', error: 'Failed to load tenant state' })
    }
  }

  async function handleConfirm(profileId: string) {
    setLinking(true)
    try {
      const response = await fetch('/api/tenant/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantProfileId: profileId,
          action: 'confirm',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to confirm')
        return
      }

      router.push('/tenant/dashboard')
    } catch (error) {
      console.log('[CONFIRM]', error)
      alert('Failed to confirm. Please try again.')
    } finally {
      setLinking(false)
    }
  }

  async function handleReject(profileId: string) {
    setLinking(true)
    try {
      const response = await fetch('/api/tenant/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantProfileId: profileId,
          action: 'reject',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to reject')
        return
      }

      setTenantState({ state: 'NOT_ASSIGNED' })
    } catch (error) {
      console.log('[REJECT]', error)
      alert('Failed to reject. Please try again.')
    } finally {
      setLinking(false)
    }
  }

  async function handleSelectProfile(profileId: string) {
    setSelectedProfileId(profileId)
  }

  if (tenantState.state === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (tenantState.state === 'ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-900">Error</h1>
          <p className="text-red-700">{tenantState.error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (tenantState.state === 'NOT_ASSIGNED') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Not Assigned</h1>
            <p className="text-gray-600">You are not assigned to any property yet.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Contact your landlord or property manager to be added to a property. Once they add you, you&apos;ll be able to access your lease, invoices, and make payments here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (tenantState.state === 'PENDING_VERIFICATION') {
    const { profile } = tenantState
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Confirm Your Property</h1>
            <p className="text-gray-600">Is this your property?</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600">Property</p>
              <p className="text-lg font-semibold text-gray-900">{profile.property.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Owner</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile.property.owner.firstName} {profile.property.owner.lastName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="text-lg font-semibold text-gray-900">{profile.room.roomNumber}</p>
            </div>

            {profile.name && (
              <div>
                <p className="text-sm text-gray-600">Name on Record</p>
                <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
              onClick={() => handleConfirm(profile.id)}
              disabled={linking}
            >
              {linking ? 'Confirming...' : 'Continue'}
            </Button>
            <Button
              variant="outline"
              className="w-full py-3"
              onClick={() => handleReject(profile.id)}
              disabled={linking}
            >
              This is not me
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            We only show your property name, owner name, and room number until you confirm.
          </p>
        </div>
      </div>
    )
  }

  if (tenantState.state === 'MULTIPLE_TENANCIES') {
    const { profiles } = tenantState
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Select Your Property</h1>
            <p className="text-gray-600">You have multiple properties assigned.</p>
          </div>

          <div className="space-y-3">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleSelectProfile(profile.id)}
                className={`w-full border-2 rounded-lg p-4 text-left transition ${selectedProfileId === profile.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <p className="font-semibold text-gray-900">{profile.property.name}</p>
                <p className="text-sm text-gray-600">Room {profile.room.roomNumber}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Owner: {profile.property.owner.firstName} {profile.property.owner.lastName}
                </p>
              </button>
            ))}
          </div>

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
            onClick={() => selectedProfileId && handleConfirm(selectedProfileId)}
            disabled={!selectedProfileId || linking}
          >
            {linking ? 'Confirming...' : 'Continue'}
          </Button>
        </div>
      </div>
    )
  }

  if (tenantState.state === 'VERIFIED') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-green-900">Welcome!</h1>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>

          <div className="animate-spin w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mx-auto" />
        </div>
      </div>
    )
  }

  if (tenantState.state === 'MULTIPLE_VERIFIED') {
    const { profiles } = tenantState
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Select a Property</h1>
            <p className="text-gray-600">You are assigned to multiple properties.</p>
          </div>

          <div className="space-y-3">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => router.push(`/tenant/dashboard?profileId=${profile.id}`)}
                className="w-full border-2 border-gray-200 hover:border-indigo-600 rounded-lg p-4 text-left transition"
              >
                <p className="font-semibold text-gray-900">{profile.property.name}</p>
                <p className="text-sm text-gray-600">Room {profile.room.roomNumber}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Owner: {profile.property.owner.firstName} {profile.property.owner.lastName}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
