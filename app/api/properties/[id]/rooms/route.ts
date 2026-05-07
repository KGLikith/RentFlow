/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { roomSchema } from '@/lib/validations'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Normalize roomNumber: trim whitespace and uppercase for consistent storage */
function normalizeRoomNumber(n: string): string {
  return n.trim().toUpperCase()
}

/** Check if a Prisma error is a unique-constraint violation (P2002) */
function isUniqueConstraintError(e: any): boolean {
  return e?.code === 'P2002' || e?.message?.includes('Unique constraint')
}

/** Check if a Prisma error is an invalid-field / unknown-argument error */
function isPrismaFieldError(e: any): boolean {
  return (
    e?.code === 'P2009' ||
    e?.message?.includes('Unknown argument') ||
    e?.message?.includes('Invalid value')
  )
}

/** Map room type label → expected tenant capacity */
export function roomTypeToCapacity(roomType: string): number {
  const t = roomType.trim().toLowerCase()
  if (t.includes('single'))  return 1
  if (t.includes('double'))  return 2
  if (t.includes('triple'))  return 3
  if (t.includes('quad'))    return 4
  if (t.includes('dormitory')) return 8
  if (t.includes('private')) return 1
  return 1 // fallback
}

/**
 * Map a validated room schema object to the exact set of Prisma Room fields.
 * Never spread unknown keys so future schema changes can't cause 500s.
 */
function toRoomData(r: ReturnType<typeof roomSchema.parse>, propertyId: string) {
  const capacity = r.capacity && r.capacity > 1
    ? r.capacity
    : roomTypeToCapacity(r.roomType)

  return {
    propertyId,
    roomNumber: normalizeRoomNumber(r.roomNumber),
    roomType: r.roomType.trim(),
    capacity,
    carpetArea:  r.carpetArea  ?? null,
    floorNumber: r.floorNumber ?? null,
    amenities:   r.amenities?.trim()   ?? null,
    currentRent: r.currentRent,
    description: r.description?.trim() ?? null,
  }
}

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const property = await prisma.property.findFirst({ where: { id } })
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    const isOwner = property.ownerId === user.id
    let tenantProfile = null

    if (!isOwner) {
      tenantProfile = await prisma.tenantProfile.findFirst({
        where: {
          propertyId: id,
          userId: user.id,
          status: 'ACTIVE'
        }
      })
      if (!tenantProfile) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const rooms = await prisma.room.findMany({
      where: { 
        propertyId: id,
        ...(tenantProfile ? { id: tenantProfile.roomId } : {})
      },
      select: {
        id: true,
        roomNumber: true,
        capacity: true,
        roomType: true,
        currentRent: true,
        floorNumber: true,
        carpetArea: true,
        amenities: true,
        description: true,
      },
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST ───────────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const property = await prisma.property.findFirst({ where: { id, ownerId: user.id } })
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    const body = await request.json()

    // ── BULK ─────────────────────────────────────────────────────────────────
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ error: 'No rooms provided.' }, { status: 400 })
      }
      if (body.length > 200) {
        return NextResponse.json({ error: 'Cannot create more than 200 rooms at once.' }, { status: 400 })
      }

      // 1. Validate all items up-front — fail fast before touching the DB
      const validationErrors: string[] = []
      const validatedRooms = body.map((r, i) => {
        const result = roomSchema.safeParse(r)
        if (!result.success) {
          validationErrors.push(`Row ${i + 1}: ${result.error.issues.map((e: any) => e.message).join(', ')}`)
          return null
        }
        return result.data
      })

      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed.', details: validationErrors },
          { status: 400 }
        )
      }

      const valid = validatedRooms as NonNullable<typeof validatedRooms[0]>[]

      // 2. Normalize and Deduplicate the incoming array itself
      const seen = new Set<string>()
      const normalizedRooms = valid.map(r => {
        const norm = normalizeRoomNumber(r.roomNumber)
        if (seen.has(norm)) return null
        seen.add(norm)
        return { ...r, roomNumber: norm }
      }).filter((r): r is NonNullable<typeof r> => r !== null)

      // 3. Duplicate detection — ONE query, O(1) Set lookup (no N+1)
      const incomingNumbers = normalizedRooms.map(r => r.roomNumber)
      const existingRooms = await prisma.room.findMany({
        where: { propertyId: id, roomNumber: { in: incomingNumbers } },
        select: { roomNumber: true },
      })
      const existingSet = new Set(existingRooms.map(r => r.roomNumber))

      const duplicates = normalizedRooms.filter(r => existingSet.has(r.roomNumber))
      const toCreate   = normalizedRooms.filter(r => !existingSet.has(r.roomNumber))

      if (toCreate.length === 0) {
        return NextResponse.json({
          created: 0,
          skipped: duplicates.length,
          skippedRooms: duplicates.map(d => d.roomNumber),
          message: 'All rooms already exist. No new rooms were created.',
        }, { status: 200 })
      }

      // 4. Wrap ALL inserts in a transaction — either all succeed or none do
      try {
        await prisma.$transaction(async (tx) => {
          await tx.room.createMany({
            data: toCreate.map(r => toRoomData(r, id)),
            skipDuplicates: true,
          })

          // Recalculate totals to keep Property table in sync
          const allRooms = await tx.room.findMany({
            where: { propertyId: id },
            select: { floorNumber: true }
          })
          
          const distinctFloors = new Set(allRooms.map(r => r.floorNumber ?? 0)).size
          
          await tx.property.update({
            where: { id },
            data: {
              totalRooms: allRooms.length,
              totalFloors: distinctFloors
            }
          })
        })
      } catch (txError: any) {
        // 5. Concurrency: if a unique constraint fires inside the transaction,
        //    treat the whole batch as a conflict and surface a clean message.
        if (isUniqueConstraintError(txError)) {
          return NextResponse.json(
            { error: 'One or more rooms were created by another request at the same time. Please refresh and try again.' },
            { status: 409 }
          )
        }
        if (isPrismaFieldError(txError)) {
          console.error('Schema mismatch in bulk create:', txError)
          return NextResponse.json(
            { error: 'Internal schema error. Please contact support.' },
            { status: 500 }
          )
        }
        throw txError // re-throw unknown errors to the outer catch
      }

      return NextResponse.json({
        created: toCreate.length,
        skipped: duplicates.length,
        skippedRooms: duplicates.map(d => d.roomNumber),
      }, { status: 201 })
    }

    // ── SINGLE ────────────────────────────────────────────────────────────────
    const parsed = roomSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e: any) => e.message).join(', ') },
        { status: 400 }
      )
    }

    const validated = {
      ...parsed.data,
      roomNumber: normalizeRoomNumber(parsed.data.roomNumber),
    }

    // Pre-check collision (faster user feedback than catching the DB error)
    const existing = await prisma.room.findUnique({
      where: { propertyId_roomNumber: { propertyId: id, roomNumber: validated.roomNumber } },
    })
    if (existing) {
      return NextResponse.json(
        { error: `Room ${validated.roomNumber} already exists. Edit the existing room instead of creating a new one.` },
        { status: 409 }
      )
    }

    // Wrap single create in a transaction too — protects against race conditions
    let room: any
    try {
      room = await prisma.$transaction(async (tx) => {
        const newRoom = await tx.room.create({ data: toRoomData(validated, id) })
        
        const allRooms = await tx.room.findMany({
          where: { propertyId: id },
          select: { floorNumber: true }
        })
        
        const distinctFloors = new Set(allRooms.map(r => r.floorNumber ?? 0)).size
        
        await tx.property.update({
          where: { id },
          data: {
            totalRooms: allRooms.length,
            totalFloors: distinctFloors
          }
        })
        
        return newRoom
      })
    } catch (txError: any) {
      if (isUniqueConstraintError(txError)) {
        return NextResponse.json(
          { error: `Room ${validated.roomNumber} was just created by another request. Please refresh.` },
          { status: 409 }
        )
      }
      if (isPrismaFieldError(txError)) {
        console.error('Schema mismatch in single create:', txError)
        return NextResponse.json(
          { error: 'Internal schema error. Please contact support.' },
          { status: 500 }
        )
      }
      throw txError
    }

    return NextResponse.json(room, { status: 201 })

  } catch (error: any) {
    console.error('Error creating room(s):', error)
    const message =
      typeof error?.message === 'string' && !error.message.includes('prisma')
        ? error.message
        : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── PATCH — Bulk Update ─────────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const property = await prisma.property.findFirst({ where: { id, ownerId: user.id } })
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    const body = await request.json()
    const { roomIds, updates } = body as {
      roomIds: string[]
      updates: {
        roomType?: string
        currentRent?: number
        carpetArea?: number | null
        floorNumber?: number | null
        amenities?: string | null
        description?: string | null
      }
    }

    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      return NextResponse.json({ error: 'No rooms selected.' }, { status: 400 })
    }
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided.' }, { status: 400 })
    }

    // Verify all roomIds belong to this property (security check)
    const owned = await prisma.room.findMany({
      where: { id: { in: roomIds }, propertyId: id },
      select: { id: true },
    })
    if (owned.length !== roomIds.length) {
      return NextResponse.json({ error: 'Some rooms do not belong to this property.' }, { status: 403 })
    }

    // Build a clean update payload — only include fields explicitly provided and non-empty
    const data: Record<string, any> = {}
    if (updates.roomType?.trim()) data.roomType = updates.roomType.trim()
    if (updates.currentRent !== undefined && updates.currentRent !== null) data.currentRent = updates.currentRent
    if (updates.carpetArea  !== undefined) data.carpetArea  = updates.carpetArea
    if (updates.floorNumber !== undefined) data.floorNumber = updates.floorNumber
    if (updates.amenities?.trim()) data.amenities = updates.amenities.trim()
    if (updates.description?.trim()) data.description = updates.description.trim()

    const result = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.room.updateMany({
        where: { id: { in: roomIds }, propertyId: id },
        data,
      })

      const allRooms = await tx.room.findMany({
        where: { propertyId: id },
        select: { floorNumber: true }
      })

      const distinctFloors = new Set(allRooms.map(r => r.floorNumber ?? 0)).size

      await tx.property.update({
        where: { id },
        data: {
          totalRooms: allRooms.length,
          totalFloors: distinctFloors
        }
      })

      return updateResult
    })

    return NextResponse.json({ updated: result.count }, { status: 200 })
  } catch (error: any) {
    console.error('Error bulk-updating rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
