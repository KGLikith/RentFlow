import { auth } from '@clerk/nextjs/server'
import { getOrCreateUser, getTenantState } from '@/lib/auth-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const clerkUser = await fetch('https://api.clerk.com/v1/users/' + userId, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(r => r.json())

    if (!clerkUser.id) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      })
    }

    const user = await getOrCreateUser(
      clerkUser.id,
      clerkUser.email_addresses[0]?.email_address,
      clerkUser.first_name,
      clerkUser.last_name,
      clerkUser.phone_numbers[0]?.phone_number
    )

    const tenantState = await getTenantState(
      user.id,
      clerkUser.email_addresses[0]?.email_address,
      clerkUser.phone_numbers[0]?.phone_number
    )

    return new Response(JSON.stringify({
      user,
      tenantState,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[AUTH_SYNC]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
}
