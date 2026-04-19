/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { BulkRoomRangeSchema, BulkRoomResult, BulkRoomPreview, BulkRoomPatternSchema } from './schema'

export async function getRoomsByProperty(propertyId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

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
      tenants: {
        where: { status: 'ACTIVE' },
      },
    },
  })
}

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

export async function bulkCreateRoomsByRange(
  propertyId: string,
  startRoomNumber: number,
  endRoomNumber: number,
  capacity: number
): Promise<BulkRoomResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const validated = BulkRoomRangeSchema.parse({
    propertyId,
    startRoomNumber,
    endRoomNumber,
    capacity,
  })

  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
  })

  if (!property) throw new Error('Property not found')

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

export async function bulkCreateRoomsByPattern(
  propertyId: string,
  floorNumber: number,
  roomsPerFloor: number,
  capacity: number
): Promise<BulkRoomResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const validated = BulkRoomPatternSchema.parse({
    propertyId,
    floorNumber,
    roomsPerFloor,
    capacity,
  })

  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
  })

  if (!property) throw new Error('Property not found')

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
          roomNumber,
          capacity: validated.capacity,
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

export function parseCSVRooms(
  csvContent: string
): BulkRoomPreview[] {
  const lines = csvContent.trim().split('\n')
  const previews: BulkRoomPreview[] = []

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

export async function bulkCreateRoomsFromCSV(
  propertyId: string,
  csvContent: string
): Promise<BulkRoomResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
  })

  if (!property) throw new Error('Property not found')

  const previews = parseCSVRooms(csvContent)
  const validPreviews = previews.filter((p) => p.isValid)

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
