import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tenant = await prisma.tenantProfile.findUnique({
      where: { id },
      include: {
        user: true,
        property: true,
        room: true,
        leases: true,
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Role check: Only the owner or the tenant themselves can view this data
    if (tenant.ownerId !== user.id && tenant.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const responseData = {
      ...tenant,
      joinDate: tenant.createdAt,
      lease: tenant.leases?.[0] || null,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.log('Error fetching tenant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
