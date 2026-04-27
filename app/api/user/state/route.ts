import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ state: 'UNAUTHENTICATED' })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user || (user.role === 'OWNER' && (!user.name || !user.phone || !user.upiId))) {
    let name = user?.name || ''
    let phone = user?.phone || ''
    
    if (!name || !phone) {
      const clerkUser = await currentUser()
      if (clerkUser) {
        name = name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
        phone = phone || clerkUser.primaryPhoneNumber?.phoneNumber || ''
      }
    }

    return NextResponse.json({ 
      state: 'INCOMPLETE_PROFILE',
      user: { name, phone, upiId: user?.upiId || '' }
    })
  }

  if (user.role === 'OWNER') {

    const propertyCount = await prisma.property.count({
      where: { ownerId: user.id },
    })

    if (propertyCount === 0) {
      return NextResponse.json({ state: 'NO_PROPERTY' })
    }

    return NextResponse.json({ state: 'ACTIVE' })
  }

  const OR_CONDITIONS: Array<{ userId: string } | { email: string } | { phone: string }> = [{ userId: user.id }]
  if (user.email) OR_CONDITIONS.push({ email: user.email })
  if (user.phone) OR_CONDITIONS.push({ phone: user.phone })

  const profiles = await prisma.tenantProfile.findMany({
    where: {
      status: 'ACTIVE',
      rejectedAt: null,
      OR: OR_CONDITIONS,
    },
  })

  if (profiles.length === 0) {
    return NextResponse.json({ state: 'UNASSIGNED' })
  }

  const linked = profiles.filter(p => p.userId === user.id)

  if (linked.length > 0) {
    return NextResponse.json({ state: 'ACTIVE' }) // Can be > 1, handled via dashboard selection
  }

  // All profiles found are not linked to this user.id
  if (profiles.length === 1) {
    return NextResponse.json({ state: 'PENDING_VERIFICATION' })
  }

  return NextResponse.json({ state: 'MULTIPLE_SELECTION' })
}