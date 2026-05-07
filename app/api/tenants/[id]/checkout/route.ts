import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TenantStatus } from '@/app/generated/prisma/client'

// POST /api/tenants/[id]/checkout  — marks tenant as INACTIVE, closes active lease
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: tenantProfileId } = await params

    // Verify the tenant belongs to a property owned by this user
    const profile = await prisma.tenantProfile.findFirst({
      where: { id: tenantProfileId, ownerId: user.id },
      select: { id: true, status: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Tenant not found or access denied' }, { status: 404 })
    }

    if (profile.status !== TenantStatus.ACTIVE) {
      return NextResponse.json({ error: 'Tenant is not currently active' }, { status: 400 })
    }

    // Run checkout in a transaction: deactivate profile + close lease
    await prisma.$transaction([
      prisma.tenantProfile.update({
        where: { id: tenantProfileId },
        data: { status: TenantStatus.LEFT },
      }),
      prisma.lease.updateMany({
        where: { tenantProfileId, isActive: true },
        data: { isActive: false, endDate: new Date() },
      }),
    ])

    return NextResponse.json({ success: true, message: 'Tenant checked out successfully' })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
