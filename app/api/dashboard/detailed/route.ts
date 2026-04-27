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

    const [properties, rooms, tenants, invoices] = await Promise.all([
      prisma.property.findMany({
        where: { ownerId: user.id }
      }),
      prisma.room.findMany({
        where: { property: { ownerId: user.id } }
      }),
      prisma.tenantProfile.findMany({
        where: { ownerId: user.id }
      }),
      prisma.invoice.findMany({
        where: { property: { ownerId: user.id } }
      })
    ])

    // Map to exactly what the dashboard snippet expects
    const formattedProperties = properties.map(p => ({
      ...p,
      property_type: 'Other', // removed from DB, just stubbing for UI compatibility if needed
    }))

    const formattedRooms = rooms.map(r => ({
      ...r,
      property_id: r.propertyId,
    }))

    const formattedTenants = tenants.map(t => ({
      ...t,
      property_id: t.propertyId,
      status: t.status,
    }))

    const formattedInvoices = invoices.map(i => ({
      ...i,
      tenant_id: i.tenantProfileId,
      property_id: i.propertyId,
      created_at: i.createdAt.toISOString(),
      updated_at: i.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      properties: formattedProperties,
      rooms: formattedRooms,
      tenants: formattedTenants,
      invoices: formattedInvoices,
      expenses: []
    })
  } catch (error) {
    console.log('Error fetching detailed dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
