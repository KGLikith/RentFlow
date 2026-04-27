import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getAuthUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      await (await auth()).has({ permission: 'user:read' })
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: '',
          name: ''
        }
      })
    }

    return user
  } catch (error) {
    console.log('Error fetching auth user:', error)
    return null
  }
}

export async function requireAuth() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await getAuthUser()
  if (!user) {
    throw new Error('User not found')
  }

  return user
}
