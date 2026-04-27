import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
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

    let profileId: string | undefined

    try {
      const body = await req.json()
      profileId = body.profileId
    } catch {
      // Body might be empty
    }

    const OR_CONDITIONS: Array<{ email: string } | { phone: string }> = []
    if (user.email) OR_CONDITIONS.push({ email: user.email })
    if (user.phone) OR_CONDITIONS.push({ phone: user.phone })

    if (OR_CONDITIONS.length === 0) {
      return NextResponse.json({ error: 'User has no contact info' }, { status: 400 })
    }

    if (!profileId) {
      const profiles = await prisma.tenantProfile.findMany({
        where: {
          status: 'ACTIVE',
          userId: null,
          rejectedAt: null,
          OR: OR_CONDITIONS,
        },
      })

      if (profiles.length === 1) {
        profileId = profiles[0].id
      } else {
        return NextResponse.json({ error: 'Multiple profiles found, must specify profileId' }, { status: 400 })
      }
    }

    // Process rejection
    await prisma.tenantProfile.update({
      where: { id: profileId },
      data: {
        rejectedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reject error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
