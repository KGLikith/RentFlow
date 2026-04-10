/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@clerk/nextjs/server'
import { editTenantProfile, markTenantAsLeft, unlinkTenantProfile } from '@/lib/auth-service'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const profile = await prisma.tenantProfile.findUnique({
      where: { id: params.id },
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
    })

    if (!profile || profile.ownerId !== user.id) {
      return new Response(JSON.stringify({ error: 'Profile not found or not owned by user' }), {
        status: 403,
      })
    }

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[GET_TENANT]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { name, email, phone } = body

    const profile = await editTenantProfile(params.id, user.id, {
      name,
      email,
      phone,
    })

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[EDIT_TENANT]', error)
    if (error.message.includes('not owned')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 403,
      })
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const query = new URL(request.url).searchParams
    const action = query.get('action') // 'unlink' or 'mark_left'

    if (action === 'mark_left') {
      const profile = await markTenantAsLeft(params.id, user.id)
      return new Response(JSON.stringify({
        message: 'Tenant marked as left',
        profile,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const profile = await unlinkTenantProfile(params.id, user.id)
    return new Response(JSON.stringify({
      message: 'Tenant unlinked. Access revoked.',
      profile,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[DELETE_TENANT]', error)
    if (error.message.includes('not owned')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 403,
      })
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
}
