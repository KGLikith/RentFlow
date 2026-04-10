/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const [properties, tenants, invoices] = await Promise.all([
      prisma.property.count({
        where: { ownerId: user.id }
      }),
      prisma.tenant.count({
        where: {
          property: {
            ownerId: user.id
          }
        }
      }),
      prisma.invoice.findMany({
        where: {
          property: {
            ownerId: user.id
          },
          status: 'pending'
        },
        select: {
          totalAmount: true
        }
      })
    ])

    const totalRevenue = invoices.reduce((sum: any, inv: { totalAmount: any }) => sum + inv.totalAmount, 0)

    return NextResponse.json({
      totalProperties: properties,
      totalTenants: tenants,
      pendingInvoices: invoices.length,
      totalRevenue: Math.round(totalRevenue)
    })
  } catch (error) {
    console.error('[v0] Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
