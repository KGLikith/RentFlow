import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { email, name, role } = body

    const existing = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        role
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}