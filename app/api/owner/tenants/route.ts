import { auth } from '@clerk/nextjs/server'
import { createTenantInvitation } from '@/lib/auth-service'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    const tenants = await prisma.tenantProfile.findMany({
      where: { ownerId: user.id },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        property: { select: { id: true, name: true } },
        room: { select: { id: true, roomNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return new Response(JSON.stringify({ tenants }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.log('[GET_TENANTS]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    const body = await request.json()
    const { propertyId, roomId, email, rentAmount, deposit } = body

    if (!propertyId || !roomId || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields: propertyId, roomId, email' }), { status: 400 })
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } })

    if (!property || property.ownerId !== user.id) {
      return new Response(JSON.stringify({ error: 'Property not found or not owned by user' }), { status: 403 })
    }

    const invitation = await createTenantInvitation(
      user.id,
      propertyId,
      roomId,
      email,
      rentAmount ?? 0,
      deposit ?? 0
    )

    return new Response(JSON.stringify({ invitation }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.log('[CREATE_TENANT_INVITE]', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return new Response(JSON.stringify({ error: 'An active invitation already exists for this email and property' }), { status: 409 })
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
