import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@/app/generated/prisma/enums'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(_request: Request) {
  try {
    const today = new Date()

    // Find all PENDING invoices
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.PENDING,
      },
      include: {
        lease: true
      }
    })

    let updatedCount = 0

    for (const invoice of pendingInvoices) {
      const graceDays = invoice.lease?.graceDays ?? 5
      const lateDate = new Date(invoice.dueDate)
      lateDate.setDate(lateDate.getDate() + graceDays)

      // If today is strictly greater than the late date, mark as LATE
      if (today > lateDate) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.LATE }
        })
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${pendingInvoices.length} pending invoices. Marked ${updatedCount} as LATE.`,
      markedLate: updatedCount
    })
  } catch (error) {
    console.error('Error in late check cron:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
