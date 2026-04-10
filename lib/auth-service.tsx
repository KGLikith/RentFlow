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
        firstName,
        lastName,
        phoneNumber,
        userType: 'owner', 
      },
    })
  } else {
    // Update user info if changed
    user = await prisma.user.update({
      where: { clerkId },
      data: {
        email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phoneNumber: phoneNumber || user.phoneNumber,
      },
    })
  }

  return user
}

export async function findMatchingTenantProfiles(email?: string, phone?: string) {
  if (!email && !phone) {
    return []
  }

  const profiles = await prisma.tenantProfile.findMany({
    where: {
      AND: [
        { status: 'ACTIVE' },
        { isVerified: false },
        {
          OR: [
            email ? { email } : undefined,
            phone ? { phone } : undefined,
          ].filter(Boolean),
        },
      ],
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
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

  return profiles
}

export async function getTenantState(userId: string, email?: string, phone?: string) {
  const verifiedProfiles = await prisma.tenantProfile.findMany({
    where: {
      userId,
      isVerified: true,
      status: 'ACTIVE',
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
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

  if (verifiedProfiles.length === 1) {
    return {
      state: 'VERIFIED',
      profile: verifiedProfiles[0],
    }
  }

  if (verifiedProfiles.length > 1) {
    return {
      state: 'MULTIPLE_VERIFIED',
      profiles: verifiedProfiles,
    }
  }

  const pendingProfiles = await findMatchingTenantProfiles(email, phone)

  if (pendingProfiles.length === 0) {
    return {
      state: 'NOT_ASSIGNED',
    }
  }

  if (pendingProfiles.length === 1) {
    return {
      state: 'PENDING_VERIFICATION',
      profile: pendingProfiles[0],
    }
  }

  return {
    state: 'MULTIPLE_TENANCIES',
    profiles: pendingProfiles,
  }
}

export async function linkTenantProfile(tenantProfileId: string, userId: string) {
  // Verify the tenant profile exists and is unlinked
  const profile = await prisma.tenantProfile.findUnique({
    where: { id: tenantProfileId },
  })

  if (!profile) {
    throw new Error('Tenant profile not found')
  }

  if (profile.userId !== null && profile.userId !== userId) {
    throw new Error('Tenant profile is already linked to another user')
  }

  const updated = await prisma.tenantProfile.update({
    where: { id: tenantProfileId },
    data: {
      userId,
      isVerified: true,
      verifiedAt: new Date(),
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
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

  return updated
}

export async function rejectTenantProfile(tenantProfileId: string) {
  return await prisma.tenantProfile.update({
    where: { id: tenantProfileId },
    data: {
      rejectedAt: new Date(),
    },
  })
}

export async function unlinkTenantProfile(tenantProfileId: string, ownerId: string) {
  // Verify owner permission
  const profile = await prisma.tenantProfile.findUnique({
    where: { id: tenantProfileId },
  })

  if (!profile) {
    throw new Error('Tenant profile not found')
  }

  if (profile.ownerId !== ownerId) {
    throw new Error('Only the owner can unlink this tenant')
  }

  return await prisma.tenantProfile.update({
    where: { id: tenantProfileId },
    data: {
      userId: null,
      isVerified: false,
      verifiedAt: null,
    },
  })
}

export async function createTenantProfile(
  ownerId: string,
  propertyId: string,
  roomId: string,
  data: {
    name?: string
    email?: string
    phone?: string
  }
) {
  return await prisma.tenantProfile.create({
    data: {
      ownerId,
      propertyId,
      roomId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: 'ACTIVE',
      isVerified: false,
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
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
}

export async function markTenantAsLeft(tenantProfileId: string, ownerId: string) {
  const profile = await prisma.tenantProfile.findUnique({
    where: { id: tenantProfileId },
  })

  if (!profile) {
    throw new Error('Tenant profile not found')
  }

  if (profile.ownerId !== ownerId) {
    throw new Error('Only the owner can update this tenant')
  }

  return await prisma.tenantProfile.update({
    where: { id: tenantProfileId },
    data: {
      status: 'LEFT',
      userId: null,
      isVerified: false,
    },
  })
}

export async function editTenantProfile(
  tenantProfileId: string,
  ownerId: string,
  data: {
    name?: string
    email?: string
    phone?: string
  }
) {
  const profile = await prisma.tenantProfile.findUnique({
    where: { id: tenantProfileId },
  })

  if (!profile) {
    throw new Error('Tenant profile not found')
  }

  if (profile.ownerId !== ownerId) {
    throw new Error('Only the owner can edit this tenant')
  }

  return await prisma.tenantProfile.update({
    where: { id: tenantProfileId },
    data: {
      name: data.name ?? profile.name,
      email: data.email ?? profile.email,
      phone: data.phone ?? profile.phone,
    },
  })
}
