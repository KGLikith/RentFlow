/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'

// Validation schemas
const RoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
})

const BulkRoomRangeSchema = z.object({
  propertyId: z.string(),
  startRoomNumber: z.number().min(1),
  endRoomNumber: z.number().min(1),
  capacity: z.number().min(1),
})

const BulkRoomPatternSchema = z.object({
  propertyId: z.string(),
  floorNumber: z.number().min(1),
  roomsPerFloor: z.number().min(1),
  capacity: z.number().min(1),
})

export interface BulkRoomPreview {
  roomNumber: string
  capacity: number
  isValid: boolean
  error?: string
}

export interface BulkRoomResult {
  total: number
  success: number
  failed: number
  details: {
    created: Array<{ id: string; roomNumber: string }>
    errors: Array<{ roomNumber: string; error: string }>
  }
}

/**
 * Get all rooms for a property
 */
export async function getRoomsByProperty(propertyId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // Verify owner of property
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
  })

  if (!property) throw new Error('Property not found')

  return await prisma.room.findMany({
    where: { propertyId },
    orderBy: { roomNumber: 'asc' },
    include: {
      tenantProfiles: {
        where: { status: 'ACTIVE' },
      },
    },
  })
}

/**
 * Generate preview for range-based bulk creation
 */
export function generateRangeRoomPreview(
  startRoom: number,
  endRoom: number,
  capacity: number
): BulkRoomPreview[] {
  const previews: BulkRoomPreview[] = []

  if (startRoom > endRoom) {
    return [{
      roomNumber: '',
      capacity: 0,
      isValid: false,
      error: 'Start room must be less than end room',
    }]
  }

  for (let i = startRoom; i <= endRoom; i++) {
    previews.push({
      roomNumber: i.toString(),
      capacity,
      isValid: true,
    })
  }

  return previews
}

/**
 * Generate preview for pattern-based bulk creation
 */
export function generatePatternRoomPreview(
  floorNumber: number,
  roomsPerFloor: number,
  capacity: number
): BulkRoomPreview[] {
  const previews: BulkRoomPreview[] = []

  for (let i = 1; i <= roomsPerFloor; i++) {
    const roomNumber = `${floorNumber}${String(i).padStart(2, '0')}`
    previews.push({
      roomNumber,
      capacity,
      isValid: true,
    })
  }

  return previews
}

/**
 * Bulk create rooms from range (1-10, 11-20, etc)
 */
export async function bulkCreateRoomsByRange(
  propertyId: string,
  startRoomNumber: number,
  endRoomNumber: number,
  capacity: number
): Promise<BulkRoomResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // Validate input
  const validated = BulkRoomRangeSchema.parse({
    propertyId,
    startRoomNumber,
    endRoomNumber,
    capacity,
  })

  // Verify property ownership
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
  })

  if (!property) throw new Error('Property not found')

  // Get existing rooms to check for duplicates
  const existingRooms = await prisma.room.findMany({
    where: { propertyId },
    select: { roomNumber: true },
  })

  const existingNumbers = new Set(existingRooms.map((r: { roomNumber: any }) => r.roomNumber))

  const result: BulkRoomResult = {
    total: 0,
    success: 0,
    failed: 0,
    details: {
      created: [],
      errors: [],
    },
  }

  for (let i = startRoomNumber; i <= endRoomNumber; i++) {
    const roomNumber = i.toString()
    result.total++

    if (existingNumbers.has(roomNumber)) {
      result.failed++
      result.details.errors.push({
        roomNumber,
        error: 'Room number already exists',
      })
      continue
    }

    try {
      const room = await prisma.room.create({
        data: {
          propertyId,
          ownerId: userId,
          roomNumber,
          capacity,
        },
      })

      result.success++
      result.details.created.push({
        id: room.id,
        roomNumber: room.roomNumber,
      })
    } catch (error) {
      result.failed++
      result.details.errors.push({
        roomNumber,
        error: 'Failed to create room',
      })
    }
  }

  return result
}

/**
 * Bulk create rooms by pattern (floor-based: 101-110, 201-210, etc)
 */
export async function bulkCreateRoomsByPattern(
  propertyId: string,
  floorNumber: number,
  roomsPerFloor: number,
  capacity: number
): Promise<BulkRoomResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // Validate input
  const validated = BulkRoomPatternSchema.parse({
    propertyId,
    floorNumber,
    roomsPerFloor,
    capacity,
  })

  // Verify property ownership
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
  })

  if (!property) throw new Error('Property not found')

  // Get existing rooms
  const existingRooms = await prisma.room.findMany({
    where: { propertyId },
    select: { roomNumber: true },
  })

  const existingNumbers = new Set(existingRooms.map((r: { roomNumber: any }) => r.roomNumber))

  const result: BulkRoomResult = {
    total: 0,
    success: 0,
    failed: 0,
    details: {
      created: [],
      errors: [],
    },
  }

  for (let i = 1; i <= roomsPerFloor; i++) {
    const roomNumber = `${floorNumber}${String(i).padStart(2, '0')}`
    result.total++

    if (existingNumbers.has(roomNumber)) {
      result.failed++
      result.details.errors.push({
        roomNumber,
        error: 'Room number already exists',
      })
      continue
    }

    try {
      const room = await prisma.room.create({
        data: {
          propertyId,
          ownerId: userId,
          roomNumber,
          capacity,
        },
      })

      result.success++
      result.details.created.push({
        id: room.id,
        roomNumber: room.roomNumber,
      })
    } catch (error) {
      result.failed++
      result.details.errors.push({
        roomNumber,
        error: 'Failed to create room',
      })
    }
  }

  return result
}

/**
 * Parse and validate CSV rooms
 */
export function parseCSVRooms(
  csvContent: string
): BulkRoomPreview[] {
  const lines = csvContent.trim().split('\n')
  const previews: BulkRoomPreview[] = []

  // Skip header
  const dataLines = lines.slice(1)

  dataLines.forEach((line, index) => {
    const [roomNumber, capacityStr] = line.split(',').map((s) => s.trim())

    if (!roomNumber) {
      previews.push({
        roomNumber: '',
        capacity: 0,
        isValid: false,
        error: `Row ${index + 2}: Missing room number`,
      })
      return
    }

    const capacity = parseInt(capacityStr, 10)
    if (isNaN(capacity) || capacity < 1) {
      previews.push({
        roomNumber,
        capacity: 0,
        isValid: false,
        error: `Row ${index + 2}: Invalid capacity`,
      })
      return
    }

    previews.push({
      roomNumber,
      capacity,
      isValid: true,
    })
  })

  return previews
}

/**
 * Bulk create rooms from CSV
 */
export async function bulkCreateRoomsFromCSV(
  propertyId: string,
  csvContent: string
): Promise<BulkRoomResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // Verify property ownership
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
  })

  if (!property) throw new Error('Property not found')

  const previews = parseCSVRooms(csvContent)
  const validPreviews = previews.filter((p) => p.isValid)

  // Check for duplicates in CSV itself
  const seenRoomNumbers = new Set<string>()
  const validatedPreviews = validPreviews.map((preview) => {
    if (seenRoomNumbers.has(preview.roomNumber)) {
      return {
        ...preview,
        isValid: false,
        error: 'Duplicate room number in CSV',
      }
    }
    seenRoomNumbers.add(preview.roomNumber)
    return preview
  })

  // Get existing rooms
  const existingRooms = await prisma.room.findMany({
    where: { propertyId },
    select: { roomNumber: true },
  })

  const existingNumbers = new Set(existingRooms.map((r: { roomNumber: any }) => r.roomNumber))

  const result: BulkRoomResult = {
    total: validatedPreviews.length,
    success: 0,
    failed: 0,
    details: {
      created: [],
      errors: [],
    },
  }

  for (const preview of validatedPreviews) {
    if (!preview.isValid) {
      result.failed++
      result.details.errors.push({
        roomNumber: preview.roomNumber,
        error: preview.error || 'Invalid room data',
      })
      continue
    }

    if (existingNumbers.has(preview.roomNumber)) {
      result.failed++
      result.details.errors.push({
        roomNumber: preview.roomNumber,
        error: 'Room already exists',
      })
      continue
    }

    try {
      const room = await prisma.room.create({
        data: {
          propertyId,
          ownerId: userId,
          roomNumber: preview.roomNumber,
          capacity: preview.capacity,
        },
      })

      result.success++
      result.details.created.push({
        id: room.id,
        roomNumber: room.roomNumber,
      })
    } catch (error) {
      result.failed++
      result.details.errors.push({
        roomNumber: preview.roomNumber,
        error: 'Database error creating room',
      })
    }
  }

  return result
}
