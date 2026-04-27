import { auth } from '@clerk/nextjs/server'
import { markTenantAsLeft } from '@/lib/auth-service'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    const profile = await prisma.tenantProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        property: { select: { id: true, name: true } },
        room: { select: { id: true, roomNumber: true } },
      },
    })

    if (!profile || profile.ownerId !== user.id) {
      return new Response(JSON.stringify({ error: 'Profile not found or not owned by user' }), { status: 403 })
    }

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.log('[GET_TENANT]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    const profile = await prisma.tenantProfile.findUnique({ where: { id } })

    if (!profile || profile.ownerId !== user.id) {
      return new Response(JSON.stringify({ error: 'Profile not found or not owned by user' }), { status: 403 })
    }

    const body = await request.json()
    const { rentAmount, deposit, status } = body

    const updated = await prisma.tenantProfile.update({
      where: { id },
      data: {
        ...(rentAmount !== undefined && { rentAmount }),
        ...(deposit !== undefined && { deposit }),
        ...(status !== undefined && { status }),
      },
    })

    return new Response(JSON.stringify({ profile: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.log('[EDIT_TENANT]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    const query = new URL(request.url).searchParams
    const action = query.get('action')

    if (action === 'mark_left') {
      const profile = await markTenantAsLeft(id, user.id)
      return new Response(JSON.stringify({ message: 'Tenant marked as left', profile }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Default: delete the tenant profile entirely (owner removing a tenant)
    const profile = await prisma.tenantProfile.findUnique({ where: { id } })

    if (!profile || profile.ownerId !== user.id) {
      return new Response(JSON.stringify({ error: 'Profile not found or not owned by user' }), { status: 403 })
    }

    await prisma.tenantProfile.delete({ where: { id } })

    return new Response(JSON.stringify({ message: 'Tenant profile deleted.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.log('[DELETE_TENANT]', error)
    if (error instanceof Error && error.message?.includes('not owned')) {
      return new Response(JSON.stringify({ error: error.message }), { status: 403 })
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
