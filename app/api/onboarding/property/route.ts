import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { propertySchema } from '@/lib/validations'
import { geocodeAddress } from '@/lib/geocode'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = await req.json()
    const validated = propertySchema.parse(data)

    // Geocode address via OpenStreetMap Nominatim
    const coords = await geocodeAddress(
      validated.address,
      validated.city,
      validated.state,
      validated.postalCode,
      validated.country
    )

    const property = await prisma.property.create({
      data: {
        ...validated,
        ownerId: user.id,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      },
    })

    return NextResponse.json({ success: true, property }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
