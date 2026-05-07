import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
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

    const tenants = await prisma.tenantProfile.findMany({
      where: {
        property: {
          ownerId: user.id,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        isVerified: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            name: true,
          },
        },
        room: {
          select: {
            roomNumber: true,
          },
        },
        // Fetch active leases to determine "Good Standing" and Next Payment
        leases: {
          where: { isActive: true },
          take: 1,
          select: {
            startDate: true,
            endDate: true,
            rentAmount: true,
          }
        },
        // Fetch pending/overdue invoices to determine payment status
        invoices: {
          where: { 
            status: { in: ['PENDING', 'OVERDUE'] } 
          },
          orderBy: { dueDate: 'asc' },
          select: {
            id: true,
            amount: true,
            status: true,
            dueDate: true,
            payments: {
              where: { status: 'UNDER_REVIEW' },
              select: {
                id: true,
                status: true,
                proofUrl: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.log('Error fetching tenants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
