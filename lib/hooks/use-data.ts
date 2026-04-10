'use client'

import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/cache-keys'

// ============================================================================
// DASHBOARD QUERIES
// ============================================================================

export function useDashboardData(ownerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardDetail(ownerId),
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?ownerId=${ownerId}`)
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      return response.json()
    },
    enabled: !!ownerId,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

export function useTenantDashboardData(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tenantDashboardDetail(userId),
    queryFn: async () => {
      const response = await fetch(`/api/tenant/dashboard?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch tenant dashboard')
      return response.json()
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

// ============================================================================
// PROPERTIES QUERIES
// ============================================================================

export function usePropertiesList(ownerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.propertiesList(ownerId),
    queryFn: async () => {
      const response = await fetch(`/api/properties?ownerId=${ownerId}`)
      if (!response.ok) throw new Error('Failed to fetch properties')
      return response.json()
    },
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function usePropertyDetail(propertyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.propertyDetail(propertyId),
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}`)
      if (!response.ok) throw new Error('Failed to fetch property')
      return response.json()
    },
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// ROOMS QUERIES
// ============================================================================

export function useRoomsList(propertyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.roomsList(propertyId),
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}/rooms`)
      if (!response.ok) throw new Error('Failed to fetch rooms')
      return response.json()
    },
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useRoomDetail(roomId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.roomDetail(roomId),
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${roomId}`)
      if (!response.ok) throw new Error('Failed to fetch room')
      return response.json()
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// TENANTS QUERIES
// ============================================================================

export function useTenantsList(ownerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tenantsList(ownerId),
    queryFn: async () => {
      const response = await fetch(`/api/tenants?ownerId=${ownerId}`)
      if (!response.ok) throw new Error('Failed to fetch tenants')
      return response.json()
    },
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useTenantDetail(tenantId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tenantDetail(tenantId),
    queryFn: async () => {
      const response = await fetch(`/api/tenants/${tenantId}`)
      if (!response.ok) throw new Error('Failed to fetch tenant')
      return response.json()
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// INVOICES QUERIES
// ============================================================================

export function useInvoicesList(ownerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.invoicesList(ownerId),
    queryFn: async () => {
      const response = await fetch(`/api/invoices?ownerId=${ownerId}`)
      if (!response.ok) throw new Error('Failed to fetch invoices')
      return response.json()
    },
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useTenantInvoices(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tenantInvoices(userId),
    queryFn: async () => {
      const response = await fetch(`/api/tenant/invoices?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch invoices')
      return response.json()
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// PAYMENTS QUERIES
// ============================================================================

export function usePaymentsList(ownerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.paymentsList(ownerId),
    queryFn: async () => {
      const response = await fetch(`/api/payments?ownerId=${ownerId}`)
      if (!response.ok) throw new Error('Failed to fetch payments')
      return response.json()
    },
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useTenantPayments(tenantId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tenantPayments(tenantId),
    queryFn: async () => {
      const response = await fetch(`/api/payments?tenantId=${tenantId}`)
      if (!response.ok) throw new Error('Failed to fetch payments')
      return response.json()
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// LEASES QUERIES
// ============================================================================

export function useLeasesList(ownerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.leasesList(ownerId),
    queryFn: async () => {
      const response = await fetch(`/api/leases?ownerId=${ownerId}`)
      if (!response.ok) throw new Error('Failed to fetch leases')
      return response.json()
    },
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useTenantLeases(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tenantLeases(userId),
    queryFn: async () => {
      const response = await fetch(`/api/tenant/leases?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch leases')
      return response.json()
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
