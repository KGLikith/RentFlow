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
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const OR_CONDITIONS: Array<{ email: string } | { phone: string }> = []
  if (user.email) OR_CONDITIONS.push({ email: user.email })
  if (user.phone) OR_CONDITIONS.push({ phone: user.phone })

  if (OR_CONDITIONS.length === 0) {
    return NextResponse.json([])
  }

  const profiles = await prisma.tenantProfile.findMany({
    where: {
      status: 'ACTIVE',
      userId: null,
      rejectedAt: null,
      OR: OR_CONDITIONS,
    },
    select: {
      id: true,
      name: true,
      property: {
        select: { name: true }
      },
      owner: {
        select: { name: true }
      },
      room: {
        select: { roomNumber: true }
      }
    }
  })

  return NextResponse.json(profiles)
}
