/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@clerk/nextjs/server'
import { createTenantProfile, editTenantProfile, markTenantAsLeft } from '@/lib/auth-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      })
    }

    const tenants = await prisma.tenantProfile.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return new Response(JSON.stringify({ tenants }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[GET_TENANTS]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      })
    }

    const body = await request.json()
    const { propertyId, roomId, name, email, phone } = body

    if (!propertyId || !roomId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      })
    }

    // Verify property belongs to user
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property || property.ownerId !== user.id) {
      return new Response(JSON.stringify({ error: 'Property not found or not owned by user' }), {
        status: 403,
      })
    }

    const profile = await createTenantProfile(user.id, propertyId, roomId, {
      name,
      email,
      phone,
    })

    return new Response(JSON.stringify({ profile }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[CREATE_TENANT]', error)
    if (error.code === 'P2002') {
      return new Response(JSON.stringify({ error: 'Room already has a tenant assigned' }), {
        status: 409,
      })
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
}
