import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const headersList = await headers()
  const svixId = headersList.get('svix-id') || ''
  const svixTimestamp = headersList.get('svix-timestamp') || ''
  const svixSignature = headersList.get('svix-signature') || ''

  if (!process.env.CLERK_WEBHOOK_SECRET) {
    return new Response('Webhook secret not found', { status: 400 })
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(await req.text(), {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error('[v0] Webhook verification failed:', err)
    return new Response('Webhook verification failed', { status: 400 })
  }

  try {
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data

      const primaryEmail = email_addresses[0]?.email_address || ''

      await prisma.user.create({
        data: {
          clerkId: id,
          email: primaryEmail,
          firstName: first_name || '',
          lastName: last_name || '',
        }
      })

      console.log('[v0] User created:', id)
    }

    if (evt.type === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data

      const primaryEmail = email_addresses[0]?.email_address || ''

      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: primaryEmail,
          firstName: first_name || '',
          lastName: last_name || '',
        }
      })

      console.log('[v0] User updated:', id)
    }

    if (evt.type === 'user.deleted') {
      const { id } = evt.data

      if (id) {
        await prisma.user.delete({
          where: { clerkId: id }
        })

        console.log('[v0] User deleted:', id)
      }
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (error) {
    console.error('[v0] Webhook processing error:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }
}
