import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@/app/generated/prisma/enums'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(_request: Request) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize to start of day for comparison

    const activeInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: [InvoiceStatus.PENDING, InvoiceStatus.LATE] }
      },
      include: {
        tenant: true,
        property: true
      }
    })

    const notificationsSent = []

    for (const invoice of activeInvoices) {
      const dueDate = new Date(invoice.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let reminderType = null

      if (invoice.status === InvoiceStatus.PENDING) {
        if (diffDays === 3) {
          reminderType = 'UPCOMING_DUE'
        } else if (diffDays === 0) {
          reminderType = 'DUE_TODAY'
        }
      } else if (invoice.status === InvoiceStatus.LATE) {
        if (diffDays === -1 || diffDays % -3 === 0) {
          // Remind 1 day after due, then every 3 days while late
          reminderType = 'OVERDUE'
        }
      }

      if (reminderType) {
        // In a real application, you would trigger SMS/Email/WhatsApp here.
        // Prevent duplicate spam by logging to a Notification table if needed.
        notificationsSent.push({
          invoiceId: invoice.id,
          tenant: invoice.tenant.email,
          type: reminderType,
          amount: invoice.amount
        })
        
        console.log(`[REMINDER: ${reminderType}] To: ${invoice.tenant.email} | Amount: ₹${invoice.amount}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed reminders. Sent ${notificationsSent.length} notifications.`,
      notifications: notificationsSent
    })
  } catch (error) {
    console.error('Error in reminders cron:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
