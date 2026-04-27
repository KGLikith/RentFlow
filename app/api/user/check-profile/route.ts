import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    return NextResponse.json({ state: 'INCOMPLETE_PROFILE' })
  }

  // OWNER LOGIC
  if (user.role === 'OWNER') {
    const properties = await prisma.property.count({
      where: { ownerId: user.id },
    })

    if (!user.name || !user.phone || properties === 0) {
      return NextResponse.json({ state: 'INCOMPLETE_PROFILE' })
    }

    return NextResponse.json({ state: 'ACTIVE' })
  }

  // TENANT LOGIC
  if (!user.name || !user.phone) {
    return NextResponse.json({ state: 'INCOMPLETE_PROFILE' })
  }

  // Check for existing active TenantProfile
  const existingProfile = await prisma.tenantProfile.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
  })

  if (existingProfile) {
    return NextResponse.json({ state: 'ACTIVE' })
  }

  // Check for pending invitations by email
  const now = new Date()
  const pendingInvitations = await prisma.tenantInvitation.findMany({
    where: {
      email: user.email,
      status: 'PENDING',
      expiresAt: { gt: now },
    },
  })

  if (pendingInvitations.length > 1) {
    return NextResponse.json({ state: 'PENDING_SELECTION' })
  }

  if (pendingInvitations.length === 1) {
    return NextResponse.json({ state: 'PENDING_VERIFICATION', invitationId: pendingInvitations[0].id })
  }

  return NextResponse.json({ state: 'UNASSIGNED' })
}