import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { roomTypeToCapacity } from '@/app/api/properties/[id]/rooms/route'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; roomId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: propertyId, roomId } = await params

    // Verify access
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the room and its tenants
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
        propertyId,
      },
      include: {
        property: {
          select: {
            name: true,
            address: true,
            city: true,
            totalFloors: true,
          }
        },
        tenants: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            isVerified: true,
            userId: true,
            leases: {
              where: { isActive: true },
              select: { rentAmount: true, deposit: true }
            }
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Access control: only owner or tenant of this room
    if (user.role === 'OWNER') {
      const isOwner = await prisma.property.findFirst({
        where: { id: propertyId, ownerId: user.id }
      })
      if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      return NextResponse.json({ ...room, userRole: 'OWNER' })
    } else {
      const isTenant = await prisma.tenantProfile.findFirst({
        where: { roomId, userId: user.id, status: 'ACTIVE' }
      })
      if (!isTenant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      return NextResponse.json({ ...room, userRole: 'TENANT' })
    }
  } catch (error) {
    console.error('Failed to fetch room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; roomId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: propertyId, roomId } = await params
    const body = await req.json()

    // Validate owner
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isOwner = await prisma.property.findFirst({
      where: { id: propertyId, ownerId: user.id }
    })
    
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Auto-derive capacity from roomType if not explicitly set
    const capacity = (body.capacity && body.capacity > 1)
      ? body.capacity
      : body.roomType
        ? roomTypeToCapacity(body.roomType)
        : undefined

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        roomNumber: body.roomNumber,
        roomType: body.roomType,
        capacity,
        carpetArea: body.carpetArea,
        floorNumber: body.floorNumber,
        amenities: body.amenities,
        currentRent: body.currentRent,
        description: body.description,
      }
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error('Failed to update room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
