import { prisma } from '@/lib/prisma'

export async function getOrCreateUser(clerkId: string, email: string, firstName?: string, lastName?: string, phoneNumber?: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        name: `${firstName || ''} ${lastName || ''}`.trim(),
        phone: phoneNumber,
      },
    })
  } else {
    user = await prisma.user.update({
      where: { clerkId },
      data: {
        email,
        name: `${firstName || ''} ${lastName || ''}`.trim() || user.name,
        phone: phoneNumber || user.phone,
      },
    })
  }

  return user
}

/**
 * Find PENDING invitations matching a user's email.
 * Used during tenant onboarding to see if any owner has sent them an invite.
 */
export async function findMatchingInvitations(email?: string) {
  if (!email) return []

  return prisma.tenantInvitation.findMany({
    where: {
      email,
      status: 'PENDING',
      expiresAt: { gt: new Date() },
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          owner: {
            select: { id: true, name: true },
          },
        },
      },
      room: {
        select: { id: true, roomNumber: true },
      },
    },
  })
}

/**
 * Get the current tenant state for a user.
 * - VERIFIED: they have an active TenantProfile
 * - PENDING_VERIFICATION: they have one pending invitation
 * - MULTIPLE_TENANCIES: multiple pending invitations to pick from
 * - NOT_ASSIGNED: no profile and no invitation found
 */
export async function getTenantState(userId: string, email?: string) {
  const activeProfile = await prisma.tenantProfile.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      property: {
        select: { id: true, name: true, owner: { select: { id: true, name: true } } },
      },
      room: {
        select: { id: true, roomNumber: true },
      },
    },
  })

  if (activeProfile) {
    return { state: 'VERIFIED', profile: activeProfile }
  }

  const pendingInvitations = await findMatchingInvitations(email)

  if (pendingInvitations.length === 0) {
    return { state: 'NOT_ASSIGNED' }
  }

  if (pendingInvitations.length === 1) {
    return { state: 'PENDING_VERIFICATION', invitation: pendingInvitations[0] }
  }

  return { state: 'MULTIPLE_TENANCIES', invitations: pendingInvitations }
}

/**
 * Accept a TenantInvitation: creates the TenantProfile and a Lease, marks invitation as ACCEPTED.
 */
export async function acceptTenantInvitation(invitationId: string, userId: string) {
  const invitation = await prisma.tenantInvitation.findUnique({
    where: { id: invitationId },
  })

  if (!invitation) throw new Error('Invitation not found')
  if (invitation.status !== 'PENDING') throw new Error('Invitation is no longer pending')
  if (invitation.expiresAt < new Date()) throw new Error('Invitation has expired')

  const existingProfile = await prisma.tenantProfile.findFirst({ where: { userId, status: 'ACTIVE' } })
  if (existingProfile) throw new Error('User already has an active tenancy')

  const user = await prisma.user.findUnique({ where: { id: userId } })

  const [tenantProfile] = await prisma.$transaction([
    prisma.tenantProfile.create({
      data: {
        userId,
        name: user?.name || invitation.email.split('@')[0] || 'Tenant',
        email: invitation.email,
        isVerified: true,
        verifiedAt: new Date(),
        ownerId: invitation.ownerId,
        propertyId: invitation.propertyId,
        roomId: invitation.roomId!,
        rentAmount: invitation.rentAmount,
        deposit: invitation.deposit,
        status: 'ACTIVE',
      },
    }),
    prisma.tenantInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED' },
    }),
  ])

  const today = new Date()
  const leaseEndDate = new Date(today)
  leaseEndDate.setFullYear(leaseEndDate.getFullYear() + 1)

  await prisma.lease.create({
    data: {
      tenantProfileId: tenantProfile.id,
      propertyId: invitation.propertyId,
      startDate: today,
      endDate: leaseEndDate,
      rentAmount: invitation.rentAmount,
      deposit: invitation.deposit,
      rentDueDay: 1,
    },
  })

  return tenantProfile
}

/**
 * Send a TenantInvitation from an owner to a tenant email.
 */
export async function createTenantInvitation(
  ownerId: string,
  propertyId: string,
  roomId: string,
  email: string,
  rentAmount: number,
  deposit: number,
  daysUntilExpiry = 7
) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + daysUntilExpiry)

  return prisma.tenantInvitation.create({
    data: {
      ownerId,
      propertyId,
      roomId,
      email,
      rentAmount,
      deposit,
      expiresAt,
      status: 'PENDING',
    },
  })
}

/**
 * Mark a tenant as LEFT (owner only).
 */
export async function markTenantAsLeft(tenantProfileId: string, ownerId: string) {
  const profile = await prisma.tenantProfile.findUnique({
    where: { id: tenantProfileId },
  })

  if (!profile) throw new Error('Tenant profile not found')
  if (profile.ownerId !== ownerId) throw new Error('Only the owner can update this tenant')

  return prisma.tenantProfile.update({
    where: { id: tenantProfileId },
    data: { status: 'LEFT' },
  })
}
