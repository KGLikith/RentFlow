/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/cache-keys'
import { invalidateCache } from '@/lib/redis'

export function useCreateProperty(ownerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create property')
      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.propertiesList(ownerId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })

      await invalidateCache([
        `properties:${ownerId}`,
        `dashboard:${ownerId}`,
      ])
    },
  })
}

export function useUpdateProperty(ownerId: string, propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update property')
      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.propertyDetail(propertyId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.propertiesList(ownerId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })
      await invalidateCache([
        `property:${propertyId}`,
        `properties:${ownerId}`,
        `dashboard:${ownerId}`,
      ])
    },
  })
}

export function useDeleteProperty(ownerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete property')
      return response.json()
    },
    onSuccess: async (_, propertyId) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.propertiesList(ownerId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })
      await invalidateCache([
        `property:${propertyId}`,
        `properties:${ownerId}`,
        `dashboard:${ownerId}`,
        `rooms:${propertyId}`,
      ])
    },
  })
}


export function useCreateRoom(propertyId: string, ownerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/properties/${propertyId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create room')
      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roomsList(propertyId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.propertyDetail(propertyId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })
      await invalidateCache([
        `rooms:${propertyId}`,
        `property:${propertyId}`,
        `dashboard:${ownerId}`,
      ])
    },
  })
}

export function useUpdateRoom(roomId: string, propertyId: string, ownerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/properties/${propertyId}/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update room')
      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roomDetail(roomId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roomsList(propertyId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })
      await invalidateCache([
        `room:${roomId}`,
        `rooms:${propertyId}`,
        `dashboard:${ownerId}`,
      ])
    },
  })
}


export function useCreateTenant(ownerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/owner/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create tenant')
      return response.json()
    },
    onSuccess: async (_, variables) => {
      const propertyId = variables.propertyId
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantsList(ownerId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantProfiles(propertyId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })
      await invalidateCache([
        `tenants:${ownerId}`,
        `tenant_profiles:${propertyId}`,
        `dashboard:${ownerId}`,
      ])
    },
  })
}

export function useUpdateTenant(ownerId: string, tenantId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/owner/tenants/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update tenant')
      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantDetail(tenantId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantsList(ownerId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })
      await invalidateCache([
        `tenant:${tenantId}`,
        `tenants:${ownerId}`,
        `dashboard:${ownerId}`,
      ])
    },
  })
}

export function useDeleteTenant(ownerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await fetch(`/api/owner/tenants/${tenantId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete tenant')
      return response.json()
    },
    onSuccess: async (_, tenantId) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantsList(ownerId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })
      await invalidateCache([
        `tenant:${tenantId}`,
        `tenants:${ownerId}`,
        `dashboard:${ownerId}`,
      ])
    },
  })
}

export function useMarkPayment(ownerId: string, tenantId: string, userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to record payment')
      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentsList(ownerId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantPayments(tenantId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantDashboardDetail(userId) })
      await invalidateCache([
        `payments:${ownerId}`,
        `tenant_payments:${tenantId}`,
        `dashboard:${ownerId}`,
        `tenant_dashboard:${userId}`,
      ])
    },
  })
}

export function useGenerateInvoices(ownerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to generate invoices')
      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoicesList(ownerId) })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardDetail(ownerId) })
      await invalidateCache([
        `invoices:${ownerId}`,
        `dashboard:${ownerId}`,
        `tenant_dashboard:*`, 
      ])
    },
  })
}
