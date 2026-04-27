'use client'

import { useQuery } from '@tanstack/react-query'

export interface DashboardProperty {
  id: string
  name: string
  address: string
  city: string
  state: string
  postalCode?: string
  country?: string
  totalRooms: number
  description?: string
  latitude?: number
  longitude?: number
  imageUrl?: string
}

export interface DashboardRoom {
  id: string
  property_id: string
  propertyId: string
  roomNumber: string
  capacity: number
}

export interface DashboardTenant {
  id: string
  property_id: string
  propertyId: string
  name: string
  status: string
}

export interface DashboardInvoice {
  id: string
  tenant_id: string
  property_id: string
  propertyId: string
  amount: number | string
  status: string
  created_at: string
  updated_at: string
}

export interface DashboardData {
  properties: DashboardProperty[]
  rooms: DashboardRoom[]
  tenants: DashboardTenant[]
  invoices: DashboardInvoice[]
  expenses: { id: string; property_id: string; amount: number }[]
}

async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard/detailed')
  if (!res.ok) throw new Error('Failed to fetch dashboard data')
  return res.json()
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  })
}

export function useRentProperties() {
  const query = useDashboardData()
  return { ...query, data: query.data?.properties }
}

export function useRentRooms() {
  const query = useDashboardData()
  return { ...query, data: query.data?.rooms }
}

export function useRentTenants() {
  const query = useDashboardData()
  return { ...query, data: query.data?.tenants }
}

export function useRentInvoices() {
  const query = useDashboardData()
  return { ...query, data: query.data?.invoices }
}

export function useRentExpenses() {
  const query = useDashboardData()
  return { ...query, data: query.data?.expenses }
}
