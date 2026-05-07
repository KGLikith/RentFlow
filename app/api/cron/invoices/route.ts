import { NextResponse } from 'next/server'
import { generateMonthlyInvoices } from '@/lib/db-utils'

export const maxDuration = 60 // 1 min max duration
export const dynamic = 'force-dynamic'

export async function GET(_request: Request) {
  try {
    // Optional: Add simple secret verification
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new NextResponse('Unauthorized', { status: 401 })
    // }

    const today = new Date()
    const month = today.getMonth() + 1
    const year = today.getFullYear()

    // 1. Generate invoices for the current month globally
    const invoices = await generateMonthlyInvoices(month, year)

    return NextResponse.json({
      success: true,
      message: `Successfully processed monthly invoices. Generated ${invoices.length} new invoices.`,
      generated: invoices.length,
      month,
      year
    })
  } catch (error: unknown) {
    console.error('Error in monthly invoice cron:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
