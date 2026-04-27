import { auth } from '@clerk/nextjs/server'
import { acceptTenantInvitation } from '@/lib/auth-service'

/**
 * POST /api/tenant/link
 * Accept or reject a TenantInvitation
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const body = await request.json()
    const { invitationId, action } = body

    if (!invitationId) {
      return new Response(JSON.stringify({ error: 'Missing invitationId' }), { status: 400 })
    }

    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    if (action === 'confirm') {
      const profile = await acceptTenantInvitation(invitationId, user.id)
      return new Response(JSON.stringify({ success: true, profile }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (action === 'reject') {
      await prisma.tenantInvitation.update({
        where: { id: invitationId },
        data: { status: 'REJECTED' },
      })
      return new Response(JSON.stringify({
        success: true,
        message: 'Invitation rejected. You are not assigned to any property yet.',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  } catch (error) {
    console.log('[TENANT_LINK]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
