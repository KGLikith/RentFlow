'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'
import { Room, TenantStatus } from '@/app/generated/prisma/client'

import { TenantBulkPreview, TenantBulkResult } from './schema'

function calculateFirstMonthRent(startDate: Date, monthlyRent: number, prorate: boolean): number {
  if (!prorate) return monthlyRent;
  
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const joinDay = startDate.getDate();
  
  const remainingDays = daysInMonth - joinDay + 1;
  if (remainingDays === daysInMonth) return monthlyRent;
  
  const dailyRent = monthlyRent / daysInMonth;
  return Math.round(dailyRent * remainingDays);
}

export async function parseCSVTenants(csvContent: string): Promise<TenantBulkPreview[]> {
  const lines = csvContent.trim().split('\n')
  const previews: TenantBulkPreview[] = []

  const dataLines = lines.slice(1)

  dataLines.forEach((line, index) => {
    const [email, roomId, rentStr, depositStr] = line
      .split(',')
      .map((s) => s.trim())

    const rowIndex = index + 2
    const errors: string[] = []

    if (!email || !z.string().email().safeParse(email).success) {
      errors.push('Valid email is required')
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

    previews.push({
      rowIndex,
      email: email || '',
      roomId: roomId || '',
      rent,
      deposit,
      isValid: errors.length === 0,
      error: errors.join('; '),
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

  // Resolve the internal DB user id (Property.ownerId is NOT the Clerk userId)
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) throw new Error('User not found')

  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: user.id,
    },
    include: {
      rooms: true,
    },
  })

  if (!property) throw new Error('Property not found')

  const roomMap = new Map<string, { number: string; capacity: number }>(
    property.rooms.map((r: Room) => [r.id, { number: r.roomNumber, capacity: r.capacity }])
  )

  const existingTenants = await prisma.tenantProfile.findMany({
    where: {
      propertyId,
      status: TenantStatus.ACTIVE,
    },
    select: {
      roomId: true,
    },
  })

  const occupancyMap = new Map<string, number>()
  existingTenants.forEach((tenant) => {
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

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) throw new Error('User not found')

  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: user.id,
    },
    include: { rooms: true }
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
        email: tenant.email,
        error: tenant.error || 'Invalid tenant data',
      })
      continue
    }

    try {
      if (!tenant.email) {
        result.failed++
        result.details.errors.push({
          rowIndex: tenant.rowIndex,
          email: tenant.email,
          error: 'Email is required to send invitation',
        })
        continue
      }

      // Block owners from being added as tenants
      const emailUser = await prisma.user.findUnique({
        where: { email: tenant.email },
        select: { role: true },
      })
      if (emailUser?.role === 'OWNER') {
        result.failed++
        result.details.errors.push({
          rowIndex: tenant.rowIndex,
          email: tenant.email,
          error: `${tenant.email} is registered as a property owner and cannot be added as a tenant.`,
        })
        continue
      }

      // Re-use the emailUser lookup to also get their DB id for linking
      const existingUserId = await prisma.user.findUnique({
        where: { email: tenant.email },
        select: { id: true },
      }).then(u => u?.id ?? null)

      const tenantProfile = await prisma.tenantProfile.create({
        data: {
          ownerId: user.id,
          propertyId,
          roomId: tenant.roomId,
          name: tenant.email.split('@')[0],
          email: tenant.email,
          status: 'ACTIVE',
          isVerified: false,
          invitedAt: new Date(),
          // Auto-link if a User account already exists with this email
          ...(existingUserId ? { userId: existingUserId } : {}),
          leases: {
            create: {
              propertyId,
              startDate: tenant.startDate ? new Date(tenant.startDate) : new Date(),
              endDate: tenant.startDate && tenant.leaseMonths ? new Date(new Date(tenant.startDate).setMonth(new Date(tenant.startDate).getMonth() + tenant.leaseMonths)) : null,
              rentAmount: new Decimal(tenant.rent),
              deposit: new Decimal(tenant.deposit),
              rentDueDay: tenant.rentDueDay || 1,
              graceDays: 5,
              prorateFirstMonth: true,
              collectAdvanceRent: true,
              isActive: true,
            }
          }
        },
        include: { leases: true }
      })

      const createdLease = tenantProfile.leases[0]
      const invoicesToCreate = []

      // 1. Generate DEPOSIT Invoice
      if (tenant.deposit > 0) {
        invoicesToCreate.push({
          tenantProfileId: tenantProfile.id,
          leaseId: createdLease.id,
          propertyId,
          type: 'DEPOSIT' as const,
          month: createdLease.startDate.getMonth() + 1,
          year: createdLease.startDate.getFullYear(),
          amount: new Decimal(tenant.deposit),
          dueDate: createdLease.startDate,
          status: 'PENDING' as const
        })
      }

      // 2. Generate First RENT Invoice (if advance collection enabled)
      if (createdLease.collectAdvanceRent) {
        const calculatedRent = calculateFirstMonthRent(
          createdLease.startDate, 
          tenant.rent, 
          createdLease.prorateFirstMonth
        )
        
        let due = new Date(createdLease.startDate.getFullYear(), createdLease.startDate.getMonth(), createdLease.rentDueDay)
        if (due < createdLease.startDate) {
          due = createdLease.startDate // If due day is past, it's due on start date
        }

        invoicesToCreate.push({
          tenantProfileId: tenantProfile.id,
          leaseId: createdLease.id,
          propertyId,
          type: 'RENT' as const,
          month: createdLease.startDate.getMonth() + 1,
          year: createdLease.startDate.getFullYear(),
          amount: new Decimal(calculatedRent),
          dueDate: due,
          status: 'PENDING' as const
        })
      }

      if (invoicesToCreate.length > 0) {
        await prisma.invoice.createMany({
          data: invoicesToCreate
        })
      }

      const room = property.rooms.find(r => r.id === tenant.roomId)
      
      result.success++
      result.details.created.push({
        id: tenantProfile.id,
        email: tenant.email,
        roomId: tenant.roomId,
        roomNumber: room?.roomNumber || 'Unknown',
        propertyName: property.name,
        rentAmount: tenant.rent,
        deposit: tenant.deposit,
      })
    } catch (error) {
      result.failed++
      result.details.errors.push({
        rowIndex: tenant.rowIndex,
        email: tenant.email,
        error: `Failed to create tenant: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  return result
}
