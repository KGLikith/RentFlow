/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

export const TenantBulkSchema = z.object({
  name: z.string().min(1, 'Name required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  roomId: z.string(),
  rent: z.number().min(0, 'Rent must be positive'),
  deposit: z.number().min(0, 'Deposit must be positive'),
})

export interface TenantBulkPreview {
  rowIndex: number
  name: string
  phone?: string
  email?: string
  roomId: string
  rent: number
  deposit: number
  isValid: boolean
  error?: string
  warnings?: string[]
}

export interface TenantBulkResult {
  total: number
  success: number
  failed: number
  details: {
    created: Array<{ id: string; name: string; roomId: string }>
    errors: Array<{ rowIndex: number; name: string; error: string }>
  }
}

export function parseCSVTenants(csvContent: string): TenantBulkPreview[] {
  const lines = csvContent.trim().split('\n')
  const previews: TenantBulkPreview[] = []

  const dataLines = lines.slice(1)

  dataLines.forEach((line, index) => {
    const [name, phone, email, roomId, rentStr, depositStr] = line
      .split(',')
      .map((s) => s.trim())

    const rowIndex = index + 2 // +2 for header and 1-based indexing
    const errors: string[] = []
    const warnings: string[] = []

    if (!name) {
      errors.push('Missing tenant name')
    }

    if (!roomId) {
      errors.push('Missing room ID')
    }

    const rent = parseInt(rentStr || '0', 10)
    if (isNaN(rent) || rent < 0) {
      errors.push('Invalid rent amount')
    }

    const deposit = parseInt(depositStr || '0', 10)
    if (isNaN(deposit) || deposit < 0) {
      errors.push('Invalid deposit amount')
    }

    if (email && !z.email().safeParse(email).success) {
      warnings.push('Invalid email format')
    }

    previews.push({
      rowIndex,
      name: name || '',
      phone: phone || undefined,
      email: email || undefined,
      roomId: roomId || '',
      rent,
      deposit,
      isValid: errors.length === 0,
      error: errors.join('; '),
      warnings: warnings.length > 0 ? warnings : undefined,
    })
  })

  return previews
}

export async function validateTenantBulk(
  propertyId: string,
  tenants: TenantBulkPreview[]
): Promise<TenantBulkPreview[]> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // Get property and verify ownership
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
    include: {
      rooms: true,
    },
  })

  if (!property) throw new Error('Property not found')

  const roomMap = new Map<string, { number: string; capacity: number }>(
    property.rooms.map((r: any) => [r.id, { number: r.roomNumber, capacity: r.capacity }])
  )

  const existingTenants = await prisma.tenantProfile.findMany({
    where: {
      propertyId,
      status: 'ACTIVE',
    },
    select: {
      roomId: true,
    },
  })

  const occupancyMap = new Map<string, number>()
  existingTenants.forEach((tenant: { roomId: string }) => {
    occupancyMap.set(tenant.roomId, (occupancyMap.get(tenant.roomId) || 0) + 1)
  })

  return tenants.map((tenant) => {
    if (!tenant.isValid) return tenant

    const warnings: string[] = [...(tenant.warnings || [])]

    if (!roomMap.has(tenant.roomId)) {
      return {
        ...tenant,
        isValid: false,
        error: 'Room not found',
      }
    }

    const room = roomMap.get(tenant.roomId)!
    const currentOccupancy = occupancyMap.get(tenant.roomId) || 0

    if (currentOccupancy >= room.capacity) {
      return {
        ...tenant,
        isValid: false,
        error: `Room ${room.number} is full (capacity: ${room.capacity})`,
      }
    }

    if (currentOccupancy + 1 === room.capacity) {
      warnings.push(`This will fill the room to capacity`)
    }

    return {
      ...tenant,
      isValid: true,
      error: undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  })
}

export async function bulkCreateTenants(
  propertyId: string,
  tenants: TenantBulkPreview[]
): Promise<TenantBulkResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
  })

  if (!property) throw new Error('Property not found')

  const validatedTenants = await validateTenantBulk(propertyId, tenants)

  const result: TenantBulkResult = {
    total: validatedTenants.length,
    success: 0,
    failed: 0,
    details: {
      created: [],
      errors: [],
    },
  }

  for (const tenant of validatedTenants) {
    if (!tenant.isValid) {
      result.failed++
      result.details.errors.push({
        rowIndex: tenant.rowIndex,
        name: tenant.name,
        error: tenant.error || 'Invalid tenant data',
      })
      continue
    }

    try {
      const tenantProfile = await prisma.tenantProfile.create({
        data: {
          ownerId: userId,
          propertyId,
          roomId: tenant.roomId,
          name: tenant.name,
          phone: tenant.phone,
          email: tenant.email,
          rentAmount: new Decimal(tenant.rent),
          deposit: new Decimal(tenant.deposit),
          status: 'ACTIVE',
          isVerified: false,
        },
      })

      const today = new Date()
      const leaseEndDate = new Date(today)
      leaseEndDate.setFullYear(leaseEndDate.getFullYear() + 1)

      await prisma.lease.create({
        data: {
          tenantProfileId: tenantProfile.id,
          propertyId,
          ownerId: userId,
          startDate: today,
          endDate: leaseEndDate,
          rentAmount: new Decimal(tenant.rent),
          deposit: new Decimal(tenant.deposit),
          rentDueDay: 1,
        },
      })

      result.success++
      result.details.created.push({
        id: tenantProfile.id,
        name: tenant.name,
        roomId: tenant.roomId,
      })
    } catch (error) {
      result.failed++
      result.details.errors.push({
        rowIndex: tenant.rowIndex,
        name: tenant.name,
        error: `Failed to create tenant: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  return result
}
