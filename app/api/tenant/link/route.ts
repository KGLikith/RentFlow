import { auth } from '@clerk/nextjs/server'
import { linkTenantProfile, rejectTenantProfile } from '@/lib/auth-service'

/**
 * POST /api/tenant/link
 * Link a tenant profile to the current user after confirmation
 * CRITICAL: Only call after explicit user confirmation
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const body = await request.json()
    const { tenantProfileId, action } = body

    if (!tenantProfileId) {
      return new Response(JSON.stringify({ error: 'Missing tenantProfileId' }), {
        status: 400,
      })
    }

    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      })
    }

    if (action === 'confirm') {
      const profile = await linkTenantProfile(tenantProfileId, user.id)
      return new Response(JSON.stringify({
        success: true,
        profile,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    if (action === 'reject') {
      const profile = await rejectTenantProfile(tenantProfileId)
      return new Response(JSON.stringify({
        success: true,
        message: 'Profile rejected. You are not assigned to any property yet.',
        profile,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
    })
  } catch (error) {
    console.error('[TENANT_LINK]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
}
